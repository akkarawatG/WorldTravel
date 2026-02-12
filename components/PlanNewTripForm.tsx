"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar, UserPlus, Users, ChevronDown, Loader2, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { COUNTRIES_DATA } from "@/data/mockData";

// --- Custom Date Picker (Component ภายใน) ---
function CustomDateRangePicker({ startDate, endDate, onChange, onClose }: { startDate: string, endDate: string, onChange: (s: string, e: string) => void, onClose: () => void }) {
    const initialDate = startDate ? new Date(startDate) : new Date();
    const [viewDate, setViewDate] = useState(initialDate);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        const offset = clickedDate.getTimezoneOffset();
        const localDate = new Date(clickedDate.getTime() - (offset * 60 * 1000));
        const dateStr = localDate.toISOString().split('T')[0];
        
        if (!startDate || (startDate && endDate)) {
            onChange(dateStr, "");
        } else if (startDate && !endDate) {
            if (new Date(dateStr) < new Date(startDate)) {
                onChange(dateStr, startDate);
            } else {
                onChange(startDate, dateStr);
            }
        }
    };

    const isSelected = (day: number) => {
        const d = new Date(year, month, day).setHours(0, 0, 0, 0);
        const s = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const e = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

        if (s && d === s) return "start";
        if (e && d === e) return "end";
        if (s && e && d > s && d < e) return "range";
        return null;
    };

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    return (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                <span className="font-bold text-gray-800 text-[14px] font-inter">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                    <div key={d} className="text-[12px] font-medium text-gray-400 font-inter">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
                {Array.from({ length: (startDay === 0 ? 6 : startDay - 1) }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = isSelected(day);
                    let bgClass = "hover:bg-blue-50 text-gray-700";
                    let textClass = "text-gray-700";
                    
                    if (status === 'start' || status === 'end') {
                        bgClass = "bg-[#3A82CE] hover:bg-[#2c6cb0]";
                        textClass = "text-white font-bold";
                    }
                    if (status === 'range') {
                        bgClass = "bg-[#E3F2FD]";
                        textClass = "text-[#1565C0]";
                    }

                    return (
                        <button key={day} onClick={() => handleDayClick(day)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition mx-auto font-inter ${bgClass} ${textClass}`}>
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
                <button onClick={onClose} className="bg-[#3A82CE] text-white text-[12px] font-medium px-4 py-1.5 rounded-[5px] hover:bg-[#2c6cb0] transition shadow-sm font-inter">
                    Done
                </button>
            </div>
        </div>
    );
}

interface PlanNewTripFormProps {
    onSuccess?: () => void;
}

// --- Main Form Component ---
export default function PlanNewTripForm({ onSuccess }: PlanNewTripFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Form States
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // UI States
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  useEffect(() => {
    if (!tripName.trim()) {
      setFilteredCountries(allCountries);
    } else {
      const lowerQuery = tripName.toLowerCase();
      const filtered = allCountries.filter(c => c.toLowerCase().includes(lowerQuery));
      setFilteredCountries(filtered);
    }
  }, [tripName, allCountries]);

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

      // 1. Insert ลงตาราง itineraries
      const { data: itineraryData, error: itineraryError } = await supabase
        .from("itineraries")
        .insert([
          {
            profile_id: user?.id,
            name: tripName,
            start_date: startDate || null,
            end_date: endDate || null,
          },
        ])
        .select()
        .single();

      if (itineraryError) throw itineraryError;

      // ✅ 2. สร้างข้อมูลวัน (Daily Schedules) เตรียมไว้ทันที
      let diffDays = 1; // ค่าเริ่มต้นถ้าไม่ได้เลือกวัน
      if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffTime = end.getTime() - start.getTime();
          if (diffTime >= 0) {
              diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          }
      }

      const dailySchedulesToInsert = [];
      for (let i = 1; i <= diffDays; i++) {
          dailySchedulesToInsert.push({
              itinerary_id: itineraryData.id,
              day_number: i
          });
      }

      const { error: scheduleError } = await supabase
          .from('daily_schedules')
          .insert(dailySchedulesToInsert);

      if (scheduleError) throw scheduleError;

      console.log("Trip and schedules created:", itineraryData);
      
      setTripName("");
      setStartDate("");
      setEndDate("");
      
      if (onSuccess) onSuccess();

    } catch (err: any) {
      console.error("Error creating trip:", err);
      setErrorMsg(err.message || "Failed to create trip.");
    } finally {
      setIsLoading(false);
    }
  };

  const displayDate = (dateStr: string) => {
      if (!dateStr) return "";
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="flex flex-col items-start gap-[8px] w-[493px] relative">
      <div className="flex flex-col items-center gap-[24px] w-full self-stretch">
        <h2 className="font-inter font-bold text-[36px] leading-[44px] text-center text-[#000000]">
          Plan a new trip
        </h2>
        <div className="flex flex-col items-start gap-[4px] w-full self-stretch">
          <div className="flex flex-col items-start gap-[16px] w-full self-stretch">
            
            {/* Destination Input */}
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
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
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

            {/* Date Selection Input */}
            <div 
                className="box-border flex flex-col items-start px-[8px] py-[6px] w-full h-[46px] border border-[#E0E0E0] rounded-[8px] bg-white relative cursor-pointer hover:border-[#3A82CE] transition"
                onClick={() => setIsDatePickerOpen(true)}
            >
               <span className="font-inter font-bold text-[12px] leading-[15px] text-[#000000] mb-[2px]">
                  Dates (optional)
               </span>

               <div className="flex flex-row items-center w-full h-[16px] gap-[60px]">
                  <div className="flex flex-row items-end gap-[8px] w-[120px]">
                      <Calendar className="w-[16px] h-[16px] text-[#212121] mb-[1px]" />
                      <span className={`font-inter font-normal text-[12px] leading-[15px] ${startDate ? 'text-[#000000]' : 'text-[#9E9E9E]'}`}>
                          {startDate ? displayDate(startDate) : "Start date"}
                      </span>
                  </div>
                  <div className="absolute left-[135px] top-[24px] w-[16px] h-[0px] border-[0.2px] border-black rotate-90"></div>
                  <div className="flex flex-row items-end gap-[8px] w-[120px] ml-4">
                      <Calendar className="w-[16px] h-[16px] text-[#212121] mb-[1px]" />
                      <span className={`font-inter font-normal text-[12px] leading-[15px] ${endDate ? 'text-[#000000]' : 'text-[#9E9E9E]'}`}>
                          {endDate ? displayDate(endDate) : "End date"}
                      </span>
                  </div>
               </div>
            </div>

            {/* Modal Date Picker Overlay */}
            {isDatePickerOpen && (
                <div 
                    className="absolute top-[160px] left-0 z-[100] w-full flex justify-center"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="fixed inset-0 z-[90]" onClick={() => setIsDatePickerOpen(false)}></div>
                    <div className="relative z-[100]">
                        <CustomDateRangePicker 
                            startDate={startDate}
                            endDate={endDate}
                            onChange={(start, end) => {
                                setStartDate(start);
                                setEndDate(end);
                            }}
                            onClose={() => setIsDatePickerOpen(false)}
                        />
                    </div>
                </div>
            )}

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