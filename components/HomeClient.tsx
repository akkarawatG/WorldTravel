"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, ArrowLeft, ArrowRight, Star, Check, ChevronRight } from "lucide-react";
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import Link from "next/link";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { getTopAttractionsByContinent, CountryData } from '@/services/placeService';
import { Place } from '@/types/place';
import { createClient } from "@/utils/supabase/client";

import { CONTINENTS, COUNTRIES_DATA } from "@/data/mockData";
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "@/data/attractionsData";

import AuthModal, { UserProfile as AuthUserProfile } from "./AuthModal";

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
  "mountains": "Mountains", "mountain": "Mountains", "volcanoes": "Mountains", "nature_mountains": "Mountains",
  "national_parks": "National parks", "national_park": "National parks",
  "islands": "Islands", "island": "Islands", "beaches": "Islands", "beach": "Islands", "beaches_islands": "Islands",
  "lakes_rivers": "Lakes / Rivers", "lake": "Lakes / Rivers", "river": "Lakes / Rivers", "waterfall": "Lakes / Rivers", "waterfalls": "Lakes / Rivers",
  "hot_spring": "Hot Spring", "hot_springs": "Hot Spring",
  "gardens": "Gardens", "garden": "Gardens",
  "history_culture": "History & Culture",
  "temples": "Temples", "temple": "Temples", "wat": "Temples",
  "church_mosque": "Church / Mosque", "church": "Church / Mosque", "mosque": "Church / Mosque",
  "ancient_ruins": "Ancient ruins", "ruins": "Ancient ruins", "historical_park": "Ancient ruins",
  "castles": "Castles", "castle": "Castles",
  "old_towns": "Old towns", "old_town": "Old towns",
  "museums": "Museums", "museum": "Museums",
  "monuments": "Monuments", "monument": "Monuments",
  "landmarks_views": "Landmarks & Views",
  "viewpoints": "Viewpoints", "viewpoint": "Viewpoints",
  "skyscrapers": "Skyscrapers", "skyscraper": "Skyscrapers",
  "bridges": "Bridges", "bridge": "Bridges",
  "landmarks": "Landmarks", "landmark": "Landmarks",
  "city_squares": "City squares", "square": "City squares",
  "shopping_lifestyle": "Shopping & Lifestyle",
  "markets": "Markets", "market": "Markets",
  "night_markets": "Night Markets", "night_market": "Night Markets",
  "shopping_malls": "Shopping Malls", "shopping_mall": "Shopping Malls", "mall": "Shopping Malls",
  "flea_market": "Flea market",
  "souvenir_shops": "Souvenir shops", "souvenir_shop": "Souvenir shops", "souvenir": "Souvenir shops",
  "food_dining": "Food & Dining",
  "street_food": "Street food",
  "local_restaurants": "Local restaurants", "restaurant": "Local restaurants",
  "cafes": "Cafes", "cafe": "Cafes",
  "famous_food_spots": "Famous food spots", "famous_food": "Famous food spots",
  "entertainment": "Entertainment",
  "theme_parks": "Theme parks", "theme_park": "Theme parks",
  "zoos_aquariums": "Zoos / Aquariums", "zoo": "Zoos / Aquariums", "aquarium": "Zoos / Aquariums",
  "nightlife": "Nightlife",
  "spas_wellness": "Spas / Wellness", "spa": "Spas / Wellness"
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

interface HomeClientProps {
  initialAttractions: Place[];
  initialCountries: CountryData[];
}

// --- MAIN COMPONENT ---
export default function HomeClient({ initialAttractions, initialCountries }: HomeClientProps) {
  const router = useRouter();
  const supabase = createClient();

  // Data States
  const [selectedContinent, setSelectedContinent] = useState("Asia");
  const [topAttractions, setTopAttractions] = useState<Place[]>(initialAttractions);
  const [currentCountries, setCurrentCountries] = useState<CountryData[]>(initialCountries);
  const [isLoading, setIsLoading] = useState(false);
  
  // User & Saved State
  const [userId, setUserId] = useState<string | null>(null);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());

  // Modal State
  const [showAuthModal, setShowAuthModal] = useState(false);

  const displaySlides = topAttractions.slice(0, 8);

  // 1. Initial Load: Check Auth & Get Saved Places
  useEffect(() => {
    const checkUserAndSavedPlaces = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUserId(user.id);
        
        const { data: savedData, error } = await supabase
          .from('saved_places')
          .select('place_id')
          .eq('profile_id', user.id);
          
        if (savedData && !error) {
          const ids = new Set(savedData.map(item => item.place_id));
          setSavedPlaceIds(ids);
        }
      }
    };

    checkUserAndSavedPlaces();
  }, []);

  // 2. Fetch Attractions on Continent Change
  useEffect(() => {
    if (selectedContinent === "Asia" && topAttractions.length > 0 && topAttractions === initialAttractions) {
        return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const targetContinents = selectedContinent === "Oceania" 
          ? ["Oceania", "Australia"] 
          : [selectedContinent];

        const apiRequests = targetContinents.map(continent => 
            getTopAttractionsByContinent(continent)
        );
        
        const results = await Promise.all(apiRequests);
        let combinedAttractions = results.flat();

        if (combinedAttractions.length === 0) {
             const mockAttr = MOCK_ATTRACTIONS
            .filter(p => targetContinents.includes(p.location.continent))
            .map(m => ({
              ...m,
              id: String(m.id),
              province_state: m.location.province_state,
              country: m.location.country,
              continent: m.location.continent,
            }));
            combinedAttractions = mockAttr as unknown as Place[];
        }

        combinedAttractions.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        setTopAttractions(combinedAttractions.slice(0, 8));

        let combinedCountries: any[] = [];
        targetContinents.forEach(continentKey => {
            if (COUNTRIES_DATA[continentKey]) {
                combinedCountries = [...combinedCountries, ...COUNTRIES_DATA[continentKey]];
            }
        });

        const formattedCountries = combinedCountries.map(c => ({
          name: c.name,
          continent: selectedContinent,
          image: c.image
        }));

        setCurrentCountries(formattedCountries);

      } catch (error) {
        console.error("Error fetching data:", error);
        setTopAttractions([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedContinent]);

  // 3. Handle Save/Unsave Logic (Toggle)
  const handleSavePlace = async (placeId: string, placeName: string) => {
    if (!userId) {
      setShowAuthModal(true);
      return;
    }

    const isAlreadySaved = savedPlaceIds.has(placeId);

    if (isAlreadySaved) {
        setSavedPlaceIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(placeId);
            return newSet;
        });

        try {
            const { error } = await supabase
                .from('saved_places')
                .delete()
                .eq('place_id', placeId)
                .eq('profile_id', userId);

            if (error) {
                console.error("Error removing place:", error);
                setSavedPlaceIds(prev => new Set(prev).add(placeId));
                alert("Failed to remove place.");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setSavedPlaceIds(prev => new Set(prev).add(placeId));
        }

    } else {
        setSavedPlaceIds(prev => new Set(prev).add(placeId));

        try {
            const { error } = await supabase
                .from('saved_places')
                .insert([
                    { profile_id: userId, place_id: placeId }
                ]);

            if (error) {
                console.error("Error saving place:", error);
                setSavedPlaceIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(placeId);
                    return newSet;
                });
                alert("Failed to save place.");
            }
        } catch (err) {
            console.error("Unexpected error:", err);
            setSavedPlaceIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(placeId);
                return newSet;
            });
        }
    }
  };

  const handleAuthSuccess = (u: AuthUserProfile) => {
    setShowAuthModal(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20 overflow-x-hidden">

      {/* --- 1. HERO SECTION (SLIDER) --- */}
      <div className="w-full bg-[#DEECF9] pb-4 md:pb-0 md:h-[414px]">
        <div className="w-full max-w-[1440px] md:h-[414px] mx-auto bg-[#DEECF9] flex justify-center">

          {isLoading ? (
            <div className="w-full h-[250px] sm:h-[300px] md:h-[414px] flex items-center justify-center text-gray-500">Loading...</div>
          ) : displaySlides.length === 0 ? (
            <div className="w-full h-[250px] sm:h-[300px] md:h-[414px] flex items-center justify-center text-gray-500">No attractions found for {selectedContinent}</div>
          ) : (
            <div className="w-full h-auto md:h-[445px] flex flex-col gap-[16px] px-0 md:px-8 xl:px-[156px] mt-4 md:mt-0">
              
              <div className="relative w-full h-[250px] sm:h-[300px] md:h-[413px] bg-black overflow-hidden group flex-shrink-0 sm:rounded-2xl md:rounded-none">
                <Swiper
                  key={selectedContinent}
                  modules={[Navigation, Pagination, Autoplay, A11y]}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={displaySlides.length > 1}
                  autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                  }}
                  navigation={{
                    prevEl: '.custom-prev-button',
                    nextEl: '.custom-next-button',
                  }}
                  className="w-full h-full"
                  onSlideChange={(swiper) => {
                    const realIndex = swiper.realIndex;
                    const bullets = document.querySelectorAll('.custom-pagination-bullet');
                    bullets.forEach((bullet, index) => {
                        bullet.classList.remove('bg-[#E0E0E0]', 'bg-[#121212]', 'w-[16px]', 'h-[16px]', 'w-[8px]', 'h-[8px]', 'border', 'border-[4px]', 'border-[#EEEEEE]', 'border-[#E0E0E0]');
                        bullet.classList.add('rounded-full', 'transition-all', 'duration-300');
                        if (index === realIndex) {
                            bullet.classList.add('w-[16px]', 'h-[16px]', 'bg-[#121212]', 'border-[4px]', 'border-[#E0E0E0]');
                        } else {
                            bullet.classList.add('w-[16px]', 'h-[16px]', 'bg-[#E0E0E0]', 'border', 'border-[#EEEEEE]');
                        }
                    });
                  }}
                >
                  {displaySlides.map((slide, index) => {
                    const imgUrl = Array.isArray(slide.images) && typeof slide.images[0] === 'object' && 'url' in slide.images[0]
                      ? (slide.images[0] as any).url
                      : (slide.images?.[0] || "https://placehold.co/800x400?text=No+Image");
                    const isRiskySource = !imgUrl.includes('supabase.co') && !imgUrl.includes('unsplash.com');

                    return (
                      <SwiperSlide key={slide.id} className="relative w-full h-full">
                        <Image
                          src={imgUrl}
                          alt={slide.name}
                          fill
                          priority={index === 0}
                          className="object-cover"
                          sizes="(max-width: 1024px) 100vw, 1440px"
                          unoptimized={isRiskySource}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none"></div>

                        {/* Text Overlay */}
                        <div className="absolute top-[40px] sm:top-[60px] md:top-[140px] left-1/2 -translate-x-1/2 z-30 w-full px-4 md:px-0 md:w-[1128px] h-auto flex flex-col items-center justify-center gap-[10px]">
                          <div className="w-full max-w-[635px] flex flex-col items-center gap-[16px] sm:gap-[20px] md:gap-[32px]">
                            <div className="flex flex-col items-center gap-[8px] md:gap-[16px] w-full text-center">
                              <h1 className="font-Inter font-bold text-[24px] sm:text-[28px] md:text-[48px] leading-[1.1] md:leading-[100%] text-white drop-shadow-[3px_3px_5px_rgba(0,0,0,1)]">Explore the world your way</h1>
                              <p className="font-Inter font-bold text-[12px] sm:text-[14px] md:text-[20px] leading-[1.2] md:leading-[100%] text-white text-center drop-shadow-[0px_4px_4px_rgba(0,0,0,1)]">Plan trips, save places, and build your own trips</p>
                            </div>
                            <button
                              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                              className="w-[130px] sm:w-[150px] md:w-[166px] h-[36px] md:h-[40px] flex items-center justify-center gap-[10px] px-[16px] py-[8px] bg-[#3A82CE33] border border-[#95C3EA] rounded-[8px] cursor-pointer hover:bg-[#3A82CE] transition-all backdrop-blur-[2px] shadow-sm z-40"
                            >
                              <span className="font-Inter font-normal text-[14px] sm:text-[16px] md:text-[20px] leading-[100%] text-white">Start Planning</span>
                            </button>
                          </div>
                        </div>

                        {/* Card Info (Location Tag) */}
                        <div className="absolute bottom-0 left-0 z-40 w-[85%] md:max-w-[300px] min-h-[60px] sm:min-h-[79px] flex flex-col justify-center gap-[4px] sm:gap-[9px] p-[12px] sm:p-[16px] bg-[#3C3C4399] text-white rounded-tr-[8px] rounded-br-[8px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className="flex flex-col justify-center gap-[2px] sm:gap-[4px] w-full">
                            <h2
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/detail?id=${slide.id}`);
                              }}
                              className="text-[14px] sm:text-[16px] md:text-[18px] font-Inter font-[700] leading-normal drop-shadow-md truncate w-full pb-1 cursor-pointer hover:underline hover:text-[#DEECF9] transition-colors relative z-50"
                            >
                              {slide.name.split('(')[0].trim()}
                            </h2>
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-[13px] md:text-[14px] font-Inter font-[600] opacity-90 relative z-50 w-full">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                              <div className="flex gap-1 truncate w-full">
                                <span
                                  onClick={(e) => { e.stopPropagation(); router.push(`/explore?search=${slide.province_state}`); }}
                                  className="cursor-pointer hover:underline hover:text-[#DEECF9] transition-colors truncate"
                                >
                                  {slide.province_state},
                                </span>
                                <span
                                  onClick={(e) => { e.stopPropagation(); router.push(`/explore?country=${slide.country}`); }}
                                  className="cursor-pointer hover:underline hover:text-[#DEECF9] transition-colors truncate"
                                >
                                  {slide.country}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    );
                  })}

                  <button className="custom-prev-button absolute left-4 top-1/2 -translate-y-1/2 z-50 w-[48px] h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer">
                    <ArrowLeft className="w-[30px] h-[30px]" />
                  </button>
                  <button className="custom-next-button absolute right-4 top-1/2 -translate-y-1/2 z-50 w-[48px] h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer">
                    <ArrowRight className="w-[30px] h-[30px]" />
                  </button>
                </Swiper>
              </div>

              <div className="w-[184px] h-[16px] flex justify-center items-center gap-[8px] flex-shrink-0 mx-auto mt-2 md:mt-0">
                {displaySlides.map((_, index) => (
                  <div key={index} className={`custom-pagination-bullet rounded-full transition-all duration-300 cursor-pointer box-border ${index === 0 ? 'w-[16px] h-[16px] bg-[#041830] border-[4px] border-[#DEECF9] ring-[1px] ring-[#C2DCF3]' : 'w-[16px] h-[16px] bg-[#041830] border border-[#DEECF9] ring-[1px] ring-[#C2DCF3]'}`}></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="w-full max-w-[1128px] mx-auto flex flex-col gap-[24px] mt-[24px] md:mt-[64px] px-2 sm:px-4 xl:px-0">

        {/* --- 2. HEADER & TABS --- */}
        <div className="flex flex-col gap-[16px] md:gap-[24px]">
          <div id="search-section" className="w-full flex items-center justify-start md:justify-center gap-[13px] z-10 relative">
            <h3 className="text-[24px] sm:text-[28px] md:text-[36px] font-[900] font-inter leading-none tracking-normal text-left md:text-center text-[#194473]">
              Popular Destinations
            </h3>
          </div>

          <div className="w-full max-w-[963px] mx-auto relative md:pt-2">
            {/* เส้นสีเทาแนวยาว (ซ่อนในมือถือ แสดงเฉพาะ Desktop) */}
            <div className="hidden md:block absolute bottom-0 left-0 w-full h-[1px] bg-[#9E9E9E]"></div>

            {/* ✅ เมนูทวีป: เปลี่ยนเป็นแบบเลื่อนซ้ายขวาได้ (Scrollable) ทั้งมือถือและ Desktop */}
            <div className="flex w-full overflow-x-auto scrollbar-hide gap-6 sm:justify-between px-2 sm:px-0 pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {CONTINENTS.map((cont) => {
                const isActive = selectedContinent === cont;
                return (
                  <button
                    key={`tab-${cont}`}
                    onClick={() => setSelectedContinent(cont)}
                    className={`
                      relative transition-all whitespace-nowrap flex items-center shrink-0 cursor-pointer
                      bg-transparent border-transparent shadow-none rounded-none px-1 py-0 pb-[8px] md:pb-[12px] text-[16px] md:text-[20px] leading-[24px]
                      ${isActive ? "font-[700] text-[#194473]" : "font-[400] text-[#212121] hover:text-[#194473]"}
                    `}
                  >
                    {cont}
                    {isActive && (
                      <span className="absolute left-0 bottom-0 w-full h-[2px] bg-[#194473] z-10"></span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* --- 3. TOP ATTRACTIONS GRID --- */}
        <div className="w-full mx-auto">
          {/* ✅ ปรับ Grid เป็น 2 คอลัมน์บนมือถือ */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-[24px]">
            {topAttractions.slice(0, 4).map((place) => {
              const displayString = getDisplayCategories(place.category_tags);
              const isSaved = savedPlaceIds.has(String(place.id));

              return (
                <div
                  key={place.id}
                  className="w-full flex flex-col gap-[6px] sm:gap-[8px] group cursor-pointer select-none"
                  onClick={() => router.push(`/detail?id=${place.id}`)}
                >
                  <div className="flex flex-col gap-1.5 sm:gap-2 min-w-0 w-full">

                    {/* ✅ ปรับสัดส่วนรูปภาพสำหรับมือถือ */}
                    <div className="relative w-full aspect-[4/5] sm:aspect-auto sm:h-[331px] rounded-[12px] sm:rounded-[16px] overflow-hidden shadow-sm bg-gray-100 group/slider flex-shrink-0">
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
                        {(Array.isArray(place.images) && place.images.length > 0 ? place.images : []).map((img, idx) => {
                          const imgUrl = (typeof img === 'object' && 'url' in img) ? (img as any).url : img;
                          const isRiskySource = !imgUrl.includes('supabase.co') && !imgUrl.includes('unsplash.com');

                          return (
                            <SwiperSlide key={idx} className="overflow-hidden rounded-[12px] sm:rounded-[16px]">
                              <Image 
                                src={imgUrl} 
                                alt={`${place.name} ${idx + 1}`}
                                fill
                                className="object-cover rounded-[12px] sm:rounded-[16px]"
                                sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                                unoptimized={isRiskySource}
                              />
                            </SwiperSlide>
                          );
                        })}

                        {(!place.images || place.images.length === 0) && (
                          <SwiperSlide>
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-sm">No Image</div>
                          </SwiperSlide>
                        )}

                        <button onClick={(e) => e.stopPropagation()} className={`prev-btn-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white hidden sm:flex`}>
                          <ArrowLeft className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                        </button>
                        <button onClick={(e) => e.stopPropagation()} className={`next-btn-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[20px] h-[20px] sm:w-[24px] sm:h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white hidden sm:flex`}>
                          <ArrowRight className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]" />
                        </button>
                        <div className={`pagination-custom-${place.id} absolute bottom-2 sm:bottom-3 left-0 w-full flex justify-center gap-1 z-20 !pointer-events-none`}></div>
                      </Swiper>

                      <style jsx global>{`
                        .pagination-custom-${place.id} { display: flex !important; align-items: center !important; justify-content: center !important; height: 12px !important; }
                        .pagination-custom-${place.id} .swiper-pagination-bullet { width: 4px !important; height: 4px !important; background-color: #deecf9 !important; border: 1px solid #c2dcf3 !important; opacity: 1 !important; margin: 0 4px !important; transition: all 0.3s ease-in-out !important; border-radius: 50% !important; flex-shrink: 0 !important; transform: scale(1); }
                        .pagination-custom-${place.id} .swiper-pagination-bullet-active { width: 8px !important; height: 8px !important; background-color: #041830 !important; border: 1px solid #c2dcf3 !important; }
                      `}</style>

                      {/* ✅ ปรับขนาดปุ่ม Save บนมือถือ */}
                      <div className="absolute top-2 right-2 z-20">
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            handleSavePlace(String(place.id), place.name);
                          }} 
                          className={`flex h-[22px] w-[28px] sm:h-[24px] sm:w-[32px] sm:group-hover:w-[60px] items-center justify-center rounded-[6px] sm:rounded-[8px] border border-white text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px] 
                            ${isSaved 
                                ? "bg-[#3A82CE] sm:group-hover:bg-[#1565C0]" 
                                : "bg-[#00000066] sm:group-hover:bg-[#1565C0]"
                            }
                          `}
                        >
                          {isSaved ? (
                              <Check className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] flex-shrink-0" />
                          ) : (
                              <Icon path={mdiPlus} className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] flex-shrink-0" />
                          )}
                          
                          <span className="hidden sm:inline-block max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">
                              {isSaved ? "Saved" : "Add"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* ✅ ย่อ Text ให้เล็กลงในหน้าจอมือถือ */}
                    <div className="w-full flex flex-col gap-[2px] sm:gap-[4px] min-w-0 px-1 sm:px-0">
                      <h4 className="text-[14px] sm:text-[20px] font-inter font-bold sm:font-normal text-[#212121] leading-tight sm:leading-tight w-full">
                        <span className="inline-block max-w-full truncate border-b border-transparent group-hover:border-[#212121] pb-[1px] transition-colors duration-200 align-bottom">
                          {place.name}
                        </span>
                      </h4>
                      <p className="flex items-center gap-1 text-[11px] sm:text-[14px] font-inter font-normal text-[#9E9E9E] w-full">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4 shrink-0" />
                        <span className="truncate leading-none mt-[1px]">
                          {place.province_state}, {place.country}
                        </span>
                      </p>
                      <div className="flex items-center gap-[2px] sm:gap-[4px] mt-[2px] sm:mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-[10px] h-[10px] sm:w-[12px] sm:h-[12px] ${star <= Math.round(place.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`}
                          />
                        ))}
                        <span className="text-[10px] sm:text-xs font-medium text-[#9E9E9E] ml-1">({place.rating})</span>
                      </div>
                      <p className="text-[11px] sm:text-[14px] font-inter font-semibold text-[#212121] truncate leading-none w-full capitalize mt-[2px] sm:mt-1">
                        {displayString}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- 4. COUNTRIES LIST --- */}
        <div className="w-full flex flex-col gap-[16px] md:gap-[24px] mt-[24px] sm:mt-[32px] md:mt-[48px]">
          <div className="flex flex-row items-end justify-between gap-3 border-b border-gray-100 md:border-none pb-2 md:pb-0">
            {/* ✅ ปรับขนาดหัวข้อ Countries */}
            <h2 className="text-[20px] sm:text-[24px] md:text-[36px] font-[900] font-inter leading-none tracking-normal text-left sm:text-center text-[#194473]">
              Top list in {selectedContinent}
            </h2>
            
            <Link href="/countries" className="w-fit shrink-0">
              <button className="group flex items-center justify-end gap-[4px] font-inter transition-colors cursor-pointer text-[#3A82CE] hover:text-[#194473] md:text-[#616161]">
                <span className="text-[12px] sm:text-[14px] font-semibold block md:hidden">
                  See All
                </span>
                <span className="text-[18px] font-bold hidden md:block group-hover:underline">
                  All Countries
                </span>
                <ChevronRight size={16} className="md:hidden mt-0.5" strokeWidth={2.5} />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-[20px] md:gap-[25px]">
            {currentCountries.slice(0, 8).map((country) => {
              const isRiskySource = !country.image.includes('supabase.co') && !country.image.includes('unsplash.com');

              return (
                <div
                  key={country.name}
                  onClick={() => router.push(`/explore?country=${country.name}`)}
                  className="relative w-full aspect-[4/3] sm:aspect-auto sm:h-[331px] rounded-[12px] sm:rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-[#1E518C] flex flex-col bg-white"
                >
                  <div className="relative w-full flex-1 sm:h-[256px] overflow-hidden">
                    <Image 
                      src={country.image} 
                      alt={country.name}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, 25vw"
                      unoptimized={isRiskySource}
                    />
                  </div>
                  <div className="w-full h-[45px] sm:h-[60px] md:h-[75px] bg-white px-2 sm:px-[16px] flex flex-col justify-center border-t border-[#C2DCF3] shrink-0">
                    <h4 className="text-[14px] sm:text-[16px] md:text-[20px] font-Inter font-bold text-[#194473] leading-none truncate group-hover:underline">
                      {country.name}
                    </h4>
                    <span className="text-[10px] sm:text-[12px] md:text-[14px] font-Inter font-normal text-[#9E9E9E] mt-0.5 sm:mt-1 md:mt-2">
                      {selectedContinent}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Modal ล็อกอิน */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

    </div>
  );
}