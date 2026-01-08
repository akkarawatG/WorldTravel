"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, MouseEvent } from "react";
import { MapPin, Clock, Star, ArrowLeft, ExternalLink, Sun, X, ChevronLeft, ChevronRight, Lightbulb, Search } from "lucide-react";
import { ATTRACTIONS_DATA } from "../../data/attractionsData";

function DetailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = searchParams.get("id");
    const place = ATTRACTIONS_DATA.find((item) => item.id === id);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalIndex, setModalIndex] = useState(0);

    // Review States
    const [activeStarFilter, setActiveStarFilter] = useState("All");
    const [reviewPage, setReviewPage] = useState(1);

    const allImages = place?.images && place.images.length > 0
        ? place.images
        : [{ url: "https://via.placeholder.com/1200x600?text=No+Image" }];

    const extendedImages = allImages.length > 1
        ? [...allImages, allImages[0]]
        : allImages;

    // Filter Logic: ดึงข้อมูลจาก place.reviews แทน
    const currentReviews = place?.reviews || [];

    const filteredReviews = currentReviews.filter(review => {
        if (activeStarFilter === "All") return true;
        const starValue = parseInt(activeStarFilter.split(" ")[0]);
        return review.rating === starValue;
    });

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
        const realIndex = currentImageIndex >= allImages.length ? 0 : currentImageIndex;
        setModalIndex(realIndex);
        setShowModal(true);
    };

    const nextModalImage = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setModalIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevModalImage = (e: MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setModalIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    if (!place) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-500">
                <h2 className="text-xl font-bold mb-2">Attraction Not Found</h2>
                <button onClick={() => router.back()} className="text-blue-500 hover:underline flex items-center gap-2">
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-gray-800 pb-20 relative">

            {/* MODAL POPUP SECTION */}
            {showModal && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/70"
                        onClick={() => setShowModal(false)}
                    />
                    <div className="relative bg-white flex flex-col z-10"
                        style={{ width: '1128px', height: '633px', borderRadius: '8px', border: '2px solid #EEEEEE' }}
                    >
                        <div className="w-full flex justify-between items-center bg-white"
                            style={{ height: '103px', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', borderBottom: '2px solid #EEEEEE', paddingTop: '32px', paddingBottom: '32px', paddingRight: '64px', paddingLeft: '65px' }}
                        >
                            <div className="flex items-center gap-4">
                                <h2 style={{ fontFamily: 'Inter', fontWeight: 600, fontSize: '32px', lineHeight: '100%', color: '#194473' }}>
                                    {place.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} size={24} className={`${star <= Math.round(place.rating) ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-300 text-gray-300"}`} />
                                        ))}
                                    </div>
                                    <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '20px', lineHeight: '100%', color: '#212121' }}>
                                        ({place.rating})
                                    </span>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} style={{ width: '32px', height: '32px', borderRadius: '30px', backgroundColor: '#616161', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                <X size={14} strokeWidth={3} />
                            </button>
                        </div>
                        <div className="flex-1 flex items-center justify-between px-10 relative bg-black/5 overflow-hidden">
                            <button onClick={prevModalImage} style={{ width: '32px', height: '32px', borderRadius: '30px', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-gray-300 transition">
                                <ChevronLeft size={20} color="white" strokeWidth={3} />
                            </button>
                            <div className="flex justify-center items-center w-full h-full p-4">
                                <img src={allImages[modalIndex].url} alt="Gallery Modal" className="max-h-full max-w-full object-contain shadow-lg rounded-md" />
                            </div>
                            <button onClick={nextModalImage} style={{ width: '32px', height: '32px', borderRadius: '30px', backgroundColor: '#E0E0E0', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="hover:bg-gray-300 transition">
                                <ChevronRight size={20} color="white" strokeWidth={3} />
                            </button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                {modalIndex + 1} / {allImages.length}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Breadcrumb Section */}
            <div className="max-w-[1440px] mx-auto px-[156px] pt-6 mb-4">
                <div className="flex items-center gap-2 flex-wrap mb-2 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span>{place.location.continent}</span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.location.country}`)}>
                        {place.location.country}
                    </span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.location.country}&search=${place.location.province_state}`)}>
                        {place.location.province_state}
                    </span>/
                    <span className="truncate max-w-[200px] md:max-w-none hover:underline cursor-pointer">{place.name}</span>
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
                                    <div
                                        className={`flex h-full ease-in-out ${isTransitioning ? 'transition-transform duration-700' : ''}`}
                                        style={{ transform: `translateX(-${currentImageIndex * 100}%)` }}
                                    >
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
                            <div className="gap-6">
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473]">About</h2>
                                <p className="font-inter font-[400] text-[16px] leading-[100%] tracking-[0] text-justify text-[#212121] mt-6">
                                    {place.description_long || place.description_short}
                                </p>
                            </div>

                            <section>
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473] mb-6">
                                    Best Season to Visit
                                </h2>
                                <div className="w-[631px] rounded-[8px] overflow-hidden border border-[#EF9A9A]">
                                    <div className="w-full h-[40px] flex items-center px-4 gap-2" style={{ backgroundColor: '#E57373' }}>
                                        <Sun size={20} className="text-white" />
                                        <span className="font-inter font-semibold text-[16px] text-white">
                                            Summer season (April - May)
                                        </span>
                                    </div>
                                    <div className="w-full h-[50px] flex flex-col justify-center px-4" style={{ backgroundColor: '#FFEBEE' }}>
                                        <p className="font-inter text-[14px] text-justify text-[#212121] leading-tight">
                                            <span className="font-semibold text-[#EF6C00]">Suggest: </span>
                                            {place.best_season_to_visit || "Laterite rock retains heat, so walking around midday might be too much. It's recommended to always bring an umbrella or hat."}
                                        </p>
                                    </div>
                                </div>

                                <div className="w-[631px] h-[107px] mt-4 flex flex-col justify-center gap-[5px] bg-white border border-[#90CAF9] rounded-[8px] px-[16px] py-[8px]">
                                    <div className="w-[73px] h-[24px] flex items-center gap-[10px]">
                                        <Lightbulb size={24} className="text-[#2196F3]" />
                                        <h3 className="font-inter font-bold text-[18px] leading-[100%] tracking-[0] text-[#212121]">
                                            Tips
                                        </h3>
                                    </div>
                                    <p className="font-inter text-[14px] text-[#212121] leading-tight mb-2">
                                        We recommend comfortable walking shoes because you'll be walking on grass and dirt.
                                    </p>
                                    <p className="font-inter text-[14px] text-[#212121] leading-tight">
                                        <span className="font-bold">Outfit: </span>
                                        White, cream, or brightly colored clothing like red or yellow will help you stand out from the brown rock background.
                                    </p>
                                </div>
                            </section>

                            <section>
                                <h2 className="font-inter font-black text-[36px] leading-[100%] tracking-normal text-[#194473] mb-6">
                                    Reviews
                                </h2>

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
                                        filteredReviews.map((review) => (
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
                                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                                        {review.images.map((img, idx) => (
                                                            <img key={idx} src={img} alt={`Review image ${idx}`} className="w-[60px] h-[60px] object-cover rounded-[4px] border border-[#E0E0E0] hover:opacity-90 cursor-pointer" />
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="w-[631px] py-8 text-center text-gray-500 bg-gray-50 rounded-[8px] border border-gray-200">
                                            No reviews found for {activeStarFilter} rating.
                                        </div>
                                    )}
                                </div>

                                {/* ✅ PAGINATION SECTION (UPDATED) */}
                                <div className="flex items-center justify-between gap-[8px] mb-10">
                                    {/* 1. ส่วน Pagination (ชิดซ้าย) */}
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setReviewPage((p) => Math.max(1, p - 1))}
                                            disabled={reviewPage === 1}
                                            className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-[#757575]"
                                        >
                                            <ChevronLeft size={16} className="text-white" />
                                        </button>

                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((page) => (
                                                <button
                                                    key={page}
                                                    onClick={() => setReviewPage(page)}
                                                    className={`flex items-center justify-center w-[25px] h-[25px] px-[8px] py-[4px] rounded-[4px] border border-[#EEEEEE] text-[12px] font-medium transition-colors ${reviewPage === page
                                                        ? "bg-[#194473] text-white"
                                                        : "bg-[#9E9E9E] text-white hover:bg-gray-400"
                                                        }`}
                                                >
                                                    {page}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setReviewPage((p) => Math.min(5, p + 1))}
                                            disabled={reviewPage === 5}
                                            className="flex items-center justify-center w-[32px] h-[24px] gap-[8px] px-[8px] py-[4px] rounded-[4px] bg-[#9E9E9E] border border-[#EEEEEE] disabled:opacity-50 disabled:cursor-not-allowed transition hover:bg-[#757575]"
                                        >
                                            <ChevronRight size={16} className="text-white" />
                                        </button>
                                    </div>

                                    {/* 2. ปุ่ม Review (ชิดขวา) */}
                                    <button className="h-[30px] px-4 bg-[#194473] text-white rounded-[8px] font-bold text-[14px] hover:bg-[#153a61]">
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
                                        <p className="font-inter font-normal text-[14px] leading-tight">{place.location.province_state}, {place.location.country} <br /></p>
                                    </div>
                                    <div className="flex justify-end mt-auto">
                                        <a href={`https://www.google.com/maps/search/?api=1&query=$$${place.location.lat},${place.location.lon}`} target="_blank" rel="noreferrer" className="text-xs text-[#2196F3] font-bold hover:underline flex items-center gap-1">
                                            View on Google Maps <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="w-[456px] h-[89px] rounded-[8px] overflow-hidden shadow-sm font-inter">
                                <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4">
                                    <h3 className="font-bold text-[20px] text-[#194473] leading-none">Opening hours</h3>
                                </div>
                                <div className="h-[49px] bg-[#F5F5F5] px-4 flex items-center">
                                    <div className="flex items-center gap-3">
                                        <Clock className="w-5 h-5 text-[#212121]" strokeWidth={1.5} />
                                        <div className="flex items-center gap-1 text-[14px]">
                                            <span className="font-semibold text-[#194473]">Open daily:</span>
                                            <span className="font-normal text-[#212121]">{place.opening_hours_text || "08:30 - 16:30"}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {place.category_tags && place.category_tags.length > 0 && (
                                <div className="w-[456px] h-[97px] rounded-[8px] overflow-hidden shadow-sm font-inter">
                                    <div className="h-[40px] bg-[#C4C4C4] flex items-center px-4">
                                        <h3 className="font-bold text-[20px] text-[#194473] leading-none">Tag</h3>
                                    </div>
                                    <div className="h-[57px] bg-[#F5F5F5] px-4 flex items-center gap-2">
                                        {place.category_tags.map((tag) => (
                                            <span key={tag} onClick={() => router.push(`/explore?tag=${tag}`)} className="h-[25px] flex items-center justify-center bg-[#757575] hover:bg-[#616161] transition-colors cursor-pointer text-white px-3 rounded-full text-xs font-normal capitalize leading-none">
                                                {tag.replace(/_/g, " ")}
                                            </span>
                                        ))}
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

export default function DetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DetailContent />
        </Suspense>
    );
}