// app/api/ors/route.ts
import { NextResponse } from 'next/server';

// ใช้ Server-side Environment Variable (ไม่ต้องมี NEXT_PUBLIC ก็ได้เพื่อความปลอดภัย)
const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY; 

export async function POST(request: Request) {
    if (!ORS_API_KEY) {
        return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    }

    try {
        const { start, end } = await request.json();

        // ยิง request ไปที่ ORS จากฝั่ง Server (Server-to-Server ไม่มี CORS)
        const response = await fetch('https://api.openrouteservice.org/v2/directions/driving-car/geojson', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': ORS_API_KEY
            },
            body: JSON.stringify({
                coordinates: [
                    [start.lng, start.lat],
                    [end.lng, end.lat]
                ],
                radiuses: [5000, 5000] // รัศมีการหาถนน 5km
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json({ error: errorText }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error("Proxy Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}