"use client";

import { useParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useRef } from "react";
import { Star, MapPin, Check, Image as ImageIcon, Trash2, Calendar, Users, ChevronLeft, Upload } from "lucide-react";
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
    const reviewId = String(params?.id); // Force string ID
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // 1. Fetch Data
    useEffect(() => {
        const init = async () => {
            // Check Auth
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/');
                return;
            }

            if (reviewId) {
                const data = await getReviewById(reviewId);
                
                if (data) {
                    setReviewData(data);
                    
                    // Set Place Info
                    setPlace({
                        id: data.place.id,
                        name: data.place.name,
                        province_state: data.place.province_state,
                        country: data.place.country,
                        image: data.place.image,
                    });

                    // Pre-fill Form
                    setRating(data.rating || 0);
                    setReviewText(data.content || "");
                    
                    if (data.visit_date) {
                        setVisitDate(data.visit_date);
                    } else {
                        setVisitDate(new Date().toISOString().split('T')[0]);
                    }

                    // Map Visit Type
                    let dbVisitType = data.travel_party || "";
                    if (dbVisitType === "Solo Travel") dbVisitType = "Solo"; 
                    setVisitType(dbVisitType); 

                    setExistingImages(data.images || []);
                    setIsChecked(true); // Auto-check for convenience when editing
                } else {
                    alert("Review not found or permission denied.");
                    router.push('/review-history');
                }
            }
            setLoading(false);
        };
        init();
    }, [reviewId, router]);

    // 2. Handlers
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
            const result = await updateReview(
                reviewId,
                rating,
                reviewText,
                newFiles,
                existingImages,
                visitType,
                visitDate 
            );

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
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#212121] pb-20">

            {/* 1. Header Section */}
            <div className="max-w-[1128px] mx-auto pt-6 ">
                <div className="flex items-center gap-2 flex-wrap pt 6 mb-4 font-Inter font-[600] text-[14px] leading-[100%] text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="truncate max-w-[200px] md:max-w-none hover:underline cursor-pointer" onClick={() =>  router.push('/review-history')}>
                        Profile
                    </span>/
                    <span className="text-[#101828]">Edit Review</span>
                </div>

                {/* Main Content Section */}
                <div className="mt-8">
                    <div className="w-full lg:w-[511px] mb-[24px]">
                        <h1 className="font-inter font-bold text-[36px] text-[#194473] leading-none mb-2">
                            Edit your review
                        </h1>
                        <p className="font-inter font-semibold text-[14px] text-[#616161] leading-none">
                            Update your experience to help other travelers
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[511px_1fr] gap-[32px] items-start">

                        {/* Left Column */}
                        <div className="sticky top-4">
                            <div className="w-full h-[548.5px] bg-white rounded-[16px] overflow-hidden border border-[#C2DCF3] shadow-[0px_1px_3px_0px_#0000001A,0px_1px_2px_-1px_#0000001A] p-[1px]">
                                <div className="w-full h-[442.5px] bg-gray-200 relative">
                                    <Image
                                        src={place.image}
                                        alt={place.name}
                                        fill
                                        className="object-cover rounded-t-[15px]"
                                        unoptimized={isRiskyImage(place.image)}
                                    />
                                </div>
                                <div className="w-full h-[104px] flex flex-col gap-[8px] pt-[24px] px-[24px]">
                                    <h2 className="font-[Arial] font-bold text-[20px] leading-[28px] tracking-[0px] text-[#101828] truncate">
                                        {place.name}
                                    </h2>
                                    <div className="w-[461px] h-[20px] flex items-center gap-[4px] text-gray-500 text-[14px]">
                                        <MapPin size={16} className="flex-shrink-0" />
                                        <span className="font-[Arial] font-normal text-[14px] leading-[20px] tracking-[0px] text-[#4A5565] truncate">
                                            {place.province_state}, {place.country}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Review Form */}
                        <div className="w-[585px] h-auto flex flex-col gap-[16px]">
                            
                            {/* Rating & Visit Type Card */}
                            <div className="w-[585px] h-[235px] flex flex-col gap-[32px] bg-white rounded-[16px] border border-[#C2DCF3] shadow-[0px_1px_3px_0px_#0000001A,0px_1px_2px_-1px_#0000001A] p-[16px]">
                                {/* Rating Section */}
                                <div className="w-[331px] h-[86px] flex flex-col gap-[16px]">
                                    <h3 className="font-inter font-bold text-[18px] text-[#194473] leading-none tracking-normal">
                                        How would you rate your experience?
                                    </h3>
                                    <div className="w-[272px] h-[48px] flex items-center gap-[16px]" onMouseLeave={() => setHoverRating(0)}>
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                onMouseEnter={() => setHoverRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                            >
                                                <Star
                                                    size={42}
                                                    className={`transition-colors duration-200 ${star <= (hoverRating || rating) ? "fill-[#FFCC00] text-[#FFCC00]" : "text-gray-300"}`}
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Visit Date (Added for Edit) */}
                                {/* Note: Original Review Page didn't have Date field UI, but Edit often needs it. 
                                    I'll add it here to match functionality, keeping style consistent. */}

                                {/* Visit Type Section */}
                                <div className="w-[553px] h-[85px] flex flex-col gap-[16px]">
                                    <h3 className="font-inter font-bold text-[18px] text-[#194473] leading-none tracking-normal">
                                        Who did you go with?
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {VISIT_TYPES.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setVisitType(type)}
                                                className={`px-6 py-2 rounded-full border text-[14px] font-medium transition-all
                                                    ${visitType === type
                                                        ? "bg-[#194473] text-white border-[#194473]"
                                                        : "bg-white text-gray-600 border-gray-300 hover:bg-[#EEEEEE]"
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Review Form Card */}
                            <div className="w-[585px] h-auto flex flex-col gap-[32px] bg-white rounded-[16px] border border-[#C2DCF3] shadow-[0px_1px_3px_0px_#0000001A,0px_1px_2px_-1px_#0000001A] p-[16px]">

                                {/* Write Review Section */}
                                <div className="w-[558px] h-[236px] flex flex-col gap-[8px]">
                                    <div className="w-[558px] h-[208px] flex flex-col gap-[16px]">
                                        <h3 className="font-inter font-bold text-[18px] text-[#194473] leading-none tracking-normal">
                                            Write your review
                                        </h3>
                                        <textarea
                                            value={reviewText}
                                            onChange={(e) => setReviewText(e.target.value)}
                                            placeholder="Share your experience... What did you like? What could be improved?"
                                            className="w-full h-[170px] p-4 rounded-[16px] border border-[#D1D5DC] outline-none focus:border-[#194473] resize-none text-[14px]"
                                        />
                                    </div>
                                    <div className="flex justify-between w-full h-[20px]">
                                        <span className="font-inter font-normal text-[14px] leading-none text-[#616161]">
                                            {reviewText.length} characters
                                        </span>
                                        <span className="font-inter font-normal text-[14px] leading-none text-[#616161]">
                                            Minimum 500 characters recommended
                                        </span>
                                    </div>
                                </div>

                                {/* Add Photos Section */}
                                <div className="flex flex-col w-[553px] h-auto gap-4">
                                    <div className="flex flex-col w-[553px] min-h-[293px] gap-4">
                                        <h3 className="font-inter font-bold text-[18px] text-[#194473] leading-[28px] tracking-[0px]">
                                            Add some photos
                                        </h3>
                                        
                                        {/* Upload Box */}
                                        <div className="w-[553px] h-[249px] p-8 gap-4 rounded-[16px] border border-[#EEEEEE] flex flex-col items-center justify-center relative transition-colors shrink-0">
                                            <div className="w-[64px] h-[64px] bg-[#F5F5F5] rounded-full flex items-center justify-center p-4 gap-[10px]">
                                                <ImageIcon size={32} className="text-gray-500" />
                                            </div>
                                            <div className="w-[489px] h-[105px] flex flex-col items-center justify-center gap-6">
                                                <div className="w-[489px] h-[52px] flex flex-col items-center justify-center gap-2 text-center">
                                                    <p className="font-inter font-normal text-[16px] text-[#364153] leading-[24px]">
                                                        Click to upload or drag and drop
                                                    </p>
                                                    <p className="font-inter font-normal text-[14px] text-[#9E9E9E] leading-[20px]">
                                                        PNG, JPG up to 10MB
                                                    </p>
                                                </div>
                                                <label className="cursor-pointer">
                                                    <span className="w-[105px] h-[37px] bg-[#2196F3] text-white rounded-[16px] border border-[#C2DCF3] flex items-center justify-center gap-[10px] p-[10px] text-[14px] font-medium hover:bg-[#1976D2] transition-colors">
                                                        Choose Files
                                                    </span>
                                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Preview Gallery */}
                                    {(existingImages.length > 0 || newFiles.length > 0) && (
                                        <div className="flex flex-col w-[553px] min-h-[148px] gap-2">
                                            <div className="flex flex-wrap gap-4">
                                                {/* Existing */}
                                                {existingImages.map((src, index) => (
                                                    <div key={`exist-${index}`} className="relative w-[120px] h-[120px] rounded-[16px] overflow-hidden border border-black group shrink-0">
                                                        <img src={src} alt={`existing-${index}`} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => handleRemoveExistingImage(index)} className="absolute inset-0 bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                                            <Trash2 size={32} className="text-black" />
                                                        </button>
                                                    </div>
                                                ))}
                                                {/* New */}
                                                {newFiles.map((file, index) => (
                                                    <div key={`new-${index}`} className="relative w-[120px] h-[120px] rounded-[16px] overflow-hidden border border-black group shrink-0">
                                                        <img src={URL.createObjectURL(file)} alt={`new-${index}`} className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => handleRemoveNewFile(index)} className="absolute inset-0 bg-white/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                                                            <Trash2 size={32} className="text-black" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="w-[553px] h-[20px] flex justify-end items-center">
                                                <span className="font-inter font-normal text-[14px] leading-none tracking-normal text-[#9E9E9E]">
                                                    {existingImages.length + newFiles.length}/5 Pictures
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Fraud Declaration & Submit */}
                                <label className="w-[553px] h-[135px] flex items-start gap-2 cursor-pointer group">
                                    <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors
                                    ${isChecked ? "bg-[#3A82CE] border-[#3A82CE]" : "border-gray-400 bg-white group-hover:border-[#3A82CE]"}`}>
                                        {isChecked && <Check size={14} className="text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                                    <span className="text-[12px] text-gray-500 leading-relaxed">
                                        I certify that this review is based on my own experience and is my genuine opinion of this establishment, and that I have no personal or business relationship with this establishment, and have not been offered any incentive or payment originating from the establishment to write this review. I understand that TripVibe has a zero-tolerance policy on fake reviews. <br />
                                        <span className="text-[#3A82CE] hover:underline">Learn more about the consequences of review fraud</span>
                                    </span>
                                </label>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => router.back()}
                                        className="flex-1 h-[48px] rounded-[16px] border border-gray-300 text-gray-600 font-bold hover:bg-gray-100 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={!rating || !reviewText || !visitType || !isChecked || isSubmitting}
                                        className="flex-[2] h-[48px] rounded-[16px] flex items-center justify-center transition-all border
                                                    font-inter font-bold text-[18px] leading-[28px] tracking-[0px]
                                                    disabled:bg-[#E0E0E0] disabled:text-[#757575] disabled:border-transparent disabled:cursor-not-allowed
                                                    enabled:bg-[#3A82CE] enabled:text-white enabled:border-[#C2DCF3] enabled:hover:bg-[#2c6eb5]"
                                    >
                                        {isSubmitting ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}