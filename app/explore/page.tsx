"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, ArrowLeft, ArrowRight, Map, Star, Plus, ChevronLeft, ChevronRight, Check, Building2 } from "lucide-react";

import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { searchPlaces, calculateRelevanceScore } from '@/services/placeService';
import { Place } from '@/types/place';
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "../../data/attractionsData";

// ==========================================
// 1. CONFIGURATION: UI FILTERS (Sidebar)
// ==========================================
const ITEMS_PER_PAGE = 12;

const FILTER_GROUPS = [
  {
    title: "Nature & Outdoors",
    items: ["Mountains", "National parks", "Islands", "Lakes / Rivers", "Hot Spring", "Gardens"]
  },
  {
    title: "History & Culture",
    items: ["Temples", "Church / Mosque", "Ancient ruins", "Castles", "Old towns", "Museums", "Monuments"]
  },
  {
    title: "Landmarks & Views",
    items: ["Viewpoints", "Skyscrapers", "Bridges", "Landmarks", "City squares"]
  },
  {
    title: "Shopping & Lifestyle",
    items: ["Markets", "Night Markets", "Shopping Malls", "Flea market", "Souvenir shops"]
  },
  {
    title: "Food & Dining",
    items: ["Street food", "Local restaurants", "Cafes", "Famous food spots"]
  },
  {
    title: "Entertainment",
    items: ["Theme parks", "Zoos / Aquariums", "Nightlife", "Spas / Wellness"]
  }
];

// ==========================================
// 2. MAPPING: FILTER -> DB TAGS (Logic การกรอง)
// เมื่อ user ติ๊ก Filter นี้ -> ให้ไปหา places ที่มี tags เหล่านี้
// ==========================================
const UI_FILTER_TO_DB_TAGS: Record<string, string[]> = {
  // Nature
  "Mountains": ["mountains_volcanoes"],
  "National parks": ["national_parks"],
  "Islands": ["beaches_islands"],
  "Lakes / Rivers": ["lakes_rivers", "waterfalls", "caves"], // รวมถ้ำและน้ำตกไว้หมวดนี้ตามความเหมาะสม
  "Hot Spring": ["hot_springs"],
  "Gardens": ["botanical_gardens"],

  // History
  "Temples": ["temples_shrines"],
  "Church / Mosque": ["churches_mosques"],
  "Ancient ruins": ["ancient_ruins"],
  "Castles": ["palaces_castles"],
  "Old towns": ["historic_old_towns"],
  "Museums": ["museums"],
  "Monuments": ["monuments"],

  // Landmarks
  "Viewpoints": ["viewpoints"],
  "Skyscrapers": ["skyscrapers"],
  "Bridges": ["bridges"],
  "Landmarks": ["landmarks"],
  "City squares": ["city_squares"],

  // Shopping
  "Markets": ["local_markets", "floating_markets"],
  "Night Markets": ["night_markets"],
  "Shopping Malls": ["shopping_malls"],
  "Flea market": ["flea_markets"],
  "Souvenir shops": ["souvenir_shops"],

  // Food
  "Street food": ["street_food"],
  "Local restaurants": ["local_restaurants"],
  "Cafes": ["cafes"],
  "Famous food spots": ["famous_food_spots"],

  // Entertainment
  "Theme parks": ["theme_parks"],
  "Zoos / Aquariums": ["zoos_aquariums"],
  "Nightlife": ["nightlife"],
  "Spas / Wellness": ["spas_wellness"]
};

// ==========================================
// 3. MAPPING: DB TAG -> DISPLAY NAME (Logic การแสดงผล)
// เมื่อเจอ tag ใน DB -> ให้แสดงผลเป็นคำว่าอะไร
// ==========================================
const DB_TAG_TO_DISPLAY: Record<string, string> = {
  "mountains_volcanoes": "Mountains",
  "national_parks": "National parks",
  "beaches_islands": "Islands",
  "waterfalls": "Lakes / Rivers", // หรือจะแยกเป็น "Waterfalls" ก็ได้ แต่ถ้าอยากให้ตรง Filter เป๊ะๆ ใช้ Lakes / Rivers
  "caves": "Nature & Outdoors",
  "lakes_rivers": "Lakes / Rivers",
  "hot_springs": "Hot Spring",
  "botanical_gardens": "Gardens",

  "temples_shrines": "Temples",
  "churches_mosques": "Church / Mosque",
  "ancient_ruins": "Ancient ruins",
  "palaces_castles": "Castles",
  "historic_old_towns": "Old towns",
  "museums": "Museums",
  "monuments": "Monuments",

  "viewpoints": "Viewpoints",
  "skyscrapers": "Skyscrapers",
  "bridges": "Bridges",
  "landmarks": "Landmarks",
  "city_squares": "City squares",

  "local_markets": "Markets",
  "floating_markets": "Markets",
  "night_markets": "Night Markets",
  "shopping_malls": "Shopping Malls",
  "flea_markets": "Flea market",
  "souvenir_shops": "Souvenir shops",

  "street_food": "Street food",
  "local_restaurants": "Local restaurants",
  "cafes": "Cafes",
  "famous_food_spots": "Famous food spots",

  "theme_parks": "Theme parks",
  "zoos_aquariums": "Zoos / Aquariums",
  "nightlife": "Nightlife",
  "spas_wellness": "Spas / Wellness"
};

interface SearchResult {
  type: 'province' | 'place' | 'district';
  name: string;
  subText?: string;
}

function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paramCountry = searchParams.get("country");
  const urlSearchQuery = searchParams.get("search") || "";
  const urlTag = searchParams.get("tag") || "";

  let currentCountry = paramCountry || "Thailand";

  // State
  const [attractions, setAttractions] = useState<Place[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (urlTag) setSelectedFilters(urlTag.split(","));
    else setSelectedFilters([]);
  }, [urlTag]);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCountry, searchQuery, selectedFilters]);

  // --- Main Fetch Logic ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch from Supabase (Get all by country/search first)
        const dbPlaces = await searchPlaces(searchQuery, currentCountry, []);
        let finalPlaces: Place[] = [];

        if (dbPlaces && dbPlaces.length > 0) {
          finalPlaces = dbPlaces;
        } else {
          // Fallback Mock Data
          let mockFiltered = MOCK_ATTRACTIONS.filter((p: any) => {
            const matchCountry = p.location?.country?.toLowerCase() === currentCountry.toLowerCase();
            const searchLower = searchQuery.toLowerCase();
            const district = p.district || p.location?.district || "";
            const matchSearch = searchQuery === "" ||
              p.name.toLowerCase().includes(searchLower) ||
              p.location?.province_state?.toLowerCase().includes(searchLower) ||
              district.toLowerCase().includes(searchLower);
            return matchCountry && matchSearch;
          });

          finalPlaces = mockFiltered.map((m: any) => ({
            ...m,
            id: String(m.id),
            province_state: m.location?.province_state || m.province_state,
            country: m.location?.country || m.country,
            district: m.district || m.location?.district || "",
            continent: m.location?.continent || m.continent
          })) as unknown as Place[];
        }

        // 2. ✅✅✅ Strict Filtering (Tag Matching)
        // ตรวจสอบจาก category_tags เท่านั้น โดยเทียบกับ Mapping
        if (selectedFilters.length > 0) {
          finalPlaces = finalPlaces.filter(p => {
            const placeTags = p.category_tags || [];

            // วนลูป Filter ที่ user เลือก (ต้องตรงอย่างน้อย 1 อัน)
            return selectedFilters.some(filterName => {
              // หาว่า Filter Name นี้ สัมพันธ์กับ Tags อะไรใน DB บ้าง
              const validDbTags = UI_FILTER_TO_DB_TAGS[filterName] || [];

              // เช็คว่าสถานที่นี้ มี Tag ที่ตรงกับ validDbTags ไหม (แบบ Exact Match)
              return placeTags.some(tag => validDbTags.includes(tag));
            });
          });
        }

        // 3. Sorting
        if (searchQuery) {
          finalPlaces = finalPlaces.sort((a, b) => {
            const scoreA = calculateRelevanceScore({ ...a, province_state: a.province_state, district: (a as any).district }, searchQuery);
            const scoreB = calculateRelevanceScore({ ...b, province_state: b.province_state, district: (b as any).district }, searchQuery);
            if (scoreB !== scoreA) return scoreB - scoreA;
            return (b.rating || 0) - (a.rating || 0);
          });
        } else {
          finalPlaces = finalPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        }

        setAttractions(finalPlaces);
      } catch (error) {
        console.error("Error fetching places:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [currentCountry, searchQuery, selectedFilters]);

  // Hero Slides
  const heroSlides = attractions.slice(0, 8);
  const displaySlides = heroSlides.length > 0 ? heroSlides : [];
  const currentContinent = attractions[0]?.continent || "Asia";
  const totalPages = Math.ceil(attractions.length / ITEMS_PER_PAGE);
  const paginatedItems = attractions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const updateUrlParams = (newFilters: string[]) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilters.length > 0) params.set("tag", newFilters.join(","));
    else params.delete("tag");
    if (!params.has("country")) params.set("country", currentCountry);
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (item: string) => {
    let newFilters = selectedFilters.includes(item) ? selectedFilters.filter((f) => f !== item) : [...selectedFilters, item];
    setSelectedFilters(newFilters);
    updateUrlParams(newFilters);
  };
  const clearAllFilters = () => { setSelectedFilters([]); updateUrlParams([]); };

  // Search Suggestion
  useEffect(() => {
    if (!searchQuery?.trim()) {
      setSearchResults([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const tempProvinces: SearchResult[] = [];
    const tempDistricts: SearchResult[] = [];
    const tempPlaces: SearchResult[] = [];
    const addedKeys = new Set();

    attractions.forEach((place: any) => {
      const province = place.province_state || place.location?.province_state || "";
      const country = place.country || place.location?.country || "";

      if (province.toLowerCase().startsWith(lowerQuery) && !addedKeys.has(`province-${province}`)) {
        tempProvinces.push({ type: 'province', name: province, subText: country });
        addedKeys.add(`province-${province}`);
      }

      const district = place.district || place.location?.district || "";
      if (district && district.toLowerCase().startsWith(lowerQuery) && !addedKeys.has(`district-${district}`)) {
        tempDistricts.push({ type: 'district', name: district, subText: province });
        addedKeys.add(`district-${district}`);
      }

      if (place.name.toLowerCase().startsWith(lowerQuery)) {
        const sub = district ? `${district}, ${province}` : province;
        tempPlaces.push({ type: 'place', name: place.name, subText: sub });
      }
    });
    setSearchResults([...tempProvinces, ...tempDistricts, ...tempPlaces].slice(0, 6));
  }, [searchQuery, attractions]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20" onClick={() => setShowDropdown(false)}>

      <style jsx global>{`
  /* 1. จัดการ Container ให้ลูกๆ อยู่กึ่งกลางเสมอ */
  .custom-pagination-container {
    display: flex !important;
    align-items: center !important;    /* จัดกึ่งกลางแนวตั้ง */
    justify-content: center !important; /* จัดกึ่งกลางแนวนอน */
    height: 12px !important;            /* กำหนดความสูงคงที่เพื่อไม่ให้แถวขยับ */
  }

  /* 2. สไตล์ของจุดปกติ */
  .custom-pagination-container .swiper-pagination-bullet {
    width: 4px !important;
    height: 4px !important;
    background-color: #deecf9 !important;
    border: 1px solid #c2dcf3 !important;
    opacity: 1 !important;
    margin: 0 4px !important;
    transition: all 0.3s ease-in-out !important;
    border-radius: 50% !important;
    flex-shrink: 0 !important;          /* ป้องกันจุดโดนบีบเบี้ยว */
  }

  /* 3. สไตล์ของจุดเมื่อ Active (ขยายจากกลาง) */
  .custom-pagination-container .swiper-pagination-bullet-active {
    width: 8px !important;
    height: 8px !important;
    background-color: #041830 !important;
    border: 1px solid #c2dcf3 !important;
    /* การขยายจะดูนุ่มนวลและออกจากศูนย์กลางเพราะ align-items: center ของตัวแม่ */
  }
`}</style>

      <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span> /
          <span className="hover:underline cursor-pointer" >{currentContinent}</span> /
          <span className="text-[#101828] hover:underline cursor-pointer">{currentCountry}</span>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="w-full h-[414px] bg-[#DEECF9]">
        <div className="w-full max-w-[1440px] h-[414px] mx-auto bg-[#DEECF9] flex justify-center">
          {isLoading ? (
            <div className="w-full h-[414px] flex items-center justify-center text-gray-500">Loading...</div>
          ) : displaySlides.length === 0 ? (
            <div className="w-full h-[414px] flex items-center justify-center text-gray-500">No attractions found</div>
          ) : (
            <div className="w-full h-[445px] flex flex-col gap-[16px] px-[156px]">
              <div className="relative w-full h-[413px] bg-black overflow-hidden group flex-shrink-0 shadow-sm">
                <Swiper
                  key={currentCountry}
                  modules={[Navigation, A11y, Autoplay]}
                  spaceBetween={0} slidesPerView={1} loop={displaySlides.length > 1} autoplay={{ delay: 5000 }}
                  navigation={{ prevEl: '.custom-prev-button', nextEl: '.custom-next-button' }}
                  className="w-full h-full"
                  onSlideChange={(swiper) => {
                    const realIndex = swiper.realIndex;
                    setCurrentSlide(realIndex);
                    const bullets = document.querySelectorAll('.custom-pagination-bullet');
                    bullets.forEach((bullet, index) => {
                      bullet.classList.remove('bg-[#E0E0E0]', 'bg-[#121212]', 'w-[16px]', 'h-[16px]', 'w-[8px]', 'h-[8px]', 'border', 'border-[4px]', 'border-[#EEEEEE]', 'border-[#E0E0E0]');
                      bullet.classList.add('rounded-full', 'transition-all', 'duration-300');
                      if (index === realIndex) { bullet.classList.add('w-[16px]', 'h-[16px]', 'bg-[#121212]', 'border-[4px]', 'border-[#E0E0E0]'); }
                      else { bullet.classList.add('w-[16px]', 'h-[16px]', 'bg-[#E0E0E0]', 'border', 'border-[#EEEEEE]'); }
                    });
                  }}
                >
                  {displaySlides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative w-full h-full">
                      <img src={Array.isArray(slide.images) && typeof slide.images[0] === 'object' && 'url' in slide.images[0] ? (slide.images[0] as any).url : (slide.images?.[0] || "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=1600&auto=format&fit=crop")} className="w-full h-full object-cover" alt={slide.name} />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                      <div className="absolute bottom-0 left-0 z-40 h-[79px] flex flex-col justify-center gap-[9px] bg-[#3C3C4399] text-white p-4 rounded-tr-[8px] rounded-br-[8px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className=" h-[47px] flex flex-col justify-center gap-[8px]">
                          <h2 onClick={(e) => { e.stopPropagation(); router.push(`/detail?id=${slide.id}`); }} className="text-[18px] font-Inter font-[700] leading-tight drop-shadow-md truncate max-w-[300px] cursor-pointer hover:underline hover:text-[#DEECF9]">{slide.name}</h2>
                          <div className="flex items-center gap-2 text-[14px] font-Inter font-[600] opacity-90"><MapPin className="w-4 h-4 flex-shrink-0" /><span className="truncate">{slide.province_state}, {slide.country}</span></div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
                  <button className="custom-prev-button absolute left-4 top-1/2 -translate-y-1/2 z-30 w-[48px] h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer"><ArrowLeft className="w-[30px] h-[30px]" /></button>
                  <button className="custom-next-button absolute right-4 top-1/2 -translate-y-1/2 z-30 w-[48px] h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer"><ArrowRight className="w-[30px] h-[30px]" /></button>
                </Swiper>
              </div>
              <div className="w-[184px] h-[16px] flex justify-center items-center gap-[8px] flex-shrink-0 mx-auto">
                {displaySlides.map((_, index) => (<div key={index} className={`custom-pagination-bullet rounded-full transition-all duration-300 cursor-pointer box-border ${index === 0 ? 'w-[16px] h-[16px] bg-[#121212] border-[4px] border-[#E0E0E0]' : 'w-[16px] h-[16px] bg-[#E0E0E0] border border-[#EEEEEE]'}`}></div>))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mt-16">
        <div id="search-section" className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#194473]">Attractions in {currentCountry}</h1>
          <div className="relative" ref={searchContainerRef}>
            <div className="flex items-center w-[268px] h-[31px] gap-[8px] px-[8px] py-[4px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] shadow-sm transition"><Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" /><div className="flex items-center w-[220px] h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px]"><input type="text" placeholder="Search" className="w-full h-full bg-transparent border-none outline-none text-[12px] font-inter font-[400] text-[#9E9E9E] leading-none placeholder-[#9E9E9E]" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} onClick={(e) => e.stopPropagation()} /></div></div>
            {showDropdown && searchQuery && searchResults.length > 0 && (
              <div className="absolute top-[36px] left-0 w-[268px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {searchResults.map((result, idx) => (
                  <div key={idx} onClick={(e) => { e.stopPropagation(); setSearchQuery(result.name); setShowDropdown(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none">
                    <div className="text-gray-400">
                      {result.type === 'province' ? <Map size={14} /> :
                        result.type === 'district' ? <Building2 size={14} /> :
                          <MapPin size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-gray-800 line-clamp-1">{result.name}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{result.type === 'province' ? result.subText : (result.type === 'district' ? `${result.subText} (District)` : result.type)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="w-[266px] h-fit bg-[#F5F5F5] p-[16px] rounded-[16px] flex flex-col gap-[10px] border border-[#EEEEEE]">
              <div className="w-full h-[24px] mb-[12px] flex items-center justify-center flex-shrink-0"><h3 className="font-Inter font-[700] text-[20px] leading-[100%] tracking-[0] text-center text-[#212121]">Filters</h3></div>
              {selectedFilters.length > 0 && (<div className="flex flex-col gap-3 mb-4 border-b border-gray-300 pb-4"><div className="flex justify-between items-center"><h4 className="font-Inter font-[700] text-[16px] leading-[100%] text-[#041830]">Your filters</h4><button onClick={clearAllFilters} className="text-[12px] text-gray-500 hover:text-[#3A82CE] hover:underline">Clear</button></div><div className="flex flex-col gap-2">{selectedFilters.map((filter) => (<button key={`selected-${filter}`} onClick={() => toggleFilter(filter)} className="w-full text-left flex items-center gap-[8px] group cursor-pointer"><div className="w-[16px] h-[16px] rounded-full bg-[#3A82CE] flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" strokeWidth={4} /></div><span className="font-Inter font-[700] text-[12px] leading-[100%] text-[#3A82CE] truncate">{filter}</span></button>))}</div></div>)}
              <div className="w-full flex flex-col gap-[24px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar max-h-[600px]"><div className="flex flex-col gap-[24px]">{FILTER_GROUPS.map((group, idx) => (<div key={idx} className="flex flex-col gap-[8px]"><h5 className="font-Inter font-[700] text-[16px] leading-[100%] text-[#212121] text-center">{group.title}</h5><div className="flex flex-col gap-[8px]">{group.items.map((item) => { const isSelected = selectedFilters.includes(item); return (<button key={item} onClick={() => toggleFilter(item)} className="w-full text-left flex items-center gap-[8px] group cursor-pointer"><div className={`w-[16px] h-[16px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-[#3A82CE]" : "bg-[#E0E0E0] group-hover:bg-[#d0d0d0]"}`}>{isSelected && <Check size={10} className="text-white" strokeWidth={4} />}</div><span className={`font-Inter font-[700] text-[12px] leading-[100%] transition-colors truncate ${isSelected ? "text-[#212121]" : "text-[#757575] group-hover:text-[#212121]"}`}>{item}</span></button>); })}</div></div>))}</div></div>
            </div>
          </div>

          {/* GRID */}
          <div className="w-[840px] mx-auto">
            {isLoading ? (<div className="w-full h-96 flex items-center justify-center text-gray-400">Loading attractions...</div>) : paginatedItems.length === 0 ? (<div className="w-full h-96 flex items-center justify-center text-gray-400">No places found.</div>) : (
              <div className="grid grid-cols-3 gap-[24px] mb-10">
                {paginatedItems.map((place) => {
                  const rawTags = place.category_tags || [];
                  const displayCategories: string[] = [];

                  // ✅ Logic การแสดงผลใหม่ (Lookup from Map)
                  rawTags.forEach(tag => {
                    if (DB_TAG_TO_DISPLAY[tag]) {
                      displayCategories.push(DB_TAG_TO_DISPLAY[tag]);
                    } else {
                      // Fallback: ถ้าไม่มีใน Map ให้แสดง Tag เดิม (แทน _ ด้วย space)
                      displayCategories.push(tag.replace(/_/g, " "));
                    }
                  });

                  // ลบคำซ้ำ (Unique) + ตัดให้เหลือ 3 อันแรก + คั่นด้วย comma
                  const uniqueDisplay = Array.from(new Set(displayCategories));
                  const displayString = uniqueDisplay.length > 0 ? uniqueDisplay.slice(0, 3).join(", ") : "Attraction";

                  return (
                    <div key={place.id} className="w-[264px] h-[426px] flex flex-col gap-[8px] cursor-pointer group select-none" onClick={() => router.push(`/detail?id=${place.id}`)}>
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="relative w-[264px] h-[331px] rounded-[16px] overflow-hidden shadow-sm bg-gray-100 group/slider">
                          <Swiper modules={[Navigation, Pagination, A11y]} spaceBetween={0} slidesPerView={1} loop={true} navigation={{ prevEl: `.prev-btn-${place.id}`, nextEl: `.next-btn-${place.id}` }} pagination={{ clickable: true, el: `.pagination-custom-${place.id}` }} className="w-full h-full relative">
                            {(Array.isArray(place.images) && place.images.length > 0 ? place.images : []).map((img, idx) => (<SwiperSlide key={idx} className="overflow-hidden rounded-[16px]"><img src={(typeof img === 'object' && 'url' in img) ? (img as any).url : img} className="w-full h-full object-cover rounded-[16px]" alt={`${place.name} ${idx + 1}`} /></SwiperSlide>))}
                            {(!place.images || place.images.length === 0) && (<SwiperSlide><div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div></SwiperSlide>)}
                            <button onClick={(e) => e.stopPropagation()} className={`prev-btn-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white`}><ArrowLeft className="w-[14px] h-[14px]" /></button>
                            <button onClick={(e) => e.stopPropagation()} className={`next-btn-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white`}><ArrowRight className="w-[14px] h-[14px]" /></button>
                            <div className={`pagination-custom-${place.id} custom-pagination-container absolute bottom-3 left-0 w-full flex justify-center gap-1 z-20 !pointer-events-none`}></div>
                          </Swiper>

                          <div className="absolute top-2 right-2 z-20"><button onClick={(e) => { e.stopPropagation(); console.log(`Add ${place.name} to trip`); }} className="flex h-[24px] w-[32px] group-hover:w-[60px] items-center justify-center rounded-[8px] border border-white bg-[#00000066] group-hover:bg-[#1565C0] text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px]"><Icon path={mdiPlus} size="16px" className="flex-shrink-0" /><span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">Add</span></button></div>
                        </div>
                        <div className="w-full h-[87px] flex flex-col gap-[4px] min-w-0">
                          <h4 className="text-[20px] font-inter font-normal text-[#212121] leading-none w-full"><span className="inline-block max-w-full truncate border-b border-transparent group-hover:border-[#212121] pb-[1px] transition-colors duration-200 align-bottom">{place.name}</span></h4>
                          <p className="flex items-center gap-1 text-[14px] font-inter font-normal text-[#9E9E9E] w-full">
                            {/* shrink-0 ป้องกันไอคอนเบี้ยวเวลามี text ยาวๆ */}
                            <MapPin className="w-4 h-4 shrink-0" />

                            {/* truncate ย้ายมาตรงนี้เพื่อให้ตัดคำเฉพาะ Text */}
                            <span className="truncate leading-none">
                              {place.province_state}, {place.country}
                            </span>
                          </p>
                          <div className="flex items-center gap-[4px]">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-[12px] h-[12px] ${star <= Math.round(place.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />))}<span className="text-xs font-medium text-[#9E9E9E] ml-1">({place.rating})</span></div>
                          <p className="text-[14px] font-inter font-semibold text-[#212121] truncate leading-none w-full">{displayString}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-[8px] mb-10">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-[#757575]"><ChevronLeft size={16} className="text-white" /></button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (<button key={page} onClick={() => setCurrentPage(page)} className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors ${currentPage === page ? "bg-[#194473] text-white" : "bg-[#9E9E9E] text-white hover:bg-gray-400"}`}>{page}</button>))}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-[#757575]"><ChevronRight size={20} className="text-white" /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return <Suspense fallback={<div>Loading...</div>}><ExploreContent /></Suspense>;
}