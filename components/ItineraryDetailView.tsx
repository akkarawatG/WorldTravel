"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
    MapPin, Calendar, ChevronRight, ChevronDown, Plus,
    GripVertical, Trash2, Loader2, Pencil, Check, X, ChevronLeft
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Load Map แบบ Dynamic
const ItineraryMap = dynamic(() => import("./Map/ItineraryMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading Map...</div>
});

// --- Custom Date Picker (แก้ไขให้เลือกช่วงเวลาได้ถูกต้อง) ---
function CustomDateRangePicker({
    startDate,
    endDate,
    onChange,
    onClose
}: {
    startDate: string,
    endDate: string,
    onChange: (s: string, e: string) => void,
    onClose: () => void
}) {
    const initialDate = startDate ? new Date(startDate) : new Date();
    const [viewDate, setViewDate] = useState(initialDate);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        const offset = clickedDate.getTimezoneOffset();
        const localDate = new Date(clickedDate.getTime() - (offset * 60 * 1000));
        const dateStr = localDate.toISOString().split('T')[0];

        // Logic การเลือกช่วงเวลา (Start -> End)
        if (!startDate || (startDate && endDate)) {
            // เริ่มเลือกใหม่
            onChange(dateStr, "");
        } else if (startDate && !endDate) {
            // เลือกวันจบ
            if (new Date(dateStr) < new Date(startDate)) {
                onChange(dateStr, startDate); // สลับถ้าวันจบน้อยกว่าวันเริ่ม
            } else {
                onChange(startDate, dateStr);
            }
        }
    };

    const isSelected = (day: number) => {
        const d = new Date(year, month, day).setHours(0, 0, 0, 0);
        const s = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
        const e = endDate ? new Date(endDate).setHours(0, 0, 0, 0) : null;

        if (s && d === s) return "start";
        if (e && d === e) return "end";
        if (s && e && d > s && d < e) return "range";
        return null;
    };

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    return (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-[300px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition"><ChevronLeft className="w-5 h-5 text-gray-500" /></button>
                <span className="font-bold text-gray-800 text-[14px] font-inter">{viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                <button onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition"><ChevronRight className="w-5 h-5 text-gray-500" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                    <div key={d} className="text-[12px] font-medium text-gray-400 font-inter">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-4">
                {Array.from({ length: (startDay === 0 ? 6 : startDay - 1) }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const status = isSelected(day);
                    let bgClass = "hover:bg-blue-50 text-gray-700";
                    let textClass = "text-gray-700";

                    if (status === 'start' || status === 'end') {
                        bgClass = "bg-[#3A82CE] hover:bg-[#2c6cb0]";
                        textClass = "text-white font-bold";
                    }
                    if (status === 'range') {
                        bgClass = "bg-[#E3F2FD]";
                        textClass = "text-[#1565C0]";
                    }

                    return (
                        <button key={day} onClick={() => handleDayClick(day)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition mx-auto font-inter ${bgClass} ${textClass}`}>
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100 gap-2">
                <button onClick={onClose} className="text-gray-500 text-[12px] hover:text-gray-700 px-2">Cancel</button>
            </div>
        </div>
    );
}

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
    onDataUpdate?: () => void; // รับ prop นี้มาจาก Parent
}

export default function ItineraryDetailView({ tripId, onDataUpdate }: ItineraryDetailViewProps) {
    const supabase = createClient();

    // State
    const [loading, setLoading] = useState(true);
    const [trip, setTrip] = useState<ItineraryData | null>(null);
    const [schedules, setSchedules] = useState<DailyScheduleData[]>([]);
    const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);

    // UI State
    const [expandedDayIndex, setExpandedDayIndex] = useState<number | null>(0);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [tempDates, setTempDates] = useState({ start: "", end: "" });

    const fetchSchedules = async (id: string) => {
        const { data, error } = await supabase
            .from('daily_schedules')
            .select(`
            id, day_number, 
            daily_schedule_items (
                id, place_id, item_type, note, order_index,
                places (id, name, description_short, images, lat, lon)
            )
        `)
            .eq('itinerary_id', id)
            .order('day_number', { ascending: true });

        if (error) throw error;

        const sorted = (data || []).map((day: any) => {
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
        return sorted;
    };

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
                setEditedTitle(tripData.name);

                const sortedSchedules = await fetchSchedules(tripId);
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

    const handleUpdateTitle = async () => {
        if (!editedTitle.trim() || !trip) return;
        try {
            const { error } = await supabase
                .from('itineraries')
                .update({ name: editedTitle })
                .eq('id', trip.id);

            if (error) throw error;
            setTrip({ ...trip, name: editedTitle });
            setIsEditingTitle(false);

            // ✅ แจ้ง Parent ให้โหลด Sidebar ใหม่
            if (onDataUpdate) onDataUpdate();

        } catch (err: any) {
            console.error("Failed to update title:", err.message);
        }
    };

    const handleOpenDatePicker = () => {
        if (trip) {
            setTempDates({ start: trip.start_date, end: trip.end_date });
        }
        setIsDatePickerOpen(true);
    };

    const handlePickerChange = (newStart: string, newEnd: string) => {
        setTempDates({ start: newStart, end: newEnd });
        if (newStart && newEnd) {
            handleCommitDates(newStart, newEnd);
        }
    };

    const handleCommitDates = async (newStart: string, newEnd: string) => {
        if (!trip) return;

        try {
            const { error } = await supabase
                .from('itineraries')
                .update({ start_date: newStart, end_date: newEnd })
                .eq('id', trip.id);

            if (error) throw error;

            setTrip({ ...trip, start_date: newStart, end_date: newEnd });

            const start = new Date(newStart);
            const end = new Date(newEnd);
            const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

            const existingDaysCount = schedules.length;

            if (diffDays > existingDaysCount) {
                const newSchedules = [];
                for (let i = existingDaysCount + 1; i <= diffDays; i++) {
                    newSchedules.push({
                        itinerary_id: trip.id,
                        day_number: i
                    });
                }
                await supabase.from('daily_schedules').insert(newSchedules);

                const updatedSchedules = await fetchSchedules(trip.id);
                setSchedules(updatedSchedules);
            }

            // ✅ แจ้ง Parent ให้โหลด Sidebar ใหม่
            if (onDataUpdate) onDataUpdate();

            setIsDatePickerOpen(false);

        } catch (err: any) {
            console.error("Failed to update dates:", err.message);
            alert("Failed to update dates");
        }
    };

    const handleAddSavedPlace = async (dayId: string | undefined, place: Place | null) => {
        if (!place) return;
        if (!dayId) {
            alert("Please create or extend your trip dates first.");
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
        }
    };

    const handleDeleteItem = async (itemId: string, dayId: string) => {
        if (!confirm("Remove this place?")) return;
        try {
            const { error } = await supabase.from('daily_schedule_items').delete().eq('id', itemId);
            if (error) throw error;

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
            try { const parsed = JSON.parse(images); if (Array.isArray(parsed) && parsed.length > 0) return parsed[0]; } catch (e) { }
            return images;
        }
        return "https://placehold.co/600x400?text=No+Image";
    };

    if (loading) return <div className="w-full h-[600px] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#3A82CE] animate-spin" /></div>;
    if (!trip) return <div className="w-full h-[600px] flex items-center justify-center text-gray-500">Trip not found</div>;

    const dateRangeStr = `${new Date(trip.start_date).getDate()}/${new Date(trip.start_date).toLocaleDateString('en-GB', { month: 'short' })} - ${new Date(trip.end_date).getDate()}/${new Date(trip.end_date).toLocaleDateString('en-GB', { month: 'short' })}`;

    return (
        <div className="w-full flex flex-row gap-[24px] relative h-full min-h-[900px]">

            {/* --- LEFT COLUMN: Timeline --- */}
            <div className="w-[433px] flex flex-col gap-[24px] overflow-y-auto pr-2 h-[900px] scrollbar-hide pb-20">

                {/* Title & Edit */}
                <div className="flex flex-col gap-[24px] items-center">
                    {isEditingTitle ? (
                        <div className="flex items-center gap-2 w-full justify-center">
                            <input
                                type="text"
                                value={editedTitle}
                                onChange={(e) => setEditedTitle(e.target.value)}
                                className="font-inter font-semibold text-[32px] leading-[39px] text-black text-center border-b-2 border-[#3A82CE] outline-none bg-transparent min-w-[200px]"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleUpdateTitle();
                                    if (e.key === 'Escape') {
                                        setEditedTitle(trip.name);
                                        setIsEditingTitle(false);
                                    }
                                }}
                            />
                            <button onClick={handleUpdateTitle} className="p-2 hover:bg-green-50 rounded-full transition-colors">
                                <Check className="w-6 h-6 text-green-600" />
                            </button>
                            <button onClick={() => { setEditedTitle(trip.name); setIsEditingTitle(false); }} className="p-2 hover:bg-red-50 rounded-full transition-colors">
                                <X className="w-6 h-6 text-red-600" />
                            </button>
                        </div>
                    ) : (
                        <div className="group flex items-center gap-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg transition-colors" onClick={() => {
                            setEditedTitle(trip.name);
                            setIsEditingTitle(true);
                        }}>
                            <h1 className="font-inter font-semibold text-[32px] leading-[39px] text-black text-center">
                                {trip.name}
                            </h1>
                            <Pencil className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    )}
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
                                        <div key={item.id} className="flex flex-row items-center gap-[8px] relative group/card w-full pr-[10px]">

                                            <div className="absolute -left-[34px] top-[50%] -translate-y-1/2 w-[36px] flex justify-center">
                                                <div className="w-[20px] h-[25px] bg-[#1E518C] rounded-[4px] flex items-center justify-center text-white text-xs z-10 border border-[#C2DCF3]">
                                                    {item.order_index}
                                                </div>
                                            </div>

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
                                                                <div className="w-[24px] h-[24px] bg-gray-100 border border-gray-200 rounded-full flex items-center justify-center mr-1 cursor-not-allowed opacity-50" title="Extend trip dates to enable">
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
      <div className="w-[459px] bg-[#E5E5E5] overflow-hidden relative border border-gray-200 h-[928px] rounded-[16px] mt-[9px] sticky top-[20px] flex flex-col">
        
        {/* Header Section */}
        <div className="w-full h-[52px] bg-white flex flex-row items-center justify-between px-[16px] border-b border-gray-200 flex-shrink-0 relative z-[1000]">
            
            {/* ✅ Left: Date Picker Trigger (Updated Style Frame 1760) */}
            <div 
                onClick={handleOpenDatePicker}
                className="box-border flex flex-row items-center px-[8px] py-[4px] gap-[8px] bg-white border border-black rounded-[8px] cursor-pointer hover:bg-gray-50 transition-colors"
            >
                 <Calendar className="w-[16px] h-[16px] text-black" />
                 <span className="font-inter font-normal text-[16px] leading-[19px] text-center text-black">
                    {dateRangeStr}
                 </span>
            </div>

            {/* Right: View All Button */}
            <button className="box-border flex flex-row justify-center items-center px-[12px] py-[8px] gap-[8px] bg-[#2666B0] border-2 border-[#95C3EA] rounded-[16px] hover:bg-[#1e5594] transition-colors">
                <span className="font-inter font-normal text-[14px] leading-[17px] text-white">
                    View All
                </span>
            </button>

            {/* Date Picker Popover */}
            {isDatePickerOpen && (
                <div className="absolute top-[60px] left-[16px] animate-in fade-in zoom-in-95 duration-200 z-[1100]">
                    <CustomDateRangePicker 
                        startDate={tempDates.start}
                        endDate={tempDates.end}
                        onChange={handlePickerChange}
                        onClose={() => setIsDatePickerOpen(false)}
                    />
                </div>
            )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative w-full h-full">
            <ItineraryMap locations={mapLocations} />
        </div>

      </div>

        </div>
    );
}