"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client"; 
import { Plus, Trash2, MapPin, Globe, Loader2 } from "lucide-react";
import TripViewModal from "../../components/TripViewModal";
import { COUNTRIES_DATA } from "@/data/mockData"; // ✅ ต้องแน่ใจว่าไฟล์นี้มีข้อมูลครบ

// Interface ให้ตรงกับ Supabase Data Structure
interface TripData {
  id: string;
  country: string;
  created_at: string;
  stats: {
    regions: number; 
    provinces: number; 
  };
}

// ✅ อัปเดต Mapping ให้ครบตามข้อมูลที่มีรูปภาพ
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
  const [viewTrip, setViewTrip] = useState<any | null>(null);

  // ✅ 2. สร้าง Map สำหรับดึงรูปภาพจาก mockData มาเตรียมไว้ (Flatten Data)
  // Logic: แปลงข้อมูลจาก Array ซ้อน Array ให้เป็น Object แบบ { "thailand": "url", "japan": "url" }
  const countryImageMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (COUNTRIES_DATA) {
        Object.values(COUNTRIES_DATA).forEach((countries: any[]) => {
        countries.forEach((country) => {
            if (country.name && country.image) {
                map[country.name.toLowerCase()] = country.image;
            }
        });
        });
    }
    return map;
  }, []);

  // ✅ Fetch Trips
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
            template_provinces ( province_code )
          )
        `)
        .eq('profile_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Transform Data & Calculate Stats
      const formattedTrips: TripData[] = data.map((trip: any) => {
        const allProvinces = trip.templates.flatMap((t: any) => t.template_provinces.map((p: any) => p.province_code));
        const uniqueProvinces = new Set(allProvinces).size;

        return {
          id: trip.id,
          country: trip.country,
          created_at: new Date(trip.created_at).toLocaleDateString(),
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

  // ✅ Delete Trip Logic
  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm("Are you sure you want to delete this trip?")) return;

    try {
      const { error } = await supabase
        .from('trips')
        .delete()
        .eq('id', tripId);

      if (error) throw error;
      setTrips(prev => prev.filter(t => t.id !== tripId));
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("Failed to delete trip.");
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-800 pb-20">
      <div className="max-w-[1128px] mx-auto px-6 py-10">
        
        {/* Tabs */}
        <div className="flex gap-10 border-b border-gray-200 mb-10">
           <button onClick={() => setActiveTab("map")} className={`pb-4 text-lg font-bold border-b-4 transition-all ${activeTab === "map" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}>My Travel Map</button>
           <button onClick={() => setActiveTab("itinerary")} className={`pb-4 text-lg font-bold border-b-4 transition-all ${activeTab === "itinerary" ? "border-[#8B5CF6] text-[#8B5CF6]" : "border-transparent text-gray-400 hover:text-gray-600"}`}>Itinerary</button>
        </div>

        {activeTab === "map" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500"/></div>
              ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    
                    {/* Create New Trip Card */}
                    <div className="w-full h-[380px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white hover:border-blue-400 transition-colors group">
                        <div className="mb-4"><Globe className="w-12 h-12 text-gray-800" strokeWidth={1.5} /></div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Plan new journey</h3>
                        <p className="text-sm text-gray-500 mb-6">Select a country to start</p>
                        <button onClick={() => router.push("mytrips/create")} className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform transform group-hover:scale-105">
                            <Plus className="w-5 h-5" /> Create New Trip
                        </button>
                    </div>

                    {/* Trip Cards */}
                    {trips.map((trip) => {
                        const countryCode = trip.country.toLowerCase();
                        // ชื่อประเทศ (เช่น Thailand)
                        const countryName = COUNTRY_NAMES[countryCode] || trip.country; 
                        
                        // ✅ 3. ดึงรูปจาก mockData โดยใช้ชื่อประเทศ (ถ้าไม่มีใช้ Placeholder)
                        const coverImage = countryImageMap[countryName.toLowerCase()] || "https://placehold.co/800x600?text=No+Image";

                        return (
                            <div key={trip.id} className="w-full h-[380px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col relative group">
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteTrip(trip.id); }} className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10 shadow-sm" title="Delete Trip"><Trash2 className="w-4 h-4" /></button>

                                <div className="relative h-[180px] w-full bg-gray-100">
                                    <img src={coverImage} alt={countryName} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 p-5 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{countryName} Trip</h3>
                                        <p className="text-xs text-gray-500 mb-4">Created: {trip.created_at}</p>
                                        <div className="h-px bg-gray-200 w-full mb-4"></div>
                                        
                                        <div className="flex justify-center items-center text-center px-4 gap-6"> 
                                            <div className="flex flex-col items-center gap-1 w-full"> 
                                                <span className="text-sm font-semibold text-gray-800">{trip.stats.provinces} Provinces</span>
                                                <div className="flex items-center justify-center text-gray-400"><MapPin className="w-4 h-4" /></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3 mt-4">
                                        {/* <button onClick={() => setViewTrip(trip)} className="bg-[#3B82F6] hover:bg-blue-600 text-white font-medium py-2 rounded-md text-sm transition">View</button> */}
                                        <button className="bg-[#3B82F6] hover:bg-blue-600 text-white font-medium py-2 rounded-md text-sm transition">View</button>
                                        <button onClick={() => router.push(`/mytrips/edit/${trip.country}`)} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-md text-sm transition">Edit</button>
                                        <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-md text-sm transition">Share</button>
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

      {viewTrip && <TripViewModal trip={viewTrip} onClose={() => setViewTrip(null)} />}
    </div>
  );
}