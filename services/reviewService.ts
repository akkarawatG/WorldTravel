// src/services/reviewService.ts
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

export const submitReview = async (
  placeId: string,
  userId: string,
  rating: number,
  visitType: string,
  content: string,
  files: File[]
) => {
  try {
    // 1. Upload Images (ถ้ามีรูปภาพ)
    let imageUrls: string[] = [];
    
    if (files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        // ตั้งชื่อไฟล์: review_images/{placeId}/{userId}/{timestamp}.jpg ป้องกันชื่อซ้ำ
        const fileName = `${placeId}/${userId}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // ⚠️ ต้องสร้าง Bucket ชื่อ 'reviews' ใน Supabase Storage ก่อนนะครับ (Public)
        const { error: uploadError } = await supabase.storage
          .from('reviews') 
          .upload(fileName, file);

        if (uploadError) {
          console.error("Error uploading image:", uploadError);
          throw uploadError;
        }

        // ดึง Public URL ของรูปภาพ
        const { data: { publicUrl } } = supabase.storage
          .from('reviews')
          .getPublicUrl(fileName);
          
        return publicUrl;
      });

      // รอให้ทุกรูปอัปโหลดเสร็จ
      imageUrls = await Promise.all(uploadPromises);
    }

    // 2. Insert Review into Database
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          place_id: placeId,
          profile_id: userId,
          rating: rating,
          travel_party: visitType, // Map จาก UI (visitType) -> DB (travel_party)
          content: content,
          images: imageUrls,       // บันทึก URL รูปภาพเป็น JSON array
          visit_date: new Date().toISOString().split('T')[0], // วันที่ปัจจุบัน (Format YYYY-MM-DD)
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