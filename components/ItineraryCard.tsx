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
    <div className="box-border flex flex-col items-end p-[16px] gap-[16px] w-[266px] h-[294px] border border-[#1E518C] rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="relative w-[234px] h-[149px] bg-gray-200 rounded-[8px] overflow-hidden flex-shrink-0">
         <Image src={tripImage} alt={name} fill className="object-cover transition-transform duration-500 hover:scale-110" unoptimized />
      </div>
      <div className="flex flex-col items-start gap-[16px] w-[234px] h-[97px]">
        <div className="flex flex-col items-start gap-[8px] w-[234px]">
           <h3 className="font-inter font-bold text-[18px] leading-[22px] text-[#000000] w-full truncate" title={name}>{name}</h3>
           <p className="font-inter font-normal text-[16px] leading-[19px] text-[#9E9E9E] w-full truncate">{formatDateRange(startDate, endDate)}</p>
        </div>
        <div className="flex flex-row items-center gap-[6px] w-[234px] h-[32px]">
            <button className="box-border flex flex-row justify-center items-center px-[8px] py-[4px] gap-[8px] w-[142px] h-[32px] bg-[#3A82CE] border border-[#C2DCF3] rounded-[8px] hover:bg-[#3272b5] transition-colors">
                <Eye className="w-[20px] h-[20px] text-white" /><span className="font-inter font-normal text-[16px] leading-[19px] text-white">View Details</span>
            </button>
            <button className="box-border flex flex-row justify-center items-center px-[8px] py-[4px] gap-[8px] w-[40px] h-[32px] bg-[#9E9E9E] border border-[#EEEEEE] rounded-[8px] hover:bg-[#757575] transition-colors">
                <Pencil className="w-[20px] h-[20px] text-white" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); if(onDelete) onDelete(id); }} className="box-border flex flex-row justify-center items-center px-[8px] py-[4px] gap-[8px] w-[40px] h-[32px] bg-[#9E9E9E] border border-[#EEEEEE] rounded-[8px] hover:bg-[#F44336] transition-colors group">
                <Trash2 className="w-[20px] h-[20px] text-white" />
            </button>
        </div>
      </div>
    </div>
  );
}