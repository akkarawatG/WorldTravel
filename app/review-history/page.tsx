"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { getUserReviews, deleteReview, UserReview } from "@/services/reviewService";
import { Star, MapPin, MoreHorizontal, Pencil, Trash2, Share2, ThumbsUp, Settings } from "lucide-react";
import Navbar from "@/components/Navbar";

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

    // Handlers
    const handleDelete = async (reviewId: string | number) => {
        if (confirm("Are you sure you want to delete this review?")) {
            const success = await deleteReview(String(reviewId)); // Ensure string ID
            if (success) {
                setReviews(prev => prev.filter(r => r.id !== reviewId));
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
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#212121]">


            {/* 1. Header Section */}
            <div className="max-w-[1128px] mx-auto pt-6 ">
                <div className="flex items-center gap-2 flex-wrap pt 6 mb-4 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="text-[#101828]">Profile</span>
                </div>
            </div>

            <main className="max-w-[1128px] mx-auto ">

                {/* Profile Header */}
                <div className="w-full bg-[#DEECF94D] rounded-[16px] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center w-[284px] h-[85px] gap-[18px]">
                        <div className="w-[85px] h-[85px] rounded-full overflow-hidden border-2 border-white shadow-sm relative flex-shrink-0">
                            <Image
                                src={user?.image || "https://placehold.co/100x100"}
                                alt={user?.name}
                                fill
                                className="object-cover"
                                unoptimized={isRiskyImage(user?.image || "")}
                            />
                        </div>
                        {/* Text Container: 181x61 */}
                        <div className="flex flex-col justify-between w-[181px] h-[61px]">
                            {/* Name: 32px SemiBold */}
                            <h1 className="font-inter font-semibold text-[32px] text-[#212121] leading-none truncate">
                                {user?.name}
                            </h1>
                            {/* Email: 14px Regular */}
                            <p className="font-inter font-normal text-[14px] text-[#757575] leading-none truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    {/* Right Actions Container: 550x89 */}
                    <div className="flex flex-col items-end w-[550px] h-[89px] gap-[32px]">

                        {/* Edit Profile Button */}
                        <button className="flex items-center justify-center w-[138px] h-[35px] gap-[8px] bg-[#C0C0C0] border border-[#EEEEEE] rounded-[8px] px-[16px] py-[8px] hover:bg-[#b0b0b0] transition-colors"
                                              onClick={() => {
                        // ✅ สั่งเปลี่ยนหน้า พร้อมแนบ Params
                        router.push('/review-history?action=edit-profile');
                      }}
                        >
                            <Settings size={16} className="text-[#212121] " />
                            <span className="font-inter font-normal text-[16px] text-[#212121] leading-none">
                                Edit profile
                            </span>
                        </button>

                        {/* Reviews Count */}
                        <span className="text-[#194473] font-medium text-[16px] leading-none">
                            Reviews {reviews?.length || 0}
                        </span>
                    </div>
                </div>

                <h2 className="font-inter font-bold text-[36px] text-[#194473] leading-none tracking-normal mb-6">
                    Reviews
                </h2>

                {reviews.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-[16px] border border-dashed border-gray-300">
                        You haven't written any reviews yet.
                    </div>
                ) : (
                    /* ✅ Main Grid Container */
                    <div className="w-[1128px] mx-auto grid grid-cols-2 gap-[16px]">
                        {reviews.map((review) => (
                            /* ✅ Card Item: เอา p-4 ออก และเพิ่ม overflow-hidden */
                            <div key={review.id} className="w-[553px] h-auto border border-[#EEEEEE] rounded-[16px] bg-white shadow-sm hover:shadow-md transition-shadow relative flex flex-col overflow-hidden">

                                {/* ✅ Header: ปรับให้เต็มพื้นที่ (w-full), ลบ border รอบตัวเหลือแค่ border-b, ลบ rounded */}
                                <div className="flex justify-between items-center w-full h-[55px] bg-[#F0F6FC] border-b border-[#EEEEEE] px-[16px] flex-shrink-0">

                                    <div className="flex items-center gap-3">
                                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden relative border border-[#E0E0E0] bg-white">
                                            <Image src={user?.image || "https://placehold.co/40x40"} alt={user?.name} fill className="object-cover" unoptimized={isRiskyImage(user?.image || "")} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[16px] text-[#194473] leading-tight">{user?.name}</h3>
                                            <p className="text-[12px] text-[#9E9E9E]">{formatDate(review.created_at)}</p>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <button onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)} className="p-1 hover:bg-white rounded-full text-gray-500 transition-colors">
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {openMenuId === review.id && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                                {/* ✅ Container: w-[129px] rounded-[16px] (Top+Bottom) */}
                                                <div className="absolute right-0 top-8 w-[129px] bg-white rounded-[16px] shadow-lg z-20 flex flex-col">

                                                    {/* ✅ Edit Button: Hover Style ตามสเปก */}
                                                    <button
                                                        onClick={() => handleEdit(review)}
                                                        className="w-full h-[33px] flex items-center gap-[8px] px-[12px] py-[8px] text-[14px] text-[#194473] 
                                                             rounded-t-[16px] border border-transparent border-b-0
                                                             hover:bg-[#2666B0] hover:text-white hover:border-[#C2DCF3] hover:border-t hover:border-l hover:border-r hover:border-b-0
                                                             transition-colors"
                                                    >
                                                        <Pencil size={14} /> Edit
                                                    </button>

                                                    {/* ✅ Delete Button: Hover Style ตามสเปก */}
                                                    <button
                                                        onClick={() => handleDelete(review.id)}
                                                        className="w-full h-[33px] flex items-center gap-[8px] px-[12px] py-[8px] text-[14px] text-[#F44336] 
                                                             rounded-b-[16px] border border-transparent
                                                             hover:bg-[#F44336] hover:text-white hover:border-[#EF9A9A]
                                                             transition-colors"
                                                    >
                                                        <Trash2 size={14} /> Delete
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* ✅ Body Wrapper: ใส่ p-4 ตรงนี้แทน เพื่อให้เนื้อหาไม่ชิดขอบ แต่ Header ชิดขอบ */}
                                <div className="p-4 flex flex-col flex-grow h-full justify-between">

                                    {/* Top Content Group */}
                                    <div>
                                        {/* Rating */}
                                        <div className="flex items-center gap-1 mb-2">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} size={14} className={`${star <= review.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-200 text-gray-200"}`} />
                                            ))}
                                            <span className="text-[12px] text-[#757575] ml-1">({review.rating})</span>
                                        </div>

                                        {/* Content */}
                                        <p className="text-[14px] text-[#212121] leading-relaxed mb-4 line-clamp-4 min-h-[40px]">
                                            {review.content}
                                        </p>
                                    </div>

                                    {/* Place Card (Bottom) */}
                                    <div onClick={() => router.push(`/detail?id=${review.place.id}`)} className="flex gap-3 bg-[#F5F5F5] p-2 rounded-[8px] cursor-pointer hover:bg-[#E3F2FD] transition-colors border border-transparent hover:border-[#BBDEFB]">
                                        <div className="w-[80px] h-[80px] rounded-[8px] overflow-hidden flex-shrink-0 relative">
                                            <Image src={review.place.image} alt={review.place.name} fill className="object-cover" unoptimized={isRiskyImage(review.place.image)} />
                                        </div>
                                        <div className="flex flex-col justify-center gap-1 overflow-hidden">
                                            <h4 className="font-bold text-[16px] text-[#212121] truncate">{review.place.name}</h4>
                                            <div className="flex items-center gap-1">
                                                <div className="flex text-[#FFCC00]">
                                                    <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} fill="currentColor" /> <Star size={10} className="text-gray-300" />
                                                </div>
                                                <span className="text-[10px] text-[#757575]">(4.0)</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-[12px] text-[#9E9E9E] truncate">
                                                <MapPin size={12} /> <span>{review.place.province_state}, {review.place.country}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}