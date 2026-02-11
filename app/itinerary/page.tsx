"use client";

import { useState, useEffect } from "react";
import ItinerarySidebar from "@/components/ItinerarySidebar";
import PlanNewTripForm from "@/components/PlanNewTripForm";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryDetailView from "@/components/ItineraryDetailView";
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface Itinerary {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

export default function ItineraryPage() {
  const supabase = createClient();
  
  // State ควบคุมหน้าจอ: 'list' = หน้ารวม, 'create' = หน้าสร้าง, 'detail' = หน้าดูรายละเอียด
  const [viewState, setViewState] = useState<'list' | 'create' | 'detail'>('list');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null); // เก็บ ID ทริปที่เลือก
  
  // Data States
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Fetch Data
  useEffect(() => {
    const fetchItineraries = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('itineraries')
                .select('id, name, start_date, end_date')
                .eq('profile_id', user.id)
                .is('deleted_at', null)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setItineraries(data || []);
        }
      } catch (error) {
        console.error("Error fetching itineraries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItineraries();
  }, [refreshKey]);

  // 2. Delete Function
  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this plan?")) return;

    try {
        const { error } = await supabase
            .from('itineraries')
            .delete()
            .eq('id', id);

        if (error) throw error;
        setItineraries(prev => prev.filter(item => item.id !== id));
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete plan");
    }
  };

  // 3. Handlers
  const handleCreateSuccess = () => {
      setViewState('list');
      setRefreshKey(prev => prev + 1);
  };

  const handleCardClick = (id: string) => {
      setSelectedTripId(id);
      setViewState('detail');
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute left-0 w-full flex justify-center pb-20">
        <div className="w-[1440px] px-[156px] flex flex-row items-start gap-[24px]">
            
            {/* Sidebar: เปลี่ยนหน้าตาตาม viewState */}
            <div className="mt-[38px] flex-shrink-0">
               <ItinerarySidebar 
                  onCreateNewPlan={() => setViewState('create')} 
                  onBackToList={() => setViewState('list')}
                  viewMode={viewState === 'detail' ? 'detail' : 'default'}
               />
            </div>

            {/* Main Content */}
            <div className="mt-[38px] flex-1">
               {viewState === 'create' ? (
                   <PlanNewTripForm onSuccess={handleCreateSuccess} />
               ) : viewState === 'detail' ? (
                   // ส่ง ID ไปให้ DetailView โหลดข้อมูล (ในที่นี้ Mock ตามรูป)
                   <ItineraryDetailView tripId={selectedTripId} />
               ) : (
                   // List Mode
                   <>
                        {isLoading ? (
                            <div className="w-full h-[400px] flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-[#3A82CE] animate-spin" />
                            </div>
                        ) : itineraries.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px] pb-10">
                                {itineraries.map((trip) => (
                                    <div key={trip.id} onClick={() => handleCardClick(trip.id)} className="cursor-pointer">
                                        <ItineraryCard 
                                            id={trip.id}
                                            name={trip.name}
                                            startDate={trip.start_date}
                                            endDate={trip.end_date}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="w-[708px] h-[500px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-4 mt-[-47px]">
                                <span>Select a plan or create a new one to get started</span>
                            </div>
                        )}
                   </>
               )}
            </div>

        </div>
      </div>
    </div>
  );
}