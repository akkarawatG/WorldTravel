"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
    Loader2, ArrowLeft, Plus,
    ChevronDown, ArrowRightLeft, Calendar, Pencil,
    Plane, BedDouble, Car, Ticket, Bus, Utensils,
    MapPin, ShoppingBag, Fuel, ShieldAlert, FileText, MoreHorizontal,
    ChevronRight, ChevronLeft, Trash2, Map as MapIcon, Search // ✅ ใช้ Search icon
} from "lucide-react";
import dynamic from "next/dynamic";
import { getRouteData } from "@/utils/openRouteService";

// --- Load Map safely ---
const ItineraryMap = dynamic(() => import("./Map/ItineraryMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#E5E5E5] flex items-center justify-center text-gray-400">Loading Map...</div>
});

// --- Types ---
interface Itinerary {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
}

interface Expense {
    id: string;
    itinerary_id: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expense_date: string | null;
    note: string | null;
}

// --- API Config ---
const EXCHANGE_API_KEY = "886bec30e754ffa5aae195e2";

// --- Helper Functions ---
const formatDateRange = (start: string | null, end: string | null) => {
    if (!start || !end) return "";
    const s = new Date(start);
    const e = new Date(end);
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    return `${s.toLocaleDateString('en-GB', options)} - ${e.toLocaleDateString('en-GB', options)}`;
};

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

// --- Categories Data ---
const EXPENSE_CATEGORIES = [
    { id: "flights", label: "Flights", icon: <Plane className="w-6 h-6 text-[#194473]" /> },
    { id: "hotel", label: "Hotel", icon: <BedDouble className="w-6 h-6 text-[#194473]" /> },
    { id: "car_rental", label: "Car rental", icon: <Car className="w-6 h-6 text-[#194473]" /> },
    { id: "ticket", label: "Ticket", icon: <Ticket className="w-6 h-6 text-[#194473]" /> },
    { id: "transport", label: "Transport", icon: <Bus className="w-6 h-6 text-[#194473]" /> },
    { id: "food", label: "Food", icon: <Utensils className="w-6 h-6 text-[#194473]" /> },
    { id: "attractions", label: "Attractions", icon: <MapPin className="w-6 h-6 text-[#194473]" /> },
    { id: "shopping", label: "Shopping", icon: <ShoppingBag className="w-6 h-6 text-[#194473]" /> },
    { id: "fuel", label: "Fuel", icon: <Fuel className="w-6 h-6 text-[#194473]" /> },
    { id: "insurance", label: "Insurance", icon: <ShieldAlert className="w-6 h-6 text-[#194473]" /> },
    { id: "visa_fees", label: "Visa & Fees", icon: <FileText className="w-6 h-6 text-[#194473]" /> },
    { id: "others", label: "Others", icon: <MoreHorizontal className="w-6 h-6 text-[#194473]" /> },
];

const getCategoryIcon = (id: string) => {
    const cat = EXPENSE_CATEGORIES.find(c => c.id === id);
    return cat ? cat.icon : <MoreHorizontal className="w-6 h-6 text-[#194473]" />;
};

// --- Custom Single Date Picker Component ---
function SingleDatePicker({
    selectedDate,
    onChange,
    onClose
}: {
    selectedDate: string,
    onChange: (date: string) => void,
    onClose: () => void
}) {
    const initialDate = selectedDate ? new Date(selectedDate) : new Date();
    const [viewDate, setViewDate] = useState(initialDate);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(Date.UTC(year, month, day));
        const dateStr = clickedDate.toISOString().split('T')[0];
        onChange(dateStr);
        onClose();
    };

    const nextMonth = () => setViewDate(new Date(year, month + 1, 1));
    const prevMonth = () => setViewDate(new Date(year, month - 1, 1));

    return (
        <div className="bg-white rounded-[12px] shadow-[0px_4px_8px_rgba(0,0,0,0.2)] border border-gray-200 p-3 w-[240px]" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
                <button type="button" onClick={prevMonth} className="p-1 hover:bg-gray-100 rounded-full transition"><ChevronLeft className="w-4 h-4 text-gray-500" /></button>
                <span className="font-bold text-gray-800 text-[12px] font-inter">{viewDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <button type="button" onClick={nextMonth} className="p-1 hover:bg-gray-100 rounded-full transition"><ChevronRight className="w-4 h-4 text-gray-500" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                    <div key={d} className="text-[10px] font-medium text-gray-400 font-inter">{d}</div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: (startDay === 0 ? 6 : startDay - 1) }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dStr = new Date(Date.UTC(year, month, day)).toISOString().split('T')[0];
                    const isSelected = dStr === selectedDate;

                    return (
                        <button
                            key={day}
                            type="button"
                            onClick={() => handleDayClick(day)}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] transition mx-auto font-inter ${isSelected ? "bg-[#3A82CE] text-white font-bold shadow-sm" : "hover:bg-blue-50 text-gray-700"}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// --- Component ---
export default function BudgetDetailView({ tripId, onBack }: { tripId: string, onBack: () => void }) {
    const supabase = createClient();

    // Data State
    const [trip, setTrip] = useState<Itinerary | null>(null);
    const [schedulesData, setSchedulesData] = useState<any[]>([]);
    const [expensesList, setExpensesList] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Route & Map State
    const [travelStats, setTravelStats] = useState<Record<string, any>>({});
    const routeCache = useRef(new Map<string, any>());

    // State สำหรับควบคุมการแสดงผลบนมือถือ
    const [mobileViewMode, setMobileViewMode] = useState<'list' | 'map'>('list');

    // Currency State
    const [currencies, setCurrencies] = useState<string[][]>([["THB", "Thai Baht"], ["USD", "United States Dollar"], ["EUR", "Euro"], ["JPY", "Japanese Yen"], ["GBP", "British Pound"]]);
    const [currency1, setCurrency1] = useState<string>("THB");
    const [currency2, setCurrency2] = useState<string>("USD");
    const [amount1, setAmount1] = useState<string>("100000");
    const [amount2, setAmount2] = useState<string>("");
    const [exchangeRate, setExchangeRate] = useState<number>(0);

    // ✅ State สำหรับค้นหาสกุลเงิน
    const [currencySearch, setCurrencySearch] = useState("");

    // Custom Dropdown State
    const [isDropdown1Open, setIsDropdown1Open] = useState(false);
    const [isDropdown2Open, setIsDropdown2Open] = useState(false);
    const dropdown1Ref = useRef<HTMLDivElement>(null);
    const dropdown2Ref = useRef<HTMLDivElement>(null);

    // Add / Edit Expense Form State
    const [showExpenseForm, setShowExpenseForm] = useState(false);
    const [expenseStep, setExpenseStep] = useState<0 | 1>(0);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const [customCategoryName, setCustomCategoryName] = useState("");

    const [expenseAmount, setExpenseAmount] = useState("");
    const [expenseCurrency, setExpenseCurrency] = useState("THB");
    const [expenseDesc, setExpenseDesc] = useState("");
    const [expenseDate, setExpenseDate] = useState("");

    const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);

    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [datePickerPosition, setDatePickerPosition] = useState({ top: 0, left: 0 });
    const datePickerRef = useRef<HTMLDivElement>(null);

    const [isExpenseDropdownOpen, setIsExpenseDropdownOpen] = useState(false);
    const expenseDropdownRef = useRef<HTMLDivElement>(null);

    // --- Fetch Data ---
    useEffect(() => {
        const fetchData = async () => {
            if (!tripId) return;
            setLoading(true);
            try {
                const { data: tripData } = await supabase.from('itineraries').select('*').eq('id', tripId).single();
                if (tripData) {
                    setTrip(tripData);
                    setExpenseDate(tripData.start_date);
                }

                const { data: schedules } = await supabase
                    .from('daily_schedules')
                    .select(`id, day_number, daily_schedule_items (id, order_index, item_type, places (id, name, lat, lon))`)
                    .eq('itinerary_id', tripId)
                    .order('day_number', { ascending: true });
                if (schedules) setSchedulesData(schedules);

                fetchExpenses();
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tripId]);

    const fetchExpenses = async () => {
        if (!tripId) return;
        try {
            const { data, error } = await supabase
                .from('expenses')
                .select('*')
                .eq('itinerary_id', tripId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setExpensesList(data || []);
        } catch (error) {
            console.error("Error fetching expenses:", error);
        }
    };

    // --- Calculate Routes ---
    useEffect(() => {
        const calculateRoutes = async () => {
            if (!schedulesData.length) return;
            const newStats: Record<string, any> = {};
            const tasks: { id: string; start: { lat: number; lng: number }; end: { lat: number; lng: number } }[] = [];

            for (const day of schedulesData) {
                const placeItems = day.daily_schedule_items
                    .filter((item: any) => item.item_type === 'place' && item.places)
                    .sort((a: any, b: any) => a.order_index - b.order_index);

                for (let i = 1; i < placeItems.length; i++) {
                    const prev = placeItems[i - 1];
                    const curr = placeItems[i];
                    if (prev.places && curr.places) {
                        const start = { lat: prev.places.lat, lng: prev.places.lon };
                        const end = { lat: curr.places.lat, lng: curr.places.lon };
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
                            const data = { geometry: res.geometry };
                            const cacheKey = `${task.start.lat},${task.start.lng}-${task.end.lat},${task.end.lng}`;
                            routeCache.current.set(cacheKey, data);
                            newStats[task.id] = data;
                        }
                    } catch (e) {
                        console.warn(`Skipping route for ${task.id}`);
                    }
                }));
                if (i + BATCH_SIZE < tasks.length) await new Promise(resolve => setTimeout(resolve, 2500));
            }
            setTravelStats(prev => ({ ...prev, ...newStats }));
        };
        calculateRoutes();
    }, [schedulesData]);

    const mapLocations = useMemo(() => {
        if (!schedulesData.length || !trip) return [];
        const locations: any[] = [];
        let globalIndex = 1;

        schedulesData.forEach((day: any) => {
            const date = new Date(trip.start_date);
            date.setDate(date.getDate() + (day.day_number - 1));
            const color = getDayColor(date);

            const items = day.daily_schedule_items || [];
            items.sort((a: any, b: any) => a.order_index - b.order_index);
            items.forEach((item: any) => {
                if (item.item_type === 'place' && item.places) {
                    const stats = travelStats[item.id];
                    locations.push({
                        id: item.id,
                        name: item.places.name,
                        lat: item.places.lat,
                        lng: item.places.lon,
                        day_number: day.day_number,
                        order_index: globalIndex++,
                        color: color,
                        geometry: stats?.geometry || null
                    });
                }
            });
        });
        return locations;
    }, [schedulesData, travelStats, trip]);

    // --- Currency API ---
    useEffect(() => {
        const fetchAllCurrencies = async () => {
            try {
                const res = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/codes`);
                const data = await res.json();
                if (data.result === "success") {
                    setCurrencies(data.supported_codes);
                }
            } catch (e) { console.error("Failed to fetch currencies codes", e); }
        };
        fetchAllCurrencies();
    }, []);

    useEffect(() => {
        const fetchRate = async () => {
            if (!currency1 || !currency2) return;
            try {
                const res = await fetch(`https://v6.exchangerate-api.com/v6/${EXCHANGE_API_KEY}/pair/${currency1}/${currency2}`);
                const data = await res.json();
                if (data.result === "success") {
                    setExchangeRate(data.conversion_rate);
                    if (amount1) setAmount2((parseFloat(amount1) * data.conversion_rate).toFixed(2));
                }
            } catch (e) { console.error("API Error", e); }
        };
        fetchRate();
    }, [currency1, currency2]);

    const handleAmount1Change = (val: string) => {
        setAmount1(val);
        if (val && exchangeRate) setAmount2((parseFloat(val) * exchangeRate).toFixed(2));
        else setAmount2("");
    };

    const handleAmount2Change = (val: string) => {
        setAmount2(val);
        if (val && exchangeRate) setAmount1((parseFloat(val) / exchangeRate).toFixed(2));
        else setAmount1("");
    };

    const handleSwapCurrencies = () => {
        setCurrency1(currency2);
        setCurrency2(currency1);
        setAmount1(amount2);
        setAmount2(amount1);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdown1Ref.current && !dropdown1Ref.current.contains(event.target as Node)) setIsDropdown1Open(false);
            if (dropdown2Ref.current && !dropdown2Ref.current.contains(event.target as Node)) setIsDropdown2Open(false);
            if (expenseDropdownRef.current && !expenseDropdownRef.current.contains(event.target as Node)) setIsExpenseDropdownOpen(false);

            const target = event.target as Element;
            if (!target.closest('#date-picker-container') && !target.closest('#date-input-box')) {
                setIsDatePickerOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleOpenDatePicker = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!datePickerRef.current) return;
        const rect = datePickerRef.current.getBoundingClientRect();
        const calendarWidth = 240;
        
        setDatePickerPosition({
            top: rect.bottom + window.scrollY + 4,
            left: rect.right + window.scrollX - calendarWidth,
        });
        setIsDatePickerOpen(!isDatePickerOpen);
    };

    const handleEditExpense = (expense: Expense) => {
        setEditingExpenseId(expense.id);
        setSelectedCategory(expense.category);

        if (expense.category === "others") {
            setCustomCategoryName(expense.title);
        } else {
            setCustomCategoryName("");
        }

        setExpenseAmount(expense.amount.toString());
        setExpenseCurrency(expense.currency);
        setExpenseDesc(expense.note || "");
        setExpenseDate(expense.expense_date || "");

        setExpenseStep(1);
        setShowExpenseForm(true);
    };

    const handleAddExpenseClick = () => {
        setEditingExpenseId(null);
        setSelectedCategory(null);
        setCustomCategoryName("");
        setExpenseAmount("");
        setExpenseCurrency("THB");
        setExpenseDesc("");
        setExpenseDate(trip?.start_date || "");

        setExpenseStep(0);
        setShowExpenseForm(true);
    };

    const handleSaveExpense = async () => {
        if (!expenseAmount || isNaN(Number(expenseAmount))) return;
        if (selectedCategory === "others" && !customCategoryName.trim()) return;

        setIsSaving(true);
        try {
            const catLabel = selectedCategory === "others"
                ? customCategoryName
                : EXPENSE_CATEGORIES.find(c => c.id === selectedCategory)?.label || "Other";

            if (editingExpenseId) {
                const { error } = await supabase
                    .from('expenses')
                    .update({
                        title: catLabel,
                        amount: parseFloat(expenseAmount),
                        currency: expenseCurrency,
                        category: selectedCategory,
                        expense_date: expenseDate || null,
                        note: expenseDesc || null,
                    })
                    .eq('id', editingExpenseId);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('expenses')
                    .insert({
                        itinerary_id: tripId,
                        title: catLabel,
                        amount: parseFloat(expenseAmount),
                        currency: expenseCurrency,
                        category: selectedCategory,
                        expense_date: expenseDate || null,
                        note: expenseDesc || null,
                    });

                if (error) throw error;
            }

            setShowExpenseForm(false);
            fetchExpenses();
        } catch (err: any) {
            console.error("Error saving expense:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteExpense = async () => {
        if (!editingExpenseId) return;
        if (!confirm("Are you sure you want to delete this expense?")) return;

        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('expenses')
                .delete()
                .eq('id', editingExpenseId);

            if (error) throw error;

            setShowExpenseForm(false);
            fetchExpenses();
        } catch (err: any) {
            console.error("Error deleting expense:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const safeParseFloat = (val: string) => {
        const num = parseFloat(val);
        return isNaN(num) ? 0 : num;
    };

    const summaryData = useMemo(() => {
        const budgetMain = safeParseFloat(amount1);
        const budgetSub = safeParseFloat(amount2);

        let totalExpenseMain = 0;
        let totalExpenseSub = 0;

        expensesList.forEach(exp => {
            if (exp.currency === currency1) {
                totalExpenseMain += exp.amount;
                totalExpenseSub += (exchangeRate ? exp.amount * exchangeRate : 0);
            } else if (exp.currency === currency2) {
                totalExpenseSub += exp.amount;
                totalExpenseMain += (exchangeRate ? exp.amount / exchangeRate : 0);
            } else {
                totalExpenseMain += exp.amount;
            }
        });

        const balanceMain = budgetMain - totalExpenseMain;
        const balanceSub = budgetSub - totalExpenseSub;

        return {
            budgetMain, budgetSub,
            totalExpenseMain, totalExpenseSub,
            balanceMain, balanceSub
        };
    }, [amount1, amount2, expensesList, currency1, currency2, exchangeRate]);

    // ✅ ฟิลเตอร์สกุลเงินตามที่พิมพ์ค้นหา
    const filteredCurrencies = useMemo(() => {
        if (!currencySearch.trim()) return currencies;
        const query = currencySearch.toLowerCase();
        return currencies.filter(c => 
            c[0].toLowerCase().includes(query) || 
            c[1].toLowerCase().includes(query)
        );
    }, [currencies, currencySearch]);


    const customScrollbarStyle = `
        .custom-blue-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-blue-scrollbar::-webkit-scrollbar-track { background: #95C3EA; border-radius: 2px; }
        .custom-blue-scrollbar::-webkit-scrollbar-thumb { background: #FFFFFF; border-radius: 2px; height: 50px; }
        .custom-blue-scrollbar2::-webkit-scrollbar { width: 4px; }
        .custom-blue-scrollbar2::-webkit-scrollbar-track { background: #95C3EA; border-radius: 8px; }
        .custom-blue-scrollbar2::-webkit-scrollbar-thumb { background: #FFFFFF; border-radius: 8px; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `;

    if (loading) return <div className="w-full h-[600px] flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#3A82CE] animate-spin" /></div>;
    if (!trip) return <div className="w-full h-[600px] flex items-center justify-center text-gray-500">Trip not found</div>;

    const startDate = new Date(trip.start_date);
    const endDate = new Date(trip.end_date);
    const dayCount = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)) + 1;
    const dateRangeStr = `${startDate.getDate()}/${startDate.toLocaleDateString('en-GB', { month: 'short' })} - ${endDate.getDate()}/${endDate.toLocaleDateString('en-GB', { month: 'short' })}`;

    return (
        <div className="flex flex-col lg:flex-row w-full max-w-[1083px] mx-auto gap-[24px] h-[calc(100vh-100px)] lg:h-[900px] bg-transparent relative px-2 lg:px-0">
            <style>{customScrollbarStyle}</style>

            {/* --- LEFT COLUMN: Expense List --- */}
            <div className={`w-full lg:w-[433px] flex-shrink-0 flex-col gap-4 lg:gap-[24px] h-full overflow-hidden ${mobileViewMode === 'list' ? 'flex' : 'hidden lg:flex'}`}>

                <div className="flex items-center justify-between w-full shrink-0 mt-2 lg:mt-0">
                    <div className="flex items-center gap-[12px] min-w-0">
                        <button onClick={onBack} className="hover:bg-gray-100 rounded-full transition text-black shrink-0 p-1 -ml-1">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <h1 className="font-inter font-semibold text-[24px] lg:text-[32px] leading-tight lg:leading-[39px] text-[#000000] truncate">
                            {trip.name}
                        </h1>
                        <Pencil className="w-[18px] h-[18px] lg:w-[20px] lg:h-[20px] text-gray-500 cursor-pointer hover:text-[#3A82CE] shrink-0" />
                    </div>
                    <button 
                        onClick={() => setMobileViewMode('map')} 
                        className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-black rounded-lg text-sm text-black font-inter font-medium hover:bg-gray-50 transition-colors"
                    >
                        <MapIcon className="w-4 h-4" /> Map
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-[16px] lg:gap-[24px] pb-[40px] px-1 lg:px-0">

                    {/* Top Budget Card */}
                    <div className="w-full bg-[#FFFFFF] rounded-[16px] shadow-[4px_4px_4px_rgba(0,0,0,0.25)] flex flex-col px-[13px] py-[20px] gap-[20px] shrink-0">
                        <div className="flex flex-col sm:flex-row justify-between w-full px-1 lg:px-[10px] gap-4">
                            
                            <div className="flex flex-col gap-1 lg:gap-[10px] text-center sm:text-left">
                                <span className="font-inter font-normal text-[14px] leading-[17px] text-[#000000]">Expense List</span>
                                <span className="font-inter font-medium text-[16px] leading-[19px] text-[#000000]">{dayCount} Days</span>
                                <span className="font-inter font-normal text-[12px] leading-[15px] text-[#000000]">{formatDateRange(trip.start_date, trip.end_date)}</span>
                            </div>

                            <div className="flex flex-col gap-[12px] items-center sm:items-end">
                                {/* THB Input */}
                                <div className="relative h-[28px] lg:h-[24px] w-[200px] lg:w-[186.47px] flex items-center shadow-sm">
                                    <div className="flex-1 h-full bg-[#FFFFFF] border border-[#2666B0] border-r-0 rounded-l-[8px] flex items-center justify-center overflow-hidden">
                                        <input
                                            type="number"
                                            value={amount1}
                                            onChange={(e) => handleAmount1Change(e.target.value)}
                                            className="w-full text-center text-[12px] font-medium text-[#000000] outline-none bg-transparent h-full"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div
                                        ref={dropdown1Ref}
                                        onClick={() => {
                                            setIsDropdown1Open(!isDropdown1Open);
                                            setCurrencySearch(""); // ล้างคำค้นหาเมื่อเปิด
                                            setIsDropdown2Open(false);
                                            setIsExpenseDropdownOpen(false);
                                        }}
                                        className="w-[84.47px] h-full bg-[#3A82CE] border border-[#2666B0] rounded-r-[8px] flex items-center justify-center relative px-2 cursor-pointer hover:bg-[#3272b5] transition-colors"
                                    >
                                        <span className="text-[#FFFFFF] text-[12px] font-medium w-full text-center pr-3 select-none">{currency1}</span>
                                        <ChevronDown className="w-[10px] h-[10px] text-white absolute right-2" />

                                        {/* Dropdown 1 */}
                                        {isDropdown1Open && (
                                            <div className="absolute top-[30px] right-0 w-[180px] h-[217px] bg-[#3A82CE] border border-[#1E518C] rounded-[8.5px] z-50 overflow-hidden shadow-xl flex flex-col cursor-default" onClick={e => e.stopPropagation()}>
                                                {/* ✅ ช่องค้นหาสกุลเงิน */}
                                                <div className="p-2 border-b border-[#2666B0]">
                                                    <div className="flex items-center bg-white rounded px-2 py-1">
                                                        <Search className="w-3 h-3 text-gray-400 mr-1" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search..."
                                                            value={currencySearch}
                                                            onChange={(e) => setCurrencySearch(e.target.value)}
                                                            className="w-full text-xs outline-none text-black bg-transparent"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto custom-blue-scrollbar p-1">
                                                    {filteredCurrencies.length > 0 ? (
                                                        filteredCurrencies.map((c, index) => (
                                                            <div
                                                                key={c[0]}
                                                                onClick={() => { setCurrency1(c[0]); setIsDropdown1Open(false); }}
                                                                className="flex flex-col justify-center px-3 py-2 cursor-pointer hover:bg-[#60A3DE] rounded transition-colors group relative"
                                                            >
                                                                <span className="font-inter font-normal text-[18px] text-white leading-tight">{c[0]}</span>
                                                                <span className="font-inter font-normal text-[12px] text-white opacity-80 leading-tight truncate">{c[1]}</span>
                                                                {index !== filteredCurrencies.length - 1 && (
                                                                    <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-[#C2DCF3] opacity-50"></div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-white text-xs text-center mt-2 opacity-70">No results found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-center -my-[8px] z-10 relative pointer-events-auto">
                                    <div className="bg-white border border-[#2666B0] rounded-full p-[4px] lg:p-[2px] shadow-sm cursor-pointer hover:bg-gray-100 transition-colors" onClick={handleSwapCurrencies}>
                                        <ArrowRightLeft className="w-[12px] h-[12px] lg:w-[10px] lg:h-[10px] text-[#3A82CE]" />
                                    </div>
                                </div>

                                {/* USD Input */}
                                <div className="relative h-[28px] lg:h-[24px] w-[200px] lg:w-[186.47px] flex items-center shadow-sm">
                                    <div className="flex-1 h-full bg-[#FFFFFF] border border-[#2666B0] border-r-0 rounded-l-[8px] flex items-center justify-center overflow-hidden">
                                        <input
                                            type="number"
                                            value={amount2}
                                            onChange={(e) => handleAmount2Change(e.target.value)}
                                            className="w-full text-center text-[12px] font-medium text-[#000000] outline-none bg-transparent h-full"
                                            placeholder="0"
                                        />
                                    </div>
                                    <div
                                        ref={dropdown2Ref}
                                        onClick={() => {
                                            setIsDropdown2Open(!isDropdown2Open);
                                            setCurrencySearch(""); // ล้างคำค้นหาเมื่อเปิด
                                            setIsDropdown1Open(false);
                                            setIsExpenseDropdownOpen(false);
                                        }}
                                        className="w-[84.47px] h-full bg-[#3A82CE] border border-[#2666B0] rounded-r-[8px] flex items-center justify-center relative px-2 cursor-pointer hover:bg-[#3272b5] transition-colors"
                                    >
                                        <span className="text-[#FFFFFF] text-[12px] font-medium w-full text-center pr-3 select-none">{currency2}</span>
                                        <ChevronDown className="w-[10px] h-[10px] text-white absolute right-2" />

                                        {/* Dropdown 2 */}
                                        {isDropdown2Open && (
                                            <div className="absolute top-[30px] right-0 w-[180px] h-[217px] bg-[#3A82CE] border border-[#1E518C] rounded-[8.5px] z-50 overflow-hidden shadow-xl flex flex-col cursor-default" onClick={e => e.stopPropagation()}>
                                                {/* ✅ ช่องค้นหาสกุลเงิน */}
                                                <div className="p-2 border-b border-[#2666B0]">
                                                    <div className="flex items-center bg-white rounded px-2 py-1">
                                                        <Search className="w-3 h-3 text-gray-400 mr-1" />
                                                        <input
                                                            type="text"
                                                            placeholder="Search..."
                                                            value={currencySearch}
                                                            onChange={(e) => setCurrencySearch(e.target.value)}
                                                            className="w-full text-xs outline-none text-black bg-transparent"
                                                            autoFocus
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex-1 overflow-y-auto custom-blue-scrollbar p-1">
                                                    {filteredCurrencies.length > 0 ? (
                                                        filteredCurrencies.map((c, index) => (
                                                            <div
                                                                key={c[0]}
                                                                onClick={() => { setCurrency2(c[0]); setIsDropdown2Open(false); }}
                                                                className="flex flex-col justify-center px-3 py-2 cursor-pointer hover:bg-[#60A3DE] rounded transition-colors group relative"
                                                            >
                                                                <span className="font-inter font-normal text-[18px] text-white leading-tight">{c[0]}</span>
                                                                <span className="font-inter font-normal text-[12px] text-white opacity-80 leading-tight truncate">{c[1]}</span>
                                                                {index !== filteredCurrencies.length - 1 && (
                                                                    <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-[#C2DCF3] opacity-50"></div>
                                                                )}
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="text-white text-xs text-center mt-2 opacity-70">No results found</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            className="box-border flex flex-row justify-center items-center px-[16px] py-[8px] gap-[8px] w-[131px] h-[32px] lg:h-[29px] bg-[#3A82CE] border border-[#2666B0] rounded-[8px] hover:bg-[#2c6cb0] transition-colors shadow-sm mx-auto sm:ml-0"
                            onClick={handleAddExpenseClick}
                        >
                            <Plus className="w-[14px] h-[14px] lg:w-[12px] lg:h-[12px] text-[#FFFFFF] stroke-[3px]" />
                            <span className="font-inter font-normal text-[13px] lg:text-[12px] leading-[15px] text-[#FFFFFF]">Add Expense</span>
                        </button>
                    </div>

                    {/* Expense Items List */}
                    {expensesList.map((exp) => (
                        <div
                            key={exp.id}
                            onClick={() => handleEditExpense(exp)}
                            className="w-full bg-white rounded-[16px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-4 flex flex-row items-center gap-3 lg:gap-4 shrink-0 cursor-pointer hover:bg-gray-50 transition-colors border border-transparent hover:border-[#C2DCF3]"
                        >
                            <div className="w-[40px] h-[40px] lg:w-[45px] lg:h-[45px] bg-[#DEECF9] rounded-full flex items-center justify-center shrink-0">
                                {getCategoryIcon(exp.category)}
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-inter font-medium text-[12px] text-[#194473] truncate">{exp.title}</span>
                                    <div className="w-1 h-1 bg-[#194473] rounded-full shrink-0"></div>
                                    <span className="font-inter font-normal text-[10px] text-[#194473] shrink-0">
                                        {exp.expense_date ? new Date(exp.expense_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ""}
                                    </span>
                                </div>
                                <span className="font-inter font-medium text-[10px] text-black w-full line-clamp-2 leading-[14px]">
                                    {exp.note || exp.title}
                                </span>
                            </div>

                            <div className="shrink-0 text-right">
                                <span className="font-inter font-medium text-[12px] text-[#194473]">
                                    {exp.currency} {exp.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    ))}

                    {/* Expenses Summary Card */}
                    <div className="w-full bg-white rounded-[16px] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] p-[17px_25px] flex flex-col gap-[12px] shrink-0 mt-2">
                        <h3 className="font-inter font-medium text-[16px] leading-[19px] text-[#000000] mb-1 text-center sm:text-left">Expenses Summary</h3>
                        
                        <div className="flex flex-col gap-[12px] w-full">
                            <div className="grid grid-cols-[70px_1fr_1fr] gap-2 lg:gap-4 items-center w-full px-1 lg:px-[9px]">
                                <span className="font-inter font-normal text-[12px] text-[#000000]">Budget</span>
                                <span className="font-inter font-medium text-[11px] text-[#000000] text-right truncate">
                                    {currency2} {summaryData.budgetSub.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="font-inter font-medium text-[11px] text-[#000000] text-right truncate">
                                    {currency1} {summaryData.budgetMain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="grid grid-cols-[70px_1fr_1fr] gap-2 lg:gap-4 items-center w-full px-1 lg:px-[9px]">
                                <span className="font-inter font-normal text-[12px] text-[#000000]">Expenses</span>
                                <span className="font-inter font-medium text-[11px] text-[#000000] text-right truncate">
                                    {currency2} {summaryData.totalExpenseSub.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="font-inter font-medium text-[11px] text-[#000000] text-right truncate">
                                    {currency1} {summaryData.totalExpenseMain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>

                            <div className="grid grid-cols-[70px_1fr_1fr] gap-2 lg:gap-4 items-center w-full bg-[#F0F6FC] rounded-[6px] p-[10px_4px] lg:p-[10px_9px]">
                                <span className="font-inter font-bold text-[12px] text-[#000000]">Balance</span>
                                <span className="font-inter font-bold text-[11px] text-[#000000] text-right truncate">
                                    {currency2} {summaryData.balanceSub.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                                <span className="font-inter font-bold text-[11px] text-[#000000] text-right truncate">
                                    {currency1} {summaryData.balanceMain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* --- RIGHT COLUMN: Map --- */}
            <div className={`
                ${mobileViewMode === 'map' ? 'fixed inset-0 z-[500] flex bg-white w-full h-full opacity-100 visible' : 'absolute -z-50 opacity-0 invisible w-full h-full'}
                lg:flex lg:static lg:w-[459px] lg:bg-[#E5E5E5] lg:border lg:border-gray-200 lg:h-[calc(100vh-120px)] lg:rounded-[16px] lg:top-[20px] lg:opacity-100 lg:visible lg:z-auto flex-col shrink-0 overflow-hidden
            `}>
                
                <div className="w-full h-[52px] bg-white flex flex-row items-center justify-between px-[16px] border-b border-gray-200 flex-shrink-0 relative z-[1000]">
                    <button onClick={() => setMobileViewMode('list')} className="lg:hidden p-2 -ml-2 text-black hover:bg-gray-100 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="box-border flex flex-row items-center px-[8px] py-[4px] gap-[8px] bg-white border border-black rounded-[8px] cursor-default">
                        <Calendar className="w-[16px] h-[16px] text-black" />
                        <span className="font-inter font-normal text-[16px] leading-[19px] text-center text-black">
                            {dateRangeStr}
                        </span>
                    </div>
                </div>

                <div className="flex-1 relative w-full h-full z-0">
                    <ItineraryMap locations={mapLocations} />
                </div>
            </div>

            {/* ========================================================= */}
            {/* ✅ ADD / EDIT EXPENSE MODAL OVERLAY */}
            {/* ========================================================= */}
            {showExpenseForm && (
                <>
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-[#616161] opacity-50" onClick={() => !isSaving && setShowExpenseForm(false)}></div>

                        <div className="relative flex flex-col p-[16px_14px] w-full max-w-[397px] bg-[#DEECF9] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[16px] animate-in zoom-in-95 duration-200"
                            style={{ height: expenseStep === 0 ? '378.17px' : 'auto', minHeight: '355.83px' }}>

                            <div className="flex items-center w-full mb-[16px] shrink-0">
                                {expenseStep === 1 && !isSaving && (
                                    <button onClick={() => setExpenseStep(0)} className="mr-2 p-1 hover:bg-[#C2DCF3] rounded-full transition-colors">
                                        <ArrowLeft className="w-4 h-4 text-black" />
                                    </button>
                                )}
                                <h2 className="flex-1 font-inter font-medium text-[14px] leading-[15px] text-[#000000] text-center ml-4">
                                    {editingExpenseId ? "Edit Expense" : "Add Expense"}
                                </h2>

                                {editingExpenseId && (
                                    <button
                                        onClick={handleDeleteExpense}
                                        disabled={isSaving}
                                        className="p-1 hover:bg-red-100 rounded-full transition-colors text-red-500 disabled:opacity-50 absolute right-[14px]"
                                        title="Delete Expense"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>

                            {/* STEP 0: Select Category */}
                            {expenseStep === 0 && (
                                <div className="flex-1 flex flex-col w-full min-h-0">
                                    <h3 className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] mb-[16px] shrink-0 text-center">Select Category</h3>

                                    <div className="relative w-full flex-1 overflow-y-auto custom-blue-scrollbar2 pr-1 pb-2">
                                        <div className="grid grid-cols-4 gap-2 sm:gap-[16px] w-full px-1">
                                            {EXPENSE_CATEGORIES.map((cat) => (
                                                <div
                                                    key={cat.id}
                                                    onClick={() => {
                                                        setSelectedCategory(cat.id);
                                                        if (cat.id !== "others") {
                                                            setCustomCategoryName("");
                                                        }
                                                        setExpenseStep(1);
                                                    }}
                                                    className={`w-full aspect-square sm:h-[65px] bg-[#FFFFFF] border rounded-[8px] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all shadow-sm hover:shadow-md ${selectedCategory === cat.id ? 'border-[#3A82CE] ring-2 ring-[#3A82CE]' : 'hover:border-[#60A3DE]'}`}
                                                >
                                                    <div className="flex items-center justify-center w-6 h-6">
                                                        {cat.icon}
                                                    </div>
                                                    <span className="font-inter font-medium text-[10px] leading-tight text-center text-[#194473] px-1">
                                                        {cat.label}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 1: Fill Detail Form */}
                            {expenseStep === 1 && (
                                <div className="w-full flex-1 flex flex-col justify-between pt-2 gap-[16px]">

                                    <div className="w-full flex flex-col items-center">
                                        {selectedCategory === "others" && (
                                            <div className="w-full sm:w-[356px] mb-[16px]">
                                                <h3 className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] mb-[4px]">Category Name</h3>
                                                <input
                                                    type="text"
                                                    value={customCategoryName}
                                                    onChange={(e) => setCustomCategoryName(e.target.value)}
                                                    className={`w-full h-[30px] sm:h-[25px] bg-[#F0F6FC] border ${!customCategoryName.trim() ? 'border-red-500' : 'border-[#2666B0]'} rounded-[4px] px-3 outline-none text-[12px] text-black`}
                                                    placeholder="Enter category name..."
                                                />
                                            </div>
                                        )}

                                        <div className="w-full sm:w-[356px] mb-[16px]">
                                            <h3 className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] mb-[4px]">Amount</h3>
                                            <div className="flex flex-row h-[30px] sm:h-[25px] w-full">
                                                <div
                                                    ref={expenseDropdownRef}
                                                    onClick={() => {
                                                        setIsExpenseDropdownOpen(!isExpenseDropdownOpen);
                                                        setCurrencySearch(""); // ล้างคำค้นหาเมื่อเปิด
                                                        setIsDropdown1Open(false);
                                                        setIsDropdown2Open(false);
                                                    }}
                                                    className="w-[70px] sm:w-[63px] h-full bg-[#3A82CE] border border-[#2666B0] rounded-l-[4px] flex items-center justify-center relative cursor-pointer hover:bg-[#3272b5] transition-colors"
                                                >
                                                    <span className="text-[#FFFFFF] text-[11px] sm:text-[10px] font-medium w-full text-center pr-2 select-none">
                                                        {expenseCurrency}
                                                    </span>
                                                    <ChevronDown className="w-[10px] sm:w-[8px] h-[10px] sm:h-[8px] text-white absolute right-1.5" />

                                                    {/* Dropdown in Modal */}
                                                    {isExpenseDropdownOpen && (
                                                        <div className="absolute top-[32px] left-0 w-[180px] h-[217px] bg-[#3A82CE] border border-[#1E518C] rounded-[8.5px] z-[100] overflow-hidden shadow-xl flex flex-col cursor-default" onClick={e => e.stopPropagation()}>
                                                            {/* ✅ ช่องค้นหาสกุลเงิน */}
                                                            <div className="p-2 border-b border-[#2666B0]">
                                                                <div className="flex items-center bg-white rounded px-2 py-1">
                                                                    <Search className="w-3 h-3 text-gray-400 mr-1" />
                                                                    <input
                                                                        type="text"
                                                                        placeholder="Search..."
                                                                        value={currencySearch}
                                                                        onChange={(e) => setCurrencySearch(e.target.value)}
                                                                        className="w-full text-xs outline-none text-black bg-transparent"
                                                                        autoFocus
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex-1 overflow-y-auto custom-blue-scrollbar p-1">
                                                                {filteredCurrencies.length > 0 ? (
                                                                    filteredCurrencies.map((c, index) => (
                                                                        <div
                                                                            key={c[0]}
                                                                            onClick={() => { setExpenseCurrency(c[0]); setIsExpenseDropdownOpen(false); }}
                                                                            className="flex flex-col justify-center px-3 py-2 cursor-pointer hover:bg-[#60A3DE] rounded transition-colors group relative"
                                                                        >
                                                                            <span className="font-inter font-normal text-[18px] text-white leading-tight">{c[0]}</span>
                                                                            <span className="font-inter font-normal text-[12px] text-white opacity-80 leading-tight truncate">{c[1]}</span>
                                                                            {index !== filteredCurrencies.length - 1 && (
                                                                                <div className="absolute bottom-0 left-2 right-2 h-[1px] bg-[#C2DCF3] opacity-50"></div>
                                                                            )}
                                                                        </div>
                                                                    ))
                                                                ) : (
                                                                    <div className="text-white text-xs text-center mt-2 opacity-70">No results found</div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <input
                                                    type="number"
                                                    value={expenseAmount}
                                                    onChange={(e) => setExpenseAmount(e.target.value)}
                                                    className={`flex-1 bg-[#F0F6FC] border border-l-0 ${!expenseAmount ? 'border-red-500' : 'border-[#2666B0]'} rounded-r-[4px] px-3 outline-none text-[12px] text-black h-full`}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>

                                        <div className="w-full sm:w-[356px] mb-[16px]">
                                            <h3 className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] mb-[4px]">Description (Optional)</h3>
                                            <textarea
                                                value={expenseDesc}
                                                onChange={(e) => setExpenseDesc(e.target.value)}
                                                className="w-full h-[75px] bg-[#F0F6FC] border border-[#2666B0] rounded-[4px] p-2 outline-none text-[12px] text-black resize-none"
                                                placeholder="Add notes..."
                                            />
                                        </div>

                                        <div className="w-full sm:w-[356px] mb-[20px] relative">
                                            <h3 className="font-inter font-normal text-[12px] leading-[15px] text-[#000000] mb-[4px]">Date (Optional)</h3>
                                            <div
                                                id="date-input-box"
                                                className="w-full h-[30px] sm:h-[25px] bg-[#F0F6FC] border border-[#2666B0] rounded-[4px] flex items-center px-3 cursor-pointer"
                                                onClick={() => setIsDatePickerOpen(!isDatePickerOpen)}
                                            >
                                                <span className="flex-1 text-[12px] text-black">
                                                    {expenseDate ? new Date(expenseDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "Select a date"}
                                                </span>
                                                <Calendar className="w-[14px] h-[14px] text-gray-500" />
                                            </div>
                                            
                                            {isDatePickerOpen && (
                                                <div className="fixed sm:absolute inset-0 sm:inset-auto sm:top-[40px] sm:left-0 z-[10000] flex items-center justify-center sm:block bg-black/40 sm:bg-transparent">
                                                    <SingleDatePicker
                                                        selectedDate={expenseDate}
                                                        onChange={(date) => {
                                                            setExpenseDate(date);
                                                            setIsDatePickerOpen(false);
                                                        }}
                                                        onClose={() => setIsDatePickerOpen(false)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row justify-center items-center gap-[24px] w-full mt-auto pb-2">
                                        <button
                                            onClick={() => {
                                                setExpenseAmount("");
                                                setExpenseDesc("");
                                                setCustomCategoryName("");
                                            }}
                                            disabled={isSaving}
                                            className="box-border flex flex-row justify-center items-center w-[80px] h-[30px] bg-[#C2DCF3] shadow-sm rounded-[8px] hover:bg-[#a9cbed] transition-colors disabled:opacity-50 text-[14px] font-medium"
                                        >
                                            Clear
                                        </button>

                                        <button
                                            onClick={handleSaveExpense}
                                            disabled={isSaving || !expenseAmount || (selectedCategory === "others" && !customCategoryName.trim())}
                                            className="box-border flex flex-row justify-center items-center w-[80px] h-[30px] bg-[#60A3DE] shadow-sm rounded-[8px] hover:bg-[#4b94d6] transition-colors disabled:opacity-50 text-[14px] font-medium text-white"
                                        >
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

        </div>
    );
}