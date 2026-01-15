"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { getUserReviews, deleteReview, UserReview } from "@/services/reviewService";
import { Star, MapPin, MoreHorizontal, Pencil, Trash2, Share2, ThumbsUp } from "lucide-react";
import Navbar from "@/components/Navbar";
import ReviewModal from "@/components/ReviewModal";

// Helper Formatter
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
  
  // State
  const [user, setUser] = useState<any>(null);
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dropdown State
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  
  // Edit Modal State
  const [editingReview, setEditingReview] = useState<UserReview | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/'); 
        return;
      }

      // 2. Get Profile Info
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const userData = {
        id: user.id,
        name: profile?.username || user.user_metadata?.full_name || user.email,
        image: profile?.avatar_url || user.user_metadata?.avatar_url,
        email: user.email
      };
      setUser(userData);

      // 3. Fetch Reviews
      const userReviews = await getUserReviews(user.id);
      setReviews(userReviews);
      setLoading(false);
    };

    init();
  }, [router]);

  // Handlers
  const handleDelete = async (reviewId: number) => {
    if (confirm("Are you sure you want to delete this review?")) {
      const success = await deleteReview(reviewId);
      if (success) {
        setReviews(prev => prev.filter(r => r.id !== reviewId));
      } else {
        alert("Failed to delete review.");
      }
    }
    setOpenMenuId(null);
  };

  const handleEdit = (review: UserReview) => {
    setEditingReview(review);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  // Safe Image Logic (เหมือนหน้า Home)
  const isRiskyImage = (url: string) => !url.includes('supabase.co') && !url.includes('unsplash.com');

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#212121]">

      <main className="max-w-[1000px] mx-auto px-4 py-8">
        
        {/* Profile Header */}
        <div className="w-full bg-[#DEECF94D] rounded-[16px] p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-white shadow-sm relative">
               <Image 
                 src={user?.image || "https://placehold.co/100x100"} 
                 alt={user?.name} 
                 fill
                 className="object-cover"
                 unoptimized={isRiskyImage(user?.image || "")}
               />
            </div>
            <div>
              <h1 className="text-[24px] font-bold text-[#212121]">{user?.name}</h1>
              <p className="text-[#757575] text-[14px]">{user?.email}</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
             <button className="px-4 py-2 bg-[#e0e0e0] rounded-[8px] text-[14px] font-semibold hover:bg-[#d0d0d0] transition">
                Edit profile
             </button>
             <span className="text-[#194473] font-medium text-[16px]">Reviews {reviews.length}</span>
          </div>
        </div>

        <h2 className="text-[32px] font-bold text-[#194473] mb-6">Reviews</h2>

        {reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-[16px] border border-dashed border-gray-300">
                You haven't written any reviews yet.
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => (
                <div key={review.id} className="border border-[#EEEEEE] rounded-[16px] p-4 bg-white shadow-sm hover:shadow-md transition-shadow relative">
                
                {/* Header: User & Date */}
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-[40px] h-[40px] rounded-full overflow-hidden relative">
                            <Image 
                                src={user?.image || "https://placehold.co/40x40"} 
                                alt={user?.name} 
                                fill
                                className="object-cover"
                                unoptimized={isRiskyImage(user?.image || "")}
                            />
                        </div>
                        <div>
                            <h3 className="font-bold text-[16px] text-[#194473] leading-tight">{user?.name}</h3>
                            <p className="text-[12px] text-[#9E9E9E]">{formatDate(review.created_at)}</p>
                        </div>
                    </div>

                    {/* Context Menu (Edit/Delete) */}
                    <div className="relative">
                        <button 
                            onClick={() => setOpenMenuId(openMenuId === review.id ? null : review.id)}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                        >
                            <MoreHorizontal size={20} />
                        </button>
                        
                        {openMenuId === review.id && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)}></div>
                                <div className="absolute right-0 top-8 w-[140px] bg-white border border-[#EEEEEE] rounded-[8px] shadow-lg z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                                    <button 
                                        onClick={() => handleEdit(review)}
                                        className="w-full text-left px-4 py-2 text-[14px] hover:bg-blue-50 text-[#194473] flex items-center gap-2 transition-colors"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(review.id)}
                                        className="w-full text-left px-4 py-2 text-[14px] hover:bg-red-50 text-[#F44336] flex items-center gap-2 transition-colors"
                                    >
                                        <Trash2 size={14} /> Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                    <Star 
                        key={star} 
                        size={14} 
                        className={`${star <= review.rating ? "fill-[#FFCC00] text-[#FFCC00]" : "fill-gray-200 text-gray-200"}`} 
                    />
                    ))}
                    <span className="text-[12px] text-[#757575] ml-1">({review.rating})</span>
                </div>

                {/* Content */}
                <p className="text-[14px] text-[#212121] leading-relaxed mb-4 line-clamp-4 min-h-[40px]">
                    {review.content}
                </p>

                {/* Attached Place Card */}
                <div 
                    onClick={() => router.push(`/detail?id=${review.place.id}`)}
                    className="flex gap-3 bg-[#F5F5F5] p-2 rounded-[8px] cursor-pointer hover:bg-[#E3F2FD] transition-colors border border-transparent hover:border-[#BBDEFB]"
                >
                    <div className="w-[80px] h-[80px] rounded-[8px] overflow-hidden flex-shrink-0 relative">
                        <Image 
                            src={review.place.image} 
                            alt={review.place.name} 
                            fill
                            className="object-cover"
                            unoptimized={isRiskyImage(review.place.image)}
                        />
                    </div>
                    <div className="flex flex-col justify-center gap-1 overflow-hidden">
                        <h4 className="font-bold text-[16px] text-[#212121] truncate">{review.place.name}</h4>
                        <div className="flex items-center gap-1">
                            <div className="flex text-[#FFCC00]">
                                <Star size={10} fill="currentColor" />
                                <Star size={10} fill="currentColor" />
                                <Star size={10} fill="currentColor" />
                                <Star size={10} fill="currentColor" />
                                <Star size={10} className="text-gray-300" />
                            </div>
                            <span className="text-[10px] text-[#757575]">(4.0)</span>
                        </div>
                        <div className="flex items-center gap-1 text-[12px] text-[#9E9E9E] truncate">
                            <MapPin size={12} /> 
                            <span>{review.place.province_state}, {review.place.country}</span>
                        </div>
                    </div>
                </div>

                {/* Actions Footer */}
                <div className="flex items-center gap-6 mt-4 pt-3 border-t border-[#EEEEEE]">
                    <button className="flex items-center gap-2 text-[14px] text-[#194473] font-medium hover:opacity-80 transition-opacity">
                        <ThumbsUp size={16} /> Like
                    </button>
                    <button className="flex items-center gap-2 text-[14px] text-[#194473] font-medium hover:opacity-80 transition-opacity">
                        <Share2 size={16} /> Share
                    </button>
                </div>

                </div>
            ))}
            </div>
        )}
      </main>

      {/* Review Modal for Editing */}
      {isEditModalOpen && editingReview && (
        <ReviewModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          placeId={editingReview.place.id}
          isEditing={true}
          reviewId={editingReview.id}
          initialData={{
            rating: editingReview.rating,
            content: editingReview.content,
            visitDate: editingReview.visit_date,
            // ใน Service เราอาจไม่ได้เก็บ visitType ไว้ ถ้าไม่มีให้ใช้ Default
            visitType: "Solo", 
            images: editingReview.images
          }}
          onSuccess={() => {
            setIsEditModalOpen(false);
            window.location.reload(); // Refresh ข้อมูลหลังแก้เสร็จ
          }}
        />
      )}
    </div>
  );
}