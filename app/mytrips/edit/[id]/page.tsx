"use client";

import { useState, use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, LayoutTemplate, X, Image as ImageIcon, Check, Ban, MapPin, Camera, Globe, ChevronDown, ChevronUp, Search, Trash2 } from "lucide-react";
import dynamic from 'next/dynamic';

// --------------------------------------------------------
// ⚙️ DATA MAPPING
// --------------------------------------------------------
const COUNTRY_NAMES: Record<string, string> = {
  cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
  fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
  us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
  ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
  za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
  au: "Australia", nz: "New Zealand"
};

// --------------------------------------------------------

// Import DynamicMap แบบ Lazy Load
// ⚠️ สำคัญ: ต้องแน่ใจว่า DynamicMap รับ prop 'selectedRegions' (Array) ได้
const DynamicMap = dynamic(
  () => import('../../../../components/DynamicMap'), 
  { ssr: false, loading: () => <div className="p-10 text-gray-400 flex items-center justify-center h-full">Loading Map...</div> }
);

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditTripPage({ params }: PageProps) {
  const router = useRouter();
  
  // ✅ Unwrap params
  const { id } = use(params);
  const countryCode = id.toLowerCase();
  const countryName = COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();
  
  // ✅ Data States
  const [regionList, setRegionList] = useState<string[]>([]);
  const [isLoadingRegions, setIsLoadingRegions] = useState(false);
  const [visitedList, setVisitedList] = useState<string[]>([]);

  // ✅ Multi-Select State (หัวใจสำคัญ)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]); 
  
  // ✅ Search State
  const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
  const [regionSearchQuery, setRegionSearchQuery] = useState("");
  
  // Form Data
  const [formData, setFormData] = useState({
    templateName: "My trip",
    places: "",
    notes: "",
    status: "visited", 
    customColor: "#4CAF50"
  });

  const isRegionSelected = selectedRegions.length > 0;

  // ✅ Toggle Selection Logic (ใช้ทั้ง Dropdown และ Map)
  const toggleRegion = (regionName: string) => {
    setSelectedRegions(prev => 
      prev.includes(regionName)
        ? prev.filter(r => r !== regionName) // เอาออก
        : [...prev, regionName] // เพิ่มเข้า
    );
  };

  // ✅ Fetch Region List from Highcharts
  useEffect(() => {
    async function fetchHighchartsMapData() {
      if (!countryCode) return;
      setIsLoadingRegions(true);
      try {
        const mapUrl = `https://code.highcharts.com/mapdata/countries/${countryCode}/${countryCode}-all.geo.json`;
        const response = await fetch(mapUrl);
        if (!response.ok) throw new Error("Map data not found");
        const data = await response.json();
        
        if (data && data.features) {
            const regions = data.features
                .map((feature: any) => feature.properties.name) 
                .filter((name: any) => name) 
                .sort(); 
            setRegionList(regions);
        }
      } catch (error) {
        console.error("Failed to load regions:", error);
        setRegionList([]);
      } finally {
        setIsLoadingRegions(false);
      }
    }
    fetchHighchartsMapData();
  }, [countryCode]);

  // ✅ Filter Regions for Search
  const filteredRegions = useMemo(() => {
    return regionList.filter(region => 
      region.toLowerCase().includes(regionSearchQuery.toLowerCase())
    );
  }, [regionList, regionSearchQuery]);

  // ✅ Handle Apply Button
  const handleApply = () => {
    if (selectedRegions.length > 0) {
       if (formData.status === 'clear') {
          setVisitedList((prev) => prev.filter(p => !selectedRegions.includes(p)));
       } else {
          // Merge selection into visitedList
          setVisitedList((prev) => Array.from(new Set([...prev, ...selectedRegions])));
       }
    }
    // ไม่เคลียร์ selection เพื่อให้ user เห็นว่าเลือกอะไรไปแล้ว
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
                 <img 
                    src={`https://flagcdn.com/w40/${countryCode}.png`} 
                    alt={countryCode} 
                    className="w-8 h-6 rounded shadow-sm object-cover"
                    onError={(e) => (e.target as HTMLImageElement).src = "https://placehold.co/40x30?text=Flag"}
                 />
                 <h1 className="text-xl font-bold text-gray-800 mr-2">{countryName}</h1>

                 {/* ✅ Multi-Select Dropdown with Search */}
                 <div className="relative hidden md:block">
                    <button 
                        onClick={() => {
                            setIsRegionDropdownOpen(!isRegionDropdownOpen);
                            setRegionSearchQuery("");
                        }}
                        disabled={isLoadingRegions}
                        className={`flex items-center gap-2 px-3 py-1.5 border rounded-md transition min-w-[200px] justify-between disabled:opacity-50
                            ${isRegionSelected ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-300 hover:bg-gray-100"}
                        `}
                    >
                        <div className="flex items-center gap-2">
                           <MapPin className={`w-4 h-4 ${isRegionSelected ? "text-blue-600" : "text-red-500"}`} />
                           <span className="text-sm font-medium truncate max-w-[150px]">
                             {isLoadingRegions 
                                ? "Loading..." 
                                : isRegionSelected 
                                    ? `${selectedRegions.length} Region${selectedRegions.length > 1 ? 's' : ''}` 
                                    : "Select Regions"}
                           </span>
                        </div>
                        {isRegionDropdownOpen ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                    </button>

                    {/* Dropdown Menu */}
                    {isRegionDropdownOpen && (
                        <>
                           <div className="fixed inset-0 z-10" onClick={() => setIsRegionDropdownOpen(false)}></div>
                           <div className="absolute top-full left-0 mt-2 w-[280px] max-h-[400px] bg-white border border-gray-200 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                              
                              {/* Search Input */}
                              <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" />
                                    <input 
                                        type="text" 
                                        placeholder="Search region..." 
                                        value={regionSearchQuery}
                                        onChange={(e) => setRegionSearchQuery(e.target.value)}
                                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                                        autoFocus
                                    />
                                </div>
                              </div>
                              
                              {/* Actions Bar */}
                              <div className="px-2 py-1.5 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs">
                                  <span className="text-gray-500">{filteredRegions.length} found</span>
                                  {selectedRegions.length > 0 && (
                                    <button 
                                        onClick={() => setSelectedRegions([])}
                                        className="text-red-500 hover:text-red-700 font-medium px-2 py-1 rounded hover:bg-red-50 transition"
                                    >
                                        Clear All
                                    </button>
                                  )}
                              </div>

                              {/* List Container */}
                              <div className="overflow-y-auto flex-1">
                                  {filteredRegions.length > 0 ? (
                                    filteredRegions.map((region) => {
                                      const isSelected = selectedRegions.includes(region);
                                      return (
                                          <button
                                              key={region}
                                              onClick={() => toggleRegion(region)} // ✅ Toggle Selection
                                              className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between group border-b border-gray-50 last:border-none
                                                ${isSelected ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}
                                              `}
                                          >
                                              {region}
                                              {isSelected && <Check className="w-4 h-4 text-blue-600"/>}
                                          </button>
                                      );
                                    })
                                  ) : (
                                    <div className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center">
                                        <Ban className="w-6 h-6 mb-2 opacity-50"/>
                                        No regions found
                                    </div>
                                  )}
                              </div>
                           </div>
                        </>
                    )}
                 </div>
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
                 {/* ✅ ส่ง selectedRegions (Array) ไปให้ DynamicMap */}
                 <DynamicMap 
                   countryCode={countryCode} 
                   visitedList={visitedList}
                   selectedRegions={selectedRegions} // ✅ เปลี่ยนจาก selectedRegionName เป็น selectedRegions
                   onRegionClick={toggleRegion}      // ✅ คลิกที่แมพแล้วให้ Toggle เหมือน Dropdown
                 />
            </div>
         </div>

         {/* RIGHT: EDIT PANEL (Always Visible) */}
         <div className="w-[400px] bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full z-30 md:static">
            
            {/* Sidebar Header */}
            <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white h-[72px] flex-shrink-0">
               <div className="flex items-center gap-2 text-gray-800 font-bold text-lg overflow-hidden">
                  {isRegionSelected ? (
                    <>
                      <MapPin className="w-5 h-5 text-red-500 fill-current flex-shrink-0"/>
                      <div className="flex flex-col">
                          <span className="truncate max-w-[250px] leading-tight text-base">
                             {selectedRegions.length === 1 ? selectedRegions[0] : `${selectedRegions.length} Regions Selected`}
                          </span>
                          {selectedRegions.length > 1 && (
                              <span className="text-[10px] text-gray-500 font-normal truncate max-w-[250px]">
                                  {selectedRegions.join(", ")}
                              </span>
                          )}
                      </div>
                    </>
                  ) : (
                    <span className="text-gray-500 flex items-center gap-2 text-base font-medium">
                      <Globe className="w-5 h-5"/> Select Regions to Edit
                    </span>
                  )}
               </div>
               {isRegionSelected && (
                 <button onClick={() => setSelectedRegions([])} className="text-gray-400 hover:text-red-500 transition tooltip" title="Clear Selection">
                    <Trash2 className="w-5 h-5"/>
                 </button>
               )}
            </div>

            {/* Sidebar Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
               
               {isRegionSelected ? (
                 <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg text-sm text-blue-700 mb-4 flex gap-2">
                        <div className="min-w-4 mt-0.5"><Check className="w-4 h-4"/></div>
                        <div>
                            You are editing <strong>{selectedRegions.length}</strong> region(s). 
                            Changes will apply to all of them.
                        </div>
                    </div>

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
                             color="bg-[#4CAF50]" label="Visited" active={formData.status === 'visited'} 
                             onClick={() => setFormData({...formData, status: 'visited', customColor: '#4CAF50'})} 
                             icon={<Check className="w-6 h-6 text-white stroke-[4]"/>}
                          />
                          <ColorButton 
                             color="bg-[#2196F3]" label="Want to Visit" active={formData.status === 'want'} 
                             onClick={() => setFormData({...formData, status: 'want', customColor: '#2196F3'})} 
                          />
                          <ColorButton 
                             color="bg-[#FF9800]" label="Passed Through" active={formData.status === 'passed'} 
                             onClick={() => setFormData({...formData, status: 'passed', customColor: '#FF9800'})} 
                          />
                          <ColorButton 
                             color="bg-[#E0E0E0]" label="Clear Color" active={formData.status === 'clear'} 
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
               ) : (
                 // Empty State
                 <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-4 mt-20 animate-in fade-in duration-500">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                       <MapPin className="w-10 h-10 text-gray-300" />
                    </div>
                    <div>
                       <p className="text-lg font-bold text-gray-600">No Region Selected</p>
                       <p className="text-sm">Click on the map or use the dropdown above</p>
                    </div>
                 </div>
               )}
            </div>

            {/* Footer Buttons */}
            {isRegionSelected && (
              <div className="p-6 border-t border-gray-100 bg-white mt-auto flex-shrink-0 animate-in slide-in-from-bottom-2">
                 <button onClick={handleApply} className="w-full bg-[#039BE5] hover:bg-blue-600 text-white font-bold py-3 rounded-lg shadow-sm transition mb-4">
                   Apply Changes ({selectedRegions.length})
                 </button>
                 <button onClick={() => { setVisitedList([]); setSelectedRegions([]); }} className="w-full text-[#FF3B30] text-xs font-bold hover:underline text-center">
                   Reset All Data
                 </button>
              </div>
            )}
         </div>
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