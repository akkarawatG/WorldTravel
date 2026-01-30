"use client";

import { useState } from "react";
import { X, MapPin, ChevronDown, ChevronUp, StickyNote,Backpack } from "lucide-react";

// Mapping (เพื่อให้มั่นใจว่าชื่อตรงกัน)
const COUNTRY_NAMES: Record<string, string> = {
    cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
    fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
    us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
    ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
    za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
    au: "Australia", nz: "New Zealand"
};

interface TripViewModalProps {
  trip: any;
  coverImage: string; // ✅ รับ URL รูปภาพเข้ามา
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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-[500px] max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* --- Header --- */}
        <div className="relative h-[140px] bg-gray-100 shrink-0">
            {/* ✅ ใช้รูปภาพจาก Props เพื่อให้ตรงกับหน้า MyTrips */}
            <img 
                src={coverImage} 
                alt={countryName} 
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-md cursor-pointer"
            >
                <X size={20} />
            </button>

            <div className="absolute bottom-4 left-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                    {/* <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt="flag" className="h-5 rounded shadow-sm" /> */}
                    <span className="text-xs font-medium bg-white/20 px-2 py-0.5 rounded text-white backdrop-blur-md border border-white/10">
                        {trip.created_at}
                    </span>
                </div>
                <h2 className="text-2xl font-bold leading-none tracking-tight">{countryName} Trip</h2>
            </div>
        </div>

        {/* --- Body --- */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#F9FAFB] scrollbar-thin">
            
            {/* Stats */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <Backpack size={20} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-800 leading-none">{trip.templates?.length || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Templates</p>
                    </div>
                </div>
                <div className="flex-1 bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                        <MapPin size={20} />
                    </div>
                    <div>
                        <p className="text-xl font-bold text-gray-800 leading-none">{trip.stats?.provinces || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Provinces</p>
                    </div>
                </div>
            </div>

            {/* Template List */}
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 ml-1">
                Your Templates
            </h3>

            <div className="flex flex-col gap-3">
                {trip.templates && trip.templates.length > 0 ? (
                    trip.templates.map((template: any) => {
                        const isOpen = expandedTemplates.includes(template.id);
                        const provinceCount = template.template_provinces?.length || 0;

                        return (
                            <div key={template.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-md">
                                <button 
                                    onClick={() => toggleTemplate(template.id)}
                                    className={`w-full flex items-center justify-between p-4 transition-colors cursor-pointer ${isOpen ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isOpen ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                            <Backpack size={18} />
                                        </div>
                                        <div className="text-left">
                                            <h4 className="text-sm font-bold text-gray-800">{template.template_name || "Untitled Template"}</h4>
                                            <p className="text-[11px] text-gray-500">{provinceCount} Provinces Selected</p>
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className="px-4 pb-4 pt-0 bg-gray-50 border-t border-gray-100 animate-in slide-in-from-top-1 duration-200">
                                        {template.notes && (
                                            <div className="mt-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100 text-xs text-yellow-800 flex gap-2 items-start">
                                                <StickyNote size={14} className="mt-0.5 shrink-0" />
                                                <p className="leading-relaxed">{template.notes}</p>
                                            </div>
                                        )}

                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-4 mb-2 ml-1">Provinces in this template</p>
                                        
                                        <div className="grid grid-cols-2 gap-2">
                                            {template.template_provinces && template.template_provinces.length > 0 ? (
                                                template.template_provinces.map((prov: any, index: number) => (
                                                    <div key={index} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-gray-200 text-xs text-gray-700 shadow-sm">
                                                        <MapPin size={12} className="text-blue-500" />
                                                        <span className="truncate font-medium">{prov.province_code}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-xs text-gray-400 italic col-span-2 text-center py-2">No provinces selected</p>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                        <Backpack size={24} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">No templates created yet.</p>
                    </div>
                )}
            </div>
        </div>

        {/* --- Footer --- */}
        <div className="p-4 border-t border-gray-200 bg-white">
            <button 
                onClick={onClose}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg transition text-sm cursor-pointer"
            >
                Close
            </button>
        </div>
      </div>
    </div>
  );
}