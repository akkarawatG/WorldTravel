"use client";

import React, { useState, useEffect, useMemo } from "react";
import { ComposableMap, ZoomableGroup } from "react-simple-maps";
import { geoIdentity, geoPath } from "d3-geo";
import { feature } from "topojson-client"; 

interface MapProps {
   countryCode: string;
   regionColors: Record<string, string>;
   selectedRegions: string[]; 
   onRegionClick: (name: string) => void;
}

export default function DynamicMap({ 
  countryCode, 
  regionColors,
  selectedRegions, 
  onRegionClick 
}: MapProps) {
  
  const [geoData, setGeoData] = useState<any>(null);
  const [tooltipContent, setTooltipContent] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null);
  
  // กำหนดขนาด Base สำหรับคำนวณ Projection (ไม่เกี่ยวกับขนาดแสดงผลจริง)
  const MAP_WIDTH = 800;
  const MAP_HEIGHT = 600;

  const [mapConfig, setMapConfig] = useState({ scale: 1, offset: [0, 0] as [number, number] });

  useEffect(() => {
    const fetchMap = async () => {
      setIsLoading(true); setErrorMsg(null); setGeoData(null);
      try {
        let code = countryCode.toLowerCase().trim();
        const codeMap: Record<string, string> = { 'uk': 'gb', 'usa': 'us', 'uae': 'ae' };
        if (codeMap[code]) code = codeMap[code];
        
        // Fetch Highcharts TopoJSON
        const url = `https://code.highcharts.com/mapdata/countries/${code}/${code}-all.topo.json`;
        const response = await fetch(url);
        
        if (!response.ok) throw new Error(`Map data not found`);
        const topology = await response.json();
        
        let objectKey = Object.keys(topology.objects)[0];
        for (const key in topology.objects) { if (topology.objects[key].geometries) { objectKey = key; break; } }
        
        const geojson = feature(topology, topology.objects[objectKey]);
        
        // Calculate Projection to fit the SVG box
        const projection = geoIdentity().reflectY(true).fitSize([MAP_WIDTH, MAP_HEIGHT], geojson as any);
        
        setMapConfig({ scale: projection.scale(), offset: [projection.translate()[0], projection.translate()[1]] });
        setGeoData(geojson);
      } catch (err: any) { setErrorMsg("Failed to load map"); } finally { setIsLoading(false); }
    };
    fetchMap();
  }, [countryCode]);

  const pathGenerator = useMemo(() => {
     if (!mapConfig.scale) return null;
     const projection = geoIdentity().reflectY(true).scale(mapConfig.scale).translate(mapConfig.offset);
     return geoPath().projection(projection);
  }, [mapConfig]);

  const handleMouseMove = (event: React.MouseEvent) => { setMousePos({ x: event.clientX, y: event.clientY - 20 }); };

  if (isLoading) return <div className="w-full h-full flex items-center justify-center text-gray-400 animate-pulse">Loading Map...</div>;
  if (!geoData || !pathGenerator) return <div className="w-full h-full flex items-center justify-center text-gray-300">Map data unavailable</div>;

  const features = geoData.type === 'FeatureCollection' ? geoData.features : [geoData];

  return (
    // ✅ ปรับ Container เป็น w-full h-full เพื่อให้เต็มพื้นที่ Parent
    // ✅ ตัด bg-gray-100 และ border ออก เพื่อให้เนียนไปกับพื้นหลังขาวของ Frame หลัก
    <div className="w-full h-full relative flex items-center justify-center outline-none" onMouseMove={handleMouseMove}>
      
      <ComposableMap 
        width={MAP_WIDTH} 
        height={MAP_HEIGHT} 
        className="w-full h-full outline-none"
        projectionConfig={{}}
      >
        <ZoomableGroup 
            center={[MAP_WIDTH / 2, MAP_HEIGHT / 2]} 
            minZoom={0.8} 
            maxZoom={6} 
            translateExtent={[[0, 0], [MAP_WIDTH, MAP_HEIGHT]]}
        > 
          <g className="outline-none">
            {features.map((geo: any, index: number) => {
                const regionName = geo.properties["name"] || geo.properties["NAME_1"] || "Unknown";
                const isSelected = selectedRegions.includes(regionName); 
                const isHovered = hoveredRegion === regionName;
                const pathData = pathGenerator(geo) || undefined;

                // 🎨 Color Logic
                let fillColor = "#CCCCCC"; // Default Gray (Color of unselected regions)
                
                // 1. Priority: สีจาก Status
                if (regionColors[regionName]) {
                    fillColor = regionColors[regionName];
                } 
                // 2. Priority: สี Default ถ้าเลือกแล้ว
                else if (isSelected) {
                    fillColor = "#3B82F6"; 
                }

                // 3. Hover Effect (Darken slightly)
                if (isHovered) {
                    fillColor = adjustColor(fillColor, -20);
                }

                return (
                  <path
                    key={`${regionName}-${index}`} 
                    d={pathData} 
                    fill={fillColor} 
                    stroke="#FFFFFF" 
                    strokeWidth={0.5}
                    style={{ 
                        transition: "fill 0.2s ease", 
                        cursor: "pointer", 
                        outline: "none" 
                    }}
                    onClick={() => onRegionClick(regionName)}
                    onMouseEnter={() => { setTooltipContent(regionName); setHoveredRegion(regionName); }}
                    onMouseLeave={() => { setTooltipContent(""); setHoveredRegion(null); }}
                  />
                );
            })}
          </g>
        </ZoomableGroup>
      </ComposableMap>

      {/* Tooltip */}
      {tooltipContent && (
         <div 
            className="fixed z-[9999] pointer-events-none bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg backdrop-blur-sm opacity-90 transition-opacity"
            style={{ 
                left: mousePos.x, 
                top: mousePos.y, 
                transform: 'translate(-50%, -100%)' 
            }}
         >
            {tooltipContent}
         </div>
      )}
    </div>
  );
}

// ✅ Helper Function: ปรับความเข้มสีสำหรับ Hover Effect
function adjustColor(color: string, amount: number) {
    if (!color.startsWith("#")) return color; // รองรับเฉพาะ Hex ชั่วคราว
    
    const hex = color.replace("#", "");
    const num = parseInt(hex, 16);
    
    let r = (num >> 16) + amount;
    let g = ((num >> 8) & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;

    r = Math.max(Math.min(255, r), 0);
    g = Math.max(Math.min(255, g), 0);
    b = Math.max(Math.min(255, b), 0);

    return "#" + (g | (b << 8) | (r << 16)).toString(16).padStart(6, '0');
}