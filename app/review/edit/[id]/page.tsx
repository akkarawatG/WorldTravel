"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { Star, MapPin, Check, Image as ImageIcon, Trash2, Settings, ChevronLeft } from "lucide-react";
import Image from "next/image";
import { getReviewById, updateReview, UserReview } from "@/services/reviewService";
import { createClient } from "@/utils/supabase/client";

// MOCK DATA (Fallback)
const MOCK_PLACE = {
    id: "mock-1",
    name: "Loading Place...",
    province_state: "",
    country: "",
    image: "https://placehold.co/600x400?text=Loading",
};

const VISIT_TYPES = ["Solo", "Couples", "Family", "Friends", "Business"];

export default function EditReviewPage() {
    const router = useRouter();
    const params = useParams();
    const reviewId = String(params?.id);
    const supabase = createClient();

    // State
    const [loading, setLoading] = useState(true);
    const [reviewData, setReviewData] = useState<UserReview | null>(null);
    const [place, setPlace] = useState<any>(MOCK_PLACE);

    // Form State
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [visitType, setVisitType] = useState<string>("");
    const [visitDate, setVisitDate] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    
    // Image State
    const [newFiles, setNewFiles] = useState<File[]>([]); 
    const [existingImages, setExistingImages] = useState<string[]>([]); 

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            if (reviewId) {
                const data = await getReviewById(reviewId);
                if (data) {
                    setReviewData(data);
                    setPlace({
                        id: data.place.id,
                        name: data.place.name,
                        province_state: data.place.province_state,
                        country: data.place.country,
                        image: data.place.image,
                    });
                    setRating(data.rating || 0);
                    setReviewText(data.content || "");
                    setVisitDate(data.visit_date || new Date().toISOString().split('T')[0]);
                    
                    let dbVisitType = data.travel_party || "";
                    if (dbVisitType === "Solo Travel") dbVisitType = "Solo"; 
                    setVisitType(dbVisitType); 

                    setExistingImages(data.images || []);
                    setIsChecked(true); 
                } else {
                    alert("Review not found or permission denied.");
                    router.push('/review-history');
                }
            }
            setLoading(false);
        };
        init();
    }, [reviewId, router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            if (existingImages.length + newFiles.length + files.length > 5) {
                alert("You can upload a maximum of 5 images.");
                return;
            }
            setNewFiles((prev) => [...prev, ...files]);
        }
        e.target.value = ''; 
    };

    const handleRemoveNewFile = (index: number) => {
        setNewFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRemoveExistingImage = (index: number) => {
        setExistingImages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!rating) return alert("Please give a rating.");
        if (!reviewText) return alert("Please write a review.");
        if (!visitType) return alert("Please select who you went with.");
        if (!isChecked) return alert("Please certify your review.");

        setIsSubmitting(true);
        try {
            const result = await updateReview(reviewId, rating, reviewText, newFiles, existingImages, visitType, visitDate);
            if (result.success) {
                router.push('/review-history'); 
            } else {
                alert("Error: " + result.error);
                setIsSubmitting(false);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
            setIsSubmitting(false);
        }
    };

    const isRiskyImage = (url: string) => !url.includes('supabase.co') && !url.includes('unsplash.com');

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#212121] pb-20 overflow-x-hidden">
            {/* Breadcrumb - Responsive */}
            <div className="w-full max-w-[1128px] mx-auto pt-6 px-4 md:px-0 mb-4">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap font-Inter font-[600] text-[12px] md:text-[14px] leading-none text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="truncate max-w-[100px] md:max-w-none hover:underline cursor-pointer" onClick={() => router.push('/review-history')}>Profile</span>/
                    <span className="text-[#101828]">Edit Review</span>
                </div>
            </div>

            <main className="w-full max-w-[1128px] mx-auto px-4 md:px-0 mt-6 md:mt-8">
                <div className="w-full lg:w-[511px] mb-[24px]">
                    <h1 className="font-inter font-bold text-[28px] md:text-[36px] text-[#194473] leading-tight mb-2">
                        Edit your review
                    </h1>
                    <p className="font-inter font-semibold text-[14px] text-[#616161]">
                        Update your experience to help other travelers
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[32px] items-start">
                    {/* Left Column: Place Info */}
                    <div className="w-full lg:w-[511px] lg:sticky lg:top-4">
                        <div className="w-full h-auto bg-white rounded-[16px] overflow-hidden border border-[#1E518C] shadow-sm p-[1px]">
                            <div className="relative w-full aspect-video lg:h-[442.5px] bg-gray-200">
                                <Image
                                    src={place.image}
                                    alt={place.name}
                                    fill
                                    className="object-cover rounded-t-[15px]"
                                    unoptimized={isRiskyImage(place.image)}
                                />
                            </div>
                            <div className="w-full p-4 lg:pt-[24px] lg:px-[24px] lg:pb-[24px] flex flex-col gap-[8px]">
                                <h2 className="font-bold text-[18px] md:text-[20px] text-[#101828] truncate">
                                    {place.name}
                                </h2>
                                <div className="flex items-center gap-[4px] text-gray-500 text-[14px]">
                                    <MapPin size={16} className="flex-shrink-0" />
                                    <span className="font-normal text-[13px] md:text-[14px] text-[#4A5565] truncate">
                                        {place.province_state}, {place.country}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Form */}
                    <div className="w-full lg:w-[585px] flex flex-col gap-[16px]">
                        {/* Rating Card */}
                        <div className="w-full p-4 md:p-[16px] bg-white rounded-[16px] border border-[#1E518C] shadow-sm flex flex-col gap-6 md:gap-[32px]">
                            <div className="flex flex-col gap-[16px]">
                                <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                    How would you rate your experience?
                                </h3>
                                <div className="flex items-center gap-2 md:gap-[16px]" onMouseLeave={() => setHoverRating(0)}>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            className="focus:outline-none transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`w-8 h-8 md:w-[42px] md:h-[42px] transition-colors ${star <= (hoverRating || rating) ? "fill-[#FFCC00] text-[#FFCC00]" : "text-gray-300"}`}
                                                strokeWidth={1.5}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-[16px]">
                                <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                    Who did you go with?
                                </h3>
                                <div className="flex flex-wrap gap-2 md:gap-3">
                                    {VISIT_TYPES.map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => setVisitType(type)}
                                            className={`px-4 md:px-6 py-2 rounded-full border text-[12px] md:text-[14px] font-medium transition-all ${visitType === type ? "bg-[#194473] text-white border-[#194473]" : "bg-white text-gray-600 border-[#1E518C] hover:bg-gray-100"}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Form Card */}
                        <div className="w-full p-4 md:p-[16px] bg-white rounded-[16px] border border-[#1E518C] shadow-sm flex flex-col gap-6 md:gap-[32px]">
                            <div className="flex flex-col gap-[8px]">
                                <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                    Write your review
                                </h3>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="Share your experience..."
                                    className="w-full h-[150px] md:h-[170px] p-4 rounded-[16px] border border-[#D1D5DC] outline-none focus:border-[#194473] text-[14px] resize-none"
                                />
                                <div className="flex justify-between w-full text-[11px] md:text-[14px] text-[#616161]">
                                    <span>{reviewText.length} characters</span>
                                    <span>Min 500 characters recommended</span>
                                </div>
                            </div>

                            {/* Photos Section */}
                            <div className="flex flex-col gap-4">
                                <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                    Photos
                                </h3>
                                <div className="w-full h-auto min-h-[180px] p-6 rounded-[16px] border border-[#EEEEEE] flex flex-col items-center justify-center gap-4 text-center">
                                    <div className="w-12 h-12 md:w-[64px] md:h-[64px] bg-[#F5F5F5] rounded-full flex items-center justify-center">
                                        <ImageIcon size={24} className="text-gray-500" />
                                    </div>
                                    <div className="flex flex-col gap-4">
                                        <div>
                                            <p className="font-inter text-[14px] md:text-[16px] text-[#364153]">Upload or drag and drop</p>
                                            <p className="text-[12px] text-[#9E9E9E]">PNG, JPG up to 10MB</p>
                                        </div>
                                        <label className="cursor-pointer mx-auto">
                                            <span className="px-6 py-2 bg-[#2196F3] text-white rounded-[16px] border border-[#C2DCF3] text-[14px] font-medium hover:bg-[#1976D2] transition-colors inline-block">
                                                Choose Files
                                            </span>
                                            <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                        </label>
                                    </div>
                                </div>

                                {/* Preview Grid */}
                                {(existingImages.length > 0 || newFiles.length > 0) && (
                                    <div className="flex flex-wrap gap-3 mt-2">
                                        {existingImages.map((src, index) => (
                                            <div key={`exist-${index}`} className="relative w-20 h-20 md:w-[120px] md:h-[120px] rounded-[12px] overflow-hidden border group">
                                                <img src={src} alt="existing" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => handleRemoveExistingImage(index)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={24} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                        {newFiles.map((file, index) => (
                                            <div key={`new-${index}`} className="relative w-20 h-20 md:w-[120px] md:h-[120px] rounded-[12px] overflow-hidden border border-blue-400 group">
                                                <img src={URL.createObjectURL(file)} alt="new" className="w-full h-full object-cover" />
                                                <button type="button" onClick={() => handleRemoveNewFile(index)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={24} className="text-white" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Declaration & Buttons */}
                            <div className="flex flex-col gap-6">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-1 transition-colors ${isChecked ? "bg-[#3A82CE] border-[#3A82CE]" : "border-gray-400 bg-white group-hover:border-[#3A82CE]"}`}>
                                        {isChecked && <Check size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                                    <span className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed">
                                        I certify that this review is based on my own experience... <br />
                                        <span className="text-[#3A82CE] hover:underline">Learn more about review fraud</span>
                                    </span>
                                </label>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        onClick={() => router.back()}
                                        className="w-full sm:flex-1 h-[48px] rounded-[16px] border border-gray-300 text-gray-600 font-bold hover:bg-gray-100"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!rating || !reviewText || !visitType || !isChecked || isSubmitting}
                                        className="w-full sm:flex-[2] h-[48px] rounded-[16px] font-inter font-bold text-[18px] transition-all border disabled:bg-[#E0E0E0] disabled:text-[#757575] disabled:border-transparent enabled:bg-[#3A82CE] enabled:text-white"
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}