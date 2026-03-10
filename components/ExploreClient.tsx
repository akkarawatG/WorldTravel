"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, MapPin, ArrowLeft, ArrowRight, Map, Star, Check, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

import { createClient } from '@/utils/supabase/client';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { Place } from '@/types/place';
import { calculateRelevanceScore } from '@/services/placeService';

import AuthModal, { UserProfile as AuthUserProfile } from "./AuthModal";

// --- CONFIGURATION ---
const ITEMS_PER_PAGE = 6;
const FESTIVALS_PER_PAGE = 3;

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

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

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

const getFestivalImageUrl = (images: any): string => {
  if (Array.isArray(images) && images.length > 0) {
    return (typeof images[0] === 'object' && images[0] !== null && 'url' in images[0])
      ? images[0].url
      : images[0];
  }
  return "https://placehold.co/600x400?text=No+Image";
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
  const supabase = createClient();

  const paramCountry = typeof searchParams.country === 'string' ? searchParams.country : "Thailand";
  const urlSearchQuery = typeof searchParams.search === 'string' ? searchParams.search : "";
  const urlTag = typeof searchParams.tag === 'string' ? searchParams.tag : "";

  const [filteredPlaces, setFilteredPlaces] = useState<Place[]>(initialPlaces);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [dbFestivals, setDbFestivals] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(MONTHS[new Date().getMonth()]);
  const [festivalPage, setFestivalPage] = useState(1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const monthDropdownRef = useRef<HTMLDivElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [savedPlaceIds, setSavedPlaceIds] = useState<Set<string>>(new Set());
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const checkUserAndSavedPlaces = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data: savedData, error } = await supabase.from('saved_places').select('place_id').eq('profile_id', user.id);
        if (savedData && !error) {
          const ids = new Set(savedData.map(item => item.place_id));
          setSavedPlaceIds(ids);
        }
      }
    };
    checkUserAndSavedPlaces();
  }, []);

  useEffect(() => {
    const fetchFestivals = async () => {
      const { data, error } = await supabase.from('festivals').select('*').eq('country', paramCountry);
      if (!error && data) setDbFestivals(data);
    };
    fetchFestivals();
  }, [paramCountry]);

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

  const filteredFestivals = dbFestivals.filter((festival) => {
    if (selectedMonth === "ALL") return true;
    const monthName = MONTH_FULL_NAMES[selectedMonth];
    return festival.period_str?.toLowerCase().includes(monthName.toLowerCase());
  });

  const totalFestivalPages = Math.ceil(filteredFestivals.length / FESTIVALS_PER_PAGE);
  const currentFestivals = filteredFestivals.slice((festivalPage - 1) * FESTIVALS_PER_PAGE, festivalPage * FESTIVALS_PER_PAGE);

  useEffect(() => { setFestivalPage(1); }, [selectedMonth]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (searchContainerRef.current && !searchContainerRef.current.contains(target)) setShowDropdown(false);
      if (monthDropdownRef.current && !monthDropdownRef.current.contains(target)) setIsMonthDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSavePlace = async (placeId: string, placeName: string) => {
    if (!userId) { setShowAuthModal(true); return; }
    const isAlreadySaved = savedPlaceIds.has(placeId);
    if (isAlreadySaved) {
      setSavedPlaceIds(prev => { const newSet = new Set(prev); newSet.delete(placeId); return newSet; });
      try { await supabase.from('saved_places').delete().eq('place_id', placeId).eq('profile_id', userId); } catch (err) { setSavedPlaceIds(prev => new Set(prev).add(placeId)); }
    } else {
      setSavedPlaceIds(prev => new Set(prev).add(placeId));
      try { await supabase.from('saved_places').insert([{ profile_id: userId, place_id: placeId }]); } catch (err) { setSavedPlaceIds(prev => { const newSet = new Set(prev); newSet.delete(placeId); return newSet; }); }
    }
  };

  const handleAuthSuccess = () => { setShowAuthModal(false); window.location.reload(); };

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
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20 overflow-x-hidden">

      <style jsx global>{`
        .custom-pagination-container { display: flex !important; align-items: center !important; justify-content: center !important; height: 12px !important; }
        .custom-pagination-container .swiper-pagination-bullet { width: 4px !important; height: 4px !important; background-color: #deecf9 !important; border: 1px solid #c2dcf3 !important; opacity: 1 !important; margin: 0 4px !important; transition: all 0.3s ease-in-out !important; border-radius: 50% !important; flex-shrink: 0 !important; }
        .custom-pagination-container .swiper-pagination-bullet-active { width: 8px !important; height: 8px !important; background-color: #041830 !important; border: 1px solid #c2dcf3 !important; }
        .festival-nav-btn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 50; width: 48px; height: 48px; background-color: #3A82CE66; border: 1px solid #95C3EA; border-radius: 30px; display: flex; align-items: center; justify-content: center; color: #ffffff; cursor: pointer; transition: all 0.2s; }
        .festival-nav-btn:hover { background-color: #3A82CE; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* Breadcrumb */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[156px] pt-6 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[12px] md:text-[14px] text-[#9E9E9E]">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span> /
          <span className="hover:underline cursor-pointer" onClick={() => router.push(`/countries?continent=${currentContinent}`)}>{currentContinent}</span> /
          <span className="text-[#101828]">{paramCountry}</span>
        </div>
      </div>

      {/* HERO SLIDER */}
      <div className="w-full h-[300px] md:h-[414px] bg-[#DEECF9]">
        <div className="w-full max-w-[1440px] h-full mx-auto bg-[#DEECF9] flex justify-center">
          {displaySlides.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-gray-500">No attractions found</div>
          ) : (
            <div className="w-full flex flex-col gap-[16px] px-0 md:px-8 lg:px-[156px]">
              <div className="relative w-full h-[250px] md:h-[413px] bg-black overflow-hidden sm:rounded-[16px] md:rounded-none group shadow-sm">
                <Swiper modules={[Navigation, A11y, Autoplay]} spaceBetween={0} slidesPerView={1} loop={displaySlides.length > 1} autoplay={{ delay: 5000 }} navigation={{ prevEl: '.custom-prev-button', nextEl: '.custom-next-button' }} className="w-full h-full">
                  {displaySlides.map((slide, index) => {
                    const imgUrl = Array.isArray(slide.images) && typeof slide.images[0] === 'object' && 'url' in slide.images[0] ? (slide.images[0] as any).url : (slide.images?.[0] || "https://placehold.co/800x400?text=No+Image");
                    const isRisky = !imgUrl.includes('supabase.co') && !imgUrl.includes('unsplash.com');
                    return (
                      <SwiperSlide key={slide.id}>
                        <Image src={imgUrl} alt={slide.name} fill priority={index === 0} className="object-cover" sizes="100vw" unoptimized={isRisky} />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                        <div className="absolute bottom-0 left-0 w-[85%] md:w-auto z-40 h-[79px] flex flex-col justify-center gap-[9px] bg-[#3C3C4399] text-white p-4 rounded-tr-[8px] rounded-br-[8px]">
                          <h2 onClick={() => router.push(`/detail?id=${slide.id}`)} className="text-[16px] md:text-[18px] font-Inter font-[700] leading-tight drop-shadow-md truncate w-full md:max-w-[300px] cursor-pointer hover:underline">{slide.name}</h2>
                          <div className="flex items-center gap-2 text-[12px] md:text-[14px] font-Inter font-[600] opacity-90"><MapPin className="w-4 h-4" /><span className="truncate">{slide.province_state}, {slide.country}</span></div>
                        </div>
                      </SwiperSlide>
                    )
                  })}
                  <button className="custom-prev-button absolute left-4 top-1/2 -translate-y-1/2 z-30 w-[40px] md:w-[48px] h-[40px] md:h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full hidden md:flex items-center justify-center text-white"><ArrowLeft className="w-[30px]" /></button>
                  <button className="custom-next-button absolute right-4 top-1/2 -translate-y-1/2 z-30 w-[40px] md:w-[48px] h-[40px] md:h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full hidden md:flex items-center justify-center text-white"><ArrowRight className="w-[30px]" /></button>
                </Swiper>
              </div>
              <div className="w-[184px] h-[16px] flex justify-center items-center gap-[8px] mx-auto">
                {displaySlides.map((_, index) => (<div key={index} className={`custom-pagination-bullet rounded-full transition-all duration-300 w-[16px] h-[16px] ${index === 0 ? 'bg-[#121212] border-[4px] border-[#E0E0E0]' : 'bg-[#E0E0E0] border border-[#EEEEEE]'}`}></div>))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[156px] pt-6 mt-8 md:mt-16">
        
        {/* Title & Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <h1 className="text-[24px] md:text-4xl font-extrabold text-[#194473] leading-tight">Attractions in {paramCountry}</h1>
          <div className="relative w-full md:w-auto" ref={searchContainerRef}>
            <div className="flex items-center w-full md:w-[268px] h-[40px] md:h-[31px] gap-[8px] px-[8px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] shadow-sm">
              <Search className="w-[20px] h-[20px] text-white shrink-0" />
              <div className="flex items-center flex-1 h-[32px] md:h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px]">
                <input type="text" placeholder="Search" className="w-full bg-transparent outline-none text-[13px] md:text-[12px] font-inter text-[#212121] placeholder-[#9E9E9E]"
                  value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearchSubmit(searchQuery); }} onFocus={() => setShowDropdown(true)}
                />
              </div>
            </div>
            {showDropdown && searchQuery && searchResults.length > 0 && (
              <div className="absolute top-[44px] md:top-[36px] left-0 w-full md:w-[268px] bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50">
                {searchResults.map((result, idx) => (
                  <div key={idx} onClick={() => { setSearchQuery(result.name); handleSearchSubmit(result.name); setShowDropdown(false); }} className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none">
                    <div className="text-gray-400">{result.type === 'province' ? <Map size={14} /> : <MapPin size={14} />}</div>
                    <div className="flex flex-col"><span className="text-[12px] font-medium text-gray-800">{result.name}</span><span className="text-[10px] text-gray-400 capitalize">{result.subText}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* ✅ SIDEBAR FILTER (Mobile: Horizontal Scroll, Desktop: Vertical Sidebar) */}
          <div className="lg:col-span-1 w-full">
            <div className="w-full lg:w-[266px] h-fit bg-transparent lg:bg-[#F5F5F5] p-0 lg:p-[16px] rounded-none lg:rounded-[16px] flex flex-col gap-[10px]">
              <div className="hidden lg:flex w-full h-[24px] mb-[12px] items-center justify-center">
                <h3 className="font-Inter font-[700] text-[20px] text-[#212121]">Filters</h3>
              </div>
              
              {/* Selected Filters (Horizontal on mobile) */}
              {selectedFilters.length > 0 && (
                <div className="flex flex-col gap-3 mb-2 lg:mb-4 border-b border-gray-200 pb-4">
                  <div className="flex justify-between items-center px-1 lg:px-0">
                    <h4 className="font-Inter font-[700] text-[14px] lg:text-[16px] text-[#041830]">Your filters</h4>
                    <button onClick={clearAllFilters} className="text-[12px] text-gray-500 hover:text-[#3A82CE]">Clear</button>
                  </div>
                  <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {selectedFilters.map((filter) => (
                      <button key={`sel-${filter}`} onClick={() => toggleFilter(filter)} className="flex-shrink-0 lg:w-full text-left flex items-center gap-[6px] bg-blue-50 lg:bg-transparent px-3 py-1.5 lg:px-0 rounded-full lg:rounded-none border border-blue-100 lg:border-none">
                        <div className="w-[14px] h-[14px] rounded-full bg-[#3A82CE] flex items-center justify-center flex-shrink-0"><Check size={10} className="text-white" strokeWidth={4} /></div>
                        <span className="font-Inter font-[700] text-[11px] lg:text-[12px] text-[#3A82CE]">{filter}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Filter Groups (Horizontal on mobile) */}
              <div className="w-full flex flex-row lg:flex-col gap-4 lg:gap-6 overflow-x-auto lg:overflow-y-auto scrollbar-hide pb-2 lg:pb-0 lg:max-h-[600px]">
                {FILTER_GROUPS.map((group, idx) => (
                  <div key={idx} className="flex flex-col gap-2 lg:gap-[8px] flex-shrink-0 min-w-[140px] lg:min-w-0">
                    <h5 className="font-Inter font-[700] text-[13px] lg:text-[16px] text-[#212121] lg:text-center border-b lg:border-none border-gray-100 pb-1 lg:pb-0">{group.title}</h5>
                    <div className="flex flex-col gap-1.5 lg:gap-[8px]">
                      {group.items.map((item) => {
                        const isSelected = selectedFilters.includes(item);
                        return (
                          <button key={item} onClick={() => toggleFilter(item)} className="w-full text-left flex items-center gap-2 group">
                            <div className={`w-[14px] lg:w-[16px] h-[14px] lg:h-[16px] rounded-full transition-all flex-shrink-0 flex items-center justify-center ${isSelected ? "bg-[#3A82CE]" : "bg-[#E0E0E0]"}`}>{isSelected && <Check size={10} className="text-white" strokeWidth={4} />}</div>
                            <span className={`font-Inter font-[600] lg:font-[700] text-[12px] transition-colors truncate ${isSelected ? "text-[#212121]" : "text-[#757575]"}`}>{item}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ✅ GRID CONTENT (Mobile: 2 Columns, Desktop: 3 Columns) */}
          <div className="w-full lg:col-span-3 flex flex-col justify-between min-h-0 lg:min-h-[950px]">
            {paginatedItems.length === 0 ? (<div className="w-full h-40 flex items-center justify-center text-gray-400">No places found.</div>) : (
              <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-[24px]">
                {paginatedItems.map((place) => {
                  const displayCategories = getDisplayCategories(place.category_tags);
                  const displayString = displayCategories.length > 0 ? displayCategories.slice(0, 3).join(", ") : "Attraction";
                  const isSaved = savedPlaceIds.has(String(place.id)); 
                  const images = Array.isArray(place.images) && place.images.length > 0 ? place.images : [];

                  return (
                    <div key={place.id} className="w-full flex flex-col gap-[6px] md:gap-[8px] cursor-pointer group" onClick={() => router.push(`/detail?id=${place.id}`)}>
                      <div className="relative w-full aspect-[4/5] sm:aspect-auto sm:h-[300px] lg:h-[331px] rounded-[12px] md:rounded-[16px] overflow-hidden shadow-sm bg-gray-100">
                        <Swiper modules={[Navigation, Pagination, A11y]} slidesPerView={1} loop={images.length > 1} className="w-full h-full">
                          {images.map((img, idx) => {
                            const imgUrl = (typeof img === 'object' && 'url' in img) ? (img as any).url : img;
                            return (
                              <SwiperSlide key={idx}><Image src={imgUrl} alt={place.name} fill className="object-cover" sizes="(max-width: 768px) 50vw, 300px" /></SwiperSlide>
                            )
                          })}
                          <div className={`pagination-custom-${place.id} custom-pagination-container absolute bottom-2 left-0 w-full flex justify-center gap-1 z-20 !pointer-events-none`}></div>
                        </Swiper>
                        <div className="absolute top-1.5 right-1.5 lg:top-2 lg:right-2 z-20">
                          <button onClick={(e) => { e.stopPropagation(); handleSavePlace(String(place.id), place.name); }} 
                            className={`flex h-[22px] lg:h-[24px] w-[28px] lg:w-[32px] lg:group-hover:w-[60px] items-center justify-center rounded-[6px] lg:rounded-[8px] border border-white text-white shadow-sm transition-all duration-300 backdrop-blur-[2px] ${isSaved ? "bg-[#3A82CE]" : "bg-[#00000066]"}`}>
                            {isSaved ? (<Check size="14px" />) : (<Icon path={mdiPlus} size="14px" />)}
                            <span className="max-w-0 opacity-0 lg:group-hover:max-w-[40px] lg:group-hover:opacity-100 lg:group-hover:ml-1 text-[11px] font-inter whitespace-nowrap transition-all">{isSaved ? "Saved" : "Add"}</span>
                          </button>
                        </div>
                      </div>
                      <div className="flex flex-col gap-0.5 md:gap-1 px-1">
                        <h4 className="text-[14px] md:text-[20px] font-bold md:font-normal text-[#212121] leading-tight truncate">{place.name}</h4>
                        <p className="flex items-center gap-1 text-[11px] md:text-[14px] text-[#9E9E9E]"><MapPin size={12} className="shrink-0" /><span className="truncate">{place.province_state}</span></p>
                        <div className="flex items-center gap-1 text-[11px] md:text-xs text-[#9E9E9E]"><Star size={10} className="fill-yellow-400 text-yellow-400" /><span>{place.rating}</span></div>
                        <p className="text-[11px] md:text-[14px] font-semibold text-[#212121] truncate capitalize">{displayString}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center lg:justify-end items-center gap-2 mt-8 md:mt-10">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded disabled:opacity-30"><ChevronLeft size={16} /></button>
                <div className="flex gap-1">
                  {getPaginationGroup().map(p => (
                    <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 rounded text-sm ${currentPage === p ? "bg-[#194473] text-white" : "bg-gray-100"}`}>{p}</button>
                  ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            )}
          </div>
        </div>

        {/* ✅ FESTIVAL SECTION */}
        <h1 className="text-[24px] md:text-[36px] font-extrabold text-[#194473] mb-4 md:mb-8 mt-12 md:mt-16 text-center lg:text-left">
          Recommend festival in {selectedMonth === "ALL" ? paramCountry : MONTH_FULL_NAMES[selectedMonth]}
        </h1>

        {/* ✅ MONTH TABS (Mobile: Dropdown, Desktop: Buttons Row) */}
        <div className="w-full flex lg:hidden justify-center mb-6 relative z-10" ref={monthDropdownRef}>
            <button onClick={() => setIsMonthDropdownOpen(!isMonthDropdownOpen)} className="w-full max-w-[280px] h-[44px] bg-white border border-gray-300 rounded-lg flex items-center justify-between px-4 text-[#194473] font-bold text-sm shadow-sm">
              <span>{selectedMonth === "ALL" ? "All Year" : MONTH_FULL_NAMES[selectedMonth]}</span>
              <ChevronDown className={`w-5 h-5 transition-transform ${isMonthDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isMonthDropdownOpen && (
              <div className="absolute top-full mt-1 w-full max-w-[280px] max-h-[250px] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div onClick={() => { setSelectedMonth("ALL"); setIsMonthDropdownOpen(false); }} className={`px-4 py-3 text-sm ${selectedMonth === "ALL" ? "bg-blue-50 text-blue-700 font-bold" : ""}`}>All Year</div>
                {MONTHS.map(m => (
                  <div key={m} onClick={() => { setSelectedMonth(m); setIsMonthDropdownOpen(false); }} className={`px-4 py-3 text-sm border-t border-gray-50 ${selectedMonth === m ? "bg-blue-50 text-blue-700 font-bold" : ""}`}>{MONTH_FULL_NAMES[m]}</div>
                ))}
              </div>
            )}
        </div>

        {/* Festival Cards */}
        <div className="w-full lg:w-[1014px] mx-auto mb-10">
          {filteredFestivals.length === 0 ? (
            <div className="w-full h-32 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl">No festivals found.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-[27px]">
              {currentFestivals.map((f) => (
                <div key={f.id} className="bg-[#F5F5F5] p-4 rounded-2xl md:rounded-[24px] flex flex-col gap-3">
                  <div className="relative w-full aspect-video md:h-[115px] rounded-lg overflow-hidden shrink-0">
                    <Image src={getFestivalImageUrl(f.images)} alt={f.name} fill className="object-cover" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-base md:text-[18px] text-[#212121] leading-tight line-clamp-1">{f.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600 line-clamp-3 mb-2">{f.description}</p>
                    <div className="text-[11px] md:text-sm space-y-0.5">
                      <p><span className="font-bold text-[#194473]">When:</span> {f.period_str}</p>
                      <p><span className="font-bold text-[#194473]">Spot:</span> {f.province_state}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Desktop Month Tabs */}
        <div className="hidden lg:flex justify-end items-center gap-2 mt-4">
          <button onClick={() => setSelectedMonth("ALL")} className={`px-3 py-1 rounded text-xs font-medium border ${selectedMonth === "ALL" ? "bg-[#194473] text-white border-[#194473]" : "bg-gray-400 text-white"}`}>All</button>
          {MONTHS.map(m => (
            <button key={m} onClick={() => setSelectedMonth(m)} className={`px-3 py-1 rounded text-xs font-medium border ${selectedMonth === m ? "bg-[#194473] text-white border-[#194473]" : "bg-gray-400 text-white"}`}>{m}</button>
          ))}
        </div>

      </div>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />}
    </div>
  );
}