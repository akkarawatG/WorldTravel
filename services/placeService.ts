// services/placeService.ts
import { createClient } from '@/utils/supabase/client';
import { Place } from '@/types/place';

const supabase = createClient();

// ... (ฟังก์ชันเดิม getAllPlaces, getPlaceById, searchPlaces) ...

// ✅ ฟังก์ชันใหม่: ดึง Top Attractions ตามทวีป
export const getTopAttractionsByContinent = async (continent: string, limit = 8): Promise<Place[]> => {
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('continent', continent) // กรองตามทวีป
    // .eq('approval_status', 'approved')
    .order('rating', { ascending: false }) // เรียงตาม Rating มากไปน้อย
    .limit(limit);

  if (error) {
    console.error('Error fetching top attractions:', error);
    return [];
  }
  
  // แปลง images จาก jsonb ให้ตรงกับ type (ถ้าจำเป็น)
  // สมมติว่า Supabase เก็บ images เป็น array object ตรงๆ แล้ว
  return (data || []) as Place[];
};

// ✅ ฟังก์ชันใหม่: ดึงรายชื่อประเทศที่มีสถานที่ท่องเที่ยวในทวีปนั้น (แบบ Distinct)
export interface CountryData {
  name: string;
  continent: string;
  image: string; // อาจจะต้องหา logic การดึงรูปภาพแทนประเทศ เช่น เอารูปแรกของสถานที่ที่ดังที่สุดในประเทศนั้น
}

export const getCountriesByContinent = async (continent: string): Promise<CountryData[]> => {
  // 1. ดึงสถานที่ทั้งหมดในทวีปนั้น (เลือกเฉพาะ column country และ images เพื่อลด load)
  const { data, error } = await supabase
    .from('places')
    .select('country, images, rating')
    .eq('continent', continent)
    .eq('approval_status', 'approved')
    .order('rating', { ascending: false }); // เรียงตาม rating เพื่อเอารูปสวยๆ

  if (error) {
    console.error('Error fetching countries:', error);
    return [];
  }

  // 2. Group by Country และเลือกรูปตัวแทน
  const countryMap = new Map<string, CountryData>();
  
  data?.forEach((place: any) => {
    if (!countryMap.has(place.country)) {
      countryMap.set(place.country, {
        name: place.country,
        continent: continent,
        // เอารูปแรกของสถานที่ที่มี rating สูงสุดมาเป็นรูปปกประเทศ
        image: place.images?.[0]?.url || "https://via.placeholder.com/300x200?text=No+Image", 
      });
    }
  });

  return Array.from(countryMap.values());
};// services/placeService.ts

// ... (existing code) ...

// ✅ ฟังก์ชันค้นหาสถานที่ (Hybrid Filter)
export const searchPlaces = async (
  query: string, 
  country?: string, 
  filters?: string[]
): Promise<Place[]> => {
  let dbQuery = supabase
    .from('places')
    .select('*')
    // .eq('approval_status', 'approved') // ปิดไว้ก่อนตามที่คุยกัน
    .order('rating', { ascending: false });

  // 1. Filter by Country
  if (country) {
    dbQuery = dbQuery.ilike('country', `%${country}%`);
  }

  // 2. Filter by Search Query
  if (query) {
    dbQuery = dbQuery.or(`name.ilike.%${query}%,province_state.ilike.%${query}%`);
  }

  // 3. Filter by Tags (Categories) - Optional Advanced
  if (filters && filters.length > 0) {
    // ใช้ contains สำหรับ array column (ต้องตรงอย่างน้อย 1 ตัว)
    // หมายเหตุ: Supabase array column filtering อาจต้องใช้เทคนิค array overlaps '&&' 
    // dbQuery = dbQuery.overlaps('category_tags', filters); 
    // แต่เพื่อความง่าย เราดึงมาก่อนแล้ว Filter ฝั่ง Client ก็ได้ถ้าข้อมูลไม่เยอะมาก
  }

  const { data, error } = await dbQuery;

  if (error) {
    console.error('Error searching places:', error);
    return [];
  }
  
  // 4. Client-side Filter for Tags (ถ้า DB Query ยาก) & Sort by Selection
  let results = (data || []) as Place[];

  if (filters && filters.length > 0) {
     // ใช้ Logic เดิมที่เคยเขียนไว้ใน ExplorePage เพื่อเรียงลำดับตามการกด
     // (อาจจะย้าย logic นั้นมาไว้ที่นี่ หรือ return raw data ไปให้ component จัดการก็ได้)
     // ในที่นี้ผม return raw data ไปก่อน แล้วให้ useEffect ใน page.tsx จัดการเรียงลำดับ
  }

  return results;
};
// src/services/placeService.ts

// ... (code เดิมที่มีอยู่แล้ว เช่น getTopAttractionsByContinent, getCountriesByContinent) ...

// ✅ เพิ่มฟังก์ชันนี้ลงไปท้ายไฟล์ครับ
export const getPlaceById = async (id: string): Promise<Place | null> => {
  // Validate ID format (UUID) เพื่อกัน Error ถ้า ID มั่ว
  // แต่ Supabase จะ handle ให้เองส่วนใหญ่ ถ้า format ผิดจะ return error
  
  const { data, error } = await supabase
    .from('places')
    .select('*')
    .eq('id', id)
    .single(); // .single() บังคับว่าต้องเจอ 1 แถวเท่านั้น

  if (error) {
    // กรณีไม่เจอ หรือ ID ผิด format
    // console.error(`Error fetching place by id (${id}):`, error.message);
    return null;
  }

  return data;
};
// ✅ ฟังก์ชันดึง Nearby Places (เพิ่ม Log)
export const getNearbyPlaces = async (
  lat: number,
  lon: number,
  excludedId: string,
  radiusKm: number = 500, 
  filterCountry: string | null = null 
): Promise<Place[]> => {
  
  // 🔍 LOG 1: ดูค่าที่ส่งไป
  console.log("🚀 [Service] getNearbyPlaces Calling RPC...", { 
    ref_lat: lat, 
    ref_lon: lon, 
    radius_km: radiusKm, 
    filter_country: filterCountry 
  });

  // Call RPC
  const { data, error } = await supabase.rpc('get_best_nearby_places', {
    ref_lat: lat,
    ref_lon: lon,
    excluded_id: excludedId,
    radius_km: radiusKm,
    filter_country: filterCountry 
  });

  // 🔍 LOG 2: ดูผลลัพธ์จาก DB [Image of database error logs]
  if (error) {
    console.error('❌ [Service] RPC Failed:', error.message, error.details);
    return [];
  }

  console.log(`✅ [Service] RPC Success! Found: ${data?.length || 0} items`, data);

  // Map Data
  return (data || []).map((item: any) => ({
    id: item.id,
    name: item.name,
    rating: item.rating,
    images: Array.isArray(item.images) ? item.images : [item.images], 
    province_state: item.province_state || item.country,
    country: item.country,
    description_short: `${(item.dist_meters / 1000).toFixed(1)} km away` 
  })) as Place[];
};