// utils/openRouteService.ts

interface RouteResult {
    distance: string;
    duration: string;
    geometry: any;
    rawDistance: number;
    rawDuration: number;
}

// ฟังก์ชันช่วยหน่วงเวลา (Sleep)
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export const getRouteData = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number },
    retries = 2 // อนุญาตให้ลองใหม่ได้ 2 ครั้งถ้าติด 429
): Promise<RouteResult | null> => {
    try {
        const response = await fetch('/api/ors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start, end }) 
        });

        if (!response.ok) {
            // ถ้าติด 429 (Too Many Requests) และยังมีโควต้าให้ลองใหม่
            if (response.status === 429 && retries > 0) {
                console.warn("API Rate Limit Hit (429). Retrying in 3 seconds...");
                await delay(3000); // รอ 3 วินาที
                return getRouteData(start, end, retries - 1); // ลองยิงใหม่
            }
            
            console.error(`Route API Error (${response.status})`);
            return null; // ถ้าพังถาวร คืนค่า null ไปให้ข้ามได้เลย
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
        const API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY || "ใส่_API_KEY_ของคุณที่นี่"; 
        
        let url = `https://api.openrouteservice.org/geocode/search?api_key=${API_KEY}&text=${encodeURIComponent(query)}`;
        
        if (lat !== undefined && lon !== undefined) {
            url += `&focus.point.lat=${lat}&focus.point.lon=${lon}`;
        }

        const response = await fetch(url);
        
        // จัดการถ้ายิง Search รัวๆ แล้วติด 429
        if (response.status === 429) {
             console.warn("Search API Rate Limit. Please wait.");
             return [];
        }

        const data = await response.json();
        
        if (!data.features) return [];

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