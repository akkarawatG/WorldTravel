"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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
  color?: string;
  geometry?: number[][]; 
}

// ✅ 1. เพิ่ม onMapClick เข้ามาใน Props Interface
export interface ItineraryMapProps {
  locations: Location[];
  onMapClick?: (lat: number, lng: number) => void;
}

const MapController = ({ locations }: { locations: Location[] }) => {
  const map = useMap();
  const markersRef = useRef<L.LayerGroup | null>(null);
  const routeLinesRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    if (markersRef.current) markersRef.current.clearLayers();
    else markersRef.current = L.layerGroup().addTo(map);

    if (routeLinesRef.current) routeLinesRef.current.clearLayers();
    else routeLinesRef.current = L.layerGroup().addTo(map);

    if (!locations || locations.length === 0) return;

    const allLatLngs: L.LatLngExpression[] = [];

    locations.forEach((loc) => {
        if (!loc.lat || !loc.lng) return;

        const point: [number, number] = [loc.lat, loc.lng];
        allLatLngs.push(point);
        const markerColor = loc.color || '#1E518C';

        const numberedIcon = new L.DivIcon({
            className: "custom-map-icon",
            html: `
              <div style="position: relative; width: 32px; height: 32px;">
                <div style="width: 32px; height: 32px; background-color: ${markerColor}; border: 2px solid #FFFFFF; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); z-index: 10; position: relative;">
                  <span style="color: white; font-weight: bold; font-size: 12px; font-family: sans-serif;">${loc.order_index}</span>
                </div>
                <div style="position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid ${markerColor};"></div>
              </div>
            `,
            iconSize: [32, 40],
            iconAnchor: [16, 40],
            popupAnchor: [0, -40]
        });

        if (markersRef.current) {
            L.marker(point, { icon: numberedIcon })
                .bindPopup(`<b style="font-family: sans-serif;">${loc.name}</b>`)
                .addTo(markersRef.current);
        }

        if (loc.geometry && loc.geometry.length > 0 && routeLinesRef.current) {
            const leafletPath: L.LatLngExpression[] = loc.geometry.map((coord) => [coord[1], coord[0]]);

            L.polyline(leafletPath, {
                color: markerColor, 
                weight: 5,
                opacity: 0.7,
                lineCap: 'round',
                lineJoin: 'round'
            }).addTo(routeLinesRef.current);
        }
    });

    if (allLatLngs.length > 0) {
        const bounds = L.latLngBounds(allLatLngs);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }

  }, [map, locations]);

  return null;
};

// ✅ 2. Component พิเศษเพื่อจับการคลิก
function MapClickHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            if (onMapClick) {
                onMapClick(e.latlng.lat, e.latlng.lng);
            }
        }
    });
    return null;
}

export default function ItineraryMap({ locations, onMapClick }: ItineraryMapProps) {
  return (
    <MapContainer 
      center={[13.7563, 100.5018]} 
      zoom={6} 
      // ✅ 3. บังคับ height/width 100%
      style={{ height: '100%', width: '100%', zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* ✅ 4. เพิ่มตัวดักการคลิกลงไป */}
      <MapClickHandler onMapClick={onMapClick} />
      
      <MapController locations={locations} />
    </MapContainer>
  );
}