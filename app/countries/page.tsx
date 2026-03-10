"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Search, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { COUNTRIES_DATA, CONTINENTS } from "@/data/mockData";

// รวมข้อมูลประเทศทั้งหมดให้อยู่ใน Array เดียว และเพิ่ม field 'continent' เข้าไปใน object
const ALL_COUNTRIES_FLAT = Object.entries(COUNTRIES_DATA).flatMap(([continent, countries]) =>
    countries.map((country) => ({
        ...country,
        continent: continent,
    }))
);

const ITEMS_PER_PAGE = 12; // จำนวนประเทศต่อ 1 หน้า
const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function AllCountriesPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // State สำหรับ Filter ต่างๆ
    const [activeContinent, setActiveContinent] = useState("All");
    const [activeLetter, setActiveLetter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // State & Ref สำหรับ Dropdown เลือกทวีปบนมือถือ
    const [isContinentDropdownOpen, setIsContinentDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // ปิด Dropdown เมื่อคลิกที่อื่น
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsContinentDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // ดึงค่า continent จาก URL
    useEffect(() => {
        const continentParam = searchParams.get("continent");
        if (continentParam && CONTINENTS.includes(continentParam)) {
            setActiveContinent(continentParam);
        } else {
            setActiveContinent("All");
        }
    }, [searchParams]);

    // Logic: Available Letters
    const availableLetters = useMemo(() => {
        const countriesInContinent = ALL_COUNTRIES_FLAT.filter((country) =>
            activeContinent === "All" || country.continent === activeContinent
        );
        const letters = new Set(countriesInContinent.map((c) => c.name.charAt(0).toUpperCase()));
        return letters;
    }, [activeContinent]);

    // Logic: Filtered Countries
    const filteredCountries = useMemo(() => {
        return ALL_COUNTRIES_FLAT.filter((country) => {
            const matchContinent = activeContinent === "All" || country.continent === activeContinent;
            const matchLetter = activeLetter === "All" || country.name.startsWith(activeLetter);
            const matchSearch = country.name.toLowerCase().startsWith(searchQuery.toLowerCase());
            return matchContinent && matchLetter && matchSearch;
        }).sort((a, b) => a.name.localeCompare(b.name));
    }, [activeContinent, activeLetter, searchQuery]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
    const currentData = filteredCountries.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    // ✅ ฟังก์ชันสร้าง Array สำหรับ Pagination แบบมีจุดไข่ปลา
    const getPaginationGroup = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5; // จำนวนช่องที่จะโชว์สูงสุดเมื่อมี "..." (ไม่รวมปุ่มลูกศร)

        if (totalPages <= maxVisiblePages) {
            // ถ้าหน้าน้อยกว่าหรือเท่ากับ 5 โชว์ทุกหน้าเลย ไม่ต้องมี ...
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // ถ้าหน้าเยอะ ต้องเริ่มคำนวณ ...
            if (currentPage <= 3) {
                // อยู่หน้าแรกๆ: [1, 2, 3, 4, ..., สุดท้าย]
                pageNumbers.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                // อยู่หน้าท้ายๆ: [1, ..., n-3, n-2, n-1, สุดท้าย]
                pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                // อยู่ตรงกลาง: [1, ..., หน้าก่อน, ปัจจุบัน, หน้าถัดไป, ..., สุดท้าย]
                pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pageNumbers;
    };

    return (
        <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
            {/* Breadcrumb */}
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[156px] pt-4 md:pt-6 mb-2 md:mb-4">
                <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[12px] md:text-[14px] leading-[100%] text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="text-[#101828] hover:underline cursor-pointer" onClick={() => router.push(`/countries`)}>All countries</span>
                </div>
            </div>

            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-8 lg:px-[156px] pt-4 md:pt-10">

                {/* --- Header Section --- */}
                <div className="text-center mb-6 md:mb-10 space-y-3 md:space-y-4">
                    <h1 className="text-[28px] md:text-[48px] font-[900] font-Inter text-[#000000] leading-tight">
                        Discover Amazing Destinations Worldwide
                    </h1>
                    <p className="text-[14px] md:text-[20px] font-Inter font-[400] text-[#000000]">
                        Explore countries from all continents in alphabetical order
                    </p>

                    {/* Search Bar Responsive */}
                    <div className="relative w-full max-w-[744px] mx-auto mt-4 md:mt-6">
                        <div className="flex items-center w-full h-[40px] md:h-[48px] gap-[8px] p-[6px] md:p-[8px] bg-[#194473] border border-[#E0E0E0] rounded-[12px] md:rounded-[16px] shadow-sm transition">
                            <Search className="w-[18px] h-[18px] md:w-[20px] md:h-[20px] text-white ml-1" />
                            <div className="flex items-center flex-1 h-full bg-[#FFFFFF] rounded-[6px] md:rounded-[8px] px-[8px]">
                                <input
                                    type="text"
                                    placeholder="Search for a country, city..."
                                    className="w-full h-full bg-transparent border-none outline-none text-[13px] md:text-[14px] font-inter font-[400] text-[#212121] placeholder-[#9E9E9E]"
                                    value={searchQuery}
                                    onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Filters Section --- */}
                <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 w-full relative z-20">
                    
                    {/* Continent: Desktop (Tabs) | Mobile (Dropdown) */}
                    <div className="w-full max-w-[744px] mx-auto">
                        <div className="hidden md:flex flex-wrap justify-center gap-[16px]">
                            <button
                                onClick={() => handleFilterChange(setActiveContinent, "All")}
                                className={`h-[40px] min-w-[40px] px-[8px] flex items-center justify-center rounded-[8px] text-[20px] font-inter font-[400] leading-none border transition-all cursor-pointer ${activeContinent === "All"
                                    ? "bg-[#194473] text-white border-[#C2DCF3]"
                                    : "bg-white text-gray-600 border-[#1E518C] hover:bg-gray-50"
                                    }`}
                            >
                                All
                            </button>
                            {CONTINENTS.map((continent) => (
                                <button
                                    key={`desk-${continent}`}
                                    onClick={() => handleFilterChange(setActiveContinent, continent)}
                                    className={`h-[40px] min-w-[56px] px-[8px] flex items-center justify-center rounded-[8px] text-[20px] font-inter font-[400] leading-none border transition-all cursor-pointer ${activeContinent === continent
                                        ? "bg-[#194473] text-white border-[#C2DCF3]"
                                        : "bg-white text-gray-600 border-[#1E518C] hover:bg-gray-50"
                                        }`}
                                >
                                    {continent}
                                </button>
                            ))}
                        </div>

                        <div className="md:hidden relative w-full" ref={dropdownRef}>
                            <button
                                onClick={() => setIsContinentDropdownOpen(!isContinentDropdownOpen)}
                                className="w-full h-[44px] bg-[#F5F5F5] border border-[#E0E0E0] rounded-[8px] flex items-center justify-between px-[16px] text-[#194473] font-bold text-[14px]"
                            >
                                <span>{activeContinent === "All" ? "All Continents" : activeContinent}</span>
                                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isContinentDropdownOpen ? "rotate-180" : ""}`} />
                            </button>

                            {isContinentDropdownOpen && (
                                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div
                                        onClick={() => { handleFilterChange(setActiveContinent, "All"); setIsContinentDropdownOpen(false); }}
                                        className={`w-full px-[16px] py-[12px] text-left text-[14px] font-medium transition-colors cursor-pointer border-b border-gray-100 last:border-none ${activeContinent === "All" ? "bg-[#DEECF9] text-[#194473]" : "text-[#616161] hover:bg-gray-50"}`}
                                    >
                                        All Continents
                                    </div>
                                    {CONTINENTS.map((cont) => (
                                        <div
                                            key={`mob-${cont}`}
                                            onClick={() => { handleFilterChange(setActiveContinent, cont); setIsContinentDropdownOpen(false); }}
                                            className={`w-full px-[16px] py-[12px] text-left text-[14px] font-medium transition-colors cursor-pointer border-b border-gray-100 last:border-none ${activeContinent === cont ? "bg-[#DEECF9] text-[#194473]" : "text-[#616161] hover:bg-gray-50"}`}
                                        >
                                            {cont}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Alphabet Filters: Desktop (Flex) | Mobile (Grid 3x9) */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-center w-full max-w-[1128px] mx-auto gap-[8px] md:gap-[16px] mb-6 md:mb-10">
                        <div className="flex items-center shrink-0 w-full md:w-auto justify-start md:justify-center px-1 md:px-0">
                            <span className="text-[14px] md:text-[20px] font-inter font-semibold md:font-[400] leading-none text-[#194473] md:text-[#000000] whitespace-nowrap">
                                Browse by letter:
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-9 gap-[4px] sm:gap-[6px] w-full md:flex md:w-[950px] md:h-[40px] md:gap-[8px]">
                            {ALPHABET.map((letter) => {
                                const isAvailable = letter === "All" || availableLetters.has(letter);
                                
                                if (!isAvailable) return null;
                                
                                return (
                                    <button
                                        key={letter}
                                        onClick={() => handleFilterChange(setActiveLetter, letter)}
                                        className={`flex items-center justify-center rounded-[6px] md:rounded-[8px] border transition-all text-[11px] sm:text-[13px] md:text-sm font-medium cursor-pointer 
                                        h-[32px] sm:h-[36px] md:h-[40px] md:p-[8px] shrink-0
                                        ${letter === "All" ? "md:w-[40px] col-span-2 md:col-span-1" : "md:w-[30px]"} 
                                        ${activeLetter === letter
                                                ? "bg-[#194473] text-white border-[#C2DCF3] shadow-md"
                                                : "bg-white text-gray-600 border-[#1E518C] hover:bg-gray-50"
                                            }`}
                                    >
                                        {letter}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- Countries Grid --- */}
                {filteredCountries.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[16px] md:gap-[25px]">
                        {currentData.map((country, index) => {
                           const isRiskySource = !country.image.includes('supabase.co') && !country.image.includes('unsplash.com');
                           return (
                            <div
                                key={`${country.name}-${index}`}
                                onClick={() => router.push(`/explore?country=${country.name}`)}
                                className="relative w-full aspect-[4/3] md:aspect-auto md:h-[331px] rounded-[12px] md:rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 md:border-[#1E518C] flex flex-col bg-white mx-auto"
                            >
                                <div className="relative w-full flex-1 md:h-[256px] overflow-hidden">
                                    <Image
                                        src={country.image}
                                        alt={country.name}
                                        fill
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                        sizes="(max-width: 768px) 50vw, 25vw"
                                        unoptimized={isRiskySource}
                                    />
                                </div>
                                <div className="w-full h-[50px] md:h-[75px] bg-white px-[12px] md:px-[16px] flex flex-col justify-center border-t border-gray-100 md:border-[#C2DCF3] shrink-0">
                                    <h4 className="text-[14px] md:text-[20px] font-inter font-bold text-[#194473] leading-none truncate group-hover:underline">
                                        {country.name}
                                    </h4>
                                    <span className="text-[11px] md:text-[14px] font-inter font-normal text-[#9E9E9E] mt-1 md:mt-1">
                                        {country.continent}
                                    </span>
                                </div>
                            </div>
                        )})}
                    </div>
                ) : (
                    <div className="text-center py-20 px-4">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No countries found</h3>
                        <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setActiveContinent("All");
                                setActiveLetter("All");
                            }}
                            className="mt-4 text-[#1976D2] font-medium hover:underline px-4 py-2 bg-blue-50 rounded-full"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* --- Pagination (ตรงตามรูปภาพตัวอย่าง) --- */}
                {totalPages > 1 && (
                    <div className="flex justify-center md:justify-start items-center gap-[8px] mt-10 md:mt-12 font-inter">
                        {/* ปุ่มกลับ (Previous) */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className={`flex items-center justify-center w-[36px] h-[32px] md:w-[32px] md:h-[24px] rounded-[4px] border border-[#EEEEEE] transition cursor-pointer
                                ${currentPage === 1 
                                    ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed" // สีเทาอ่อนตอนกดไม่ได้
                                    : "bg-[#9E9E9E] hover:bg-gray-500" // สีเทาเข้มตอนกดได้
                                }`}
                        >
                            <ChevronLeft size={18} className="text-white" />
                        </button>

                        {/* ปุ่มตัวเลขและจุดไข่ปลา */}
                        <div className="flex items-center gap-[6px] md:gap-[8px]">
                            {getPaginationGroup().map((item, index) => {
                                if (item === '...') {
                                    return (
                                        <span key={`dots-${index}`} className="flex items-center justify-center text-[16px] md:text-[14px] font-bold text-[#194473] tracking-[2px] pb-1 px-1">
                                            ...
                                        </span>
                                    );
                                }

                                const page = item as number;
                                const isActive = currentPage === page;

                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`flex items-center justify-center w-[32px] h-[32px] md:w-[25px] md:h-[25px] rounded-[4px] border text-[14px] md:text-[12px] font-medium transition-colors cursor-pointer 
                                            ${isActive
                                                ? "bg-[#194473] text-white border-[#194473]" // สีน้ำเงินเข้มตอน Active
                                                : "bg-[#9E9E9E] text-white border-[#EEEEEE] hover:bg-gray-500" // สีเทาตอนปกติ
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}
                        </div>

                        {/* ปุ่มถัดไป (Next) */}
                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className={`flex items-center justify-center w-[36px] h-[32px] md:w-[32px] md:h-[24px] rounded-[4px] border border-[#EEEEEE] transition cursor-pointer
                                ${currentPage === totalPages 
                                    ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed" // สีเทาอ่อนตอนกดไม่ได้
                                    : "bg-[#9E9E9E] hover:bg-gray-500" // สีเทาเข้มตอนกดได้
                                }`}
                        >
                            <ChevronRight size={18} className="text-white" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}