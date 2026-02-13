"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  MapPin, 
  Star, 
  Check, 
  ArrowLeft, 
  ArrowRight, 
  Loader2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// --- Swiper Imports ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// --- MAPPINGS & HELPER FUNCTIONS ---
const CATEGORY_MATCHING_KEYWORDS: Record<string, string[]> = {
  "Mountains": ["mountain", "mountains", "peak", "volcano", "hill", "doi"],
  "National parks": ["national_park", "national_parks", "nature_reserve", "forest"],
  "Islands": ["island", "islands", "islet", "beach", "beaches", "coast", "sea"],
  "Lakes / Rivers": ["lake", "lakes", "river", "rivers", "waterfall", "waterfalls", "canal", "dam", "reservoir"],
  "Hot Spring": ["hot_spring", "hot_springs", "onsen", "spring"],
  "Gardens": ["garden", "gardens", "botanical", "flora"],
  "Temples": ["temple", "temples", "shrine", "wat", "pagoda", "buddhist"],
  "Church / Mosque": ["church", "mosque", "cathedral", "chapel", "masjid"],
  "Ancient ruins": ["ruin", "ruins", "archaeological", "ancient", "historic_site", "historical_park"],
  "Castles": ["castle", "castles", "fort", "palace", "fortress"],
  "Old towns": ["old_town", "old_towns", "historic_district", "heritage", "ancient_city"],
  "Museums": ["museum", "museums", "art_gallery", "exhibition"],
  "Monuments": ["monument", "monuments", "memorial", "statue"],
  "Viewpoints": ["viewpoint", "viewpoints", "observation", "scenic", "view"],
  "Skyscrapers": ["skyscraper", "skyscrapers", "tower", "high_rise", "building"],
  "Bridges": ["bridge", "bridges", "viaduct"],
  "Landmarks": ["landmark", "landmarks", "attraction", "iconic"],
  "City squares": ["square", "squares", "plaza"],
  "Markets": ["market", "markets", "bazaar"],
  "Night Markets": ["night_market", "night_markets", "walking_street"],
  "Shopping Malls": ["mall", "malls", "department_store", "shopping_center"],
  "Flea market": ["flea", "second_hand"],
  "Souvenir shops": ["souvenir", "gift", "craft", "otop"],
  "Street food": ["street_food", "food_stall", "hawker"],
  "Local restaurants": ["restaurant", "restaurants", "diner", "eatery"],
  "Cafes": ["cafe", "cafes", "coffee", "tea"],
  "Famous food spots": ["famous_food", "michelin", "must_try"],
  "Theme parks": ["theme_park", "theme_parks", "amusement", "water_park"],
  "Zoos / Aquariums": ["zoo", "zoos", "aquarium", "aquariums", "wildlife", "safari"],
  "Nightlife": ["nightlife", "bar", "bars", "club", "clubs", "pub"],
  "Spas / Wellness": ["spa", "spas", "massage", "wellness", "onsen"]
};

const CATEGORY_DISPLAY_MAP: Record<string, string> = {
  "nature_outdoors": "Nature & Outdoors",
  "history_culture": "History & Culture",
  "landmarks_views": "Landmarks & Views",
  "shopping_lifestyle": "Shopping & Lifestyle",
  "food_dining": "Food & Dining",
  "entertainment": "Entertainment",
  "temples": "Temples", "temple": "Temples", "wat": "Temples",
};

const getDisplayCategories = (tags: string[] = []) => {
  const displayCategories: string[] = [];
  tags.forEach(tag => {
    const lowerTag = tag?.toLowerCase().trim();
    if (CATEGORY_DISPLAY_MAP[lowerTag]) {
      displayCategories.push(CATEGORY_DISPLAY_MAP[lowerTag]);
      return;
    }
    let foundMatch = false;
    for (const [displayTitle, keywords] of Object.entries(CATEGORY_MATCHING_KEYWORDS)) {
      if (keywords.some(k => lowerTag.split(/[\s_]+/).includes(k.toLowerCase()))) {
        displayCategories.push(displayTitle);
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      displayCategories.push(tag?.replace(/_/g, " ") || "Attraction");
    }
  });
  const uniqueDisplay = Array.from(new Set(displayCategories));
  return uniqueDisplay.length > 0 ? uniqueDisplay.slice(0, 3).join(", ") : "Attraction";
};

// --- Types ---
interface Place {
  id: string;
  name: string;
  province_state: string;
  country: string;
  category_tags: string[];
  rating: number;
  review_count: number;
  images: string[] | any[] | null;
}

interface SavedPlace {
  id: string;
  place_id: string;
  places: Place | null;
}

export default function PlaceToVisit() {
  const router = useRouter();
  const supabase = createClient();
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchSavedPlaces = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("saved_places")
          .select(`
            id,
            place_id,
            places (
              id,
              name,
              province_state,
              country,
              category_tags,
              rating,
              review_count,
              images
            )
          `)
          .eq("profile_id", user.id);

        if (error) throw error;

        const formattedData: SavedPlace[] = (data || []).map((item: any) => ({
            id: item.id,
            place_id: item.place_id,
            places: Array.isArray(item.places) ? item.places[0] : item.places
        })).filter(item => item.places !== null);

        setSavedPlaces(formattedData);
      } catch (err) {
        console.error("Error fetching saved places:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPlaces();
  }, []);

  // --- Handle Unsave ---
  const handleUnsave = async (savedId: string, placeName: string) => {
      if(!confirm(`Remove ${placeName} from saved places?`)) return;
      
      setSavedPlaces(prev => prev.filter(item => item.id !== savedId));

      try {
          await supabase.from('saved_places').delete().eq('id', savedId);
      } catch (err) {
          console.error("Error removing saved place", err);
      }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3A82CE] animate-spin" />
      </div>
    );
  }

  return (
    // ✅ ปรับความกว้าง Container เป็น max-w-[850px]
    <div className="w-full max-w-[850px] flex flex-col items-start pb-20">
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] w-full">
        
        {savedPlaces.map((saved) => {
          const place = saved.places!;
          const displayString = getDisplayCategories(place.category_tags);
          
          const imagesArray = Array.isArray(place.images) && place.images.length > 0 ? place.images : [];

          return (
            <div
              key={saved.id}
              onClick={() => router.push(`/detail?id=${place.id}`)}
              className="w-[264px] h-[426px] flex flex-col gap-[8px] group cursor-pointer select-none mx-auto"
            >
              <div className="flex flex-col gap-2 min-w-0">

                {/* --- Image Slider Section --- */}
                <div className="relative w-[264px] h-[331px] rounded-[16px] overflow-hidden shadow-sm bg-gray-100 group/slider flex-shrink-0">
                  <Swiper
                    modules={[Navigation, Pagination, A11y]}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    navigation={{
                      prevEl: `.prev-btn-${place.id}`,
                      nextEl: `.next-btn-${place.id}`,
                    }}
                    pagination={{
                      clickable: true,
                      el: `.pagination-custom-${place.id}`,
                    }}
                    className="w-full h-full relative"
                  >
                    {imagesArray.length > 0 ? (
                        imagesArray.map((img, idx) => {
                          const imgUrl = (typeof img === 'object' && 'url' in img) ? (img as any).url : img;
                          const isRiskySource = !imgUrl.includes('supabase.co') && !imgUrl.includes('unsplash.com');

                          return (
                            <SwiperSlide key={idx} className="overflow-hidden rounded-[16px]">
                              <Image 
                                src={imgUrl} 
                                alt={`${place.name} ${idx + 1}`}
                                fill
                                className="object-cover rounded-[16px]"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                                unoptimized={isRiskySource}
                              />
                            </SwiperSlide>
                          );
                        })
                    ) : (
                        <SwiperSlide>
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
                        </SwiperSlide>
                    )}

                    <button onClick={(e) => e.stopPropagation()} className={`prev-btn-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white`}>
                      <ArrowLeft className="w-[14px] h-[14px]" />
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className={`next-btn-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white`}>
                      <ArrowRight className="w-[14px] h-[14px]" />
                    </button>
                    
                    <div className={`pagination-custom-${place.id} absolute bottom-3 left-0 w-full flex justify-center gap-1 z-20 !pointer-events-none`}></div>
                  </Swiper>

                  <style jsx global>{`
                    .pagination-custom-${place.id} { display: flex !important; align-items: center !important; justify-content: center !important; height: 12px !important; }
                    .pagination-custom-${place.id} .swiper-pagination-bullet { width: 4px !important; height: 4px !important; background-color: #deecf9 !important; border: 1px solid #c2dcf3 !important; opacity: 1 !important; margin: 0 4px !important; transition: all 0.3s ease-in-out !important; border-radius: 50% !important; flex-shrink: 0 !important; transform: scale(1); }
                    .pagination-custom-${place.id} .swiper-pagination-bullet-active { width: 8px !important; height: 8px !important; background-color: #041830 !important; border: 1px solid #c2dcf3 !important; }
                  `}</style>

                  <div className="absolute top-2 right-2 z-20">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleUnsave(saved.id, place.name);
                      }} 
                      className="flex h-[24px] w-[32px] group-hover:w-[60px] items-center justify-center rounded-[8px] border border-white text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px] bg-[#3A82CE] group-hover:bg-[#1565C0]"
                    >
                      <Check size="16px" className="flex-shrink-0" />
                      <span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">
                         Saved
                      </span>
                    </button>
                  </div>
                </div>

                {/* --- Text Content Section --- */}
                <div className="w-full h-[87px] flex flex-col gap-[4px] min-w-0">
                  <h4 className="text-[20px] font-inter font-normal text-[#212121] leading-none w-full">
                    <span className="inline-block max-w-full truncate border-b border-transparent group-hover:border-[#212121] pb-[1px] transition-colors duration-200 align-bottom">
                      {place.name}
                    </span>
                  </h4>
                  <p className="flex items-center gap-1 text-[14px] font-inter font-normal text-[#9E9E9E] w-full">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate leading-none">
                      {place.province_state}, {place.country}
                    </span>
                  </p>
                  <div className="flex items-center gap-[4px]">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-[12px] h-[12px] ${star <= Math.round(place.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                      />
                    ))}
                    <span className="text-xs font-medium text-[#9E9E9E] ml-1">({place.review_count || 0})</span>
                  </div>
                  <p className="text-[14px] font-inter font-semibold text-[#212121] truncate leading-none w-full capitalize">
                    {displayString}
                  </p>
                </div>

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}