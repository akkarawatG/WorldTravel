"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { getUserReviews, deleteReview, UserReview } from "@/services/reviewService";
import { Star, MapPin, MoreHorizontal, Pencil, Trash2, Share2, ThumbsUp, Settings, ChevronLeft, ChevronRight } from "lucide-react";

const ITEMS_PER_PAGE = 6; // จำนวนรีวิวต่อ 1 หน้า

const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
};

export default function ReviewHistoryPage() {
    const router = useRouter();
    const supabase = createClient();

    const [user, setUser] = useState<any>(null);
    const [reviews, setReviews] = useState<UserReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [openMenuId, setOpenMenuId] = useState<string | number | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            const userData = {
                id: user.id,
                name: profile?.username || user.email,
                image: profile?.avatar_url,
                email: user.email
            };
            setUser(userData);

            const userReviews = await getUserReviews(user.id);
            setReviews(userReviews);
            setLoading(false);
        };

        init();
    }, [router]);

    // ✅ Pagination Logic
    const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE);
    const currentData = useMemo(() => {
        const firstPageIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const lastPageIndex = firstPageIndex + ITEMS_PER_PAGE;
        return reviews.slice(firstPageIndex, lastPageIndex);
    }, [currentPage, reviews]);

    const getPaginationGroup = () => {
        const pageNumbers = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
        } else {
            if (currentPage <= 3) {
                pageNumbers.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pageNumbers.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pageNumbers;
    };

    const handlePageChange = (page: number | string) => {
        if (typeof page === 'number') {
            setCurrentPage(page);
            // เลื่อนขึ้นไปที่หัวข้อ Reviews เมื่อเปลี่ยนหน้า
            document.getElementById('reviews-title')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Handlers
    const handleDelete = async (reviewId: string | number) => {
        if (confirm("Are you sure you want to delete this review?")) {
            const success = await deleteReview(String(reviewId));
            if (success) {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
                if (currentData.length === 1 && currentPage > 1) setCurrentPage(prev => prev - 1);
            } else {
                alert("Failed to delete review.");
            }
        }
        setOpenMenuId(null);
    };

    const handleEdit = (review: UserReview) => {
        router.push(`/review/edit/${review.id}`);
    };

    const isRiskyImage = (url: string) => !url.includes('supabase.co') && !url.includes('unsplash.com');

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#212121] overflow-x-hidden">
            {/* Breadcrumb */}
            <div className="w-full max-w-[1128px] mx-auto pt-6 px-4 md:px-0 mb-4">
                <div className="flex items-center gap-2 flex-wrap font-Inter font-[600] text-[12px] md:text-[14px] leading-none text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="text-[#101828]">Profile</span>
                </div>
            </div>

            <main className="w-full max-w-[1128px] mx-auto px-4 md:px-0">
                {/* Profile Header */}
                <div className="w-full bg-[#DEECF94D] rounded-[16px] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-[#1E518C]">
                    <div className="flex flex-col md:flex-row items-center gap-[18px] text-center md:text-left">
                        <div className="w-[85px] h-[85px] rounded-full overflow-hidden border-2 border-white shadow-sm relative flex-shrink-0">
                            <Image
                                src={user?.image || "https://placehold.co/100x100"}
                                alt={user?.name}
                                fill
                                className="object-cover"
                                unoptimized={isRiskyImage(user?.image || "")}
                            />
                        </div>
                        <div className="flex flex-col justify-center gap-1">
                            <h1 className="font-inter font-semibold text-[24px] md:text-[32px] text-[#212121] leading-tight truncate max-w-[250px] md:max-w-none">
                                {user?.name}
                            </h1>
                            <p className="font-inter font-normal text-[14px] text-[#757575] leading-none truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4 md:gap-[32px]">
                        <button 
                            className="flex items-center justify-center gap-[8px] bg-[#C0C0C0] border border-[#EEEEEE] rounded-[8px] px-4 py-2 hover:bg-[#b0b0b0] transition-colors cursor-pointer"
                            onClick={() => router.push('/review-history?action=edit-profile')}
                        >
                            <Settings size={16} className="text-[#212121]" />
                            <span className="font-inter font-normal text-[14px] md:text-[16px] text-[#212121]">Edit profile</span>
                        </button>
                        <span className="text-[#194473] font-bold text-[14px] md:text-[16px] leading-none">
                            Reviews {reviews?.length || 0}
                        </span>
                    </div>
                </div>

                <h2 id="reviews-title" className="font-inter font-bold text-[28px] md:text-[36px] text-[#194473] mb-6">
                    Reviews
                </h2>

                {reviews.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 bg-gray-50 rounded-[16px] border border-dashed border-gray-300 px-4">
                        You haven't written any reviews yet.
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-[16px]">
                            {currentData.map((review) => (
                                <div key={review.id} className="w-full h-auto border border-[#1E518C] rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow relative flex flex-col overflow-hidden">
                                    {/* Card Header */}
                                    <div className="flex justify-between items-center w-full h-[55px] bg-[#F0F6FC] border-b border-[#EEEEEE] px-4 flex-shrink-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-[36px] h-[36px] rounded-full overflow-hidden relative border border-[#E0E0E0] bg-white">
                                                <Image src={user?.image || "https://placehold.co/40x40"} alt={user?.name} fill className="object-cover" unoptimized={isRiskyImage(user?.image || "")} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-[14px] md:text-[16px] text-[#194473] leading-tight truncate">{user?.name}</h3>
                                                <p className="text-[10px] md:text-[12px] text-[#9E9E9E]">{formatDate(review.created_at)}</p>
                                            </div>
                                        </div>

                                        <div className="relative">
                                            <button onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)} className="p-1 hover:bg-white rounded-full text-gray-500 transition-colors cursor-pointer">
                                                <MoreHorizontal size={20} />
                                            </button>
                                            {openMenuId === review.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                    <div className="absolute right-0 top-8 w-[120px] bg-white rounded-[12px] shadow-xl z-20 flex flex-col border border-gray-100 overflow-hidden">
                                                        <button onClick={() => handleEdit(review)} className="w-full px-4 py-2.5 text-[13px] text-[#194473] flex items-center gap-2 hover:bg-[#2666B0] hover:text-white cursor-pointer transition-colors"><Pencil size={14} /> Edit</button>
                                                        <button onClick={() => handleDelete(review.id)} className="w-full px-4 py-2.5 text-[13px] text-[#F44336] flex items-center gap-2 hover:bg-[#F44336] hover:text-white cursor-pointer border-t border-gray-50 transition-colors"><Trash2 size={14} /> Delete</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Body */}
                                    <div className="p-4 flex flex-col flex-grow justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-1 mb-2">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star key={star} size={14} className={`${star <= review.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-200 text-gray-200"}`} />
                                                ))}
                                                <span className="text-[12px] text-[#757575] ml-1">({review.rating})</span>
                                            </div>
                                            <p className="text-[14px] text-[#212121] leading-relaxed line-clamp-4">
                                                {review.content}
                                            </p>
                                        </div>

                                        <div onClick={() => router.push(`/detail?id=${review.place.id}`)} className="flex gap-3 bg-[#F5F5F5] p-2 rounded-[8px] cursor-pointer hover:bg-gray-200 transition-colors border border-[#1E518C]">
                                            <div className="w-[60px] h-[60px] md:w-[80px] md:h-[80px] rounded-[6px] overflow-hidden flex-shrink-0 relative">
                                                <Image src={review.place.image} alt={review.place.name} fill className="object-cover" unoptimized={isRiskyImage(review.place.image)} />
                                            </div>
                                            <div className="flex flex-col justify-center min-w-0 flex-grow">
                                                <h4 className="font-bold text-[14px] md:text-[16px] text-[#212121] truncate leading-tight">{review.place.name}</h4>
                                                <div className="flex items-center gap-1 text-[11px] text-[#9E9E9E] mt-1">
                                                    <MapPin size={10} className="shrink-0" /> 
                                                    <span className="truncate">{review.place.province_state}, {review.place.country}</span>
                                                </div>
                                            </div>
                                        </div>


                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* ✅ Pagination Controls (Matching AllCountries Style) */}
                        {totalPages > 1 && (
                            <div className="flex justify-center md:justify-start items-center gap-[8px] mt-10 md:mt-12 mb-10 font-inter">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`flex items-center justify-center w-[36px] h-[32px] md:w-[32px] md:h-[24px] rounded-[4px] border border-[#EEEEEE] transition cursor-pointer
                                        ${currentPage === 1 ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed" : "bg-[#9E9E9E] hover:bg-gray-500"}`}
                                >
                                    <ChevronLeft size={18} className="text-white" />
                                </button>

                                <div className="flex items-center gap-[6px] md:gap-[8px]">
                                    {getPaginationGroup().map((item, index) => {
                                        if (item === '...') {
                                            return <span key={`dots-${index}`} className="flex items-center justify-center text-[16px] md:text-[14px] font-bold text-[#194473] tracking-[2px] pb-1 px-1">...</span>;
                                        }
                                        const page = item as number;
                                        const isActive = currentPage === page;
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`flex items-center justify-center w-[32px] h-[32px] md:w-[25px] md:h-[25px] rounded-[4px] border text-[14px] md:text-[12px] font-medium transition-colors cursor-pointer 
                                                    ${isActive ? "bg-[#194473] text-white border-[#194473]" : "bg-[#9E9E9E] text-white border-[#EEEEEE] hover:bg-gray-500"}`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`flex items-center justify-center w-[36px] h-[32px] md:w-[32px] md:h-[24px] rounded-[4px] border border-[#EEEEEE] transition cursor-pointer
                                        ${currentPage === totalPages ? "bg-[#E0E0E0] opacity-50 cursor-not-allowed" : "bg-[#9E9E9E] hover:bg-gray-500"}`}
                                >
                                    <ChevronRight size={18} className="text-white" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}