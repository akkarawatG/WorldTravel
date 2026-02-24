-- ============================================================
-- FILE 6: FUNCTION GET BEST NEARBY (RPC)
-- หน้าที่: สร้างฟังก์ชันสำหรับค้นหาสถานที่ใกล้เคียง + คะแนนดีที่สุด
-- ============================================================

-- 1. เปิดใช้งาน Extension สำหรับคำนวณพิกัดโลก (ถ้าเปิดแล้วมันจะข้ามไปเอง)
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. สร้างฟังก์ชัน (DROP ของเก่าทิ้งก่อน เผื่อมีการแก้ไขในอนาคตจะได้ไม่ Error)
DROP FUNCTION IF EXISTS get_best_nearby_places;

CREATE OR REPLACE FUNCTION get_best_nearby_places(
  ref_lat float,            -- ละติจูดตั้งต้น
  ref_lon float,            -- ลองจิจูดตั้งต้น
  excluded_id text,         -- ไอดีที่จะไม่เอามาแสดง (ตัวที่เปิดอยู่)
  radius_km int DEFAULT 10, -- รัศมี (ค่าเริ่มต้น 10 กม. ถ้าไม่ส่งมา)
  filter_country text DEFAULT NULL -- [ใหม่] ชื่อประเทศ (ถ้าไม่ส่งมา คือหาได้ทุกประเทศ)
)
RETURNS TABLE (
  id text,
  name text,
  rating numeric,
  lat double precision,
  lon double precision,
  images jsonb,
  dist_meters float,
  country text              -- ส่งชื่อประเทศกลับไปด้วย
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.rating,
    p.lat, 
    p.lon, 
    p.images,
    -- คำนวณระยะทาง
    ST_Distance(
      ST_SetSRID(ST_MakePoint(p.lon, p.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(ref_lon, ref_lat), 4326)::geography
    ) AS dist_meters,
    p.country
  FROM
    public.places p
  WHERE
    -- 3. กรองระยะทางตามรัศมีที่ส่งมา (radius_km)
    ST_DWithin(
      ST_SetSRID(ST_MakePoint(p.lon, p.lat), 4326)::geography,
      ST_SetSRID(ST_MakePoint(ref_lon, ref_lat), 4326)::geography,
      radius_km * 1000
    )
    -- 4. ไม่เอาสถานที่เดิม
    AND p.id != excluded_id
    -- 5. กรองประเทศ (ถ้ามีการส่งค่า filter_country มา)
    AND (filter_country IS NULL OR p.country = filter_country)
  ORDER BY
    p.rating DESC,    -- เรียงตามดาว
    dist_meters ASC   -- เรียงตามระยะทาง
  LIMIT 6;
END;
$$;