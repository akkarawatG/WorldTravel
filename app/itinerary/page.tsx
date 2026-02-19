"use client";

import { useState, useEffect, useMemo } from "react";
import ItinerarySidebar from "@/components/ItinerarySidebar";
import PlanNewTripForm from "@/components/PlanNewTripForm";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryDetailView from "@/components/ItineraryDetailView";
import PlaceToVisit from "@/components/PlaceToVisit";
import BudgetView from "@/components/BudgetView"; // ✅ 1. Import BudgetView
import { createClient } from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface Itinerary {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

// ✅ 2. เพิ่ม 'budget' ใน Type
type ViewState = 'list' | 'create' | 'detail' | 'place_to_visit' | 'budget';

export default function ItineraryPage() {
  const supabase = createClient();
  
  // State
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [targetDay, setTargetDay] = useState<number | null>(null);
  
  // Data
  const [itineraries, setItineraries] = useState<Itinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch Data
  useEffect(() => {
    const fetchItineraries = async () => {
      if (itineraries.length === 0) setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data, error } = await supabase
                .from('itineraries')
                .select('id, name, start_date, end_date')
                .eq('profile_id', user.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            setItineraries(data || []);
        }
      } catch (error: any) {
        console.error("Error fetching itineraries:", error.message || error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItineraries();
  }, [refreshKey]);

  const handleDataRefresh = () => {
      setRefreshKey(prev => prev + 1);
  };

  const selectedTrip = useMemo(() => {
      return itineraries.find(t => t.id === selectedTripId);
  }, [itineraries, selectedTripId]);

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this plan?")) return;
    try {
        const { error } = await supabase.from('itineraries').delete().eq('id', id);
        if (error) throw error;
        setItineraries(prev => prev.filter(item => item.id !== id));
        // ถ้าลบ Plan ที่กำลังดูอยู่ ให้กลับไปหน้า List
        if (selectedTripId === id) {
            setSelectedTripId(null);
            setViewState('list');
        }
    } catch (error) {
        console.error("Error deleting:", error);
        alert("Failed to delete plan");
    }
  };

  const handleCreateSuccess = () => {
      setViewState('list');
      handleDataRefresh();
  };

  const handleCardClick = (id: string) => {
      setSelectedTripId(id);
      setViewState('detail');
  };

  const getSidebarViewMode = () => {
      if (viewState === 'detail') return 'detail';
      if (viewState === 'place_to_visit') return 'place_to_visit';
      if (viewState === 'budget') return 'budget'; // ✅ เพิ่มเงื่อนไขนี้
      return 'default'; 
  };

  const handleDateClick = (dayNumber: number) => {
      setTargetDay(null); 
      setTimeout(() => {
          setTargetDay(dayNumber);
          setViewState('detail'); 
      }, 10);
  };

  // ✅ 3. Handler สำหรับปุ่ม Budget
  const handleBudgetClick = () => {
      setViewState('budget');
      // หมายเหตุ: ไม่ต้อง clear selectedTripId เพราะ BudgetView รองรับทั้งแบบมีและไม่มี selectedTripId
  };

  return (
    <div className="relative min-h-screen bg-white">
      <div className="absolute left-0 w-full flex justify-center pb-20">
        <div className="w-[1440px] px-[156px] flex flex-row items-start gap-[24px]">
            
            {/* Sidebar */}
            <div className="mt-[38px] flex-shrink-0">
               <ItinerarySidebar 
                  onCreateNewPlan={() => setViewState('create')} 
                  onBackToList={() => setViewState('list')}
                  onPlaceToVisit={() => setViewState('place_to_visit')} 
                  onDateClick={handleDateClick}
                  
                  // ✅ ส่ง prop onBudgetClick
                  onBudgetClick={handleBudgetClick} 

                  viewMode={getSidebarViewMode()}
                  startDate={selectedTrip?.start_date}
                  endDate={selectedTrip?.end_date}
               />
            </div>

            {/* Main Content */}
            <div className="mt-[38px] flex-1">
               {viewState === 'create' ? (
                   <PlanNewTripForm onSuccess={handleCreateSuccess} />
               ) : viewState === 'detail' ? (
                   <ItineraryDetailView 
                        tripId={selectedTripId} 
                        onDataUpdate={handleDataRefresh}
                        scrollToDay={targetDay} 
                   />
               ) : viewState === 'place_to_visit' ? ( 
                   <PlaceToVisit />
               ) : viewState === 'budget' ? ( 
                   // ✅ 4. Render BudgetView
                   <BudgetView /> 
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