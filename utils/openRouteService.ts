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
        // ✅ เปลี่ยน URL มาเรียก API ของเราเอง
        const response = await fetch('/api/ors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ start, end }) // ส่งแค่ start/end ให้ Server จัดการต่อ
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
// utils/openRouteService.ts

// ... (code เดิมของ getRouteData) ...

// ✅ เพิ่มส่วนนี้ต่อท้ายไฟล์
export interface GeocodeResult {
    id: string; // ใช้ id จาก ORS หรือสร้างเอง
    name: string;
    label: string; // ที่อยู่เต็ม
    coordinates: [number, number]; // [lon, lat]
}

// utils/openRouteService.ts
// ... (โค้ดเดิม getRouteData) ...

// ✅ เพิ่มส่วนนี้ต่อท้ายไฟล์เดิม
export interface GeocodeResult {
    id: string;
    name: string;
    label: string;
    coordinates: [number, number]; // [lon, lat]
}

export const searchPlaces = async (query: string): Promise<GeocodeResult[]> => {
    try {
        const res = await fetch(`/api/ors/geocode?text=${encodeURIComponent(query)}`);
        if (!res.ok) return [];
        const data = await res.json();
        
        return data.features.map((f: any) => ({
            id: f.properties.id || Math.random().toString(36).substr(2, 9),
            name: f.properties.name || f.properties.label.split(',')[0],
            label: f.properties.label,
            coordinates: f.geometry.coordinates 
        }));
    } catch (e) {
        console.error("Geocode error:", e);
        return [];
    }
}