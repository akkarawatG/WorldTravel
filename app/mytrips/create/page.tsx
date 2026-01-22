"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Globe, ChevronLeft } from "lucide-react";
import ReactCountryFlag from "react-country-flag";
import { COUNTRIES_DATA } from "@/data/mockData"; // ตรวจสอบ path ให้ตรงกับโครงสร้างโปรเจคจริง

export default function CreateTripPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // รวมประเทศทั้งหมดจากทุกทวีปใน COUNTRIES_DATA มาเป็น Array เดียว
  const allCountries = Object.values(COUNTRIES_DATA).flat();

  // กรองตามคำค้นหา
  const filteredCountries = allCountries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ ฟังก์ชันที่ปรับปรุงแล้ว: นำทางไปยังหน้า Edit
  const handleSelectCountry = (countryName: string) => {
    // 1. หา Country Code (เช่น TH, JP)
    const code = getCountryCode(countryName);

    if (code) {
      // 2. ส่งไปยังหน้า /edit/[id] โดยใช้ตัวพิมพ์เล็ก (เช่น /edit/th)
      router.push(`/mytrips/edit/${code.toLowerCase()}`);
    } else {
      // กรณีหา Code ไม่เจอ (ป้องกัน Error)
      alert("Sorry, configuration for this country is missing.");
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pb-20">
      {/* Header */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-black mb-6 transition"
        >
          <ChevronLeft className="w-5 h-5" /> Back
        </button>

        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-black text-gray-900">Select a Country</h1>
        </div>
        <p className="text-gray-500 mb-8 ml-11">
          Choose which country you want to map your travels
        </p>

        {/* Search Bar */}
        <div className="relative mb-10">
          <input
            type="text"
            placeholder="Search countries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl py-4 pl-12 pr-4 text-lg outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
          />
          <Search className="absolute left-4 top-4.5 w-5 h-5 text-gray-400" />
        </div>

        {/* Countries Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCountries.map((country, index) => {
            const countryCode = getCountryCode(country.name);
            
            return (
              <button
                key={`${country.name}-${index}`}
                onClick={() => handleSelectCountry(country.name)} // ✅ เรียกใช้ฟังก์ชันนำทาง
                className="flex flex-col items-center justify-center p-8 bg-white border border-gray-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:bg-blue-50/30 transition-all duration-300 group"
              >
                {/* Flag Display using Library */}
                <div className="w-20 h-14 mb-4 rounded-lg overflow-hidden shadow-sm border border-gray-100 flex items-center justify-center bg-gray-50">
                  {countryCode ? (
                    <ReactCountryFlag
                      countryCode={countryCode}
                      svg
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      aria-label={country.name}
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Flag</span>
                  )}
                </div>

                <span className="font-bold text-lg text-gray-800 group-hover:text-blue-700 text-center">
                  {country.name}
                </span>
              </button>
            );
          })}

          {filteredCountries.length === 0 && (
            <div className="col-span-full text-center py-20 text-gray-400">
              No countries found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Helper: แปลงชื่อประเทศเป็นรหัส ISO Code สำหรับ ReactCountryFlag
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