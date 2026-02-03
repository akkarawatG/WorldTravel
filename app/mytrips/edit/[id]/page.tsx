"use client";

import { useState, use, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, LayoutTemplate, X, MapPin, ChevronDown, ChevronUp, Search, Trash2, Plus, Layers, Settings, StickyNote, Loader2, Check, Image as ImageIcon, MoreVertical, Edit3, Maximize2, Minimize2, GripVertical,Minus,RefreshCw } from "lucide-react";
import dynamic from 'next/dynamic';

const COUNTRY_NAMES: Record<string, string> = {
    // Asia
    cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
    // Europe
    fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
    // North America
    us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
    // South America
    ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
    // Africa
    za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
    // Oceania
    au: "Australia", nz: "New Zealand"
};

const DynamicMap = dynamic(
    () => import('../../../../components/DynamicMap'),
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

export default function EditTripPage({ params }: PageProps) {
    const router = useRouter();
    const supabase = createClient();
    const { id: tripId } = use(params);

    const [isFullscreen, setIsFullscreen] = useState(true);

    // ✅ RESIZE LOGIC STATE
    const [sidebarWidth, setSidebarWidth] = useState(400); // เริ่มต้น 400px
    const [isResizing, setIsResizing] = useState(false);
    const sidebarRef = useRef<HTMLDivElement>(null);

    // Data States
    const [countryCode, setCountryCode] = useState<string>("");
    const countryName = COUNTRY_NAMES[countryCode] || countryCode.toUpperCase();

    const [regionList, setRegionList] = useState<string[]>([]);
    const [isLoadingRegions, setIsLoadingRegions] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [dbTripId, setDbTripId] = useState<string | null>(null);

    const [tripGroups, setTripGroups] = useState<TripGroup[]>([]);
    const [tripStatuses, setTripStatuses] = useState<TripStatus[]>(DEFAULT_STATUSES);

    // UI States
    const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
    const [previewGroupId, setPreviewGroupId] = useState<string | null>(null);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    // Form States
    const [currentGroupRegions, setCurrentGroupRegions] = useState<RegionData[]>([]);
    const [groupName, setGroupName] = useState("");
    const [groupNote, setGroupNote] = useState("");
    const [currentImages, setCurrentImages] = useState<ImageState[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    const [regionSearchQuery, setRegionSearchQuery] = useState("");

    const activeGroup = useMemo(() => tripGroups.find(g => g.id === activeGroupId), [tripGroups, activeGroupId]);

    useEffect(() => {
        const initData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                setDbTripId(tripId);
                const { data: trip, error: tripError } = await supabase.from('trips').select('country').eq('id', tripId).single();
                if (tripError || !trip) { router.push('/mytrips'); return; }
                setCountryCode(trip.country);
                const { data: templates, error: tempError } = await supabase.from('templates').select(`id, template_name, notes, images, template_provinces ( province_code, status, color )`).eq('trip_id', tripId).is('deleted_at', null).order('created_at', { ascending: true });
                if (tempError) throw tempError;
                if (templates) {
                    const mappedGroups: TripGroup[] = templates.map((t: any) => {
                        const mappedRegions = t.template_provinces.map((p: any) => {
                            let matchedStatus = tripStatuses.find(s => s.label === p.status && s.color === p.color);
                            if (!matchedStatus) matchedStatus = DEFAULT_STATUSES[0];
                            return { name: p.province_code, statusId: matchedStatus.id };
                        });
                        let imgs: string[] = [];
                        if (Array.isArray(t.images)) { imgs = t.images; } else if (typeof t.images === 'string') { try { imgs = JSON.parse(t.images); } catch { imgs = [t.images]; } }
                        return { id: t.id, name: t.template_name || "Untitled", notes: t.notes || "", images: imgs, regions: mappedRegions };
                    });
                    setTripGroups(mappedGroups);
                }
            } catch (err) { console.error("Error init:", err); }
        };
        initData();
    }, [tripId]);

    useEffect(() => {
        if (activeGroup) {
            setCurrentGroupRegions(activeGroup.regions); setGroupName(activeGroup.name); setGroupNote(activeGroup.notes || "");
            const loadedImages = (activeGroup.images || []).map((url, idx) => ({ id: `existing-${idx}`, url: url }));
            setCurrentImages(loadedImages); setPreviewGroupId(null);
        } else {
            setCurrentGroupRegions([]); setGroupName(""); setGroupNote(""); setCurrentImages([]);
        }
    }, [activeGroupId, activeGroup]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { const files = e.target.files; if (files) { const newFiles = Array.from(files); if (currentImages.length + newFiles.length > 10) { alert("Maximum 10 images allowed."); return; } const newImageStates: ImageState[] = newFiles.map(file => ({ id: `new-${Date.now()}-${Math.random()}`, url: URL.createObjectURL(file), file: file })); setCurrentImages(prev => [...prev, ...newImageStates]); } if (fileInputRef.current) fileInputRef.current.value = ""; };
    const handleRemoveImage = (idToRemove: string) => { setCurrentImages(prev => prev.filter(img => img.id !== idToRemove)); };
    const handleAddGroup = () => { const newId = `temp-${Date.now()}`; const newGroup: TripGroup = { id: newId, name: `Trip ${tripGroups.length + 1}`, regions: [], notes: "", images: [] }; setTripGroups([...tripGroups, newGroup]); setActiveGroupId(newId); };
    const toggleRegion = (regionName: string) => { if (!activeGroupId) return; setCurrentGroupRegions(prev => { const exists = prev.find(r => r.name === regionName); if (exists) return prev.filter(r => r.name !== regionName); return [...prev, { name: regionName, statusId: tripStatuses[0].id }]; }); };
    const updateRegionStatus = (regionName: string, newStatusId: string) => { setCurrentGroupRegions(prev => prev.map(r => r.name === regionName ? { ...r, statusId: newStatusId } : r)); };

    // ✅ SAVE DATA
    const handleApply = async () => {
        if (!activeGroupId || !dbTripId) return;
        setIsSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const isNew = activeGroupId.startsWith('temp-');
            const finalImageUrls: string[] = [];

            // 1. Upload Images
            for (const img of currentImages) {
                if (img.file) {
                    const cleanName = img.file.name.replace(/[^a-zA-Z0-9.]/g, "_");
                    const fileName = `${user.id}/${Date.now()}_${cleanName}`;
                    const { error: uploadError } = await supabase.storage.from('templates').upload(fileName, img.file);
                    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);
                    const { data: publicUrlData } = supabase.storage.from('templates').getPublicUrl(fileName);
                    finalImageUrls.push(publicUrlData.publicUrl);
                } else {
                    finalImageUrls.push(img.url);
                }
            }

            // 2. Save/Update Template Header
            const templatePayload = {
                trip_id: dbTripId,
                template_name: groupName,
                notes: groupNote,
                images: finalImageUrls,
                ...(isNew ? {} : { id: activeGroupId })
            };

            const { data: savedTemplate, error: tmplError } = await supabase.from('templates').upsert(templatePayload).select().single();
            if (tmplError) throw tmplError;
            const realTemplateId = savedTemplate.id;

            // 3. Save Regions (Delete old -> Insert new)
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

            // 4. Update UI List
            setTripGroups(prev => prev.map(g =>
                g.id === activeGroupId
                    ? {
                        ...g,
                        id: realTemplateId, // อัปเดต ID จริงจาก Database (กรณีเป็น New Template)
                        regions: currentGroupRegions,
                        name: groupName,
                        notes: groupNote,
                        images: finalImageUrls
                    }
                    : g
            ));

            // ✅ 5. EXIT EDIT MODE (กลับไปหน้า Your Templates)
            setActiveGroupId(null);

        } catch (err: any) {
            console.error("Save failed:", err);
            alert(`Failed to save: ${err.message}`);
        } finally {
            setIsSaving(false);
        }
    };
    const handleDeleteGroupById = async (groupId: string) => { if (!confirm("Delete this template?")) return; if (groupId.startsWith('temp-')) { setTripGroups(prev => prev.filter(g => g.id !== groupId)); if (activeGroupId === groupId) setActiveGroupId(null); return; } setIsSaving(true); try { const { error } = await supabase.from('templates').delete().eq('id', groupId); if (error) throw error; setTripGroups(prev => prev.filter(g => g.id !== groupId)); if (activeGroupId === groupId) setActiveGroupId(null); } catch (err) { console.error("Delete failed:", err); } finally { setIsSaving(false); } };
    const handleAddStatus = () => { setTripStatuses([...tripStatuses, { id: Date.now().toString(), label: 'New', color: '#000000' }]); };
    const handleUpdateStatus = (id: string, key: keyof TripStatus, value: string) => { setTripStatuses(prev => prev.map(s => s.id === id ? { ...s, [key]: value } : s)); };
    const handleDeleteStatus = (id: string) => { if (tripStatuses.length <= 1) return; setTripStatuses(prev => prev.filter(s => s.id !== id)); const firstAvailable = tripStatuses.find(s => s.id !== id)?.id || ""; setCurrentGroupRegions(prev => prev.map(r => r.statusId === id ? { ...r, statusId: firstAvailable } : r)); };

    useEffect(() => { async function fetchHighchartsMapData() { if (!countryCode) return; setIsLoadingRegions(true); try { const mapUrl = `https://code.highcharts.com/mapdata/countries/${countryCode}/${countryCode}-all.geo.json`; const response = await fetch(mapUrl); if (!response.ok) throw new Error("Map data not found"); const data = await response.json(); if (data && data.features) { setRegionList(data.features.map((feature: any) => feature.properties.name).filter((name: any) => name).sort()); } } catch (error) { setRegionList([]); } finally { setIsLoadingRegions(false); } } fetchHighchartsMapData(); }, [countryCode]);

    const startResizing = useCallback((e: React.MouseEvent) => { setIsResizing(true); e.preventDefault(); }, []);
    const stopResizing = useCallback(() => { setIsResizing(false); }, []);

    const resize = useCallback((e: MouseEvent) => {
        if (isResizing) {
            let newWidth = window.innerWidth - e.clientX;
            // ✅ Fix: บังคับขนาดต่ำสุดที่ 400px (เพื่อให้ Grid Card ขนาด 300px+ แสดงผลได้สวยงาม 1 col)
            if (newWidth < 400) newWidth = 400;
            if (newWidth > 1000) newWidth = 1000;
            setSidebarWidth(newWidth);
        }
    }, [isResizing]);

    useEffect(() => { if (isResizing) { window.addEventListener("mousemove", resize); window.addEventListener("mouseup", stopResizing); } else { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); } return () => { window.removeEventListener("mousemove", resize); window.removeEventListener("mouseup", stopResizing); }; }, [isResizing, resize, stopResizing]);

    const filteredRegions = useMemo(() => regionList.filter(region => region.toLowerCase().includes(regionSearchQuery.toLowerCase())), [regionList, regionSearchQuery]);
    const handleRegionClick = (provinceName: string) => { if (activeGroupId) toggleRegion(provinceName); };

    const regionColors = useMemo(() => {
        const mapColors: Record<string, string> = {};
        if (activeGroupId) { currentGroupRegions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }
        else if (previewGroupId) { const previewGroup = tripGroups.find(g => g.id === previewGroupId); previewGroup?.regions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }
        else { tripGroups.forEach(group => { group.regions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }); }
        return mapColors;
    }, [tripGroups, tripStatuses, activeGroupId, previewGroupId, currentGroupRegions]);

    const selectedRegionNames = useMemo(() => currentGroupRegions.map(r => r.name), [currentGroupRegions]);

    return (
        <div className={`flex flex-col bg-[#FFFFFF] font-sans text-gray-800 h-screen overflow-hidden ${isFullscreen ? "fixed inset-0 z-[9999]" : "relative z-0"} ${isResizing ? "cursor-col-resize select-none" : ""}`}>

            {/* HEADER (ดัน Body ลง 100px) */}
            <div className="h-[60px] bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] px-10 z-20 flex-shrink-0 flex items-center justify-between relative mb-[100px]">

                {/* Left Section */}
                <div className="flex items-center gap-[48px]">
                    <button onClick={() => router.back()} className="hover:opacity-60 transition">
                        <ArrowLeft className="w-6 h-6 text-black" />
                    </button>
                    <div className="flex items-center gap-[16px]">
                        <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt={countryCode} className="w-[54px] h-[36px] rounded-[5px] object-cover shadow-sm" />
                        <h1 className="text-[28px] font-bold text-black leading-[34px] tracking-[0.02em]">{countryName}</h1>
                    </div>
                </div>

                {/* Middle Section */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
                    <div className="relative">
                        <button onClick={() => { if (!activeGroupId) return; setIsRegionDropdownOpen(!isRegionDropdownOpen); setRegionSearchQuery(""); }} disabled={isLoadingRegions || !activeGroupId} className={`w-[323px] h-[40px] bg-[#F0F6FC] border border-[#60A3DE] rounded-[10px] flex items-center justify-between px-[16px] transition disabled:opacity-50 disabled:cursor-not-allowed ${!activeGroupId ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-[10px]">
                                <MapPin className="w-[22px] h-[24px] text-[#60A3DE]" />
                                <span className="font-normal text-[20px] leading-[24px] tracking-[0.02em] text-[#60A3DE] truncate max-w-[200px]">{isLoadingRegions ? "Loading..." : activeGroupId ? (currentGroupRegions.length > 0 ? `${currentGroupRegions.length} Regions` : "Select Provinces") : "Select Template First"}</span>
                            </div>
                            {isRegionDropdownOpen ? <ChevronUp className="w-[16px] h-[16px] text-[#60A3DE]" /> : <ChevronDown className="w-[16px] h-[16px] text-[#60A3DE]" />}
                        </button>
                        {/* Dropdown Logic Here... */}
                        {isRegionDropdownOpen && activeGroupId && (
                            <div className="absolute top-full left-0 mt-2 w-[323px] max-h-[400px] bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
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

                {/* Right Section */}
                <div className="flex items-center gap-[24px]">
                    <button onClick={() => router.push('/mytrips')} className="w-[190px] h-[40px] border border-[#3A82CE] rounded-[5px] flex items-center justify-center gap-[10px] hover:bg-[#F0F6FC] transition">
                        <LayoutTemplate className="w-[18px] h-[18px] text-[#3A82CE]" />
                        <span className="font-medium text-[20px] leading-[24px] text-[#3A82CE]">My Templates</span>
                    </button>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-2 rounded-lg transition border bg-white text-gray-500 border-gray-200 hover:bg-gray-50">
                        {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* ✅ BODY - UPDATED LAYOUT */}
            <div className="flex-1 flex overflow-hidden relative px-[60px] pb-[40px]"> {/* Main Padding based on Frame positions */}

                {/* === MAP AREA (Frame 1171279246) === */}
                <div className="flex-1 relative mr-[32px]"> {/* mr-32 to gap with Right Panel */}
                    <div className="w-full h-full bg-white border border-[#9E9E9E] shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[10px] overflow-hidden relative">

                        {/* Dynamic Map */}
                        <div className="w-full h-full">
                            <DynamicMap
                                countryCode={countryCode}
                                regionColors={regionColors}
                                selectedRegions={activeGroupId ? selectedRegionNames : []}
                                onRegionClick={handleRegionClick}
                            />
                        </div>

                        {/* Global View Label (Overlay) */}
                        {(!activeGroupId && !previewGroupId) && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-gray-200 p-3 rounded-lg shadow-lg flex items-center gap-3 z-10">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Layers className="w-4 h-4" /></div>
                                <div><p className="text-sm font-bold text-gray-800">Global View</p><p className="text-xs text-gray-500">Showing all templates.</p></div>
                            </div>
                        )}

                        {/* Preview Label (Overlay) */}
                        {previewGroupId && (
                            <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-lg flex items-center gap-3 z-10">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm"><Search className="w-4 h-4" /></div>
                                <div><p className="text-sm font-bold text-blue-800">Previewing Map</p><p className="text-xs text-blue-600">{tripGroups.find(g => g.id === previewGroupId)?.name}</p></div>
                                <button onClick={() => setPreviewGroupId(null)} className="ml-2 text-blue-400 hover:text-blue-700 transition"><X className="w-4 h-4" /></button>
                            </div>
                        )}

                        {/* === ZOOM CONTROLS (Frame 1171279172) === */}
                        <div className="absolute bottom-8 right-8 w-[53px] bg-white border border-[#D9D9D9] rounded-[5px] flex flex-col items-center py-2 shadow-sm z-10">
                            {/* Zoom In */}
                            <button className="w-[37px] h-[42px] flex items-center justify-center hover:bg-gray-50 transition">
                                <Plus className="w-5 h-5 text-[#9E9E9E]" />
                            </button>
                            {/* Divider Line 54 */}
                            <div className="w-full h-px bg-[#D9D9D9]"></div>
                            {/* Zoom Out */}
                            <button className="w-[37px] h-[42px] flex items-center justify-center hover:bg-gray-50 transition">
                                <Minus className="w-5 h-5 text-[#9E9E9E]" />
                            </button>
                            {/* Divider Line 55 */}
                            <div className="w-full h-px bg-[#D9D9D9]"></div>
                            {/* Reset */}
                            <button className="w-[37px] h-[42px] flex items-center justify-center hover:bg-gray-50 transition">
                                <RefreshCw className="w-4 h-4 text-[#9E9E9E]" />
                            </button>
                        </div>

                    </div>
                </div>

                {/* Resizer Handle */}
                <div
                    className={`w-1 hover:bg-blue-400 cursor-col-resize z-40 transition-colors flex items-center justify-center group ${isResizing ? "bg-blue-500" : "bg-transparent"}`}
                    onMouseDown={startResizing}
                >
                    {/* Optional: Visual Grip */}
                </div>

                {/* === RIGHT PANEL (Frame 1171279448) === */}
                <div
                    ref={sidebarRef}
                    className="bg-white shadow-[0px_4px_4px_rgba(0,0,0,0.25)] rounded-[5px] flex flex-col z-30 md:static flex-shrink-0"
                    // Padding from Spec: 10px 10px 10px 20px
                    // Width Spec: 483px
                    style={{
                        width: sidebarWidth,
                        minWidth: 483,
                        paddingTop: '10px',
                        paddingRight: '10px',
                        paddingBottom: '10px',
                        paddingLeft: '20px'
                    }}
                >
                    {/* Header (Frame 1171279443) */}
                    <div className="flex-shrink-0 mb-[32px]"> {/* Gap 32px */}
                        <div className="flex flex-col gap-[8px] pb-[8px] border-b border-[#EEEEEE]">
                            {activeGroupId ? (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <MapPin className="w-5 h-5 text-[#3A82CE] shrink-0" />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-[20px] leading-[24px] text-black truncate max-w-[300px]">
                                                {activeGroup?.name || "Untitled Group"}
                                            </span>
                                            {currentGroupRegions.length > 0 && (
                                                <span className="font-normal text-[14px] text-gray-500">
                                                    {currentGroupRegions.length} Regions Selected
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button onClick={() => setActiveGroupId(null)} className="text-gray-400 hover:text-gray-600 p-1"><X className="w-6 h-6" /></button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="font-bold text-[20px] leading-[24px] text-black font-inter">Trip Templates</h2>
                                    <p className="font-normal text-[16px] leading-[19px] text-black font-inter">Create & manage your travel plans</p>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin pr-2">
                        {!activeGroupId ? (
                            <div className="h-full flex flex-col">
                                {tripGroups.length === 0 ? (
                                    // Empty State (Frame 1171279447)
                                    <div className="flex flex-col items-center justify-center gap-[32px] mt-[100px]">
                                        {/* Icon & Text */}
                                        <div className="flex flex-col items-center gap-[16px] w-full">
                                            <div className="w-[48px] h-[48px] text-[#3A82CE]">
                                                <Layers className="w-full h-full" strokeWidth={1.5} />
                                            </div>
                                            <div className="flex flex-col items-center gap-[8px] w-full text-center">
                                                <h3 className="font-bold text-[20px] leading-[24px] text-black font-inter">No Trip Templates yet</h3>
                                                <p className="font-normal text-[16px] leading-[19px] text-black font-inter">Start by creating your first travel template.</p>
                                            </div>
                                        </div>
                                        {/* Create Button */}
                                        <button onClick={handleAddGroup} className="w-[220px] h-[42px] bg-[#3A82CE] rounded-[5px] flex items-center justify-center gap-[8px] hover:bg-[#2c6cb0] transition shadow-sm">
                                            <div className="w-[14px] h-[14px] flex items-center justify-center"><Plus className="w-full h-full text-white" strokeWidth={3} /></div>
                                            <span className="font-normal text-[18px] leading-[22px] text-white font-inter">Create New Trip</span>
                                        </button>
                                    </div>
                                ) : (
                                    // List View
                                    <div className="flex flex-col gap-[16px]">
                                        {tripGroups.map(group => (
                                            <div key={group.id} onClick={() => setActiveGroupId(group.id)} className="bg-white border border-gray-200 rounded-[5px] p-4 flex items-center justify-between hover:border-[#3A82CE] hover:shadow-md transition cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-full bg-[#F0F6FC] flex items-center justify-center text-[#3A82CE] group-hover:bg-[#3A82CE] group-hover:text-white transition"><Layers className="w-5 h-5" /></div>
                                                    <div><h3 className="font-bold text-[18px] text-black">{group.name}</h3><p className="text-[14px] text-gray-500 mt-0.5">{group.regions.length} Provinces Selected</p></div>
                                                </div>
                                                <div className="flex items-center gap-2"><button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === group.id ? null : group.id); }} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50"><MoreVertical className="w-5 h-5" /></button></div>
                                                {/* Dropdown Menu */}
                                                {openMenuId === group.id && (
                                                    <div className="absolute right-10 mt-8 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                        <button onClick={(e) => { e.stopPropagation(); setActiveGroupId(group.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-50"><Edit3 className="w-4 h-4" /> Edit</button>
                                                        <button onClick={(e) => { e.stopPropagation(); handleDeleteGroupById(group.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        <button onClick={handleAddGroup} className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-[16px] font-medium text-[#3A82CE] border border-dashed border-[#3A82CE] rounded-[5px] hover:bg-[#F0F6FC] transition"><Plus className="w-5 h-5" /> Create Another Template</button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Edit Form
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6 pt-2">
                                {/* Image Upload */}
                                <div className="bg-white p-4 rounded-[5px] border border-gray-200 shadow-sm">
                                    <div className="flex justify-between items-center mb-3"><label className="text-[16px] font-bold text-black flex items-center gap-2"><ImageIcon className="w-4 h-4 text-[#3A82CE]" /> Trip Images ({currentImages.length}/10)</label></div>
                                    <div className="grid grid-cols-4 gap-2">
                                        {currentImages.map((img) => (<div key={img.id} className="relative aspect-square rounded-[5px] overflow-hidden border border-gray-200 group bg-gray-50"><img src={img.url} alt="img" className="w-full h-full object-cover transition group-hover:scale-105" /><button onClick={() => handleRemoveImage(img.id)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-50 hover:text-red-600"><X className="w-3 h-3" /></button></div>))}
                                        {currentImages.length < 10 && (<div className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:border-[#3A82CE] hover:bg-[#F0F6FC] transition group" onClick={() => fileInputRef.current?.click()}><div className="w-8 h-8 rounded-full bg-[#F0F6FC] flex items-center justify-center mb-1 group-hover:bg-[#3A82CE] transition"><Plus className="w-4 h-4 text-[#3A82CE] group-hover:text-white" /></div><span className="text-[10px] font-bold text-gray-500 group-hover:text-[#3A82CE]">Add</span></div>)}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                                </div>
                                {/* Inputs */}
                                <div className="space-y-4 bg-white p-4 rounded-[5px] border border-gray-200 shadow-sm">
                                    <div><label className="text-[16px] font-bold text-black flex items-center gap-2 mb-2"><LayoutTemplate className="w-4 h-4 text-[#3A82CE]" /> Template Name</label><input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full border border-gray-300 rounded-[5px] px-3 py-2.5 text-[16px] focus:ring-1 focus:ring-[#3A82CE] focus:border-[#3A82CE] outline-none transition" placeholder="e.g., Summer Vacation" /></div>
                                    <div><label className="text-[16px] font-bold text-black flex items-center gap-2 mb-2"><StickyNote className="w-4 h-4 text-[#3A82CE]" /> Note (Optional)</label><textarea rows={3} value={groupNote} onChange={(e) => setGroupNote(e.target.value)} className="w-full border border-gray-300 rounded-[5px] px-3 py-2.5 text-[16px] focus:ring-1 focus:ring-[#3A82CE] focus:border-[#3A82CE] outline-none resize-none transition" placeholder="Add details..." /></div>
                                </div>
                                {/* Region List */}
                                <div className="pt-2">
                                    <label className="text-[16px] font-bold text-black mb-3 block flex items-center gap-2"><MapPin className="w-4 h-4 text-[#3A82CE]" /> Selected Regions ({currentGroupRegions.length})</label>
                                    {currentGroupRegions.length > 0 ? (
                                        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin content-start pb-4">
                                            {currentGroupRegions.map(region => (<RegionItem key={region.name} region={region} statuses={tripStatuses} onUpdateStatus={(newId) => updateRegionStatus(region.name, newId)} onRemove={() => toggleRegion(region.name)} statusActions={{ onUpdate: handleUpdateStatus, onDelete: handleDeleteStatus, onAdd: handleAddStatus }} />))}
                                        </div>
                                    ) : (<div className="flex flex-col items-center justify-center py-8 bg-white border-2 border-dashed border-gray-200 rounded-[5px] text-center"><div className="w-12 h-12 bg-[#F0F6FC] rounded-full flex items-center justify-center mb-3"><MapPin className="w-6 h-6 text-[#3A82CE]" /></div><p className="text-[16px] font-medium text-black">No regions selected yet.</p><p className="text-[14px] text-gray-400 mt-1">Click regions on the map to add them.</p></div>)}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    {activeGroupId && (
                        <div className="mt-auto border-t border-gray-200 pt-4 flex-shrink-0">
                            <div className="flex gap-3 animate-in slide-in-from-bottom-2">
                                <button onClick={handleApply} disabled={isSaving} className="flex-1 bg-[#3A82CE] hover:bg-[#2c6cb0] text-white font-bold py-3 rounded-[5px] shadow-sm transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-[16px]">{isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Template"}</button>
                                <button onClick={() => handleDeleteGroupById(activeGroupId)} disabled={isSaving} className="px-5 py-3 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 font-bold rounded-[5px] transition disabled:opacity-50 flex items-center justify-center"><Trash2 className="w-5 h-5" /></button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}

function RegionItem({ region, statuses, onUpdateStatus, onRemove, statusActions }: RegionItemProps) {
    const [isOpen, setIsOpen] = useState(false);
    const currentStatus = statuses.find((s) => s.id === region.statusId) || statuses[0];

    return (
        <div className={`bg-white border rounded-xl transition-all duration-300 ${isOpen ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-gray-200 shadow-sm hover:border-blue-200'}`}>
            <div className="flex items-center justify-between p-3 cursor-pointer select-none" onClick={() => setIsOpen(!isOpen)}>
                <div className="flex items-center gap-3"><span className="text-sm font-bold text-gray-700">{region.name}</span></div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: currentStatus?.color }}></div>
                    <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="text-gray-400 hover:text-blue-500 transition">{isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</button>
                    <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition"><X className="w-4 h-4" /></button>
                </div>
            </div>
            {isOpen && (
                <div className="px-3 pb-3 pt-0 animate-in slide-in-from-top-2">
                    <div className="h-px bg-gray-100 w-full mb-3"></div>
                    <div className="grid grid-cols-[30px_1fr_40px_30px] gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 px-1"><div></div><div>Label</div><div>Color</div><div className="text-right">Action</div></div>
                    <div className="space-y-1.5">
                        {statuses.map((status) => (
                            <div key={status.id} className={`grid grid-cols-[30px_1fr_40px_30px] gap-2 items-center p-1.5 rounded-lg border transition-all cursor-pointer ${status.id === region.statusId ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-200' : 'bg-white border-gray-100 hover:border-gray-300'}`} onClick={() => onUpdateStatus(status.id)}>
                                <div className="flex items-center justify-center"><div className={`w-4 h-4 rounded-full border flex items-center justify-center ${status.id === region.statusId ? 'border-blue-500 bg-white' : 'border-gray-300'}`}>{status.id === region.statusId && <div className="w-2 h-2 rounded-full bg-blue-500"></div>}</div></div>
                                <div>
                                    <input type="text" value={status.label} onClick={(e) => e.stopPropagation()} onChange={(e) => statusActions.onUpdate(status.id, 'label', e.target.value)} style={{ width: `${Math.max(status.label.length, 1) + 2}ch` }} className="bg-transparent text-xs font-medium text-gray-700 outline-none border-b border-transparent focus:border-blue-300 focus:bg-white rounded px-1 transition h-6 min-w-[30px] max-w-full" />
                                </div>
                                <div className="relative w-5 h-5 rounded-full overflow-hidden border border-gray-200 shadow-sm mx-auto" onClick={(e) => e.stopPropagation()}><input type="color" value={status.color} onChange={(e) => statusActions.onUpdate(status.id, 'color', e.target.value)} className="absolute -top-1 -left-1 w-7 h-7 border-none cursor-pointer" /></div>
                                <div className="text-right"><button onClick={(e) => { e.stopPropagation(); statusActions.onDelete(status.id); }} disabled={statuses.length <= 1} className="text-gray-300 hover:text-red-500 transition disabled:opacity-30 disabled:hover:text-gray-300 p-1"><Trash2 className="w-3.5 h-3.5" /></button></div>
                            </div>
                        ))}
                    </div>
                    <button onClick={statusActions.onAdd} className="w-full mt-2 flex items-center justify-center gap-2 py-1.5 text-[10px] font-bold text-blue-500 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition"><Plus className="w-3 h-3" /> Add New Status</button>
                </div>
            )}
        </div>
    );
}