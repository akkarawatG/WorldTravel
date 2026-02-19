"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
    Loader2, Wallet, ArrowLeft, Calendar, 
    ChevronRight, ChevronDown, Plus, Trash2, 
    Utensils, Car, Bed, ShoppingBag, Ticket, Tag, DollarSign, FileText
} from "lucide-react";
import Image from "next/image"; 
// ✅ 1. Import ข้อมูลรูปภาพเข้ามา
import { COUNTRIES_DATA } from "@/data/mockData";

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
    currency?: string;
    category: string;
    expense_date: string; 
    note?: string;
}

// --- Helper Functions ---
const formatMoney = (amount: number) => new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount);

const getCategoryDetails = (category: string) => {
    switch (category.toLowerCase()) {
        case 'food': return { icon: <Utensils className="w-4 h-4" />, color: "text-orange-500", bg: "bg-orange-100" };
        case 'transport': return { icon: <Car className="w-4 h-4" />, color: "text-blue-500", bg: "bg-blue-100" };
        case 'accommodation': return { icon: <Bed className="w-4 h-4" />, color: "text-purple-500", bg: "bg-purple-100" };
        case 'shopping': return { icon: <ShoppingBag className="w-4 h-4" />, color: "text-pink-500", bg: "bg-pink-100" };
        case 'activity': return { icon: <Ticket className="w-4 h-4" />, color: "text-green-500", bg: "bg-green-100" };
        default: return { icon: <Tag className="w-4 h-4" />, color: "text-gray-500", bg: "bg-gray-100" };
    }
};

// ✅ 2. ฟังก์ชันหา URL รูปภาพ (Logic เดียวกับ ItineraryCard)
const getTripImage = (name: string) => {
    const lowerName = name.toLowerCase();
    const allCountries: { name: string; image: string }[] = [];
    // รวมข้อมูลประเทศทั้งหมดเป็น array เดียว
    Object.values(COUNTRIES_DATA).forEach((list: any) => allCountries.push(...list));
    
    // หาจากชื่อ
    const foundCountry = allCountries.find(c => lowerName.includes(c.name.toLowerCase()));
    if (foundCountry) return foundCountry.image;
    
    // ถ้าไม่เจอ ให้สุ่มตาม Hash ของชื่อ (เพื่อให้ได้รูปเดิมเสมอสำหรับชื่อเดิม)
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    const index = Math.abs(hash) % allCountries.length;
    
    return allCountries[index]?.image || "https://placehold.co/600x400?text=No+Image";
};

// =========================================================
// 🟢 MAIN COMPONENT: BudgetView (Switcher)
// =========================================================
export default function BudgetView() {
    const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

    return (
        <div className="w-full h-full bg-white relative">
            {selectedTripId ? (
                // 🔵 SHOW DETAIL (Budget Detail View)
                <BudgetDetailView tripId={selectedTripId} onBack={() => setSelectedTripId(null)} />
            ) : (
                // 🟡 SHOW LIST (Plan Selection Cards)
                <BudgetPlanSelection onSelect={setSelectedTripId} />
            )}
        </div>
    );
}

// =========================================================
// 🟡 SUB-COMPONENT: Plan Selection (Card Grid like MyPlan)
// =========================================================
function BudgetPlanSelection({ onSelect }: { onSelect: (id: string) => void }) {
    const supabase = createClient();
    const [trips, setTrips] = useState<Itinerary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrips = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data } = await supabase
                    .from('itineraries')
                    .select('*')
                    .eq('profile_id', user.id)
                    .order('created_at', { ascending: false });
                if (data) setTrips(data);
            }
            setLoading(false);
        };
        fetchTrips();
    }, []);

    if (loading) return <div className="flex h-full items-center justify-center"><Loader2 className="animate-spin text-[#3A82CE]" /></div>;

    return (
        <div className="p-8 w-full max-w-[1440px] mx-auto">
            <h1 className="text-[32px] font-bold mb-8 font-inter text-[#212121]">Select Plan to Manage Budget</h1>
            
            {trips.length === 0 ? (
                 <div className="w-full h-[300px] border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 gap-4">
                    <span>You don't have any plans yet.</span>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
                    {trips.map(trip => {
                        // ✅ เรียกใช้ฟังก์ชันดึงรูปภาพ
                        const imageUrl = getTripImage(trip.name);

                        return (
                            <div 
                                key={trip.id} 
                                className="flex flex-col border border-[#E0E0E0] rounded-[16px] overflow-hidden hover:shadow-lg transition-all duration-200 bg-white group cursor-pointer"
                                onClick={() => onSelect(trip.id)}
                            >
                                {/* ✅ 3. Image Section (แสดงรูปภาพจริง) */}
                                <div className="h-[200px] w-full bg-gray-200 relative overflow-hidden">
                                    <Image 
                                        src={imageUrl} 
                                        alt={trip.name} 
                                        fill 
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                        unoptimized // ใช้ unoptimized ถ้า URL มาจากภายนอกหลายที่
                                    />
                                </div>

                                {/* Content Section */}
                                <div className="p-4 flex flex-col gap-3">
                                    <div>
                                        <h3 className="text-[20px] font-bold text-[#212121] group-hover:text-[#3A82CE] transition-colors truncate">
                                            {trip.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-[#757575] mt-1 text-[14px]">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {trip.start_date ? new Date(trip.start_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short'}) : 'TBD'} 
                                                {' - '}
                                                {trip.end_date ? new Date(trip.end_date).toLocaleDateString('en-GB', {day: 'numeric', month: 'short', year: 'numeric'}) : 'TBD'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-gray-100 mt-auto">
                                        <button className="w-full h-[40px] bg-[#3A82CE] hover:bg-[#2c6cb0] text-white rounded-[8px] flex items-center justify-center gap-2 font-medium text-[14px] transition-colors">
                                            <Wallet className="w-4 h-4" />
                                            Manage Budget
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// =========================================================
// 🔵 SUB-COMPONENT: Budget Detail (Timeline & Summary)
// =========================================================
// ... (ส่วน BudgetDetailView ด้านล่างนี้ ใช้ Code เดิมได้เลยครับ ไม่มีการเปลี่ยนแปลง)
function BudgetDetailView({ tripId, onBack }: { tripId: string, onBack: () => void }) {
    const supabase = createClient();
    const [trip, setTrip] = useState<Itinerary | null>(null);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedDay, setExpandedDay] = useState<string | null>(null);
    
    // Add Expense State
    const [isAdding, setIsAdding] = useState<{ date: string } | null>(null);
    const [formTitle, setFormTitle] = useState("");
    const [formAmount, setFormAmount] = useState("");
    const [formCategory, setFormCategory] = useState("Food");
    const [formNote, setFormNote] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: tripData } = await supabase.from('itineraries').select('*').eq('id', tripId).single();
            setTrip(tripData);
            const { data: expenseData } = await supabase.from('expenses').select('*').eq('itinerary_id', tripId).order('created_at', { ascending: true });
            setExpenses(expenseData || []);
            setLoading(false);
            if (tripData?.start_date) setExpandedDay(tripData.start_date);
        };
        fetchData();
    }, [tripId]);

    const daysArray = useMemo(() => {
        if (!trip?.start_date || !trip?.end_date) return [];
        const start = new Date(trip.start_date);
        const end = new Date(trip.end_date);
        const days = [];
        const current = new Date(start);
        while (current <= end) {
            days.push(current.toISOString().split('T')[0]);
            current.setDate(current.getDate() + 1);
        }
        return days;
    }, [trip]);

    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const categorySummary = useMemo(() => {
        const summary: Record<string, number> = {};
        expenses.forEach(e => { summary[e.category] = (summary[e.category] || 0) + e.amount; });
        return summary;
    }, [expenses]);

    const handleAddExpense = async () => {
        if (!isAdding || !formTitle || !formAmount) return;
        try {
            const { data, error } = await supabase.from('expenses').insert({
                itinerary_id: tripId,
                title: formTitle,
                amount: parseFloat(formAmount),
                currency: 'THB',
                category: formCategory,
                expense_date: isAdding.date,
                note: formNote
            }).select().single();

            if (error) throw error;
            setExpenses([...expenses, data]);
            setIsAdding(null); setFormTitle(""); setFormAmount(""); setFormNote("");
        } catch (err) { console.error("Error:", err); alert("Failed to add expense"); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete expense?")) return;
        await supabase.from('expenses').delete().eq('id', id);
        setExpenses(expenses.filter(e => e.id !== id));
    };

    if (loading) return <div className="w-full h-full flex items-center justify-center"><Loader2 className="animate-spin text-[#3A82CE]" /></div>;
    if (!trip) return <div>Trip not found</div>;

    return (
        <div className="flex flex-col w-full h-full relative">
            {/* Header */}
            <div className="flex items-center px-6 py-4 border-b bg-white sticky top-0 z-10 gap-4">
                <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex-1">
                    <h1 className="text-[24px] font-bold text-[#212121]">{trip.name} <span className="text-gray-400 font-normal text-lg">| Budget</span></h1>
                    <p className="text-sm text-gray-500">{new Date(trip.start_date).toLocaleDateString()} - {new Date(trip.end_date).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Total Spent</span>
                    <span className="text-[24px] font-bold text-[#3A82CE]">{formatMoney(totalSpent)}</span>
                </div>
            </div>

            <div className="flex flex-row h-full overflow-hidden">
                {/* --- LEFT: Timeline --- */}
                <div className="w-[500px] overflow-y-auto p-6 pb-20 border-r scrollbar-thin">
                    {daysArray.map((dateStr, index) => {
                        const dayExpenses = expenses.filter(e => e.expense_date === dateStr);
                        const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                        const isExpanded = expandedDay === dateStr;
                        const dateObj = new Date(dateStr);

                        return (
                            <div key={dateStr} className="mb-4">
                                <div onClick={() => setExpandedDay(isExpanded ? null : dateStr)} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition border border-transparent hover:border-gray-200">
                                    <div className={`w-8 h-8 flex items-center justify-center rounded-full ${isExpanded ? 'bg-[#3A82CE] text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        <span className="text-sm font-bold">{index + 1}</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{dateObj.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                                    </div>
                                    {dayTotal > 0 && <span className="text-sm font-bold text-gray-600">{formatMoney(dayTotal)}</span>}
                                    <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>

                                {isExpanded && (
                                    <div className="ml-4 pl-4 border-l-2 border-gray-100 mt-2 flex flex-col gap-2">
                                        {!isAdding && (
                                            <button onClick={() => setIsAdding({ date: dateStr })} className="w-full py-2 text-sm text-gray-500 border border-dashed border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition flex items-center justify-center gap-2">
                                                <Plus className="w-4 h-4" /> Add Expense
                                            </button>
                                        )}
                                        {isAdding?.date === dateStr && (
                                            <div className="bg-white border border-[#3A82CE] rounded-lg p-3 shadow-md animate-in fade-in zoom-in-95">
                                                <div className="flex flex-col gap-2">
                                                    <input autoFocus placeholder="Title (e.g. Lunch)" className="w-full text-sm font-semibold border-b pb-1 outline-none" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                                                    <div className="flex gap-2">
                                                        <div className="relative flex-1"><span className="absolute left-0 top-1.5 text-gray-400 text-xs">฿</span><input type="number" placeholder="0.00" className="w-full pl-4 text-sm border-b pb-1 outline-none" value={formAmount} onChange={e => setFormAmount(e.target.value)} /></div>
                                                        <select className="text-xs bg-gray-50 rounded px-2 py-1 outline-none border" value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                                                            <option value="Food">Food</option><option value="Transport">Transport</option><option value="Accommodation">Hotel</option><option value="Shopping">Shopping</option><option value="Activity">Activity</option><option value="Other">Other</option>
                                                        </select>
                                                    </div>
                                                    <input placeholder="Note (optional)" className="w-full text-xs text-gray-500 border-b pb-1 outline-none" value={formNote} onChange={e => setFormNote(e.target.value)} />
                                                    <div className="flex gap-2 justify-end mt-1"><button onClick={() => setIsAdding(null)} className="text-xs text-gray-500 px-3 py-1 hover:bg-gray-100 rounded">Cancel</button><button onClick={handleAddExpense} className="text-xs bg-[#3A82CE] text-white px-3 py-1 rounded shadow-sm hover:bg-[#2c6cb0]">Save</button></div>
                                                </div>
                                            </div>
                                        )}
                                        {dayExpenses.map(item => {
                                            const { icon, color, bg } = getCategoryDetails(item.category);
                                            return (
                                                <div key={item.id} className="group flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 hover:shadow-sm hover:border-gray-300 transition">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${bg} ${color}`}>{icon}</div>
                                                        <div><p className="font-medium text-sm text-gray-800">{item.title}</p>{item.note && <p className="text-[10px] text-gray-400 flex items-center gap-1"><FileText className="w-3 h-3"/> {item.note}</p>}</div>
                                                    </div>
                                                    <div className="flex items-center gap-3"><span className="font-bold text-sm text-gray-700">{formatMoney(item.amount)}</span><button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition"><Trash2 className="w-4 h-4" /></button></div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* --- RIGHT: Summary Dashboard --- */}
                <div className="flex-1 bg-gray-50 p-8 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-200">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-[#212121]">
                            <DollarSign className="w-5 h-5 text-gray-500" /> Expense Breakdown
                        </h2>
                        {Object.keys(categorySummary).length === 0 ? <div className="text-center text-gray-400 py-10">No expenses recorded yet.</div> : (
                            <div className="space-y-6">
                                {Object.entries(categorySummary).map(([cat, amount]) => {
                                    const { icon, color, bg } = getCategoryDetails(cat);
                                    const percentage = (amount / totalSpent) * 100;
                                    return (
                                        <div key={cat} className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${bg} ${color}`}>{icon}</div>
                                            <div className="flex-1">
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-semibold text-gray-700">{cat}</span>
                                                    <div className="text-right"><span className="text-sm font-bold text-gray-900 block">{formatMoney(amount)}</span><span className="text-[10px] text-gray-400">{percentage.toFixed(1)}%</span></div>
                                                </div>
                                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden relative">
                                                    <div className="h-full rounded-full absolute top-0 left-0" style={{ width: `${percentage}%`, backgroundColor: color.includes('orange') ? '#F97316' : color.includes('blue') ? '#3B82F6' : color.includes('purple') ? '#A855F7' : color.includes('pink') ? '#EC4899' : color.includes('green') ? '#22C55E' : '#6B7280' }} />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}