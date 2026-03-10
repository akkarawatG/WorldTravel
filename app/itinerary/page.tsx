"use client";

import { useState, useEffect, useMemo } from "react";
import ItinerarySidebar from "@/components/ItinerarySidebar";
import PlanNewTripForm from "@/components/PlanNewTripForm";
import ItineraryCard from "@/components/ItineraryCard";
import ItineraryDetailView from "@/components/ItineraryDetailView";
import PlaceToVisit from "@/components/PlaceToVisit";
import BudgetView from "@/components/BudgetView";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Plus } from "lucide-react";

interface Itinerary {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
}

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
      if (viewState === 'budget') return 'budget';
      return 'default'; 
  };

  const handleDateClick = (dayNumber: number) => {
      setTargetDay(null); 
      setTimeout(() => {
          setTargetDay(dayNumber);
          setViewState('detail'); 
      }, 10);
  };

  const handleBudgetClick = () => {
      setViewState('budget');
  };

  return (
// 1. เอา min-h-screen ออก เพื่อไม่ให้มันบังคับความสูงทะลุจอ
    <div className="bg-white w-full relative">
      {/* 2. เปลี่ยน pb-20 เป็น pb-32 (เผื่อที่ให้ปุ่มบวกในมือถือ) และ lg:pb-8 (ลดขอบล่างในคอม) */}
      <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-[156px] pb-32 lg:pb-8 pt-[20px] lg:pt-[38px] min-h-[calc(100vh-80px)]">
        
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-[24px]">
            
            {/* Sidebar */}
            <div className="w-full lg:w-auto flex-shrink-0">
               <ItinerarySidebar 
                 onCreateNewPlan={() => setViewState('create')} 
                 onBackToList={() => setViewState('list')}
                 onPlaceToVisit={() => setViewState('place_to_visit')} 
                 onDateClick={handleDateClick}
                 onBudgetClick={handleBudgetClick} 
                 viewMode={getSidebarViewMode()}
                 startDate={selectedTrip?.start_date}
                 endDate={selectedTrip?.end_date}
               />
            </div>

            {/* Main Content */}
            <div className="flex-1 w-full lg:mt-0">
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
                   <BudgetView /> 
               ) : (
                   // --- LIST MODE ---
                   <>
                       {isLoading ? (
                           <div className="w-full h-[300px] lg:h-[400px] flex items-center justify-center">
                               <Loader2 className="w-8 h-8 text-[#3A82CE] animate-spin" />
                           </div>
                       ) : itineraries.length > 0 ? (
                           // ✅ มีข้อมูลทริป
                           <>
                               {/* ปรับ Grid ให้มือถือแสดง 2 คอลัมน์เหมือนในรูป */}
                               <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 lg:gap-[24px] pb-24">
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
                               
                               {/* ✅ ปุ่ม Floating Action Button (วงกลมมุมขวาล่าง) เฉพาะในมือถือ */}
                               <button 
                                   onClick={() => setViewState('create')}
                                   className="lg:hidden fixed bottom-8 right-6 w-[56px] h-[56px] bg-[#3A82CE] text-white rounded-full flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-[#2c6cb0] active:scale-95 transition-transform z-50"
                               >
                                   <Plus className="w-8 h-8" strokeWidth={2.5} />
                               </button>
                           </>
                       ) : (
                           // ✅ ยังไม่มีข้อมูล (Empty State)
                           <>
                               {/* Desktop Empty State (มีกรอบเส้นประ, ซ่อนในมือถือ) */}
                               <div className="hidden lg:flex w-[708px] h-[500px] border-2 border-dashed border-gray-200 rounded-xl flex-col items-center justify-center text-gray-400 gap-4 mt-[-47px]">
                                   <span>Select a plan or create a new one to get started</span>
                               </div>

                               {/* Mobile Empty State (ไม่มีกรอบ, แสดงปุ่มกลางจอ) */}
                               <div className="lg:hidden flex flex-col items-center justify-start w-full bg-white px-4 font-inter text-center mt-[60px] pb-20">
                                   <h2 className="text-[24px] font-bold text-black mb-[16px]">
                                       Plan a new trip
                                   </h2>
                                   
                                   <div className="flex flex-col gap-[8px] text-[14px] text-[#9E9E9E] mb-[32px]">
                                       <p>You haven't created any trip plans.</p>
                                       <p>Click "Create a new plan" to get started.</p>
                                   </div>

                                   <button 
                                       onClick={() => setViewState('create')} 
                                       className="flex items-center justify-center gap-[8px] bg-[#3A82CE] text-white px-[24px] py-[10px] rounded-[8px] hover:bg-[#2c6cb0] transition-colors shadow-sm active:scale-95"
                                   >
                                       <Plus className="w-[20px] h-[20px] text-white" strokeWidth={2.5} />
                                       <span className="font-bold text-[14px]">Create a new plan</span>
                                   </button>
                               </div>
                           </>
                       )}
                   </>
               )}
            </div>

        </div>
      </div>
    </div>
  );
}