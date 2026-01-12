import { createClient } from '@/utils/supabase/client';
import { Place } from '@/types/place';

const supabase = createClient();

// ✅ 1. เพิ่ม Interface นี้ (ป้องกัน Error TS)
export interface CountryData {
  name: string;
  continent: string;
  image: string;
}

// ✅ 2. เพิ่ม Helper Function: คำนวณคะแนนความตรงกัน (Province > District > Name)
export const calculateRelevanceScore = (place: any, query: string): number => {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  
  // ดึงค่า (รองรับทั้งโครงสร้าง DB และ Mock)
  const province = (place.province_state || place.location?.province_state || "").toLowerCase();
  
  // ✅ เพิ่มการดึง District (จาก DB หรือ Mock)
  const district = (place.district || place.location?.district || "").toLowerCase(); 
  
  const name = (place.name || "").toLowerCase();

  // Priority 1: Province (จังหวัด) -> คะแนนสูงสุด
  if (province === q) return 100;       
  if (province.startsWith(q)) return 90; 
  if (province.includes(q)) return 80;   

  // Priority 2: District (อำเภอ) -> คะแนนรองลงมา
  if (district === q) return 70;
  if (district.startsWith(q)) return 60;
  if (district.includes(q)) return 50;

  // Priority 3: Name (ชื่อสถานที่) -> คะแนนต่ำสุด
  if (name === q) return 40;
  if (name.startsWith(q)) return 30;
  if (name.includes(q)) return 20;

  return 0;
};

// ... (ฟังก์ชันเดิม getTopAttractionsByContinent, getCountriesByContinent คงเดิม) ...
export const getTopAttractionsByContinent = async (continent: string, limit = 8): Promise<Place[]> => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('continent', continent)
    .order('rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching top attractions:', error);
    return [];
  }
  return (data || []) as Place[];
};

export const getCountriesByContinent = async (continent: string): Promise<CountryData[]> => {
  const { data, error } = await supabase
    .from('places')
    .select('country, images, rating')
    .eq('continent', continent)
    .eq('approval_status', 'approved')
    .order('rating', { ascending: false });

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  const countryMap = new Map<string, CountryData>();
  data?.forEach((place: any) => {
    if (!countryMap.has(place.country)) {
      let imageUrl = "https://via.placeholder.com/300x200?text=No+Image";
      if (place.images) {
          if (Array.isArray(place.images) && place.images.length > 0) {
             imageUrl = typeof place.images[0] === 'string' ? place.images[0] : place.images[0].url;
          } else if (typeof place.images === 'string') {
             imageUrl = place.images;
          }
      }
      countryMap.set(place.country, {
        name: place.country,
        continent: continent,
        image: imageUrl, 
      });
    }
  });
  return Array.from(countryMap.values());
};

// ✅ 3. searchPlaces (แก้ไขให้ค้นหา district ได้)
export const searchPlaces = async (
  query: string, 
  country?: string, 
  filters?: string[]
): Promise<Place[]> => {
  let dbQuery = supabase.from('places').select('*');

  // 1. Filter by Country
  if (country) {
    dbQuery = dbQuery.ilike('country', `%${country}%`);
  }

  // 2. Filter by Search Query
  if (query) {
    // ✅ เพิ่ม district.ilike.%${query}% เข้าไปใน OR
    dbQuery = dbQuery.or(`name.ilike.%${query}%,province_state.ilike.%${query}%,district.ilike.%${query}%`);
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Error searching places:', error);
    return [];
  }
  
  let results = (data || []) as Place[];

  // 3. Client-side Sort ตามคะแนนความตรงกัน
  if (query) {
    results = results.sort((a, b) => {
      const scoreA = calculateRelevanceScore(a, query);
      const scoreB = calculateRelevanceScore(b, query);
      
      if (scoreB !== scoreA) {
          return scoreB - scoreA; 
      }
      return (b.rating || 0) - (a.rating || 0);
    });
  } else {
    results = results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }

  return results;
};

// ... (getPlaceById, getNearbyPlaces คงเดิม) ...
export const getPlaceById = async (id: string): Promise<Place | null> => {
  const { data, error } = await supabase.from('places').select('*').eq('id', id).single();
  if (error) return null;
  return data;
};

export const getNearbyPlaces = async (lat: number, lon: number, excludedId: string, radiusKm: number = 500, filterCountry: string | null = null): Promise<Place[]> => {
  console.log("🚀 [Service] Step 1: Calling RPC for Distance...");
  
  // 1. เรียก RPC เพื่อคำนวณระยะทางและหา ID ของสถานที่ใกล้เคียง
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_best_nearby_places', { 
    ref_lat: lat, 
    ref_lon: lon, 
    excluded_id: excludedId, 
    radius_km: radiusKm, 
    filter_country: filterCountry 
  });

  if (rpcError) { 
    console.error('❌ [Service] RPC Failed:', rpcError.message); 
    return []; 
  }

  // ถ้าไม่มีข้อมูลก็จบเลย
  if (!rpcData || rpcData.length === 0) return [];

  // ------------------------------------------------------------------
  // ✅ ส่วนที่เพิ่มมา: ดึง province_state จาก ID ที่ได้มา (วิธีแก้ปัญหา)
  // ------------------------------------------------------------------
  console.log(`🚀 [Service] Step 2: Fetching missing details for ${rpcData.length} items...`);
  
  // ดึง ID ออกมาเป็น Array เช่น ['id1', 'id2', 'id3']
  const placeIds = rpcData.map((item: any) => item.id);

  // สั่ง Select ข้อมูลเพิ่มเติม โดยระบุ ID
  const { data: detailsData } = await supabase
    .from('places')
    .select('id, province_state') // ดึงแค่สิ่งที่ขาด
    .in('id', placeIds);

  // สร้าง Map เพื่อให้ค้นหาเร็วๆ (จับคู่ ID -> Province)
  const provinceMap = new Map();
  if (detailsData) {
    detailsData.forEach((d: any) => {
      provinceMap.set(d.id, d.province_state);
    });
  }
  // ------------------------------------------------------------------

  console.log(`✅ [Service] Merge Complete!`);
  
  // Return ข้อมูลโดยประกบค่าจาก RPC และค่าที่ดึงมาใหม่
  return rpcData.map((item: any) => ({
    id: item.id,
    name: item.name,
    rating: item.rating,
    images: Array.isArray(item.images) ? item.images : [item.images],
    
    // ✅ จุดสำคัญ: ดึงค่าจาก Map ที่เราไป query มาเพิ่ม
    province_state: provinceMap.get(item.id) || "", 
    
    country: item.country,
    description_short: `${(item.dist_meters / 1000).toFixed(1)} km away`
  })) as Place[];
};