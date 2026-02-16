"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// --- Fix Leaflet Default Icon ---
const iconRetinaUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png';
const iconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png';
const shadowUrl = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
});

interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  order_index: number;
  color?: string; // ✅ 1. เพิ่ม property color (Optional)
}

interface ItineraryMapProps {
  locations: Location[];
}

// ✅ Component จัดการ Logic แผนที่
const MapController = ({ locations }: { locations: Location[] }) => {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLinesRef = useRef<L.LayerGroup | null>(null); // ✅ เปลี่ยนเป็น LayerGroup เพื่อเก็บหลายเส้น

  useEffect(() => {
    if (!map) return;

    // A. เคลียร์ Layer เก่าทิ้งก่อนวาดใหม่
    if (markersRef.current) {
        markersRef.current.clearLayers();
    } else {
        markersRef.current = L.layerGroup().addTo(map);
    }

    if (routeLinesRef.current) {
        routeLinesRef.current.clearLayers();
    } else {
        routeLinesRef.current = L.layerGroup().addTo(map);
    }

    // B. ตรวจสอบข้อมูล
    if (!locations || locations.length === 0) return;

    // C. วาด Markers และ เส้นทาง
    const allLatLngs: L.LatLngExpression[] = [];
    
    // ตัวแปรสำหรับสร้างเส้นทาง (แยกเส้นตามสี/วัน)
    let currentPath: L.LatLngExpression[] = [];
    let currentColor = locations[0].color || '#1E518C';

    locations.forEach((loc, index) => {
        if (!loc.lat || !loc.lng) return;

        const point: [number, number] = [loc.lat, loc.lng];
        allLatLngs.push(point);

        // ✅ 2. ใช้สีจาก loc.color (ถ้าไม่มีใช้สี Default)
        const markerColor = loc.color || '#1E518C';

        // สร้าง Custom Icon แบบ Dynamic Color
        const numberedIcon = new L.DivIcon({
            className: "custom-map-icon",
            html: `
              <div style="position: relative; width: 32px; height: 32px;">
                <div style="
                  width: 32px; 
                  height: 32px; 
                  background-color: ${markerColor}; 
                  border: 2px solid #FFFFFF; 
                  border-radius: 50%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
                  z-index: 10;
                  position: relative;
                ">
                  <span style="color: white; font-weight: bold; font-size: 12px; font-family: sans-serif;">${loc.order_index}</span>
                </div>
                <div style="
                  position: absolute; 
                  bottom: -6px; 
                  left: 50%; 
                  transform: translateX(-50%); 
                  width: 0; 
                  height: 0; 
                  border-left: 6px solid transparent; 
                  border-right: 6px solid transparent; 
                  border-top: 8px solid ${markerColor}; 
                "></div>
              </div>
            `,
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            popupAnchor: [0, -40]
        });

        const marker = L.marker(point, { icon: numberedIcon })
            .bindPopup(`<b style="font-family: sans-serif;">${loc.name}</b>`);
        
        if (markersRef.current) {
            markersRef.current.addLayer(marker);
        }

        // ✅ 3. Logic สร้างเส้นทาง (Polyline) แบบแยกสี
        // ถ้าสีเปลี่ยน (ขึ้นวันใหม่) ให้วาดเส้นเก่าแล้วเริ่มเส้นใหม่
        if (loc.color && loc.color !== currentColor) {
             // วาดเส้นของวันก่อนหน้า
             if (currentPath.length > 1 && routeLinesRef.current) {
                 L.polyline(currentPath, {
                    color: currentColor,
                    weight: 4,
                    // dashArray: '10, 10',
                    opacity: 0.7
                 }).addTo(routeLinesRef.current);
             }
             // เริ่มเก็บ path ใหม่
             currentPath = [point]; 
             currentColor = loc.color;
        } else {
            // วันเดียวกัน เก็บจุดเพิ่ม
            currentPath.push(point);
        }
    });

    // วาดเส้นของชุดสุดท้าย (วันที่เหลือ)
    if (currentPath.length > 1 && routeLinesRef.current) {
         L.polyline(currentPath, {
            color: currentColor,
            weight: 4,
            // dashArray: '10, 10',
            opacity: 0.7
         }).addTo(routeLinesRef.current);
    }

    // D. ปรับมุมกล้อง
    if (allLatLngs.length > 0) {
        const bounds = L.latLngBounds(allLatLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [map, locations]);

  return null;
};

export default function ItineraryMap({ locations }: ItineraryMapProps) {
  return (
    <MapContainer 
      center={[13.7563, 100.5018]} 
      zoom={6} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapController locations={locations} />

    </MapContainer>
  );
}