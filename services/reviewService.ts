// src/services/reviewService.ts
import { createClient } from "@/utils/supabase/client";

export interface UserReview {
  id: string; // Changed to string to match UUIDs
  rating: number;
  content: string;
  created_at: string;
  visit_date?: string;
  travel_party?: string;
  images: string[];
  place: {
    id: number;
    name: string;
    province_state: string;
    country: string;
    image: string;
  };
}

// 1. Submit Review
export const submitReview = async (
  placeId: string,
  userId: string,
  rating: number,
  visitType: string,
  content: string,
  files: File[]
) => {
  const supabase = createClient();
  try {
    let imageUrls: string[] = [];
    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${placeId}/${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('reviews').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('reviews').getPublicUrl(fileName);
        return publicUrl;
      });
      imageUrls = await Promise.all(uploadPromises);
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([{
        place_id: placeId,
        profile_id: userId,
        rating: rating,
        travel_party: visitType,
        content: content,
        images: imageUrls,
        visit_date: new Date().toISOString().split('T')[0],
        is_visible: true
      }])
      .select().single();

    if (error) throw error;
    return { success: true, data };
  } catch (error: any) {
    console.error("Submit Review Error:", error);
    return { success: false, error: error.message };
  }
};

// 2. Get User Reviews
export const getUserReviews = async (userId: string): Promise<UserReview[]> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, content, created_at, visit_date, travel_party, images,
        places (id, name, province_state, country, images)
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) { console.error('Error:', error); return []; }

    return data.map((item: any) => {
        const placeData = Array.isArray(item.places) ? item.places[0] : item.places;
        return {
            id: item.id,
            rating: item.rating,
            content: item.content,
            created_at: item.created_at,
            visit_date: item.visit_date,
            travel_party: item.travel_party,
            images: item.images || [],
            place: {
                id: placeData?.id,
                name: placeData?.name,
                province_state: placeData?.province_state,
                country: placeData?.country,
                image: Array.isArray(placeData?.images) && placeData.images.length > 0
                ? (typeof placeData.images[0] === 'string' ? placeData.images[0] : placeData.images[0].url)
                : "https://placehold.co/100x100?text=No+Image"
            }
        };
    });
  } catch (err) { console.error('Error:', err); return []; }
};

// 3. Delete Review
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) return false;
    return true;
  } catch (err) { return false; }
};

// 4. Update Review
export const updateReview = async (
  reviewId: string, 
  rating: number,
  content: string,
  newFiles: File[],
  existingImages: string[],
  visitType?: string,
  visitDate?: string
) => {
  const supabase = createClient();
  try {
    let newImageUrls: string[] = [];
    if (newFiles.length > 0) {
      const uploadPromises = newFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `updated/${reviewId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('reviews').upload(fileName, file);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('reviews').getPublicUrl(fileName);
        return publicUrl;
      });
      newImageUrls = await Promise.all(uploadPromises);
    }

    const finalImages = [...existingImages, ...newImageUrls];

    const { error } = await supabase
      .from('reviews')
      .update({
        rating, content, images: finalImages, travel_party: visitType, visit_date: visitDate
      })
      .eq('id', reviewId);

    if (error) throw error;
    return { success: true };
  } catch (error: any) {
    console.error("Update Review Error:", error);
    return { success: false, error: error.message };
  }
};

// 5. Get Review By ID
export const getReviewById = async (reviewId: string): Promise<UserReview | null> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, content, created_at, visit_date, travel_party, images,
        places (id, name, province_state, country, images)
      `)
      .eq('id', reviewId)
      .single();

    if (error || !data) return null;

    const placeData = Array.isArray(data.places) ? data.places[0] : data.places;
    if (!placeData) return null;

    return {
      id: data.id,
      rating: data.rating,
      content: data.content,
      created_at: data.created_at,
      visit_date: data.visit_date,
      travel_party: data.travel_party,
      images: data.images || [],
      place: {
        id: placeData.id,
        name: placeData.name,
        province_state: placeData.province_state,
        country: placeData.country,
        image: Array.isArray(placeData.images) && placeData.images.length > 0
          ? (typeof placeData.images[0] === 'string' ? placeData.images[0] : placeData.images[0].url)
          : "https://placehold.co/100x100?text=No+Image"
      }
    };
  } catch (err) { return null; }
};