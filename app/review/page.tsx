"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import { Star, MapPin, Check, ImageIcon, Trash2, Search } from "lucide-react";
import { getPlaceById } from "@/services/placeService";
import { Place } from "@/types/place";
import { submitReview } from "@/services/reviewService";
import { createClient } from "@/utils/supabase/client";

const MOCK_PLACE = {
    id: "mock-1",
    name: "Muang Singh Historical Park",
    province_state: "Kanchanaburi Province",
    country: "Thailand",
    images: ["https://placehold.co/600x400?text=Muang+Singh"],
};

function ReviewContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const placeId = searchParams.get("placeId");
    const supabase = createClient();

    const [place, setPlace] = useState<Place | any>(null);
    const [rating, setRating] = useState(0);
    const [visitType, setVisitType] = useState<string>("");
    const [reviewText, setReviewText] = useState("");
    const [isChecked, setIsChecked] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const [hoverRating, setHoverRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRemoveFile = (indexToRemove: number) => {
        setUploadedFiles((prevFiles) =>
            prevFiles.filter((_, index) => index !== indexToRemove)
        );
    };

    useEffect(() => {
        const fetchPlace = async () => {
            if (placeId) {
                const data = await getPlaceById(placeId);
                setPlace(data || MOCK_PLACE);
            } else {
                setPlace(MOCK_PLACE);
            }
        };
        fetchPlace();
    }, [placeId]);

    if (!place) return <div className="p-10 text-center">Loading...</div>;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const newFiles = Array.from(e.target.files);
            setUploadedFiles((prevFiles) => {
                const combinedFiles = [...prevFiles, ...newFiles];
                return combinedFiles.slice(0, 5);
            });
        }
        e.target.value = '';
    };

    const handleSubmit = async () => {
        if (!placeId) return;
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                alert("Please login before submitting a review.");
                setIsSubmitting(false);
                return;
            }
            const result = await submitReview(placeId, user.id, rating, visitType, reviewText, uploadedFiles);
            if (result.success) {
                router.push(`/detail?id=${placeId}`);
            } else {
                alert(`Failed to submit review: ${result.error}`);
            }
        } catch (err) {
            console.error(err);
            alert("Something went wrong.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#FFFFFF] font-inter text-[#212121] pb-20 overflow-x-hidden">
            {/* 1. Header Section - Responsive Padding */}
            <div className="w-full max-w-[1128px] mx-auto pt-6 px-4 md:px-0">
                <div className="flex items-center gap-1 md:gap-2 flex-wrap mb-4 font-Inter font-[600] text-[12px] md:text-[14px] leading-tight text-[#9E9E9E]">
                    <span className="hover:underline cursor-pointer" onClick={() => router.push("/")}>Home</span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/countries?continent=${place.continent}`)}>{place.continent}</span>/
                    <span className="hover:underline cursor-pointer" onClick={() => router.push(`/explore?country=${place.country}`)}>{place.country}</span>/
                    <span className="truncate max-w-[100px] md:max-w-none hover:underline cursor-pointer" onClick={() => router.push(`/detail?id=${place.id}`)}>{place.name}</span>/
                    <span className="text-[#101828]">Review</span>
                </div>

                <div className="mt-6 md:mt-8">
                    <div className="w-full lg:w-[511px] mb-[24px]">
                        <h1 className="font-inter font-bold text-[28px] md:text-[36px] text-[#194473] leading-tight mb-2">
                            Tell us, how was your visit?
                        </h1>
                        <p className="font-inter font-semibold text-[14px] text-[#616161]">
                            Share your experience and help other travelers
                        </p>
                    </div>

                    {/* Responsive Grid: Column on Mobile, Row on Desktop */}
                    <div className="flex flex-col lg:flex-row gap-[24px] lg:gap-[32px] items-start">

                        {/* Left Column: Place Preview */}
                        <div className="w-full lg:w-[511px] lg:sticky lg:top-4">
                            <div className="w-full h-auto lg:h-[548.5px] bg-white rounded-[16px] overflow-hidden border border-[#1E518C] shadow-sm p-[1px]">
                                <div className="w-full aspect-video lg:h-[442.5px] bg-gray-200 relative">
                                    <img
                                        src={place.images && place.images.length > 0
                                            ? (typeof place.images[0] === 'string' ? place.images[0] : place.images[0].url)
                                            : "https://placehold.co/600x400"}
                                        alt={place.name}
                                        className="w-full h-full object-cover rounded-t-[15px]"
                                    />
                                </div>
                                <div className="w-full p-4 lg:p-[24px] flex flex-col gap-[8px]">
                                    <h2 className="font-bold text-[18px] md:text-[20px] leading-tight text-[#101828] truncate">
                                        {place.name}
                                    </h2>
                                    <div className="flex items-center gap-[4px] text-gray-500 text-[14px]">
                                        <MapPin size={16} className="flex-shrink-0" />
                                        <span className="font-normal text-[13px] md:text-[14px] text-[#4A5565] truncate">
                                            {place.province_state || place.location?.province_state}, {place.country || place.location?.country}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Review Form */}
                        <div className="w-full lg:w-[585px] flex flex-col gap-[16px]">
                            
                            {/* Rating Card */}
                            <div className="w-full h-auto min-h-[235px] flex flex-col gap-[24px] lg:gap-[32px] bg-white rounded-[16px] border border-[#1E518C] shadow-sm p-4 lg:p-[16px]">
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
                                                className="focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                                            >
                                                <Star
                                                    className={`w-8 h-8 md:w-[42px] md:h-[42px] transition-colors duration-200 ${star <= (hoverRating || rating) ? "fill-[#FFCC00] text-[#FFCC00]" : "text-gray-300"}`}
                                                    strokeWidth={1.5}
                                                />
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex flex-col gap-[12px] md:gap-[16px]">
                                    <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                        Who did you go with?
                                    </h3>
                                    <div className="flex flex-wrap gap-2 md:gap-3">
                                        {["Business", "Family", "Couple", "Friend", "Solo Travel"].map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setVisitType(type)}
                                                className={`px-4 md:px-6 py-2 rounded-full border text-[12px] md:text-[14px] font-medium transition-all
                                                        ${visitType === type
                                                        ? "bg-[#194473] text-white border-[#C2DCF3]"
                                                        : "bg-white text-[#1E518C] border-[#1E518C] hover:bg-[#EEEEEE] cursor-pointer"
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Main Review Form Card */}
                            <div className="w-full h-auto flex flex-col gap-[24px] lg:gap-[32px] bg-white rounded-[16px] border border-[#1E518C] shadow-sm p-4 lg:p-[16px]">
                                <div className="flex flex-col gap-[8px]">
                                    <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                        Write your review
                                    </h3>
                                    <textarea
                                        value={reviewText}
                                        onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Share your experience... What did you like? What could be improved?"
                                        className="w-full h-[150px] md:h-[170px] p-4 rounded-[16px] border border-[#D1D5DC] outline-none focus:border-[#194473] resize-none text-[14px]"
                                    />
                                    <div className="flex justify-between w-full text-[11px] md:text-[14px] text-[#616161]">
                                        <span>{reviewText.length} characters</span>
                                        <span>Min 500 characters</span>
                                    </div>
                                </div>

                                {/* Add Photos Section */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="font-inter font-bold text-[16px] md:text-[18px] text-[#194473]">
                                        Add some photos
                                    </h3>
                                    <div className="w-full h-auto min-h-[180px] lg:h-[249px] p-4 md:p-8 rounded-[16px] border border-[#EEEEEE] flex flex-col items-center justify-center gap-4 text-center">
                                        <div className="w-12 h-12 md:w-[64px] md:h-[64px] bg-[#F5F5F5] rounded-full flex items-center justify-center">
                                            <ImageIcon size={24} className="text-gray-500" />
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div>
                                                <p className="font-inter text-[14px] md:text-[16px] text-[#364153]">Click to upload or drag and drop</p>
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

                                    {/* Preview Section */}
                                    {uploadedFiles.length > 0 && (
                                        <div className="mt-4">
                                            <div className="flex flex-wrap gap-3 md:gap-4">
                                                {uploadedFiles.map((file, index) => (
                                                    <div key={index} className="relative w-20 h-20 md:w-[120px] md:h-[120px] rounded-[12px] md:rounded-[16px] overflow-hidden border border-black group">
                                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                                        <button type="button" onClick={() => handleRemoveFile(index)} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                            <Trash2 size={24} className="text-white" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="text-right mt-2 text-[12px] text-[#9E9E9E]">
                                                {uploadedFiles.length}/5 Pictures
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Declaration & Submit */}
                                <div className="flex flex-col gap-6">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center mt-1 transition-colors
                                        ${isChecked ? "bg-[#3A82CE] border-[#3A82CE]" : "border-gray-400 bg-white group-hover:border-[#3A82CE]"}`}>
                                            {isChecked && <Check size={14} className="text-white" />}
                                        </div>
                                        <input type="checkbox" className="hidden" checked={isChecked} onChange={(e) => setIsChecked(e.target.checked)} />
                                        <span className="text-[11px] md:text-[12px] text-gray-500 leading-relaxed">
                                            I certify that this review is based on my own experience and is my genuine opinion... <br />
                                            <span className="text-[#3A82CE] hover:underline font-medium">Learn more about review fraud</span>
                                        </span>
                                    </label>

                                    <button
                                        onClick={handleSubmit}
                                        disabled={!rating || !reviewText || !visitType || !isChecked || isSubmitting}
                                        className="w-full h-[48px] rounded-[16px] font-inter font-bold text-[16px] md:text-[18px] transition-all border
                                                disabled:bg-[#E0E0E0] disabled:text-[#757575] disabled:border-[#CCC] disabled:cursor-not-allowed
                                                enabled:bg-[#194473] enabled:text-white enabled:hover:bg-[#123356] shadow-sm cursor-pointer"
                                    >
                                        {isSubmitting ? "Submitting..." : "Submit Review"}
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

export default function ReviewPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center">Loading Review Page...</div>}>
            <ReviewContent />
        </Suspense>
    );
}