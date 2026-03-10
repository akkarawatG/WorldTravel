"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, MapPin, Globe, Loader2, Backpack, Search, X, Copy, Check, Share2, MoreHorizontal, Eye, Pencil, ChevronRight } from "lucide-react";
import TripViewModal from "../../components/TripViewModal";
import { COUNTRIES_DATA } from "@/data/mockData";

interface TripData {
  id: string;
  country: string;
  created_at: string;
  templates: {
    id: string;
    template_name: string;
    notes: string;
    travel_start_date: string;
    travel_end_date: string;
    is_public: boolean;
    copied_count: number;
    template_provinces: { province_code: string }[];
  }[];
  stats: {
    regions: number;
    provinces: number;
  };
}

const COUNTRY_NAMES: Record<string, string> = {
  cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
  fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
  us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
  ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
  za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
  au: "Australia", nz: "New Zealand"
};

export default function MyTripsPage() {
  const router = useRouter();
  const supabase = createClient();
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewTrip, setViewTrip] = useState<TripData | null>(null);
  const [tripToDelete, setTripToDelete] = useState<TripData | null>(null);
  const [shareTrip, setShareTrip] = useState<TripData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  // ✅ State สำหรับควมคุม Option Modal บนมือถือ
  const [mobileOptionTrip, setMobileOptionTrip] = useState<TripData | null>(null);

  const countryImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (COUNTRIES_DATA) {
      Object.values(COUNTRIES_DATA).forEach((countries: any[]) => {
        countries.forEach((country) => {
          map[country.name.toLowerCase()] = country.image;
        });
      });
    }
    return map;
  }, []);

  const fetchTrips = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from('trips')
        .select(`id, country, created_at, templates (id, template_name, notes, travel_start_date, travel_end_date, is_public, copied_count, template_provinces ( province_code ))`)
        .eq('profile_id', user.id)
        .order('updated_at', { ascending: false });
      if (error) throw error;
      const formattedTrips: TripData[] = data.map((trip: any) => {
        const allProvinces = trip.templates?.flatMap((t: any) => t.template_provinces?.map((p: any) => p.province_code) || []) || [];
        return {
          id: trip.id,
          country: trip.country,
          created_at: new Date(trip.created_at).toLocaleDateString(),
          templates: trip.templates || [],
          stats: { regions: trip.templates?.length || 0, provinces: new Set(allProvinces).size }
        };
      });
      setTrips(formattedTrips);
    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchTrips(); }, []);

  const filteredTrips = useMemo(() => {
    if (!searchQuery) return trips;
    const lowerQuery = searchQuery.toLowerCase();
    return trips.filter((trip) => {
      const countryName = COUNTRY_NAMES[trip.country.toLowerCase()] || trip.country;
      return countryName.toLowerCase().includes(lowerQuery) || trip.templates.some((t: any) => t.template_name?.toLowerCase().includes(lowerQuery));
    });
  }, [trips, searchQuery]);

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    const { error } = await supabase.from('trips').delete().eq('id', tripToDelete.id);
    if (!error) {
      setTrips(prev => prev.filter(t => t.id !== tripToDelete.id));
      setTripToDelete(null);
    }
  };

  const handleCopyLink = (templateId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}${basePath}/template/${templateId}`);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FFFFFF] font-sans text-gray-800 pb-24 md:pb-8 overflow-x-hidden">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-[156px] pt-6 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[12px] md:text-[14px] leading-[100%] text-[#9E9E9E]">
          <span className="hover:underline cursor-pointer" onClick={() => router.push(`${basePath}/`)}>Home</span> /
          <span className="text-[#101828]">Mytrips</span>
        </div>
      </div>
      
      <div className="max-w-[1128px] mx-auto px-4 lg:px-0">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <h2 className="font-inter font-semibold text-[28px] sm:text-[36px] leading-tight text-black">
            My Travel Templates
          </h2>
          <div className="w-full sm:w-[268px] h-[40px] md:h-[31px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] flex items-center px-[8px] gap-[8px]">
            <Search className="w-[18px] h-[18px] text-[#E0E0E0]" />
            <div className="flex-1 h-[32px] md:h-[23px] bg-white rounded-[4px] flex items-center px-[8px]">
              <input type="text" placeholder="Search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent outline-none text-sm text-gray-600" />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            
            {/* Desktop Create Trip Card */}
            <div className="hidden md:flex w-full max-w-[264px] h-[426px] border-2 border-dashed border-gray-300 rounded-[5px] flex-col items-center justify-center bg-white hover:border-blue-400 transition-colors group cursor-pointer" onClick={() => router.push(`/mytrips/create`)}>
              <Globe className="w-12 h-12 text-gray-800 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Plan new journey</h3>
              <p className="bg-[#3B82F6] text-white py-2 px-6 rounded-[5px] flex items-center gap-2 mt-4"><Plus size={20}/> Create</p>
            </div>

            {filteredTrips.map((trip) => {
              const countryName = COUNTRY_NAMES[trip.country?.toLowerCase()] || trip.country;
              const coverImage = countryImageMap[countryName.toLowerCase()] || "https://placehold.co/800x600?text=No+Image";

              return (
                <div key={trip.id} className="relative w-full md:max-w-[264px] h-[154px] md:h-[426px] group">
                  {/* --- MOBILE STYLE --- */}
                  <div className="md:hidden w-full h-[154px] rounded-[5px] overflow-hidden relative shadow-sm border border-gray-100 bg-gray-100" onClick={() => setViewTrip(trip)}>
                    <img src={coverImage} alt={countryName} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                    
                    <div className="absolute bottom-[6px] left-[6px] flex flex-col gap-[3px] backdrop-blur-[2px] w-[89px]">
                      <span className="text-white font-semibold text-[14px] leading-tight truncate">{countryName} Trip</span>
                      <span className="text-white/90 font-medium text-[8px]">{trip.stats.regions} Plans</span>
                      <span className="text-white/80 font-medium text-[8px]">Edited {trip.created_at}</span>
                    </div>

                    {/* ✅ ปุ่มจุด 3 จุด (มุมขวาบนตามสเปก) */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); setMobileOptionTrip(trip); }} 
                      className="absolute top-[8px] right-[8px] w-6 h-[17px] bg-white/10 border border-white/20 rounded-[3px] flex items-center justify-center backdrop-blur-md cursor-pointer"
                    >
                      <MoreHorizontal size={14} className="text-white"/>
                    </button>
                  </div>

                  {/* --- DESKTOP STYLE --- */}
                  <div className="hidden md:flex w-full h-full bg-white rounded-[5px] overflow-hidden shadow-sm hover:shadow-md border border-gray-200 flex-col">
                    <button onClick={() => setTripToDelete(trip)} className="absolute top-2 right-2 z-10 w-8 h-7 flex items-center justify-center rounded-[8px] border border-white bg-black/40 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-[2px] cursor-pointer"><Trash2 size={16} /></button>
                    <div className="h-[252px] w-full"><img src={coverImage} alt={countryName} className="w-full h-full object-cover" /></div>
                    <div className="flex-1 p-3 flex flex-col justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 truncate">{countryName} Trip</h3>
                        <p className="text-[10px] text-gray-500 mb-3">Created: {trip.created_at}</p>
                        <div className="h-px bg-gray-200 w-full mb-3"></div>
                        <div className="flex items-center justify-center gap-8">
                          <div className="flex flex-col items-center"><MapPin className="w-4 h-4 text-[#3B82F6]" /><span className="text-[11px]">{trip.stats.provinces} Prov</span></div>
                          <div className="w-px h-8 bg-gray-200"></div>
                          <div className="flex flex-col items-center"><Backpack className="w-4 h-4 text-[#3B82F6]" /><span className="text-[11px]">{trip.stats.regions} Templ</span></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-center gap-[10px] mt-4">
                        <button onClick={() => setViewTrip(trip)} className="w-[60px] h-[29px] bg-[#3B82F6] text-white rounded-[5px] text-[12px] font-medium cursor-pointer">View</button>
                        <button onClick={() => router.push(`/mytrips/edit/${trip.id}`)} className="w-[60px] h-[29px] bg-gray-200 text-gray-700 rounded-[5px] text-[12px] font-medium cursor-pointer">Edit</button>
                        <button onClick={() => setShareTrip(trip)} className="w-[60px] h-[29px] bg-gray-200 text-gray-700 rounded-[5px] text-[12px] font-medium cursor-pointer">Share</button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

{/* ✅ MOBILE TRIP OPTIONS (BOTTOM SHEET STYLE) */}
      {mobileOptionTrip && (
        <div className="fixed inset-0 z-[10001] flex items-end justify-center bg-black/40 backdrop-blur-sm md:hidden" onClick={() => setMobileOptionTrip(null)}>
          <div 
            className="w-full bg-[#EEEEEE] rounded-t-[20px] flex flex-col items-center p-4 pb-8 gap-[18px] animate-in fade-in slide-in-from-bottom-full duration-300 shadow-2xl"
            onClick={(e) => e.stopPropagation()} // ป้องกันการปิดเมื่อคลิกที่ตัวเมนู
          >
            {/* Handle Bar (ขีดเล็กๆ ด้านบน) */}
            <div className="w-10 h-1 bg-gray-400 rounded-full mb-1 opacity-50"></div>

            {/* Title */}
            <div className="w-full text-center">
              <span className="font-Inter font-semibold text-[16px] text-gray-700">Trip Options</span>
            </div>

            {/* Menu Container */}
            <div className="w-full flex flex-col gap-[12px]">
              <div className="w-full bg-white rounded-[12px] flex flex-col p-[10px_16px] gap-[10px]">
                
                {/* View Option */}
                <div 
                  className="flex flex-row justify-between items-center py-[12px] border-b-[0.5px] border-[#9E9E9E] cursor-pointer active:bg-gray-50"
                  onClick={() => { setViewTrip(mobileOptionTrip); setMobileOptionTrip(null); }}
                >
                  <div className="flex items-center gap-[15px]">
                    <Eye size={20} className="text-[#3A82CE]" />
                    <span className="font-Inter font-semibold text-[15px] text-black">View</span>
                  </div>
                  <ChevronRight size={18} className="text-[#757575]" />
                </div>

                {/* Edit Option */}
                <div 
                  className="flex flex-row justify-between items-center py-[12px] border-b-[0.5px] border-[#9E9E9E] cursor-pointer active:bg-gray-50"
                  onClick={() => { router.push(`/mytrips/edit/${mobileOptionTrip.id}`); setMobileOptionTrip(null); }}
                >
                  <div className="flex items-center gap-[15px]">
                    <Pencil size={20} className="text-[#3A82CE]" />
                    <span className="font-Inter font-semibold text-[15px] text-black">Edit</span>
                  </div>
                  <ChevronRight size={18} className="text-[#757575]" />
                </div>

                {/* Share Option */}
                <div 
                  className="flex flex-row justify-between items-center py-[12px] border-b-[0.5px] border-[#9E9E9E] cursor-pointer active:bg-gray-50"
                  onClick={() => { setShareTrip(mobileOptionTrip); setMobileOptionTrip(null); }}
                >
                  <div className="flex items-center gap-[15px]">
                    <Share2 size={20} className="text-[#3A82CE]" />
                    <span className="font-Inter font-semibold text-[15px] text-black">Share</span>
                  </div>
                  <ChevronRight size={18} className="text-[#757575]" />
                </div>

                {/* Delete Option */}
                <div 
                  className="flex flex-row items-center py-[12px] gap-[15px] cursor-pointer active:bg-red-50"
                  onClick={() => { setTripToDelete(mobileOptionTrip); setMobileOptionTrip(null); }}
                >
                  <Trash2 size={20} className="text-[#F44336]" />
                  <span className="font-Inter font-semibold text-[15px] text-[#F44336]">Delete</span>
                </div>
              </div>

              {/* Cancel Button */}
              <button 
                onClick={() => setMobileOptionTrip(null)}
                className="w-full h-[50px] bg-white rounded-[12px] flex items-center justify-center font-Inter font-bold text-[16px] text-[#3A82CE] cursor-pointer active:bg-gray-100 transition-colors shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ MOBILE FLOATING ACTION BUTTON (FAB) */}
      <button 
        onClick={() => router.push(`/mytrips/create`)} 
        className="md:hidden fixed bottom-8 right-4 w-[41px] h-[41px] bg-[#3A82CE] text-white rounded-full flex items-center justify-center shadow-[0px_4px_4px_rgba(0,0,0,0.25)] z-40 active:scale-90 transition-transform"
      >
        <Plus size={21} strokeWidth={3} />
      </button>

      {/* MODALS */}
      {viewTrip && (
        <TripViewModal
          trip={viewTrip as any}
          coverImage={countryImageMap[COUNTRY_NAMES[viewTrip.country.toLowerCase()]?.toLowerCase()] || countryImageMap[viewTrip.country.toLowerCase()] || "https://placehold.co/800x600?text=No+Image"}
          onClose={() => setViewTrip(null)}
        />
      )}

      {shareTrip && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-[500px] bg-white rounded-[16px] p-6 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95">
            <div className="flex justify-between items-center"><h3 className="text-[20px] font-bold text-[#101828] flex items-center gap-2"><Share2 className="w-5 h-5 text-[#3B82F6]" /> Share</h3><button onClick={() => setShareTrip(null)}><X size={20} className="text-gray-500" /></button></div>
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto mt-2">
              {shareTrip.templates.map(template => (
                <div key={template.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm flex items-center justify-between">
                  <span className="font-semibold text-gray-900 truncate max-w-[150px] md:max-w-[200px]">{template.template_name}</span>
                  <button onClick={() => handleCopyLink(template.id)} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold shrink-0">{copiedId === template.id ? 'Copied!' : 'Copy Link'}</button>
                </div>
              ))}
            </div>
            <button onClick={() => setShareTrip(null)} className="w-full py-3 bg-gray-100 rounded-lg font-bold mt-2 cursor-pointer">Done</button>
          </div>
        </div>
      )}

      {tripToDelete && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-[382px] bg-white rounded-[16px] p-6 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-4 mb-4"><Trash2 size={32} className="text-red-500" /><h3 className="text-[20px] font-bold">Delete Trip?</h3></div>
            <p className="text-gray-600 text-sm mb-6">Are you sure you want to delete this trip? This action cannot be undone.</p>
            <div className="flex gap-3"><button onClick={() => setTripToDelete(null)} className="flex-1 py-2 border rounded-lg cursor-pointer">Cancel</button><button onClick={confirmDeleteTrip} className="flex-1 py-2 bg-red-500 text-white rounded-lg cursor-pointer">Delete</button></div>
          </div>
        </div>
      )}
    </div>
  );
}