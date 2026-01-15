// app/explore/page.tsx
import { Suspense } from "react";
import { searchPlaces } from '@/services/placeService';
import { Place } from '@/types/place';
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "../../data/attractionsData";
import ExploreClient from "@/components/ExploreClient";

interface ExplorePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ExplorePage(props: ExplorePageProps) {
  const searchParams = await props.searchParams;
  
  // 1. ดึงค่าจาก URL
  const rawCountry = typeof searchParams.country === 'string' ? searchParams.country : undefined;
  const searchQuery = typeof searchParams.search === 'string' ? searchParams.search : "";

  // 2. ✅ แก้ไข Logic Default Country:
  // - ถ้ามี country ใน URL -> ใช้ค่านั้น
  // - ถ้าไม่มี country แต่มี search -> ไม่ต้อง Default (หาทั่วโลก)
  // - ถ้าไม่มีทั้งคู่ -> Default เป็น "Thailand"
  let country = rawCountry;
  if (!country && !searchQuery) {
    country = "Thailand";
  }

  // 3. ดึงข้อมูลจาก Supabase
  let places: Place[] = [];
  try {
    // ส่ง country ที่ผ่าน logic แล้วไป (ถ้าเป็น undefined คือหาทั่วโลก)
    const dbPlaces = await searchPlaces(searchQuery, country, []);
    if (dbPlaces && dbPlaces.length > 0) {
      places = dbPlaces;
    }
  } catch (error) {
    console.error("Error fetching places server-side:", error);
  }

  // 4. Fallback Mock Data
  if (places.length === 0) {
    const mockFiltered = MOCK_ATTRACTIONS.filter((p: any) => {
      // Logic เดียวกัน: ถ้ามี country ให้กรอง, ถ้าไม่มีให้ผ่านหมด
      const matchCountry = country 
        ? p.location?.country?.toLowerCase() === country.toLowerCase()
        : true; 

      const searchLower = searchQuery.toLowerCase();
      const district = p.district || p.location?.district || "";
      const matchSearch = searchQuery === "" ||
        p.name.toLowerCase().includes(searchLower) ||
        p.location?.province_state?.toLowerCase().includes(searchLower) ||
        district.toLowerCase().includes(searchLower);
        
      return matchCountry && matchSearch;
    });

    places = mockFiltered.map((m: any) => ({
      ...m,
      id: String(m.id),
      province_state: m.location?.province_state || m.province_state,
      country: m.location?.country || m.country,
      district: m.district || m.location?.district || "",
      continent: m.location?.continent || m.continent
    })) as unknown as Place[];
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ExploreClient initialPlaces={places} searchParams={searchParams} />
    </Suspense>
  );
}