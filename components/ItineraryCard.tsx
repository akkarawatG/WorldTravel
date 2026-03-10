"use client";

import Image from "next/image";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { useMemo } from "react";
import { COUNTRIES_DATA } from "@/data/mockData";

interface ItineraryCardProps {
  id: string;
  name: string;
  startDate: string | null;
  endDate: string | null;
  onDelete?: (id: string) => void;
}

export default function ItineraryCard({ id, name, startDate, endDate, onDelete }: ItineraryCardProps) {
  
  const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return "No dates selected";
    const s = new Date(start);
    const optionsMonth: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (!end) return `${s.getDate()} ${s.toLocaleDateString('en-GB', optionsMonth)}`;
    const e = new Date(end);
    if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
      return `${s.getDate()}-${e.getDate()} ${s.toLocaleDateString('en-GB', optionsMonth)}`;
    }
    return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  const tripImage = useMemo(() => {
    const lowerName = name.toLowerCase();
    const allCountries: { name: string; image: string }[] = [];
    Object.values(COUNTRIES_DATA).forEach((list) => allCountries.push(...list));
    const foundCountry = allCountries.find(c => lowerName.includes(c.name.toLowerCase()));
    if (foundCountry) return foundCountry.image;
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % allCountries.length;
    return allCountries[index]?.image || "https://placehold.co/600x400?text=No+Image";
  }, [name]);

  return (
    // ✅ กล่องหลัก: มือถือลด Padding/Gap ลง Desktop ใช้ค่าเดิม (w-[266px], h-[294px], p-[16px])
    <div className="box-border flex flex-col p-[10px] sm:p-[16px] gap-[10px] sm:gap-[16px] w-full sm:w-[266px] h-auto sm:h-[294px] border border-[#1E518C] rounded-[12px] sm:rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow mx-auto">
      
      {/* 🖼️ รูปภาพ: มือถือปรับเป็น aspect-ratio, Desktop ล็อก h-[149px] */}
      <div className="relative w-full aspect-[16/10] sm:aspect-auto sm:h-[149px] bg-gray-200 rounded-[6px] sm:rounded-[8px] overflow-hidden flex-shrink-0">
         <Image src={tripImage} alt={name} fill className="object-cover transition-transform duration-500 hover:scale-110" unoptimized />
      </div>

      {/* 📝 ส่วนเนื้อหา */}
      <div className="flex flex-col items-start gap-[8px] sm:gap-[16px] w-full flex-1 justify-between sm:h-[97px]">
        <div className="flex flex-col items-start gap-[2px] sm:gap-[8px] w-full">
           <h3 className="font-inter font-bold text-[13px] sm:text-[18px] leading-tight sm:leading-[22px] text-[#000000] w-full truncate" title={name}>
             {name}
           </h3>
           <p className="font-inter font-normal text-[10px] sm:text-[16px] leading-tight sm:leading-[19px] text-[#9E9E9E] w-full truncate">
             {formatDateRange(startDate, endDate)}
           </p>
        </div>
        
        {/* 🔘 กลุ่มปุ่ม: มือถือลดขนาดปุ่มและไอคอน Desktop ขนาดเดิม 100% */}
        <div className="flex flex-row items-center gap-[4px] sm:gap-[6px] w-full h-[28px] sm:h-[32px] mt-auto">
            {/* ปุ่ม View Details */}
            <button className="flex-1 box-border flex flex-row justify-center items-center px-[4px] sm:px-[8px] py-[2px] sm:py-[4px] gap-[4px] sm:gap-[8px] h-full bg-[#3A82CE] border border-[#C2DCF3] rounded-[6px] sm:rounded-[8px] hover:bg-[#3272b5] transition-colors overflow-hidden">
                <Eye className="w-[14px] h-[14px] sm:w-[20px] sm:h-[20px] text-white shrink-0" />
                <span className="font-inter font-medium text-[10px] sm:text-[16px] leading-none sm:leading-[19px] text-white truncate">
                  View Details
                </span>
            </button>

            {/* ปุ่ม Edit */}
            <button className="shrink-0 box-border flex flex-row justify-center items-center w-[28px] sm:w-[40px] h-full bg-[#9E9E9E] border border-[#EEEEEE] rounded-[6px] sm:rounded-[8px] hover:bg-[#757575] transition-colors">
                <Pencil className="w-[14px] h-[14px] sm:w-[20px] sm:h-[20px] text-white" />
            </button>

            {/* ปุ่ม Delete */}
            <button onClick={(e) => { e.stopPropagation(); if(onDelete) onDelete(id); }} className="shrink-0 box-border flex flex-row justify-center items-center w-[28px] sm:w-[40px] h-full bg-[#9E9E9E] border border-[#EEEEEE] rounded-[6px] sm:rounded-[8px] hover:bg-[#F44336] transition-colors group">
                <Trash2 className="w-[14px] h-[14px] sm:w-[20px] sm:h-[20px] text-white" />
            </button>
        </div>
      </div>

    </div>
  );
}