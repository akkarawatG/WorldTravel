// app/page.tsx
import { getTopAttractionsByContinent } from '@/services/placeService';
import HomeClient from '@/components/HomeClient';
import { CONTINENTS, COUNTRIES_DATA } from "@/data/mockData";
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "@/data/attractionsData";
import { Place } from '@/types/place';

// เป็น Server Component โดย Default (ไม่ต้องใส่ "use client")
export default async function HomePage() {
  const initialContinent = "Asia";

  // 1. ดึงข้อมูลที่ Server (Parallel Fetching)
  // หมายเหตุ: getCountriesByContinent ใน Service คุณมีการใช้ Supabase
  // แต่ใน Logic เก่าคุณใช้ Mock Data ล้วนๆ สำหรับ Countries
  // เพื่อความชัวร์ ผมจะใช้ Logic เดิมคือ Mock สำหรับ Countries ไปก่อน
  // ส่วน Attractions ดึงจาก DB จริง
  
  let attractions: Place[] = [];
  
  try {
    attractions = await getTopAttractionsByContinent(initialContinent);
  } catch (error) {
    console.error("Server fetch error:", error);
  }

  // Fallback Logic (ทำที่ Server เลย เพื่อให้ HTML ที่ส่งไปมีข้อมูลแน่นอน)
  if (!attractions || attractions.length === 0) {
    const mockAttr = MOCK_ATTRACTIONS
      .filter(p => p.location.continent === initialContinent)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 8)
      .map(m => ({
        ...m,
        id: String(m.id),
        province_state: m.location.province_state,
        country: m.location.country,
        continent: m.location.continent,
      }));
     attractions = mockAttr as unknown as Place[];
  }

  // Mock Countries Data (ตาม Logic เดิมของคุณ)
  const countries = (COUNTRIES_DATA[initialContinent] || []).map(c => ({
    name: c.name,
    continent: initialContinent,
    image: c.image
  }));

  // ส่งข้อมูลที่ "พร้อมแล้ว" ไปให้ Client Component render ทันที
  return (
    <HomeClient 
      initialAttractions={attractions} 
      initialCountries={countries} 
    />
  );
}