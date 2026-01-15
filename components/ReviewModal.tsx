"use client";

import { useState, useEffect, useRef } from "react";
import { X, Star, Upload, Trash2, Calendar, Users } from "lucide-react";
import { submitReview, updateReview } from "@/services/reviewService";
import { createClient } from "@/utils/supabase/client";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  placeId: string | number;
  onSuccess?: () => void;
  
  // Props สำหรับการแก้ไข
  isEditing?: boolean;
  reviewId?: number;
  initialData?: {
    rating: number;
    content: string;
    visitType?: string;
    visitDate?: string;
    images?: string[];
  };
}

const VISIT_TYPES = ["Solo", "Couples", "Family", "Friends", "Business"];

export default function ReviewModal({
  isOpen,
  onClose,
  placeId,
  onSuccess,
  isEditing = false,
  reviewId,
  initialData
}: ReviewModalProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [visitType, setVisitType] = useState("Solo");
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Image State
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newPreviews, setNewPreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Load Data
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    init();

    if (isOpen && isEditing && initialData) {
      setRating(initialData.rating || 0);
      setContent(initialData.content || "");
      setVisitType(initialData.visitType || "Solo");
      setVisitDate(initialData.visitDate || new Date().toISOString().split('T')[0]);
      setExistingImages(initialData.images || []);
      
      // Reset new files
      setNewFiles([]);
      setNewPreviews([]);
    } else if (isOpen && !isEditing) {
      setRating(0);
      setContent("");
      setVisitType("Solo");
      setVisitDate(new Date().toISOString().split('T')[0]);
      setNewFiles([]);
      setNewPreviews([]);
      setExistingImages([]);
    }
  }, [isOpen, isEditing, initialData]);

  // Image Handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const previews = files.map(file => URL.createObjectURL(file));
      
      setNewFiles(prev => [...prev, ...files]);
      setNewPreviews(prev => [...prev, ...previews]);
    }
  };

  const removeNewImage = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setNewPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Submit Logic
  const handleSubmit = async () => {
    if (!userId) {
      alert("Please login first.");
      return;
    }
    if (rating === 0) {
      alert("Please give a rating.");
      return;
    }

    setIsSubmitting(true);

    try {
      let result;
      if (isEditing && reviewId) {
        // --- UPDATE ---
        result = await updateReview(
          reviewId,
          rating,
          content,
          newFiles,
          existingImages
        );
      } else {
        // --- CREATE ---
        result = await submitReview(
          String(placeId),
          userId,
          rating,
          visitType,
          content,
          newFiles
        );
      }

      if (result.success) {
        if (onSuccess) onSuccess();
        onClose();
      } else {
        alert("Error: " + (result.error || "Failed to submit review"));
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-[600px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-[24px] font-bold text-[#194473]">
            {isEditing ? "Edit Review" : "Write a Review"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={24} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
          
          {/* Rating */}
          <div className="flex flex-col gap-2 items-center justify-center py-2">
            <p className="text-[#757575] font-medium text-sm">How would you rate your experience?</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={40}
                    className={`${
                      star <= (hoverRating || rating)
                        ? "fill-[#FFCC00] text-[#FFCC00]"
                        : "fill-gray-100 text-gray-300"
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
            <span className="text-[#194473] font-bold text-lg h-6">
              {["", "Terrible", "Poor", "Average", "Very Good", "Excellent"][hoverRating || rating]}
            </span>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[#212121] font-semibold text-sm flex items-center gap-2">
                <Calendar size={16} /> When did you go?
              </label>
              <input
                type="date"
                value={visitDate}
                onChange={(e) => setVisitDate(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#194473]/20 transition-all text-[#212121]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[#212121] font-semibold text-sm flex items-center gap-2">
                <Users size={16} /> Who did you go with?
              </label>
              <select
                value={visitType}
                onChange={(e) => setVisitType(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-[12px] focus:outline-none focus:ring-2 focus:ring-[#194473]/20 transition-all text-[#212121] cursor-pointer appearance-none"
              >
                {VISIT_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[#212121] font-semibold text-sm">Write your review</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell us about your experience..."
              className="w-full h-[150px] p-4 bg-gray-50 border border-gray-200 rounded-[12px] resize-none focus:outline-none focus:ring-2 focus:ring-[#194473]/20 transition-all text-[#212121] placeholder:text-gray-400"
            />
          </div>

          {/* Images Upload */}
          <div className="flex flex-col gap-3">
            <label className="text-[#212121] font-semibold text-sm flex items-center justify-between">
              <span>Add Photos</span>
              <span className="text-gray-400 font-normal text-xs">{newFiles.length + existingImages.length} images</span>
            </label>
            
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
              {/* Existing Images */}
              {existingImages.map((src, idx) => (
                <div key={`existing-${idx}`} className="relative aspect-square rounded-[12px] overflow-hidden group border border-gray-200">
                  <img src={src} alt="Review" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeExistingImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* New Images */}
              {newPreviews.map((src, idx) => (
                <div key={`new-${idx}`} className="relative aspect-square rounded-[12px] overflow-hidden group border border-gray-200">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeNewImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}

              {/* Upload Button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-[12px] border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-[#194473] hover:text-[#194473] hover:bg-blue-50 transition-all gap-1"
              >
                <Upload size={24} />
                <span className="text-[10px] font-medium">Upload</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              accept="image/*"
              className="hidden"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-[12px] text-[#757575] font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-[12px] bg-[#194473] text-white font-semibold hover:bg-[#153a61] transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              isEditing ? "Update Review" : "Submit Review"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}