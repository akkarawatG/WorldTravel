"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { COUNTRIES_DATA, CONTINENTS } from "@/data/mockData";

// รวมข้อมูลประเทศทั้งหมดให้อยู่ใน Array เดียว และเพิ่ม field 'continent' เข้าไปใน object
const ALL_COUNTRIES_FLAT = Object.entries(COUNTRIES_DATA).flatMap(([continent, countries]) =>
    countries.map((country) => ({
        ...country,
        continent: continent, // เพิ่มชื่อทวีปติดไปกับประเทศด้วย เพื่อใช้แสดงผล
    }))
);

const ITEMS_PER_PAGE = 12; // จำนวนประเทศต่อ 1 หน้า
const ALPHABET = ["All", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")];

export default function AllCountriesPage() {
    const router = useRouter();

    // State สำหรับ Filter ต่างๆ
    const [activeContinent, setActiveContinent] = useState("All");
    const [activeLetter, setActiveLetter] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // ✅ Logic 1: คำนวณว่าในทวีปที่เลือก มีตัวอักษรขึ้นต้นอะไรบ้าง
    const availableLetters = useMemo(() => {
        // ดึงประเทศทั้งหมดในทวีปที่เลือก
        const countriesInContinent = ALL_COUNTRIES_FLAT.filter((country) =>
            activeContinent === "All" || country.continent === activeContinent
        );

        // ดึงตัวอักษรแรกของแต่ละประเทศมาเก็บไว้ (ใช้ Set เพื่อไม่ให้ซ้ำ)
        const letters = new Set(countriesInContinent.map((c) => c.name.charAt(0).toUpperCase()));
        return letters;
    }, [activeContinent]);


    const filteredCountries = useMemo(() => {
        return ALL_COUNTRIES_FLAT.filter((country) => {
            // 1. กรองตามทวีป
            const matchContinent =
                activeContinent === "All" || country.continent === activeContinent;

            // 2. กรองตามตัวอักษรแรก (A-Z)
            const matchLetter =
                activeLetter === "All" || country.name.startsWith(activeLetter);

            // 3. กรองตามคำค้นหา (Search) -> แก้ตรงนี้
            const matchSearch = country.name
                .toLowerCase()
                .startsWith(searchQuery.toLowerCase()); // ✅ เปลี่ยนจาก includes เป็น startsWith

            return matchContinent && matchLetter && matchSearch;
        }).sort((a, b) => a.name.localeCompare(b.name)); // เรียงตามตัวอักษร A-Z
    }, [activeContinent, activeLetter, searchQuery]);

    // Logic การแบ่งหน้า (Pagination)
    const totalPages = Math.ceil(filteredCountries.length / ITEMS_PER_PAGE);
    const currentData = filteredCountries.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    // Reset หน้าเป็น 1 ทุกครั้งที่มีการเปลี่ยน Filter
    const handleFilterChange = (setter: any, value: any) => {
        setter(value);
        setCurrentPage(1);
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF]-50 pb-20">
            {/* Breadcrumb */}
            <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
                <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/countries`)}>All countries</span>
                </div>
            </div>

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[156px] pt-10">

                {/* --- Header Section --- */}
                <div className="text-center mb-10 space-y-4">
                    <h1 className="text-[48px] font-[900] md:text-4xl font-Inter text-[#000000]">
                        Discover Amazing Destinations Worldwide
                    </h1>
                    <p className="text-[20px] font-Inter font-[400] text-[#000000] text-sm md:text-base">
                        Explore countries from all continents in alphabetical order
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-[744px] mx-auto mt-6">
                        <div className="flex items-center w-[744px] h-[48px] gap-[8px] p-[8px] bg-[#194473] border border-[#E0E0E0] rounded-[16px] shadow-sm transition">
                            {/* Search Icon */}
                            <Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" />

                            {/* Input Field Container */}
                            <div className="flex items-center w-[688px] h-[32px] bg-[#FFFFFF] rounded-[8px] px-[8px] py-[4px]">
                                <input
                                    type="text"
                                    placeholder="Search for a country, city..."
                                    className="w-full h-full bg-transparent border-none outline-none text-[12px] font-inter font-[400] text-[#9E9E9E] leading-none placeholder-[#9E9E9E]"
                                    value={searchQuery}
                                    onChange={(e) => handleFilterChange(setSearchQuery, e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Filters Section --- */}
                <div className="space-y-6 mb-10">

                    {/* Continent Tabs */}
                    <div className="flex flex-wrap justify-center gap-[16px]">
                        <button
                            onClick={() => handleFilterChange(setActiveContinent, "All")}
                            className={`h-[40px] min-w-[40px] px-[8px] flex items-center justify-center rounded-[8px] text-[20px] font-inter font-[400] leading-none border transition-all ${activeContinent === "All"
                                ? "bg-[#194473] text-white border-[#C2DCF3]"
                                : "bg-white text-gray-600 border-[#C2DCF3] hover:bg-gray-50"
                                }`}
                        >
                            All
                        </button>
                        {CONTINENTS.map((continent) => (
                            <button
                                key={continent}
                                onClick={() => handleFilterChange(setActiveContinent, continent)}
                                className={`h-[40px] min-w-[56px] px-[8px] flex items-center justify-center rounded-[8px] text-[20px] font-inter font-[400] leading-none border transition-all ${activeContinent === continent
                                    ? "bg-[#194473] text-white border-[#C2DCF3]"
                                    : "bg-white text-gray-600 border-[#C2DCF3] hover:bg-gray-50"
                                    }`}
                            >
                                {continent}
                            </button>
                        ))}
                    </div>

                    {/* Alphabet Filters */}
                    <div className="flex items-center justify-center w-[1128px] h-[40px] gap-[16px] mx-auto mb-10">

                        {/* Label Container (162px) */}
                        <div className="flex items-center w-[162px] h-[24px]">
                            <span className="text-[20px] font-inter font-[400] leading-none text-[#000000] whitespace-nowrap">
                                Browse by letter:
                            </span>
                        </div>

                        {/* Button Container (950px) */}
                        <div className="flex items-center w-[950px] h-[40px] gap-[8px]">
                            {ALPHABET.map((letter) => {
                                // ✅ เช็คว่าตัวอักษรนี้มีข้อมูลในทวีปปัจจุบันหรือไม่
                                const isAvailable = letter === "All" || availableLetters.has(letter);

                                // 🔴 แก้ไข: ถ้าไม่มีข้อมูล ให้ return null (ไม่แสดงปุ่มเลย)
                                if (!isAvailable) return null;

                                return (
                                    <button
                                        key={letter}
                                        onClick={() => handleFilterChange(setActiveLetter, letter)}
                                        className={`h-[40px] flex items-center justify-center rounded-[8px] border p-[8px] transition-all text-sm font-medium 
                                        ${letter === "All" ? "w-[40px]" : "w-[30px]"} 
                                        ${activeLetter === letter
                                                ? "bg-[#194473] text-white border-[#C2DCF3] shadow-md" // สไตล์ Active
                                                : "bg-white text-gray-600 border-[#C2DCF3] hover:bg-gray-50" // สไตล์ Normal
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px]">
                        {currentData.map((country, index) => (
                            <div
                                key={`${country.name}-${index}`}
                                onClick={() => router.push(`/explore?country=${country.name}`)}
                                // overflow-hidden ตรงนี้จะช่วยตัดส่วนที่รูปซูมเกินออกไป ทำให้ขนาดการ์ดเท่าเดิม
                                className="relative w-full max-w-[264px] h-[331px] rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-[#C2DCF3] flex flex-col bg-white mx-auto"
                            >
                                {/* Image Section (Top 256px) */}
                                <div className="relative w-full h-[256px] overflow-hidden">
                                    <img
                                        src={country.image}
                                        alt={country.name}
                                        /* 1. ใส่ group-hover:scale-110 กลับมาเพื่อให้รูปซูม */
                                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                    />
                                    {/* Add Button (Top Right) */}
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

                                {/* Content Section (Bottom 75px) */}
                                <div className="w-full h-[75px] bg-white px-[16px] flex flex-col justify-center border-t border-[#C2DCF3]">
                                    {/* 2. เพิ่ม group-hover:underline ตรงนี้ */}
                                    <h4 className="text-[20px] font-inter font-bold text-[#194473] leading-none truncate group-hover:underline">
                                        {country.name}
                                    </h4>
                                    <span className="text-[14px] font-inter font-normal text-[#9E9E9E] mt-1 ">
                                        {country.continent}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Empty State */
                    <div className="text-center py-20">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No countries found</h3>
                        <p className="text-gray-500">Try adjusting your search or filters.</p>
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setActiveContinent("All");
                                setActiveLetter("All");
                            }}
                            className="mt-4 text-[#1976D2] hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}

                {/* --- Pagination --- */}
                {totalPages > 1 && (
                    <div className="flex justify-start items-center gap-[8px] mt-12">
                        <button
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronLeft size={16} className="text-white" />
                        </button>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors ${currentPage === page
                                    ? "bg-[#194473] text-white" // Active State (คงสีน้ำเงินไว้เพื่อบอกสถานะ)
                                    : "bg-[#9E9E9E] text-white hover:bg-gray-400" // Normal State (ตามสเปกใหม่)
                                    }`}
                            >
                                {page}
                            </button>
                        ))}

                        <button
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight size={20} className="text-white" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}