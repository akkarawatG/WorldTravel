"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  MapPin, Calendar, ChevronRight, ChevronDown, Plus, 
  GripVertical, Trash2, Loader2 
} from "lucide-react";

// Load Map แบบ Dynamic (แก้ปัญหา window is not defined)
const ItineraryMap = dynamic(() => import("./Map/ItineraryMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading Map...</div>
});

// Mock Data Structure ตาม DB flow 3.pdf
// public.daily_schedules -> public.daily_schedules_item
interface ScheduleItem {
  id: string;
  place_name: string;
  description: string;
  image_url: string;
  lat: number;
  lng: number;
  order_index: number;
  item_type: 'place' | 'note';
}

interface DailySchedule {
  day_number: number;
  date_display: string; // คำนวณจาก StartDate + (day_number - 1)
  items: ScheduleItem[];
}

interface ItineraryDetailViewProps {
    tripId: string | null;
}

export default function ItineraryDetailView({ tripId }: ItineraryDetailViewProps) {
  // State
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const [schedules, setSchedules] = useState<DailySchedule[]>([
    {
      day_number: 1,
      date_display: "Monday, 1st January",
      items: [
        {
          id: "item-1",
          place_name: "Mueang Sing Historical Park",
          description: "The Westernmost Khmer Legacy standing as significant evidence.",
          image_url: "https://images.unsplash.com/photo-1590422749897-4006d9972323?w=300",
          lat: 14.0398, // พิกัดสมมติ กาญจนบุรี
          lng: 99.2458,
          order_index: 1,
          item_type: 'place'
        },
        {
            id: "item-2",
            place_name: "River Kwai Bridge",
            description: "Historical bridge from WWII.",
            image_url: "https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=300",
            lat: 14.0416, 
            lng: 99.5036,
            order_index: 2,
            item_type: 'place'
          }
      ]
    },
    {
        day_number: 2,
        date_display: "Tuesday, 2nd January",
        items: []
    }
  ]);

  const toggleDay = (dayNum: number) => {
    setExpandedDay(expandedDay === dayNum ? null : dayNum);
  };

  // ฟังก์ชันลบสถานที่ (Edit Feature)
  const handleDeleteItem = (dayNum: number, itemId: string) => {
    if(!confirm("Remove this place?")) return;
    
    setSchedules(prev => prev.map(day => {
        if(day.day_number === dayNum) {
            return {
                ...day,
                items: day.items.filter(i => i.id !== itemId)
            };
        }
        return day;
    }));
  };

  // เตรียมข้อมูลสำหรับส่งไป Map (เฉพาะวันที่เปิดอยู่ หรือทั้งหมดถ้าอยากดูภาพรวม)
  const mapLocations = useMemo(() => {
    if (expandedDay === null) return [];
    
    const activeDay = schedules.find(d => d.day_number === expandedDay);
    return activeDay ? activeDay.items.map(item => ({
        id: item.id,
        name: item.place_name,
        lat: item.lat,
        lng: item.lng,
        order_index: item.order_index
    })) : [];
  }, [expandedDay, schedules]);

  return (
    <div className="w-full flex flex-row gap-[24px] relative h-full min-h-[900px]">
      
      {/* --- LEFT COLUMN: Itinerary Timeline --- */}
      <div className="w-[433px] flex flex-col gap-[24px] overflow-y-auto pr-2 h-[900px] scrollbar-hide pb-20">
        
        {/* Title Header */}
        <div className="flex flex-col gap-[24px] items-center">
            <h1 className="font-inter font-semibold text-[32px] leading-[39px] text-black text-center">
                Let go to Kanchanaburi
            </h1>
            <div className="box-border flex flex-row items-center px-[8px] py-[4px] gap-[8px] bg-white border border-black rounded-[8px] w-fit">
                 <Calendar className="w-4 h-4 text-black"/>
                 <span className="font-inter font-normal text-[16px] text-black">1/Jan - 7/Jan</span>
            </div>
        </div>

        {/* --- DAYS LOOP --- */}
        {schedules.map((day) => (
            <div key={day.day_number} className="flex flex-col w-full">
                {/* Day Header */}
                <div 
                    className="flex items-center gap-[13px] py-2 cursor-pointer w-full hover:bg-gray-50 rounded px-2 transition-colors" 
                    onClick={() => toggleDay(day.day_number)}
                >
                    <div className="w-[32px] h-[32px] flex items-center justify-center">
                        <ChevronDown className={`w-8 h-8 text-black transition-transform ${expandedDay === day.day_number ? 'rotate-0' : '-rotate-90'}`} />
                    </div>
                    <span className="font-inter font-bold text-[18px] text-black flex-1">
                        {day.date_display}
                    </span>
                </div>
                
                <div className="w-full h-px bg-black opacity-20 my-2"></div>

                {/* Day Content (Expanded) */}
                {expandedDay === day.day_number && (
                    <div className="flex flex-col gap-[16px] pb-6 ml-[15px] border-l-2 border-[#E0E0E0] pl-[15px] animate-in slide-in-from-top-2">
                        
                        {/* Add Place Input */}
                        <div className="w-full h-[36px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[8px] flex items-center px-[16px] gap-[8px] text-[#616161] cursor-pointer hover:border-[#3A82CE] transition">
                            <Plus className="w-[16px] h-[16px]" />
                            <span className="font-inter font-normal text-[16px]">Add a place</span>
                        </div>

                        {/* Items List */}
                        {day.items.map((item) => (
                            <div key={item.id} className="flex flex-row items-center gap-[8px] relative group/card">
                                {/* Timeline Number Bubble */}
                                <div className="absolute -left-[34px] top-8 w-[36px] flex justify-center">
                                    <div className="w-[20px] h-[25px] bg-[#1E518C] rounded-[4px] flex items-center justify-center text-white text-xs z-10 border border-[#C2DCF3]">
                                        {item.order_index}
                                    </div>
                                </div>

                                {/* Place Card */}
                                <div className="flex flex-row w-full h-[102px] bg-white rounded-[8px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-[#1E518C]">
                                     
                                     {/* Drag Handle (Visual only for now) */}
                                     <div className="w-[24px] bg-gray-50 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-gray-100">
                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                     </div>

                                     {/* Text Info */}
                                     <div className="flex-1 bg-[#F5F5F5] p-[8px] flex flex-col gap-[4px] justify-center">
                                        <h4 className="font-inter font-semibold text-[14px] text-black truncate">{item.place_name}</h4>
                                        <p className="font-inter font-normal text-[12px] text-[#212121] leading-[15px] line-clamp-2">
                                           {item.description}
                                        </p>
                                     </div>

                                     {/* Image */}
                                     <div className="w-[109px] h-[102px] relative border-l border-[#1E518C]">
                                        <Image 
                                            src={item.image_url} 
                                            alt={item.place_name} 
                                            fill 
                                            className="object-cover"
                                        />
                                     </div>
                                </div>

                                {/* Delete Button (appears on hover) */}
                                <button 
                                    onClick={() => handleDeleteItem(day.day_number, item.id)}
                                    className="absolute -right-8 p-2 bg-white border border-red-200 text-red-500 rounded-full opacity-0 group-hover/card:opacity-100 transition-all shadow-sm hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* --- RIGHT COLUMN: Map --- */}
      <div className="w-[459px] bg-[#E5E5E5] overflow-hidden relative border border-gray-200 h-[928px] rounded-[16px] mt-[9px] sticky top-[20px]">
        {/* Date Badge Overlay on Map */}
        <div className="absolute top-[20px] left-[20px] bg-white border border-black rounded-[8px] px-2 py-1 flex items-center gap-2 shadow-md z-[1000]">
             <Calendar className="w-4 h-4 text-black" />
             <span className="text-[12px] font-inter text-black">1/Jan - 7/Jan</span>
        </div>

        {/* Load Actual Map */}
        <ItineraryMap locations={mapLocations} />
      </div>

    </div>
  );
}