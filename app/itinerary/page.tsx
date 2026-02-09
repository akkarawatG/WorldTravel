"use client";

import { useState } from "react";
import ItinerarySidebar from "@/components/ItinerarySidebar";
import PlanNewTripForm from "@/components/PlanNewTripForm";

export default function ItineraryPage() {
  const [showPlanForm, setShowPlanForm] = useState(false);

  return (
    <div className="relative min-h-screen bg-white">
      
      {/* Container หลัก: ใช้ Flexbox จัดการตำแหน่ง */}
      <div className="absolute left-0 w-full flex justify-center">
        
        {/* Inner Wrapper: กำหนด Gap=24px ตรงนี้ */}
        <div className="w-[1440px] px-[156px] flex flex-row items-start gap-[24px]">
            
            {/* 1. Sidebar (ซ้าย) */}
            <div className="mt-[38px]">
               <ItinerarySidebar onCreateNewPlan={() => setShowPlanForm(true)} />
            </div>

            {/* 2. Main Content (ขวา) */}
            {/* mt-[85px] คำนวณจาก Top 123px (Form) - Top 38px (Sidebar) ตาม Design */}
            <div className="mt-[38px]">
               {showPlanForm ? (
                   <PlanNewTripForm />
               ) : (
                   // Placeholder
                   <div className="w-[708px] h-[500px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-4 mt-[-47px]">
                       <span>Select a plan or create a new one to get started</span>
                   </div>
               )}
            </div>

        </div>
      </div>

    </div>
  );
}