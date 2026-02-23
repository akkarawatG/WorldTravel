"use client";

import { useState } from "react";
import BudgetPlanSelection from "./BudgetPlanSelection";
import BudgetDetailView from "./BudgetDetailView";

export default function BudgetView() {
    // State ตัวนี้จะคอยจำว่าผู้ใช้เลือก Plan ไหนอยู่
    // null = ยังไม่เลือก (แสดงหน้า List)
    // มี ID = เลือกแล้ว (แสดงหน้า Detail)
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    return (
        <div className="w-full h-full bg-white relative">
            {selectedTripId ? (
                // 🔵 ถ้ามี ID -> แสดงหน้า Detail (พร้อมส่ง tripId และฟังก์ชันกด Back)
                <BudgetDetailView 
                    tripId={selectedTripId} 
                    onBack={() => setSelectedTripId(null)} 
                />
            ) : (
                // 🟡 ถ้าไม่มี ID -> แสดงหน้าเลือก Plan (ส่งฟังก์ชันเลือก Plan ไป)
                <BudgetPlanSelection 
                    onSelect={(id) => setSelectedTripId(id)} 
                />
            )}
        </div>
    );
}