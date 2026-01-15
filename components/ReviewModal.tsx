// src/services/reviewService.ts
import { createClient } from "@/utils/supabase/client";

// ✅ แก้ไข Interface: id เป็น string
export interface UserReview {
  id: string; 
  rating: number;
  content: string;
  created_at: string;
  visit_date?: string;
  travel_party?: string;
  images: string[];
  place: {
    id: number; // Place ID มักจะเป็น number หรือ string ก็ได้ (เช็คให้ชัวร์) แต่ส่วนใหญ่ถ้า review เป็น uuid, place ก็อาจจะเป็น uuid แต่ถ้า place ยังใช้ int ให้คงเดิมไว้
    name: string;
    province_state: string;
    country: string;
    image: string;
  };
}

// ... (submitReview เหมือนเดิม) ...

// 2. Get User Reviews
export const getUserReviews = async (userId: string): Promise<UserReview[]> => {
  const supabase = createClient();
  
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        content,
        created_at,
        visit_date,
        travel_party,
        images,
        places (
          id,
          name,
          province_state,
          country,
          images
        )
      `)
      .eq('profile_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }

    return data.map((item: any) => {
        const placeData = Array.isArray(item.places) ? item.places[0] : item.places;
        
        return {
            id: item.id, // ✅ Supabase ส่งมาเป็น string (uuid) อัตโนมัติ
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
  } catch (err) {
    console.error('Network error fetching user reviews:', err);
    return [];
  }
};

// 3. Delete Review
// ✅ แก้ไข: รับ string
export const deleteReview = async (reviewId: string): Promise<boolean> => {
  const supabase = createClient();
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);
    if (error) { console.error('Error deleting:', error); return false; }
    return true;
  } catch (err) { return false; }
};

// 4. Update Review
// ✅ แก้ไข: รับ string
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
        rating: rating,
        content: content,
        images: finalImages,
        travel_party: visitType,
        visit_date: visitDate
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
// ✅ แก้ไข: รับ string
export const getReviewById = async (reviewId: string): Promise<UserReview | null> => {
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id, rating, content, created_at, visit_date, travel_party, images,
        places ( id, name, province_state, country, images )
      `)
      .eq('id', reviewId)
      .single();

    if (error) { console.error('Error fetching review:', error); return null; }

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
  } catch (err) {
    console.error('Network error fetching review:', err);
    return null;
  }
};