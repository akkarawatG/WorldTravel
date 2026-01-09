"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ArrowLeft, ArrowRight, Plus, Star } from "lucide-react";
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, A11y } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Import Services & Types
import { getTopAttractionsByContinent, CountryData } from '@/services/placeService';
import { Place } from '@/types/place';
import Link from "next/link";

// Mock Data
import { CONTINENTS, COUNTRIES_DATA } from "../data/mockData";
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "../data/attractionsData";

export default function HomePage() {
  const router = useRouter();

  const [selectedContinent, setSelectedContinent] = useState("Asia");
  const [topAttractions, setTopAttractions] = useState<Place[]>([]);
  const [currentCountries, setCurrentCountries] = useState<CountryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const heroSlides = topAttractions.slice(0, 8);
  const displaySlides = heroSlides.length > 0 ? heroSlides : [];

  // --- DATA FETCHING LOGIC ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. ลองดึงจาก Supabase ก่อน
        const realAttractions = await getTopAttractionsByContinent(selectedContinent);
        let finalAttractions = realAttractions;

        // ถ้า Supabase ไม่มีข้อมูล (length === 0) ให้ใช้ Mock Data
        if (realAttractions.length === 0) {
          // ✅ FIX 1: แปลง Mock Data ให้โครงสร้างเหมือน Place (Flat Structure)
          const mockAttr = MOCK_ATTRACTIONS
            .filter(p => p.location.continent === selectedContinent)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 8)
            .map(m => ({
              ...m,
              id: String(m.id), // แปลง ID เป็น string ให้ตรง type
              // ย้ายข้อมูลจาก location มาไว้ชั้นนอก
              province_state: m.location.province_state,
              country: m.location.country,
              continent: m.location.continent,
              // (ไม่ต้องใส่ location เข้าไป เพื่อให้ตรงกับ Type Place)
            }));

          // Force Cast เป็น Place[] เพราะตอนนี้โครงสร้างเหมือนกันแล้ว
          finalAttractions = mockAttr as unknown as Place[];
        }
        setTopAttractions(finalAttractions);

        // 2. Countries: ใช้ Mock Only (ตามที่คุณต้องการ)
        const mockCountriesList = (COUNTRIES_DATA[selectedContinent] || []).map(c => ({
          name: c.name,
          continent: selectedContinent,
          image: c.image
        }));

        setCurrentCountries(mockCountriesList);

      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback Error Case: ก็ต้องแปลง Mock เหมือนกัน
        const mockAttr = MOCK_ATTRACTIONS
          .filter(p => p.location.continent === selectedContinent)
          .map(m => ({
            ...m,
            id: String(m.id),
            province_state: m.location.province_state,
            country: m.location.country,
            continent: m.location.continent,
          }));
        
        setTopAttractions(mockAttr as unknown as Place[]);
        
        // Mock Countries Fallback
        const mockCountriesList = (COUNTRIES_DATA[selectedContinent] || []).map(c => ({
          name: c.name,
          continent: selectedContinent,
          image: c.image
        }));
        setCurrentCountries(mockCountriesList);

      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedContinent]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20">

      {/* --- 1. HERO SECTION (SLIDER) --- */}
      <div className="w-full h-[414px] bg-[#DEECF9]">
        <div className="w-full max-w-[1440px] h-[414px] mx-auto bg-[#DEECF9] flex justify-center">

          {isLoading ? (
            <div className="w-full h-[414px] flex items-center justify-center text-gray-500">Loading...</div>
          ) : displaySlides.length === 0 ? (
            <div className="w-full h-[414px] flex items-center justify-center text-gray-500">No attractions found for {selectedContinent}</div>
          ) : (
            <div className="w-full h-[445px] flex flex-col gap-[16px] px-[156px]">
              <div className="relative w-full h-[413px] bg-black overflow-hidden group flex-shrink-0">

                <Swiper
                  key={selectedContinent}
                  modules={[Navigation, A11y]}
                  spaceBetween={0}
                  slidesPerView={1}
                  loop={displaySlides.length > 1}
                  navigation={{
                    prevEl: '.custom-prev-button',
                    nextEl: '.custom-next-button',
                  }}
                  className="w-full h-full"
                  onSlideChange={(swiper) => {
                    const realIndex = swiper.realIndex;
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
                  {displaySlides.map((slide) => (
                    <SwiperSlide key={slide.id} className="relative w-full h-full">
                      <img
                        src={
                          Array.isArray(slide.images) && typeof slide.images[0] === 'object' && 'url' in slide.images[0]
                            ? (slide.images[0] as any).url
                            : (slide.images?.[0] || "https://images.unsplash.com/photo-1565008576549-57569a49371d?q=80&w=1600&auto=format&fit=crop")
                        }
                        className="w-full h-full object-cover"
                        alt={slide.name}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 pointer-events-none"></div>

                      <div className="absolute top-[167px] left-1/2 -translate-x-1/2 z-30 w-[1128px] h-[246px] flex flex-col items-center justify-center gap-[10px]">
                        <div className="w-[635px] h-[170px] flex flex-col items-center gap-[32px]">
                          <div className="flex flex-col items-center gap-[16px] w-full text-center">
                            <h1 className="font-Inter font-bold text-[48px] leading-[100%] text-white drop-shadow-[3px_3px_5px_rgba(0,0,0,1)]">Explore the world your way</h1>
                            <p className="font-Inter font-bold text-[20px] leading-[100%] text-white text-center drop-shadow-[0px_4px_4px_rgba(0,0,0,1)]">Plan tips, save places, and build your our trips</p>
                          </div>
                          <button
                            onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-[166px] h-[40px] flex items-center justify-center gap-[10px] px-[16px] py-[8px] bg-[#3A82CE33] border border-[#95C3EA] rounded-[8px] cursor-pointer hover:bg-[#3A82CE] transition-all backdrop-blur-[2px] shadow-sm z-40"
                          >
                            <span className="font-Inter font-normal text-[20px] leading-[100%] text-white">
                              Start Planning
                            </span>
                          </button>
                        </div>
                      </div>

                      <div className="absolute bottom-0 left-0 z-40 w-max-[300px] min-h-[79px] flex flex-col justify-center gap-[9px] p-[16px] bg-[#3C3C4399] text-white rounded-tr-[8px] rounded-br-[8px] animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="flex flex-col justify-center gap-[4px]">

                          <h2
                            onClick={(e) => {
                              e.stopPropagation();
                              router.push(`/detail?id=${slide.id}`);
                            }}
                            className="text-[18px] font-Inter font-[700] leading-normal drop-shadow-md truncate max-w-[300px] pb-1 cursor-pointer hover:underline hover:text-[#DEECF9] transition-colors relative z-50"
                          >
                            {slide.name.split('(')[0].trim()}
                          </h2>

                          <div className="flex items-center gap-2 text-[14px] font-Inter font-[600] opacity-90 relative z-50">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <div className="flex gap-1 truncate">
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // ✅ FIX: ไม่ต้องใช้ location?. แล้ว เพราะเรา normalize ข้อมูลแล้ว
                                  router.push(`/explore?search=${slide.province_state}`);
                                }}
                                className="cursor-pointer hover:underline hover:text-[#DEECF9] transition-colors"
                              >
                                {slide.province_state},
                              </span>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/explore?country=${slide.country}`);
                                }}
                                className="cursor-pointer hover:underline hover:text-[#DEECF9] transition-colors"
                              >
                                {slide.country}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}

                  <button className="custom-prev-button absolute left-4 top-1/2 -translate-y-1/2 z-50 w-[48px] h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer">
                    <ArrowLeft className="w-[30px] h-[30px]" />
                  </button>
                  <button className="custom-next-button absolute right-4 top-1/2 -translate-y-1/2 z-50 w-[48px] h-[48px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer">
                    <ArrowRight className="w-[30px] h-[30px]" />
                  </button>
                </Swiper>
              </div>

              <div className="w-[184px] h-[16px] flex justify-center items-center gap-[8px] flex-shrink-0 mx-auto">
                {displaySlides.map((_, index) => (
                  <div key={index} className={`custom-pagination-bullet rounded-full transition-all duration-300 cursor-pointer box-border ${index === 0 ? 'w-[16px] h-[16px] bg-[#041830] border-[4px] border-[#DEECF9] ring-[1px] ring-[#C2DCF3]' : 'w-[16px] h-[16px] bg-[#041830] border border-[#DEECF9] ring-[1px] ring-[#C2DCF3]'}`}></div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="w-full max-w-[1128px] mx-auto flex flex-col gap-[24px] mt-[64px] ">

        {/* --- 2. HEADER & TABS --- */}
        <div className="flex flex-col gap-[24px]">
          <div id="search-section" className="w-full max-w-[1128px] h-[44px] flex items-center justify-center gap-[13px]">
            <h3 className="text-[36px] font-[900] font-inter leading-none tracking-normal text-center text-[#194473] whitespace-nowrap">
              Popular Destinations
            </h3>
          </div>

          <div className="w-[963px] mx-auto flex items-center justify-center gap-[10px] mb-6 border-b border-gray-200 px-[14px]">
            <div className="w-full h-[32px] flex justify-between items-center ">
              {CONTINENTS.map((cont) => (
                <button
                  key={cont}
                  onClick={() => setSelectedContinent(cont)}
                  className={`text-[20px] font-Inter leading-none transition-all whitespace-nowrap relative h-full flex items-center px-2 ${selectedContinent === cont
                    ? "font-[700] text-[#0D47A1] after:content-[''] after:absolute after:-bottom-[1px] after:left-0 after:h-[2px] after:w-full after:bg-[#0D47A1]"
                    : "font-[400] text-[#212121] hover:text-[#0D47A1]"
                    }`}
                >
                  {cont}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* --- 3. TOP ATTRACTIONS GRID --- */}
        <div className="w-[1128px] h-[426px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[24px]">
            {topAttractions.slice(0, 4).map((place) => (
              <div
                key={place.id}
                className="w-[264px] h-[426px] flex flex-col gap-[8px] group cursor-pointer select-none"
                onClick={() => router.push(`/detail?id=${place.id}`)}
              >
                <div className="flex flex-col gap-2 min-w-0">

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
                      {(Array.isArray(place.images) && place.images.length > 0 ? place.images : []).map((img, idx) => {
                        const imgUrl = (typeof img === 'object' && 'url' in img) ? (img as any).url : img;
                        return (
                          <SwiperSlide key={idx} className="overflow-hidden rounded-[16px]">
                            <img src={imgUrl} className="w-full h-full object-cover rounded-[16px]" alt={`${place.name} ${idx + 1}`} />
                          </SwiperSlide>
                        );
                      })}

                      {(!place.images || place.images.length === 0) && (
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
                      .pagination-custom-${place.id} .swiper-pagination-bullet {
                        width: 4px; height: 4px; background-color: #deecf9; border: 1px solid #c2dcf3; opacity: 1; margin: 0 4px !important; transition: all 0.3s ease; border-radius: 50%;
                      }
                      .pagination-custom-${place.id} .swiper-pagination-bullet-active {
                        width: 8px; height: 8px; background-color: #041830; border: 1px solid #c2dcf3;
                      }
                    `}</style>

                    <div className="absolute top-2 right-2 z-20">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Add ${place.name} to trip`);
                        }}
                        className="flex h-[24px] w-[32px] group-hover:w-[60px] items-center justify-center rounded-[8px] border border-white bg-[#00000066] group-hover:bg-[#1565C0] text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px]"
                      >
                        <Icon path={mdiPlus} size="16px" className="flex-shrink-0" />
                        <span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">
                          Add
                        </span>
                      </button>
                    </div>
                  </div>
                  <div className="w-full h-[87px] flex flex-col gap-[4px] min-w-0">
                    
                    {/* 1. Title: 20px, Regular(400), #212121, Line-height 100% */}
                    <h4 className="text-[20px] font-inter font-normal text-[#212121] leading-none w-full">
                      <span className="inline-block max-w-full truncate border-b border-transparent group-hover:border-[#212121] pb-[1px] transition-colors duration-200 align-bottom">
                        {place.name}
                      </span>
                    </h4>

                    {/* 2. Location: 14px, Regular(400), #9E9E9E, Line-height 100% */}
                    <p className="text-[14px] font-inter font-normal text-[#9E9E9E] truncate leading-none w-full">
                      {place.province_state}, {place.country}
                    </p>

                    {/* 3. Rating Stars: Gap 4px */}
                    <div className="flex items-center gap-[4px]">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-[12px] h-[12px] ${star <= Math.round(place.rating || 0)
                            ? "fill-yellow-400 text-yellow-400"
                            : "fill-gray-200 text-gray-200"
                            }`}
                        />
                      ))}
                      <span className="text-xs font-medium text-[#9E9E9E] ml-1">
                        ({place.rating})
                      </span>
                    </div>

                    {/* 4. Category: 14px, SemiBold(600), #212121, Line-height 100% */}
                    <p className="text-[14px] font-inter font-semibold text-[#212121] truncate leading-none w-full capitalize">
                      {place.category_tags?.[0]?.replace("_", " ") ||
                        place.category_ids?.[0]?.replace("_", " ") ||
                        "Attraction"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- 4. COUNTRIES LIST (Mock Only) --- */}
        <div className="w-full flex flex-col gap-[24px] mt-[32px]">
          <div className="h-[44px] flex items-center justify-between">
            <h2 className="text-[36px] font-[900] font-inter leading-none tracking-normal text-center text-[#194473] whitespace-nowrap">
              Top list in {selectedContinent}
            </h2>
            <Link href="/countries">
              <button className="w-[112px] h-[22px] flex items-center justify-center gap-[10px] font-inter font-bold text-[18px] leading-none text-[#616161] hover:text-[#3A82CE] hover:underline transition-colors">
                All Countries
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px]">
            {currentCountries.slice(0, 8).map((country) => (
              <div
                key={country.name}
                onClick={() => router.push(`/explore?country=${country.name}`)}
                className="relative w-full max-w-[264px] h-[331px] rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-[#C2DCF3] flex flex-col bg-white mx-auto"
              >
                <div className="relative w-full h-[256px] overflow-hidden">
                  <img
                    src={country.image}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                    alt={country.name}
                  />

                  <div className="absolute top-2 right-2 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        alert(`Add ${country.name} to list`);
                      }}
                      className="flex h-[24px] w-[32px] group-hover:w-[60px] items-center justify-center rounded-[8px] border border-white bg-[#00000066] group-hover:bg-[#1565C0] text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px]"
                    >
                      <Plus size={16} className="flex-shrink-0" />
                      <span className="max-w-0 opacity-0 group-hover:max-w-[40px] group-hover:opacity-100 group-hover:ml-[4px] text-[12px] font-inter font-normal whitespace-nowrap transition-all duration-300">
                        Add
                      </span>
                    </button>
                  </div>

                </div>

                <div className="w-full h-[75px] bg-white px-[16px] flex flex-col justify-center border-t border-[#C2DCF3]">
                  <h4 className="text-[20px] font-Inter font-bold text-[#194473] leading-none truncate group-hover:underline">
                    {country.name}
                  </h4>
                  <span className="text-[14px] font-Inter font-normal text-[#9E9E9E] mt-2">
                    {selectedContinent}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}