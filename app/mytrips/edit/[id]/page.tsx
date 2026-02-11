"use client";

import { useState, use, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
    ArrowLeft,
    LayoutTemplate,
    X,
    MapPin,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Search,
    Trash2,
    Plus,
    Minus,
    RefreshCw,
    Layers,
    StickyNote,
    Loader2,
    Check,
    Image as ImageIcon,
    MoreVertical,
    Edit3,
    Maximize2,
    Minimize2,
    GripVertical,
    Calendar,
    Eye,
    EyeOff,
    Star
} from "lucide-react";
import dynamic from 'next/dynamic';

// --- Constants & Types ---

const COUNTRY_NAMES: Record<string, string> = {
    cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
    fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
    us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
    ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
    za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
    au: "Australia", nz: "New Zealand"
};

const DynamicMap = dynamic(
    () => import('../../../../components/DynamicMap'), // ตรวจสอบ Path นี้ให้ถูกต้องตามโปรเจคของคุณ
    { ssr: false, loading: () => <div className="p-10 text-gray-400 flex items-center justify-center h-full">Loading Map...</div> }
);

interface PageProps { params: Promise<{ id: string }>; }
interface TripStatus { id: string; label: string; color: string; }
interface RegionData { name: string; statusId: string; }

interface TripGroup {
    id: string;
    name: string;
    regions: RegionData[];
    notes?: string;
    images?: string[] | null;
    travel_start_date?: string | null;
    travel_end_date?: string | null;
    rating?: number;
}

interface ImageState {
    id: string;
    url: string;
    file?: File;
}

interface RegionItemProps {
    region: RegionData;
    statuses: TripStatus[];
    onUpdateStatus: (newId: string) => void;
    onRemove: () => void;
    statusActions: {
        onUpdate: (id: string, key: keyof TripStatus, value: string) => void;
        onDelete: (id: string) => void;
        onAdd: () => void;
    };
}

const DEFAULT_STATUSES: TripStatus[] = [
    { id: 'visited', label: 'Visited', color: '#4CAF50' },
    { id: 'planned', label: 'Plan to go', color: '#2196F3' },
    { id: 'passed', label: 'Passed', color: '#FF9800' },
    { id: 'dream', label: 'Dream', color: '#9C27B0' },
];

// --- Main Component ---

export default function EditTripPage({ params }: PageProps) {
    const router = useRouter();
    const supabase = createClient();
    const { id: tripId } = use(params);

    const [isFullscreen, setIsFullscreen] = useState(true);

    // RESIZE LOGIC STATE
    const [sidebarWidth, setSidebarWidth] = useState(483);
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Data States
    const [countryCode, setCountryCode] = useState<string>("");
    const countryName = COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();

    const [regionList, setRegionList] = useState<string[]>([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dbTripId, setDbTripId] = useState<string | null>(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false); // เพิ่ม State เช็คโหลดเสร็จ

    const [tripGroups, setTripGroups] = useState<TripGroup[]>([]);
    const [tripStatuses, setTripStatuses] = useState<TripStatus[]>(DEFAULT_STATUSES);

    // UI States
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [previewGroupId, setPreviewGroupId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isViewAll, setIsViewAll] = useState(false);

    // Map Control State
    const [mapPosition, setMapPosition] = useState({ coordinates: [400, 300] as [number, number], zoom: 1 });

    // Form States
    const [currentGroupRegions, setCurrentGroupRegions] = useState<RegionData[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupNote, setGroupNote] = useState("");
    const [currentImages, setCurrentImages] = useState<ImageState[]>([]);
    const [tripRating, setTripRating] = useState<number>(0);

    // Date States
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    const [regionSearchQuery, setRegionSearchQuery] = useState("");

    const activeGroup = useMemo(() => tripGroups.find(g => g.id === activeGroupId), [tripGroups, activeGroupId]);

    // --- INIT DATA (Fixed Rating & Color Sync) ---
    useEffect(() => {
        const initData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                
                setDbTripId(tripId);
                const { data: trip, error: tripError } = await supabase.from('trips').select('country').eq('id', tripId).single();
                if (tripError || !trip) { router.push('/mytrips'); return; }
                setCountryCode(trip.country);

                // ✅ FIX 1: เพิ่ม rating ลงใน select query
                const { data: templates, error: tempError } = await supabase
                    .from('templates')
                    .select(`id, template_name, notes, images, travel_start_date, travel_end_date, rating, template_provinces ( province_code, status, color )`)
                    .eq('trip_id', tripId)
                    .is('deleted_at', null)
                    .order('created_at', { ascending: true });

                if (tempError) throw tempError;

                if (templates) {
                    // ✅ FIX 2: Color Sync Logic
                    const dbStatuses = new Map<string, string>();
                    templates.forEach((t: any) => {
                        t.template_provinces.forEach((p: any) => {
                            if (p.status && p.color) {
                                dbStatuses.set(p.status, p.color);
                            }
                        });
                    });

                    // Deep Copy เพื่อกัน Reference ผิด
                    let syncedStatuses = JSON.parse(JSON.stringify(DEFAULT_STATUSES));
                    
                    dbStatuses.forEach((color, label) => {
                        const existingIdx = syncedStatuses.findIndex((s: TripStatus) => s.label === label);
                        if (existingIdx !== -1) {
                            syncedStatuses[existingIdx].color = color;
                        } else {
                            syncedStatuses.push({
                                id: `db-${label}-${Date.now()}`,
                                label: label,
                                color: color
                            });
                        }
                    });
                    
                    setTripStatuses(syncedStatuses);

                    const mappedGroups: TripGroup[] = templates.map((t: any) => {
                        const mappedRegions = t.template_provinces.map((p: any) => {
                            let matchedStatus = syncedStatuses.find((s: TripStatus) => s.label === p.status && s.color === p.color);
                            if (!matchedStatus) matchedStatus = syncedStatuses.find((s: TripStatus) => s.label === p.status);
                            if (!matchedStatus) matchedStatus = syncedStatuses[0];
                            
                            return { name: p.province_code, statusId: matchedStatus.id };
                        });

                        let imgs: string[] = [];
                        if (Array.isArray(t.images)) { imgs = t.images; } else if (typeof t.images === 'string') { try { imgs = JSON.parse(t.images); } catch { imgs = [t.images]; } }

                        return {
                            id: t.id,
                            name: t.template_name || "Untitled",
                            notes: t.notes || "",
                            images: imgs,
                            regions: mappedRegions,
                            travel_start_date: t.travel_start_date,
                            travel_end_date: t.travel_end_date,
                            rating: t.rating || 0 // รับค่า rating มาใช้
                        };
                    });

                    setTripGroups(mappedGroups);
                    
                    if(mappedGroups.length > 0) {
                        setIsViewAll(true);
                    }
                }
            } catch (err) { console.error("Error init:", err); } finally {
                setIsDataLoaded(true);
            }
        };
        initData();
    }, [tripId]); // เอา router ออกจาก dependency

    // --- Active Group Effect ---
    useEffect(() => {
        if (activeGroup) {
            setCurrentGroupRegions(activeGroup.regions);
            setGroupName(activeGroup.name);
            setGroupNote(activeGroup.notes || "");
            setStartDate(activeGroup.travel_start_date || "");
            setEndDate(activeGroup.travel_end_date || "");
            setTripRating(activeGroup.rating || 0); // ✅ Set Rating เมื่อกด Edit
            const loadedImages = (activeGroup.images || []).map((url, idx) => ({ id: `existing-${idx}`, url: url }));
            setCurrentImages(loadedImages);
            setPreviewGroupId(null);
            setIsViewAll(false);
        } else {
            setCurrentGroupRegions([]); setGroupName(""); setGroupNote(""); setCurrentImages([]); setStartDate(""); setEndDate("");
            setTripRating(0);
        }
    }, [activeGroupId, activeGroup]);

    useEffect(() => {
        const handleClickOutside = () => { setOpenMenuId(null); setIsRegionDropdownOpen(false); };
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (files) { const newFiles = Array.from(files); if (currentImages.length + newFiles.length > 10) { alert("Maximum 10 images allowed."); return; } const newImageStates: ImageState[] = newFiles.map(file => ({ id: `new-${Date.now()}-${Math.random()}`, url: URL.createObjectURL(file), file: file })); setCurrentImages(prev => [...prev, ...newImageStates]); } if (fileInputRef.current) fileInputRef.current.value = ""; };
    const handleRemoveImage = (idToRemove: string) => { setCurrentImages(prev => prev.filter(img => img.id !== idToRemove)); };
    const handleAddGroup = () => { const newId = `temp-${Date.now()}`; const newGroup: TripGroup = { id: newId, name: `Trip ${tripGroups.length + 1}`, regions: [], notes: "", images: [], travel_start_date: null, travel_end_date: null, rating: 0 }; setTripGroups([...tripGroups, newGroup]); setActiveGroupId(newId); };
    const toggleRegion = (regionName: string) => { if (!activeGroupId) return; setCurrentGroupRegions(prev => { const exists = prev.find(r => r.name === regionName); if (exists) return prev.filter(r => r.name !== regionName); return [...prev, { name: regionName, statusId: tripStatuses[0].id }]; }); };
    const updateRegionStatus = (regionName: string, newStatusId: string) => { setCurrentGroupRegions(prev => prev.map(r => r.name === regionName ? { ...r, statusId: newStatusId } : r)); };

    const handleApply = async () => {
        if (!activeGroupId || !dbTripId) return;
        setIsSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");
            const isNew = activeGroupId.startsWith('temp-');
            const finalImageUrls: string[] = [];
            for (const img of currentImages) {
                if (img.file) {
                    const cleanName = img.file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                    const fileName = `${user.id}/${Date.now()}_${cleanName}`;
                    const { error: uploadError } = await supabase.storage.from('templates').upload(fileName, img.file);
                    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
                    const { data: publicUrlData } = supabase.storage.from('templates').getPublicUrl(fileName);
                    finalImageUrls.push(publicUrlData.publicUrl);
                } else { finalImageUrls.push(img.url); }
            }

            const templatePayload = {
                trip_id: dbTripId,
                template_name: groupName,
                notes: groupNote,
                images: finalImageUrls,
                travel_start_date: startDate || null,
                travel_end_date: endDate || null,
                rating: tripRating,
                ...(isNew ? {} : { id: activeGroupId })
            };

            const { data: savedTemplate, error: tmplError } = await supabase.from('templates').upsert(templatePayload).select().single();
            if (tmplError) throw tmplError;
            const realTemplateId = savedTemplate.id;
            await supabase.from('template_provinces').delete().eq('template_id', realTemplateId);

            if (currentGroupRegions.length > 0) {
                const provincesPayload = currentGroupRegions.map(r => {
                    const statusObj = tripStatuses.find(s => s.id === r.statusId) || DEFAULT_STATUSES[0];
                    return {
                        template_id: realTemplateId,
                        province_code: r.name,
                        status: statusObj.label,
                        color: statusObj.color
                    };
                });
                const { error: provError } = await supabase.from('template_provinces').insert(provincesPayload);
                if (provError) throw provError;
            }

            setTripGroups(prev => prev.map(g => g.id === activeGroupId ? {
                ...g, id: realTemplateId, regions: currentGroupRegions, name: groupName, notes: groupNote, images: finalImageUrls,
                travel_start_date: startDate || null, travel_end_date: endDate || null,
                rating: tripRating 
            } : g));
            setActiveGroupId(null);
        } catch (err: any) { console.error("Save failed:", err); alert(`Failed to save: ${err.message}`); } finally { setIsSaving(false); }
    };

    const handleDeleteGroupById = async (groupId: string) => { if (!confirm("Delete this template?")) return; if (groupId.startsWith('temp-')) { setTripGroups(prev => prev.filter(g => g.id !== groupId)); if (activeGroupId === groupId) setActiveGroupId(null); return; } setIsSaving(true); try { const { error } = await supabase.from('templates').delete().eq('id', groupId); if (error) throw error; setTripGroups(prev => prev.filter(g => g.id !== groupId)); if (activeGroupId === groupId) setActiveGroupId(null); } catch (err) { console.error("Delete failed:", err); } finally { setIsSaving(false); } };
    const handleAddStatus = () => { setTripStatuses([...tripStatuses, { id: Date.now().toString(), label: 'New', color: '#000000' }]); };
    const handleUpdateStatus = (id: string, key: keyof TripStatus, value: string) => { setTripStatuses(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s)); };
    const handleDeleteStatus = (id: string) => { if (tripStatuses.length <= 1) return; setTripStatuses(prev => prev.filter(s => s.id !== id)); const firstAvailable = tripStatuses.find(s => s.id !== id)?.id || ""; setCurrentGroupRegions(prev => prev.map(r => r.statusId === id ? { ...r, statusId: firstAvailable } : r)); };

    useEffect(() => { async function fetchHighchartsMapData() { if (!countryCode) return; setIsLoadingRegions(true); try { const mapUrl = `https://code.highcharts.com/mapdata/countries/${countryCode}/${countryCode}-all.geo.json`; const response = await fetch(mapUrl); if (!response.ok) throw new Error("Map data not found"); const data = await response.json(); if (data && data.features) { setRegionList(data.features.map((feature: any) => feature.properties.name).filter((name: any) => name).sort()); } } catch (error) { setRegionList([]); } finally { setIsLoadingRegions(false); } } fetchHighchartsMapData(); }, [countryCode]);

    const startResizing = useCallback((e: React.MouseEvent) => { setIsResizing(true); e.preventDefault(); }, []);
    const stopResizing = useCallback(() => { setIsResizing(false); }, []);
    const resize = useCallback((e: MouseEvent) => { if (isResizing) { let newWidth = window.innerWidth - e.clientX; if (newWidth < 400) newWidth = 400; if (newWidth > 1000) newWidth = 1000; setSidebarWidth(newWidth); } }, [isResizing]);
    useEffect(() => { if (isResizing) { window.addEventListener("mousemove", resize); window.addEventListener("mouseup", stopResizing); } else { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); } return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); }; }, [isResizing, resize, stopResizing]);

    const filteredRegions = useMemo(() => regionList.filter(region => region.toLowerCase().includes(regionSearchQuery.toLowerCase())), [regionList, regionSearchQuery]);
    const handleRegionClick = (provinceName: string) => { if (activeGroupId) toggleRegion(provinceName); };

    // MAP CONTROL HANDLERS
    const handleZoomIn = () => { setMapPosition(pos => ({ ...pos, zoom: Math.min(pos.zoom * 1.5, 4) })); };
    const handleZoomOut = () => { setMapPosition(pos => ({ ...pos, zoom: Math.max(pos.zoom / 1.5, 1) })); };
    const handleResetZoom = () => { setMapPosition({ coordinates: [400, 300], zoom: 1 }); };

    const mapSelectedRegions = useMemo(() => {
        if (activeGroupId) return currentGroupRegions.map(r => r.name);
        if (previewGroupId) { const group = tripGroups.find(g => g.id === previewGroupId); return group ? group.regions.map(r => r.name) : []; }
        if (isViewAll) { const allRegions = new Set<string>(); tripGroups.forEach(g => g.regions.forEach(r => allRegions.add(r.name))); return Array.from(allRegions); }
        return [];
    }, [activeGroupId, previewGroupId, currentGroupRegions, tripGroups, isViewAll]);

    const regionColors = useMemo(() => {
        const mapColors: Record<string, string> = {};
        if (activeGroupId) { currentGroupRegions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }
        else if (previewGroupId) { const previewGroup = tripGroups.find(g => g.id === previewGroupId); previewGroup?.regions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }
        else if (isViewAll) { tripGroups.forEach(group => { group.regions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }); }
        return mapColors;
    }, [tripGroups, tripStatuses, activeGroupId, previewGroupId, currentGroupRegions, isViewAll]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className={`flex flex-col bg-[#FFFFFF] font-sans text-gray-800 h-screen overflow-hidden ${isFullscreen ? "fixed inset-0 z-[9999]" : "relative z-0"} ${isResizing ? "cursor-col-resize select-none" : ""}`}>
            {/* HEADER */}
            <div className="h-[60px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-10 z-20 flex-shrink-0 flex items-center justify-between relative mb-[32px]">
                <div className="flex items-center gap-[48px]">
                    <button onClick={() => router.back()} className="hover:opacity-60 transition"><ArrowLeft className="w-6 h-6 text-black" /></button>
                    <div className="flex items-center gap-[16px]">
                        {countryCode && <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt={countryCode} className="w-[54px] h-[36px] rounded-[5px] object-cover shadow-sm" />}
                        <h1 className="text-[28px] font-bold text-black leading-[34px] tracking-[0.02em]">{countryName}</h1>
                    </div>
                                        <div className="relative">
                        <button onClick={(e) => { e.stopPropagation(); if (!activeGroupId) return; setIsRegionDropdownOpen(!isRegionDropdownOpen); setRegionSearchQuery(""); }} disabled={isLoadingRegions || !activeGroupId} className={`w-[323px] h-[40px] bg-[#F0F6FC] border border-[#60A3DE] rounded-[10px] flex items-center justify-between px-[16px] transition disabled:opacity-50 disabled:cursor-not-allowed ${!activeGroupId ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-[10px]">
                                <MapPin className="w-[22px] h-[24px] text-[#60A3DE]" />
                                <span className="font-normal text-[20px] leading-[24px] tracking-[0.02em] text-[#60A3DE] truncate max-w-[200px]">{isLoadingRegions ? "Loading..." : activeGroupId ? (currentGroupRegions.length > 0 ? `${currentGroupRegions.length} Regions` : "Select Provinces") : "Select Template First"}</span>
                            </div>
                            {isRegionDropdownOpen ? <ChevronUp className="w-[16px] h-[16px] text-[#60A3DE]" /> : <ChevronDown className="w-[16px] h-[16px] text-[#60A3DE]" />}
                        </button>
                        {isRegionDropdownOpen && activeGroupId && (
                            <div className="absolute top-full left-0 mt-2 w-[323px] max-h-[400px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col" onClick={(e) => e.stopPropagation()}>
                                <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                                    <div className="relative"><Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search region..." value={regionSearchQuery} onChange={(e) => setRegionSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" autoFocus /></div>
                                </div>
                                <div className="overflow-y-auto flex-1">
                                    {filteredRegions.length > 0 ? filteredRegions.map(region => (
                                        <button key={region} onClick={() => toggleRegion(region)} className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between group border-b border-gray-50 last:border-none ${currentGroupRegions.some(r => r.name === region) ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                                            {region} {currentGroupRegions.some(r => r.name === region) && <Check className="w-4 h-4 text-blue-600" />}
                                        </button>
                                    )) : <div className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center"><MapPin className="w-6 h-6 mb-2 opacity-50" />No regions found</div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-[24px]">
                    <button onClick={() => router.push('/mytrips')} className="w-[190px] h-[40px] border border-[#3A82CE] rounded-[5px] flex items-center justify-center gap-[10px] hover:bg-[#F0F6FC] transition"><LayoutTemplate className="w-[18px] h-[18px] text-[#3A82CE]" /><span className="font-medium text-[20px] leading-[24px] text-[#3A82CE]">My Templates</span></button>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-2 rounded-lg transition border ${isFullscreen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`} title={isFullscreen ? "Show Navbar" : "Fullscreen"}>{isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}</button>
                </div>
            </div>

            {/* BODY */}
            <div className="flex-1 flex overflow-hidden relative px-[60px] pb-[40px] pt-[20px]">
                {/* MAP AREA */}
                <div className="flex-1 relative mr-[32px]">
                    <div className="w-full h-full bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] overflow-hidden relative">
                        <div className="w-full h-full">
                            <DynamicMap 
                                countryCode={countryCode} 
                                regionColors={regionColors} 
                                selectedRegions={mapSelectedRegions} 
                                onRegionClick={handleRegionClick}
                                mapPosition={mapPosition}
                                onMoveEnd={setMapPosition}
                            />
                        </div>
                        <div className="absolute bottom-8 right-8 w-[53px] bg-white border border-[#D9D9D9] rounded-[5px] flex flex-col items-center py-2 shadow-sm z-10">
                            <button onClick={handleZoomIn} className="w-[37px] h-[42px] flex items-center justify-center hover:bg-gray-50 transition"><Plus className="w-5 h-5 text-[#9E9E9E]" /></button>
                            <div className="w-full h-px bg-[#D9D9D9]"></div>
                            <button onClick={handleZoomOut} className="w-[37px] h-[42px] flex items-center justify-center hover:bg-gray-50 transition"><Minus className="w-5 h-5 text-[#9E9E9E]" /></button>
                            <div className="w-full h-px bg-[#D9D9D9]"></div>
                            <button onClick={handleResetZoom} className="w-[37px] h-[42px] flex items-center justify-center hover:bg-gray-50 transition"><RefreshCw className="w-4 h-4 text-[#9E9E9E]" /></button>
                        </div>
                    </div>
                </div>

                {/* RESIZER */}
                <div className={`w-1 hover:bg-blue-400 cursor-col-resize z-40 transition-colors flex items-center justify-center group ${isResizing ? "bg-blue-500" : "bg-transparent"}`} onMouseDown={startResizing}>
                    <div className="h-8 w-4 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"><GripVertical className="w-3 h-3 text-gray-400" /></div>
                </div>

                {/* RIGHT PANEL */}
                <div ref={sidebarRef} className="bg-white shadow-[0px_0px_4px_rgba(0,0,0,0.25)] rounded-[5px] flex flex-col z-30 md:static flex-shrink-0 relative" style={{ width: sidebarWidth, minWidth: 483 }}>
                    
                    {activeGroupId ? (
                        /* ✅✅✅ EDIT MODE LAYOUT ✅✅✅ */
                        <div className="flex flex-col h-full bg-white border border-[#E0E0E0] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] p-[10px] pt-[20px] gap-2 overflow-hidden relative">
                            {/* --- HEADER --- */}
                            <div className="flex justify-between items-center w-full pb-[8px] border-b border-[#9E9E9E] mb-4 flex-shrink-0">
                                <div className="flex items-center gap-[10px] overflow-hidden">
                                    <MapPin className="w-[24px] h-[24px] text-[#F44336] shrink-0" />
                                    <span className="font-bold text-[20px] leading-[24px] text-black truncate max-w-[350px] font-inter">
                                        {activeGroup?.name || "Untitled Group"}
                                    </span>
                                </div>
                                <button onClick={() => setActiveGroupId(null)} className="w-[24px] h-[24px] flex items-center justify-center hover:bg-gray-100 rounded transition">
                                    <X className="w-[14px] h-[14px] text-black" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-thin px-2 flex flex-col gap-4">
                                {/* --- IMAGES --- */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[14px] font-normal text-[#616161] font-inter">Images ({currentImages.length}/10)</label>
                                    <div className={`w-full flex ${currentImages.length === 0 ? 'justify-center' : 'justify-start'}`}>
                                        {currentImages.length === 0 ? (
                                            <div onClick={() => fileInputRef.current?.click()} className="w-[403px] h-[155px] bg-[#F0F6FC] border border-dashed border-[#9E9E9E] rounded-[5px] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#e1effc] transition">
                                                <div className="w-[21px] h-[21px] bg-[#3A82CE] rounded-full flex items-center justify-center"><Plus className="w-[14px] h-[14px] text-white" /></div>
                                                <span className="text-[12px] text-[#9E9E9E] font-inter text-center">Click to upload photos or drag and drop</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-wrap gap-[21px] items-start">
                                                {currentImages.map((img) => (
                                                    <div key={img.id} className="relative w-[88px] h-[88px] rounded-[5px] overflow-hidden bg-gray-100 border border-[#E0E0E0]">
                                                        <img src={img.url} alt="preview" className="w-full h-full object-cover" />
                                                        <button onClick={() => handleRemoveImage(img.id)} className="absolute top-1 right-1 bg-white/90 p-0.5 rounded-full hover:bg-red-100 text-red-500 transition shadow-sm"><X className="w-3 h-3" /></button>
                                                    </div>
                                                ))}
                                                {currentImages.length < 10 && (
                                                    <div onClick={() => fileInputRef.current?.click()} className="w-[88px] h-[88px] bg-[#F0F6FC] border border-dashed border-[#9E9E9E] rounded-[5px] flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-[#e1effc] transition">
                                                        <div className="w-[21px] h-[21px] bg-[#3A82CE] rounded-full flex items-center justify-center"><Plus className="w-[14px] h-[14px] text-white" /></div>
                                                        <span className="text-[12px] text-[#9E9E9E] font-inter">Add more</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                                    </div>
                                </div>

                                {/* --- TEMPLATE NAME --- */}
                                <div className="flex flex-col gap-[4px]">
                                    <label className="text-[14px] font-normal text-[#616161] font-inter">Template Name</label>
                                    <div className="box-border w-full h-[26px] bg-white border border-[#9E9E9E] rounded-[5px] flex items-center justify-between px-[10px] gap-[10px]">
                                        <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full h-full text-[12px] font-normal text-black placeholder-[#9E9E9E] bg-transparent outline-none font-inter leading-[15px]" placeholder="e.g., Summer Vacation" />
                                        <Edit3 className="w-[16px] h-[16px] text-[#3A82CE] flex-shrink-0" />
                                    </div>
                                </div>

                                {/* --- DATE (Input Trigger) --- */}
                                <div className="flex flex-col gap-[4px] relative">
                                    <label className="text-[14px] font-normal text-[#616161] font-inter">Date (From - To)</label>
                                    <div 
                                        className="box-border w-full h-[26px] bg-white border border-[#9E9E9E] rounded-[5px] flex justify-between items-center px-[10px] cursor-pointer hover:border-[#3A82CE] transition"
                                        onClick={(e) => { e.stopPropagation(); setIsDatePickerOpen(true); }}
                                    >
                                        <span className={`text-[12px] font-normal font-inter leading-[15px] ${startDate ? 'text-black' : 'text-[#9E9E9E]'}`}>
                                            {startDate ? `${formatDate(startDate)}${endDate ? ` - ${formatDate(endDate)}` : ''}` : "MM/DD/YYYY - MM/DD/YYYY"}
                                        </span>
                                        <Calendar className="w-[16px] h-[16px] text-[#3A82CE]" />
                                    </div>
                                </div>

                                {/* --- NOTE --- */}
                                <div className="flex flex-col gap-1">
                                    <label className="text-[14px] font-normal text-[#616161] font-inter">Note (Optional)</label>
                                    <textarea value={groupNote} onChange={(e) => setGroupNote(e.target.value)} className="w-full min-h-[50px] border border-[#9E9E9E] rounded-[5px] px-[10px] py-[5px] text-[12px] text-black placeholder-[#9E9E9E] outline-none resize-none font-inter leading-[15px]" placeholder="Add details..." />
                                </div>

                                {/* --- RATING --- */}
                                <div className="flex flex-col">
                                    <label className="text-[14px] font-normal text-[#616161] font-inter">Trip Rating</label>
                                    <div className="h-[40px] w-full flex items-center justify-center gap-[8px] px-[80px] py-[10px]">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button 
                                                key={star} 
                                                onClick={() => setTripRating(star)} 
                                                className="focus:outline-none transition-transform hover:scale-110 active:scale-95 flex-shrink-0" 
                                                type="button"
                                            >
                                                <Star className={`w-[20px] h-[20px] ${star <= tripRating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-[#9E9E9E] text-[#9E9E9E]"}`} strokeWidth={0} />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* --- VISITED PROVINCES --- */}
                                <div className="flex flex-col gap-[4px] mt-[10px]">
                                    <label className="text-[14px] font-normal text-[#616161] font-inter">Visited Provinces ({currentGroupRegions.length})</label>
                                    <div className="w-full min-h-[100px] border border-[#9E9E9E] rounded-[5px] flex flex-col bg-white overflow-hidden">
                                        {currentGroupRegions.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center gap-2 p-4 bg-[#F0F6FC] h-full">
                                                <div className="w-[21px] h-[21px] bg-[#3A82CE] rounded-full flex items-center justify-center"><MapPin className="w-[12px] h-[12px] text-white" /></div>
                                                <span className="text-[12px] text-[#9E9E9E] text-center font-inter leading-[15px]">No provinces selected.<br/>Click on the map to add.</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col w-full">
                                                {currentGroupRegions.map(region => (
                                                    <RegionItem 
                                                        key={region.name} 
                                                        region={region} 
                                                        statuses={tripStatuses} 
                                                        onUpdateStatus={(newId) => updateRegionStatus(region.name, newId)} 
                                                        onRemove={() => toggleRegion(region.name)} 
                                                        statusActions={{ onUpdate: handleUpdateStatus, onDelete: handleDeleteStatus, onAdd: handleAddStatus }} 
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* --- ACTIONS --- */}
                            <div className="flex justify-between items-center px-[10px] pt-[10px] pb-0 mt-auto gap-4 flex-shrink-0">
                                <button onClick={() => handleDeleteGroupById(activeGroupId)} className="w-[60px] h-[42px] bg-[#FFEBEE] rounded-[5px] flex items-center justify-center hover:bg-[#ffcdd2] transition">
                                    <Trash2 className="w-[21px] h-[21px] text-[#F44336]" />
                                </button>
                                <button onClick={handleApply} disabled={isSaving} className="flex-1 h-[42px] bg-[#3A82CE] rounded-[5px] flex items-center justify-center text-white text-[16px] font-normal hover:bg-[#2a6db5] transition disabled:opacity-50">
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Template"}
                                </button>
                            </div>

                            {/* ✅✅✅ MODAL OVERLAY DATE PICKER ✅✅✅ */}
                            {isDatePickerOpen && (
                                <div 
                                    className="absolute inset-0 z-[100] flex items-center justify-center bg-gray-900/20 backdrop-blur-[1px] rounded-[10px]"
                                    onClick={() => setIsDatePickerOpen(false)}
                                >
                                    <CustomDateRangePicker 
                                        startDate={startDate} 
                                        endDate={endDate} 
                                        onClose={() => setIsDatePickerOpen(false)}
                                        onChange={(start, end) => { 
                                            setStartDate(start); 
                                            setEndDate(end); 
                                        }} 
                                    />
                                </div>
                            )}

                        </div>
                    ) : (
                        /* ✅✅✅ LIST MODE (No Active Group) ✅✅✅ */
                        <div className="flex flex-col h-full p-[20px] pt-[30px]">
                            <div className="flex-shrink-0 mb-[32px]">
                                <div className="flex flex-col gap-[8px] pb-[8px] border-b border-[#EEEEEE]">
                                    <div className="flex justify-between items-start">
                                        <div><h2 className="font-bold text-[20px] leading-[24px] text-black font-inter">Trip Templates</h2><p className="font-normal text-[16px] leading-[19px] text-black font-inter">Create & manage your travel plans</p></div>
                                        {tripGroups.length > 0 && (<button onClick={() => setIsViewAll(!isViewAll)} className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium transition select-none ${isViewAll ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>{isViewAll ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}{isViewAll ? "Hide All" : "View All"}</button>)}
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                                {tripGroups.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center gap-[32px] mt-[100px]">
                                        <div className="flex flex-col items-center gap-[16px] w-full"><div className="w-[48px] h-[48px] text-[#3A82CE]"><Layers className="w-full h-full" strokeWidth={1.5} /></div><div className="flex flex-col items-center gap-[8px] w-full text-center"><h3 className="font-bold text-[20px] leading-[24px] text-black font-inter">No Trip Templates yet</h3><p className="font-normal text-[16px] leading-[19px] text-black font-inter">Start by creating your first travel template.</p></div></div>
                                        <button onClick={handleAddGroup} className="w-[220px] h-[42px] bg-[#3A82CE] rounded-[5px] flex items-center justify-center gap-[8px] hover:bg-[#2c6cb0] transition shadow-sm"><div className="w-[14px] h-[14px] flex items-center justify-center"><Plus className="w-full h-full text-white" strokeWidth={3} /></div><span className="font-normal text-[18px] leading-[22px] text-white font-inter">Create New Trip</span></button>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-[16px]">
                                        {tripGroups.map(group => (
                                            <div key={group.id} onClick={() => setPreviewGroupId(prev => prev === group.id ? null : group.id)} className={`box-border w-full h-[64px] bg-white border ${(activeGroupId === group.id || previewGroupId === group.id) ? 'border-[#3A82CE] ring-1 ring-[#3A82CE]' : 'border-[#C2DCF3]'} shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[5px] flex items-start justify-between p-[10px] gap-[27px] cursor-pointer transition-all hover:border-[#3A82CE] group relative`}>
                                                <div className="flex items-center gap-[12px]">{group.images && group.images.length > 0 ? (<img src={group.images[0]} alt={group.name} className="w-[44px] h-[44px] rounded-[5px] object-cover" />) : (<div className="w-[44px] h-[44px] rounded-[5px] bg-[#F0F6FC] flex items-center justify-center text-[#3A82CE]"><ImageIcon className="w-5 h-5" /></div>)}<div className="flex flex-col items-start gap-[4px]"><h3 className="font-inter font-medium text-[16px] leading-[19px] text-black truncate max-w-[175px]">{group.name}</h3><p className="font-inter font-normal text-[12px] leading-[15px] text-black">{group.regions.length} {group.regions.length > 1 ? 'provinces' : 'province'}</p></div></div>
                                                <div className="flex items-center justify-center w-[36px] h-[24px] my-auto"><button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === group.id ? null : group.id); }} className="text-black hover:text-gray-600 transition"><MoreVertical className="w-5 h-5" /></button></div>
                                                {openMenuId === group.id && (<div className="absolute right-2 top-10 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"><button onClick={(e) => { e.stopPropagation(); setActiveGroupId(group.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-50"><Edit3 className="w-4 h-4" /> Edit</button><button onClick={(e) => { e.stopPropagation(); handleDeleteGroupById(group.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button></div>)}
                                            </div>
                                        ))}
                                        <button onClick={handleAddGroup} className="w-[220px] h-[42px] bg-[#3A82CE] rounded-[5px] flex items-center justify-center gap-[8px] hover:bg-[#2c6cb0] transition shadow-sm mt-4 mx-auto"><div className="w-[14px] h-[14px] flex items-center justify-center"><Plus className="w-full h-full text-white" strokeWidth={3} /></div><span className="font-normal text-[18px] leading-[22px] text-white font-inter">Create New Trip</span></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CustomDateRangePicker({ startDate, endDate, onChange, onClose }: { startDate: string, endDate: string, onChange: (s: string, e: string) => void, onClose: () => void }) {
    const [viewDate, setViewDate] = useState(startDate ? new Date(startDate) : new Date());
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const handleDayClick = (day: number) => {
        const clickedDate = new Date(year, month, day);
        const dateStr = `${clickedDate.getFullYear()}-${String(clickedDate.getMonth() + 1).padStart(2, '0')}-${String(clickedDate.getDate()).padStart(2, '0')}`;
        
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
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 w-[320px] animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
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
                        <button 
                            key={day} 
                            onClick={() => handleDayClick(day)} 
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] transition mx-auto font-inter ${bgClass} ${textClass}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-100">
                <button 
                    onClick={onClose}
                    className="bg-[#3A82CE] text-white text-[12px] font-medium px-4 py-1.5 rounded-[5px] hover:bg-[#2c6cb0] transition shadow-sm font-inter"
                >
                    Done
                </button>
            </div>
        </div>
    );
}

function RegionItem({ region, statuses, onUpdateStatus, onRemove, statusActions }: RegionItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const currentStatus = statuses.find((s) => s.id === region.statusId) || statuses[0];
    
    return (
        <div className={`bg-white border-b border-[#E0E0E0] last:border-none transition-all duration-200 ${isOpen ? 'shadow-md border-transparent ring-1 ring-blue-100 z-10 relative rounded-[5px] my-1' : ''}`}>
            {/* Header Row */}
            <div className="box-border flex justify-between items-center px-[10px] h-[35px] hover:bg-gray-50 transition cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                <span className="text-[12px] font-normal text-[#9E9E9E] font-inter truncate max-w-[150px]">{region.name}</span>
                <div className="flex items-center gap-[10px]">
                    <div className="flex items-center gap-[8px] px-2 py-1 rounded transition">
                        <div className="w-[12px] h-[12px] rounded-full shadow-sm border border-black/5" style={{ backgroundColor: currentStatus?.color }} />
                        {isOpen ? <ChevronUp className="w-[10px] h-[10px] text-[#9E9E9E]" /> : <ChevronDown className="w-[10px] h-[10px] text-[#9E9E9E]" />}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-1 hover:bg-red-50 rounded transition group">
                        <X className="w-[10px] h-[10px] text-[#9E9E9E] group-hover:text-red-500" />
                    </button>
                </div>
            </div>

            {/* Dropdown Content (Full Management) */}
            {isOpen && (
                <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2 cursor-default" onClick={(e) => e.stopPropagation()}>
                    <div className="h-px bg-gray-100 w-full mb-3"></div>
                    
                    {/* Header Columns */}
                    <div className="grid grid-cols-[30px_1fr_40px_30px] gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                        <div></div>
                        <div>Label</div>
                        <div>Color</div>
                        <div className="text-right">Action</div>
                    </div>

                    {/* Status List */}
                    <div className="space-y-1.5">
                        {statuses.map((status) => (
                            <div 
                                key={status.id} 
                                className={`grid grid-cols-[30px_1fr_40px_30px] gap-2 items-center p-1.5 rounded-lg border transition-all cursor-pointer ${status.id === region.statusId ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:border-gray-300'}`}
                                onClick={() => onUpdateStatus(status.id)}
                            >
                                {/* Radio Circle */}
                                <div className="flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${status.id === region.statusId ? 'border-blue-500 bg-white' : 'border-gray-300'}`}>
                                        {status.id === region.statusId && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                                    </div>
                                </div>

                                {/* Label Input */}
                                <div>
                                    <input 
                                        type="text" 
                                        value={status.label} 
                                        onClick={(e) => e.stopPropagation()} 
                                        onChange={(e) => statusActions.onUpdate(status.id, 'label', e.target.value)} 
                                        className="bg-transparent text-xs font-medium text-gray-700 outline-none border-b border-transparent focus:border-blue-300 focus:bg-white rounded px-1 transition h-6 w-full" 
                                    />
                                </div>

                                {/* Color Picker */}
                                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200 shadow-sm mx-auto" onClick={(e) => e.stopPropagation()}>
                                    <input 
                                        type="color" 
                                        value={status.color} 
                                        onChange={(e) => statusActions.onUpdate(status.id, 'color', e.target.value)} 
                                        className="absolute -top-1 -left-1 w-7 h-7 border-none cursor-pointer p-0" 
                                    />
                                </div>

                                {/* Delete Button */}
                                <div className="text-right">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); statusActions.onDelete(status.id); }} 
                                        disabled={statuses.length <= 1} 
                                        className="text-gray-300 hover:text-red-500 transition disabled:opacity-30 disabled:hover:text-gray-300 p-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Add New Button */}
                    <button 
                        onClick={statusActions.onAdd} 
                        className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold text-blue-500 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"
                    >
                        <Plus className="w-3 h-3" /> Add New Status
                    </button>
                </div>
            )}
        </div>
    );
}