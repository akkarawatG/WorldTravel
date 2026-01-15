// app/detail/page.tsx
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// ✅ Import Services & Types
import { getPlaceById, getNearbyPlaces } from "@/services/placeService";
import { Place } from "@/types/place";
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "@/data/attractionsData";

// ✅ Import Client Component
import DetailClient from "@/components/DetailClient";

// ✅ 1. แก้ไข Type ให้ searchParams เป็น Promise
interface DetailPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Helper: Normalize Data Logic
const normalizePlaceData = (dbPlace: any): Place | null => {
  if (!dbPlace) return null;

  return {
    ...dbPlace,
    province_state: dbPlace.province_state || "",
    country: dbPlace.country || "",
    images: Array.isArray(dbPlace.images)
      ? dbPlace.images.map((img: any) => typeof img === 'string' ? img : img.url)
      : [],
    reviews: dbPlace.reviews || [],
    travel_tips: (dbPlace.travel_tips && Object.keys(dbPlace.travel_tips).length > 0)
      ? dbPlace.travel_tips
      : {
        footwear: "We recommend comfortable walking shoes.",
        outfit: "Light clothing recommended."
      }
  } as Place;
};

const getMockData = (id: string): Place | null => {
  const mockPlace = MOCK_ATTRACTIONS.find((item) => String(item.id) === String(id));
  if (!mockPlace) return null;

  const normalizeMockImages = (imgs: any) => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs.map(img => typeof img === 'string' ? { url: img } : { url: img.url || "" }).filter(i => i.url);
    return [];
  };

  return {
    ...mockPlace,
    id: String(mockPlace.id),
    province_state: mockPlace.location.province_state,
    country: mockPlace.location.country,
    continent: mockPlace.location.continent,
    location: mockPlace.location,
    description_long: (mockPlace as any).description || "No description.",
    opening_hours: mockPlace.opening_hours_text,
    best_season: mockPlace.best_season_to_visit,
    formatted_address: `${mockPlace.location.province_state}, ${mockPlace.location.country}`,
    google_maps_url: `http://googleusercontent.com/maps.google.com/`,
    price_detail: (mockPlace as any).price_detail || "Free entry",
    images: normalizeMockImages(mockPlace.images),
    reviews: (mockPlace as any).reviews || [],
    travel_tips: { footwear: "Comfortable shoes.", outfit: "Casual." }
  } as unknown as Place;
};

// --- SERVER COMPONENT ---
export default async function DetailPage(props: DetailPageProps) {
  // ✅ 2. Await searchParams ก่อนใช้งาน
  const searchParams = await props.searchParams;
  const id = searchParams?.id as string;

  if (!id) {
    return (
        <div className="min-h-screen flex items-center justify-center text-gray-500">
            Invalid Place ID
        </div>
    );
  }

  // 1. Fetch Main Place Data (Server Side)
  let place: Place | null = null;
  try {
    const dbPlace = await getPlaceById(id);
    place = normalizePlaceData(dbPlace);
  } catch (error) {
    console.error("Error fetching place:", error);
  }

  // Fallback to Mock
  if (!place) {
    console.warn("⚠️ Using Mock Data for Detail Page");
    place = getMockData(id);
  }

  if (!place) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500">
        <h2 className="text-xl font-bold mb-2">Attraction Not Found</h2>
        <Link href="/" className="text-blue-500 hover:underline flex items-center gap-2">
          <ArrowLeft size={16} /> Back to Home
        </Link>
      </div>
    );
  }

  // 2. Prepare More Pictures
  const reviewImages = (place as any).reviews?.reduce((acc: string[], r: any) => {
    const imgs = r.images || [];
    const urls = imgs.map((img: any) => typeof img === 'string' ? img : img.url);
    return [...acc, ...urls];
  }, []) || [];

  const morePictures = reviewImages.length > 0 
    ? reviewImages 
    : (place.images?.map(img => typeof img === 'string' ? img : (img as any).url) || []);

  // 3. Fetch Nearby Places (Server Side)
  const lat = (place as any).lat || (place as any).location?.lat;
  const lon = (place as any).lon || (place as any).location?.lon;
  let nearbyPlaces: Place[] = [];

  if (lat && lon) {
    try {
      nearbyPlaces = await getNearbyPlaces(lat, lon, place.id, 500, place.country || null);
    } catch (e) {
      console.error("Nearby fetch failed, using fallback");
    }
  }

  // Fallback Mock Nearby
  if (nearbyPlaces.length === 0) {
    nearbyPlaces = MOCK_ATTRACTIONS
      .filter(p => String(p.id) !== String(place?.id))
      .slice(0, 5)
      .map(p => ({
        ...p,
        id: String(p.id),
        images: [{ url: typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url }],
        province_state: p.location.province_state,
        country: p.location.country,
        rating: 4.5
      })) as unknown as Place[];
  }

  // Render Client Component with Hydrated Data
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <DetailClient 
        place={place} 
        nearbyPlaces={nearbyPlaces} 
        morePictures={morePictures} 
      />
    </Suspense>
  );
}