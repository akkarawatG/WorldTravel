"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { Plus, Trash2, MapPin, Globe, Loader2, Backpack, Layers } from "lucide-react"; 
import TripViewModal from "../../components/TripViewModal";
import { COUNTRIES_DATA } from "@/data/mockData"; 

interface TripData {
  id: string;
  country: string;
  created_at: string;
  templates: any[]; 
  stats: {
    regions: number; 
    provinces: number; 
  };
}

const COUNTRY_NAMES: Record<string, string> = {
    // Asia
    cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
    // Europe
    fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
    // North America
    us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
    // South America
    ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
    // Africa
    za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
    // Oceania
    au: "Australia", nz: "New Zealand"
};

export default function MyTripsPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [activeTab, setActiveTab] = useState("map");
  const [trips, setTrips] = useState<TripData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [viewTrip, setViewTrip] = useState<TripData | null>(null);
  const [tripToDelete, setTripToDelete] = useState<TripData | null>(null);

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
        .select(`
          id,
          country,
          created_at,
          templates (
            id,
            template_name,
            notes,
            template_provinces ( province_code )
          )
        `)
        .eq('profile_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedTrips: TripData[] = data.map((trip: any) => {
        const allProvinces = trip.templates.flatMap((t: any) => t.template_provinces.map((p: any) => p.province_code));
        const uniqueProvinces = new Set(allProvinces).size;

        return {
          id: trip.id,
          country: trip.country,
          created_at: new Date(trip.created_at).toLocaleDateString(),
          templates: trip.templates,
          stats: {
            regions: trip.templates.length,
            provinces: uniqueProvinces
          }
        };
      });

      setTrips(formattedTrips);
    } catch (error) {
      console.error("Error fetching trips:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  const confirmDeleteTrip = async () => {
    if (!tripToDelete) return;
    try {
      const { error } = await supabase.from('trips').delete().eq('id', tripToDelete.id);
      if (error) throw error;
      setTrips(prev => prev.filter(t => t.id !== tripToDelete.id));
      setTripToDelete(null); 
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-sans text-gray-800 pb-20">
      <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
        <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
          <span className="hover:underline cursor-pointer" onClick={() => router.push('/')}>Home</span> /
          <span className="text-[#101828] hover:underline cursor-pointer " onClick={() => router.push('/mytrips')}>Mytrips</span>
        </div>
      </div>
      <div className="max-w-[1128px] mx-auto ">
        <div className="flex gap-10 border-b border-gray-200 mb-10">
           <button onClick={() => setActiveTab("map")} className={`pb-4 text-lg font-bold border-b-4 transition-all ${activeTab === "map" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>My Travel Map</button>
           <button onClick={() => setActiveTab("itinerary")} className={`pb-4 text-lg font-bold border-b-4 transition-all ${activeTab === "itinerary" ? "border-[#8B5CF6] text-[#8B5CF6]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Itinerary</button>
        </div>

        {activeTab === "map" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">
                    
                    {/* Create New Trip Card */}
                    <div className="w-[264px] h-[426px] border-2 border-dashed border-gray-300 rounded-[5px] flex flex-col items-center justify-center bg-white hover:border-blue-400 transition-colors group mx-auto">
                        <div className="mb-4"><Globe className="w-12 h-12 text-gray-800" strokeWidth={1.5} /></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Plan new journey</h3>
                        <p className="text-sm text-gray-500 mb-6">Select a country to start</p>
                        <button onClick={() => router.push("mytrips/create")} className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-[5px] flex items-center gap-2 shadow-md transition-transform transform group-hover:scale-105 cursor-pointer">
                            <Plus className="w-5 h-5" /> Create New Trip
                        </button>
                    </div>

                    {/* Trip Cards */}
                    {trips.map((trip) => {
                        const countryCode = trip.country.toLowerCase();
                        const countryName = COUNTRY_NAMES[countryCode] || trip.country; 
                        const coverImage = countryImageMap[countryName.toLowerCase()] || "https://placehold.co/800x600?text=No+Image";

                        return (
                            <div key={trip.id} className="w-[264px] h-[426px] bg-white rounded-[5px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col relative group mx-auto">
                                <button onClick={(e) => { e.stopPropagation(); setTripToDelete(trip); }} className="absolute top-2 right-2 z-10 flex h-[28px] w-[32px] items-center justify-center rounded-[8px] border border-white bg-[#00000066] hover:bg-red-600 text-white shadow-sm transition-all duration-300 ease-in-out overflow-hidden cursor-pointer backdrop-blur-[2px] opacity-0 group-hover:opacity-100 group/btn" title="Delete Trip"><Trash2 size={16} className="flex-shrink-0" /></button>

                                <div className="relative h-[252px] w-full bg-gray-100">
                                    <img src={coverImage} alt={countryName} className="w-full h-full object-cover rounded-t-[5px]" />
                                </div>

                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 truncate ">{countryName} Trip</h3>
                                        <p className="text-[10px] text-gray-500 mb-3 ">Created: {trip.created_at}</p>
                                        <div className="h-px bg-gray-200 w-full mb-3"></div>
                                        
                                        <div className="flex items-center justify-center gap-8"> 
                                            <div className="flex flex-col items-center justify-center gap-1"> 
                                                <MapPin className="w-4 h-4 text-[#3B82F6]" />
                                                <span className="text-[11px] font-medium text-gray-600">{trip.stats.provinces} Provinces</span>
                                            </div>
                                            <div className="w-px h-8 bg-gray-200"></div>
                                            <div className="flex flex-col items-center justify-center gap-1"> 
                                                <Backpack className="w-4 h-4 text-[#3B82F6]" />
                                                <span className="text-[11px] font-medium text-gray-600">{trip.stats.regions} Templates</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center gap-[10px] mt-auto w-full">
                                        <button onClick={() => setViewTrip(trip)} className="w-[60px] h-[29px] bg-[#3B82F6] hover:bg-blue-600 text-white font-medium rounded-[5px] text-[12px] flex items-center justify-center transition cursor-pointer">View</button>
                                        
                                        {/* ✅ แก้ไขจุดนี้: ใช้ trip.id ในการลิงก์ไปหน้า Edit */}
                                        <button 
                                            onClick={() => router.push(`/mytrips/edit/${trip.id}`)} 
                                            className="w-[60px] h-[29px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-[5px] text-[12px] flex items-center justify-center transition cursor-pointer"
                                        >
                                            Edit
                                        </button>
                                        
                                        <button className="w-[60px] h-[29px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-[5px] text-[12px] flex items-center justify-center transition cursor-pointer">Share</button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                  </div>
              )}
          </div>
        )}
        
        {activeTab === "itinerary" && <div>Itinerary Content...</div>}
      </div>

      {viewTrip && (
        <TripViewModal 
            trip={viewTrip} 
            coverImage={countryImageMap[COUNTRY_NAMES[viewTrip.country.toLowerCase()]?.toLowerCase()] || countryImageMap[viewTrip.country.toLowerCase()] || "https://placehold.co/800x600?text=No+Image"}
            onClose={() => setViewTrip(null)} 
        />
      )}

      {tripToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[382px] bg-white rounded-[16px] p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4"><div className="text-[#EF4444]"><Trash2 size={32} strokeWidth={2} /></div><h3 className="text-[20px] font-bold text-[#101828]">Delete Trip?</h3></div>
              <p className="text-[14px] text-[#475467] leading-relaxed">Are you sure you want to delete &lsquo;{COUNTRY_NAMES[tripToDelete.country.toLowerCase()] || tripToDelete.country} Trip&rsquo;? <br/>This action cannot be undone.</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => setTripToDelete(null)} className="flex-1 h-[44px] rounded-[8px] border border-[#1976D2] text-[#1976D2] font-semibold text-[14px] hover:bg-blue-50 transition-colors cursor-pointer">Cancel</button>
                <button onClick={confirmDeleteTrip} className="flex-1 h-[44px] rounded-[8px] bg-[#EF4444] text-white font-semibold text-[14px] hover:bg-red-600 transition-colors shadow-md cursor-pointer">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}