"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronDown, Star, MapPin, ArrowLeft, ArrowRight, Map } from "lucide-react";

import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y, Autoplay } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { ATTRACTIONS_DATA, Attraction } from "../../data/attractionsData";

const HERO_SLIDES = [
  { id: 1, name: "Uplistsikhe", location: "Shida Kartli, Georgia", image: "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=1600&auto=format&fit=crop" },
  { id: 2, name: "Kyoto Autumn", location: "Kyoto, Japan", image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1600&auto=format&fit=crop" },
  { id: 3, name: "Santorini Caldera", location: "Santorini, Greece", image: "https://iugs-geoheritage.org/wp-content/uploads/2022/07/062-2_The-Quaternary-Santorini-Caldera.jpg" },
  { id: 4, name: "Machu Picchu", location: "Cusco Region, Peru", image: "https://images.unsplash.com/photo-1587595431973-160d0d94add1?q=80&w=1600&auto=format&fit=crop" },
  { id: 5, name: "Dolomites Peaks", location: "South Tyrol, Italy", image: "https://www.dolomites.org/CustomerData/536/Files/Images/things-to-do/three-peaks/sunrise.jpg" },
];

const FILTER_GROUPS = [
  {
    title: "Nature & Outdoors",
    items: [
      "Mountains", "National parks", "Islands", "Lakes / Rivers",
      "Hot Spring", "Gardens"
    ]
  },
  {
    title: "History & Culture",
    items: [
      "Temples", "Church / Mosque", "Ancient ruins", "Castles",
      "Old towns", "Museums", "Monuments"
    ]
  },
  {
    title: "Landmarks & Views",
    items: [
      "Viewpoints", "Skyscrapers", "Bridges", "Landmarks", "City squares"
    ]
  },
  {
    title: "Shopping & Lifestyle",
    items: [
      "Markets", "Night Markets", "Shopping Malls", "Flea market", "Souvenir shops"
    ]
  },
  {
    title: "Food & Dining",
    items: [
      "Street food", "Local restaurants", "Cafes", "Famous food spots"
    ]
  },
  {
    title: "Entertainment",
    items: [
      "Theme parks", "Zoos / Aquariums", "Nightlife", "Spas / Wellness"
    ]
  }
];

const CATEGORY_MAPPING: Record<string, string[]> = {
  // --- Nature & Outdoors ---
  "Mountains": ["mountains", "peak", "volcano", "mountain"],
  "National parks": ["national_park", "nature_reserve", "park", "forest"],
  "Islands": ["island", "islet", "beach", "coast"],
  "Lakes / Rivers": ["lake", "river", "waterfall", "canal", "waterway"],
  "Hot Spring": ["hot_spring", "onsen", "spring"],
  "Gardens": ["garden", "botanical", "park"],

  // --- History & Culture ---
  "Temples": ["temple", "shrine", "wat", "pagoda"],
  "Church / Mosque": ["church", "mosque", "cathedral", "chapel", "masjid"],
  "Ancient ruins": ["ruins", "archaeological", "ancient", "historic_site"],
  "Castles": ["castle", "fort", "palace", "fortress"],
  "Old towns": ["old_town", "historic_district", "heritage", "ancient_city"],
  "Museums": ["museum", "art_gallery", "exhibition"],
  "Monuments": ["monument", "memorial", "statue"],

  // --- Landmarks & Views ---
  "Viewpoints": ["viewpoint", "observation", "scenic"],
  "Skyscrapers": ["skyscraper", "tower", "high_rise"],
  "Bridges": ["bridge", "viaduct"],
  "Landmarks": ["landmark", "attraction", "iconic"],
  "City squares": ["square", "plaza", "public_space"],

  // --- Shopping & Lifestyle ---
  "Markets": ["market", "bazaar", "marketplace"],
  "Night Markets": ["night_market", "walking_street"],
  "Shopping Malls": ["mall", "department_store", "shopping_center"],
  "Flea market": ["flea_market", "second_hand"],
  "Souvenir shops": ["souvenir", "gift_shop", "craft"],

  // --- Food & Dining ---
  "Street food": ["street_food", "food_stall", "hawker"],
  "Local restaurants": ["restaurant", "diner", "eatery"],
  "Cafes": ["cafe", "coffee_shop", "tea_house"],
  "Famous food spots": ["famous_food", "michelin", "must_try"],

  // --- Entertainment ---
  "Theme parks": ["theme_park", "amusement_park", "water_park"],
  "Zoos / Aquariums": ["zoo", "aquarium", "wildlife"],
  "Nightlife": ["nightlife", "bar", "club", "pub", "rooftop_bar"],
  "Spas / Wellness": ["spa", "massage", "wellness", "onsen"]
};

interface SearchResult {
  type: 'province' | 'place';
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

  if (!paramCountry && urlSearchQuery) {
    const found = ATTRACTIONS_DATA.find(p =>
      p.name.toLowerCase().includes(urlSearchQuery.toLowerCase()) ||
      p.location.province_state.toLowerCase().includes(urlSearchQuery.toLowerCase())
    );
    if (found) currentCountry = found.location.country;
  }

  const [attractions] = useState<Attraction[]>(ATTRACTIONS_DATA);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [selectedFilter, setSelectedFilter] = useState<string>(urlTag);
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);

  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  useEffect(() => {
    if (urlTag) {
      setSelectedFilter(urlTag);
    }
  }, [urlTag]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const lowerQuery = searchQuery.toLowerCase();
    const tempResults: SearchResult[] = [];
    const addedKeys = new Set();

    const countryData = ATTRACTIONS_DATA.filter(
      place => place.location.country.toLowerCase() === currentCountry.toLowerCase()
    );

    countryData.forEach(place => {
      const province = place.location.province_state;
      if (province.toLowerCase().includes(lowerQuery) && !addedKeys.has(`province-${province}`)) {
        tempResults.push({ type: 'province', name: province, subText: place.location.country });
        addedKeys.add(`province-${province}`);
      }
    });

    countryData.forEach(place => {
      if (place.name.toLowerCase().includes(lowerQuery)) {
        tempResults.push({ type: 'place', name: place.name, subText: `${place.location.province_state}` });
      }
    });

    setSearchResults(tempResults.slice(0, 6));
  }, [searchQuery, currentCountry]);

  const currentContinent = attractions.find(
    (p) => p.location?.country.toLowerCase() === currentCountry.toLowerCase()
  )?.location.continent || "Asia";

  // Filter Logic
  const filtered = attractions.filter(p => {
    const matchCountry = p.location?.country.toLowerCase() === currentCountry.toLowerCase();
    const searchLower = searchQuery.toLowerCase();

    const matchSearch = searchQuery === "" ||
      p.name.toLowerCase().includes(searchLower) ||
      p.location?.province_state.toLowerCase().includes(searchLower);

    let matchCategory = true;
    if (selectedFilter) {
      const mappedKeywords = CATEGORY_MAPPING[selectedFilter] || [selectedFilter.toLowerCase().replace(/_/g, " ")];
      const placeTags = [
        ...(p.category_ids || []),
        ...(p.category_tags || []),
        p.name
      ].map(t => t.toLowerCase().replace(/_/g, " "));

      matchCategory = mappedKeywords.some(keyword =>
        placeTags.some(tag => tag.includes(keyword.toLowerCase()))
      );
    }

    return matchCountry && matchSearch && matchCategory;
  });

  // ✅ ฟังก์ชันช่วยอัปเดต URL โดยไม่ Refresh และไม่ Scroll
  const updateUrlParams = (newFilter: string) => {
    const params = new URLSearchParams(searchParams.toString());

    // อัปเดตหรือลบ tag
    if (newFilter) {
      params.set("tag", newFilter);
    } else {
      params.delete("tag");
    }

    // ตรวจสอบว่ามี country หรือยัง ถ้าไม่มีให้ใส่ (เพื่อความชัวร์)
    if (!params.has("country")) {
      params.set("country", currentCountry);
    }

    // ใช้ router.replace พร้อม option scroll: false
    router.replace(`/explore?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20" onClick={() => setShowDropdown(false)}>

      <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span> /
          <span className="hover:underline cursor-pointer" >{currentContinent}</span> /
          <span className="hover:underline cursor-pointer">{currentCountry}</span>
        </div>
      </div>

      {/* ================= HERO SECTION ================= */}
      <div className="w-full h-[414px] bg-[#DEECF9]">
        <div className="w-full max-w-[1440px] h-[414px] mx-auto bg-[#DEECF9] flex justify-center">
          <div className="w-full h-[445px] flex flex-col gap-[16px] px-[156px]">
            <div className="relative w-full h-[413px] bg-black overflow-hidden group flex-shrink-0 shadow-sm">
              <Swiper
                modules={[Navigation, A11y, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                loop={true}
                autoplay={{ delay: 5000 }}
                navigation={{
                  prevEl: '.custom-prev-button',
                  nextEl: '.custom-next-button',
                }}
                className="w-full h-full"
                onSlideChange={(swiper) => {
                  const realIndex = swiper.realIndex;
                  setCurrentSlide(realIndex);
                  const bullets = document.querySelectorAll('.custom-pagination-bullet');
                  bullets.forEach((bullet, index) => {
                    bullet.classList.remove('bg-[#E0E0E0]', 'bg-[#121212]', 'w-[16px]', 'h-[16px]', 'w-[8px]', 'h-[8px]', 'border', 'border-[4px]', 'border-[#EEEEEE]', 'border-[#E0E0E0]', 'bg-gray-800', 'bg-gray-300', 'w-3', 'h-3', 'w-2.5', 'h-2.5');
                    bullet.classList.add('rounded-full', 'transition-all', 'duration-300');
                    if (index === realIndex) {
                      bullet.classList.add('w-[16px]', 'h-[16px]', 'bg-[#121212]', 'border-[4px]', 'border-[#E0E0E0]');
                    } else {
                      bullet.classList.add('w-[16px]', 'h-[16px]', 'bg-[#E0E0E0]', 'border', 'border-[#EEEEEE]');
                    }
                  });
                }}
              >
                {HERO_SLIDES.map((slide) => (
                  <SwiperSlide key={slide.id} className="relative w-full h-full">
                    <img src={slide.image} className="w-full h-full object-cover" alt={slide.name} />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60"></div>
                    <div className="absolute top-[167px] left-1/2 -translate-x-1/2 z-30 w-[1128px] h-[246px] flex flex-col items-center justify-center gap-[10px]">
                      <div className="w-[635px] h-[170px] flex flex-col items-center gap-[32px]">
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 z-20 h-[79px] flex flex-col justify-center gap-[9px] bg-[#3C3C4399] text-white p-4 rounded-tr-[8px] rounded-br-[8px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className=" h-[47px] flex flex-col justify-center gap-[8px]">
                        <h2 className="text-[18px] font-Inter font-[700] leading-tight drop-shadow-md truncate">{slide.name}</h2>
                        <div className="flex items-center gap-2 text-[14px] font-Inter font-[600] opacity-90">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{slide.location}</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
                <button className="custom-prev-button absolute left-4 top-1/2 -translate-y-1/2 z-30 w-[48px] h-[48px] bg-[#E0E0E0] hover:bg-gray-300 rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer"><ArrowLeft className="w-[30px] h-[30px]" /></button>
                <button className="custom-next-button absolute right-4 top-1/2 -translate-y-1/2 z-30 w-[48px] h-[48px] bg-[#E0E0E0] hover:bg-gray-300 rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer"><ArrowRight className="w-[30px] h-[30px]" /></button>
              </Swiper>
            </div>
            <div className="w-[184px] h-[16px] flex justify-center items-center gap-[8px] flex-shrink-0 mx-auto">
              {HERO_SLIDES.map((_, index) => (
                <div key={index} className={`custom-pagination-bullet rounded-full transition-all duration-300 cursor-pointer box-border ${index === 0 ? 'w-[16px] h-[16px] bg-[#121212] border-[4px] border-[#E0E0E0]' : 'w-[16px] h-[16px] bg-[#E0E0E0] border border-[#EEEEEE]'}`}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mt-16">

        <div id="search-section" className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-gray-200 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#194473]">Attractions in {currentCountry}</h1>

          <div className="relative" ref={searchContainerRef}>
            <div className="flex items-center w-[268px] h-[31px] gap-[8px] px-[8px] py-[4px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] shadow-sm transition">
              <Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" />
              <div className="flex items-center w-[220px] h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px]">
                <input
                  type="text"
                  placeholder="Search"
                  className="w-full h-full bg-transparent border-none outline-none text-[12px] font-inter font-[400] text-[#9E9E9E] leading-none placeholder-[#9E9E9E]"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {showDropdown && searchQuery && searchResults.length > 0 && (
              <div className="absolute top-[36px] left-0 w-[268px] bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                {searchResults.map((result, idx) => (
                  <div
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery(result.name);
                      setShowDropdown(false);
                    }}
                    className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors border-b border-gray-50 last:border-none"
                  >
                    <div className="text-gray-400">
                      {result.type === 'province' ? <Map size={14} /> : <MapPin size={14} />}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-medium text-gray-800 line-clamp-1">{result.name}</span>
                      <span className="text-[10px] text-gray-400 capitalize">{result.type === 'province' ? result.subText : result.type}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* --- SIDEBAR FILTERS --- */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="w-[266px] h-[623px] bg-[#F5F5F5] p-[16px] rounded-[16px] flex flex-col gap-[10px]">

              <div className="w-[234px] h-[24px] mb-[24px] flex items-center justify-center flex-shrink-0">
                <h3 className="font-Inter font-[700] text-[20px] leading-[100%] tracking-[0] text-center text-[#212121]">
                  Filters
                </h3>
              </div>

              <div className="w-full flex flex-col gap-[24px] overflow-y-auto overflow-x-hidden pr-1">
                <div className="w-full h-[24px] flex items-center flex-shrink-0">
                  <h4 className="font-Inter font-[700] text-[20px] leading-[100%] text-[#041830]">
                    City / Region
                  </h4>
                </div>

                <div className="flex flex-col gap-[24px]">
                  {FILTER_GROUPS.map((group, idx) => (
                    <div key={idx} className="flex flex-col gap-[8px]">
                      <h5 className="font-Inter font-[700] text-[16px] leading-[100%] text-[#212121] text-center">
                        {group.title}
                      </h5>

                      <div className="flex flex-col gap-[8px]">
                        {group.items.map((item) => {
                          const isSelected = selectedFilter === item || selectedFilter.toLowerCase() === item.toLowerCase();

                          return (
                            <button
                              key={item}
                              onClick={() => {
                                // ✅ 1. คำนวณค่าใหม่
                                const newFilter = isSelected ? "" : item;

                                // ✅ 2. อัปเดต UI ทันที
                                setSelectedFilter(newFilter);

                                // ✅ 3. อัปเดต URL โดยไม่ Refresh หน้า (ใช้ replace + scroll: false)
                                updateUrlParams(newFilter);
                              }}
                              className="w-full text-left flex items-center gap-[8px] group cursor-pointer"
                            >
                              <div className={`w-[16px] h-[16px] rounded-full transition-all duration-300 cursor-pointer flex-shrink-0 box-border ${isSelected
                                ? "bg-[#041830] border-[2px] border-[#EEEEEE]"
                                : "bg-[#E0E0E0] border border-[#EEEEEE]"
                                }`}>
                              </div>

                              <span className={`font-Inter font-[700] text-[12px] leading-[100%] transition-colors truncate ${isSelected ? "text-[#212121]" : "text-[#757575] group-hover:text-[#212121]"
                                }`}>
                                {item}
                              </span>
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
          {/* --- RIGHT CONTENT --- */}
          <div className="w-[840px] mx-auto">
            {/* Grid: 3 columns, gap 24px, width 840px */}
            <div className="grid grid-cols-3 gap-[24px] mb-10">
              {filtered.map((place) => {
                // Logic เดิมสำหรับการหา Category
                const rawTag = place.category_tags?.[0] || place.category_ids?.[0] || "";
                const matchedCategoryTitle = Object.keys(CATEGORY_MAPPING).find((key) => {
                  const keywords = CATEGORY_MAPPING[key];
                  return keywords.some((k) =>
                    rawTag.toLowerCase().includes(k.toLowerCase())
                  );
                });
                const displayCategory =
                  matchedCategoryTitle || rawTag.replace(/_/g, " ");

                return (
                  <div
                    key={place.id}
                    // ✅ ปรับขนาด Card และ Gap ตามสเปค
                    className="w-[264px] h-[426px] flex flex-col gap-[8px] cursor-pointer group select-none"
                  >
                    <div
                      onClick={() => router.push(`/detail?id=${place.id}`)}
                      className="flex flex-col gap-2 min-w-0"
                    >
                      {/* Image Container */}
                      <div className="relative w-[264px] h-[331px] rounded-[16px] overflow-hidden shadow-sm bg-gray-100 group/slider">
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
                          {(place.images && place.images.length > 0
                            ? place.images
                            : []
                          ).map((img, idx) => (
                            <SwiperSlide
                              key={idx}
                              className="overflow-hidden rounded-[16px]"
                            >
                              <img
                                src={img.url}
                                className="w-full h-full object-cover rounded-[16px]"
                                alt={`${place.name} ${idx + 1}`}
                              />
                            </SwiperSlide>
                          ))}

                          {(!place.images || place.images.length === 0) && (
                            <SwiperSlide>
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                                No Image
                              </div>
                            </SwiperSlide>
                          )}

                          {/* Navigation Buttons */}
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={`prev-btn-${place.id} absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm cursor-pointer`}
                          >
                            <ArrowLeft className="w-[14px] h-[14px] text-gray-700" />
                          </button>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={`next-btn-${place.id} absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[24px] h-[24px] bg-white/80 hover:bg-white rounded-full flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity shadow-sm cursor-pointer`}
                          >
                            <ArrowRight className="w-[14px] h-[14px] text-gray-700" />
                          </button>
                          <div
                            className={`pagination-custom-${place.id} absolute bottom-3 left-0 w-full flex justify-center gap-1 z-20 !pointer-events-none`}
                          ></div>
                        </Swiper>

                        <style jsx global>{`
                .pagination-custom-${place.id} .swiper-pagination-bullet {
                  width: 4px;
                  height: 4px;
                  background-color: #deecf9;
                  border: 1px solid #c2dcf3;
                  opacity: 1;
                  margin: 0 4px !important;
                  transition: all 0.3s ease;
                  border-radius: 50%;
                }
                .pagination-custom-${place.id}
                  .swiper-pagination-bullet-active {
                  width: 8px;
                  height: 8px;
                  background-color: #041830;
                  border: 1px solid #c2dcf3;
                }
              `}</style>

                        {/* Add Button */}
                        <div className="absolute top-2 right-2 z-20">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              console.log(`Add ${place.name} to trip`);
                            }}
                            className="flex h-[24px] w-[32px] group-hover:w-[60px] items-center justify-center rounded-[8px] border border-white bg-[#00000066] group-hover:bg-[#1565C0] text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px]"
                          >
                            <Icon
                              path={mdiPlus}
                              size="16px"
                              className="flex-shrink-0"
                            />
                            <span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">
                              Add
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* ✅ ส่วน Content ด้านล่าง (ใช้ gap-1 ตัด margin) */}
                      <div className="px-1 w-full min-w-0 flex flex-col gap-1 h-[87px]">
                        {/* ชื่อสถานที่ */}
                        <h4 className="text-lg md:text-[20px] font-inter font-[400] text-gray-900 leading-tight group-hover:underline truncate w-full">
                          {place.name}
                        </h4>

                        {/* Location */}
                        <p className="text-sm md:text-[14px] font-inter font-[400] text-gray-500 truncate pb-1 leading-normal w-full">
                          {place.location.province_state}, {place.location.country}
                        </p>

                        {/* Rating */}
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3 h-3 ${star <= Math.round(place.rating)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "fill-gray-200 text-gray-200"
                                }`}
                            />
                          ))}
                          <span className="text-xs font-medium text-gray-600 ml-1">
                            ({place.rating})
                          </span>
                        </div>

                        {/* Category */}
                        <p className="text-sm md:text-[14px] font-inter font-[700] text-gray-900 truncate pb-1 leading-normal w-full capitalize">
                          {displayCategory}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return <Suspense fallback={<div>Loading...</div>}><ExploreContent /></Suspense>;
}