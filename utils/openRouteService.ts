// utils/openRouteService.ts

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

interface RouteResult {
    distance: string;
    duration: string;
    geometry: any; // พิกัดสำหรับวาดเส้นบน Leaflet
    rawDistance: number;
    rawDuration: number;
}

export const getRouteData = async (
    start: { lat: number; lng: number },
    end: { lat: number; lng: number }
): Promise<RouteResult | null> => {
    if (!ORS_API_KEY) {
        console.error("Missing OpenRouteService API Key");
        return null;
    }

    try {
        // ใช้ POST Endpoint เพื่อรองรับพิกัดทั่วโลกและเสถียรกว่า
        const url = `https://api.openrouteservice.org/v2/directions/driving-car/geojson`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': ORS_API_KEY // ส่ง Token ผ่าน Header
            },
            body: JSON.stringify({
                coordinates: [
                    [start.lng, start.lat],
                    [end.lng, end.lat]
                ],
                // ✅ เพิ่ม radiuses เพื่อขยายการค้นหาถนน (หน่วยเป็นเมตร) 
                // -1 หมายถึงไม่จำกัดระยะทาง หรือใส่ 5000 (5km) เพื่อความปลอดภัย
                radiuses: [5000, 5000]
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`ORS API Error (${response.status}):`, errorText);
            return null;
        }

        const data = await response.json();

        if (!data.features || data.features.length === 0) return null;

        const route = data.features[0];
        const distanceMeters = route.properties.summary.distance;
        const durationSeconds = route.properties.summary.duration;
        const geometry = route.geometry.coordinates; // Array ของ [lng, lat]

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