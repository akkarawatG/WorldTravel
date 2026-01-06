"use client";
import { useState, useEffect } from "react";
import { Search, Star, MapPin, Check } from "lucide-react";
import { Attraction } from "../types";
import { geoService } from "../services/geo.service";
import { osmService } from "../services/osm.service";
import { wikiService } from "../services/wiki.service";

interface AttractionsContentProps {
  country: string;
  continent: string;
  onBack: () => void;
  onSelectAttraction: (a: Attraction) => void;
}

export default function AttractionsContent({ country, continent, onBack, onSelectAttraction }: AttractionsContentProps) {
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setAttractions([]);

      const CAPITALS: { [key: string]: string } = { "Japan": "Tokyo", "Thailand": "Bangkok", "France": "Paris", "China": "Beijing", "India": "New Delhi", "United States": "New York", "United Kingdom": "London", "Italy": "Rome", "South Korea": "Seoul", "Vietnam": "Hanoi", "Spain": "Madrid" };
      const target = CAPITALS[country] || country;

      // 1. Get Coords
      const coords = await geoService.getCoordinates(target);
      if (!coords) {
        setLoading(false);
        return;
      }

      // 2. Get OSM Data
      // *** แก้ไขตรงนี้: เพิ่มเลข 5000 (รัศมีเป็นเมตร) เข้าไปเป็น parameter ตัวที่ 3 ***
      const osmData = await osmService.getAttractions(coords.lat, coords.lon, "tourism");

      // 3. Enrich with Wiki Images
      const finalData = await wikiService.getImagesForOSM(osmData);

      setAttractions(finalData);
      setLoading(false);
    };

    loadData();
  }, [country]);

  const filtered = filterType === "All" ? attractions : attractions.filter(p => p.kind === filterType);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={onBack} className="text-gray-500 hover:text-sky-600 mb-2 flex items-center gap-2 transition">
            ← Back to Map
          </button>
          <h2 className="text-3xl font-bold text-gray-800">Explore {country}</h2>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <MapPin className="w-4 h-4" /> {continent} Region
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filter */}
        <div className="hidden lg:block lg:col-span-1 space-y-8 sticky top-4 h-fit">
          <div>
            <h3 className="font-bold text-lg mb-4">Filters</h3>
            <div className="relative mb-6">
              <input type="text" placeholder="Search..." className="w-full bg-gray-100 rounded-lg py-3 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-sky-500" />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>

            <div className="space-y-2 mb-6">
              {["All", "Museum", "Temple", "Park", "Viewpoint"].map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterType(type)}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${filterType === type ? "bg-sky-600 text-white" : "bg-gray-200"}`}>
                    {filterType === type && <Check className="w-3 h-3" />}
                  </div>
                  <span className="text-sm text-gray-600">{type}</span>
                </label>
              ))}
            </div>

            <button className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-lg mb-3 transition shadow-lg shadow-sky-200">Apply Filters</button>
            <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-lg transition" onClick={() => setFilterType("All")}>Reset</button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="col-span-1 lg:col-span-3">
          {loading ? (
            <div className="text-center py-20 text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(place => (
                <div key={place.id} className="bg-white rounded-xl shadow-sm hover:shadow-xl overflow-hidden flex flex-col transition-all duration-300 group">
                  <div className="relative h-48 bg-gray-200">
                    <img
                      src={place.image}
                      className="w-full h-full object-cover group-hover:scale-105 transition"
                      alt={place.name}
                      onError={(e) => (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?w=600&q=80"}
                    />
                    <button className="absolute top-3 right-3 bg-white/90 hover:bg-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm transition">+ Add</button>
                    <span className="absolute top-3 left-3 bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded">{place.kind}</span>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-lg font-bold mb-1 line-clamp-1">{place.name}</h3>
                    <p className="text-xs text-gray-500 mb-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {country}</p>
                    <div className="flex items-center gap-1 mb-3">
                      <div className="flex text-yellow-400">
                        {[1, 2, 3, 4].map(i => <Star key={i} className="w-3 h-3 fill-current" />)}
                        <Star className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold ml-1">{place.rating}</span>
                      <span className="text-xs text-gray-400">({place.reviews})</span>
                    </div>
                    <button onClick={() => onSelectAttraction(place)} className="w-full bg-sky-50 text-sky-700 font-bold py-2 rounded-lg text-sm mt-auto hover:bg-sky-100 transition">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && filtered.length === 0 && <div className="text-center py-20 text-gray-400 bg-white rounded-xl">No places found for this filter.</div>}
        </div>
      </div>
    </div>
  );
}