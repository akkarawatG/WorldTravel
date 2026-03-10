"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, Wallet } from "lucide-react";
import Image from "next/image";
import { COUNTRIES_DATA } from "@/data/mockData";

// --- Types ---
export interface Itinerary {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

// --- Helpers ---
const formatDateRange = (start: string | null, end: string | null) => {
    if (!start) return "No dates selected";
    const s = new Date(start);
    const optionsMonth: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    if (!end) return `${s.getDate()} ${s.toLocaleDateString('en-GB', optionsMonth)}`;
    const e = new Date(end);
    return `${s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - ${e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`;
};

const getTripImage = (name: string) => {
    const lowerName = name.toLowerCase();
    const allCountries: { name: string; image: string }[] = [];
    Object.values(COUNTRIES_DATA).forEach((list: any) => allCountries.push(...list));
    const foundCountry = allCountries.find(c => lowerName.includes(c.name.toLowerCase()));
    if (foundCountry) return foundCountry.image;
    
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % allCountries.length;
    return allCountries[index]?.image || "https://placehold.co/600x400?text=No+Image";
};

// --- Component ---
export default function BudgetPlanSelection({ onSelect }: { onSelect: (id: string) => void }) {
    const supabase = createClient();
    const [trips, setTrips] = useState<Itinerary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase.from('itineraries').select('*').eq('profile_id', user.id).order('created_at', { ascending: false });
                if (data) setTrips(data);
            }
            setLoading(false);
        };
        fetchTrips();
    }, []);

    if (loading) return <div className="flex h-[400px] items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-[#3A82CE]" /></div>;

    return (
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-0 pb-20">
            {/* ✅ ปรับขนาด Header ให้เล็กลงในมือถือ และจัดให้อยู่ตรงกลาง (หรือชิดซ้ายตามเหมาะสม) */}
            <h1 className="text-[24px] sm:text-[32px] font-bold mb-6 sm:mb-8 font-inter text-[#212121] text-center sm:text-left px-2 sm:px-0">
                Select Plan to Manage Budget
            </h1>
            
            {/* ✅ ปรับ Grid เป็น 2 คอลัมน์บนมือถือ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-[24px]">
                {trips.map(trip => (
                    // ✅ ปรับกล่องการ์ดให้กว้างเต็มช่อง (w-full) และย่อ Padding/Gap ในมือถือ
                    <div 
                        key={trip.id} 
                        onClick={() => onSelect(trip.id)} 
                        className="box-border flex flex-col p-[10px] sm:p-[16px] gap-[10px] sm:gap-[16px] w-full sm:w-[266px] h-auto sm:h-[320px] border border-[#1E518C] rounded-[12px] sm:rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer mx-auto"
                    >
                        {/* ✅ รูปภาพ: ปรับเป็น Aspect Ratio บนมือถือ และล็อกความสูง (h-[149px]) บน Desktop */}
                        <div className="relative w-full aspect-[16/10] sm:aspect-auto sm:h-[149px] bg-gray-200 rounded-[6px] sm:rounded-[8px] overflow-hidden flex-shrink-0">
                            <Image src={getTripImage(trip.name)} alt={trip.name} fill className="object-cover transition-transform duration-500 hover:scale-110" unoptimized />
                        </div>
                        
                        {/* ✅ เนื้อหา (Text & Button) ให้เต็มความกว้าง w-full */}
                        <div className="flex flex-col items-start gap-[10px] sm:gap-[16px] w-full flex-1">
                            <div className="flex flex-col items-start gap-[4px] sm:gap-[8px] w-full">
                                <h3 className="font-inter font-bold text-[14px] sm:text-[18px] leading-tight sm:leading-[22px] text-[#000000] w-full truncate">
                                    {trip.name}
                                </h3>
                                <p className="font-inter font-normal text-[11px] sm:text-[16px] leading-tight sm:leading-[19px] text-[#9E9E9E] w-full truncate">
                                    {formatDateRange(trip.start_date, trip.end_date)}
                                </p>
                            </div>
                            
                            <div className="mt-auto w-full">
                                {/* ✅ ย่อขนาดปุ่มและไอคอนบนมือถือ */}
                                <button className="box-border flex flex-row justify-center items-center px-[4px] sm:px-[8px] py-[4px] gap-[4px] sm:gap-[8px] w-full h-[28px] sm:h-[40px] bg-[#3A82CE] border border-[#C2DCF3] rounded-[6px] sm:rounded-[8px] hover:bg-[#3272b5] transition-colors overflow-hidden">
                                    <Wallet className="w-[14px] h-[14px] sm:w-[20px] sm:h-[20px] text-white shrink-0" />
                                    <span className="font-inter font-medium sm:font-normal text-[11px] sm:text-[16px] leading-none sm:leading-[19px] text-white truncate">
                                        Manage Budget
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}