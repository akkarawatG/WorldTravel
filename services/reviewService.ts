// src/services/reviewService.ts
import { createClient } from "@/utils/supabase/client";

// Interface สำหรับ Review ที่จะแสดงในหน้า History
export interface UserReview {
  id: number;
  rating: number;
  content: string;
  created_at: string;
  visit_date?: string;
  images: string[];
  place: {
    id: number;
    name: string;
    province_state: string;
    country: string;
    image: string; // รูปปกของสถานที่
  };
}

// ==========================================
// 1. Submit Review (ฟังก์ชันเดิมของคุณ)
// ==========================================
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
    // 1. Upload Images
    let imageUrls: string[] = [];
    
    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${placeId}/${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('reviews') 
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('reviews')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });

      imageUrls = await Promise.all(uploadPromises);
    }

    // 2. Insert Review
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          place_id: placeId,
          profile_id: userId, // หรือ user_id ตาม DB schema ของคุณ
          rating: rating,
          travel_party: visitType,
          content: content,
          images: imageUrls,
          visit_date: new Date().toISOString().split('T')[0],
          is_visible: true
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data };

  } catch (error: any) {
    console.error("Submit Review Error:", error);
    return { success: false, error: error.message };
  }
};

// ==========================================
// 2. Get User Reviews (สำหรับหน้า Review History)
// ==========================================
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
        images,
        places (
          id,
          name,
          province_state,
          country,
          images
        )
      `)
      .eq('profile_id', userId) // เช็คให้ชัวร์ว่า DB ใช้ profile_id หรือ user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }

    // แปลงข้อมูลให้ตรงกับ Interface
    return data.map((item: any) => ({
      id: item.id,
      rating: item.rating,
      content: item.content,
      created_at: item.created_at,
      visit_date: item.visit_date,
      images: item.images || [],
      place: {
        id: item.places?.id,
        name: item.places?.name,
        province_state: item.places?.province_state,
        country: item.places?.country,
        // ดึงรูปแรกของสถานที่มาเป็นรูปปก ถ้าไม่มีใช้ Placeholder
        image: Array.isArray(item.places?.images) && item.places.images.length > 0
          ? (typeof item.places.images[0] === 'string' ? item.places.images[0] : item.places.images[0].url)
          : "https://placehold.co/100x100?text=No+Image"
      }
    }));
  } catch (err) {
    console.error('Network error fetching user reviews:', err);
    return [];
  }
};

// ==========================================
// 3. Delete Review (สำหรับลบรีวิว)
// ==========================================
export const deleteReview = async (reviewId: number): Promise<boolean> => {
  const supabase = createClient();
  
  try {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Error deleting review:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error deleting review:', err);
    return false;
  }
};

// ==========================================
// 4. Update Review (สำหรับแก้ไขรีวิว)
// ==========================================
export const updateReview = async (
  reviewId: number,
  rating: number,
  content: string,
  newFiles: File[],
  existingImages: string[] // รูปเดิมที่ผู้ใช้ไม่ได้ลบออก
) => {
  const supabase = createClient();
  
  try {
    // 1. Upload New Images (ถ้ามี)
    let newImageUrls: string[] = [];
    if (newFiles.length > 0) {
      const uploadPromises = newFiles.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `updated/${reviewId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('reviews')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('reviews')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });
      newImageUrls = await Promise.all(uploadPromises);
    }

    // รวมรูปเก่าที่เหลืออยู่ + รูปใหม่
    const finalImages = [...existingImages, ...newImageUrls];

    // 2. Update Database
    const { error } = await supabase
      .from('reviews')
      .update({
        rating: rating,
        content: content,
        images: finalImages,
        // visit_date: อาจจะไม่ต้องอัปเดต หรือแล้วแต่ Requirement
      })
      .eq('id', reviewId);

    if (error) throw error;

    return { success: true };

  } catch (error: any) {
    console.error("Update Review Error:", error);
    return { success: false, error: error.message };
  }
};