"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, UserPlus, Users, ChevronDown, Loader2, MapPin } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { COUNTRIES_DATA } from "@/data/mockData";

// ✅ 1. Import DatePicker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// ✅ 2. Config Locale (English)
import { registerLocale } from "react-datepicker";
import { enUS } from "date-fns/locale/en-US";
registerLocale('en-US', enUS);

export default function PlanNewTripForm() {
  const router = useRouter();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // --- Form States ---
  const [tripName, setTripName] = useState("");
  // ใช้ Type Date | null สำหรับ DatePicker
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  
  // --- UI States ---
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Helpers ---
  
  // แปลง Date เป็น string YYYY-MM-DD แบบ Local Time (แก้ปัญหา Timezone เพี้ยน)
  const formatDateForDB = (date: Date | null) => {
    if (!date) return null;
    const offset = date.getTimezoneOffset();
    const dateLocal = new Date(date.getTime() - (offset * 60 * 1000));
    return dateLocal.toISOString().split('T')[0];
  };

  // รวมรายชื่อประเทศ
  const allCountries = useMemo(() => {
    const countries: string[] = [];
    Object.values(COUNTRIES_DATA).forEach((continentList) => {
      continentList.forEach((country) => {
        if (!countries.includes(country.name)) {
          countries.push(country.name);
        }
      });
    });
    return countries.sort();
  }, []);

  // Filter ประเทศตอนพิมพ์
  useEffect(() => {
    if (!tripName.trim()) {
      setFilteredCountries(allCountries);
    } else {
      const lowerQuery = tripName.toLowerCase();
      const filtered = allCountries.filter(c => 
        c.toLowerCase().includes(lowerQuery)
      );
      setFilteredCountries(filtered);
    }
  }, [tripName, allCountries]);

  // ปิด Dropdown เมื่อคลิกข้างนอก
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectCountry = (country: string) => {
    setTripName(country);
    setIsDropdownOpen(false);
    setErrorMsg(null);
  };

  const handleStartPlanning = async () => {
    if (!tripName.trim()) {
      setErrorMsg("Please select a destination.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      // แปลงวันที่เป็น String format สำหรับ Database
      const formattedStart = formatDateForDB(startDate);
      const formattedEnd = formatDateForDB(endDate);

      const { data, error } = await supabase
        .from("itineraries")
        .insert([
          {
            profile_id: user?.id,
            name: tripName,
            start_date: formattedStart,
            end_date: formattedEnd,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      console.log("Trip created:", data);
      alert("Trip created successfully!");
      
      // Reset Form
      setTripName("");
      setStartDate(null);
      setEndDate(null);

      // Optional: Redirect
      // router.push(`/plan/${data.id}`);

    } catch (err: any) {
      console.error("Error creating trip:", err);
      setErrorMsg(err.message || "Failed to create trip.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-[8px] w-[493px]">
      
      {/* Header Section */}
      <div className="flex flex-col items-center gap-[24px] w-full self-stretch">
        <h2 className="font-inter font-bold text-[36px] leading-[44px] text-center text-[#000000]">
          Plan a new trip
        </h2>

        {/* Inputs Wrapper */}
        <div className="flex flex-col items-start gap-[4px] w-full self-stretch">
          <div className="flex flex-col items-start gap-[16px] w-full self-stretch">
            
            {/* --- Destination Input with Dropdown --- */}
            <div className="relative w-full" ref={dropdownRef}>
              <div className={`box-border flex flex-row items-center px-[8px] py-[12px] gap-[10px] w-full h-[46px] border ${errorMsg ? 'border-red-500' : 'border-[#E0E0E0]'} rounded-[8px] bg-white`}>
                <input 
                  type="text" 
                  value={tripName}
                  onChange={(e) => {
                    setTripName(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  placeholder="Where to ? e.g. Thailand , India, Japan" 
                  className="w-full font-inter font-bold text-[18px] leading-[22px] text-[#000000] outline-none placeholder:text-[#9E9E9E]"
                  disabled={isLoading}
                />
                {isDropdownOpen ? <ChevronDown className="w-5 h-5 text-gray-400 rotate-180 transition-transform" /> : <ChevronDown className="w-5 h-5 text-gray-400 transition-transform" />}
              </div>
              
              {isDropdownOpen && (
                <div className="absolute top-[50px] left-0 w-full max-h-[250px] overflow-y-auto bg-white border border-[#E0E0E0] rounded-[8px] shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                  {filteredCountries.length > 0 ? (
                    filteredCountries.map((country, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectCountry(country)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 flex items-center gap-2 transition-colors border-b border-gray-50 last:border-none"
                      >
                        <MapPin className="w-4 h-4 text-[#3A82CE]" />
                        <span className="font-inter text-[16px] text-[#212121]">{country}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-gray-400 text-sm text-center">No countries found</div>
                  )}
                </div>
              )}
            </div>
            {errorMsg && <span className="text-red-500 text-xs ml-1">{errorMsg}</span>}

            {/* --- Date Selection Input --- */}
            <div className="box-border flex flex-col items-start px-[8px] py-[6px] w-full h-[46px] border border-[#E0E0E0] rounded-[8px] bg-white relative">
               
               <span className="font-inter font-bold text-[12px] leading-[15px] text-[#000000] mb-[2px]">
                  Dates (optional)
               </span>

               <div className="flex flex-row items-center w-full h-[16px] gap-[60px]">
                  
                  {/* Start Date Picker */}
                  <div className="flex flex-row items-end gap-[8px] w-[120px] group relative">
                      <Calendar className="w-[16px] h-[16px] text-[#212121] mb-[1px]" />
                      <DatePicker 
                        selected={startDate}
                        // ✅ Fix 1: ระบุ Type ให้ date เป็น Date | null
                        onChange={(date: Date | null) => setStartDate(date)}
                        selectsStart
                        startDate={startDate}
                        endDate={endDate}
                        placeholderText="Start date"
                        dateFormat="dd/MM/yyyy"
                        locale="en-US"
                        className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] outline-none bg-transparent w-full p-0 border-none focus:ring-0 cursor-pointer placeholder:text-[#9E9E9E]"
                        disabled={isLoading}
                      />
                  </div>

                  <div className="absolute left-[135px] top-[24px] w-[16px] h-[0px] border-[0.2px] border-black rotate-90"></div>

                  {/* End Date Picker */}
                  <div className="flex flex-row items-end gap-[8px] w-[120px] group relative ml-4">
                      <Calendar className="w-[16px] h-[16px] text-[#212121] mb-[1px]" />
                      <DatePicker 
                        selected={endDate}
                        onChange={(date: Date | null) => setEndDate(date)}
                        selectsEnd
                        startDate={startDate}
                        endDate={endDate}
                        // ✅ Fix 2: ใช้ ?? undefined เพื่อแปลง null เป็น undefined
                        minDate={startDate ?? undefined} 
                        placeholderText="End date"
                        dateFormat="dd/MM/yyyy"
                        locale="en-US"
                        className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] outline-none bg-transparent w-full p-0 border-none focus:ring-0 cursor-pointer placeholder:text-[#9E9E9E]"
                        disabled={isLoading}
                      />
                  </div>

               </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col items-center gap-[24px] w-full self-stretch mt-4">
          
          <div className="flex flex-row justify-between items-center w-full h-[24px]">
              <button type="button" className="flex flex-row items-center gap-[8px] hover:opacity-70 transition-opacity">
                  <div className="w-[16px] h-[16px] flex items-center justify-center">
                      <UserPlus className="w-[16px] h-[16px] text-[#9E9E9E]" />
                  </div>
                  <span className="font-inter font-normal text-[12px] leading-[15px] text-[#9E9E9E]">
                      Invite tripmates
                  </span>
              </button>

              <button type="button" className="flex flex-row justify-between items-center px-[8px] py-[4px] gap-[8px] w-[125px] h-[24px] rounded-[8px] hover:bg-gray-100 transition-colors">
                  <div className="flex flex-row items-start gap-[6px]">
                      <Users className="w-[16px] h-[16px] text-[#212121]" />
                      <span className="font-inter font-normal text-[12px] leading-[15px] text-[#212121]">
                          Friends
                      </span>
                  </div>
                  <ChevronDown className="w-[16px] h-[16px] text-[#212121]" />
              </button>
          </div>

          <button 
            onClick={handleStartPlanning}
            disabled={isLoading}
            className="box-border flex flex-row justify-center items-center px-[16px] py-[12px] gap-[8px] w-[112px] h-[39px] bg-[#3A82CE] border border-[#C2DCF3] rounded-[8px] hover:bg-[#3272b5] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {isLoading ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <span className="font-inter font-normal text-[12px] leading-[15px] text-[#FFFFFF]">
                    Start planning
                </span>
              )}
          </button>

      </div>

    </div>
  );
}