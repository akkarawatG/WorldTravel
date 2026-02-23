// utils/openRouteService.ts

interface RouteResult {
    distance: string;
    duration: string;
    geometry: any;
    rawDistance: number;
    rawDuration: number;
}

export const getRouteData = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
): Promise<RouteResult | null> => {
    try {
        // ✅ เรียก API ของเราเอง (ซ่อน API Key ไว้ที่ฝั่ง Server)
        const response = await fetch('/api/ors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start, end }) 
        });

        if (!response.ok) {
            console.error(`Route API Error (${response.status})`);
            return null;
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) return null;

        const route = data.features[0];
        const distanceMeters = route.properties.summary.distance;
        const durationSeconds = route.properties.summary.duration;
        const geometry = route.geometry.coordinates; 

        return {
            distance: formatDistance(distanceMeters),
            duration: formatDuration(durationSeconds),
            geometry: geometry,
            rawDistance: distanceMeters,
            rawDuration: durationSeconds
        };
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
};

const formatDistance = (meters: number): string => {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
};

const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return remainingMins === 0 ? `${hours} hr` : `${hours} hr ${remainingMins} min`;
};

// ==========================================
// ✅ ส่วนที่เพิ่มใหม่สำหรับระบบ Search
// ==========================================

export interface GeocodeResult {
    id: string;
    name: string;
    label: string;
    coordinates: [number, number]; // [lon, lat]
}

export async function searchPlaces(query: string, lat?: number, lon?: number): Promise<GeocodeResult[]> {
    try {
        // 🛑 นำ API KEY ของ OpenRouteService ของคุณมาใส่ตรงนี้แทนข้อความ "ใส่_API_KEY_ของคุณที่นี่"
        // หรือถ้าคุณตั้งไว้ใน .env.local แล้ว มันจะดึงค่า NEXT_PUBLIC_ORS_API_KEY มาใช้ให้เอง
        const API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || "ใส่_API_KEY_ของคุณที่นี่"; 
        
        let url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(query)}`;
        
        // ถ้ามีการส่งพิกัดมาด้วย ให้เน้นผลลัพธ์ที่ใกล้พิกัดนี้ (focus.point)
        if (lat !== undefined && lon !== undefined) {
            url += `&focus.point.lat=${lat}&focus.point.lon=${lon}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (!data.features) return [];

        // ✅ แมปข้อมูลที่ได้จาก API ให้อยู่ในรูปแบบ GeocodeResult ที่เราสร้างไว้
        return data.features.map((feature: any) => ({
            id: feature.properties.id || feature.properties.osm_id?.toString() || Math.random().toString(),
            name: feature.properties.name || feature.properties.label.split(',')[0],
            label: feature.properties.label,
            coordinates: feature.geometry.coordinates
        }));
    } catch (error) {
        console.error("Search error:", error);
        return [];
    }
}