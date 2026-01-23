"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Edit3, Share2, Trash2, MoreHorizontal, MapPin, BookText, Globe } from "lucide-react";
import { MY_TRIPS, ITINERARIES, SAVED_PLACES, Trip } from "../../data/mockData";
import TripViewModal from "../../components/TripViewModal";

export default function MyTripsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("map"); // 'map' | 'itinerary'
  const [viewTrip, setViewTrip] = useState<Trip | null>(null);

  // Function to handle trip deletion (Placeholder logic)
  const handleDeleteTrip = (tripId: number) => {
    console.log(`Deleting trip with ID: ${tripId}`);
    alert(`Delete functionality for trip ${tripId} would happen here.`);
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] font-sans text-gray-800 pb-20">
      
      <div className="max-w-[1128px] mx-auto px-6 py-10">
        
        {/* --- Tabs Header --- */}
        <div className="flex gap-10 border-b border-gray-200 mb-10">
           <button 
             onClick={() => setActiveTab("map")}
             className={`pb-4 text-lg font-bold border-b-4 transition-all ${activeTab === "map" ? "border-blue-500 text-blue-600" : "border-transparent text-gray-400 hover:text-gray-600"}`}
           >
             My Travel Map
           </button>
           <button 
             onClick={() => setActiveTab("itinerary")}
             className={`pb-4 text-lg font-bold border-b-4 transition-all ${activeTab === "itinerary" ? "border-[#8B5CF6] text-[#8B5CF6]" : "border-transparent text-gray-400 hover:text-gray-600"}`}
           >
             Itinerary
           </button>
        </div>

        {/* =========================================
            TAB 1: MY TRAVEL MAP (Refined Card Style)
           ========================================= */}
        {activeTab === "map" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 
                 {/* 1. Create New Trip Card (Dashed Border) */}
                 <div className="w-full h-[380px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-white hover:border-blue-400 transition-colors group">
                    <div className="mb-4">
                        <Globe className="w-12 h-12 text-gray-800" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No trips yet.</h3>
                    <p className="text-sm text-gray-500 mb-6">Start planning your next journey</p>
                    <button 
                        onClick={() => router.push("/mytrips/create")} 
                        className="bg-[#3B82F6] hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2 shadow-md transition-transform transform group-hover:scale-105"
                    >
                        <Plus className="w-5 h-5" /> Create New Trip
                    </button>
                 </div>

                 {/* 2. Trip Cards */}
                 {MY_TRIPS.map((trip) => (
                    <div 
                        key={trip.id} 
                        className="w-full h-[380px] bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col relative group"
                    >
                        {/* Delete Button (Visible on hover) */}
                        <button 
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTrip(trip.id);
                            }}
                            className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100 z-10 shadow-sm"
                            title="Delete Trip"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>

                        {/* Image Section */}
                        <div className="relative h-[180px] w-full bg-gray-100">
                            <img 
                                src={trip.image || "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&q=80"} 
                                alt={trip.title} 
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-5 flex flex-col justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{trip.title}</h3>
                                
                                {/* Divider */}
                                <div className="h-px bg-gray-200 w-full mb-4"></div>

                                {/* Stats */}
                                <div className="flex justify-center items-center text-center px-4 gap-6"> 
                                    
                                    {/* Divider */}
                                    <div className="h-8 w-px bg-gray-300 hidden"></div> 

                                    {/* Content - Centered */}
                                    <div className="flex flex-col items-center gap-1 w-full"> 
                                        <span className="text-sm font-semibold text-gray-800">{trip.stats.places} Provinces</span>
                                        {/* MapPin icon below Provinces */}
                                        <div className="flex items-center justify-center text-gray-400">
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-3 gap-3 mt-4">
                                <button 
                                    onClick={() => setViewTrip(trip)}
                                    className="bg-[#3B82F6] hover:bg-blue-600 text-white font-medium py-2 rounded-md text-sm transition"
                                >
                                    View
                                </button>
                                <button 
                                    onClick={() => router.push(`/mytrips/edit/${trip.id}`)}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-md text-sm transition"
                                >
                                    Edit
                                </button>
                                <button className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 rounded-md text-sm transition">
                                    Share
                                </button>
                            </div>
                        </div>
                    </div>
                 ))}
              </div>
          </div>
        )}

        {/* ... (Keep Tab 2: Itinerary as is) ... */}
        {activeTab === "itinerary" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-16 mt-8">
              {/* Itinerary content... (same as before) */}
              <div>
                 <div className="flex justify-between items-end mb-8">
                    <div>
                       <h2 className="text-4xl font-black text-gray-900 mb-2 tracking-tight">Itinerary</h2>
                       <p className="text-gray-500 text-lg">Plan your trips and view upcoming journeys.</p>
                    </div>
                    <button className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-200 transition transform hover:-translate-y-0.5">
                       <Plus className="w-5 h-5" /> Add New Trip
                    </button>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {ITINERARIES.map((item) => (
                       <div key={item.id} className="bg-white p-5 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
                          <div className="h-56 rounded-2xl overflow-hidden mb-5 relative">
                             <img src={item.image} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-blue-600 shadow-sm uppercase tracking-wide">
                                 {item.status}
                             </div>
                          </div>
                          <div className="px-2">
                             <h3 className="text-2xl font-bold text-gray-900 mb-1">{item.title}</h3>
                             <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
                                 📅 {item.date}
                             </p>
                             <div className="flex gap-3">
                                 <button className="flex-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-xl font-bold text-sm transition shadow-md shadow-purple-100">View Details</button>
                                 <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition"><Edit3 className="w-5 h-5"/></button>
                                 <button className="p-3 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition"><Trash2 className="w-5 h-5"/></button>
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
          </div>
        )}

      </div>

      {/* View Modal */}
      {viewTrip && (
        <TripViewModal trip={viewTrip} onClose={() => setViewTrip(null)} />
      )}
    </div>
  );
}