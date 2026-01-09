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
  category_ids?: string[]; // Array of strings (Text[])
  category_tags?: string[]; // Array of strings (Text[])
  rating?: number;
  review_count?: number;
  opening_hours?: string;
  access_type?: string;
  access_note?: string;
  description_short?: string;
  description_long?: string;
  best_season?: string;
  travel_tips?: any; // JSONB -> อาจจะระบุโครงสร้างถ้ามี format ชัดเจน
  images?: { url: string; caption?: string }[]; // JSONB -> แมปให้ตรงกับการใช้งาน
  is_verified?: boolean;
  owner_response_count?: number;
  approval_status?: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}