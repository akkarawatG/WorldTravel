// components/DetailClient.tsx
"use client";

import { useState, useEffect, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowLeft, ExternalLink, Sun, X, ChevronLeft, ChevronRight, Lightbulb, Search, Plus, ChevronDown, ArrowRight, ChevronUp } from "lucide-react";
import { Place } from "@/types/place";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/components/AuthModal";

// ... (KEEP CONSTANTS & MAPPINGS AS IS) ...
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

const getDisplayCategories = (tags: string[] = []) => {
    const displayCategories: string[] = [];
    tags.forEach(tag => {
        const lowerTag = tag?.toLowerCase().trim();
        if (CATEGORY_DISPLAY_MAP[lowerTag]) {
            displayCategories.push(CATEGORY_DISPLAY_MAP[lowerTag]);
            return;
        }
        let foundMatch = false;
        for (const [displayTitle, keywords] of Object.entries(CATEGORY_MATCHING_KEYWORDS)) {
            if (keywords.some(k => lowerTag.split(/[\s_]+/).includes(k.toLowerCase()))) {
                displayCategories.push(displayTitle);
                foundMatch = true;
                break;
            }
        }
        if (!foundMatch) {
            displayCategories.push(tag?.replace(/_/g, " ") || "Attraction");
        }
    });
    return Array.from(new Set(displayCategories));
};

interface DetailClientProps {
    place: Place;
    nearbyPlaces: Place[];
    morePictures: string[];
}

const REVIEWS_PER_PAGE = 3;
const VISIT_TYPES = ["Solo Travel", "Couple", "Family", "Friend", "Business"]; // Options for travel party

export default function DetailClient({ place, nearbyPlaces, morePictures }: DetailClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isPartyOpen, setIsPartyOpen] = useState(false);

    // Hero Slider State
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    // Main Gallery Modal State
    const [showModal, setShowModal] = useState(false);
    const [galleryQueue, setGalleryQueue] = useState<{ url: string }[]>([]);

    // Review Image Popup State (NEW)
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
    const [selectedReviewData, setSelectedReviewData] = useState<any | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

    // Review States
    const [activeStarFilter, setActiveStarFilter] = useState("All");
    const [activePartyFilter, setActivePartyFilter] = useState("All"); // ✅ NEW STATE
    const [reviewPage, setReviewPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    // Auth Modal State
    const [showAuthModal, setShowAuthModal] = useState(false);

    // --- DERIVED DATA ---
    const rawImages = place?.images || [];
    const allImages = rawImages.length > 0
        ? rawImages.map(img => (typeof img === 'object' && 'url' in img ? img : { url: img as string }))
        : [{ url: "https://placehold.co/1200x600?text=No+Image" }];

    const extendedImages = allImages.length > 1
        ? [...allImages, allImages[0]]
        : allImages;

    const currentReviews = (place as any)?.reviews || [];

    // ✅ ปรับ Logic การ Filter: รวม Star Filter + Search Query + Party Filter
    const filteredReviews = currentReviews.filter((review: any) => {
        // 1. Filter by Star
        let starMatch = true;
        if (activeStarFilter !== "All") {
            const starValue = parseInt(activeStarFilter.split(" ")[0]);
            starMatch = review.rating === starValue;
        }

        // 2. Filter by Search Query
        let searchMatch = true;
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const content = (review.content || review.comment || "").toLowerCase();
            searchMatch = content.includes(query);
        }

        // 3. Filter by Travel Party (NEW)
        let partyMatch = true;
        if (activePartyFilter !== "All") {
            // Note: Ensure your DB column name matches here. Assuming 'travel_party' or similar field exists in review object
            const party = review.travel_party || review.visit_type || "";
            partyMatch = party === activePartyFilter;
        }

        return starMatch && searchMatch && partyMatch;
    });

    const totalReviews = filteredReviews.length;
    const totalPages = Math.ceil(totalReviews / REVIEWS_PER_PAGE);

    useEffect(() => {
        if (reviewPage > totalPages && totalPages > 0) {
            setReviewPage(1);
        }
    }, [totalPages, reviewPage]);

    const displayedReviews = filteredReviews.slice(
        (reviewPage - 1) * REVIEWS_PER_PAGE,
        reviewPage * REVIEWS_PER_PAGE
    );

    const displayTags = getDisplayCategories(place.category_tags || []);

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

    // --- EFFECT: SLIDER ---
    useEffect(() => {
        if (allImages.length <= 1 || showModal) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => prev + 1);
        }, 10000);
        return () => clearInterval(interval);
    }, [allImages.length, showModal]);

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

    // --- HANDLERS (MAIN GALLERY MODAL) ---
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

    // --- HANDLERS (REVIEW IMAGE MODAL WITH NAVIGATION) ---

    const findReviewByImage = (imageUrl: string) => {
        return currentReviews.find((review: any) => {
            if (Array.isArray(review.images)) {
                return review.images.some((img: any) => {
                    const url = typeof img === 'string' ? img : img.url;
                    return url === imageUrl;
                });
            }
            return false;
        });
    };

    const openReviewImageModal = (imageUrl: string) => {
        const foundReview = findReviewByImage(imageUrl);
        const indexInMore = morePictures.findIndex(url => url === imageUrl);

        const reviewDataToUse = foundReview || {
            name: place.name,
            rating: 0,
            content: "No review description available for this image.",
            visit_date: null,
            profiles: {
                username: "Gallery Image",
                avatar_url: null
            }
        };

        setSelectedReviewData(reviewDataToUse);
        setSelectedReviewImage(imageUrl);
        setSelectedImageIndex(indexInMore !== -1 ? indexInMore : 0);
        setShowReviewModal(true);
    };

    const navigateReviewImage = (direction: 'next' | 'prev', e: MouseEvent) => {
        e.stopPropagation();

        if (morePictures.length <= 1) return;

        let newIndex = direction === 'next' ? selectedImageIndex + 1 : selectedImageIndex - 1;

        if (newIndex >= morePictures.length) newIndex = 0;
        if (newIndex < 0) newIndex = morePictures.length - 1;

        const newImageUrl = morePictures[newIndex];
        const newReviewData = findReviewByImage(newImageUrl);

        const reviewDataToUse = newReviewData || {
            name: place.name,
            rating: 0,
            content: "No review description available for this image.",
            visit_date: null,
            profiles: {
                username: "Gallery Image",
                avatar_url: null
            }
        };

        setSelectedImageIndex(newIndex);
        setSelectedReviewImage(newImageUrl);
        setSelectedReviewData(reviewDataToUse);
    };

    const closeReviewModal = () => {
        setShowReviewModal(false);
        setSelectedReviewImage(null);
        setSelectedReviewData(null);
    };

    const mainImage = galleryQueue[0] || { url: "" };
    const thumbnails = galleryQueue.slice(1, 7);

    const isRiskyImage = (url: string) => {
        return url.includes('wikimedia.org') ||
            url.includes('cloudfront.net') ||
            url.includes('placehold.co') ||
            url.includes('via.placeholder.com');
    };

    const handleReviewClick = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            router.push(`/review?placeId=${place.id}`);
        } else {
            setShowAuthModal(true);
        }
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        router.push(`/review?placeId=${place.id}`);
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20 relative">

            {showAuthModal && (
                <AuthModal
                    onClose={() => setShowAuthModal(false)}
                    onSuccess={handleAuthSuccess}
                />
            )}

            {/* --- REVIEW IMAGE MODAL --- */}
            {showReviewModal && selectedReviewData && selectedReviewImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeReviewModal} />

                    <div
                        /* ✅ แก้ไข: ปรับ height เป็น 625px (103+522) */
                        className="relative bg-white rounded-[16px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border-[2px] border-[#1E518C]"
                        style={{ width: '1133px', height: '625px' }}
                    >
                        {/* Header (Title Bar) - Height 103px */}
                        <div className="flex-shrink-0 w-full h-[103px] flex justify-between items-center bg-white z-20 
                                      pt-[32px] pb-[32px] pl-[65px] pr-[64px]
                                      border-b-[2px] border-[#1E518C] 
                                      rounded-tl-[16px] rounded-tr-[16px]">
                            {/* ... (Header Content เหมือนเดิม) ... */}
                            <div className="w-[623px] h-[39px] flex items-center gap-[16px]">
                                <h3 className="font-Inter font-semibold text-[32px] text-[#194473] leading-none truncate">
                                    {place.name}
                                </h3>
                                {(place.rating ?? 0) > 0 && (
                                    <div className="w-[172px] h-[24px] flex items-center gap-[8px] flex-shrink-0">
                                        <div className="flex items-center gap-[4px] w-[136px] h-[24px]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={24} className={`${star <= Math.round(place.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                            ))}
                                        </div>
                                        <span className="font-Inter font-normal text-[20px] leading-none text-[#212121]">
                                            ({place.rating})
                                        </span>
                                    </div>
                                )}
                            </div>
                            <button onClick={closeReviewModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                                <X size={24} className="text-[#616161]" />
                            </button>
                        </div>

                        {/* ✅ Content Area (Wrapper) */}
                        <div
                            className="flex w-[1133px] h-[522px] bg-white gap-[16px] 
                                       /* ✅ แก้ไข: ปรับ Padding ตามสเปก (บน-ล่าง 60px, ซ้าย-ขวา 32px) */
                                       py-[60px] px-[32px]
                                         border-t-0 border-[#1E518C] 
                                       rounded-bl-[16px] rounded-br-[16px]
                                       overflow-hidden"
                        >
                            {/* Left Side: Review Details */}
                            <div className="w-[400px] flex-shrink-0  pr-6 flex flex-col gap-4 overflow-y-auto bg-white h-full">
                                {/* ... (เนื้อหาด้านซ้าย เหมือนเดิม) ... */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0">
                                            <Image
                                                src={selectedReviewData.profiles?.avatar_url || "https://placehold.co/100x100?text=U"}
                                                alt={selectedReviewData.profiles?.username || "User"}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <h4 className="font-inter font-bold text-[28px] text-black leading-none tracking-normal">
                                            {selectedReviewData.profiles?.username || selectedReviewData.name || "Anonymous"}
                                        </h4>
                                    </div>
                                    <div className="w-[96px] h-[16px] flex items-center gap-[4px]">
                                        {selectedReviewData.rating > 0 ? (
                                            <>
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star key={star} size={16} className={`${star <= selectedReviewData.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                                ))}
                                                <span className="text-[12px] text-[#757575] leading-none">({selectedReviewData.rating})</span>
                                            </>
                                        ) : (
                                            <span className="text-[12px] text-[#757575] leading-none">Image Gallery</span>
                                        )}
                                    </div>
                                </div>
                                <div className=" bg-white border border-[#EEEEEE] rounded-[8px] p-[16px] overflow-y-auto shrink-0">
                                    <p className="font-inter font-normal text-[16px] text-black leading-none tracking-normal whitespace-pre-line">
                                        {selectedReviewData.content}
                                    </p>
                                </div>
                            </div>

                            {/* Right Side: Image */}
                            {/* ✅ แก้ไข: ลบ w-[704px] ออก เพื่อให้ flex-1 ทำงานเต็มที่ ขยายเต็มพื้นที่ที่เหลือ */}
                            <div className="flex-1 h-[402px] bg-gray-100 flex items-center justify-center relative group overflow-hidden rounded-[8px]">

                                <div className="relative w-full h-full">
                                    {/* ปุ่มกดเลื่อนรูป (ยังอยู่เหมือนเดิม) */}
                                    {morePictures.length > 1 && (
                                        <>
                                            <button
                                                onClick={(e) => navigateReviewImage('prev', e)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-[32px] h-[32px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer"
                                            >
                                                <ArrowLeft className="w-[20px] h-[20px]" />
                                            </button>
                                            <button
                                                onClick={(e) => navigateReviewImage('next', e)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-[32px] h-[32px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-[30px] p-[9px] flex items-center justify-center gap-[10px] text-[#ffffff] transition-all active:scale-95 hidden md:flex shadow-sm cursor-pointer"
                                            >
                                                <ArrowRight className="w-[20px] h-[20px]" />
                                            </button>
                                        </>
                                    )}

                                    <Image
                                        src={selectedReviewImage}
                                        alt="Review Detail"
                                        fill
                                        className="object-cover rounded-[4px]"
                                        unoptimized={isRiskyImage(selectedReviewImage)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* ... EXISTING MAIN GALLERY MODAL ... */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white flex flex-col z-10 overflow-hidden shadow-2xl rounded-[16px]" style={{ width: '835px', height: '624px' }}>
                        {/* ... (Keep existing gallery modal content) ... */}
                        <div className="w-[835px] h-[103px] flex justify-between items-center bg-white border-[2px] border-[#EEEEEE] rounded-tl-[8px] rounded-tr-[8px] pt-[32px] pr-[64px] pb-[32px] pl-[65px] shrink-0">
                            <div className="w-[623px] h-[39px] flex items-center gap-[16px]">
                                <h3 className="font-Inter font-semibold text-[32px] text-[#194473] leading-[100%] truncate">{place.name}</h3>
                                <div className="w-[172px] h-[24px] flex items-center gap-[8px] flex-shrink-0">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={24} className={`${star <= Math.round(place.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                        ))}
                                    </div>
                                    <span className="font-Inter font-normal text-[20px] leading-[100%] text-[#212121]">({place.rating || 0})</span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="w-[24px] h-[24px] rounded-[30px] bg-[#616161] hover:bg-[#4a4a4a] flex items-center justify-center gap-[10px] text-white transition-colors">
                                <X size={14} strokeWidth={2.5} />
                            </button>
                        </div>
                        <div className="w-[835px] h-[521px] flex flex-col items-center justify-center bg-white border-l-[2px] border-r-[2px] border-b-[2px] border-[#EEEEEE] rounded-bl-[8px] rounded-br-[8px] pb-[64px]">
                            <div className="w-[707px] h-[393px] flex flex-col border border-[#C2DCF3] rounded-[8px] overflow-hidden bg-white">
                                <div className="relative w-full flex-1 flex-shrink-0 overflow-hidden group bg-gray-50">
                                    <button onClick={prevModalImage} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[32px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center text-white transition-all shadow-sm cursor-pointer"><ChevronLeft size={20} strokeWidth={2.5} /></button>
                                    <img src={mainImage.url} alt="Gallery Main" className="w-full h-full object-cover transition-opacity duration-300" />
                                    <button onClick={nextModalImage} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[32px] bg-[#3A82CE66] border border-[#95C3EA] hover:bg-[#3A82CE] rounded-full flex items-center justify-center text-white transition-all shadow-sm cursor-pointer"><ChevronRight size={20} strokeWidth={2.5} /></button>
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
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.country}`)}>{place.country}</span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.country}&search=${place.province_state}`)}>{place.province_state || place.country}</span>/
                    <span className="truncate max-w-[200px] md:max-w-none text-[#101828] hover:underline cursor-pointer">{place.name}</span>
                </div>
            </div>

            {/* Main Content Section */}
            <div className="gap-[32px] mt-8">
                <div className="gap-6">
                    <div className="max-w-[1440px] mx-auto px-[156px] ">
                        <h1 className="font-inter font-bold text-[48px] leading-[100%] tracking-normal text-[#194473] mt-4">{place.name}</h1>
                    </div>

                    <div className="w-full h-[414px] bg-[#DEECF9] mt-6">
                        <div className="w-full max-w-[1440px] h-[414px] mx-auto flex justify-center">
                            <div className="w-full h-[445px] flex flex-col gap-[16px] px-[156px]">
                                <div className="relative w-full h-[413px] bg-black overflow-hidden group flex-shrink-0 shadow-sm cursor-pointer" onClick={openModal}>
                                    <div className={`flex h-full ease-in-out ${isTransitioning ? 'transition-transform duration-700' : ''}`} style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                        {extendedImages.map((img, index) => {
                                            const imgUrl = img.url;
                                            return (
                                                <div key={index} className="min-w-full h-full flex-shrink-0 relative group-hover:opacity-90 transition-opacity">
                                                    <Image src={imgUrl} alt={`Slide ${index}`} fill priority={index === 0} className="object-cover" sizes="100vw" unoptimized={isRiskyImage(imgUrl)} />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                        <span className="text-white opacity-0 group-hover:opacity-100 bg-black/50 px-4 py-2 rounded-full text-sm font-semibold transition-opacity">Click to view gallery</span>
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                            <div className="w-[631px] flex flex-col gap-[24px]">
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473]">About</h2>
                                <p className="font-inter font-normal text-[16px] leading-normal tracking-normal text-left text-[#212121]">{place.description_long || place.description_short || "No description available."}</p>
                            </div>

                            <section>
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473] mb-6">Best Season to Visit</h2>
                                <div className="w-[631px] rounded-[8px] overflow-hidden border border-[#EF9A9A]">
                                    <div className="w-full h-[40px] flex items-center px-4 gap-2" style={{ backgroundColor: '#E57373' }}>
                                        <Sun size={20} className="text-white" />
                                        <span className="font-inter font-semibold text-[16px] text-white">Recommended Season</span>
                                    </div>
                                    <div className="w-full min-h-[50px] flex flex-col justify-center px-4 py-3" style={{ backgroundColor: '#FFEBEE' }}>
                                        <div className="flex gap-1 items-start">
                                            <span className="font-semibold text-[#EF6C00] whitespace-nowrap">Suggest: </span>
                                            <p className="font-inter text-[14px] text-left text-[#212121] leading-relaxed whitespace-pre-line">
                                                {place.best_season ? place.best_season.replace(/;|and/gi, '').replace(/\s+/g, ' ').replace(/(?<!^)(Summer|Winter|Spring|Autumn|Fall|Rainy|Dry|Monsoon)/gi, '\n$1').trim() : "Check local weather forecast before visiting."}
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

                            <section className="h-auto flex flex-col gap-[24px]">
                                <h2 className="font-inter font-bold text-[36px] leading-none tracking-normal text-[#194473]">Reviews</h2>
                                <div className="flex flex-col gap-4 flex-shrink-0">
                                    <div className="relative w-full">
                                        <div className="flex items-center w-[631px] h-[31px] gap-[8px] px-[8px] py-[4px] bg-[#194473] border-[1px] border-[#EEEEEE] rounded-[8px] transition">
                                            <Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" />
                                            <div className="flex items-center w-[583px] h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px] py-[4px] gap-[10px]">
                                                <input type="text" placeholder="Search" className="w-full h-full outline-none bg-transparent font-inter font-normal text-[12px] text-[#9E9E9E] placeholder-[#9E9E9E] leading-none tracking-normal" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setReviewPage(1); }} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex w-[631px] h-[25px] gap-[32px] items-center">
                                        {["All", "1 Star", "2 Star", "3 star", "4 Star", "5 Star"].map((filter) => (
                                            <button key={filter} onClick={() => { setActiveStarFilter(filter); setReviewPage(1); }} className={`w-[58px] h-[25px] flex items-center justify-center rounded-[4px] text-[12px] font-inter font-[400] transition-colors leading-none cursor-pointer border ${activeStarFilter === filter ? "bg-[#3A82CE] text-white border-[#90CAF9]" : "bg-[#C0C0C0] text-black border-[#194473] hover:bg-gray-400 "}`}>
                                                {filter}
                                            </button>
                                        ))}

                                        {/* ✅ NEW: Dropdown Travel Party Filter */}
                                        {/* เพิ่ม ml-auto เพื่อดันไปชิดขวาสุด */}
                                        {/* ✅ NEW: Custom Dropdown Travel Party Filter */}
                                        <div className="relative ml-auto">

                                            {/* 1. Trigger Button (ปุ่มกดเปิด) - ขนาด 55x27 เท่าเดิม */}
                                            {/* 1. Trigger Button */}
                                            <button
                                                onClick={() => setIsPartyOpen(!isPartyOpen)}
                                                className="w-auto h-[27px] bg-white border border-[#1E518C] rounded-[8px] flex items-center justify-center gap-[4px] px-[8px] py-[4px] cursor-pointer"
                                            >
                                                <span className="font-inter font-normal text-[12px] text-[#1E518C] leading-none truncate">
                                                    {activePartyFilter === "All" ? "All" : activePartyFilter}
                                                </span>

                                                {/* ✅ Logic: ถ้าเปิดอยู่ให้โชว์ลูกศรชี้ขึ้น ถ้าปิดอยู่โชว์ลูกศรชี้ลง */}
                                                {isPartyOpen ? (
                                                    <ChevronUp size={14} className="text-[#1E518C] flex-shrink-0" />
                                                ) : (
                                                    <ChevronDown size={14} className="text-[#1E518C] flex-shrink-0" />
                                                )}
                                            </button>

                                            {/* 2. Dropdown Menu (รายการตัวเลือก) */}
                                            {isPartyOpen && (
                                                <>
                                                    {/* Backdrop: คลิกข้างนอกเพื่อปิด */}
                                                    <div className="fixed inset-0 z-10" onClick={() => setIsPartyOpen(false)}></div>

                                                    {/* Menu Container: 120x135px */}
                                                    <div className="absolute right-0 top-[32px] z-20 w-[120px] h-auto overflow-y-auto bg-white border border-[#1E518C] rounded-[8px]  shadow-sm flex flex-col animate-in fade-in zoom-in-95 duration-0">

                                                        {["All", ...VISIT_TYPES].map((type) => (
                                                            <button
                                                                key={type}
                                                                onClick={() => {
                                                                    setActivePartyFilter(type);
                                                                    setReviewPage(1);
                                                                    setIsPartyOpen(false);
                                                                }}
                                                                className={`
                                                                w-full h-[27px] flex-shrink-0 flex items-center px-[8px] text-left
                                                                font-inter font-normal text-[16px] leading-none
                                                                transition-colors cursor-pointer
                                                                ${activePartyFilter === type ? "bg-[#E3F2FD] text-[#1E518C]" : "text-[#212121] hover:bg-gray-100"}
                                                            `}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-2 scrollbar-hide">
                                    {displayedReviews.length > 0 ? (
                                        displayedReviews.map((review: any, index: number) => {
                                            const userName = review.profiles?.username || review.profiles?.name || review.name || "Anonymous";
                                            const userAvatar = review.profiles?.avatar_url || review.profiles?.image || review.avatar || "https://placehold.co/100x100?text=U";
                                            const reviewDate = review.visit_date ? new Date(review.visit_date).toLocaleDateString() : review.date || "";
                                            let reviewImgs: string[] = [];
                                            if (Array.isArray(review.images)) {
                                                reviewImgs = review.images.map((img: any) => typeof img === 'string' ? img : img.url);
                                            }

                                            return (
                                                <div key={review.id} className="w-[631px] bg-white rounded-[8px] overflow-hidden shadow-sm border border-[#E0E0E0] flex-shrink-0">
                                                    <div className="h-[32px] bg-[#9E9E9E] flex items-center px-3 gap-2">
                                                        <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full border border-white object-cover" />
                                                        <span className="font-inter font-bold text-[16px] text-white">{userName}</span>
                                                    </div>
                                                    <div className="p-3">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-[12px] text-[#9E9E9E] font-inter">{reviewDate}</span>
                                                            <div className="flex items-center">
                                                                {[1, 2, 3, 4, 5].map((star) => (
                                                                    <Star key={star} size={14} className={`${star <= review.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                                                ))}
                                                                <span className="text-[12px] text-[#212121] ml-1">({review.rating})</span>
                                                            </div>
                                                        </div>
                                                        <p className="text-[14px] text-[#212121] font-inter leading-relaxed mb-3">{review.content || review.comment}</p>
                                                        {reviewImgs.length > 0 && (
                                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                                                {reviewImgs.map((img: string, idx: number) => (
                                                                    <div key={idx} className="relative w-[60px] h-[60px] flex-shrink-0 cursor-pointer hover:opacity-80" onClick={() => openReviewImageModal(img)}>
                                                                        <Image src={img} alt={`Review ${idx}`} fill className="object-cover rounded-[4px] border border-[#E0E0E0]" sizes="60px" unoptimized={isRiskyImage(img)} />
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}

                                                        {/* ✅ NEW: Travel Party Tag (Updated Specs) */}
                                                        {(review.travel_party || review.visit_type) && (
                                                            <div className="flex items-center gap-2 mb-3">
                                                                <div className="flex items-center h-[25px] px-[8px] py-[4px] gap-[10px] bg-[#757575] rounded-[8px]">
                                                                    {/* Icon: ปรับเป็นสีขาว */}
                                                                    {/* Text: 14px SemiBold White */}
                                                                    <span className="font-inter font-semibold text-[14px] text-white leading-none">
                                                                        {review.travel_party || review.visit_type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="w-[631px] py-8 text-center text-gray-500 bg-gray-50 rounded-[8px] border border-gray-200">
                                            No reviews found matching your criteria.
                                        </div>
                                    )}
                                </div>

                                {/* Pagination and Review Button Section */}
                                <div className="w-[631px] h-[30px] flex items-center justify-between gap-[8px] rounded-[8px] flex-shrink-0">
                                    {/* Pagination */}
                                    {totalPages > 1 ? (
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => setReviewPage((p) => Math.max(1, p - 1))} disabled={reviewPage === 1} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 transition hover:bg-[#757575]"><ChevronLeft size={16} className="text-white" /></button>
                                            <div className="flex gap-2">
                                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                                    <button key={page} onClick={() => setReviewPage(page)} className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors ${reviewPage === page ? "bg-[#194473] text-white" : "bg-[#9E9E9E] text-white hover:bg-gray-400"}`}>{page}</button>
                                                ))}
                                            </div>
                                            <button onClick={() => setReviewPage((p) => Math.min(totalPages, p + 1))} disabled={reviewPage === totalPages} className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 transition hover:bg-[#757575]"><ChevronRight size={16} className="text-white" /></button>
                                        </div>
                                    ) : (
                                        <div />
                                    )}
                                    <button onClick={handleReviewClick} className="h-[30px] px-4 bg-[#194473] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#153a61] cursor-pointer">
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

                            <div className="w-[456px] min-h-[89px] h-auto rounded-[8px] overflow-hidden shadow-sm font-inter bg-[#F5F5F5]">
                                <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4">
                                    <h3 className="font-bold text-[20px] text-[#194473] leading-none">Opening hours</h3>
                                </div>
                                <div className="w-full min-h-[49px] h-auto bg-[#F5F5F5] pt-4 pb-4 pl-2 pr-2">
                                    <div className="flex items-start gap-[8px]">
                                        <Clock className="w-5 h-5 text-[#212121] mt-[3px] flex-shrink-0" strokeWidth={1.5} />
                                        <div className="flex-1 flex items-start gap-2 text-[14px] leading-relaxed text-[#212121]">
                                            <span className="font-semibold text-[#194473] whitespace-nowrap flex-shrink-0">Open daily:</span>
                                            <span className="font-normal break-words">{place.opening_hours || "24 hours"}</span>
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
                                            <span className="font-normal text-[#212121]">{place.price_detail || "Free entry"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

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

                            {morePictures.length > 0 && currentReviews.length > 0 && (
                                <div className="w-[456px] flex flex-col gap-4">
                                    <h3 className="font-inter font-bold text-[20px] text-[#194473] leading-none">More Picture</h3>
                                    <div className="flex gap-[13px]">
                                        {morePictures.slice(0, 3).map((img, idx) => {
                                            return (
                                                <div key={idx} className="relative w-[140px] h-[140px] rounded-[8px] overflow-hidden cursor-pointer group" onClick={() => openReviewImageModal(img)}>
                                                    <Image src={img} alt={`More pic ${idx}`} fill className="object-cover transition-transform group-hover:scale-110" sizes="140px" unoptimized={isRiskyImage(img)} />
                                                    {idx === 2 && morePictures.length > 3 && (
                                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[1px]">
                                                            <Plus size={24} strokeWidth={3} /> {morePictures.length - 3}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {nearbyPlaces.length > 0 && (
                                <div className="w-[456px] flex flex-col gap-4 mt-2 ">
                                    <h3 className="font-inter font-bold text-[20px] text-[#194473] leading-none">Best near by</h3>
                                    <div className="flex flex-col gap-3">
                                        {nearbyPlaces.map((nearby) => {
                                            const thumbUrl = nearby.images && nearby.images.length > 0 ? (typeof nearby.images[0] === 'string' ? nearby.images[0] : (nearby.images[0] as any).url) : "https://placehold.co/80x80?text=No+Image";
                                            const locationText = (nearby.province_state && nearby.province_state !== nearby.country) ? `${nearby.province_state}, ${nearby.country}` : nearby.country;
                                            return (
                                                <div key={nearby.id} onClick={() => router.push(`/detail?id=${nearby.id}`)} className="w-full h-[96px] bg-[#F5F5F5] rounded-[8px] p-2 flex gap-3 cursor-pointer hover:bg-gray-200 transition-colors shadow-sm border border-[#1E518C]">
                                                    <div className="relative w-[80px] h-[80px] flex-shrink-0">
                                                        <Image src={thumbUrl} alt={nearby.name} fill className="rounded-[8px] object-cover" sizes="80px" unoptimized={isRiskyImage(thumbUrl)} />
                                                    </div>
                                                    <div className="flex flex-col justify-center gap-1 min-w-0 ">
                                                        <h4 className="font-inter font-bold text-[16px] text-[#212121] leading-tight truncate">{nearby.name}</h4>
                                                        <p className="font-inter text-[12px] text-[#757575] leading-tight truncate">{locationText}</p>
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