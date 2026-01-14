"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, MouseEvent } from "react";
import { MapPin, Clock, Star, ArrowLeft, ExternalLink, Sun, X, ChevronLeft, ChevronRight, Lightbulb, Search, Plus } from "lucide-react";

// ✅ Import Service & Types
import { getPlaceById, getNearbyPlaces } from "@/services/placeService";
import { Place } from "@/types/place";

// ✅ Import Mock Data (Fallback)
import { ATTRACTIONS_DATA as MOCK_ATTRACTIONS } from "../../data/attractionsData";

// ==========================================
// 1. MAPPINGS (Standardized Category Logic)
// ==========================================

// Mapping สำหรับ Filter Keywords
const CATEGORY_MATCHING_KEYWORDS: Record<string, string[]> = {
    "Mountains": ["mountain", "mountains", "peak", "volcano", "hill", "doi"],
    "National parks": ["national_park", "national_parks", "nature_reserve", "forest"],
    "Islands": ["island", "islands", "islet", "beach", "beaches", "coast", "sea"],
    "Lakes / Rivers": ["lake", "lakes", "river", "rivers", "waterfall", "waterfalls", "canal", "dam", "reservoir"],
    "Hot Spring": ["hot_spring", "hot_springs", "onsen", "spring"],
    "Gardens": ["garden", "gardens", "botanical", "flora"],
    "Temples": ["temple", "temples", "shrine", "wat", "pagoda", "buddhist"],
    "Church / Mosque": ["church", "mosque", "cathedral", "chapel", "masjid"],
    "Ancient ruins": ["ruin", "ruins", "archaeological", "ancient", "historic_site", "historical_park"],
    "Castles": ["castle", "castles", "fort", "palace", "fortress"],
    "Old towns": ["old_town", "old_towns", "historic_district", "heritage", "ancient_city"],
    "Museums": ["museum", "museums", "art_gallery", "exhibition"],
    "Monuments": ["monument", "monuments", "memorial", "statue"],
    "Viewpoints": ["viewpoint", "viewpoints", "observation", "scenic", "view"],
    "Skyscrapers": ["skyscraper", "skyscrapers", "tower", "high_rise", "building"],
    "Bridges": ["bridge", "bridges", "viaduct"],
    "Landmarks": ["landmark", "landmarks", "attraction", "iconic"],
    "City squares": ["square", "squares", "plaza"],
    "Markets": ["market", "markets", "bazaar"],
    "Night Markets": ["night_market", "night_markets", "walking_street"],
    "Shopping Malls": ["mall", "malls", "department_store", "shopping_center"],
    "Flea market": ["flea", "second_hand"],
    "Souvenir shops": ["souvenir", "gift", "craft", "otop"],
    "Street food": ["street_food", "food_stall", "hawker"],
    "Local restaurants": ["restaurant", "restaurants", "diner", "eatery"],
    "Cafes": ["cafe", "cafes", "coffee", "tea"],
    "Famous food spots": ["famous_food", "michelin", "must_try"],
    "Theme parks": ["theme_park", "theme_parks", "amusement", "water_park"],
    "Zoos / Aquariums": ["zoo", "zoos", "aquarium", "aquariums", "wildlife", "safari"],
    "Nightlife": ["nightlife", "bar", "bars", "club", "clubs", "pub"],
    "Spas / Wellness": ["spa", "spas", "massage", "wellness", "onsen"]
};

// Mapping สำหรับ Display
const CATEGORY_DISPLAY_MAP: Record<string, string> = {
    "nature_outdoors": "Nature & Outdoors",
    "mountains": "Mountains", "mountain": "Mountains", "volcanoes": "Mountains", "nature_mountains": "Mountains",
    "national_parks": "National parks", "national_park": "National parks",
    "islands": "Islands", "island": "Islands", "beaches": "Islands", "beach": "Islands", "beaches_islands": "Islands",
    "lakes_rivers": "Lakes / Rivers", "lake": "Lakes / Rivers", "river": "Lakes / Rivers", "waterfall": "Lakes / Rivers", "waterfalls": "Lakes / Rivers",
    "hot_spring": "Hot Spring", "hot_springs": "Hot Spring",
    "gardens": "Gardens", "garden": "Gardens",
    "history_culture": "History & Culture",
    "temples": "Temples", "temple": "Temples", "wat": "Temples",
    "church_mosque": "Church / Mosque", "church": "Church / Mosque", "mosque": "Church / Mosque",
    "ancient_ruins": "Ancient ruins", "ruins": "Ancient ruins", "historical_park": "Ancient ruins",
    "castles": "Castles", "castle": "Castles",
    "old_towns": "Old towns", "old_town": "Old towns",
    "museums": "Museums", "museum": "Museums",
    "monuments": "Monuments", "monument": "Monuments",
    "landmarks_views": "Landmarks & Views",
    "viewpoints": "Viewpoints", "viewpoint": "Viewpoints",
    "skyscrapers": "Skyscrapers", "skyscraper": "Skyscrapers",
    "bridges": "Bridges", "bridge": "Bridges",
    "landmarks": "Landmarks", "landmark": "Landmarks",
    "city_squares": "City squares", "square": "City squares",
    "shopping_lifestyle": "Shopping & Lifestyle",
    "markets": "Markets", "market": "Markets",
    "night_markets": "Night Markets", "night_market": "Night Markets",
    "shopping_malls": "Shopping Malls", "shopping_mall": "Shopping Malls", "mall": "Shopping Malls",
    "flea_market": "Flea market",
    "souvenir_shops": "Souvenir shops", "souvenir_shop": "Souvenir shops", "souvenir": "Souvenir shops",
    "food_dining": "Food & Dining",
    "street_food": "Street food",
    "local_restaurants": "Local restaurants", "restaurant": "Local restaurants",
    "cafes": "Cafes", "cafe": "Cafes",
    "famous_food_spots": "Famous food spots", "famous_food": "Famous food spots",
    "entertainment": "Entertainment",
    "theme_parks": "Theme parks", "theme_park": "Theme parks",
    "zoos_aquariums": "Zoos / Aquariums", "zoo": "Zoos / Aquariums", "aquarium": "Zoos / Aquariums",
    "nightlife": "Nightlife",
    "spas_wellness": "Spas / Wellness", "spa": "Spas / Wellness"
};

function DetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const id = searchParams.get("id");

    // State
    const [place, setPlace] = useState<Place | null>(null);
    const [nearbyPlaces, setNearbyPlaces] = useState<Place[]>([]);
    const [morePictures, setMorePictures] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    // Hero Slider State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Modal State
    const [showModal, setShowModal] = useState(false);
    const [galleryQueue, setGalleryQueue] = useState<{ url: string }[]>([]);

    // Review States
    const [activeStarFilter, setActiveStarFilter] = useState("All");
    const [reviewPage, setReviewPage] = useState(1);

    // --- DATA FETCHING LOGIC ---
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setIsLoading(true);
            console.log("--------------------------------------------------");
            console.log("📍 [Page] Start fetching detail for ID:", id);

            try {
                // 1. Fetch Main Place Data
                const dbPlace = await getPlaceById(id);
                let currentPlaceData: Place | null = null;

                if (dbPlace) {
                    console.log("✅ [Page] Found in Supabase");

                    // ✅ FIX: Force Mapping เพื่อแก้ปัญหาชื่อ field ไม่ตรง หรือเป็น null
                    // ทำเหมือนหน้า Explore เพื่อความชัวร์
                    currentPlaceData = {
                        ...dbPlace,
                        province_state: dbPlace.province_state || "", // ถ้า null ให้เป็นว่าง
                        country: dbPlace.country || "",
                        // จัดการรูปภาพให้เป็น Array of Strings ให้หมด หรือ Array of Objects ตาม Interface
                        images: Array.isArray(dbPlace.images)
                            ? dbPlace.images.map((img: any) => typeof img === 'string' ? img : img.url)
                            : [],
                        // Default tips logic
                        travel_tips: (dbPlace.travel_tips && Object.keys(dbPlace.travel_tips).length > 0)
                            ? dbPlace.travel_tips
                            : {
                                footwear: "We recommend comfortable walking shoes.",
                                outfit: "Light clothing recommended."
                            }
                    } as Place;

                } else {
                    console.warn("⚠️ [Page] Not found in Supabase, trying Mock Data...");
                    const mockPlace = MOCK_ATTRACTIONS.find((item) => String(item.id) === String(id));

                    if (mockPlace) {
                        console.log("✅ [Page] Found in Mock Data");
                        const normalizeMockImages = (imgs: any) => {
                            if (!imgs) return [];
                            if (Array.isArray(imgs)) return imgs.map(img => typeof img === 'string' ? { url: img } : { url: img.url || "" }).filter(i => i.url);
                            return [];
                        };

                        currentPlaceData = {
                            ...mockPlace,
                            id: String(mockPlace.id),
                            province_state: mockPlace.location.province_state,
                            country: mockPlace.location.country,
                            continent: mockPlace.location.continent,
                            location: mockPlace.location,
                            description_long: (mockPlace as any).description || "No description.",
                            opening_hours: mockPlace.opening_hours_text,
                            best_season: mockPlace.best_season_to_visit,
                            formatted_address: `${mockPlace.location.province_state}, ${mockPlace.location.country}`,
                            google_maps_url: `http://googleusercontent.com/maps.google.com/`,
                            price_detail: (mockPlace as any).price_detail || "Free entry",
                            images: normalizeMockImages(mockPlace.images),
                            reviews: (mockPlace as any).reviews || [],
                            travel_tips: { footwear: "Comfortable shoes.", outfit: "Casual." }
                        } as unknown as Place;
                    }
                }

                if (currentPlaceData) {
                    setPlace(currentPlaceData);

                    // --- 2. PREPARE MORE PICTURES ---
                    const reviewImages = (currentPlaceData as any).reviews?.reduce((acc: string[], r: any) => {
                        return r.images ? [...acc, ...r.images] : acc;
                    }, []) || [];

                    if (reviewImages.length > 0) {
                        setMorePictures(reviewImages);
                    } else {
                        const placeImages = currentPlaceData.images?.map(img => typeof img === 'string' ? img : (img as any).url) || [];
                        const demoImages = placeImages.length > 0 ? [...placeImages, ...placeImages, ...placeImages].slice(1, 10) : [];
                        setMorePictures(demoImages);
                    }

                    // --- 3. FETCH NEARBY PLACES ---
                    const lat = (currentPlaceData as any).lat || (currentPlaceData as any).location?.lat;
                    const lon = (currentPlaceData as any).lon || (currentPlaceData as any).location?.lon;

                    console.log(`📍 [Page] Checking Coordinates for Nearby: Lat=${lat}, Lon=${lon}`);

                    const getMockNearby = () => {
                        console.log("🛠 [Page] Using Mock Data for Nearby Places");
                        return MOCK_ATTRACTIONS
                            .filter(p => String(p.id) !== String(currentPlaceData?.id))
                            .slice(0, 5)
                            .map(p => ({
                                ...p,
                                id: String(p.id),
                                images: [{ url: typeof p.images[0] === 'string' ? p.images[0] : (p.images[0] as any).url }],
                                province_state: p.location.province_state,
                                country: p.location.country,
                                rating: 4.5
                            })) as unknown as Place[];
                    };

                    if (lat && lon) {
                        try {
                            const searchCountry = currentPlaceData.country || null;
                            const nearby = await getNearbyPlaces(lat, lon, currentPlaceData.id, 500, searchCountry);

                            if (nearby && nearby.length > 0) {
                                console.log(`✅ [Page] Nearby Places Found: ${nearby.length}`);
                                setNearbyPlaces(nearby);
                            } else {
                                console.warn("⚠️ [Page] RPC returned empty array. Switching to Fallback.");
                                setNearbyPlaces(getMockNearby());
                            }
                        } catch (e) {
                            console.error("💥 [Page] Nearby Fetch Exception:", e);
                            setNearbyPlaces(getMockNearby());
                        }
                    } else {
                        console.warn("⚠️ [Page] No Lat/Lon available. Cannot call RPC. Switching to Fallback.");
                        setNearbyPlaces(getMockNearby());
                    }

                } else {
                    console.error("❌ [Page] Place Not Found (Both DB and Mock)");
                    setError(true);
                }

            } catch (err) {
                console.error("💥 [Page] Critical Error:", err);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // --- DERIVED DATA ---
    const rawImages = place?.images || [];
    const allImages = rawImages.length > 0
        ? rawImages.map(img => (typeof img === 'object' && 'url' in img ? img : { url: img as string }))
        : [{ url: "https://via.placeholder.com/1200x600?text=No+Image" }];

    const extendedImages = allImages.length > 1
        ? [...allImages, allImages[0]]
        : allImages;

    const currentReviews = (place as any)?.reviews || [];

    const filteredReviews = currentReviews.filter((review: any) => {
        if (activeStarFilter === "All") return true;
        const starValue = parseInt(activeStarFilter.split(" ")[0]);
        return review.rating === starValue;
    });

    // --- HELPER: GET DISPLAY CATEGORIES ---
    const getDisplayCategories = (tags: string[] = []) => {
        const displayCategories: string[] = [];
        tags.forEach(tag => {
            const lowerTag = tag?.toLowerCase().trim();
            // 1. Direct Map
            if (CATEGORY_DISPLAY_MAP[lowerTag]) {
                displayCategories.push(CATEGORY_DISPLAY_MAP[lowerTag]);
                return;
            }
            // 2. Keyword Match
            let foundMatch = false;
            for (const [displayTitle, keywords] of Object.entries(CATEGORY_MATCHING_KEYWORDS)) {
                if (keywords.some(k => lowerTag.split(/[\s_]+/).includes(k.toLowerCase()))) {
                    displayCategories.push(displayTitle);
                    foundMatch = true;
                    break;
                }
            }
            // 3. Fallback
            if (!foundMatch) {
                displayCategories.push(tag?.replace(/_/g, " ") || "Attraction");
            }
        });
        // Remove duplicates
        return Array.from(new Set(displayCategories));
    };

    const renderTips = () => {
        const tips = place?.travel_tips as any;
        if (!tips) return <p className="font-inter text-[14px] text-[#212121] leading-tight">No tips available.</p>;
        if (typeof tips === 'string') return <p className="font-inter text-[14px] text-[#212121] leading-tight">{tips}</p>;

        const footwear = tips.footwear || tips.shoes || tips.general;
        const outfit = tips.outfit_recommendation || tips.outfit || tips.clothing;

        if (!footwear && !outfit) {
            return <p className="font-inter text-[14px] text-[#212121] leading-tight">No specific recommendations available.</p>;
        }

        return (
            <>
                {footwear && (
                    <p className="font-inter text-[14px] text-[#212121] leading-tight mb-3">
                        {footwear}
                    </p>
                )}
                {outfit && (
                    <p className="font-inter text-[14px] text-[#212121] leading-tight">
                        <span className="font-bold">Outfit: </span>
                        {outfit}
                    </p>
                )}
            </>
        );
    };

    // --- EFFECT: HERO SLIDER AUTO PLAY ---
    useEffect(() => {
        if (allImages.length <= 1 || showModal) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => prev + 1);
        }, 10000);
        return () => clearInterval(interval);
    }, [allImages.length, showModal]);

    // --- EFFECT: HERO SLIDER INFINITE LOOP ---
    useEffect(() => {
        if (currentImageIndex === extendedImages.length - 1) {
            const timeout = setTimeout(() => {
                setIsTransitioning(false);
                setCurrentImageIndex(0);
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setIsTransitioning(true);
                    });
                });
            }, 700);
            return () => clearTimeout(timeout);
        }
    }, [currentImageIndex, extendedImages.length]);


    // --- HANDLERS (MODAL LOGIC) ---
    const openModal = () => {
        const currentIndex = currentImageIndex >= allImages.length ? 0 : currentImageIndex;
        const rotatedQueue = [
            ...allImages.slice(currentIndex),
            ...allImages.slice(0, currentIndex)
        ];
        setGalleryQueue(rotatedQueue);
        setShowModal(true);
    };

    const nextModalImage = (e?: MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        setGalleryQueue((prev) => {
            if (prev.length <= 1) return prev;
            const [first, ...rest] = prev;
            return [...rest, first];
        });
    };

    const prevModalImage = (e?: MouseEvent<HTMLButtonElement>) => {
        e?.stopPropagation();
        setGalleryQueue((prev) => {
            if (prev.length <= 1) return prev;
            const last = prev[prev.length - 1];
            const rest = prev.slice(0, -1);
            return [last, ...rest];
        });
    };

    const clickThumbnail = (indexInQueue: number) => {
        if (indexInQueue === 0) return;
        setGalleryQueue((prev) => {
            const newQueue = [
                ...prev.slice(indexInQueue),
                ...prev.slice(0, indexInQueue)
            ];
            return newQueue;
        });
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;

    if (error || !place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500">
                <h2 className="text-xl font-bold mb-2">Attraction Not Found</h2>
                <button onClick={() => router.back()} className="text-blue-500 hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </div>
        );
    }

    // Modal Display Logic
    const mainImage = galleryQueue[0] || { url: "" };
    const thumbnails = galleryQueue.slice(1, 7);

    // ✅ Get Display Categories for this place
    const displayTags = getDisplayCategories(place.category_tags || []);

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20 relative">

            {/* MODAL POPUP SECTION */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white flex flex-col z-10 overflow-hidden shadow-2xl rounded-[16px]"
                        style={{ width: '835px', height: '624px' }}
                    >
                        {/* Header */}
                        <div className="w-[835px] h-[103px] flex justify-between items-center bg-white border-[2px] border-[#EEEEEE] rounded-tl-[8px] rounded-tr-[8px] pt-[32px] pr-[64px] pb-[32px] pl-[65px] shrink-0">
                            <div className="w-[623px] h-[39px] flex items-center gap-[16px]">
                                <h3 className="font-Inter font-semibold text-[32px] text-[#194473] leading-[100%] truncate">
                                    {place.name}
                                </h3>
                                <div className="w-[172px] h-[24px] flex items-center gap-[8px] flex-shrink-0">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={24} className={`${star <= Math.round(place.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                        ))}
                                    </div>
                                    <span className="font-Inter font-normal text-[20px] leading-[100%] text-[#212121]">
                                        ({place.rating || 0})
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-[24px] h-[24px] rounded-[30px] bg-[#616161] hover:bg-[#4a4a4a] flex items-center justify-center gap-[10px] text-white transition-colors">
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Body Container */}
                        <div className="w-[835px] h-[521px] flex flex-col items-center justify-center bg-white border-l-[2px] border-r-[2px] border-b-[2px] border-[#EEEEEE] rounded-bl-[8px] rounded-br-[8px] pb-[64px]">
                            <div className="w-[707px] h-[393px] flex flex-col border border-[#C2DCF3] rounded-[8px] overflow-hidden bg-white">
                                <div className="relative w-full flex-1 flex-shrink-0 overflow-hidden group bg-gray-50">
                                    <button onClick={prevModalImage} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[32px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center text-white transition-all shadow-sm cursor-pointer">
                                        <ChevronLeft size={20} strokeWidth={2.5} />
                                    </button>
                                    <img src={mainImage.url} alt="Gallery Main" className="w-full h-full object-cover transition-opacity duration-300" />
                                    <button onClick={nextModalImage} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[32px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center text-white transition-all shadow-sm cursor-pointer">
                                        <ChevronRight size={20} strokeWidth={2.5} />
                                    </button>
                                </div>
                                <div className="w-[707px] h-[84px] bg-white flex items-center justify-center shrink-0 border-t border-[#C2DCF3]">
                                    <div className="flex items-center w-full justify-between px-2 gap-[10px]">
                                        {thumbnails.map((img, idx) => (
                                            <div key={`${img.url}-${idx}`} onClick={() => clickThumbnail(idx + 1)} className="relative h-[64px] w-[105px] cursor-pointer rounded-lg overflow-hidden transition-all duration-300 border border-transparent hover:opacity-100 opacity-60 hover:scale-105 flex-shrink-0">
                                                <img src={img.url} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                        {Array.from({ length: Math.max(0, 6 - thumbnails.length) }).map((_, i) => (
                                            <div key={`empty-${i}`} className="h-[64px] w-[105px] bg-gray-50 rounded-lg flex-shrink-0 border border-gray-100" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Section */}
            <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
                <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span>{place.continent}</span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.country}`)}>
                        {place.country}
                    </span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.country}&search=${place.province_state}`)}>
                        {place.province_state || place.country /* Fallback display */}
                    </span>/
                    <span className="truncate max-w-[200px] md:max-w-none text-[#101828] hover:underline cursor-pointer">{place.name}</span>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="gap-[32px] mt-8">
                <div className="gap-6">
                    <div className="max-w-[1440px] mx-auto px-[156px] ">
                        <h1 className="font-inter font-bold text-[48px] leading-[100%] tracking-normal text-[#194473] mt-4">
                            {place.name}
                        </h1>
                    </div>

                    {/* HERO IMAGE */}
                    <div className="w-full h-[414px] bg-[#DEECF9] mt-6">
                        <div className="w-full max-w-[1440px] h-[414px] mx-auto flex justify-center">
                            <div className="w-full h-[445px] flex flex-col gap-[16px] px-[156px]">
                                <div className="relative w-full h-[413px] bg-black overflow-hidden group flex-shrink-0 shadow-sm cursor-pointer"
                                    onClick={openModal}
                                >
                                    <div className={`flex h-full ease-in-out ${isTransitioning ? 'transition-transform duration-700' : ''}`} style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                        {extendedImages.map((img, index) => (
                                            <div key={index} className="min-w-full h-full flex-shrink-0 relative group-hover:opacity-90 transition-opacity">
                                                <img src={img.url} alt={`Slide ${index}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                    <span className="text-white opacity-0 group-hover:opacity-100 bg-black/50 px-4 py-2 rounded-full text-sm font-semibold transition-opacity">
                                                        Click to view gallery
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-[1440px] mx-auto px-[156px] mt-8">
                    <div className="grid grid-cols-1 lg:grid-cols-[648px_456px] gap-6">
                        {/* LEFT COLUMN */}
                        <div className="flex flex-col gap-8">
                            {/* Width: 631px, Gap: 24px (ตาม Figma) */}
                            <div className="w-[631px] flex flex-col gap-[24px]">
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473]">
                                    About
                                </h2>
                                {/* ลบ mt-6 ออก เพราะใช้ gap-24 ของแม่แล้ว */}
                                <p className="font-inter font-normal text-[16px] leading-normal tracking-normal text-left text-[#212121]">
                                    {place.description_long || place.description_short || "No description available."}
                                </p>
                            </div>

                            <section>
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473] mb-6">
                                    Best Season to Visit
                                </h2>
                                <div className="w-[631px] rounded-[8px] overflow-hidden border border-[#EF9A9A]">
                                    <div className="w-full h-[40px] flex items-center px-4 gap-2" style={{ backgroundColor: '#E57373' }}>
                                        <Sun size={20} className="text-white" />
                                        <span className="font-inter font-semibold text-[16px] text-white">Recommended Season</span>
                                    </div>
                                    <div className="w-full min-h-[50px] flex flex-col justify-center px-4 py-3" style={{ backgroundColor: '#FFEBEE' }}>
                                        <div className="flex gap-1 items-start"> {/* ใช้ Flex เพื่อให้คำว่า Suggest แยกกับเนื้อหาบรรทัดอื่นๆ */}
                                            <span className="font-semibold text-[#EF6C00] whitespace-nowrap">Suggest: </span>
                                            <p className="font-inter text-[14px] text-left text-[#212121] leading-relaxed whitespace-pre-line">
                                                {place.best_season
                                                    ? place.best_season
                                                        .replace(/;|and/gi, '') // 1. ตัด ; และคำว่า and ออก (ไม่สนตัวพิมพ์เล็ก-ใหญ่)
                                                        .replace(/\s+/g, ' ')   // 2. ปรับช่องว่างที่อาจเกินมาจากการตัดให้เหลือ 1 ช่อง
                                                        .replace(/(?<!^)(Summer|Winter|Spring|Autumn|Fall|Rainy|Dry|Monsoon)/gi, '\n$1') // 3. ขึ้นบรรทัดใหม่หน้าฤดูกาล
                                                        .trim() // 4. ตัดช่องว่างหน้าและหลังสุดทิ้ง
                                                    : "Check local weather forecast before visiting."}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-[631px] min-h-[107px] mt-4 flex flex-col justify-center gap-[5px] bg-white border border-[#90CAF9] rounded-[8px] px-[16px] py-[16px]">
                                    <div className="w-[73px] h-[24px] flex items-center gap-[10px] mb-2">
                                        <Lightbulb size={24} className="text-[#2196F3]" />
                                        <h3 className="font-inter font-bold text-[18px] leading-[100%] tracking-[0] text-[#212121]">Tips</h3>
                                    </div>
                                    {renderTips()}
                                </div>
                            </section>

                            <section>
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473] mb-6">Reviews</h2>
                                <div className="flex flex-col gap-4 mb-4">
                                    <div className="relative w-full">
                                        <div className="flex items-center w-[631px] h-[31px] gap-[8px] px-[8px] py-[4px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] transition">
                                            <Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" />
                                            <div className="flex items-center w-[583px] h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px]">
                                                <input type="text" placeholder="Search" className="w-full h-full outline-none font-inter font-[400] text-[12px] leading-[100%] tracking-[0] text-gray-700 placeholder-gray-400" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex w-[631px] h-[25px] gap-[32px] items-center">
                                        {["All", "1 Star", "2 Star", "3 star", "4 Star", "5 Star"].map((filter) => (
                                            <button key={filter} onClick={() => setActiveStarFilter(filter)} className={`w-[58px] h-[25px] flex items-center justify-center rounded-[4px] text-[12px] font-inter font-[400] transition-colors leading-none border ${activeStarFilter === filter ? "bg-[#0D47A1] text-white border-[#90CAF9]" : "bg-[#757575] text-white border-transparent hover:bg-gray-600"}`}>
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-4 mt-6">
                                    {filteredReviews.length > 0 ? (
                                        filteredReviews.map((review: any) => (
                                            <div key={review.id} className="w-[631px] bg-white rounded-[8px] overflow-hidden shadow-sm border border-[#E0E0E0]">
                                                <div className="h-[32px] bg-[#9E9E9E] flex items-center px-3 gap-2">
                                                    <img src={review.avatar} alt={review.name} className="w-6 h-6 rounded-full border border-white object-cover" />
                                                    <span className="font-inter font-bold text-[16px] text-white">{review.name}</span>
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-[12px] text-[#9E9E9E] font-inter">{review.date}</span>
                                                        <div className="flex items-center">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star key={star} size={14} className={`${star <= review.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                                            ))}
                                                            <span className="text-[12px] text-[#212121] ml-1">({review.rating})</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[14px] text-[#212121] font-inter leading-relaxed mb-3">{review.comment}</p>
                                                    {review.images && (
                                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                                            {review.images.map((img: string, idx: number) => (
                                                                <img key={idx} src={img} alt={`Review image ${idx}`} className="w-[60px] h-[60px] object-cover rounded-[4px] border border-[#E0E0E0] hover:opacity-90 cursor-pointer" />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-[631px] py-8 text-center text-gray-500 bg-gray-50 rounded-[8px] border border-gray-200">
                                            No reviews found for {activeStarFilter} rating.
                                        </div>
                                    )}
                                </div>
                                <div className="w-[631px] h-[30px] flex items-center justify-between gap-[8px] rounded-[8px] mb-10">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => setReviewPage((p) => Math.max(1, p - 1))} disabled={reviewPage === 1} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 transition hover:bg-[#757575]">
                                            <ChevronLeft size={16} className="text-white" />
                                        </button>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((page) => (
                                                <button key={page} onClick={() => setReviewPage(page)} className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors ${reviewPage === page ? "bg-[#194473] text-white" : "bg-[#9E9E9E] text-white hover:bg-gray-400"}`}>
                                                    {page}
                                                </button>
                                            ))}
                                        </div>
                                        <button onClick={() => setReviewPage((p) => Math.min(5, p + 1))} disabled={reviewPage === 5} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 transition hover:bg-[#757575]">
                                            <ChevronRight size={16} className="text-white" />
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => router.push(`/review?placeId=${id}`)} // Navigate to review page with ID
                                        className="h-[30px] px-4 bg-[#194473] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#153a61] cursor-pointer"
                                    >
                                        Review
                                    </button>
                                </div>
                            </section>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="flex flex-col gap-8">
                            <div className="w-[456px] rounded-[8px] overflow-hidden shadow-sm">
                                <div className="h-[40px] bg-[#C0C0C0] flex items-center px-4 py-2">
                                    <h3 className="font-inter font-bold text-[20px] text-[#194473] leading-none">Location</h3>
                                </div>
                                <div className="bg-[#F5F5F5] p-4 flex flex-col gap-2 min-h-[99px]">
                                    <div className="flex items-start gap-3 text-sm text-[#212121]">
                                        <MapPin className="w-5 h-5 flex-shrink-0 text-[#616161]" />
                                        {/* ✅ FIX: Display Logic */}
                                        <p className="font-inter font-normal text-[14px] leading-tight">
                                            {place.formatted_address || (place.province_state ? `${place.province_state}, ${place.country}` : place.country)} <br />
                                        </p>
                                    </div>
                                    <div className="flex justify-end mt-auto">
                                        <a href={place.google_maps_url} target="_blank" rel="noreferrer" className="text-xs text-[#2196F3] font-bold hover:underline flex items-center gap-1">
                                            View on Google Maps <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* 1. แก้ตัวแม่สุด: เปลี่ยน h-[89px] เป็น h-auto และเพิ่ม min-h-[89px] เพื่อให้ยืดหดได้ */}
                            <div className="w-[456px] min-h-[89px] h-auto rounded-[8px] overflow-hidden shadow-sm font-inter bg-[#F5F5F5]">

                                {/* Header สีเทาด้านบน */}
                                <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4">
                                    <h3 className="font-bold text-[20px] text-[#194473] leading-none">Opening hours</h3>
                                </div>

                                {/* 2. Body ด้านล่าง: ใช้ h-auto และ padding ตามสเปก */}
                                <div className="w-full min-h-[49px] h-auto bg-[#F5F5F5] pt-4 pb-4 pl-2 pr-2">

                                    {/* Inner Wrapper */}
                                    <div className="flex items-start gap-[8px]">

                                        {/* Icon */}
                                        <Clock className="w-5 h-5 text-[#212121] mt-[3px] flex-shrink-0" strokeWidth={1.5} />

                                        {/* 3. Text Container: ใช้ Flex เพื่อแยก "หัวข้อ" กับ "เนื้อหา" ให้อยู่คนละคอลัมน์ */}
                                        <div className="flex-1 flex items-start gap-2 text-[14px] leading-relaxed text-[#212121]">

                                            {/* หัวข้อ: ล็อกไม่ให้ตัดคำ */}
                                            <span className="font-semibold text-[#194473] whitespace-nowrap flex-shrink-0">
                                                Open daily:
                                            </span>

                                            {/* เนื้อหา: ปล่อยให้ยาวและตัดบรรทัดได้ โดยจะตรงแนวกับบรรทัดแรกของตัวเองเสมอ */}
                                            <span className="font-normal break-words">
                                                {place.opening_hours || "24 hours (climbing season is typically July to early September)"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[456px] h-[89px] rounded-[8px] overflow-hidden shadow-sm font-inter">
                                <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4">
                                    <h3 className="font-bold text-[20px] text-[#194473] leading-none">Price</h3>
                                </div>
                                <div className="h-[49px] bg-[#F5F5F5] px-4 flex items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-[14px]">
                                            <span className="font-normal text-[#212121]">
                                                {place.price_detail || "Free entry"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* ✅ MAPPED TAGS SECTION */}
                            {displayTags.length > 0 && (
                                <div className="w-[456px] h-[97px] rounded-[8px] overflow-hidden shadow-sm font-inter">
                                    <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4">
                                        <h3 className="font-bold text-[20px] text-[#194473] leading-none">Tag</h3>
                                    </div>
                                    <div className="h-[57px] bg-[#F5F5F5] px-4 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                                        {displayTags.map((tag) => (
                                            <span key={tag} onClick={() => router.push(`/explore?tag=${tag}`)} className="h-[25px] flex items-center justify-center bg-[#757575] hover:bg-[#616161] transition-colors cursor-pointer text-white px-3 rounded-full text-xs font-normal capitalize leading-none whitespace-nowrap">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {morePictures.length > 0 && (
                                <div className="w-[456px] flex flex-col gap-4">
                                    <h3 className="font-inter font-bold text-[20px] text-[#194473] leading-none">More Picture</h3>
                                    <div className="flex gap-[13px]">
                                        {morePictures.slice(0, 3).map((img, idx) => (
                                            <div key={idx} className="relative w-[140px] h-[140px] rounded-[8px] overflow-hidden cursor-pointer group">
                                                <img src={img} alt={`More pic ${idx}`} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                {idx === 2 && morePictures.length > 3 && (
                                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[1px]">
                                                        <Plus size={24} strokeWidth={3} /> {morePictures.length - 3}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {nearbyPlaces.length > 0 && (
                                <div className="w-[456px] flex flex-col gap-4 mt-2">
                                    <h3 className="font-inter font-bold text-[20px] text-[#194473] leading-none">Best near by</h3>
                                    <div className="flex flex-col gap-3">
                                        {nearbyPlaces.map((nearby) => {
                                            const thumbUrl = nearby.images && nearby.images.length > 0
                                                ? (typeof nearby.images[0] === 'string' ? nearby.images[0] : (nearby.images[0] as any).url)
                                                : "https://via.placeholder.com/80x80?text=No+Image";

                                            // ✅ FIX: Logic ป้องกัน "India, India" และ "null, Thailand"
                                            const locationText = (nearby.province_state && nearby.province_state !== nearby.country)
                                                ? `${nearby.province_state}, ${nearby.country}`
                                                : nearby.country;

                                            return (
                                                <div
                                                    key={nearby.id}
                                                    onClick={() => router.push(`/detail?id=${nearby.id}`)}
                                                    className="w-full h-[96px] bg-[#F5F5F5] rounded-[8px] p-2 flex gap-3 cursor-pointer hover:bg-gray-200 transition-colors shadow-sm"
                                                >
                                                    <img
                                                        src={thumbUrl}
                                                        alt={nearby.name}
                                                        className="w-[80px] h-[80px] rounded-[8px] object-cover flex-shrink-0"
                                                    />
                                                    <div className="flex flex-col justify-center gap-1 min-w-0">
                                                        <h4 className="font-inter font-bold text-[16px] text-[#212121] leading-tight truncate">
                                                            {nearby.name}
                                                        </h4>
                                                        <p className="font-inter text-[12px] text-[#757575] leading-tight truncate">
                                                            {locationText}
                                                        </p>
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <div className="flex">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star key={star} size={12} className={`${star <= Math.round(nearby.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                                                ))}
                                                            </div>
                                                            <span className="text-[12px] text-[#212121] font-inter">({nearby.rating || 0})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ✅ IMPORTANT: Export default component
export default function DetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DetailContent />
        </Suspense>
    );
}