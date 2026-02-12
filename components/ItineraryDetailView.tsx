"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  MapPin, Calendar, ChevronRight, ChevronDown, Plus, 
  GripVertical, Trash2, Loader2 
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Load Map แบบ Dynamic
const ItineraryMap = dynamic(() => import("./Map/ItineraryMap"), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading Map...</div>
});

// --- Types ---
interface Place {
    id: string;
    name: string;
    description: string;
    description_short?: string;
    images: string[] | string | null;
    latitude: number;
    longitude: number;
}

interface ScheduleItem {
    id: string;
    place_id: string;
    item_type: 'place' | 'note';
    note: string; 
    order_index: number;
    places: Place | null;
}

interface DailyScheduleData {
    id: string;
    day_number: number;
    daily_schedule_items: ScheduleItem[];
}

interface ItineraryData {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

interface SavedPlace {
    id: string;
    place_id: string;
    places: Place | null;
}

interface ItineraryDetailViewProps {
    tripId: string | null;
}

export default function ItineraryDetailView({ tripId }: ItineraryDetailViewProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [trip, setTrip] = useState<ItineraryData | null>(null);
  const [schedules, setSchedules] = useState<DailyScheduleData[]>([]);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0); 

  useEffect(() => {
    if (!tripId) return;

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: tripData, error: tripError } = await supabase
                .from('itineraries')
                .select('*')
                .eq('id', tripId)
                .single();
            if (tripError) throw tripError;
            setTrip(tripData);

            const { data: scheduleData, error: scheduleError } = await supabase
                .from('daily_schedules')
                .select(`
                    id, day_number, 
                    daily_schedule_items (
                        id, place_id, item_type, note, order_index,
                        places (id, name, description_short, images, lat, lon)
                    )
                `)
                .eq('itinerary_id', tripId)
                .order('day_number', { ascending: true });

            if (scheduleError) throw scheduleError;
            
            const sortedSchedules = (scheduleData || []).map((day: any) => {
                const rawItems = day.daily_schedule_items || [];
                const items: ScheduleItem[] = rawItems.map((item: any) => {
                    const rawPlace = Array.isArray(item.places) ? item.places[0] : item.places;
                    const mappedPlace: Place | null = rawPlace ? {
                        id: rawPlace.id,
                        name: rawPlace.name,
                        description: rawPlace.description, 
                        description_short: rawPlace.description_short,
                        images: rawPlace.images,
                        latitude: rawPlace.lat,
                        longitude: rawPlace.lon
                    } : null;
                    return { ...item, places: mappedPlace };
                });
                items.sort((a, b) => a.order_index - b.order_index);
                return { ...day, daily_schedule_items: items };
            });
            setSchedules(sortedSchedules);

            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: savedData, error: savedError } = await supabase
                    .from('saved_places')
                    .select(`id, place_id, places (id, name, description_short, images, lat, lon)`)
                    .eq('profile_id', user.id);
                
                if (!savedError && savedData) {
                    const validSavedPlaces = savedData.map((item: any) => {
                        const rawPlace = Array.isArray(item.places) ? item.places[0] : item.places;
                        if (!rawPlace) return null;
                        return {
                            id: item.id,
                            place_id: item.place_id,
                            places: {
                                id: rawPlace.id,
                                name: rawPlace.name,
                                description_short: rawPlace.description_short,
                                images: rawPlace.images,
                                latitude: rawPlace.lat,
                                longitude: rawPlace.lon
                            }
                        } as SavedPlace; 
                    }).filter((item): item is SavedPlace => item !== null);
                    setSavedPlaces(validSavedPlaces);
                }
            }
        } catch (err: any) {
            console.error("Error:", err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [tripId]);

  const daysArray = useMemo(() => {
      if (!trip?.start_date || !trip?.end_date) return [];
      const start = new Date(trip.start_date);
      const end = new Date(trip.end_date);
      const days = [];
      const current = new Date(start);
      let dayCount = 1;
      while (current <= end) {
          days.push({
              day_number: dayCount,
              dateObj: new Date(current),
              dateString: current.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
          });
          current.setDate(current.getDate() + 1);
          dayCount++;
      }
      return days;
  }, [trip]);

  const mapLocations = useMemo(() => {
    if (expandedDayIndex === null) return [];
    const currentDayNum = expandedDayIndex + 1;
    const dbSchedule = schedules.find(s => s.day_number === currentDayNum);
    if (!dbSchedule) return [];
    return dbSchedule.daily_schedule_items
        .filter(item => item.item_type === 'place' && item.places)
        .map(item => ({
            id: item.id,
            name: item.places?.name || "Unknown",
            lat: item.places?.latitude || 0,
            lng: item.places?.longitude || 0,
            order_index: item.order_index
        }));
  }, [expandedDayIndex, schedules]);

  const toggleDay = (index: number) => {
    setExpandedDayIndex(expandedDayIndex === index ? null : index);
  };

  const handleAddSavedPlace = async (dayId: string | undefined, place: Place | null) => {
      if (!place) return;
      if (!dayId) {
          alert("Error: Schedule day has not been created in the database yet.");
          return;
      }

      try {
          const currentDay = schedules.find(s => s.id === dayId);
          const newOrderIndex = (currentDay?.daily_schedule_items.length || 0) + 1;

          const { data, error } = await supabase
            .from('daily_schedule_items')
            .insert({
                daily_schedule_id: dayId,
                place_id: place.id,
                item_type: 'place',
                order_index: newOrderIndex
            })
            .select()
            .single();

          if (error) throw error;

          setSchedules(prev => prev.map(day => {
              if (day.id === dayId) {
                  const newItem: ScheduleItem = {
                      id: data.id,
                      place_id: place.id,
                      item_type: 'place',
                      note: '',
                      order_index: newOrderIndex,
                      places: place
                  };
                  return {
                      ...day,
                      daily_schedule_items: [...day.daily_schedule_items, newItem]
                  };
              }
              return day;
          }));

      } catch (err: any) {
          console.error("Failed to add place:", err.message);
          alert("Failed to add place");
      }
  };

  const handleDeleteItem = async (itemId: string, dayId: string) => {
      if(!confirm("Remove this place?")) return;
      try {
          const { error } = await supabase.from('daily_schedule_items').delete().eq('id', itemId);
          if(error) throw error;
          
          setSchedules(prev => prev.map(day => {
              if (day.id === dayId) {
                  return {
                      ...day,
                      daily_schedule_items: day.daily_schedule_items.filter(i => i.id !== itemId)
                  };
              }
              return day;
          }));
      } catch (err) { console.error("Delete failed", err); }
  };

  const getImageSrc = (images: string[] | string | null | undefined) => {
      if (!images) return "https://placehold.co/600x400?text=No+Image";
      if (Array.isArray(images) && images.length > 0) return (typeof images[0] === 'string' ? images[0] : (images[0] as any).url);
      if (typeof images === 'string') {
          try { const parsed = JSON.parse(images); if(Array.isArray(parsed) && parsed.length > 0) return parsed[0]; } catch(e) {}
          return images;
      }
      return "https://placehold.co/600x400?text=No+Image";
  };

  if (loading) return <div className="w-full h-[600px] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#3A82CE] animate-spin" /></div>;
  if (!trip) return <div className="w-full h-[600px] flex items-center justify-center text-gray-500">Trip not found</div>;

  const dateRangeStr = `${new Date(trip.start_date).getDate()}/${new Date(trip.start_date).toLocaleDateString('en-GB', {month:'short'})} - ${new Date(trip.end_date).getDate()}/${new Date(trip.end_date).toLocaleDateString('en-GB', {month:'short'})}`;

  return (
    <div className="w-full flex flex-row gap-[24px] relative h-full min-h-[900px]">
      
      {/* --- LEFT COLUMN: Timeline --- */}
      <div className="w-[433px] flex flex-col gap-[24px] overflow-y-auto pr-2 h-[900px] scrollbar-hide pb-20">
        <div className="flex flex-col gap-[24px] items-center">
            <h1 className="font-inter font-semibold text-[32px] leading-[39px] text-black text-center">{trip.name}</h1>
        </div>

        {daysArray.map((day, index) => {
            const dayData = schedules.find(s => s.day_number === day.day_number);
            const items = dayData?.daily_schedule_items || [];
            const isExpanded = expandedDayIndex === index;

            return (
                <div key={day.day_number} className="flex flex-col w-full">
                    <div 
                        className="flex items-center gap-[13px] py-2 cursor-pointer w-full hover:bg-gray-50 rounded px-2 transition-colors" 
                        onClick={() => toggleDay(index)}
                    >
                        <div className="w-[32px] h-[32px] flex items-center justify-center">
                            <ChevronDown className={`w-8 h-8 text-black transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                        </div>
                        <span className="font-inter font-bold text-[18px] text-black flex-1">{day.dateString}</span>
                    </div>
                    
                    <div className="w-full h-px bg-black opacity-20 my-2"></div>

                    {isExpanded && (
                        <div className="flex flex-col gap-[16px] pb-6 ml-[15px] border-l-2 border-[#E0E0E0] pl-[15px] animate-in slide-in-from-top-2">
                            
                            <div className="w-full h-[36px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[8px] flex items-center px-[16px] gap-[8px] text-[#616161] cursor-pointer hover:border-[#3A82CE] transition">
                                <Plus className="w-[16px] h-[16px]" />
                                <span className="font-inter font-normal text-[16px]">Add a place</span>
                            </div>

                            {/* --- Scheduled Items List --- */}
                            {items.map((item) => (
                                // ✅ ปรับตรงนี้ให้ Card และปุ่ม Delete อยู่ในแถวเดียวกัน (flex-row) แบบไม่ตกขอบ
                                <div key={item.id} className="flex flex-row items-center gap-[8px] relative group/card w-full pr-[10px]">
                                    
                                    {/* Number Bubble (Pin) */}
                                    <div className="absolute -left-[34px] top-[50%] -translate-y-1/2 w-[36px] flex justify-center">
                                        <div className="w-[20px] h-[25px] bg-[#1E518C] rounded-[4px] flex items-center justify-center text-white text-xs z-10 border border-[#C2DCF3]">
                                            {item.order_index}
                                        </div>
                                    </div>

                                    {/* Place Card */}
                                    <div className="flex flex-row flex-1 min-w-0 h-[102px] bg-white rounded-[8px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-[#1E518C]">
                                         <div className="w-[24px] bg-gray-50 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-gray-100 flex-shrink-0">
                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                         </div>

                                         <div className="flex-1 min-w-0 bg-[#F5F5F5] p-[8px] flex flex-col justify-start gap-[6px] h-full overflow-hidden">
                                            <h4 className="font-inter font-semibold text-[14px] text-black truncate w-full">
                                                {item.places?.name || "Note"}
                                            </h4>
                                            <p className="font-inter font-normal text-[12px] text-[#212121] leading-[15px] line-clamp-3">
                                               {item.item_type === 'note' 
                                                    ? item.note 
                                                    : (item.places?.description_short || item.places?.description || "No description")
                                               }
                                            </p>
                                         </div>

                                         {item.item_type === 'place' && item.places && (
                                             <div className="w-[109px] h-[102px] relative border-l border-[#1E518C] bg-gray-200 flex-shrink-0">
                                                <Image 
                                                    src={getImageSrc(item.places.images)} 
                                                    alt={item.places.name} 
                                                    fill 
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                             </div>
                                         )}
                                    </div>

                                    {/* ✅ ปุ่ม Delete ดึงเข้ามาใน Flex ทำให้ไม่ตกขอบขวาแล้ว */}
                                    <button 
                                        onClick={() => handleDeleteItem(item.id, dayData?.id || "")}
                                        className="w-[28px] h-[28px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[30px] flex items-center justify-center flex-shrink-0 opacity-0 group-hover/card:opacity-100 transition-all shadow-sm hover:bg-red-50 hover:border-red-200 cursor-pointer"
                                    >
                                        <Trash2 className="w-[14px] h-[14px] text-[#212121] hover:text-red-500" />
                                    </button>
                                </div>
                            ))}

                            {/* --- Saved Places Suggestions --- */}
                            {savedPlaces.length > 0 && (
                                <div className="flex flex-col gap-[8px] mt-4">
                                    <div className="flex items-center gap-[8px]">
                                         <span className="font-inter font-normal text-[12px] text-black">Saved Place</span>
                                         <ChevronDown className="w-[16px] h-[16px] text-black" />
                                    </div>
                                    
                                    <div className="flex gap-[8px] overflow-x-auto pb-2 scrollbar-thin">
                                        {savedPlaces.map((saved) => (
                                            saved.places && (
                                                <div key={saved.id} className="flex items-center gap-[10px] p-0 pr-2 border border-dashed border-[#9E9E9E] rounded-[8px] h-[40px] bg-white hover:bg-gray-50 flex-shrink-0 min-w-[150px]">
                                                    <div className="w-[40px] h-[40px] relative rounded-l-[8px] overflow-hidden">
                                                         <Image src={getImageSrc(saved.places.images)} alt={saved.places.name} fill className="object-cover" unoptimized />
                                                    </div>
                                                    <span className="text-[12px] font-normal text-black truncate flex-1 max-w-[120px]">{saved.places.name}</span>
                                                    
                                                    {dayData ? (
                                                        <div 
                                                            onClick={() => handleAddSavedPlace(dayData.id, saved.places)}
                                                            className="w-[24px] h-[24px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-full flex items-center justify-center mr-1 cursor-pointer hover:bg-[#3A82CE] hover:border-[#3A82CE] group"
                                                        >
                                                            <Plus className="w-[16px] h-[16px] text-black group-hover:text-white" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-[24px] h-[24px] bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center mr-1 cursor-not-allowed opacity-50" title="Please re-create trip to initialize days">
                                                            <Plus className="w-[16px] h-[16px] text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                        </div>
                    )}
                </div>
            );
        })}
      </div>

      {/* --- RIGHT COLUMN: Map --- */}
      <div className="w-[459px] bg-[#E5E5E5] overflow-hidden relative border border-gray-200 h-[928px] rounded-[16px] mt-[9px] sticky top-[20px]">
        <div className="absolute top-[20px] left-[20px] bg-white border border-black rounded-[8px] px-2 py-1 flex items-center gap-2 shadow-md z-[1000]">
             <Calendar className="w-4 h-4 text-black" />
             <span className="text-[12px] font-inter text-black">{dateRangeStr}</span>
        </div>
        <ItineraryMap locations={mapLocations} />
      </div>

    </div>
  );
}