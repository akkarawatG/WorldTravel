"use client";

import { useState, use, useEffect, useMemo, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { ArrowLeft, LayoutTemplate, X, MapPin, ChevronDown, ChevronUp, Search, Trash2, Plus, Layers, Settings, StickyNote, Loader2, Check, Image as ImageIcon, MoreVertical, Edit3, Maximize2, Minimize2, GripVertical } from "lucide-react";
import dynamic from 'next/dynamic';

const COUNTRY_NAMES: Record<string, string> = {
    cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", us: "United States", gb: "United Kingdom", fr: "France",
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
    const handleRegionClick = (provinceName: string) => { if (activeGroupId) toggleRegion(provinceName); else alert("Please select a template to edit!"); };

    const regionColors = useMemo(() => {
        const mapColors: Record<string, string> = {};
        if (activeGroupId) { currentGroupRegions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); } 
        else if (previewGroupId) { const previewGroup = tripGroups.find(g => g.id === previewGroupId); previewGroup?.regions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }
        else { tripGroups.forEach(group => { group.regions.forEach(r => { const status = tripStatuses.find(s => s.id === r.statusId); if (status) mapColors[r.name] = status.color; }); }); }
        return mapColors;
    }, [tripGroups, tripStatuses, activeGroupId, previewGroupId, currentGroupRegions]);

    const selectedRegionNames = useMemo(() => currentGroupRegions.map(r => r.name), [currentGroupRegions]);

    return (
        <div className={`flex flex-col bg-[#F5F7FA] font-sans text-gray-800 h-screen overflow-hidden ${isFullscreen ? "fixed inset-0 z-[9999]" : "relative z-0"} ${isResizing ? "cursor-col-resize select-none" : ""}`}>

            {/* HEADER */}
            <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm z-20 flex-shrink-0">
                <div className="max-w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition"><ArrowLeft className="w-5 h-5 text-gray-600" /></button>
                        <div className="flex items-center gap-3">
                            <img src={`https://flagcdn.com/w40/${countryCode}.png`} alt={countryCode} className="w-8 h-6 rounded shadow-sm object-cover" />
                            <h1 className="text-xl font-bold text-gray-800 mr-2">{countryName}</h1>
                            <div className="relative hidden md:block">
                                <button onClick={() => { if (!activeGroupId) return; setIsRegionDropdownOpen(!isRegionDropdownOpen); setRegionSearchQuery(""); }} disabled={isLoadingRegions || !activeGroupId} className={`flex items-center gap-2 px-3 py-1.5 border rounded-md transition min-w-[200px] justify-between disabled:opacity-50 disabled:cursor-not-allowed ${activeGroupId ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-gray-50 border-gray-300 hover:bg-gray-100"}`}>
                                    <div className="flex items-center gap-2">
                                        <MapPin className={`w-4 h-4 ${activeGroupId ? "text-blue-600" : "text-gray-400"}`} />
                                        <span className="text-sm font-medium truncate max-w-[150px]">{isLoadingRegions ? "Loading..." : activeGroupId ? (currentGroupRegions.length > 0 ? `${currentGroupRegions.length} Regions` : "Select Regions") : "Select a Template First"}</span>
                                    </div>
                                    {isRegionDropdownOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {isRegionDropdownOpen && activeGroupId && (
                                    <div className="absolute top-full left-0 mt-2 w-[280px] max-h-[400px] bg-white border border-gray-200 rounded-lg shadow-xl z-20 animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                                        <div className="p-2 border-b border-gray-100 sticky top-0 bg-white z-10">
                                            <div className="relative"><Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" /><input type="text" placeholder="Search region..." value={regionSearchQuery} onChange={(e) => setRegionSearchQuery(e.target.value)} className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50" autoFocus /></div>
                                        </div>
                                        <div className="overflow-y-auto flex-1">
                                            {filteredRegions.length > 0 ? filteredRegions.map(region => (
                                                <button key={region} onClick={() => toggleRegion(region)} className={`w-full text-left px-4 py-2.5 text-sm transition flex items-center justify-between group border-b border-gray-50 last:border-none ${currentGroupRegions.some(r => r.name === region) ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}>
                                                    {region}
                                                    {currentGroupRegions.some(r => r.name === region) && <Check className="w-4 h-4 text-blue-600" />}
                                                </button>
                                            )) : <div className="px-4 py-8 text-sm text-gray-400 text-center flex flex-col items-center"><MapPin className="w-6 h-6 mb-2 opacity-50" />No regions found</div>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push('/mytrips')} className="flex items-center gap-2 px-4 py-2 border-2 border-blue-400 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition text-sm">
                            <LayoutTemplate className="w-4 h-4" /> My Templates
                        </button>
                        <div className="w-px h-8 bg-gray-300 mx-1"></div>
                        <button onClick={() => setIsFullscreen(!isFullscreen)} className={`p-2 rounded-lg transition border ${isFullscreen ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`} title={isFullscreen ? "Show Navbar" : "Fullscreen"}>
                            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* BODY */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 bg-white flex items-center justify-center p-4 overflow-hidden relative">
                    <div className="w-full h-full max-w-5xl">
                        <DynamicMap
                            countryCode={countryCode}
                            regionColors={regionColors}
                            selectedRegions={activeGroupId ? selectedRegionNames : []}
                            onRegionClick={handleRegionClick}
                        />
                        {(!activeGroupId && !previewGroupId) && (
                            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-gray-200 p-3 rounded-lg shadow-lg flex items-center gap-3 z-10 animate-in fade-in">
                                <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><Layers className="w-4 h-4" /></div>
                                <div><p className="text-sm font-bold text-gray-800">Global View</p><p className="text-xs text-gray-500">Showing all templates.</p></div>
                            </div>
                        )}
                        {previewGroupId && (
                             <div className="absolute top-4 left-4 bg-blue-50 border border-blue-200 p-3 rounded-lg shadow-lg flex items-center gap-3 z-10 animate-in slide-in-from-left-2">
                                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-sm"><Search className="w-4 h-4" /></div>
                                <div><p className="text-sm font-bold text-blue-800">Previewing Map</p><p className="text-xs text-blue-600">{tripGroups.find(g => g.id === previewGroupId)?.name}</p></div>
                                <button onClick={() => setPreviewGroupId(null)} className="ml-2 text-blue-400 hover:text-blue-700 transition"><X className="w-4 h-4" /></button>
                             </div>
                        )}
                    </div>
                </div>

                {/* RESIZER HANDLE */}
                <div className={`w-1 bg-gray-200 hover:bg-blue-400 cursor-col-resize z-40 transition-colors flex items-center justify-center group ${isResizing ? "bg-blue-500" : ""}`} onMouseDown={startResizing}>
                    <div className="h-8 w-4 bg-white border border-gray-300 rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3 h-3 text-gray-400" />
                    </div>
                </div>

                {/* RIGHT PANEL */}
                <div 
                    ref={sidebarRef}
                    className="bg-white border-l border-gray-200 shadow-2xl flex flex-col h-full z-30 md:static flex-shrink-0"
                    style={{ width: sidebarWidth, minWidth: 400 }} // ✅ Fix: บังคับ minWidth ใน CSS ด้วย
                >
                    <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white h-[72px] flex-shrink-0">
                        <div className="flex items-center gap-2 text-gray-800 font-bold text-lg overflow-hidden">
                            {activeGroupId ? (
                                <>
                                    <MapPin className="w-5 h-5 text-red-500 fill-current flex-shrink-0" />
                                    <div className="flex flex-col">
                                        <span className="truncate leading-tight text-base" style={{ maxWidth: sidebarWidth - 150 }}>{activeGroup?.name || "Untitled Group"}</span>
                                        {currentGroupRegions.length > 0 && <span className="text-[10px] text-gray-500 font-normal truncate max-w-[200px]">{currentGroupRegions.length} Regions Selected</span>}
                                    </div>
                                </>
                            ) : <span className="text-gray-500 flex items-center gap-2 text-base font-medium"><Layers className="w-5 h-5" /> Trip Templates</span>}
                        </div>
                        <button onClick={handleAddGroup} className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-sm transition tooltip" title="Add New Group"><Plus className="w-5 h-5" /></button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
                        {!activeGroupId ? (
                            <div className="space-y-4">
                                {tripGroups.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[300px] text-center text-gray-400 gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center"><Layers className="w-10 h-10 text-gray-300" /></div>
                                        <div><p className="text-lg font-bold text-gray-600">No Trip Templates Yet</p><p className="text-sm mb-4">Create a template to start selecting regions.</p><button onClick={handleAddGroup} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition">Create First Template</button></div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col gap-3">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Your Templates</p>
                                        {tripGroups.map(group => (
                                            <div key={group.id} onClick={() => setPreviewGroupId(previewGroupId === group.id ? null : group.id)} className={`p-4 bg-white border rounded-xl transition flex justify-between items-center group relative cursor-pointer ${previewGroupId === group.id ? "border-blue-500 ring-1 ring-blue-500 shadow-md" : "border-gray-200 hover:border-blue-300 hover:shadow-md"}`}>
                                                <div className="flex items-center gap-3 flex-1">
                                                    <div className="flex -space-x-2 overflow-hidden">
                                                        {group.images && group.images.length > 0 ? (
                                                            group.images.slice(0, 3).map((img, i) => (
                                                                <img key={i} src={img} alt="cover" className="w-8 h-8 rounded-full object-cover border-2 border-white" />
                                                            ))
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center border-2 border-white text-gray-400"><ImageIcon className="w-3 h-3" /></div>
                                                        )}
                                                    </div>
                                                    <div><h4 className="font-bold text-gray-800 text-sm">{group.name}</h4><p className="text-xs text-gray-500">{group.regions.length} Regions</p></div>
                                                </div>
                                                <div className="relative">
                                                    <button onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === group.id ? null : group.id); }} className="p-1 hover:bg-gray-100 rounded-full transition text-gray-400"><MoreVertical className="w-5 h-5" /></button>
                                                    {openMenuId === group.id && (
                                                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                                            <button onClick={(e) => { e.stopPropagation(); setActiveGroupId(group.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 flex items-center gap-2 border-b border-gray-50"><Edit3 className="w-4 h-4" /> Edit</button>
                                                            <button onClick={(e) => { e.stopPropagation(); handleDeleteGroupById(group.id); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-4 h-4" /> Delete</button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                                <button onClick={() => setActiveGroupId(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 mb-2 transition"><ArrowLeft className="w-4 h-4" /> Back to Templates</button>
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="text-xs font-bold text-gray-600 flex items-center gap-1"><ImageIcon className="w-3 h-3" /> Images ({currentImages.length}/10)</label>
                                        {currentImages.length > 0 && <span className="text-[10px] text-gray-400">Supported: jpg, png</span>}
                                    </div>
                                    <div className="grid grid-cols-4 gap-2 mb-2">
                                        {currentImages.map((img) => (
                                            <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-gray-50">
                                                <img src={img.url} alt="img" className="w-full h-full object-cover transition group-hover:scale-105" />
                                                <button onClick={() => handleRemoveImage(img.id)} className="absolute top-1 right-1 bg-white/90 p-1 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition shadow-sm hover:bg-red-50 hover:text-red-600"><X className="w-3 h-3" /></button>
                                            </div>
                                        ))}
                                        {currentImages.length < 10 && (
                                            <div className="aspect-square bg-white border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition group" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mb-1 group-hover:bg-blue-100 transition"><Plus className="w-4 h-4 text-blue-500" /></div>
                                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-blue-500">Add</span>
                                            </div>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" multiple className="hidden" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2"><LayoutTemplate className="w-3 h-3" /> Template Name</label>
                                    <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-600 flex items-center gap-1 mb-2"><StickyNote className="w-3 h-3" /> Note (Optional)</label>
                                    <textarea rows={2} value={groupNote} onChange={(e) => setGroupNote(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="Add details about this trip..." />
                                </div>
                                
                                {/* ✅ Grid List for Regions */}
                                <div className="pt-2 border-t border-gray-100">
                                    <label className="text-xs font-bold text-gray-600 mb-3 block">Regions Selected ({currentGroupRegions.length})</label>
                                    {currentGroupRegions.length > 0 ? (
                                        // ⬇️ ใช้ minmax(300px, 1fr) เพื่อให้รองรับ Panel ขั้นต่ำ 400px ได้พอดี 1 col และแตกเป็น 2 col เมื่อขยาย
                                        <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 max-h-[50vh] overflow-y-auto pr-1 scrollbar-thin content-start">
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
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 bg-gray-50 border border-dashed border-gray-200 rounded-xl text-center">
                                            <MapPin className="w-8 h-8 text-gray-300 mb-2" />
                                            <p className="text-sm text-gray-500">No regions selected.</p>
                                            <p className="text-xs text-gray-400">Click on the map to add regions.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {activeGroupId && (
                        <div className="p-6 border-t border-gray-100 bg-white mt-auto flex-shrink-0 animate-in slide-in-from-bottom-2 flex gap-3">
                            <button onClick={handleApply} disabled={isSaving} className="flex-1 bg-[#039BE5] hover:bg-blue-600 text-white font-bold py-3 rounded-xl shadow-sm transition transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">{isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Template"}</button>
                            <button onClick={() => handleDeleteGroupById(activeGroupId)} disabled={isSaving} className="px-4 py-3 text-red-500 bg-red-50 hover:bg-red-100 hover:text-red-600 font-bold rounded-xl transition disabled:opacity-50"><Trash2 className="w-5 h-5" /></button>
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