import { createClient } from '@/utils/supabase/client';
import { Place } from '@/types/place';

export interface CountryData {
  name: string;
  continent: string;
  image: string;
}

// ✅ ปรับปรุง Relevance Score ให้แม่นยำขึ้น
export const calculateRelevanceScore = (place: any, query: string): number => {
  if (!query) return 0;
  const q = query.toLowerCase().trim();
  
  const province = (place.province_state || "").toLowerCase();
  const district = (place.district || "").toLowerCase(); 
  const name = (place.name || "").toLowerCase();
  const country = (place.country || "").toLowerCase();

  // 1. ตรงกับจังหวัดเป๊ะๆ -> คะแนนเต็ม (100)
  if (province === q) return 100;
  
  // 2. ตรงกับชื่อสถานที่เป๊ะๆ -> (95)
  if (name === q) return 95;

  // 3. เริ่มต้นด้วยชื่อจังหวัด -> (90)
  if (province.startsWith(q)) return 90;

  // 4. ตรงกับอำเภอเป๊ะๆ -> (85)
  if (district === q) return 85;

  // 5. ชื่อสถานที่มีคำค้นหาอยู่ -> (80)
  if (name.includes(q)) return 80;

  // 6. จังหวัดมีคำค้นหาอยู่ -> (70)
  if (province.includes(q)) return 70;

  return 0;
};

// ... (getTopAttractionsByContinent และ getCountriesByContinent คงเดิม) ...
export const getTopAttractionsByContinent = async (continent: string, limit = 8): Promise<Place[]> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*') 
      .ilike('continent', continent) 
      .order('rating', { ascending: false })
      .limit(limit);

    if (error) { console.error(`⚠️ Fetch failed: ${error.message}`); return []; }
    return (data || []) as Place[];
  } catch (err) { console.error(`⚠️ Connection failed.`, err); return []; }
};

export const getCountriesByContinent = async (continent: string): Promise<CountryData[]> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('places')
      .select('country, images, rating')
      .ilike('continent', continent)
      .eq('approval_status', 'approved')
      .order('rating', { ascending: false });

    if (error) { console.error('Error fetching countries:', error); return []; }

    const countryMap = new Map<string, CountryData>();
    data?.forEach((place: any) => {
      if (!countryMap.has(place.country)) {
        let imageUrl = "https://placehold.co/300x200?text=No+Image";
        if (place.images) {
            if (Array.isArray(place.images) && place.images.length > 0) {
               imageUrl = typeof place.images[0] === 'string' ? place.images[0] : place.images[0].url;
            } else if (typeof place.images === 'string') { imageUrl = place.images; }
        }
        countryMap.set(place.country, { name: place.country, continent: continent, image: imageUrl });
      }
    });
    return Array.from(countryMap.values());
  } catch (err) { return []; }
};

export const searchPlaces = async (
  query: string, 
  country?: string, 
  filters?: string[]
): Promise<Place[]> => {
  const supabase = createClient();
  
  // 1. Clean Data: ตัดช่องว่างหน้าหลังออก เพื่อป้องกันการค้นหาด้วย " " (Spacebar)
  const cleanQuery = query?.trim() || "";
  const cleanCountry = country?.trim() || "";

  console.log(`🔍 [Debug] Search Params:`, { query: cleanQuery, country: cleanCountry });

  try {
    let dbQuery = supabase.from('places').select('*');

    // 2. Strict Country Filter: กรองประเทศก่อนเสมอ
    if (cleanCountry) {
      // ใช้ ilike แบบไม่ใส่ % เพื่อเอาประเทศนั้นจริงๆ (เช่น 'Thailand' ไม่เอา 'Thailandia')
      dbQuery = dbQuery.ilike('country', cleanCountry); 
    }

    // 3. Search Logic
    if (cleanQuery) {
      // สร้าง Search String สำหรับ Supabase .or()
      // รูปแบบ: column.ilike.%value%
      // ⚠️ สำคัญ: ต้องระวังเรื่อง syntax ใน .or()
      const searchString = `name.ilike.%${cleanQuery}%,province_state.ilike.%${cleanQuery}%,district.ilike.%${cleanQuery}%`;
      
      console.log(`🔍 [Debug] OR Query String:`, searchString);
      
      dbQuery = dbQuery.or(searchString);
    }

    // 4. ยิง Request ไป Supabase
    const { data, error, status, statusText } = await dbQuery;

    // 5. เช็ค Error
    if (error) {
      console.error(`❌ [Error] Supabase Search Failed:`, error);
      console.error(`   - Status: ${status} ${statusText}`);
      console.error(`   - Message: ${error.message}`);
      return [];
    }

    // 6. เช็คผลลัพธ์
    if (!data || data.length === 0) {
      console.warn(`⚠️ [Warning] Search completed but found 0 results.`);
      return [];
    }

    console.log(`✅ [Success] Found ${data.length} items.`);
    
    // (Optional Debug) ปริ้นท์ชื่อจังหวัดของ 3 ตัวแรกมาดูว่าตรงไหม
    console.log(`   - Sample Result:`, data.slice(0, 3).map(p => `${p.name} (${p.province_state})`));

    let results = data as Place[];

    // 7. Client-side Sorting (Relevance Score)
    if (cleanQuery) {
      results = results.sort((a, b) => {
        const scoreA = calculateRelevanceScore(a, cleanQuery);
        const scoreB = calculateRelevanceScore(b, cleanQuery);
        
        if (scoreB !== scoreA) {
            return scoreB - scoreA; 
        }
        return (b.rating || 0) - (a.rating || 0);
      });
    } else {
      results = results.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }

    return results;

  } catch (err) {
    console.error(`💥 [Critical Error] searchPlaces crashed:`, err);
    return [];
  }
};

// ... (getPlaceById และ getNearbyPlaces คงเดิม) ...
export const getPlaceById = async (id: string): Promise<Place | null> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('places')
      .select('*, reviews(*, profiles(username, avatar_url))') 
      .eq('id', id)
      .single();

    if (error) { console.error("Error fetching place:", error.message); return null; }
    return data;
  } catch (err) { return null; }
};

export const getNearbyPlaces = async (lat: number, lon: number, excludedId: string, radiusKm: number = 500, filterCountry: string | null = null): Promise<Place[]> => {
  const supabase = createClient();
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_best_nearby_places', { 
      ref_lat: lat, ref_lon: lon, excluded_id: excludedId, radius_km: radiusKm, filter_country: filterCountry 
    });

    if (rpcError || !rpcData) return [];

    const placeIds = rpcData.map((item: any) => item.id);
    const { data: detailsData } = await supabase.from('places').select('id, province_state, category_tags').in('id', placeIds);

    const extraMap = new Map();
    if (detailsData) detailsData.forEach((d: any) => extraMap.set(d.id, d));
    
    return rpcData.map((item: any) => {
        const extra = extraMap.get(item.id) || {};
        return {
            id: item.id,
            name: item.name,
            rating: item.rating,
            images: Array.isArray(item.images) ? item.images : [item.images],
            province_state: extra.province_state || "", 
            category_tags: extra.category_tags || [],
            country: item.country,
            description_short: `${(item.dist_meters / 1000).toFixed(1)} km away`
        };
    }) as Place[];
  } catch (err) { return []; }
};