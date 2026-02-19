// app/api/ors/geocode/route.ts
import { NextResponse } from 'next/server';

const ORS_API_KEY = process.env.NEXT_PUBLIC_ORS_API_KEY;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const text = searchParams.get('text');

    if (!ORS_API_KEY) return NextResponse.json({ error: 'Missing API Key' }, { status: 500 });
    if (!text) return NextResponse.json({ error: 'Missing text parameter' }, { status: 400 });

    try {
        // ค้นหาในไทย (boundary.country=TH)
        const response = await fetch(`https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_API_KEY}&text=${encodeURIComponent(text)}&boundary.country=TH`);
        
        if (!response.ok) throw new Error('ORS API Error');
        
        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}