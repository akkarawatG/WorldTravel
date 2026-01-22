"use client";

import { useState, use } from "react"; // ✅ 1. เพิ่ม import 'use'
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, LayoutTemplate, X, Image as ImageIcon, Check, Ban, MapPin, Camera } from "lucide-react";
import dynamic from 'next/dynamic';

// --------------------------------------------------------
// ⚙️ DATA MAPPING
// --------------------------------------------------------
const COUNTRY_NAMES: Record<string, string> = {
  // Asia
  cn: "China",
  th: "Thailand",
  my: "Malaysia",
  jp: "Japan",
  ae: "United Arab Emirates",
  sa: "Saudi Arabia",
  sg: "Singapore",
  vn: "Vietnam",
  in: "India",
  kr: "South Korea",
  id: "Indonesia",
  tw: "Taiwan",
  bh: "Bahrain",
  kw: "Kuwait",
  kz: "Kazakhstan",
  ph: "Philippines",
  uz: "Uzbekistan",
  kh: "Cambodia",
  jo: "Jordan",
  la: "Laos",
  bn: "Brunei",
  om: "Oman",
  qa: "Qatar",
  lk: "Sri Lanka",
  ir: "Iran",

  // Europe
  fr: "France",
  es: "Spain",
  it: "Italy",
  pl: "Poland",
  hu: "Hungary",
  hr: "Croatia",
  tr: "Turkey",
  gb: "United Kingdom",
  de: "Germany",
  gr: "Greece",
  dk: "Denmark",
  at: "Austria",
  nl: "Netherlands",
  pt: "Portugal",
  ro: "Romania",
  ch: "Switzerland",
  be: "Belgium",
  lv: "Latvia",
  ge: "Georgia",
  se: "Sweden",
  lt: "Lithuania",
  ee: "Estonia",
  no: "Norway",
  fi: "Finland",
  is: "Iceland",

  // North America
  us: "United States",
  mx: "Mexico",
  ca: "Canada",
  do: "Dominican Republic",
  bs: "Bahamas",
  cu: "Cuba",
  jm: "Jamaica",
  cr: "Costa Rica",
  gt: "Guatemala",
  pa: "Panama",

  // South America
  ar: "Argentina",
  br: "Brazil",
  cl: "Chile",
  pe: "Peru",
  py: "Paraguay",
  co: "Colombia",
  uy: "Uruguay",
  ec: "Ecuador",

  // Africa
  za: "South Africa",
  ma: "Morocco",
  eg: "Egypt",
  ke: "Kenya",
  na: "Namibia",
  tz: "Tanzania",

  // Oceania
  au: "Australia",
  nz: "New Zealand"
};

// --------------------------------------------------------

const DynamicMap = dynamic(
  () => import('../../../../components/DynamicMap'), 
  { ssr: false, loading: () => <div className="p-10 text-gray-400 flex items-center justify-center h-full">Loading Map...</div> }
);

interface PageProps {
  params: Promise<{ id: string }>; // ✅ 2. แก้ type เป็น Promise
}

export default function EditTripPage({ params }: PageProps) {
  const router = useRouter();
  
  // ✅ 3. ใช้ use() เพื่อดึงค่า id ออกมาจาก Promise params
  const { id } = use(params);
  const countryCode = id.toLowerCase();
  const countryName = COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();

  const [visitedList, setVisitedList] = useState<string[]>([]);
  const [selectedRegionName, setSelectedRegionName] = useState<string | null>(null);
  
  // Form Data
  const [formData, setFormData] = useState({
    templateName: "My trip",
    places: "",
    notes: "",
    status: "visited", 
    customColor: "#4CAF50"
  });

  const handleRegionClick = (provinceName: string) => {
    console.log("Selected Region:", provinceName); 
    setSelectedRegionName(provinceName);
  };

  const handleApply = () => {
    if (selectedRegionName) {
       if (formData.status === 'clear') {
          setVisitedList((prev) => prev.filter(p => p !== selectedRegionName));
       } else {
          if (!visitedList.includes(selectedRegionName)) {
            setVisitedList((prev) => [...prev, selectedRegionName]);
          }
       }
    }
    setSelectedRegionName(null);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-800 flex flex-col h-screen overflow-hidden">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20 flex-shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
           <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="flex items-center gap-3">
                 {/* ✅ Dynamic Flag Image */}
                 <img 
                    src={`https://flagcdn.com/w40/${countryCode}.png`} 
                    alt={countryCode} 
                    className="w-8 h-6 rounded shadow-sm object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/40x30?text=Flag"}
                 />
                 <h1 className="text-xl font-bold text-gray-800">{countryName}</h1>
              </div>
           </div>
           <div className="flex gap-3">
              <button onClick={() => router.push('/mytrips')} className="flex items-center gap-2 px-4 py-2 border-2 border-blue-400 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition text-sm">
                 <LayoutTemplate className="w-4 h-4" /> My Templates
              </button>
              <button onClick={() => router.push('/mytrips')} className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition text-sm shadow-sm">
                 <Save className="w-4 h-4" /> Save
              </button>
           </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden relative">
         
         {/* LEFT: MAP AREA */}
         <div className="flex-1 bg-white flex items-center justify-center p-4 overflow-hidden relative">
            <div className="w-full h-full max-w-5xl">
                 <DynamicMap 
                   countryCode={countryCode} 
                   visitedList={visitedList}
                   selectedRegionName={selectedRegionName}
                   onRegionClick={handleRegionClick}
                 />
            </div>
         </div>

         {/* RIGHT: EDIT PANEL */}
         {selectedRegionName && (
            <div className="w-[400px] bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-300 absolute right-0 top-0 z-30 md:static">
               
               {/* Sidebar Header */}
               <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <div className="flex items-center gap-2 text-gray-800 font-bold text-lg">
                     <MapPin className="w-5 h-5 text-red-500 fill-current"/>
                     {selectedRegionName}
                  </div>
                  <button onClick={() => setSelectedRegionName(null)} className="text-gray-400 hover:text-gray-600">
                     <X className="w-5 h-5"/>
                  </button>
               </div>

               {/* Sidebar Content */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                  
                  {/* Template Name */}
                  <div>
                     <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2">
                        <LayoutTemplate className="w-3 h-3"/> Template Name
                     </label>
                     <input 
                        type="text" 
                        value={formData.templateName} 
                        onChange={(e) => setFormData({...formData, templateName: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                     />
                  </div>

                  {/* Places I Visited */}
                  <div>
                     <label className="text-xs font-bold text-gray-600 mb-2 block">Places I Visited</label>
                     <textarea 
                        rows={4} 
                        value={formData.places} 
                        onChange={(e) => setFormData({...formData, places: e.target.value})} 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                        placeholder="- Doi suthep..."
                     />
                  </div>

                  {/* Notes */}
                  <div>
                     <label className="text-xs font-bold text-gray-600 mb-2 block">Notes (optional)</label>
                     <textarea 
                        rows={3} 
                        placeholder="Memories, dates, recommendations..." 
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                     />
                  </div>

                  {/* Photos */}
                  <div>
                     <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2"><ImageIcon className="w-3 h-3"/> Photos</label>
                     <div className="border-2 border-dashed border-gray-200 rounded-xl py-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-400 transition hover:bg-blue-50 group">
                        <div className="bg-gray-100 p-3 rounded-full mb-2 group-hover:bg-white transition"><Camera className="w-6 h-6 text-gray-500 group-hover:text-blue-500"/></div>
                        <p className="text-sm font-bold text-gray-700">Click to upload photos</p>
                        <p className="text-xs text-gray-400">or drag and drop</p>
                     </div>
                  </div>

                  {/* Choose Color Grid */}
                  <div>
                     <label className="text-xs font-bold text-gray-600 mb-3 block">Choose Color</label>
                     <div className="grid grid-cols-4 gap-3">
                        <ColorButton 
                           color="bg-[#4CAF50]" 
                           label="Visited" 
                           active={formData.status === 'visited'} 
                           onClick={() => setFormData({...formData, status: 'visited', customColor: '#4CAF50'})} 
                           icon={<Check className="w-6 h-6 text-white stroke-[4]"/>}
                        />
                        <ColorButton 
                           color="bg-[#2196F3]" 
                           label="Want to Visit" 
                           active={formData.status === 'want'} 
                           onClick={() => setFormData({...formData, status: 'want', customColor: '#2196F3'})} 
                        />
                        <ColorButton 
                           color="bg-[#FF9800]" 
                           label="Passed Through" 
                           active={formData.status === 'passed'} 
                           onClick={() => setFormData({...formData, status: 'passed', customColor: '#FF9800'})} 
                        />
                        <ColorButton 
                           color="bg-[#E0E0E0]" 
                           label="Clear Color" 
                           active={formData.status === 'clear'} 
                           onClick={() => setFormData({...formData, status: 'clear', customColor: '#E0E0E0'})} 
                           icon={<Ban className="w-6 h-6 text-[#FF3B30]"/>}
                        />
                     </div>
                  </div>

                  {/* Custom Color Input */}
                  <div>
                     <label className="text-xs font-bold text-gray-600 mb-2 block">Custom Color</label>
                     <div className="flex gap-3">
                        <input 
                           type="text" 
                           value={formData.customColor} 
                           readOnly
                           className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-gray-50 font-mono"
                        />
                        <div 
                           className="w-10 h-10 rounded-lg shadow-sm border border-gray-200" 
                           style={{ backgroundColor: formData.customColor }}
                        ></div>
                     </div>
                  </div>

               </div>

               {/* Footer Buttons */}
               <div className="p-6 border-t border-gray-100 bg-white">
                  <button onClick={handleApply} className="w-full bg-[#039BE5] hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm transition mb-4">
                    Apply
                  </button>
                  <button onClick={() => { setVisitedList([]); setSelectedRegionName(null); }} className="w-full text-[#FF3B30] text-xs font-bold hover:underline text-center">
                    Clear All Data
                  </button>
               </div>
            </div>
         )}
      </div>
    </div>
  );
}

// UI Component: ปุ่มเลือกสี
function ColorButton({ color, label, active, onClick, icon }: any) {
   return (
      <div className="flex flex-col items-center gap-2 cursor-pointer group" onClick={onClick}>
         <div className={`w-full aspect-square rounded-xl ${color} flex items-center justify-center shadow-sm transition-all duration-200 ${active ? 'ring-2 ring-offset-2 ring-black/80 scale-105' : 'hover:scale-105 hover:shadow-md'}`}>
            {active && icon}
            {!active && label === "Clear Color" && icon} 
         </div>
         <span className={`text-[10px] font-bold text-center leading-tight ${active ? 'text-gray-900' : 'text-gray-500'}`}>{label}</span>
      </div>
   )
}