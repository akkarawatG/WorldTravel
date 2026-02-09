"use client";

import { useState } from "react";

interface ItinerarySidebarProps {
  onCreateNewPlan?: () => void;
}

export default function ItinerarySidebar({ onCreateNewPlan }: ItinerarySidebarProps) {
  const [isOverviewOpen, setIsOverviewOpen] = useState(true);
  const [isBudgetOpen, setIsBudgetOpen] = useState(true);

  return (
    // ✅ ลบ absolute ออก, ใช้ w-[191px] flex-shrink-0 เพื่อไม่ให้หด
    <aside className="w-[191px] h-[937px] bg-[#F5F5F5] rounded-[16px] p-[16px] flex flex-col gap-[24px] overflow-hidden font-inter transition-all flex-shrink-0">
      
      {/* 1. Create New Plan Button */}
      <button 
        onClick={onCreateNewPlan}
        className="w-full h-[40px] bg-[#3A82CE] border border-[#1E518C] rounded-[8px] flex items-center justify-center gap-[8px] hover:bg-[#3272b5] transition-colors shadow-sm flex-shrink-0 cursor-pointer"
      >
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.66667 10.0002H0V8.00016H7.66667V0.333496H9.66667V8.00016H17.3333V10.0002H9.66667V17.6668H7.66667V10.0002Z" fill="white"/>
        </svg>
        <span className="text-white text-[12px] font-bold leading-[15px]">
          Create a new plan
        </span>
      </button>

      {/* 2. Section: Overview */}
      <div className="flex flex-col gap-[16px] w-full">
        <div 
          className="flex items-center gap-[8px] cursor-pointer select-none group"
          onClick={() => setIsOverviewOpen(!isOverviewOpen)}
        >
          <div className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${isOverviewOpen ? 'rotate-0' : '-rotate-90'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h5 className="text-[#212121] text-[20px] font-bold leading-[24px] group-hover:text-[#3A82CE] transition-colors">
            Overview
          </h5>
        </div>

        {isOverviewOpen && (
          <div className="flex flex-col gap-[4px] w-full pl-[8px] animate-in slide-in-from-top-2 duration-200">
            <button className="box-border flex items-center px-[8px] py-[4px] w-full h-[27px] border border-[#000000] rounded-[8px] bg-transparent text-left">
              <span className="font-normal text-[16px] leading-[19px] text-[#212121]">
                My plan
              </span>
            </button>
            <button className="box-border flex items-center px-[8px] py-[4px] w-full h-[27px] border border-transparent rounded-[8px] hover:bg-gray-200 transition-colors text-left">
              <span className="font-normal text-[16px] leading-[19px] text-[#212121]">
                Place to visit
              </span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Section: Budget */}
      <div className="flex flex-col gap-[16px] w-full">
        <div 
          className="flex items-center gap-[8px] cursor-pointer select-none group"
          onClick={() => setIsBudgetOpen(!isBudgetOpen)}
        >
          <div className={`w-[24px] h-[24px] flex items-center justify-center transition-transform duration-200 ${isBudgetOpen ? 'rotate-0' : '-rotate-90'}`}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9L12 15L18 9" stroke="#212121" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h5 className="text-[#212121] text-[20px] font-bold leading-[24px] group-hover:text-[#3A82CE] transition-colors">
            Budget
          </h5>
        </div>

        {isBudgetOpen && (
          <div className="flex flex-col gap-[4px] w-full pl-[8px] animate-in slide-in-from-top-2 duration-200">
            <button className="box-border flex items-center px-[8px] py-[4px] w-full h-[27px] border border-transparent rounded-[8px] hover:bg-gray-200 transition-colors text-left">
              <span className="font-normal text-[16px] leading-[19px] text-[#212121]">
                View
              </span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}