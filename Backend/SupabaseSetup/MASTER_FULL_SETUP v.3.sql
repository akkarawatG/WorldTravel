-- ============================================================
-- ★ MASTER SCRIPT: TRAVEL APP (MASTER_FULL_SETUP v.3)
-- รวมฟีเจอร์: Gallery, Budget, Dual Currency, Date Range,
-- Template Rating, Share & Clone, และระบบ Custom Locations (ORS)
-- ============================================================

-- [SECTION 1] RESET DATABASE (ล้างข้อมูลเก่าทั้งหมด ถ้าจะเริ่มใหม่)
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.review_reports CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.place_managers CASCADE;
DROP TABLE IF EXISTS public.saved_places CASCADE;
DROP TABLE IF EXISTS public.daily_schedule_items CASCADE;
DROP TABLE IF EXISTS public.daily_schedules CASCADE;
DROP TABLE IF EXISTS public.itineraries CASCADE;
DROP TABLE IF EXISTS public.template_provinces CASCADE;
DROP TABLE IF EXISTS public.templates CASCADE;
DROP TABLE IF EXISTS public.trips CASCADE;
DROP TABLE IF EXISTS public.locations CASCADE;    -- [NEW]
DROP TABLE IF EXISTS public.festivals CASCADE;
DROP TABLE IF EXISTS public.places CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- [SECTION 2] EXTENSIONS & UTILITIES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ฟังก์ชันอัปเดตเวลา (updated_at)
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- [SECTION 3] CREATE TABLES (โครงสร้าง)

-- 1. Profiles
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Places (สถานที่หลัก)
CREATE TABLE public.places (
  id TEXT PRIMARY KEY, 
  name TEXT NOT NULL,
  name_native TEXT,
  search_query TEXT,
  continent TEXT,
  country TEXT,
  province_state TEXT,
  district TEXT,
  sub_district TEXT,
  zip_code TEXT,
  formatted_address TEXT,
  google_maps_url TEXT,
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  category_ids TEXT[],
  category_tags TEXT[],
  rating NUMERIC,
  review_count INTEGER,
  opening_hours TEXT,
  access_type TEXT,
  access_note TEXT,
  description_short TEXT,
  description_long TEXT,
  best_season TEXT,
  travel_tips JSONB,
  images JSONB,
  is_verified BOOLEAN DEFAULT FALSE,
  owner_response_count INTEGER DEFAULT 0,
  approval_status TEXT DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Locations (สถานที่ค้นหาเองผ่าน ORS) -- [NEW]
CREATE TABLE public.locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  full_address TEXT,
  place_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Festivals
CREATE TABLE public.festivals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_native TEXT,
  search_query TEXT,
  continent TEXT,
  country TEXT,
  province_state TEXT,
  city TEXT,
  description TEXT,
  period_str TEXT,
  month_index INTEGER CHECK (month_index BETWEEN 1 AND 12),
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Place Managers
CREATE TABLE public.place_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT REFERENCES public.places(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'owner',
  status TEXT DEFAULT 'pending',
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id TEXT REFERENCES public.places(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  content TEXT,
  images JSONB,
  visit_date DATE,
  is_visible BOOLEAN DEFAULT TRUE,
  travel_party TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Review Reports
CREATE TABLE public.review_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID REFERENCES public.reviews(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  resolved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Trips
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Templates 
CREATE TABLE public.templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  template_name TEXT,
  notes TEXT,
  images JSONB DEFAULT '[]'::jsonb, 
  is_selected BOOLEAN DEFAULT FALSE,
  travel_start_date DATE,
  travel_end_date DATE,
  rating NUMERIC DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  copied_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_template_dates_valid CHECK (travel_end_date >= travel_start_date),
  CONSTRAINT check_template_rating_range CHECK (rating >= 0 AND rating <= 5)
);

COMMENT ON COLUMN public.templates.rating IS 'คะแนนรีวิวเฉลี่ย (0.0 - 5.0)';

-- 10. Template Provinces
CREATE TABLE public.template_provinces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.templates(id) ON DELETE CASCADE,
  province_code TEXT,
  status TEXT,
  color TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Itineraries
CREATE TABLE public.itineraries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  budget_goal NUMERIC DEFAULT 0,
  currency TEXT DEFAULT 'THB',
  currency_secondary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Daily Schedules
CREATE TABLE public.daily_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
  day_number INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Daily Schedule Items (★ UPDATED: รองรับ location_id และกฎป้องกันข้อมูลชนกัน)
CREATE TABLE public.daily_schedule_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_schedule_id UUID REFERENCES public.daily_schedules(id) ON DELETE CASCADE,
  
  -- แหล่งที่มาของสถานที่ (ต้องเลือกอย่างใดอย่างหนึ่ง)
  place_id TEXT REFERENCES public.places(id) ON DELETE SET NULL,
  location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
  
  item_type TEXT,
  note TEXT,
  order_index INTEGER,
  start_time TIME,
  end_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- กฎป้องกันข้อมูลชนกัน
  CONSTRAINT check_single_location_source CHECK (place_id IS NULL OR location_id IS NULL)
);

COMMENT ON CONSTRAINT check_single_location_source ON public.daily_schedule_items IS 'ป้องกันไม่ให้ 1 กิจกรรม มีทั้งสถานที่หลัก(place)และสถานที่ค้นหาเอง(location) พร้อมกัน';

-- 14. Expenses
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  itinerary_id UUID REFERENCES public.itineraries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,                 
  amount NUMERIC NOT NULL DEFAULT 0,   
  currency TEXT DEFAULT 'THB',         
  category TEXT,                       
  expense_date DATE DEFAULT CURRENT_DATE, 
  note TEXT,                           
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. Saved Places
CREATE TABLE public.saved_places (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  place_id TEXT REFERENCES public.places(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- [SECTION 4] TRIGGERS & RPC FUNCTIONS

-- 4.1 Auto Create Profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url, role)
  VALUES (new.id, new.raw_user_meta_data->>'username', new.raw_user_meta_data->>'avatar_url', 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4.2 Template Clone Function
CREATE OR REPLACE FUNCTION clone_template(source_template_id UUID, new_trip_id UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  new_template_id UUID;
BEGIN
  INSERT INTO public.templates (
    trip_id, template_name, notes, travel_start_date, travel_end_date, 
    images, rating, is_selected, is_public, copied_count
  )
  SELECT 
    new_trip_id, template_name || ' (Copy)', notes, travel_start_date, travel_end_date,
    images, 0, true, false, 0
  FROM public.templates
  WHERE id = source_template_id
  RETURNING id INTO new_template_id;

  INSERT INTO public.template_provinces (template_id, province_code, status, color)
  SELECT new_template_id, province_code, status, color
  FROM public.template_provinces
  WHERE template_id = source_template_id;

  UPDATE public.templates SET copied_count = copied_count + 1 WHERE id = source_template_id;

  RETURN new_template_id;
END;
$$;

-- 4.3 Auto Update Timestamp Triggers
CREATE TRIGGER set_timestamp_profiles BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_places BEFORE UPDATE ON public.places FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_locations BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE handle_updated_at(); -- [NEW]
CREATE TRIGGER set_timestamp_festivals BEFORE UPDATE ON public.festivals FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_place_managers BEFORE UPDATE ON public.place_managers FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_reviews BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_review_reports BEFORE UPDATE ON public.review_reports FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_trips BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_templates BEFORE UPDATE ON public.templates FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_template_provinces BEFORE UPDATE ON public.template_provinces FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_itineraries BEFORE UPDATE ON public.itineraries FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_daily_schedules BEFORE UPDATE ON public.daily_schedules FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_daily_schedule_items BEFORE UPDATE ON public.daily_schedule_items FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_expenses BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();
CREATE TRIGGER set_timestamp_saved_places BEFORE UPDATE ON public.saved_places FOR EACH ROW EXECUTE PROCEDURE handle_updated_at();

-- [SECTION 5] RLS & POLICIES (SECURITY)

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY; -- [NEW]
ALTER TABLE public.festivals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_schedule_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- Standard Policies
CREATE POLICY "Public profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "User update own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public places" ON public.places FOR SELECT USING (true);
CREATE POLICY "Admin update places" ON public.places FOR UPDATE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- Locations Policies [NEW]
CREATE POLICY "Locations are viewable by everyone" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Users can manage own locations" ON public.locations FOR ALL USING (auth.uid() = profile_id);

CREATE POLICY "Public festivals" ON public.festivals FOR SELECT USING (true);
CREATE POLICY "Admin manage festivals" ON public.festivals FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "Public reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "User create reviews" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "User manage reviews" ON public.reviews FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Admin delete reviews" ON public.reviews FOR DELETE USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

CREATE POLICY "User create reports" ON public.review_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admin manage reports" ON public.review_reports FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- Trips & Templates
CREATE POLICY "User manage trips" ON public.trips FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "User manage templates" ON public.templates FOR ALL USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = templates.trip_id AND trips.profile_id = auth.uid()));
CREATE POLICY "User manage template provinces" ON public.template_provinces FOR ALL USING (EXISTS (SELECT 1 FROM public.templates JOIN public.trips ON trips.id = templates.trip_id WHERE templates.id = template_provinces.template_id AND trips.profile_id = auth.uid()));

-- Public Template Policies
CREATE POLICY "Everyone can view public templates" ON public.templates FOR SELECT USING (is_public = true);
CREATE POLICY "Everyone can view public template provinces" ON public.template_provinces FOR SELECT USING (EXISTS (SELECT 1 FROM public.templates WHERE id = template_provinces.template_id AND is_public = true));

-- Itineraries & Schedules
CREATE POLICY "User manage itineraries" ON public.itineraries FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "User manage schedules" ON public.daily_schedules FOR ALL USING (EXISTS (SELECT 1 FROM public.itineraries WHERE id = daily_schedules.itinerary_id AND profile_id = auth.uid()));
CREATE POLICY "User manage items" ON public.daily_schedule_items FOR ALL USING (EXISTS (SELECT 1 FROM public.daily_schedules JOIN public.itineraries ON itineraries.id = daily_schedules.itinerary_id WHERE daily_schedules.id = daily_schedule_items.daily_schedule_id AND itineraries.profile_id = auth.uid()));

-- Expenses
CREATE POLICY "Users can view expenses of own itinerary" ON public.expenses FOR SELECT USING (EXISTS (SELECT 1 FROM public.itineraries WHERE id = expenses.itinerary_id AND profile_id = auth.uid()));
CREATE POLICY "Users can create expenses in own itinerary" ON public.expenses FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.itineraries WHERE id = expenses.itinerary_id AND profile_id = auth.uid()));
CREATE POLICY "Users can manage expenses of own itinerary" ON public.expenses FOR ALL USING (EXISTS (SELECT 1 FROM public.itineraries WHERE id = expenses.itinerary_id AND profile_id = auth.uid()));

-- Saved Places & Managers
CREATE POLICY "User manage saved places" ON public.saved_places FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "User manage place managers" ON public.place_managers FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Admin manage place managers" ON public.place_managers FOR ALL USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'staff')));

-- [SECTION 6] STORAGE SETUP 

INSERT INTO storage.buckets (id, name, public) VALUES ('avatar', 'avatar', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reviews', 'reviews', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('templates', 'templates', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatar insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatar' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'avatar' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatar' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatar public" ON storage.objects FOR SELECT USING (bucket_id = 'avatar');
  
CREATE POLICY "Review insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'reviews');
CREATE POLICY "Review delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'reviews' AND auth.uid() = owner);
CREATE POLICY "Review public" ON storage.objects FOR SELECT USING (bucket_id = 'reviews');

CREATE POLICY "Users can upload template photos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can delete own template photos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'templates' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Template photos are public" ON storage.objects FOR SELECT USING (bucket_id = 'templates');