// components/DetailClient.tsx
"use client";

import { useState, useEffect, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Clock, Star, ArrowLeft, ExternalLink, Sun, X, ChevronLeft, ChevronRight, Lightbulb, Search, Plus, ChevronDown, ArrowRight, ChevronUp, ThumbsUp, Share2, Check } from "lucide-react";
import Icon from '@mdi/react';
import { mdiPlus } from '@mdi/js';
import { Place } from "@/types/place";
import { createClient } from "@/utils/supabase/client";
import AuthModal from "@/components/AuthModal";

// ... (CATEGORY_MATCHING_KEYWORDS & CATEGORY_DISPLAY_MAP คงเดิมตามที่คุณส่งมา) ...
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
const VISIT_TYPES = ["Solo Travel", "Couple", "Family", "Friend", "Business"];

export default function DetailClient({ place, nearbyPlaces, morePictures }: DetailClientProps) {
    const router = useRouter();
    const supabase = createClient();
    const [isPartyOpen, setIsPartyOpen] = useState(false);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [galleryQueue, setGalleryQueue] = useState<{ url: string }[]>([]);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedReviewImage, setSelectedReviewImage] = useState<string | null>(null);
    const [selectedReviewData, setSelectedReviewData] = useState<any | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

    const [activeStarFilter, setActiveStarFilter] = useState("All");
    const [activePartyFilter, setActivePartyFilter] = useState("All");
    const [reviewPage, setReviewPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState("");

    const [showAuthModal, setShowAuthModal] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        const checkUserAndSaved = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                const { data, error } = await supabase
                    .from('saved_places')
                    .select('id')
                    .eq('profile_id', user.id)
                    .eq('place_id', place.id)
                    .maybeSingle();
                
                if (data && !error) setIsSaved(true);
            }
        };
        checkUserAndSaved();
    }, [place.id]);

    const handleToggleSave = async (e?: any) => {
        if (e) e.stopPropagation();
        
        if (!userId) {
            setShowAuthModal(true);
            return;
        }

        if (isSaved) {
            const { error } = await supabase
                .from('saved_places')
                .delete()
                .eq('profile_id', userId)
                .eq('place_id', place.id);
            if (!error) setIsSaved(false);
        } else {
            const { error } = await supabase
                .from('saved_places')
                .insert([{ profile_id: userId, place_id: place.id }]);
            if (!error) setIsSaved(true);
        }
    };

    const rawImages = place?.images || [];
    const allImages = rawImages.length > 0
        ? rawImages.map(img => (typeof img === 'object' && 'url' in img ? img : { url: img as string }))
        : [{ url: "https://placehold.co/1200x600?text=No+Image" }];

    const extendedImages = allImages.length > 1
        ? [...allImages, allImages[0]]
        : allImages;

    const currentReviews = (place as any)?.reviews || [];

    const filteredReviews = currentReviews.filter((review: any) => {
        let starMatch = true;
        if (activeStarFilter !== "All") {
            const starValue = parseInt(activeStarFilter.split(" ")[0]);
            starMatch = review.rating === starValue;
        }
        let searchMatch = true;
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            const content = (review.content || review.comment || "").toLowerCase();
            searchMatch = content.includes(query);
        }
        let partyMatch = true;
        if (activePartyFilter !== "All") {
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
                {footwear && <p className="font-inter text-[14px] text-[#212121] leading-tight mb-3">{footwear}</p>}
                {outfit && <p className="font-inter text-[14px] text-[#212121] leading-tight"><span className="font-bold">Outfit: </span>{outfit}</p>}
            </>
        );
    };

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
            const newQueue = [...prev.slice(indexInQueue), ...prev.slice(0, indexInQueue)];
            return newQueue;
        });
    };

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
            profiles: { username: "Gallery Image", avatar_url: null }
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
            name: place.name, rating: 0, content: "No review description available for this image.", visit_date: null,
            profiles: { username: "Gallery Image", avatar_url: null }
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
        return url.includes('wikimedia.org') || url.includes('cloudfront.net') || url.includes('placehold.co') || url.includes('via.placeholder.com');
    };

    const handleReviewClick = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { router.push(`/review?placeId=${place.id}`); } else { setShowAuthModal(true); }
    };

    const handleAuthSuccess = () => {
        setShowAuthModal(false);
        router.push(`/review?placeId=${place.id}`);
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20 relative overflow-x-hidden">

            {showAuthModal && (
                <AuthModal onClose={() => setShowAuthModal(false)} onSuccess={handleAuthSuccess} />
            )}

            {/* --- REVIEW IMAGE MODAL --- */}
            {showReviewModal && selectedReviewData && selectedReviewImage && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeReviewModal} />
                    <div className="relative bg-white rounded-[16px] overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200 border-[2px] border-[#1E518C] w-full md:w-[1133px] max-h-[90vh] md:h-[625px]">
                        <div className="flex-shrink-0 w-full h-auto md:h-[103px] flex justify-between items-center bg-white z-20 p-4 md:pt-[32px] md:pb-[32px] md:pl-[65px] md:pr-[64px] border-b-[2px] border-[#1E518C]">
                            <div className="md:w-[623px] flex flex-col md:flex-row md:items-center gap-2 md:gap-[16px]">
                                <h3 className="font-Inter font-semibold text-[20px] md:text-[32px] text-[#194473] leading-none truncate">{place.name}</h3>
                                {(place.rating ?? 0) > 0 && (
                                    <div className="flex items-center gap-[8px]">
                                        <div className="flex items-center gap-[4px]">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star key={star} size={20} className={`${star <= Math.round(place.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                            ))}
                                        </div>
                                        <span className="font-Inter font-normal text-[16px] md:text-[20px] leading-none text-[#212121]">({place.rating})</span>
                                    </div>
                                )}
                            </div>
                            <button onClick={closeReviewModal} className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"><X size={24} className="text-[#616161]" /></button>
                        </div>
                        <div className="flex flex-col md:flex-row w-full flex-1 bg-white overflow-y-auto md:overflow-hidden p-4 md:p-0 md:py-[60px] md:px-[32px] gap-[16px]">
                            <div className="w-full md:w-[400px] flex-shrink-0 flex flex-col gap-4 overflow-y-visible md:overflow-y-auto">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-[32px] h-[32px] rounded-full overflow-hidden flex-shrink-0">
                                            <Image src={selectedReviewData.profiles?.avatar_url || "https://placehold.co/100x100?text=U"} alt="User" fill className="object-cover" unoptimized />
                                        </div>
                                        <h4 className="font-inter font-bold text-[18px] md:text-[28px] text-black leading-none">{selectedReviewData.profiles?.username || selectedReviewData.name || "Anonymous"}</h4>
                                    </div>
                                    <div className="w-[96px] flex items-center gap-[4px]">
                                        {selectedReviewData.rating > 0 ? (
                                            <>
                                                {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={16} className={`${star <= selectedReviewData.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />))}
                                            </>
                                        ) : (<span className="text-[12px] text-[#757575]">Image Gallery</span>)}
                                    </div>
                                </div>
                                <div className=" bg-white border border-[#EEEEEE] rounded-[8px] p-[16px]">
                                    <p className="font-inter font-normal text-[14px] md:text-[16px] text-black whitespace-pre-line leading-relaxed">{selectedReviewData.content}</p>
                                </div>
                            </div>
                            <div className="flex-1 h-[300px] md:h-full bg-gray-100 flex items-center justify-center relative rounded-[8px] overflow-hidden">
                                {morePictures.length > 1 && (
                                    <>
                                        <button onClick={(e) => navigateReviewImage('prev', e)} className="absolute left-2 z-30 w-[32px] h-[32px] bg-white/50 rounded-full flex items-center justify-center text-black shadow-sm"><ChevronLeft size={20} /></button>
                                        <button onClick={(e) => navigateReviewImage('next', e)} className="absolute right-2 z-30 w-[32px] h-[32px] bg-white/50 rounded-full flex items-center justify-center text-black shadow-sm"><ArrowRight size={20} /></button>
                                    </>
                                )}
                                <Image src={selectedReviewImage} alt="Detail" fill className="object-contain md:object-cover" unoptimized={isRiskyImage(selectedReviewImage)} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MAIN GALLERY MODAL --- */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-0">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative bg-white flex flex-col z-10 overflow-hidden shadow-2xl rounded-[16px] w-full md:w-[835px] max-h-[90vh]">
                        <div className="w-full h-auto md:h-[103px] flex justify-between items-center bg-white border-b border-[#EEEEEE] p-4 md:pt-[32px] md:pr-[64px] md:pb-[32px] md:pl-[65px]">
                            <div className="md:w-[623px] flex flex-col md:flex-row md:items-center gap-2 md:gap-[16px] overflow-hidden">
                                <h3 className="font-Inter font-semibold text-[20px] md:text-[32px] text-[#194473] leading-none truncate">{place.name}</h3>
                                <div className="flex items-center gap-[8px]">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (<Star key={star} size={20} className={`${star <= Math.round(place.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />))}
                                    </div>
                                    <span className="font-Inter font-normal text-[14px] md:text-[20px] text-[#212121]">({place.rating || 0})</span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-1 bg-[#616161] text-white rounded-full"><X size={18} /></button>
                        </div>
                        <div className="w-full flex-1 flex flex-col items-center justify-center bg-white p-4 md:pb-[64px]">
                            <div className="w-full md:w-[707px] flex-1 flex flex-col border border-[#C2DCF3] rounded-[8px] overflow-hidden bg-white">
                                <div className="relative w-full aspect-video md:h-[393px] group bg-gray-50 overflow-hidden">
                                    <button onClick={prevModalImage} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[32px] bg-white/50 rounded-full flex items-center justify-center text-black"><ChevronLeft size={20}/></button>
                                    <img src={mainImage.url} alt="Main" className="w-full h-full object-contain md:object-cover" />
                                    <button onClick={nextModalImage} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-[32px] h-[32px] bg-white/50 rounded-full flex items-center justify-center text-black"><ChevronRight size={20}/></button>
                                </div>
                                <div className="w-full h-auto md:h-[84px] flex items-center justify-center p-2 overflow-x-auto scrollbar-hide border-t border-[#C2DCF3]">
                                    <div className="flex items-center gap-[10px] w-max">
                                        {thumbnails.map((img, idx) => (
                                            <div key={idx} onClick={() => clickThumbnail(idx + 1)} className="relative h-[48px] w-[80px] md:h-[64px] md:w-[105px] cursor-pointer rounded-lg overflow-hidden border border-transparent opacity-60">
                                                <img src={img.url} alt="thumb" className="w-full h-full object-cover" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Section */}
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[156px] pt-6 mb-4">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap mb-2 font-Inter font-[600] text-[12px] md:text-[14px] leading-none text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="hover:underline cursor-pointer truncate max-w-[80px]" onClick={() => router.push(`/countries?continent=${place.continent}`)}>{place.continent}</span>/
                    <span className="hover:underline cursor-pointer truncate max-w-[80px]" onClick={() => router.push(`/explore?country=${place.country}`)}>{place.country}</span>/
                    <span className="truncate max-w-[150px] md:max-w-none text-[#101828] font-bold">{place.name}</span>
                </div>
            </div>

            {/* Title & Save Button Header */}
            <div className="w-full max-w-[1440px] mx-auto px-4 md:px-[156px] flex items-center justify-between mt-4">
                <h1 className="font-inter font-bold text-[32px] md:text-[48px] leading-tight text-[#194473]">{place.name}</h1>
                
                {/* Add/Toggle Button */}
                <button 
                    onClick={handleToggleSave} 
                    className={`flex h-[36px] w-[90px] items-center justify-center rounded-[8px] border shadow-sm transition-all duration-300 ease-in-out cursor-pointer
                    ${isSaved ? "bg-[#3A82CE] border-[#3A82CE] text-white" : "bg-white border-[#1E518C] text-[#1E518C] hover:bg-blue-50"}`}
                >
                    {isSaved ? <Check size="18px" className="mr-1" /> : <Plus size="18px" className="mr-1" />}
                    <span className="text-[14px] font-inter font-bold">{isSaved ? "Saved" : "Add"}</span>
                </button>
            </div>

            {/* Hero Slider Section */}
            <div className="w-full h-[250px] md:h-[414px] bg-[#DEECF9] mt-6">
                <div className="w-full max-w-[1440px] h-full mx-auto flex justify-center">
                    <div className="w-full h-full flex flex-col px-0 md:px-[156px]">
                        <div className="relative w-full h-full bg-black overflow-hidden group shadow-sm cursor-pointer md:rounded-none rounded-b-[24px]" onClick={openModal}>
                            <div className={`flex h-full ease-in-out ${isTransitioning ? 'transition-transform duration-700' : ''}`} style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}>
                                {extendedImages.map((img, index) => (
                                    <div key={index} className="min-w-full h-full flex-shrink-0 relative group-hover:opacity-90">
                                        <Image src={img.url} alt={`Slide ${index}`} fill priority={index === 0} className="object-cover" sizes="100vw" unoptimized={isRiskyImage(img.url)} />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 flex items-center justify-center">
                                            <span className="text-white opacity-0 md:group-hover:opacity-100 bg-black/50 px-4 py-2 rounded-full text-sm font-semibold transition-opacity">Click to view gallery</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded md:hidden">{(currentImageIndex % allImages.length) + 1} / {allImages.length}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout Container */}
            <div className="max-w-[1440px] mx-auto px-4 md:px-[156px] mt-8">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-6 justify-between">
                    
                    {/* LEFT COLUMN */}
                    <div className="flex flex-col gap-8 w-full lg:w-[631px]">
                        
                        {/* ✅ Mobile Dropdown Quick Info Menu */}
                        <div className="lg:hidden flex flex-col gap-4">
                            <div className="relative w-full">
                                <button 
                                    onClick={() => setIsPartyOpen(!isPartyOpen)}
                                    className="w-full h-[48px] bg-[#F5F5F5] border border-[#E0E0E0] rounded-[12px] flex items-center justify-between px-4 text-[#194473] font-bold text-[16px] shadow-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <MapPin size={20} />
                                        <span>Quick Info</span>
                                    </div>
                                    <ChevronDown className={`transition-transform duration-300 ${isPartyOpen ? "rotate-180" : ""}`} />
                                </button>
                                
                                {isPartyOpen && (
                                    <div className="absolute top-full left-0 w-full bg-white border border-[#E0E0E0] rounded-[12px] mt-2 shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="p-4 flex flex-col gap-4">
                                            <div className="flex flex-col gap-1 border-b pb-2">
                                                <span className="text-[12px] font-bold text-[#194473] uppercase tracking-wider">Location</span>
                                                <span className="text-[14px] text-[#212121]">{place.formatted_address || place.country}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b pb-2">
                                                <span className="text-[12px] font-bold text-[#194473] uppercase tracking-wider">Opening hours</span>
                                                <span className="text-[14px] text-[#212121]">{place.opening_hours || "24 Hours"}</span>
                                            </div>
                                            <div className="flex flex-col gap-1 border-b pb-2">
                                                <span className="text-[12px] font-bold text-[#194473] uppercase tracking-wider">Price</span>
                                                <span className="text-[14px] text-[#212121]">{place.price_detail || "Free Entry"}</span>
                                            </div>
                                            {displayTags.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-1">
                                                    {displayTags.map(tag => (
                                                        <span key={tag} className="px-3 py-1 bg-gray-100 text-[#616161] rounded-full text-[11px] font-medium border border-gray-200 capitalize">{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                            <a href={place.google_maps_url} target="_blank" rel="noreferrer" className="w-full h-[40px] bg-[#2196F3] text-white rounded-[8px] flex items-center justify-center gap-2 font-bold text-[14px] mt-2">
                                                View on Google Maps <ExternalLink size={16} />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-[16px] md:gap-[24px]">
                            <h2 className="font-inter font-black text-[28px] md:text-[36px] leading-none text-[#194473]">About</h2>
                            <p className="font-inter font-normal text-[14px] md:text-[16px] leading-relaxed text-[#212121]">{place.description_long || place.description_short || "No description available."}</p>
                        </div>

                        <section className="w-full">
                            <h2 className="font-inter font-black text-[28px] md:text-[36px] leading-none text-[#194473] mb-6">Best Season to Visit</h2>
                            <div className="w-full md:w-[631px] rounded-[8px] overflow-hidden border border-[#EF9A9A] mb-4">
                                <div className="w-full h-[40px] flex items-center px-4 gap-2" style={{ backgroundColor: '#E57373' }}>
                                    <Sun size={20} className="text-white" />
                                    <span className="font-inter font-semibold text-[14px] md:text-[16px] text-white">Recommended Season</span>
                                </div>
                                <div className="w-full min-h-[50px] flex flex-col justify-center px-4 py-3 bg-[#FFEBEE]">
                                    <div className="flex gap-1 sm:items-start">
                                        <span className="font-semibold text-[#EF6C00] whitespace-nowrap text-[14px]">Suggest: </span>
                                        <p className="font-inter text-[14px] text-[#212121] leading-relaxed">
                                            {place.best_season || "Check local weather forecast."}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full md:w-[631px] min-h-[107px] mt-4 flex flex-col justify-center gap-[5px] bg-white border border-[#90CAF9] rounded-[8px] p-4">
                                <div className="flex items-center gap-[10px] mb-2">
                                    <Lightbulb size={24} className="text-[#2196F3]" />
                                    <h3 className="font-inter font-bold text-[18px] text-[#212121]">Tips</h3>
                                </div>
                                {renderTips()}
                            </div>
                        </section>

                        <section className="flex flex-col gap-6">
                            <h2 className="font-inter font-bold text-[28px] md:text-[36px] text-[#194473]">Reviews</h2>
                            <div className="flex flex-col gap-4">
                                <div className="relative w-full">
                                    <div className="flex items-center w-full md:w-[631px] h-[40px] md:h-[31px] gap-2 px-3 bg-[#194473] border border-[#EEEEEE] rounded-[8px]">
                                        <Search size={18} className="text-white flex-shrink-0" />
                                        <div className="flex-1 h-[32px] md:h-[23px] bg-[#FFFFFF] rounded-[4px] px-2 flex items-center">
                                            <input type="text" placeholder="Search reviews..." className="w-full outline-none bg-transparent text-[14px] md:text-[12px] text-[#212121] placeholder-[#9E9E9E]" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setReviewPage(1); }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 md:gap-[32px] items-center">
                                    <div className="flex flex-wrap gap-2">
                                        {["All", "1 Star", "2 Star", "3 star", "4 Star", "5 Star"].map((filter) => (
                                            <button key={filter} onClick={() => { setActiveStarFilter(filter); setReviewPage(1); }} className={`px-2 py-1 min-w-[50px] rounded-[4px] text-[11px] md:text-[12px] font-inter transition-colors border ${activeStarFilter === filter ? "bg-[#3A82CE] text-white border-[#90CAF9]" : "bg-[#C0C0C0] text-black border-[#194473]"}`}>
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative ml-auto">
                                        {/* ✅ Display name changed to "All" if value is "All" */}
                                        <button onClick={() => setIsPartyOpen(!isPartyOpen)} className="w-auto h-[27px] bg-white border border-[#1E518C] rounded-[8px] flex items-center gap-1 px-2 py-1">
                                            <span className="text-[12px] text-[#1E518C] truncate max-w-[80px]">{activePartyFilter === "All" ? "All" : activePartyFilter}</span>
                                            {isPartyOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        {isPartyOpen && (
                                            <div className="absolute right-0 top-8 z-50 w-[120px] bg-white border border-[#1E518C] rounded shadow-lg overflow-hidden py-1">
                                                {["All", ...VISIT_TYPES].map(type => (
                                                    <button key={type} onClick={() => { setActivePartyFilter(type); setReviewPage(1); setIsPartyOpen(false); }} className="w-full px-3 py-2 text-left text-[13px] hover:bg-blue-50 transition-colors">{type}</button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-4">
                                {displayedReviews.length > 0 ? (
                                    displayedReviews.map((review: any) => {
                                        const userName = review.profiles?.username || "Anonymous";
                                        const userAvatar = review.profiles?.avatar_url || "https://placehold.co/100x100?text=U";
                                        const reviewDate = review.visit_date ? new Date(review.visit_date).toLocaleDateString() : "";
                                        let reviewImgs: string[] = Array.isArray(review.images) ? review.images.map((img: any) => typeof img === 'string' ? img : img.url) : [];

                                        return (
                                            <div key={review.id} className="w-full md:w-[631px] bg-white rounded-[8px] overflow-hidden shadow-sm border border-[#E0E0E0]">
                                                <div className="h-[32px] bg-[#9E9E9E] flex items-center px-3 gap-2">
                                                    <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full border border-white object-cover" />
                                                    <span className="font-inter font-bold text-[14px] md:text-[16px] text-white truncate">{userName}</span>
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <span className="text-[11px] md:text-[12px] text-[#9E9E9E]">{reviewDate}</span>
                                                        <div className="flex items-center">
                                                            {[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= review.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"} />)}
                                                            <span className="text-[11px] ml-1">({review.rating})</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-[13px] md:text-[14px] text-[#212121] leading-relaxed mb-3">{review.content}</p>
                                                    {reviewImgs.length > 0 && (
                                                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                                            {reviewImgs.map((img, idx) => (
                                                                <div key={idx} className="relative w-[60px] h-[60px] flex-shrink-0 rounded-[4px] overflow-hidden border border-[#E0E0E0]" onClick={() => openReviewImageModal(img)}>
                                                                    <Image src={img} alt="review-img" fill className="object-cover" sizes="60px" unoptimized={isRiskyImage(img)} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <button className="flex items-center gap-1.5 text-[12px] md:text-[14px] text-[#194473] font-medium"><ThumbsUp size={14} /> Like</button>
                                                        <button className="flex items-center gap-1.5 text-[12px] md:text-[14px] text-[#194473] font-medium"><Share2 size={14} /> Share</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-10 bg-gray-50 rounded-lg text-gray-400">No reviews found.</div>
                                )}
                            </div>

                            {/* ✅ Updated Pagination System (Matching AllCountries) */}
                            {totalPages > 1 && (
                                <div className="flex justify-center md:justify-start items-center gap-[8px] mt-10 md:mt-12 font-inter">
                                    <button 
                                        onClick={() => setReviewPage(p => Math.max(1, p - 1))} 
                                        disabled={reviewPage === 1} 
                                        className={`flex items-center justify-center w-[36px] h-[32px] md:w-[32px] md:h-[24px] rounded-[4px] border border-[#EEEEEE] transition cursor-pointer ${reviewPage === 1 ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed" : "bg-[#9E9E9E] hover:bg-gray-500"}`}
                                    >
                                        <ChevronLeft size={18} className="text-white" />
                                    </button>
                                    
                                    <div className="flex items-center gap-[6px] md:gap-[8px]">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => {
                                            const isActive = reviewPage === p;
                                            return (
                                                <button 
                                                    key={p} 
                                                    onClick={() => setReviewPage(p)} 
                                                    className={`flex items-center justify-center w-[32px] h-[32px] md:w-[25px] md:h-[25px] rounded-[4px] border text-[14px] md:text-[12px] font-medium transition-colors cursor-pointer ${isActive ? "bg-[#194473] text-white border-[#194473]" : "bg-[#9E9E9E] text-white border-[#EEEEEE] hover:bg-gray-500"}`}
                                                >
                                                    {p}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button 
                                        onClick={() => setReviewPage(p => Math.min(totalPages, p + 1))} 
                                        disabled={reviewPage === totalPages} 
                                        className={`flex items-center justify-center w-[36px] h-[32px] md:w-[32px] md:h-[24px] rounded-[4px] border border-[#EEEEEE] transition cursor-pointer ${reviewPage === totalPages ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed" : "bg-[#9E9E9E] hover:bg-gray-500"}`}
                                    >
                                        <ChevronRight size={18} className="text-white" />
                                    </button>
                                </div>
                            )}
                            
                            <div className="flex justify-end mt-4">
                                <button onClick={handleReviewClick} className="h-[30px] px-6 bg-[#194473] text-white rounded-[8px] font-bold text-[14px] shadow-sm hover:bg-[#153a61]">Review</button>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT COLUMN - SIDEBAR (Visible only on Desktop) */}
                    <div className="hidden lg:flex flex-col gap-6 w-full lg:w-[456px]">
                        <div className="w-full rounded-[8px] overflow-hidden border border-gray-100 lg:border-none shadow-sm md:shadow-none">
                            <div className="h-[40px] bg-[#C0C0C0] flex items-center px-4">
                                <h3 className="font-inter font-bold text-[18px] md:text-[20px] text-[#194473]">Location</h3>
                            </div>
                            <div className="bg-[#F5F5F5] p-4 flex flex-col gap-2 min-h-[99px]">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-[#616161] flex-shrink-0 mt-0.5" />
                                    <p className="text-[14px] leading-tight text-[#212121]">{place.formatted_address || place.country}</p>
                                </div>
                                <a href={place.google_maps_url} target="_blank" rel="noreferrer" className="text-[13px] text-[#2196F3] font-bold self-end flex items-center gap-1 hover:underline">View on Google Maps <ExternalLink size={14} /></a>
                            </div>
                        </div>

                        <div className="w-full rounded-[8px] overflow-hidden border border-gray-100 lg:border-none">
                            <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4 font-inter font-bold text-[18px] md:text-[20px] text-[#194473]">Opening hours</div>
                            <div className="bg-[#F5F5F5] p-4">
                                <div className="flex items-start gap-2">
                                    <Clock className="w-5 h-5 text-[#212121] flex-shrink-0 mt-0.5" />
                                    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[14px] leading-relaxed text-[#212121]">
                                        <span className="font-bold text-[#194473]">Open daily:</span>
                                        <span>{place.opening_hours || "24 Hours"}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="w-full rounded-[8px] overflow-hidden border border-gray-100 lg:border-none">
                            <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4 font-inter font-bold text-[18px] md:text-[20px] text-[#194473]">Price</div>
                            <div className="bg-[#F5F5F5] p-4 text-[14px] md:text-[16px] text-[#212121] font-medium">{place.price_detail || "Free Entry"}</div>
                        </div>

                        {displayTags.length > 0 && (
                            <div className="w-full rounded-[8px] overflow-hidden border border-gray-100 lg:border-none">
                                <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4 font-inter font-bold text-[18px] md:text-[20px] text-[#194473]">Tags</div>
                                <div className="bg-[#F5F5F5] p-4 flex flex-wrap gap-2">
                                    {displayTags.map(tag => (
                                        <span key={tag} onClick={() => router.push(`/explore?tag=${tag}`)} className="px-3 py-1 bg-[#757575] text-white rounded-full text-[12px] font-medium hover:bg-[#616161] cursor-pointer transition-colors capitalize shrink-0">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {morePictures.length > 0 && currentReviews.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h3 className="font-inter font-bold text-[18px] md:text-[20px] text-[#194473]">More Pictures</h3>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {morePictures.slice(0, 3).map((img, idx) => (
                                        <div key={idx} className="relative w-[100px] h-[100px] sm:w-[140px] sm:h-[140px] rounded-[8px] overflow-hidden cursor-pointer shadow-sm shrink-0" onClick={() => openReviewImageModal(img)}>
                                            <Image src={img} alt="more" fill className="object-cover" sizes="140px" unoptimized={isRiskyImage(img)} />
                                            {idx === 2 && morePictures.length > 3 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-lg">+ {morePictures.length - 3}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {nearbyPlaces && nearbyPlaces.length > 0 && (
                            <div className="flex flex-col gap-4">
                                <h3 className="font-inter font-bold text-[18px] md:text-[20px] text-[#194473]">Best nearby</h3>
                                <div className="flex flex-col gap-3">
                                    {nearbyPlaces.map((nearby) => {
                                        const nearbyThumb = nearby.images && nearby.images.length > 0 ? (typeof nearby.images[0] === 'string' ? nearby.images[0] : (nearby.images[0] as any).url) : "https://placehold.co/80x80";
                                        return (
                                            <div key={nearby.id} onClick={() => router.push(`/detail?id=${nearby.id}`)} className="bg-[#F5F5F5] rounded-[8px] p-2 flex gap-3 cursor-pointer border border-[#1E518C] hover:bg-blue-50 transition-colors w-full">
                                                <div className="relative w-[70px] h-[70px] md:w-[80px] md:h-[80px] flex-shrink-0">
                                                    <Image src={nearbyThumb} alt="near" fill className="rounded-lg object-cover" sizes="80px" unoptimized />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0 flex-1">
                                                    <h4 className="font-bold text-[14px] md:text-[16px] text-[#212121] truncate leading-tight mb-1">{nearby.name}</h4>
                                                    <p className="text-[12px] text-[#757575] truncate mb-2">{nearby.province_state}</p>
                                                    <div className="flex items-center gap-1">
                                                        <div className="flex">
                                                            {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= Math.round(nearby.rating || 0) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"} />)}
                                                        </div>
                                                        <span className="text-[11px] text-[#212121]">({nearby.rating || 0})</span>
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
    );
}