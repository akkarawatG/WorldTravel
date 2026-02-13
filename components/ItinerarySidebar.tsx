"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useMemo, useState } from "react";

interface ItinerarySidebarProps {
  onCreateNewPlan?: () => void;
  onBackToList?: () => void;
  onPlaceToVisit?: () => void;
  viewMode?: 'default' | 'detail' | 'place_to_visit' | 'budget'; // ✅ เพิ่ม type ให้ครบ
  startDate?: string | null;
  endDate?: string | null;
}

export default function ItinerarySidebar({ 
  onCreateNewPlan, 
  onBackToList,
  onPlaceToVisit, 
  viewMode = 'default',
  startDate,
  endDate
}: ItinerarySidebarProps) {
  
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isItineraryOpen, setIsItineraryOpen] = useState(true);

  // ฟังก์ชันเลือกสีตามวัน
  const getDayColor = (dayIndex: number) => {
    switch (dayIndex) {
        case 1: return { bg: "#FFCF0F", border: "#F6C500" }; // Mon
        case 2: return { bg: "#FFCAD4", border: "#F08DA1" }; // Tue
        case 3: return { bg: "#4CAF50", border: "#43A047" }; // Wed
        case 4: return { bg: "#FF9800", border: "#FB8C00" }; // Thu
        case 5: return { bg: "#3A82CE", border: "#2666B0" }; // Fri
        case 6: return { bg: "#8A38F5", border: "#782DD9" }; // Sat
        case 0: return { bg: "#F44336", border: "#E53935" }; // Sun
        default: return { bg: "#E0E0E0", border: "#BDBDBD" };
    }
  };

  const itineraryDates = useMemo(() => {
      if (!startDate || !endDate) return [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      const list = [];
      const current = new Date(start);

      while (current <= end) {
          const dayIndex = current.getDay();
          const colors = getDayColor(dayIndex);
          list.push({
              day: current.getDate(),
              month: current.toLocaleDateString('en-GB', { month: 'long' }),
              color: colors.bg,
              borderColor: colors.border
          });
          current.setDate(current.getDate() + 1);
      }
      return list;
  }, [startDate, endDate]);

  // ✅ Helper Class สำหรับปุ่ม Active/Inactive
  const getButtonClass = (isActive: boolean) => 
    `box-border flex items-center px-[8px] py-[4px] w-full h-[27px] rounded-[8px] border transition-colors text-left ${
      isActive 
        ? 'border-black bg-transparent' // Active State
        : 'border-transparent hover:bg-gray-200' // Inactive State
    }`;

  return (
    <aside className="w-[191px] h-[937px] bg-[#F5F5F5] rounded-[16px] p-[16px] flex flex-col gap-[24px] overflow-y-auto font-inter transition-all flex-shrink-0 z-40 sticky top-[110px] scrollbar-thin">
      
      {/* ปุ่ม Create New Plan */}
      <button 
        onClick={onCreateNewPlan}
        className="w-full h-[40px] bg-[#3A82CE] border border-[#1E518C] rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-[#3272b5] transition-colors shadow-sm flex-shrink-0 cursor-pointer"
      >
        <div className="w-[17.33px] h-[17.33px] bg-white rounded-sm flex items-center justify-center">
            <Plus className="w-3 h-3 text-[#3A82CE] stroke-[4px]" />
        </div>
        <span className="text-white text-[12px] font-bold leading-[15px]">Create a new plan</span>
      </button>

      {/* --- Section: Overview --- */}
      <div className="flex flex-col gap-[16px] w-full">
         <div 
            className="flex items-center gap-[8px] cursor-pointer select-none"
            onClick={() => setIsOverviewOpen(!isOverviewOpen)}
         >
             <ChevronDown 
                className={`w-6 h-6 text-[#212121] transition-transform duration-200 ${isOverviewOpen ? 'rotate-0' : '-rotate-90'}`} 
                strokeWidth={2} 
             />
             <span className="text-[#212121] text-[20px] font-bold leading-[24px]">Overview</span>
         </div>

         {isOverviewOpen && (
             <div className="flex flex-col gap-[4px] w-full pl-[0px] animate-in slide-in-from-top-1 duration-200">
                 
                 {/* My Plan Button */}
                 <button 
                    onClick={onBackToList}
                    className={getButtonClass(viewMode === 'default')}
                 >
                    <span className="font-normal text-[16px] leading-[19px] text-[#212121]">My plan</span>
                 </button>
                 
                 {/* Place to visit Button */}
                 <button
                    onClick={onPlaceToVisit} 
                    className={getButtonClass(viewMode === 'place_to_visit')}
                 >
                    <span className="font-normal text-[16px] leading-[19px] text-[#212121]">Place to visit</span>
                 </button>

                 {/* Budget Button (สมมติว่ามีหน้า Budget ในอนาคต) */}
                 <button 
                    className={getButtonClass(viewMode === 'budget')}
                    // onClick={onBudget} 
                 >
                    <span className="font-normal text-[16px] leading-[19px] text-[#212121]">Budget</span>
                 </button>
             </div>
         )}
      </div>

      {/* --- Section: Itinerary --- */}
      {viewMode === 'detail' && (
        <div className="flex flex-col gap-[8px] w-full">
            
            {/* Header: Itinerary */}
            <div 
                className="flex items-center gap-[8px] cursor-pointer mb-2 select-none"
                onClick={() => setIsItineraryOpen(!isItineraryOpen)}
            >
                <ChevronDown 
                    className={`w-6 h-6 text-[#212121] transition-transform duration-200 ${isItineraryOpen ? 'rotate-0' : '-rotate-90'}`} 
                    strokeWidth={2} 
                />
                <h5 className="text-[#212121] text-[20px] font-bold leading-[24px]">Itinerary</h5>
            </div>
            
            {/* Date List */}
            {isItineraryOpen && (
                <div className="flex flex-col gap-[8px] w-full pl-[8px] animate-in slide-in-from-top-1 duration-200">
                    {itineraryDates.length > 0 ? (
                        itineraryDates.map((item, index) => (
                            <div key={index} className="flex items-center gap-[13px] h-[19px] cursor-pointer hover:opacity-70 transition-opacity">
                                
                                <div className="w-[10px] h-[10px] flex items-center justify-center flex-shrink-0">
                                     <div 
                                        className="w-[10px] h-[10px] rounded-full box-border"
                                        style={{ 
                                            backgroundColor: item.color, 
                                            border: `1px solid ${item.borderColor}`
                                        }}
                                     ></div>
                                </div>

                                <div className="flex flex-row items-center gap-[8px]">
                                    <span className="font-normal text-[16px] leading-[19px] text-black w-[15px] text-center">
                                        {item.day}
                                    </span>
                                    <span className="font-normal text-[16px] leading-[19px] text-black truncate max-w-[100px]">
                                        {item.month}
                                    </span>
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="text-gray-400 text-sm px-2">No dates set</div>
                    )}
                </div>
            )}

        </div>
      )}
      
    </aside>
  );
}