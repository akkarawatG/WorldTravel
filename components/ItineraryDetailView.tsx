"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
    MapPin, Calendar, ChevronRight, ChevronDown, Plus,
    GripVertical, Trash2, Loader2, Pencil, Check, X, ChevronLeft,
    Car, Clock, FileText, Search, Map as MapIcon // ✅ เพิ่ม MapIcon
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getRouteData, searchPlaces, GeocodeResult } from "@/utils/openRouteService";
import TimePickerPopup from "./TimePickerPopup";
import { formatTimeDisplay } from "@/utils/timeHelpers";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

// --- Load Map แบบ Dynamic ---
const ItineraryMap = dynamic(() => import("./Map/ItineraryMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-gray-200 flex items-center justify-center">Loading Map...</div>
});

// --- Helper: เลือกสีตามวัน ---
const getDayColor = (date: Date) => {
    const dayIndex = date.getDay();
    switch (dayIndex) {
        case 1: return "#FFCF0F"; // Mon
        case 2: return "#FFCAD4"; // Tue
        case 3: return "#4CAF50"; // Wed
        case 4: return "#FF9800"; // Thu
        case 5: return "#3A82CE"; // Fri
        case 6: return "#8A38F5"; // Sat
        case 0: return "#F44336"; // Sun
        default: return "#E0E0E0";
    }
};

// --- Helper Functions for Formatting ---
const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins === 0 ? `${hours} hr` : `${hours} hr ${remainingMins} min`;
};

// --- Custom Date Picker Component ---
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

        if (!startDate || (startDate && endDate)) {
            onChange(dateStr, "");
        } else if (startDate && !endDate) {
            if (new Date(dateStr) < new Date(startDate)) {
                onChange(dateStr, startDate);
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

// --- Types & Interfaces ---
interface Place {
    id: string;
    name: string;
    description: string;
    description_short?: string;
    images: string[] | string | null;
    lat: number;
    lon: number;
    country?: string;
}

interface Location {
    id: string;
    name: string;
    full_address: string | null;
    lat: number;
    lon: number;
}

interface ScheduleItem {
    id: string;
    place_id: string | null;
    location_id: string | null;
    item_type: 'place' | 'note';
    note: string | null;
    order_index: number;
    start_time?: string | null;
    end_time?: string | null;
    places: Place | null;
    locations: Location | null;
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
    onDataUpdate?: () => void;
    scrollToDay?: number | null;
}

export default function ItineraryDetailView({ tripId, onDataUpdate, scrollToDay }: ItineraryDetailViewProps) {
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
    const datePickerRef = useRef<HTMLDivElement>(null);

    const [isViewAll, setIsViewAll] = useState(false);
    const [activeTimePickerId, setActiveTimePickerId] = useState<string | null>(null);

    // Map & Route States
    const [travelStats, setTravelStats] = useState<Record<string, { dist: string; dur: string; geometry: any; rawDist: number; rawDur: number; }>>({});
    const [dayTotals, setDayTotals] = useState<Record<number, { totalDist: string, totalDur: string }>>({});
    const routeCache = useRef(new Map<string, any>());

    // Search & Map Pick States
    const [activeSearchDayId, setActiveSearchDayId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<GeocodeResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // ✅ State ควบคุมโหมดการจิ้มแผนที่
    const [isMapPickMode, setIsMapPickMode] = useState(false);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const target = event.target as Element;
            if (datePickerRef.current && !datePickerRef.current.contains(target) && !target.closest('#date-picker-toggle')) {
                setIsDatePickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);

        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (query.trim().length > 2) {
            setIsSearching(true);
            searchTimeoutRef.current = setTimeout(async () => {

                let refLat: number | undefined;
                let refLon: number | undefined;

                if (activeSearchDayId) {
                    const dayData = schedules.find(s => s.id === activeSearchDayId);
                    if (dayData && dayData.daily_schedule_items.length > 0) {
                        const placeItems = dayData.daily_schedule_items
                            .filter(item => item.item_type === 'place' && (item.places || item.locations))
                            .sort((a, b) => b.order_index - a.order_index);

                        if (placeItems.length > 0) {
                            const lastPlace = placeItems[0];
                            refLat = lastPlace.places?.lat || lastPlace.locations?.lat;
                            refLon = lastPlace.places?.lon || lastPlace.locations?.lon;
                        }
                    }
                }

                const results = await searchPlaces(query, refLat, refLon);

                setSearchResults(results);
                setIsSearching(false);
            }, 500);
        } else {
            setSearchResults([]);
            setIsSearching(false);
        }
    };

    const handleSelectResult = async (result: GeocodeResult, dayId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { data: newLocation, error: locationError } = await supabase
                .from('locations')
                .insert({
                    profile_id: user?.id || null,
                    name: result.name,
                    full_address: result.label,
                    lat: result.coordinates[1],
                    lon: result.coordinates[0],
                })
                .select()
                .single();

            if (locationError) throw locationError;

            const currentDay = schedules.find(s => s.id === dayId);
            const newOrderIndex = (currentDay?.daily_schedule_items.length || 0) + 1;

            const { data: scheduleItem, error: scheduleError } = await supabase
                .from('daily_schedule_items')
                .insert({
                    daily_schedule_id: dayId,
                    place_id: null,
                    location_id: newLocation.id,
                    item_type: 'place',
                    note: null,
                    order_index: newOrderIndex
                })
                .select(`*, locations(id, name, lat, lon, full_address)`)
                .single();

            if (scheduleError) throw scheduleError;

            setSchedules(prev => prev.map(day => {
                if (day.id === dayId) {
                    const newItem: ScheduleItem = {
                        id: scheduleItem.id,
                        place_id: null,
                        location_id: scheduleItem.location_id,
                        item_type: 'place',
                        note: null,
                        order_index: newOrderIndex,
                        places: null,
                        locations: {
                            id: newLocation.id,
                            name: newLocation.name,
                            full_address: newLocation.full_address,
                            lat: newLocation.lat,
                            lon: newLocation.lon
                        }
                    };
                    return {
                        ...day,
                        daily_schedule_items: [...day.daily_schedule_items, newItem]
                    };
                }
                return day;
            }));

            setActiveSearchDayId(null);
            setSearchQuery("");
            setSearchResults([]);
        } catch (err) {
            console.error("Error adding place from search:", err);
            alert("Failed to add location");
        }
    };

    // ✅ ฟังก์ชัน: เพิ่มสถานที่จากการคลิกแผนที่
    const handleMapClick = async (lat: number, lng: number) => {
        if (!isMapPickMode || !activeSearchDayId) return;

        try {
            setIsSearching(true); // ปรับสถานะปุ่มค้นหาให้หมุนเพื่อบอกผู้ใช้ว่ากำลังโหลด

            // 1. ดึงชื่อที่อยู่จากพิกัด (Reverse Geocoding)
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
            const data = await res.json();

            let placeName = "Selected Map Location";
            if (data.address) {
                placeName = data.address.amenity || data.address.tourism || data.address.leisure || data.address.shop || data.address.building || data.address.road || data.name || placeName;
            } else if (data.name) {
                placeName = data.name;
            }

            const fullAddress = data.display_name || `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;

            // 2. เซฟลงตาราง locations
            const { data: { user } } = await supabase.auth.getUser();
            const { data: newLocation, error: locationError } = await supabase
                .from('locations')
                .insert({
                    profile_id: user?.id || null,
                    name: placeName,
                    full_address: fullAddress,
                    lat: lat,
                    lon: lng,
                })
                .select()
                .single();

            if (locationError) throw locationError;

            // 3. ผูกเข้ากับตาราง Schedule_items
            const currentDay = schedules.find(s => s.id === activeSearchDayId);
            const newOrderIndex = (currentDay?.daily_schedule_items.length || 0) + 1;

            const { data: scheduleItem, error: scheduleError } = await supabase
                .from('daily_schedule_items')
                .insert({
                    daily_schedule_id: activeSearchDayId,
                    place_id: null,
                    location_id: newLocation.id,
                    item_type: 'place',
                    note: null,
                    order_index: newOrderIndex
                })
                .select(`*, locations(id, name, lat, lon, full_address)`)
                .single();

            if (scheduleError) throw scheduleError;

            // 4. อัปเดตหน้าจอทันที
            setSchedules(prev => prev.map(day => {
                if (day.id === activeSearchDayId) {
                    const newItem: ScheduleItem = {
                        id: scheduleItem.id,
                        place_id: null,
                        location_id: scheduleItem.location_id,
                        item_type: 'place',
                        note: null,
                        order_index: newOrderIndex,
                        places: null,
                        locations: {
                            id: newLocation.id,
                            name: newLocation.name,
                            full_address: newLocation.full_address,
                            lat: newLocation.lat,
                            lon: newLocation.lon
                        }
                    };
                    return {
                        ...day,
                        daily_schedule_items: [...day.daily_schedule_items, newItem]
                    };
                }
                return day;
            }));

            // ปิดโหมดจิ้มแผนที่
            setIsMapPickMode(false);
            setActiveSearchDayId(null);
            setSearchQuery("");

        } catch (err) {
            console.error("Error picking place from map:", err);
            alert("Failed to add location from map");
        } finally {
            setIsSearching(false);
        }
    };

    const onDragEnd = async (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceDayId = source.droppableId;
        const destDayId = destination.droppableId;

        const newSchedules = JSON.parse(JSON.stringify(schedules)) as DailyScheduleData[];
        const sourceDayIndex = newSchedules.findIndex(s => s.id === sourceDayId);
        const destDayIndex = newSchedules.findIndex(s => s.id === destDayId);

        if (sourceDayIndex === -1 || destDayIndex === -1) return;

        const sourceItems = newSchedules[sourceDayIndex].daily_schedule_items;
        const destItems = newSchedules[destDayIndex].daily_schedule_items;

        const [movedItem] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, movedItem);

        const reindexItems = (items: ScheduleItem[]) => {
            return items.map((item, index) => ({
                ...item,
                order_index: index + 1
            }));
        };

        newSchedules[sourceDayIndex].daily_schedule_items = reindexItems(sourceItems);
        if (sourceDayId !== destDayId) {
            newSchedules[destDayIndex].daily_schedule_items = reindexItems(destItems);
        } else {
            newSchedules[sourceDayIndex].daily_schedule_items = reindexItems(sourceItems);
        }

        setSchedules(newSchedules);

        try {
            const itemsToUpdate: any[] = [];
            const daysToUpdate = sourceDayId === destDayId
                ? [newSchedules[sourceDayIndex]]
                : [newSchedules[sourceDayIndex], newSchedules[destDayIndex]];

            daysToUpdate.forEach(day => {
                day.daily_schedule_items.forEach(item => {
                    itemsToUpdate.push({
                        id: item.id,
                        order_index: item.order_index,
                        daily_schedule_id: day.id
                    });
                });
            });

            if (itemsToUpdate.length > 0) {
                const { error } = await supabase
                    .from('daily_schedule_items')
                    .upsert(itemsToUpdate, { onConflict: 'id' });

                if (error) throw error;
            }
        } catch (err) {
            console.error("Drag update failed:", err);
        }
    };

    useEffect(() => {
        const calculateRoutes = async () => {
            if (!schedules.length) return;

            const newStats: Record<string, { dist: string; dur: string; geometry: any; rawDist: number; rawDur: number; }> = {};
            const newDayTotals: Record<number, { totalDist: string, totalDur: string }> = {};

            const tasks: { id: string; start: { lat: number; lng: number }; end: { lat: number; lng: number } }[] = [];

            for (const day of schedules) {
                const placeItems = day.daily_schedule_items
                    .filter(item => item.item_type === 'place' && (item.places || item.locations))
                    .sort((a, b) => a.order_index - b.order_index);

                for (let i = 1; i < placeItems.length; i++) {
                    const prev = placeItems[i - 1];
                    const curr = placeItems[i];

                    const prevLat = prev.places?.lat || prev.locations?.lat;
                    const prevLon = prev.places?.lon || prev.locations?.lon;
                    const currLat = curr.places?.lat || curr.locations?.lat;
                    const currLon = curr.places?.lon || curr.locations?.lon;

                    if (prevLat && prevLon && currLat && currLon) {
                        const start = { lat: prevLat, lng: prevLon };
                        const end = { lat: currLat, lng: currLon };
                        const cacheKey = `${start.lat},${start.lng}-${end.lat},${end.lng}`;

                        if (routeCache.current.has(cacheKey)) {
                            newStats[curr.id] = routeCache.current.get(cacheKey);
                        } else {
                            tasks.push({ id: curr.id, start, end });
                        }
                    }
                }
            }

            const BATCH_SIZE = 2;

            for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
                const batch = tasks.slice(i, i + BATCH_SIZE);

                await Promise.all(batch.map(async (task) => {
                    try {
                        const res = await getRouteData(task.start, task.end);
                        if (res) {
                            const data = {
                                dist: res.distance,
                                dur: res.duration,
                                geometry: res.geometry,
                                rawDist: res.rawDistance,
                                rawDur: res.rawDuration
                            };
                            const cacheKey = `${task.start.lat},${task.start.lng}-${task.end.lat},${task.end.lng}`;
                            routeCache.current.set(cacheKey, data);
                            newStats[task.id] = data;
                        }
                    } catch (e) {
                        console.warn(`Skipping route for ${task.id} due to API limit`);
                    }
                }));

                if (i + BATCH_SIZE < tasks.length) {
                    await new Promise(resolve => setTimeout(resolve, 2500));
                }
            }

            for (const day of schedules) {
                const placeItems = day.daily_schedule_items
                    .filter(item => item.item_type === 'place' && (item.places || item.locations))
                    .sort((a, b) => a.order_index - b.order_index);

                let dailyDistRaw = 0;
                let dailyDurRaw = 0;

                for (let i = 1; i < placeItems.length; i++) {
                    const curr = placeItems[i];
                    const prev = placeItems[i - 1];

                    let cached = newStats[curr.id];

                    if (!cached) {
                        const prevLat = prev.places?.lat || prev.locations?.lat;
                        const prevLon = prev.places?.lon || prev.locations?.lon;
                        const currLat = curr.places?.lat || curr.locations?.lat;
                        const currLon = curr.places?.lon || curr.locations?.lon;

                        if (prevLat && currLat) {
                            const key = `${prevLat},${prevLon}-${currLat},${currLon}`;
                            cached = routeCache.current.get(key);
                            if (cached) newStats[curr.id] = cached;
                        }
                    }

                    if (cached) {
                        dailyDistRaw += cached.rawDist || 0;
                        dailyDurRaw += cached.rawDur || 0;
                    }
                }
                newDayTotals[day.day_number] = {
                    totalDist: formatDistance(dailyDistRaw),
                    totalDur: formatDuration(dailyDurRaw)
                };
            }

            setTravelStats(prev => ({ ...prev, ...newStats }));
            setDayTotals(newDayTotals);
        };

        calculateRoutes();
    }, [schedules]);

    useEffect(() => {
        if (scrollToDay !== null && scrollToDay !== undefined && scrollToDay > 0) {
            setExpandedDayIndex(scrollToDay - 1);
            setIsViewAll(false);

            setTimeout(() => {
                const element = document.getElementById(`day-${scrollToDay}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        }
    }, [scrollToDay]);

    const filteredSavedPlaces = useMemo(() => {
        if (!trip || !trip.name || savedPlaces.length === 0) return [];
        const tripCountry = trip.name.trim().toLowerCase();

        return savedPlaces.filter(saved => {
            const placeCountry = saved.places?.country?.trim().toLowerCase();
            return (
                placeCountry === tripCountry ||
                tripCountry.includes(placeCountry || "") ||
                placeCountry?.includes(tripCountry)
            );
        });
    }, [savedPlaces, trip]);

    const fetchSchedules = async (id: string) => {
        const { data, error } = await supabase
            .from('daily_schedules')
            .select(`
            id, day_number, 
            daily_schedule_items (
                id, place_id, location_id, item_type, note, order_index, start_time, end_time,
                places (id, name, description_short, images, lat, lon, country),
                locations (id, name, full_address, lat, lon)
            )
        `)
            .eq('itinerary_id', id)
            .order('day_number', { ascending: true });

        if (error) throw error;

        const sorted = (data || []).map((day: any) => {
            const rawItems = day.daily_schedule_items || [];
            const items: ScheduleItem[] = rawItems.map((item: any) => {
                const rawPlace = Array.isArray(item.places) ? item.places[0] : item.places;
                const rawLocation = Array.isArray(item.locations) ? item.locations[0] : item.locations;

                return {
                    ...item,
                    places: rawPlace || null,
                    locations: rawLocation || null
                };
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
                        .select(`id, place_id, places (id, name, description_short, images, lat, lon, country)`)
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
                                    lat: rawPlace.lat,
                                    lon: rawPlace.lon,
                                    country: rawPlace.country
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
        if (!trip) return [];
        const locations: any[] = [];

        if (isViewAll) {
            let globalIndex = 1;
            schedules.forEach((daySchedule) => {
                const date = new Date(trip.start_date);
                date.setDate(date.getDate() + (daySchedule.day_number - 1));
                const color = getDayColor(date);

                daySchedule.daily_schedule_items.forEach((item) => {
                    if (item.item_type === 'place' && (item.places || item.locations)) {
                        const stats = travelStats[item.id];
                        locations.push({
                            id: item.id,
                            name: item.places?.name || item.locations?.name,
                            lat: item.places?.lat || item.locations?.lat,
                            lng: item.places?.lon || item.locations?.lon,
                            order_index: globalIndex++,
                            color: color,
                            day_number: daySchedule.day_number,
                            geometry: stats?.geometry || null
                        });
                    }
                });
            });
            return locations;
        }

        if (expandedDayIndex === null) return [];
        const currentDayNum = expandedDayIndex + 1;
        const dbSchedule = schedules.find(s => s.day_number === currentDayNum);

        if (dbSchedule) {
            const date = new Date(trip.start_date);
            date.setDate(date.getDate() + (currentDayNum - 1));
            const color = getDayColor(date);

            dbSchedule.daily_schedule_items.forEach((item) => {
                if (item.item_type === 'place' && (item.places || item.locations)) {
                    const stats = travelStats[item.id];
                    locations.push({
                        id: item.id,
                        name: item.places?.name || item.locations?.name,
                        lat: item.places?.lat || item.locations?.lat,
                        lng: item.places?.lon || item.locations?.lon,
                        order_index: item.order_index,
                        color: color,
                        geometry: stats?.geometry || null
                    });
                }
            });
        }
        return locations;
    }, [expandedDayIndex, schedules, isViewAll, trip, travelStats]);

    // --- Handlers ---
    const toggleDay = (index: number) => {
        if (expandedDayIndex === index) {
            setExpandedDayIndex(null);
        } else {
            setExpandedDayIndex(index);
            setIsViewAll(false);
        }
    };

    const handleViewAll = () => {
        setIsViewAll(prev => {
            const newState = !prev;
            if (newState) {
                setExpandedDayIndex(null);
            } else {
                setExpandedDayIndex(0);
            }
            return newState;
        });
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
            if (onDataUpdate) onDataUpdate();
        } catch (err: any) {
            console.error("Failed to update title:", err.message);
        }
    };

    const handleToggleDatePicker = () => {
        if (!isDatePickerOpen && trip) {
            setTempDates({ start: trip.start_date, end: trip.end_date });
        }
        setIsDatePickerOpen(!isDatePickerOpen);
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
                    location_id: null,
                    item_type: 'place',
                    order_index: newOrderIndex
                })
                .select(`*, places(id, name, description_short, images, lat, lon, country)`)
                .single();
            if (error) throw error;

            setSchedules(prev => prev.map(day => {
                if (day.id === dayId) {
                    const newItem: ScheduleItem = {
                        id: data.id,
                        place_id: place.id,
                        location_id: null,
                        item_type: 'place',
                        note: null,
                        order_index: newOrderIndex,
                        places: place,
                        locations: null
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
        if (!confirm("Remove this item?")) return;

        try {
            const { error: deleteError } = await supabase
                .from('daily_schedule_items')
                .delete()
                .eq('id', itemId);

            if (deleteError) throw deleteError;

            const currentDaySchedule = schedules.find(day => day.id === dayId);
            if (!currentDaySchedule) return;

            const remainingItems = currentDaySchedule.daily_schedule_items
                .filter(item => item.id !== itemId)
                .sort((a, b) => a.order_index - b.order_index)
                .map((item, index) => ({
                    ...item,
                    order_index: index + 1
                }));

            const updates = remainingItems.map(item => ({
                id: item.id,
                daily_schedule_id: dayId,
                place_id: item.place_id,
                location_id: item.location_id,
                item_type: item.item_type,
                order_index: item.order_index,
                note: item.note
            }));

            if (updates.length > 0) {
                const { error: updateError } = await supabase
                    .from('daily_schedule_items')
                    .upsert(updates, { onConflict: 'id' });

                if (updateError) throw updateError;
            }

            setSchedules(prev => prev.map(day => {
                if (day.id === dayId) {
                    return {
                        ...day,
                        daily_schedule_items: remainingItems
                    };
                }
                return day;
            }));

        } catch (err: any) {
            console.error("Delete failed:", err.message);
            alert("Failed to delete item");
        }
    };

    const handleSaveTime = async (itemId: string, start: string, end: string) => {
        try {
            const { error } = await supabase
                .from('daily_schedule_items')
                .update({
                    start_time: start,
                    end_time: end
                })
                .eq('id', itemId);

            if (error) throw error;

            setSchedules(prev => prev.map(day => ({
                ...day,
                daily_schedule_items: day.daily_schedule_items.map(item =>
                    item.id === itemId
                        ? { ...item, start_time: start, end_time: end }
                        : item
                )
            })));

            setActiveTimePickerId(null);
        } catch (err) {
            console.error("Error saving time:", err);
        }
    };

    const handleClearTime = async (itemId: string) => {
        try {
            const { error } = await supabase
                .from('daily_schedule_items')
                .update({ start_time: null, end_time: null })
                .eq('id', itemId);

            if (error) throw error;

            setSchedules(prev => prev.map(day => ({
                ...day,
                daily_schedule_items: day.daily_schedule_items.map(item =>
                    item.id === itemId
                        ? { ...item, start_time: null, end_time: null }
                        : item
                )
            })));

            setActiveTimePickerId(null);
        } catch (err) {
            console.error("Error clearing time:", err);
        }
    };

    const handleAddNote = async (dayId: string | undefined) => {
        if (!dayId) return;
        try {
            const currentDay = schedules.find(s => s.id === dayId);
            const newOrderIndex = (currentDay?.daily_schedule_items.length || 0) + 1;

            const { data, error } = await supabase
                .from('daily_schedule_items')
                .insert({
                    daily_schedule_id: dayId,
                    item_type: 'note',
                    note: '',
                    order_index: newOrderIndex
                })
                .select()
                .single();

            if (error) throw error;

            setSchedules(prev => prev.map(day => {
                if (day.id === dayId) {
                    const newItem: ScheduleItem = {
                        id: data.id,
                        place_id: null,
                        location_id: null,
                        item_type: 'note',
                        note: '',
                        order_index: newOrderIndex,
                        places: null,
                        locations: null
                    };
                    return { ...day, daily_schedule_items: [...day.daily_schedule_items, newItem] };
                }
                return day;
            }));
        } catch (err: any) {
            console.error("Failed to add note:", err.message);
        }
    };

    const handleUpdateNote = async (itemId: string, text: string) => {
        setSchedules(prev => prev.map(day => ({
            ...day,
            daily_schedule_items: day.daily_schedule_items.map(item =>
                item.id === itemId ? { ...item, note: text } : item
            )
        })));
    };

    const handleBlurNote = async (itemId: string, text: string) => {
        await supabase.from('daily_schedule_items').update({ note: text }).eq('id', itemId);
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
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="w-[433px] flex flex-col gap-[24px] overflow-y-auto pr-2 h-[900px] scrollbar-hide pb-20">

                    <div className="flex flex-col gap-[24px] ">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2 w-full justify-center">
                                <input
                                    type="text"
                                    value={editedTitle}
                                    onChange={(e) => setEditedTitle(e.target.value)}
                                    className="font-inter font-semibold text-[32px] leading-[39px] text-black border-b-2 border-[#3A82CE] outline-none bg-transparent min-w-[200px]"
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
                        const total = dayTotals[day.day_number];

                        return (
                            <div key={day.day_number} className="flex flex-col w-full">
                                <div
                                    id={`day-${day.day_number}`}
                                    className="flex items-center gap-[13px] py-2 cursor-pointer w-full hover:bg-gray-50 rounded px-2 transition-colors"
                                    onClick={() => toggleDay(index)}
                                >
                                    <div className="w-[32px] h-[32px] flex items-center justify-center">
                                        <ChevronDown className={`w-8 h-8 text-black transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                                    </div>
                                    <div className="flex flex-col flex-1 justify-center">
                                        <span className="font-inter font-bold text-[18px] text-black">{day.dateString}</span>
                                    </div>
                                </div>

                                <div className="w-full h-px bg-black opacity-20 my-2"></div>

                                {isExpanded && (
                                    <div className="flex flex-col gap-[16px] pb-6 ml-[15px] border-l-2 border-[#E0E0E0] pl-[15px] animate-in slide-in-from-top-2">

                                        {/* Buttons Row */}
                                        <div className="flex flex-row gap-[8px] w-full relative z-[50]">

                                            {/* Search Logic */}
                                            {activeSearchDayId === dayData?.id ? (
                                                <div className="flex-1 relative">
                                                    <div className="h-[36px] bg-white border border-[#3A82CE] rounded-[8px] flex items-center px-3 gap-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                                        <Search className="w-4 h-4 text-[#3A82CE]" />
                                                        <input
                                                            type="text"
                                                            value={searchQuery}
                                                            onChange={handleSearchInput}
                                                            autoFocus
                                                            placeholder="Search places..."
                                                            className="flex-1 bg-transparent border-none outline-none text-[14px] text-black placeholder:text-gray-400 min-w-0"
                                                        />

                                                        {/* ✅ เพิ่มปุ่มหมุดสำหรับ Pick from map */}
                                                        <button
                                                            onClick={() => setIsMapPickMode(!isMapPickMode)}
                                                            className={`w-[24px] h-[24px] flex items-center justify-center rounded-[4px] transition-colors shrink-0 ${isMapPickMode ? 'bg-[#3A82CE] text-white' : 'bg-[#F0F6FC] text-[#3A82CE] hover:bg-[#D9EAF9]'}`}
                                                            title="Pick from map"
                                                        >
                                                            <MapIcon className="w-3 h-3" />
                                                        </button>

                                                        {isSearching ? <Loader2 className="w-4 h-4 text-gray-400 animate-spin shrink-0" /> : null}
                                                        <button className="shrink-0" onClick={() => { setActiveSearchDayId(null); setSearchQuery(""); setIsMapPickMode(false); }}><X className="w-4 h-4 text-gray-400 hover:text-red-500" /></button>
                                                    </div>

                                                    {/* Dropdown Results */}
                                                    {searchResults.length > 0 && !isMapPickMode && (
                                                        <div className="absolute top-[42px] left-0 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-[250px] overflow-y-auto z-[100] animate-in fade-in slide-in-from-top-2">
                                                            {searchResults.map((res) => (
                                                                <div
                                                                    key={res.id}
                                                                    onClick={() => handleSelectResult(res, dayData?.id || "")}
                                                                    className="px-3 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                                                                >
                                                                    <div className="text-[14px] font-medium text-black">{res.name}</div>
                                                                    <div className="text-[12px] text-gray-500 truncate">{res.label}</div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div
                                                    onClick={() => setActiveSearchDayId(dayData?.id || null)}
                                                    className="flex-1 h-[36px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[8px] flex items-center justify-center gap-[8px] text-[#616161] cursor-pointer hover:border-[#3A82CE] hover:text-[#3A82CE] transition"
                                                >
                                                    <Plus className="w-[16px] h-[16px]" />
                                                    <span className="font-inter font-normal text-[16px]">Add a place</span>
                                                </div>
                                            )}

                                            <div
                                                onClick={() => handleAddNote(dayData?.id)}
                                                className="w-[36px] h-[36px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#FFF8E1] hover:border-[#FBC02D] transition group shrink-0"
                                                title="Add Note"
                                            >
                                                <FileText className="w-[16px] h-[16px] text-[#616161] group-hover:text-[#F57F17]" />
                                            </div>
                                        </div>

                                        {dayData && (
                                            <Droppable droppableId={dayData.id}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.droppableProps}
                                                        className="flex flex-col gap-[8px] w-full"
                                                    >
                                                        {items.map((item, itemIndex) => {
                                                            const stats = travelStats[item.id];

                                                            // ✅ Render Condition
                                                            if (item.item_type === 'note') {
                                                                // --- Note Item UI ---
                                                                return (
                                                                    <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className={`flex flex-row items-center gap-[8px] w-full pr-[10px] ${snapshot.isDragging ? 'opacity-80 z-50' : ''}`}
                                                                            >
                                                                                <div className="absolute -left-[34px] w-[36px]" />

                                                                                <div className="flex flex-row flex-1 h-[36px] bg-[#F5F5F5] rounded-[8px] border border-[#EEEEEE] items-center overflow-hidden">
                                                                                    <div
                                                                                        {...provided.dragHandleProps}
                                                                                        className="w-[24px] h-full flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-[#EEEEEE]"
                                                                                    >
                                                                                        <GripVertical className="w-4 h-4 text-gray-400" />
                                                                                    </div>
                                                                                    <div className="flex-1 px-3 flex items-center gap-2">
                                                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                                                        <input
                                                                                            type="text"
                                                                                            value={item.note || ""}
                                                                                            onChange={(e) => handleUpdateNote(item.id, e.target.value)}
                                                                                            onBlur={(e) => handleBlurNote(item.id, e.target.value)}
                                                                                            placeholder="Add note"
                                                                                            className="bg-transparent border-none outline-none text-[12px] text-black w-full placeholder:text-gray-400 font-inter"
                                                                                        />
                                                                                    </div>
                                                                                </div>

                                                                                <button onClick={() => handleDeleteItem(item.id, dayData.id)} className="w-[28px] h-[28px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-[30px] flex items-center justify-center hover:bg-red-50 cursor-pointer">
                                                                                    <Trash2 className="w-3 h-3 text-[#212121] hover:text-red-500" />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            } else {
                                                                // --- Place / Location Item UI ---
                                                                const displayIndex = items
                                                                    .filter(i => i.item_type === 'place')
                                                                    .findIndex(p => p.id === item.id) + 1;

                                                                // เลือกว่าจะโชว์ข้อมูลจาก places หรือ locations
                                                                const displayName = item.places?.name || item.locations?.name || "Unknown Place";
                                                                const displayDesc = item.places?.description_short || item.places?.description || item.locations?.full_address || "No description";

                                                                // ✅ ตรวจสอบว่ามีรูปภาพจริงๆ หรือไม่ (มีเฉพาะในตาราง places)
                                                                const hasImage = item.places?.images && item.places?.images.length > 0;
                                                                const displayImage = hasImage ? getImageSrc(item.places?.images) : null;

                                                                return (
                                                                    <Draggable key={item.id} draggableId={item.id} index={itemIndex}>
                                                                        {(provided, snapshot) => (
                                                                            <div
                                                                                ref={provided.innerRef}
                                                                                {...provided.draggableProps}
                                                                                className={`flex flex-col gap-[8px] w-full relative group/card ${snapshot.isDragging ? 'opacity-80 z-50' : ''}`}
                                                                            >
                                                                                {/* Row 1: Place Card */}
                                                                                <div className="flex flex-row items-center gap-[8px] w-full pr-[10px]">
                                                                                    <div className="absolute -left-[34px] top-[51px] -translate-y-1/2 w-[36px] flex justify-center">
                                                                                        <div className="w-[20px] h-[25px] bg-[#1E518C] rounded-[4px] flex items-center justify-center text-white text-xs z-10 border border-[#C2DCF3]">
                                                                                            {displayIndex}
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="flex flex-row flex-1 min-w-0 h-[101px] bg-white rounded-[8px] overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-transparent hover:border-[#1E518C]">
                                                                                        <div
                                                                                            {...provided.dragHandleProps}
                                                                                            className="w-[24px] bg-gray-50 flex items-center justify-center cursor-grab active:cursor-grabbing border-r border-gray-100 flex-shrink-0"
                                                                                        >
                                                                                            <GripVertical className="w-4 h-4 text-gray-400" />
                                                                                        </div>
                                                                                        <div className="flex-1 min-w-0 bg-[#F5F5F5] p-[8px] flex flex-col justify-start gap-[6px] h-full overflow-hidden">
                                                                                            <h4 className="font-inter font-semibold text-[14px] text-black truncate w-full">
                                                                                                {displayName}
                                                                                            </h4>
                                                                                            <p className="font-inter font-normal text-[12px] text-[#212121] leading-[15px] line-clamp-3">
                                                                                                {displayDesc}
                                                                                            </p>
                                                                                        </div>

                                                                                        {/* ✅ แสดงกล่องรูปภาพ เฉพาะเมื่อมีรูปจริงๆ เท่านั้น */}
                                                                                        {displayImage && (
                                                                                            <div className="w-[109px] h-[101px] relative border-l border-[#1E518C] bg-gray-200 flex-shrink-0">
                                                                                                <Image
                                                                                                    src={displayImage}
                                                                                                    alt={displayName}
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

                                                                                {/* Row 2: Travel Info & Time Picker */}
                                                                                <div className="flex flex-row items-center gap-[16px] pl-[34px] w-full animate-in fade-in slide-in-from-top-1 relative mt-1">
                                                                                    {displayIndex > 1 && item.item_type === 'place' && (
                                                                                        <>
                                                                                            {stats ? (
                                                                                                <>
                                                                                                    <div className="flex items-center gap-[6px] bg-blue-50 px-2 py-1 rounded-md">
                                                                                                        <Clock className="w-[14px] h-[14px] text-blue-600" />
                                                                                                        <span className="font-inter font-medium text-[11px] text-blue-700">{stats.dur}</span>
                                                                                                    </div>
                                                                                                    <div className="flex items-center gap-[6px] bg-gray-50 px-2 py-1 rounded-md">
                                                                                                        <Car className="w-[14px] h-[14px] text-gray-600" />
                                                                                                        <span className="font-inter font-medium text-[11px] text-gray-700">{stats.dist}</span>
                                                                                                    </div>
                                                                                                </>
                                                                                            ) : (
                                                                                                <div className="flex items-center gap-[8px] opacity-40">
                                                                                                    <Loader2 className="w-[12px] h-[12px] animate-spin" />
                                                                                                    <span className="text-[10px]">Calculating...</span>
                                                                                                </div>
                                                                                            )}
                                                                                        </>
                                                                                    )}
                                                                                    <div className="relative">
                                                                                        <button
                                                                                            onClick={() => setActiveTimePickerId(activeTimePickerId === item.id ? null : item.id)}
                                                                                            className="flex items-center gap-[6px] text-[11px] text-gray-400 hover:text-blue-500 transition-colors"
                                                                                        >
                                                                                            <Clock className="w-[14px] h-[14px]" />
                                                                                            <span className="font-inter font-normal text-[12px] leading-[15px] text-black">
                                                                                                {item.start_time
                                                                                                    ? `${formatTimeDisplay(item.start_time || null)} - ${formatTimeDisplay(item.end_time || null)}`
                                                                                                    : "Add time"
                                                                                                }
                                                                                            </span>
                                                                                        </button>
                                                                                        {activeTimePickerId === item.id && (
                                                                                            <TimePickerPopup
                                                                                                initialStartTime={item.start_time || null}
                                                                                                initialEndTime={item.end_time || null}
                                                                                                onSave={(s, e) => handleSaveTime(item.id, s, e)}
                                                                                                onClose={() => setActiveTimePickerId(null)}
                                                                                                onClear={() => handleClearTime(item.id)}
                                                                                            />
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </Draggable>
                                                                );
                                                            }
                                                        })}
                                                        {provided.placeholder}
                                                    </div>
                                                )}
                                            </Droppable>
                                        )}

                                        {/* Total Section */}
                                        {total && items.filter(i => i.item_type === 'place').length > 1 && (
                                            <div className="flex justify-center items-center gap-4 py-4 mt-2">
                                                <span className="font-inter font-bold text-[12px] text-black">Total</span>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-[14px] h-[14px] text-[#616161]" />
                                                    <span className="font-inter font-normal text-[12px] text-black">{total.totalDur}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Car className="w-[14px] h-[14px] text-[#616161]" />
                                                    <span className="font-inter font-normal text-[12px] text-black">{total.totalDist}</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Saved Places Suggestions */}
                                        {filteredSavedPlaces.length > 0 && (
                                            <div className="flex flex-col gap-[8px] mt-4">
                                                <div className="flex items-center gap-[8px]">
                                                    <span className="font-inter font-normal text-[12px] text-black">Saved Place in {trip.name}</span>
                                                    <ChevronDown className="w-[16px] h-[16px] text-black" />
                                                </div>
                                                <div className="flex gap-[8px] overflow-x-auto pb-2 scrollbar-thin">
                                                    {filteredSavedPlaces.map((saved) => (
                                                        saved.places && (
                                                            <div key={saved.id} className="flex items-center gap-[10px] p-0 pr-2 border border-dashed border-[#9E9E9E] rounded-[8px] h-[40px] bg-white hover:bg-gray-50 flex-shrink-0 min-w-[150px]">
                                                                <div className="w-[40px] h-[40px] relative rounded-l-[8px] overflow-hidden">
                                                                    <Image src={getImageSrc(saved.places.images)} alt={saved.places.name} fill className="object-cover" unoptimized />
                                                                </div>
                                                                <span className="text-[12px] font-normal text-black truncate flex-1 max-w-[120px]">{saved.places.name}</span>
                                                                <div
                                                                    onClick={() => handleAddSavedPlace(dayData?.id, saved.places)}
                                                                    className="w-[24px] h-[24px] bg-[#F5F5F5] border border-[#EEEEEE] rounded-full flex items-center justify-center mr-1 cursor-pointer hover:bg-[#3A82CE] hover:border-[#3A82CE] group"
                                                                >
                                                                    <Plus className="w-[16px] h-[16px] text-black group-hover:text-white" />
                                                                </div>
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
            </DragDropContext>

            {/* --- RIGHT COLUMN: Map --- */}
            <div className="w-[459px] bg-[#E5E5E5] overflow-hidden relative border border-gray-200 h-[calc(100vh-120px)] rounded-[16px] mt-[24px] sticky top-[20px] flex flex-col shrink-0">

                <div className="w-full h-[52px] bg-white flex flex-row items-center justify-between px-[16px] border-b border-gray-200 flex-shrink-0 relative z-[1000]">
                    {/* ✅ เพิ่ม id ให้ปุ่มเปิดปฏิทิน */}
                    <div
                        id="date-picker-toggle"
                        onClick={handleToggleDatePicker}
                        className="box-border flex flex-row items-center px-[8px] py-[4px] gap-[8px] bg-white border border-black rounded-[8px] cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                        <Calendar className="w-[16px] h-[16px] text-black" />
                        <span className="font-inter font-normal text-[16px] leading-[19px] text-center text-black">
                            {dateRangeStr}
                        </span>
                    </div>

                    <button
                        onClick={handleViewAll}
                        className={`box-border flex flex-row justify-center items-center px-[12px] py-[8px] gap-[8px] border-2 rounded-[16px] transition-colors ${isViewAll ? 'bg-[#154a85] border-[#1E518C] shadow-inner' : 'bg-[#2666B0] border-[#95C3EA] hover:bg-[#1e5594]'}`}
                    >
                        <span className="font-inter font-normal text-[14px] leading-[17px] text-white select-none">
                            {isViewAll ? "Close All" : "View All"}
                        </span>
                    </button>

                    {/* ✅ เพิ่ม ref ให้ container ปฏิทิน */}
                    {isDatePickerOpen && (
                        <div ref={datePickerRef} className="absolute top-[60px] left-[16px] animate-in fade-in zoom-in-95 duration-200 z-[1100]">
                            <CustomDateRangePicker
                                startDate={tempDates.start}
                                endDate={tempDates.end}
                                onChange={handlePickerChange}
                                onClose={() => setIsDatePickerOpen(false)}
                            />
                        </div>
                    )}
                </div>

                {/* ✅ เพิ่ม Overlay บอกสถานะเมื่อเปิดโหมดจิ้มแผนที่ */}
                <div className="flex-1 relative w-full h-full z-0">
                    {isMapPickMode && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] bg-[#3A82CE] text-white px-4 py-2 rounded-full shadow-lg font-inter text-[14px] flex items-center gap-2 animate-bounce pointer-events-none">
                            <MapPin className="w-4 h-4" /> Click anywhere on the map to add location
                        </div>
                    )}

                    {/* ส่ง Props onMapClick ไปให้ Component แผนที่ */}
                    <ItineraryMap locations={mapLocations} onMapClick={handleMapClick} />
                </div>
            </div>
        </div>
    );
}