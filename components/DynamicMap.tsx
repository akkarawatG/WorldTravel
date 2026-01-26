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
  const [mapConfig, setMapConfig] = useState({ scale: 1, offset: [0, 0] as [number, number] });

  useEffect(() => {
    const fetchMap = async () => {
      setIsLoading(true); setErrorMsg(null); setGeoData(null);
      try {
        let code = countryCode.toLowerCase().trim();
        const codeMap: Record<string, string> = { 'uk': 'gb', 'usa': 'us', 'uae': 'ae' };
        if (codeMap[code]) code = codeMap[code];
        const url = `https://code.highcharts.com/mapdata/countries/${code}/${code}-all.topo.json`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Map data not found`);
        const topology = await response.json();
        let objectKey = Object.keys(topology.objects)[0];
        for (const key in topology.objects) { if (topology.objects[key].geometries) { objectKey = key; break; } }
        const geojson = feature(topology, topology.objects[objectKey]);
        const width = 800; const height = 600;
        const projection = geoIdentity().reflectY(true).fitSize([width, height], geojson as any);
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

  const handleMouseMove = (event: React.MouseEvent) => { setMousePos({ x: event.clientX, y: event.clientY - 40 }); };

  if (isLoading || !geoData || !pathGenerator) return <div className="w-full h-full flex items-center justify-center text-gray-400">Loading Map...</div>;

  const features = geoData.type === 'FeatureCollection' ? geoData.features : [geoData];

  return (
    <div className="w-full h-full bg-gray-100 rounded-xl overflow-hidden relative flex items-center justify-center border border-gray-200" onMouseMove={handleMouseMove}>
      <ComposableMap width={800} height={600} className="w-full h-full" style={{ maxHeight: "80vh", maxWidth: "100%" }} projectionConfig={{}}>
        <ZoomableGroup center={[400, 300]} minZoom={0.5} maxZoom={4} translateExtent={[[0, 0], [800, 600]]}> 
          <g>
            {features.map((geo: any, index: number) => {
                const regionName = geo.properties["name"] || geo.properties["NAME_1"] || "Unknown";
                const isSelected = selectedRegions.includes(regionName); 
                const isHovered = hoveredRegion === regionName;
                const pathData = pathGenerator(geo) || undefined;

                // 🎨 Color Logic
                let fillColor = "#E5E7EB"; // Default Gray
                
                // 1. Priority: สีจาก Status (สำคัญสุด)
                if (regionColors[regionName]) {
                    fillColor = regionColors[regionName];
                } 
                // 2. Priority: สีฟ้า Default ถ้าเลือกแล้วยังไม่กำหนด Status
                else if (isSelected) {
                    fillColor = "#3B82F6"; 
                }

                // 3. Hover Effect
                if (isHovered) {
                    fillColor = (regionColors[regionName] || isSelected) ? adjustColor(fillColor, -20) : "#D1D5DB";
                }

                return (
                  <path
                    key={`${regionName}-${index}`} d={pathData} fill={fillColor} 
                    stroke="#FFFFFF" // ✅ ขอบขาวเสมอ
                    strokeWidth={isHovered ? 1 : 0.5}
                    style={{ transition: "fill 0.2s ease, stroke 0.2s ease", cursor: "pointer", outline: "none" }}
                    onClick={() => onRegionClick(regionName)}
                    onMouseEnter={() => { setTooltipContent(regionName); setHoveredRegion(regionName); }}
                    onMouseLeave={() => { setTooltipContent(""); setHoveredRegion(null); }}
                  />
                );
            })}
          </g>
        </ZoomableGroup>
      </ComposableMap>
      {tooltipContent && (
         <div className="fixed bg-gray-900/95 text-white px-3 py-1.5 rounded-lg text-sm font-bold shadow-xl pointer-events-none z-50 backdrop-blur-md border border-white/10" style={{ left: mousePos.x, top: mousePos.y, transform: 'translateX(-50%) translateY(-120%)' }}>
            {tooltipContent}
         </div>
      )}
    </div>
  );
}

function adjustColor(color: string, percent: number) { return color; }