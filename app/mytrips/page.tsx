"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Plus, Trash2, MapPin, Globe, Loader2, Backpack, Search, X, Copy, Check, Share2 } from "lucide-react";
import TripViewModal from "../../components/TripViewModal";
import { COUNTRIES_DATA } from "@/data/mockData";

// ✅ อัปเดต Interface เพื่อรองรับ is_public และ copied_count
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
  
  const [searchQuery, setSearchQuery] = useState("");

  const [viewTrip, setViewTrip] = useState<TripData | null>(null);
  const [tripToDelete, setTripToDelete] = useState<TripData | null>(null);
  
  // ✅ State สำหรับ Share Modal
  const [shareTrip, setShareTrip] = useState<TripData | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

      // ✅ อัปเดต Query: เพิ่ม is_public และ copied_count
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
            travel_start_date, 
            travel_end_date,
            is_public,
            copied_count,
            template_provinces ( province_code )
          )
        `)
        .eq('profile_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedTrips: TripData[] = data.map((trip: any) => {
        const allProvinces = trip.templates.flatMap((t: any) => t.template_provinces.map((p: any) => p.province_code));
        const uniqueProvinces = new Set(allProvinces).size;

        return {
          id: trip.id,
          country: trip.country,
          created_at: new Date(trip.created_at).toLocaleDateString(),
          templates: trip.templates || [],
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

  const filteredTrips = useMemo(() => {
    if (!searchQuery) return trips;
    const lowerQuery = searchQuery.toLowerCase();

    return trips.filter((trip) => {
      const countryName = COUNTRY_NAMES[trip.country.toLowerCase()] || trip.country;
      if (countryName.toLowerCase().includes(lowerQuery)) return true;

      const hasMatchingTemplate = trip.templates.some((t: any) => 
        t.template_name?.toLowerCase().includes(lowerQuery)
      );
      if (hasMatchingTemplate) return true;

      return false;
    });
  }, [trips, searchQuery]);

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

  // ✅ ฟังก์ชันเปิด/ปิดการแชร์ Template (Public/Private)
  const handleTogglePublic = async (tripId: string, templateId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus;
      
      // อัปเดต UI ทันที (Optimistic Update)
      setTrips(prev => prev.map(t => {
        if (t.id === tripId) {
          return {
            ...t,
            templates: t.templates.map(tmp => 
              tmp.id === templateId ? { ...tmp, is_public: newStatus } : tmp
            )
          };
        }
        return t;
      }));

      if (shareTrip && shareTrip.id === tripId) {
        setShareTrip(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            templates: prev.templates.map(tmp => 
              tmp.id === templateId ? { ...tmp, is_public: newStatus } : tmp
            )
          };
        });
      }

      // ส่งคำสั่งอัปเดตลง Database
      const { error } = await supabase
        .from('templates')
        .update({ is_public: newStatus })
        .eq('id', templateId);

      if (error) throw error;

    } catch (error) {
      console.error("Error toggling public status:", error);
      alert("Failed to update sharing status.");
      fetchTrips(); // โหลดข้อมูลใหม่ถ้าเกิด Error
    }
  };

  // ✅ ฟังก์ชัน Copy Link
  const handleCopyLink = (templateId: string) => {
    // กำหนด URL ปลายทางที่ผู้อื่นจะใช้เข้ามาดู/โคลน
    const url = `${window.location.origin}/template/${templateId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(templateId);
    setTimeout(() => setCopiedId(null), 2000);
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
        <div className="w-full flex items-end justify-between mb-4">
          <h2 className="font-inter font-semibold text-[36px] leading-[44px] text-black whitespace-nowrap">
            My Travel Templates
          </h2>

          <div className="w-[268px] h-[31px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] flex items-center px-[8px] gap-[8px]">
            <div className="w-[24px] h-[24px] flex items-center justify-center flex-shrink-0">
              <Search className="w-[18px] h-[18px] text-[#E0E0E0]" strokeWidth={2.5} />
            </div>

            <div className="flex-1 h-[23px] bg-white rounded-[4px] flex items-center px-[8px]">
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none font-inter font-normal text-[12px] leading-[15px] text-[#9E9E9E] placeholder-[#9E9E9E]"
              />
            </div>
          </div>
        </div>

        {activeTab === "map" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {isLoading ? (
              <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center">

                <div className="w-[264px] h-[426px] border-2 border-dashed border-gray-300 rounded-[5px] flex flex-col items-center justify-center bg-white hover:border-blue-400 transition-colors group mx-auto">
                  <div className="mb-4"><Globe className="w-12 h-12 text-gray-800" strokeWidth={1.5} /></div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Plan new journey</h3>
                  <p className="text-sm text-gray-500 mb-6">Select a country to start</p>
                  <button onClick={() => router.push("mytrips/create")} className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-[5px] flex items-center gap-2 shadow-md transition-transform transform group-hover:scale-105 cursor-pointer">
                    <Plus className="w-5 h-5" /> Create New Trip
                  </button>
                </div>

                {filteredTrips.map((trip) => {
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

                          <button
                            onClick={() => router.push(`/mytrips/edit/${trip.id}`)}
                            className="w-[60px] h-[29px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-[5px] text-[12px] flex items-center justify-center transition cursor-pointer"
                          >
                            Edit
                          </button>

                          {/* ✅ เปิด Share Modal */}
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShareTrip(trip); }}
                            className="w-[60px] h-[29px] bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-[5px] text-[12px] flex items-center justify-center transition cursor-pointer"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {viewTrip && (
        <TripViewModal
          trip={viewTrip as any}
          coverImage={countryImageMap[COUNTRY_NAMES[viewTrip.country.toLowerCase()]?.toLowerCase()] || countryImageMap[viewTrip.country.toLowerCase()] || "https://placehold.co/800x600?text=No+Image"}
          onClose={() => setViewTrip(null)}
        />
      )}

      {/* ✅ Share Settings Modal */}
      {shareTrip && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[500px] bg-white rounded-[16px] p-6 shadow-2xl flex flex-col gap-4 transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center">
              <h3 className="text-[20px] font-bold text-[#101828] flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#3B82F6]" />
                Share Templates
              </h3>
              <button onClick={() => setShareTrip(null)} className="p-1 hover:bg-gray-100 rounded-full transition-colors">
                <X size={20} className="text-gray-500 hover:text-gray-800" />
              </button>
            </div>
            
            <p className="text-[14px] text-[#475467]">
              Turn on public sharing to allow other users in the community to view and clone your templates.
            </p>

            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto mt-2 pr-2 custom-blue-scrollbar2">
              {shareTrip.templates.map(template => (
                <div key={template.id} className="flex flex-col gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition bg-white shadow-sm">
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-semibold text-[15px] text-gray-900 truncate max-w-[250px]">
                        {template.template_name || 'Untitled Template'}
                      </span>
                      <span className="text-[12px] text-gray-500 mt-1">
                        Copied <span className="font-medium text-blue-600">{template.copied_count || 0}</span> times
                      </span>
                    </div>

                    {/* ✅ Toggle Switch สำหรับ is_public */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer" 
                        checked={template.is_public || false}
                        onChange={() => handleTogglePublic(shareTrip.id, template.id, template.is_public)}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* แสดงปุ่ม Copy Link เมื่อถูกเปิดเป็น Public */}
                  {template.is_public && (
                    <div className="flex items-center justify-between bg-blue-50/50 p-2 rounded-lg border border-blue-100">
                      <span className="text-[11px] text-blue-800 truncate flex-1 font-mono">
                        {`${window.location.origin}/template/${template.id}`}
                      </span>
                      <button 
                        onClick={() => handleCopyLink(template.id)}
                        className="flex items-center gap-1 ml-3 px-3 py-1.5 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-[11px] font-medium text-gray-700 shadow-sm"
                      >
                        {copiedId === template.id ? (
                          <><Check className="w-3 h-3 text-green-500" /> Copied!</>
                        ) : (
                          <><Copy className="w-3 h-3 text-gray-500" /> Copy Link</>
                        )}
                      </button>
                    </div>
                  )}

                </div>
              ))}

              {shareTrip.templates.length === 0 && (
                <div className="text-center text-gray-500 py-6 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  No templates found in this trip.
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => setShareTrip(null)} className="w-full h-[44px] rounded-[8px] bg-gray-100 text-gray-700 font-semibold text-[14px] hover:bg-gray-200 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {tripToDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[382px] bg-white rounded-[16px] p-6 shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4"><div className="text-[#EF4444]"><Trash2 size={32} strokeWidth={2} /></div><h3 className="text-[20px] font-bold text-[#101828]">Delete Trip?</h3></div>
              <p className="text-[14px] text-[#475467] leading-relaxed">Are you sure you want to delete &lsquo;{COUNTRY_NAMES[tripToDelete.country.toLowerCase()] || tripToDelete.country} Trip&rsquo;? <br />This action cannot be undone.</p>
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