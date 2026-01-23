"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
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

export default function CreateTripPage() {
  const router = useRouter();

  // State สำหรับ Filter ต่างๆ
  const [activeContinent, setActiveContinent] = useState("All");
  const [activeLetter, setActiveLetter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Logic: Available Letters (ตัวอักษรที่มีในทวีปที่เลือก)
  const availableLetters = useMemo(() => {
    const countriesInContinent = ALL_COUNTRIES_FLAT.filter((country) =>
      activeContinent === "All" || country.continent === activeContinent
    );
    const letters = new Set(countriesInContinent.map((c) => c.name.charAt(0).toUpperCase()));
    return letters;
  }, [activeContinent]);

  // Logic: Filtered Countries (กรองข้อมูล)
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

  // ✅ ฟังก์ชันสำหรับสร้างทริป (นำทางไปหน้า Edit)
  const handleSelectCountry = (countryName: string) => {
    const code = getCountryCode(countryName);
    if (code) {
      router.push(`/mytrips/edit/${code.toLowerCase()}`);
    } else {
      alert("Sorry, configuration for this country is missing.");
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20">
      
      {/* Back Button (Optional: ถ้าต้องการปุ่มย้อนกลับแบบหน้าเดิม) */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[156px] pt-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-black transition"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-[156px] pt-4">

        {/* --- Header Section --- */}
        <div className="text-center mb-10 space-y-4">
          <h1 className="text-[48px] font-[900] md:text-4xl font-Inter text-[#000000]">
            Select a Destination
          </h1>
          <p className="text-[20px] font-Inter font-[400] text-[#000000] text-sm md:text-base">
            Choose a country to start planning your trip
          </p>

          {/* ✅ Search Bar (Style ตามต้นแบบ) */}
          <div className="relative max-w-[744px] mx-auto mt-6">
            <div className="flex items-center w-full max-w-[744px] h-[48px] gap-[8px] p-[8px] bg-[#194473] border border-[#E0E0E0] rounded-[16px] shadow-sm transition mx-auto">
              {/* Search Icon */}
              <Search className="w-[20px] h-[20px] text-white ml-2 flex-shrink-0" />
              
              {/* Input Field Container */}
              <div className="flex items-center flex-1 h-[32px] bg-[#FFFFFF] rounded-[8px] px-[8px] py-[4px]">
                <input
                  type="text"
                  placeholder="Search for a country..."
                  className="w-full h-full bg-transparent border-none outline-none text-[12px] font-inter font-[400] text-[#212121] placeholder-[#9E9E9E]"
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
              className={`h-[40px] min-w-[40px] px-[8px] flex items-center justify-center rounded-[8px] text-[20px] font-inter font-[400] leading-none border transition-all cursor-pointer ${
                activeContinent === "All"
                  ? "bg-[#194473] text-white border-[#C2DCF3]"
                  : "bg-white text-gray-600 border-[#1E518C] hover:bg-gray-50"
              }`}
            >
              All
            </button>
            {CONTINENTS.map((continent) => (
              <button
                key={continent}
                onClick={() => handleFilterChange(setActiveContinent, continent)}
                className={`h-[40px] min-w-[56px] px-[8px] flex items-center justify-center rounded-[8px] text-[20px] font-inter font-[400] leading-none border transition-all cursor-pointer ${
                  activeContinent === continent
                    ? "bg-[#194473] text-white border-[#C2DCF3]"
                    : "bg-white text-gray-600 border-[#1E518C] hover:bg-gray-50"
                }`}
              >
                {continent}
              </button>
            ))}
          </div>

          {/* Alphabet Filters */}
          <div className="flex items-center justify-center w-full max-w-[1128px] h-[40px] gap-[16px] mx-auto mb-10">
            <div className="flex items-center h-[24px]">
              <span className="text-[20px] font-inter font-[400] leading-none text-[#000000] whitespace-nowrap hidden md:block">
                Browse by letter:
              </span>
            </div>
            <div className="flex items-center flex-1 overflow-x-auto scrollbar-hide h-[40px] gap-[8px]">
              {ALPHABET.map((letter) => {
                const isAvailable = letter === "All" || availableLetters.has(letter);
                if (!isAvailable) return null;
                return (
                  <button
                    key={letter}
                    onClick={() => handleFilterChange(setActiveLetter, letter)}
                    className={`h-[40px] flex items-center justify-center rounded-[8px] border p-[8px] transition-all text-sm font-medium cursor-pointer flex-shrink-0
                    ${letter === "All" ? "w-[40px]" : "w-[30px]"} 
                    ${
                      activeLetter === letter
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

        {/* --- Countries Grid (Card Style) --- */}
        {filteredCountries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[25px]">
            {currentData.map((country, index) => (
              <div
                key={`${country.name}-${index}`}
                onClick={() => handleSelectCountry(country.name)} // ✅ เปลี่ยนเป็นฟังก์ชันสร้างทริป
                className="relative w-full max-w-[264px] h-[331px] rounded-[16px] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300 border border-[#1E518C] flex flex-col bg-white mx-auto"
              >
                {/* Image Section */}
                <div className="relative w-full h-[256px] overflow-hidden">
                  <img
                    src={country.image}
                    alt={country.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>
                {/* Content Section */}
                <div className="w-full h-[75px] bg-white px-[16px] flex flex-col justify-center border-t border-[#C2DCF3]">
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
              className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={16} className="text-white" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors cursor-pointer ${
                  currentPage === page
                    ? "bg-[#194473] text-white"
                    : "bg-[#9E9E9E] text-white hover:bg-gray-400"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={20} className="text-white" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper: แปลงชื่อประเทศเป็นรหัส ISO Code
const getCountryCode = (countryName: string): string => {
  const mapping: { [key: string]: string } = {
    "China": "CN", "Thailand": "TH", "Malaysia": "MY", "Japan": "JP", "United Arab Emirates": "AE", "Saudi Arabia": "SA", "Singapore": "SG", "Vietnam": "VN", "India": "IN", "South Korea": "KR", "Indonesia": "ID", "Taiwan": "TW", "Bahrain": "BH", "Kuwait": "KW", "Kazakhstan": "KZ", "Philippines": "PH", "Uzbekistan": "UZ", "Cambodia": "KH", "Jordan": "JO", "Laos": "LA", "Brunei": "BN", "Oman": "OM", "Qatar": "QA", "Sri Lanka": "LK", "Iran": "IR",
    "France": "FR", "Spain": "ES", "Italy": "IT", "Poland": "PL", "Hungary": "HU", "Croatia": "HR", "Turkey": "TR", "United Kingdom": "GB", "Germany": "DE", "Greece": "GR", "Denmark": "DK", "Austria": "AT", "Netherlands": "NL", "Portugal": "PT", "Romania": "RO", "Switzerland": "CH", "Belgium": "BE", "Latvia": "LV", "Georgia": "GE", "Sweden": "SE", "Lithuania": "LT", "Estonia": "EE", "Norway": "NO", "Finland": "FI", "Iceland": "IS",
    "United States": "US", "Mexico": "MX", "Canada": "CA", "Dominican Republic": "DO", "Bahamas": "BS", "Cuba": "CU", "Jamaica": "JM", "Costa Rica": "CR", "Guatemala": "GT", "Panama": "PA",
    "Argentina": "AR", "Brazil": "BR", "Chile": "CL", "Peru": "PE", "Paraguay": "PY", "Colombia": "CO", "Uruguay": "UY", "Ecuador": "EC",
    "South Africa": "ZA", "Morocco": "MA", "Egypt": "EG", "Kenya": "KE", "Namibia": "NA", "Tanzania": "TZ",
    "Australia": "AU", "New Zealand": "NZ"
  };
  return mapping[countryName] || "";
};