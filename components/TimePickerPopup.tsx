"use client";

import { useState } from "react";
import { formatTimeToDB, parseTimeFromDB } from "@/utils/timeHelpers";

interface TimePickerPopupProps {
  initialStartTime: string | null;
  initialEndTime: string | null;
  onSave: (start: string, end: string) => void;
  onClose: () => void;
  onClear: () => void;
}

export default function TimePickerPopup({ 
  initialStartTime, 
  initialEndTime, 
  onSave, 
  onClose,
  onClear
}: TimePickerPopupProps) {
  
  const startObj = parseTimeFromDB(initialStartTime || "09:00:00");
  const endObj = parseTimeFromDB(initialEndTime || "17:00:00");

  const [startHour, setStartHour] = useState(startObj.hour);
  const [startAmPm, setStartAmPm] = useState(startObj.ampm);
  
  const [endHour, setEndHour] = useState(endObj.hour);
  const [endAmPm, setEndAmPm] = useState(endObj.ampm);

  const hoursList = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));

  const handleSave = () => {
    const dbStart = formatTimeToDB(startHour, "00", startAmPm);
    const dbEnd = formatTimeToDB(endHour, "00", endAmPm);
    onSave(dbStart, dbEnd);
  };

  return (
    // ✅ ปรับขนาด Container: กว้างขึ้น (180px), สูงขึ้น (240px)
    <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-[180px] h-[240px] bg-[#DEECF9] rounded-[12px] shadow-xl z-50 flex flex-col font-inter animate-in fade-in zoom-in-95 duration-100 border border-blue-100">
      
      {/* --- Header Row (แสดงเวลา) --- */}
      <div className="w-full h-[60px] flex flex-row justify-between items-center px-[12px] pt-[8px] flex-shrink-0">
        
        {/* Left: Start Time Display */}
        <div className="flex gap-[4px]">
           {/* Hour Box */}
           <div className="w-[40px] h-[30px] bg-[#C2DCF3] rounded-[4px] flex items-center justify-center border border-blue-200">
              {/* ✅ ปรับ Font size: 8px -> 12px */}
              <span className="text-[12px] font-medium text-[#424242]">{startHour}:00</span>
           </div>
           {/* AM/PM Box */}
           <div 
             className="w-[28px] h-[30px] bg-[#C2DCF3] rounded-[4px] flex items-center justify-center cursor-pointer hover:bg-[#b0d2ee] border border-blue-200 transition-colors"
             onClick={() => setStartAmPm(prev => prev === "AM" ? "PM" : "AM")}
           >
              {/* ✅ ปรับ Font size: 6px -> 10px */}
              <span className="text-[10px] font-bold text-[#121212]">{startAmPm}</span>
           </div>
        </div>

        {/* Right: End Time Display */}
        <div className="flex gap-[4px]">
           {/* Hour Box */}
           <div className="w-[40px] h-[30px] bg-[#C2DCF3] rounded-[4px] flex items-center justify-center border border-blue-200">
              <span className="text-[12px] font-medium text-[#424242]">{endHour}:00</span>
           </div>
           {/* AM/PM Box */}
           <div 
             className="w-[28px] h-[30px] bg-[#C2DCF3] rounded-[4px] flex items-center justify-center cursor-pointer hover:bg-[#b0d2ee] border border-blue-200 transition-colors"
             onClick={() => setEndAmPm(prev => prev === "AM" ? "PM" : "AM")}
           >
              <span className="text-[10px] font-bold text-[#121212]">{endAmPm}</span>
           </div>
        </div>
      </div>

      {/* --- Scrollable Lists (2 Columns) --- */}
      <div className="flex-1 flex flex-row relative w-full overflow-hidden px-[12px] gap-[16px] mb-[10px]">
        
        {/* Left List (Start Hour) */}
        <div className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent flex flex-col gap-[4px] pr-1">
           {hoursList.map(h => (
             <div 
               key={`start-${h}`}
               onClick={() => setStartHour(h)}
               className={`w-full h-[28px] flex-shrink-0 flex items-center justify-center rounded-[4px] cursor-pointer text-[12px] font-medium transition-all
                 ${startHour === h 
                    ? "bg-[#3A82CE] text-white shadow-sm" 
                    : "bg-[#C2DCF3] text-gray-700 hover:bg-[#b0d2ee]"
                 }
               `}
             >
               {h}
             </div>
           ))}
        </div>

        {/* Right List (End Hour) */}
        <div className="flex-1 h-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent flex flex-col gap-[4px] pr-1">
           {hoursList.map(h => (
             <div 
               key={`end-${h}`}
               onClick={() => setEndHour(h)}
               className={`w-full h-[28px] flex-shrink-0 flex items-center justify-center rounded-[4px] cursor-pointer text-[12px] font-medium transition-all
                 ${endHour === h 
                    ? "bg-[#3A82CE] text-white shadow-sm" 
                    : "bg-[#C2DCF3] text-gray-700 hover:bg-[#b0d2ee]"
                 }
               `}
             >
               {h}
             </div>
           ))}
        </div>
      </div>

      {/* --- Footer Buttons --- */}
      <div className="w-full flex flex-row items-center justify-center gap-[16px] pb-[16px]">
         {/* Clear Button */}
         <button 
           onClick={onClear}
           className="px-3 py-1 bg-[#95C3EA] rounded-[6px] flex items-center justify-center shadow-sm hover:opacity-80 hover:scale-105 transition-all"
         >
           <span className="text-[10px] font-semibold text-black">Clear</span>
         </button>

         {/* Save Button */}
         <button 
           onClick={handleSave}
           className="px-3 py-1 bg-[#3A82CE] rounded-[6px] flex items-center justify-center shadow-sm hover:opacity-90 hover:scale-105 transition-all"
         >
           <span className="text-[10px] font-semibold text-white">Save</span>
         </button>
      </div>

    </div>
  );
}