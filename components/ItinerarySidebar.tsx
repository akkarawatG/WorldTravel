"use client";

import { LayoutTemplate, MapPin } from "lucide-react";

interface ItinerarySidebarProps {
  onCreateNewPlan?: () => void;
  onBackToList?: () => void;
  viewMode?: 'default' | 'detail';
}

export default function ItinerarySidebar({ onCreateNewPlan, onBackToList, viewMode = 'default' }: ItinerarySidebarProps) {
  
  return (
    <aside className="w-[191px] h-[937px] bg-[#F5F5F5] rounded-[16px] p-[16px] flex flex-col gap-[24px] overflow-hidden font-inter transition-all flex-shrink-0 z-40 sticky top-[110px]">
      
      {/* 1. ปุ่ม Create New Plan */}
      <button 
        onClick={onCreateNewPlan}
        className="w-full h-[40px] bg-[#3A82CE] border border-[#1E518C] rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-[#3272b5] transition-colors shadow-sm flex-shrink-0 cursor-pointer"
      >
        <div className="w-[17px] h-[17px] bg-white rounded-sm flex items-center justify-center">
            <span className="text-[#3A82CE] text-xs font-bold">+</span>
        </div>
        <span className="text-white text-[12px] font-bold leading-[15px]">Create a new plan</span>
      </button>

      {/* 2. Section: Overview */}
      <div className="flex flex-col gap-[16px] w-full">
         <div className="flex items-center gap-[8px]">
            <span className="text-[#212121] text-[20px] font-bold leading-[24px]">Overview</span>
         </div>
         <div className="flex flex-col gap-[8px] w-full pl-[0px]">
             {/* My Plan Button */}
             <button 
                onClick={onBackToList}
                className={`box-border flex items-center px-[8px] py-[4px] w-full h-[27px] rounded-[8px] border transition-colors text-left gap-2 ${viewMode === 'default' ? 'border-black bg-transparent' : 'border-transparent hover:bg-gray-200'}`}
             >
                <span className="font-normal text-[16px] leading-[19px] text-[#212121]">My plan</span>
             </button>
             
             {/* Place to visit */}
             <button className="box-border flex items-center px-[8px] py-[4px] w-full h-[27px] border border-transparent rounded-[8px] hover:bg-gray-200 transition-colors text-left">
                <span className="font-normal text-[16px] leading-[19px] text-[#212121]">Place to visit</span>
             </button>
         </div>
      </div>

      {/* 3. Dynamic Section */}
      {viewMode === 'detail' ? (
        // --- Detail Mode: Itinerary List with Colored Dots ---
        <div className="flex flex-col gap-[16px] w-full animate-in slide-in-from-left-2">
            <div className="flex items-center gap-[8px] cursor-pointer">
                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h5 className="text-[#212121] text-[20px] font-bold leading-[24px]">Itinerary</h5>
            </div>
            
            <div className="flex flex-col gap-[8px] w-full pl-[8px]">
                {/* Mock Data ตามรูป */}
                <DateItem day="1" month="January" color="#FFCF0F" />
                <DateItem day="2" month="January" color="#FFCAD4" />
                <DateItem day="3" month="January" color="#4CAF50" />
                <DateItem day="4" month="January" color="#FF9800" />
                <DateItem day="5" month="January" color="#3A82CE" />
                <DateItem day="6" month="January" color="#8A38F5" />
                <DateItem day="7" month="January" color="#F44336" />
            </div>
        </div>
      ) : (
        // --- Default Mode: Budget ---
        <div className="flex flex-col gap-[16px] w-full">
             <div className="flex items-center gap-[8px] cursor-pointer">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9L12 15L18 9" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h5 className="text-[#212121] text-[20px] font-bold leading-[24px]">Budget</h5>
             </div>
             <div className="flex flex-col gap-[4px] w-full pl-[8px]">
                <button className="box-border flex items-center px-[8px] py-[4px] w-full h-[27px] border border-transparent rounded-[8px] hover:bg-gray-200 transition-colors text-left">
                  <span className="font-normal text-[16px] leading-[19px] text-[#212121]">View</span>
                </button>
             </div>
        </div>
      )}
      
    </aside>
  );
}

// Sub-component สำหรับรายการวันที่พร้อมจุดสี
function DateItem({ day, month, color }: { day: string, month: string, color: string }) {
    return (
        <div className="flex items-center gap-[8px] px-2 py-1 hover:bg-gray-100 rounded cursor-pointer">
            <div className="w-[10px] h-[10px] rounded-full border border-black/10" style={{ backgroundColor: color }}></div>
            <span className="text-[16px] text-[#212121] w-[10px] text-center">{day}</span>
            <span className="text-[16px] text-[#212121]">{month}</span>
        </div>
    );
}