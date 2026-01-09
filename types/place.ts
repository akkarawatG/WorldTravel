// types/place.ts

export interface Place {
  id: string; // UUID
  name: string;
  name_native?: string;
  search_query?: string;
  continent?: string;
  country?: string;
  province_state?: string;
  district?: string;
  sub_district?: string;
  zip_code?: string;
  formatted_address?: string;
  google_maps_url?: string;
  lat?: number;
  lon?: number;
  category_ids?: string[]; 
  category_tags?: string[]; 
  rating?: number;
  review_count?: number;
  opening_hours?: string;
  access_type?: string;
  access_note?: string;
  description_short?: string;
  description_long?: string;
  best_season?: string;
  
  // ✅ เพิ่มฟิลด์นี้เข้าไปครับ
  price_detail?: string; 

  travel_tips?: any; 
  images?: { url: string; caption?: string }[];
  is_verified?: boolean;
  owner_response_count?: number;
  approval_status?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}