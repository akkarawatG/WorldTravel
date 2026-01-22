"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MapPin, ArrowLeft, ArrowRight, Map, Star, Check, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

// ✅ Import Supabase Client (ปรับ path ให้ตรงกับโปรเจคของคุณ)
import { createClient } from '@/utils/supabase/client';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Place } from '@/types/place';
import { calculateRelevanceScore } from '@/services/placeService';

// --- CONFIGURATION ---
const ITEMS_PER_PAGE = 6;
const FESTIVALS_PER_PAGE = 3;

// ... (KEEP CONSTANTS & MAPPINGS UNCHANGED) ...
const FILTER_GROUPS = [
  { title: "Nature & Outdoors", items: ["Mountains", "National parks", "Islands", "Lakes / Rivers", "Hot Spring", "Gardens"] },
  { title: "History & Culture", items: ["Temples", "Church / Mosque", "Ancient ruins", "Castles", "Old towns", "Museums", "Monuments"] },
  { title: "Landmarks & Views", items: ["Viewpoints", "Skyscrapers", "Bridges", "Landmarks", "City squares"] },
  { title: "Shopping & Lifestyle", items: ["Markets", "Night Markets", "Shopping Malls", "Flea market", "Souvenir shops"] },
  { title: "Food & Dining", items: ["Street food", "Local restaurants", "Cafes", "Famous food spots"] },
  { title: "Entertainment", items: ["Theme parks", "Zoos / Aquariums", "Nightlife", "Spas / Wellness"] }
];

const UI_FILTER_TO_DB_TAGS: Record<string, string[]> = {
  "Mountains": ["mountains_volcanoes"], "National parks": ["national_parks"], "Islands": ["beaches_islands"],
  "Lakes / Rivers": ["lakes_rivers", "waterfalls", "caves"], "Hot Spring": ["hot_springs"], "Gardens": ["botanical_gardens"],
  "Temples": ["temples_shrines"], "Church / Mosque": ["churches_mosques"], "Ancient ruins": ["ancient_ruins"],
  "Castles": ["palaces_castles"], "Old towns": ["historic_old_towns"], "Museums": ["museums"], "Monuments": ["monuments"],
  "Viewpoints": ["viewpoints"], "Skyscrapers": ["skyscrapers"], "Bridges": ["bridges"], "Landmarks": ["landmarks"],
  "City squares": ["city_squares"], "Markets": ["local_markets", "floating_markets"], "Night Markets": ["night_markets"],
  "Shopping Malls": ["shopping_malls"], "Flea market": ["flea_markets"], "Souvenir shops": ["souvenir_shops"],
  "Street food": ["street_food"], "Local restaurants": ["local_restaurants"], "Cafes": ["cafes"],
  "Famous food spots": ["famous_food_spots"], "Theme parks": ["theme_parks"], "Zoos / Aquariums": ["zoos_aquariums"],
  "Nightlife": ["nightlife"], "Spas / Wellness": ["spas_wellness"]
};

const DB_TAG_TO_DISPLAY: Record<string, string> = {
  "mountains_volcanoes": "Mountains", "national_parks": "National parks", "beaches_islands": "Islands",
  "waterfalls": "Lakes / Rivers", "caves": "Nature & Outdoors", "lakes_rivers": "Lakes / Rivers",
  "hot_springs": "Hot Spring", "botanical_gardens": "Gardens", "temples_shrines": "Temples",
  "churches_mosques": "Church / Mosque", "ancient_ruins": "Ancient ruins", "palaces_castles": "Castles",
  "historic_old_towns": "Old towns", "museums": "Museums", "monuments": "Monuments",
  "viewpoints": "Viewpoints", "skyscrapers": "Skyscrapers", "bridges": "Bridges", "landmarks": "Landmarks",
  "city_squares": "City squares", "local_markets": "Markets", "floating_markets": "Markets",
  "night_markets": "Night Markets", "shopping_malls": "Shopping Malls", "flea_markets": "Flea market",
  "souvenir_shops": "Souvenir shops", "street_food": "Street food", "local_restaurants": "Local restaurants",
  "cafes": "Cafes", "famous_food_spots": "Famous food spots", "theme_parks": "Theme parks",
  "zoos_aquariums": "Zoos / Aquariums", "nightlife": "Nightlife", "spas_wellness": "Spas / Wellness"
};

const MONTHS = [
  "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
  "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
];

const MONTH_FULL_NAMES: Record<string, string> = {
  "JAN": "January", "FEB": "February", "MAR": "March", "APR": "April", "MAY": "May", "JUN": "June",
  "JUL": "July", "AUG": "August", "SEP": "September", "OCT": "October", "NOV": "November", "DEC": "December",
  "ALL": "All Year"
};

const getDisplayCategories = (tags: string[] = []) => {
  const displayCategories: string[] = [];
  tags.forEach(tag => {
    if (DB_TAG_TO_DISPLAY[tag]) {
      displayCategories.push(DB_TAG_TO_DISPLAY[tag]);
    } else {
      displayCategories.push(tag.replace(/_/g, " "));
    }
  });
  return Array.from(new Set(displayCategories));
};

// ✅ Helper function to extract image from Supabase JSON response
const getFestivalImageUrl = (images: any): string => {
  if (Array.isArray(images) && images.length > 0) {
    // Check if it's an object with url property or a direct string
    return (typeof images[0] === 'object' && images[0] !== null && 'url' in images[0])
      ? images[0].url
      : images[0];
  }
  return "https://placehold.co/600x400?text=No+Image"; // Default placeholder
};

interface ExploreClientProps {
  initialPlaces: Place[];
  searchParams: { [key: string]: string | string[] | undefined };
}

interface SearchResult {
  type: 'province' | 'place' | 'district';
  name: string;
  subText?: string;
}

export default function ExploreClient({ initialPlaces, searchParams }: ExploreClientProps) {
  const router = useRouter();
  const supabase = createClient(); // ✅ Init Supabase Client

  // Params
  const paramCountry = typeof searchParams.country === 'string' ? searchParams.country : "Thailand";
  const urlSearchQuery = typeof searchParams.search === 'string' ? searchParams.search : "";
  const urlTag = typeof searchParams.tag === 'string' ? searchParams.tag : "";

  // State
  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(initialPlaces);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Festival State: Real Data
  const [dbFestivals, setDbFestivals] = useState<any[]>([]); // Store fetched festivals
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [festivalPage, setFestivalPage] = useState(1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // --- Fetch Festivals from Supabase ---
  useEffect(() => {
    const fetchFestivals = async () => {
      // ดึงข้อมูล Festivals ตามประเทศ
      const { data, error } = await supabase
        .from('festivals')
        .select('*')
        .eq('country', paramCountry); // กรองตามประเทศก่อน

      if (error) {
        console.error('Error fetching festivals:', error);
      } else if (data) {
        setDbFestivals(data);
      }
    };

    fetchFestivals();
  }, [paramCountry]);

  // --- Sync State & Logic ---
  useEffect(() => { if (urlTag) setSelectedFilters(urlTag.split(",")); else setSelectedFilters([]); }, [urlTag]);
  useEffect(() => { setSearchQuery(urlSearchQuery); }, [urlSearchQuery]);

  useEffect(() => {
    let result = [...initialPlaces];
    if (selectedFilters.length > 0) {
      result = result.filter(p => {
        const placeTags = p.category_tags || [];
        return selectedFilters.some(filterName => {
          const validDbTags = UI_FILTER_TO_DB_TAGS[filterName] || [];
          return placeTags.some(tag => validDbTags.includes(tag));
        });
      });
    }
    if (searchQuery) {
      result = result.sort((a, b) => {
        const scoreA = calculateRelevanceScore({ ...a, province_state: a.province_state, district: (a as any).district }, searchQuery);
        const scoreB = calculateRelevanceScore({ ...b, province_state: b.province_state, district: (b as any).district }, searchQuery);
        if (scoreB !== scoreA) return scoreB - scoreA;
        return (b.rating || 0) - (a.rating || 0);
      });
    } else {
      result = result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    setFilteredPlaces(result);
    setCurrentPage(1);
  }, [initialPlaces, selectedFilters, searchQuery]);

  const totalPages = Math.ceil(filteredPlaces.length / ITEMS_PER_PAGE);
  const paginatedItems = filteredPlaces.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ✅ Festival Logic: Filter & Paginate from Real DB Data
  const filteredFestivals = dbFestivals.filter((festival) => {
    if (selectedMonth === "ALL") return true;

    // Logic 1: Filter by period_str (Text matching)
    const monthName = MONTH_FULL_NAMES[selectedMonth];
    const isPeriodMatch = festival.period_str?.toLowerCase().includes(monthName.toLowerCase());

    // Logic 2: Filter by month_index (Database Column) - Optional if your DB has consistent month_index
    // const targetMonthIndex = MONTHS.indexOf(selectedMonth) + 1; // 1-12
    // const isIndexMatch = festival.month_index === targetMonthIndex;

    return isPeriodMatch; // Using Text Match to be safe with existing data format
  });

  const totalFestivalPages = Math.ceil(filteredFestivals.length / FESTIVALS_PER_PAGE);
  const currentFestivals = filteredFestivals.slice(
    (festivalPage - 1) * FESTIVALS_PER_PAGE,
    festivalPage * FESTIVALS_PER_PAGE
  );

  useEffect(() => { setFestivalPage(1); }, [selectedMonth]);

  // ... (Other Handlers: updateUrlParams, toggleFilter, clearAllFilters, etc. UNCHANGED) ...
  const updateUrlParams = (newFilters: string[]) => {
    const params = new URLSearchParams();
    if (newFilters.length > 0) params.set("tag", newFilters.join(","));
    if (paramCountry) params.set("country", paramCountry);
    if (searchQuery) params.set("search", searchQuery);
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  const toggleFilter = (item: string) => {
    let newFilters = selectedFilters.includes(item) ? selectedFilters.filter((f) => f !== item) : [...selectedFilters, item];
    setSelectedFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const clearAllFilters = () => { setSelectedFilters([]); updateUrlParams([]); };
  const handleSearchSubmit = (value: string) => {
    const params = new URLSearchParams();
    if (selectedFilters.length > 0) params.set("tag", selectedFilters.join(","));
    if (paramCountry) params.set("country", paramCountry);
    if (value) params.set("search", value);
    router.push(`/explore?${params.toString()}`);
    setShowDropdown(false);
  };

  const getPaginationGroup = () => {
    let start = Math.floor((currentPage - 1) / 5) * 5;
    return new Array(Math.min(5, totalPages - start)).fill(0).map((_, i) => start + i + 1);
  };

  useEffect(() => {
    if (!searchQuery?.trim()) { setSearchResults([]); return; }
    const lowerQuery = searchQuery.toLowerCase();
    const tempProvinces: SearchResult[] = [];
    const tempPlaces: SearchResult[] = [];
    const addedKeys = new Set();
    initialPlaces.forEach((place: any) => {
      const province = place.province_state || "";
      if (province.toLowerCase().startsWith(lowerQuery) && !addedKeys.has(`p-${province}`)) {
        tempProvinces.push({ type: 'province', name: province, subText: place.country });
        addedKeys.add(`p-${province}`);
      }
      if (place.name.toLowerCase().startsWith(lowerQuery)) {
        tempPlaces.push({ type: 'place', name: place.name, subText: province });
      }
    });
    setSearchResults([...tempProvinces, ...tempPlaces].slice(0, 6));
  }, [searchQuery, initialPlaces]);

  const heroSlides = filteredPlaces.slice(0, 8);
  const displaySlides = heroSlides.length > 0 ? heroSlides : [];
  const currentContinent = filteredPlaces[0]?.continent || "Asia";

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20" onClick={() => setShowDropdown(false)}>

      <style jsx global>{`
        .custom-pagination-container { display: flex !important; align-items: center !important; justify-content: center !important; height: 12px !important; }
        .custom-pagination-container .swiper-pagination-bullet { width: 4px !important; height: 4px !important; background-color: #deecf9 !important; border: 1px solid #c2dcf3 !important; opacity: 1 !important; margin: 0 4px !important; transition: all 0.3s ease-in-out !important; border-radius: 50% !important; flex-shrink: 0 !important; }
        .custom-pagination-container .swiper-pagination-bullet-active { width: 8px !important; height: 8px !important; background-color: #041830 !important; border: 1px solid #c2dcf3 !important; }
        
        .festival-nav-btn {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
            width: 48px;
            height: 48px;
            background-color: #3A82CE66; 
            border: 1px solid #95C3EA;
            border-radius: 30px;
            padding: 9px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            color: #ffffff;
            box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
            cursor: pointer;
            transition: all 0.2s ease-in-out;
        }
        .festival-nav-btn:hover { background-color: #3A82CE; }
        .festival-nav-btn:active { transform: translateY(-50%) scale(0.95); }
        .festival-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; }
      `}</style>

      {/* Breadcrumb */}
      <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span> /
          <span
            className="hover:underline cursor-pointer" // เพิ่มสีให้รู้ว่ากดได้ (option)
            onClick={() => router.push(`/countries?continent=${currentContinent}`)}
          >
            {currentContinent}
          </span> /
          <span className="text-[#101828] hover:underline cursor-pointer">{paramCountry}</span>
        </div>
      </div>

      {/* HERO SLIDER (Unchanged) */}
      <div className="w-full h-[414px] bg-[#DEECF9]">
        <div className="w-full max-w-[1440px] h-[414px] mx-auto bg-[#DEECF9] flex justify-center">
          {displaySlides.length === 0 ? (
            <div className="w-full h-[414px] flex items-center justify-center text-gray-500">No attractions found</div>
          ) : (
            <div className="w-full h-[445px] flex flex-col gap-[16px] px-[156px]">
              <div className="relative w-full h-[413px] bg-black overflow-hidden group flex-shrink-0 shadow-sm">
                <Swiper
                  key={paramCountry}
                  modules={[Navigation, A11y, Autoplay]}
                  spaceBetween={0} slidesPerView={1} loop={displaySlides.length > 1} autoplay={{ delay: 5000 }}
                  navigation={{ prevEl: '.custom-prev-button', nextEl: '.custom-next-button' }}
                  className="w-full h-full"
                  onSlideChange={(swiper) => {
                    const realIndex = swiper.realIndex;
                    const bullets = document.querySelectorAll('.custom-pagination-bullet');
                    bullets.forEach((bullet, index) => {
                      bullet.classList.remove('bg-[#121212]', 'border-[4px]', 'border-[#E0E0E0]');
                      bullet.classList.add('bg-[#E0E0E0]', 'border', 'border-[#EEEEEE]');
                      if (index === realIndex) {
                        bullet.classList.remove('bg-[#E0E0E0]', 'border', 'border-[#EEEEEE]');
                        bullet.classList.add('bg-[#121212]', 'border-[4px]', 'border-[#E0E0E0]');
                      }
                    });
                  }}
                >
                  {displaySlides.map((slide, index) => {
                    const imgUrl = Array.isArray(slide.images) && typeof slide.images[0] === 'object' && 'url' in slide.images[0] ? (slide.images[0] as any).url : (slide.images?.[0] || "https://placehold.co/800x400?text=No+Image");
                    const isRisky = !imgUrl.includes('supabase.co') && !imgUrl.includes('unsplash.com');
                    return (
                      <SwiperSlide key={slide.id} className="relative w-full h-full">
                        <Image src={imgUrl} alt={slide.name} fill priority={index === 0} className="object-cover" sizes="100vw" unoptimized={isRisky} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                        <div className="absolute bottom-0 left-0 z-40 h-[79px] flex flex-col justify-center gap-[9px] bg-[#3C3C4399] text-white p-4 rounded-tr-[8px] rounded-br-[8px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                          <div className=" h-[47px] flex flex-col justify-center gap-[8px]">
                            <h2 onClick={(e) => { e.stopPropagation(); router.push(`/detail?id=${slide.id}`); }} className="text-[18px] font-Inter font-[700] leading-tight drop-shadow-md truncate max-w-[300px] cursor-pointer hover:underline hover:text-[#DEECF9]">{slide.name}</h2>
                            <div className="flex items-center gap-2 text-[14px] font-Inter font-[600] opacity-90"><MapPin className="w-4 h-4 flex-shrink-0" /><span className="truncate">{slide.province_state}, {slide.country}</span></div>
                          </div>
                        </div>
                      </SwiperSlide>
                    )
                  })}
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#194473]">Attractions in {paramCountry}</h1>
          <div className="relative" ref={searchContainerRef}>
            <div className="flex items-center w-[268px] h-[31px] gap-[8px] px-[8px] py-[4px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] shadow-sm transition">
              <Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" />
              <div className="flex items-center w-[220px] h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px]">
                <input type="text" placeholder="Search" className="w-full h-full bg-transparent border-none outline-none text-[12px] font-inter font-[400] text-[#9E9E9E] leading-none placeholder-[#9E9E9E]"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(searchQuery); }}
                  onFocus={() => setShowDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {showDropdown && searchQuery && searchResults.length > 0 && (
              <div className="absolute top-[36px] left-0 w-[268px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {searchResults.map((result, idx) => (
                  <div key={idx} onClick={(e) => { e.stopPropagation(); setSearchQuery(result.name); handleSearchSubmit(result.name); setShowDropdown(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none">
                    <div className="text-gray-400">
                      {result.type === 'province' ? <Map size={14} /> : <MapPin size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-gray-800 line-clamp-1">{result.name}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{result.subText}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* SIDEBAR FILTER (Unchanged) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="w-[266px] h-fit bg-[#F5F5F5] p-[16px] rounded-[16px] flex flex-col gap-[10px] border border-[#EEEEEE]">
              <div className="w-full h-[24px] mb-[12px] flex items-center justify-center flex-shrink-0"><h3 className="font-Inter font-[700] text-[20px] leading-[100%] tracking-[0] text-center text-[#212121]">Filters</h3></div>
              {selectedFilters.length > 0 && (
                <div className="flex flex-col gap-3 mb-4 border-b border-gray-300 pb-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-Inter font-[700] text-[16px] leading-[100%] text-[#041830]">Your filters</h4>
                    <button onClick={clearAllFilters} className="text-[12px] text-gray-500 hover:text-[#3A82CE] hover:underline">Clear</button>
                  </div>
                  <div className="flex flex-col gap-2">
                    {selectedFilters.map((filter) => (
                      <button key={`selected-${filter}`} onClick={() => toggleFilter(filter)} className="w-full text-left flex items-center gap-[8px] group cursor-pointer">
                        <div className="w-[16px] h-[16px] rounded-full bg-[#3A82CE] flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" strokeWidth={4} /></div>
                        <span className="font-Inter font-[700] text-[12px] leading-[100%] text-[#3A82CE] truncate">{filter}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="w-full flex flex-col gap-[24px] overflow-y-auto overflow-x-hidden pr-1 custom-scrollbar max-h-[600px]">
                <div className="flex flex-col gap-[24px]">
                  {FILTER_GROUPS.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-[8px]">
                      <h5 className="font-Inter font-[700] text-[16px] leading-[100%] text-[#212121] text-center">{group.title}</h5>
                      <div className="flex flex-col gap-[8px]">
                        {group.items.map((item) => {
                          const isSelected = selectedFilters.includes(item);
                          return (
                            <button key={item} onClick={() => toggleFilter(item)} className="w-full text-left flex items-center gap-[8px] group cursor-pointer">
                              <div className={`w-[16px] h-[16px] rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-[#3A82CE]" : "bg-[#E0E0E0] group-hover:bg-[#d0d0d0]"}`}>{isSelected && <Check size={10} className="text-white" strokeWidth={4} />}</div>
                              <span className={`font-Inter font-[700] text-[12px] leading-[100%] transition-colors truncate ${isSelected ? "text-[#212121]" : "text-[#757575] group-hover:text-[#212121]"}`}>{item}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* GRID CONTENT (ATTRACTIONS) */}
          <div className="w-[840px] mx-auto flex flex-col justify-between min-h-[950px]">
            {paginatedItems.length === 0 ? (<div className="w-full h-96 flex items-center justify-center text-gray-400">No places found.</div>) : (
              <div className="grid grid-cols-3 gap-[24px]">
                {paginatedItems.map((place) => {
                  const displayCategories = getDisplayCategories(place.category_tags);
                  const displayString = displayCategories.length > 0 ? displayCategories.slice(0, 3).join(", ") : "Attraction";
                  return (
                    <div key={place.id} className="w-[264px] h-[426px] flex flex-col gap-[8px] cursor-pointer group select-none" onClick={() => router.push(`/detail?id=${place.id}`)}>
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="relative w-[264px] h-[331px] rounded-[16px] overflow-hidden shadow-sm bg-gray-100 group/slider">
                          <Swiper modules={[Navigation, Pagination, A11y]} spaceBetween={0} slidesPerView={1} loop={true} navigation={{ prevEl: `.prev-btn-${place.id}`, nextEl: `.next-btn-${place.id}` }} pagination={{ clickable: true, el: `.pagination-custom-${place.id}` }} className="w-full h-full relative">
                            {(Array.isArray(place.images) && place.images.length > 0 ? place.images : []).map((img, idx) => {
                              const imgUrl = (typeof img === 'object' && 'url' in img) ? (img as any).url : img;
                              const isRisky = !imgUrl.includes('supabase.co') && !imgUrl.includes('unsplash.com');
                              return (
                                <SwiperSlide key={idx} className="relative overflow-hidden rounded-[16px]">
                                  <Image src={imgUrl} alt={`${place.name} ${idx + 1}`} fill className="object-cover rounded-[16px]" sizes="264px" unoptimized={isRisky} />
                                </SwiperSlide>
                              )
                            })}
                            <button onClick={(e) => e.stopPropagation()} className={`prev-btn-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white`}><ArrowLeft className="w-[14px] h-[14px]" /></button>
                            <button onClick={(e) => e.stopPropagation()} className={`next-btn-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-all shadow-sm cursor-pointer text-white`}><ArrowRight className="w-[14px] h-[14px]" /></button>
                            <div className={`pagination-custom-${place.id} custom-pagination-container absolute bottom-3 left-0 w-full flex justify-center gap-1 z-20 !pointer-events-none`}></div>
                          </Swiper>
                          <div className="absolute top-2 right-2 z-20"><button onClick={(e) => { e.stopPropagation(); console.log(`Add ${place.name} to trip`); }} className="flex h-[24px] w-[32px] group-hover:w-[60px] items-center justify-center rounded-[8px] border border-white bg-[#00000066] group-hover:bg-[#1565C0] text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px]"><Icon path={mdiPlus} size="16px" className="flex-shrink-0" /><span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">Add</span></button></div>
                        </div>
                        <div className="w-full h-[87px] flex flex-col gap-[4px] min-w-0">
                          <h4 className="text-[20px] font-inter font-normal text-[#212121] leading-none w-full"><span className="inline-block max-w-full truncate border-b border-transparent group-hover:border-[#212121] pb-[1px] transition-colors duration-200 align-bottom">{place.name}</span></h4>
                          <p className="flex items-center gap-1 text-[14px] font-inter font-normal text-[#9E9E9E] w-full"><MapPin className="w-4 h-4 shrink-0" /><span className="truncate leading-none">{place.province_state}, {place.country}</span></p>
                          <div className="flex items-center gap-[4px]">{[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`w-[12px] h-[12px] ${star <= Math.round(place.rating || 0) ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />))}<span className="text-xs font-medium text-[#9E9E9E] ml-1">({place.rating})</span></div>
                          <p className="text-[14px] font-inter font-semibold text-[#212121] truncate leading-none w-full">{displayString}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-[8px] mt-auto pt-10">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 transition hover:bg-[#757575] cursor-pointer"><ChevronLeft size={16} className="text-white" /></button>
                {getPaginationGroup().map((page, index) => (
                  <button key={index} onClick={() => setCurrentPage(page)} className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors cursor-pointer ${currentPage === page ? "bg-[#194473] text-white" : "bg-[#9E9E9E] text-white hover:bg-gray-400"}`}>{page}</button>
                ))}
                {totalPages > 5 && currentPage < totalPages - 2 && <span className="text-gray-400">...</span>}
                {totalPages > 5 && currentPage < totalPages - 2 && (<button onClick={() => setCurrentPage(totalPages)} className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors bg-[#9E9E9E] text-white hover:bg-gray-400 cursor-pointer`}>{totalPages}</button>)}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 transition hover:bg-[#757575] cursor-pointer"><ChevronRight size={20} className="text-white" /></button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ FESTIVAL SECTION */}
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#194473] mb-8 mt-12">
          Recommend festival in {selectedMonth === "ALL" ? paramCountry : MONTH_FULL_NAMES[selectedMonth]}
        </h1>

        {/* ✅ 1. Main Wrapper: w-[1014px] h-[373px] Centered */}
        <div className="w-[1014px] h-[373px] mx-auto mb-10 flex flex-col gap-[24px] relative">

          <div className="relative w-full h-full">

            {filteredFestivals.length === 0 ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500 rounded-[24px] bg-[#F5F5F5]">
                No festivals found for {selectedMonth === "ALL" ? "any month" : selectedMonth} in {paramCountry}.
              </div>
            ) : (
              <>
                {/* Navigation Buttons (Outside wrapper) */}
                {totalFestivalPages > 1 && (
                  <>
                    <button onClick={() => setFestivalPage(p => Math.max(1, p - 1))} disabled={festivalPage === 1} className="festival-nav-btn" style={{ left: '-60px' }}>
                      <ArrowLeft className="w-[24px] h-[24px]" />
                    </button>
                    <button onClick={() => setFestivalPage(p => Math.min(totalFestivalPages, p + 1))} disabled={festivalPage === totalFestivalPages} className="festival-nav-btn" style={{ right: '-60px' }}>
                      <ArrowRight className="w-[24px] h-[24px]" />
                    </button>
                  </>
                )}

                {/* ✅ 2. Grid Items */}
                <div className="grid grid-cols-3 gap-[27px]">
                  {currentFestivals.map((festival) => (

                    /* ✅ 3. Card Item: w-[320px] h-[373px] */
                    <div key={festival.id} className="w-[320px] h-[373px] flex flex-col gap-[8px] p-[16px] rounded-[24px] bg-[#F5F5F5] hover:shadow-md transition-shadow">

                      {/* Image: Adjusted width to fit padding (320 - 32 = 288px width) */}
                      <div className="relative w-[288px] h-[115px] rounded-[8px] overflow-hidden flex-shrink-0">
                        <Image
                          src={getFestivalImageUrl(festival.images)} // ✅ Use helper function
                          alt={festival.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>

                      {/* Content Container */}
                      <div className="flex flex-col flex-1 overflow-hidden gap-[8px]">
                        <div className="w-[288px] flex flex-col gap-[4px] overflow-hidden">
                          <h3 className="font-inter font-bold text-[18px] text-[#212121] leading-tight line-clamp-2">{festival.name}</h3>
                          <p className="font-inter font-normal text-[16px] text-[#212121] leading-tight line-clamp-5">
                            {festival.description} {/* ✅ Map to 'description' */}
                          </p>
                          <p className="font-inter font-normal text-[16px] text-[#212121] leading-tight break-words">
                            <span className="font-bold">When: </span>{festival.period_str} {/* ✅ Map to 'period_str' */}
                          </p>
                          <p className="font-inter font-normal text-[16px] text-[#212121] leading-tight break-words line-clamp-3">
                            <span className="font-bold">Top Spot : </span>{festival.province_state} {/* ✅ Map to 'province_state' */}
                          </p>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

        </div>
        {/* Month Filter (Replacing Pagination) */}
        <div className="flex justify-end items-center gap-[8px] mt-4">
          <button onClick={() => setSelectedMonth("ALL")} className={`flex items-center justify-center w-[40px] h-[24px] px-2 rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors cursor-pointer ${selectedMonth === "ALL" ? "bg-[#194473] text-white" : "bg-[#9E9E9E] text-white hover:bg-gray-400"}`}>All</button>
          {MONTHS.map((month) => (
            <button key={month} onClick={() => setSelectedMonth(month)} className={`flex items-center justify-center w-[40px] h-[24px] px-2 rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors cursor-pointer ${selectedMonth === month ? "bg-[#194473] text-white" : "bg-[#9E9E9E] text-white hover:bg-gray-400"}`}>{month}</button>
          ))}
        </div>

      </div>

    </div>
  );
}