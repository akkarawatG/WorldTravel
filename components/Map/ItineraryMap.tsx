"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// import { getRoute } from "@/app/actions/getRoute"; // ถ้ายังไม่ได้ทำ Server Action ให้ comment ไว้ก่อนได้

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
}

interface ItineraryMapProps {
  locations: Location[];
}

// ✅ Component จัดการ Logic แผนที่ (แยกออกมาเพื่อให้ใช้ useMap ได้)
const MapController = ({ locations }: { locations: Location[] }) => {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);

  // 1. จัดการ Markers และ เส้นทาง
  useEffect(() => {
    if (!map) return;

    // A. เคลียร์ Layer เก่าทิ้งก่อนวาดใหม่ (ป้องกันการซ้อนทับ)
    if (markersRef.current) {
        markersRef.current.clearLayers();
    } else {
        markersRef.current = L.layerGroup().addTo(map);
    }

    if (routeLineRef.current) {
        routeLineRef.current.remove();
        routeLineRef.current = null;
    }

    // B. ตรวจสอบว่ามีข้อมูลหรือไม่
    if (!locations || locations.length === 0) return;

    // C. วาด Markers
    const latLngs: L.LatLngExpression[] = [];

    locations.forEach((loc) => {
        if (!loc.lat || !loc.lng) return; // ข้ามถ้าไม่มีพิกัด

        latLngs.push([loc.lat, loc.lng]);

        // สร้าง Custom Icon
        const numberedIcon = new L.DivIcon({
            className: "custom-map-icon", // ต้องมี class แม้จะว่างเปล่า
            html: `
              <div style="position: relative; width: 32px; height: 32px;">
                <div style="
                  width: 32px; 
                  height: 32px; 
                  background-color: #1E518C; 
                  border: 2px solid #C2DCF3; 
                  border-radius: 50%; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
                  border-top: 8px solid #1E518C;
                "></div>
              </div>
            `,
            iconSize: [32, 40],
            iconAnchor: [16, 40], // จุดปัก (กลางแนวนอน, ล่างสุดแนวตั้ง)
            popupAnchor: [0, -40]
        });

        // เพิ่ม Marker ลงใน LayerGroup
        const marker = L.marker([loc.lat, loc.lng], { icon: numberedIcon })
            .bindPopup(`<b style="font-family: sans-serif;">${loc.name}</b>`);
        
        if (markersRef.current) {
            markersRef.current.addLayer(marker);
        }
    });

    // D. ปรับมุมกล้อง (Fit Bounds)
    if (latLngs.length > 0) {
        const bounds = L.latLngBounds(latLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

    // E. (Optional) วาดเส้นตรงเชื่อมจุด (Polyline) ง่ายๆ ก่อน (ถ้า ORS ยังไม่พร้อม)
    if (latLngs.length > 1) {
        routeLineRef.current = L.polyline(latLngs, {
            color: '#1E518C',
            weight: 4,
            dashArray: '10, 10',
            opacity: 0.7
        }).addTo(map);
    }

  }, [map, locations]);

  return null; // Component นี้ไม่ render UI เอง
};

export default function ItineraryMap({ locations }: ItineraryMapProps) {
  return (
    <MapContainer 
      center={[13.7563, 100.5018]} // Default Bangkok
      zoom={6} 
      className="w-full h-full z-0"
      zoomControl={false} // ปิดปุ่ม Zoom เดิม (เพราะเรามีปุ่มแยกข้างนอก)
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* เรียกใช้ Controller ที่สร้างไว้ข้างบน */}
      <MapController locations={locations} />

    </MapContainer>
  );
}