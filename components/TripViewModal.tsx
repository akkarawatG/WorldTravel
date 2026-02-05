"use client";

import { useState } from "react";
import { X, MapPin, ChevronDown, ChevronUp, Backpack, Users, Calendar } from "lucide-react";

const COUNTRY_NAMES: Record<string, string> = {
    cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
    fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
    us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
    ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
    za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
    au: "Australia", nz: "New Zealand"
};

// Interface อิงตาม Supabase Schema
interface TemplateProvince {
    province_code: string;
}

interface Template {
    id: string;
    template_name: string | null;
    notes: string | null;
    travel_start_date: string | null; // format: YYYY-MM-DD
    travel_end_date: string | null;   // format: YYYY-MM-DD
    template_provinces: TemplateProvince[];
}

interface TripData {
    id: string;
    country: string;
    created_at: string;
    templates: Template[];
    stats?: {
        provinces: number;
    };
}

interface TripViewModalProps {
    trip: TripData;
    coverImage: string;
    onClose: () => void;
}

export default function TripViewModal({ trip, coverImage, onClose }: TripViewModalProps) {
    const [expandedTemplates, setExpandedTemplates] = useState<string[]>([]);

    const countryCode = trip.country.toLowerCase();
    const countryName = COUNTRY_NAMES[countryCode] || trip.country.toUpperCase();

    const toggleTemplate = (templateId: string) => {
        setExpandedTemplates(prev =>
            prev.includes(templateId)
                ? prev.filter(id => id !== templateId)
                : [...prev, templateId]
        );
    };

    // ✅ Format วันที่สร้าง Trip
    const tripCreatedDate = new Date(trip.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

    // ✅ Format วันที่เดินทางจาก Supabase Columns (travel_start_date, travel_end_date)
    const formatTravelDate = (start: string | null, end: string | null) => {
        if (!start) return null;
        
        const startDate = new Date(start);
        const startStr = startDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        if (!end || start === end) return startStr; 

        const endDate = new Date(end);
        const endStr = endDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

        return `${startStr} - ${endStr}`;
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            {/* Main Container */}
            <div
                className="bg-white w-[677px] max-h-[90vh] rounded-[10px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] flex flex-col relative overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* --- Header Image --- */}
                <div className="relative w-full h-[300px] shrink-0">
                    <img
                        src={coverImage}
                        alt={countryName}
                        className="w-full h-full object-cover rounded-t-[10px]"
                    />
                    
                    {/* Glassmorphism Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-[17px] right-[17px] w-[26px] h-[28px] flex items-center justify-center rounded-[5px] backdrop-blur-[5px] bg-white/5 border border-white/20 shadow-inner hover:bg-white/20 transition cursor-pointer"
                        style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            boxShadow: 'inset 0px -2px 4px rgba(0, 0, 0, 0.2), inset 0px 2px 4px rgba(255, 255, 255, 0.4)'
                        }}
                    >
                        <X size={14} color="white" strokeWidth={3} />
                    </button>
                </div>

                {/* --- Body Content --- */}
                <div className="flex-1 flex flex-col px-[40px] pt-[20px] pb-[20px] gap-[24px] overflow-y-auto scrollbar-thin">
                    
                    {/* Trip Info Header */}
                    <div className="flex flex-col gap-[18px]">
                        {/* Title & Date */}
                        <div>
                            <h2 className="font-inter font-bold text-[28px] leading-[34px] text-black">
                                {countryName} Trip
                            </h2>
                            <p className="font-inter font-normal text-[12px] leading-[15px] text-[#757575] mt-[4px]">
                                {tripCreatedDate}
                            </p>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center justify-start gap-[24px]">
                            
                            {/* Templates Stat */}
                            <div className="flex items-center gap-[21px]">
                                <div className="w-[36px] h-[36px] rounded-full bg-[#F0F6FC] flex items-center justify-center">
                                    <Backpack size={20} color="#60A3DE" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="font-inter font-normal text-[20px] leading-[24px] text-black">{trip.templates?.length || 0}</p>
                                    <p className="font-inter font-normal text-[16px] leading-[19px] text-[#757575]">Template</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-[47px] bg-[#EEEEEE]"></div>

                            {/* Provinces Stat */}
                            <div className="flex items-center gap-[21px]">
                                <div className="w-[36px] h-[36px] rounded-full bg-[#E8F5E9] flex items-center justify-center">
                                    <MapPin size={20} color="#66BB6A" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="font-inter font-normal text-[20px] leading-[24px] text-black">{trip.stats?.provinces || 0}</p>
                                    <p className="font-inter font-normal text-[16px] leading-[19px] text-[#757575]">Province</p>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="w-px h-[47px] bg-[#EEEEEE]"></div>

                            {/* Shared People Stat (Mocked for UI as per spec) */}
                            <div className="flex items-center gap-[21px]">
                                <div className="w-[36px] h-[36px] rounded-full bg-[#FFF3E0] flex items-center justify-center">
                                    <Users size={18} color="#FFA726" strokeWidth={2} />
                                </div>
                                <div>
                                    <p className="font-inter font-normal text-[20px] leading-[24px] text-black">0</p>
                                    <p className="font-inter font-normal text-[16px] leading-[19px] text-[#757575]">Shared people</p>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Line 70 */}
                    <div className="w-full h-px bg-black"></div>

                    {/* Templates Section */}
                    <div className="flex flex-col gap-[16px]">
                        <h3 className="font-inter font-bold text-[20px] leading-[24px] text-black">
                            Your Templates
                        </h3>

                        {/* Templates Loop */}
                        {trip.templates && trip.templates.length > 0 ? (
                            trip.templates.map((template) => {
                                const isOpen = expandedTemplates.includes(template.id);
                                const provinceCount = template.template_provinces?.length || 0;
                                
                                // ✅ ดึงวันที่จาก DB มา Format
                                const dateRange = formatTravelDate(template.travel_start_date, template.travel_end_date);

                                return (
                                    <div 
                                        key={template.id} 
                                        className={`w-full bg-white border border-[#EEEEEE] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[5px] overflow-hidden transition-all duration-300`}
                                    >
                                        {/* Template Header (Clickable) */}
                                        <div 
                                            onClick={() => toggleTemplate(template.id)}
                                            className="w-full h-[53px] flex items-center justify-between px-[15px] cursor-pointer hover:bg-gray-50 transition"
                                        >
                                            <div className="flex items-center gap-[21px]">
                                                {/* Icon */}
                                                <div className="w-[32px] h-[32px] rounded-full bg-[#F0F6FC] flex items-center justify-center">
                                                    <Backpack size={16} color="#60A3DE" strokeWidth={2.5} />
                                                </div>
                                                {/* Text Info */}
                                                <div>
                                                    <p className="font-inter font-normal text-[20px] leading-[24px] text-black">
                                                        {template.template_name || "Untitled Template"}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-[4px]">
                                                        <p className="font-inter font-normal text-[12px] leading-[15px] text-[#757575]">
                                                            {provinceCount} Province
                                                        </p>
                                                        
                                                        {/* ✅ แสดงวันที่ถ้ามีใน DB */}
                                                        {dateRange && (
                                                            <>
                                                                <span className="text-[#757575] text-[12px]">|</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar size={12} color="#757575" />
                                                                    <p className="font-inter font-normal text-[12px] leading-[15px] text-[#757575]">
                                                                        {dateRange}
                                                                    </p>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* Chevron */}
                                            {isOpen ? <ChevronUp size={24} color="#757575" /> : <ChevronDown size={24} color="#757575" />}
                                        </div>

                                        {/* Expanded Content */}
                                        {isOpen && (
                                            <div className="pb-[20px] animate-in slide-in-from-top-2 duration-200">
                                                {/* Line 71 */}
                                                <div className="w-full h-px bg-[#EEEEEE] my-[10px]"></div>

                                                <div className="px-[15px] flex flex-col gap-[8px]">
                                                    <p className="font-inter font-normal text-[14px] leading-[17px] text-black">
                                                        Selected Provinces
                                                    </p>
                                                    
                                                    {/* Province Pills */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {template.template_provinces && template.template_provinces.length > 0 ? (
                                                            template.template_provinces.map((prov, idx) => (
                                                                <div 
                                                                    key={idx} 
                                                                    className="h-[30px] flex items-center px-[10px] gap-[12px] bg-white rounded-[5px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] border border-gray-100"
                                                                >
                                                                    <MapPin size={16} color="#42A5F5" />
                                                                    <span className="font-inter font-normal text-[12px] leading-[15px] text-[#757575]">
                                                                        {prov.province_code}
                                                                    </span>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="text-[12px] text-gray-400 italic">No provinces selected</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        ) : (
                            <div className="text-center py-4 text-gray-400 font-inter text-sm">No templates available</div>
                        )}
                    </div>
                </div>

                {/* --- Footer --- */}
                <div className="px-[40px] pb-[20px] bg-white rounded-b-[10px]">
                    <button
                        onClick={onClose}
                        className="w-full h-[44px] flex items-center justify-center bg-white border-[2px] border-[#D9D9D9] rounded-[5px] hover:bg-gray-50 transition cursor-pointer"
                    >
                        <span className="font-inter font-bold text-[20px] leading-[24px] text-black">
                            Close
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}