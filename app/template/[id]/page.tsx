"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, MapPin, Copy } from "lucide-react";
import Navbar from "@/components/Navbar";

// --- Helper: สำหรับแปลงรหัสประเทศเป็นชื่อเต็ม ---
const COUNTRY_NAMES: Record<string, string> = {
  // Asia
  cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan", bh: "Bahrain", kw: "Kuwait", kz: "Kazakhstan", ph: "Philippines", uz: "Uzbekistan", kh: "Cambodia", jo: "Jordan", la: "Laos", bn: "Brunei", om: "Oman", qa: "Qatar", lk: "Sri Lanka", ir: "Iran",
  // Europe
  fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", hr: "Croatia", tr: "Turkey", gb: "United Kingdom", de: "Germany", gr: "Greece", dk: "Denmark", at: "Austria", nl: "Netherlands", pt: "Portugal", ro: "Romania", ch: "Switzerland", be: "Belgium", lv: "Latvia", ge: "Georgia", se: "Sweden", lt: "Lithuania", ee: "Estonia", no: "Norway", fi: "Finland", is: "Iceland",
  // North America
  us: "United States", mx: "Mexico", ca: "Canada", do: "Dominican Republic", bs: "Bahamas", cu: "Cuba", jm: "Jamaica", cr: "Costa Rica", gt: "Guatemala", pa: "Panama",
  // South America
  ar: "Argentina", br: "Brazil", cl: "Chile", pe: "Peru", py: "Paraguay", co: "Colombia", uy: "Uruguay", ec: "Ecuador",
  // Africa
  za: "South Africa", ma: "Morocco", eg: "Egypt", ke: "Kenya", na: "Namibia", tz: "Tanzania",
  // Oceania
  au: "Australia", nz: "New Zealand"
};

export default function SharedTemplatePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  // ✅ เพิ่ม Base Path
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      if (!id) return;
      try {
        const { data, error } = await supabase
          .from("templates")
          .select(`
            *,
            trips ( country ),
            template_provinces ( province_code )
          `)
          .eq("id", id)
          .eq("is_public", true)
          .single();

        if (error) throw error;
        setTemplate(data);
      } catch (err) {
        console.error("Error fetching template:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const getCorrectCountryCode = () => {
    if (!template?.trips) return "th"; 
    let code = Array.isArray(template.trips) ? template.trips[0]?.country : template.trips.country;
    return code ? code.toLowerCase() : "th";
  };

  const handleDirectClone = async () => {
    setIsCloning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please login first to use this template.");
        // ✅ เพิ่ม basePath ตอนเตะกลับหน้าแรก
        router.push(`${basePath}/`); 
        return;
      }

      const countryCode = getCorrectCountryCode();

      const { data: newTrip, error: tripError } = await supabase
        .from('trips')
        .insert({
          profile_id: user.id,
          country: countryCode,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      const { error: cloneError } = await supabase.rpc('clone_template', {
        source_template_id: id,
        new_trip_id: newTrip.id
      });

      if (cloneError) throw cloneError;

      alert("Template cloned successfully!");
      // ✅ เพิ่ม basePath ตอนไปหน้า edit ทริป
      router.push(`${basePath}/mytrips/edit/${newTrip.id}`); 

    } catch (err: any) {
      console.error("Clone error:", err.message);
      alert("Failed to clone template: " + err.message);
    } finally {
      setIsCloning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Template Not Found</h1>
        <p className="text-gray-500 mb-6">This template may be private or has been deleted.</p>
        {/* ✅ เพิ่ม basePath */}
        <button onClick={() => router.push(`${basePath}/`)} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Go to Homepage
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans relative">
      <div className="max-w-3xl mx-auto pt-20 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.template_name || 'Untitled Template'}</h1>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  {(() => {
                    const code = getCorrectCountryCode();
                    return COUNTRY_NAMES[code] || code.toUpperCase();
                  })()}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(template.travel_start_date).toLocaleDateString()} - {new Date(template.travel_end_date).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              Copied {template.copied_count} times
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Notes</h3>
            <p className="text-gray-600 bg-gray-50 p-4 rounded-lg min-h-[100px]">
              {template.notes || 'No description provided.'}
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleDirectClone} 
              disabled={isCloning}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-50"
            >
              {isCloning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
              {isCloning ? 'Creating Trip & Cloning...' : 'Use this Template'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}