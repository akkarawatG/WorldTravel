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

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#3A82CE]" /></div>;

    return (
        <div className="p-8 w-full max-w-[1440px] mx-auto">
            <h1 className="text-[32px] font-bold mb-8 font-inter text-[#212121]">Select Plan to Manage Budget</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                {trips.map(trip => (
                    <div key={trip.id} onClick={() => onSelect(trip.id)} className="box-border flex flex-col items-end p-[16px] gap-[16px] w-[266px] h-[320px] border border-[#1E518C] rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer mx-auto">
                        <div className="relative w-[234px] h-[149px] bg-gray-200 rounded-[8px] overflow-hidden flex-shrink-0">
                            <Image src={getTripImage(trip.name)} alt={trip.name} fill className="object-cover transition-transform duration-500 hover:scale-110" unoptimized />
                        </div>
                        <div className="flex flex-col items-start gap-[16px] w-[234px] flex-1">
                            <div className="flex flex-col items-start gap-[8px] w-full">
                                <h3 className="font-inter font-bold text-[18px] leading-[22px] text-[#000000] w-full truncate">{trip.name}</h3>
                                <p className="font-inter font-normal text-[16px] leading-[19px] text-[#9E9E9E] w-full truncate">{formatDateRange(trip.start_date, trip.end_date)}</p>
                            </div>
                            <div className="mt-auto w-full">
                                <button className="box-border flex flex-row justify-center items-center px-[8px] py-[4px] gap-[8px] w-full h-[40px] bg-[#3A82CE] border border-[#C2DCF3] rounded-[8px] hover:bg-[#3272b5] transition-colors">
                                    <Wallet className="w-[20px] h-[20px] text-white" />
                                    <span className="font-inter font-normal text-[16px] leading-[19px] text-white">Manage Budget</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}