"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, MapPin, Copy, AlertCircle } from "lucide-react";

export default function SharedTemplatePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);
  const [debugError, setDebugError] = useState<string | null>(null);

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
          .maybeSingle();

        if (error) {
          setDebugError(`Supabase Error: ${error.message}`);
          throw error;
        }

        if (!data) {
           setDebugError("ไม่พบ Template นี้ (อาจถูกลบ หรือ Policy RLS บล็อกไว้)");
           return;
        }

        if (!data.is_public) {
           setDebugError("Template นี้ถูกตั้งค่าเป็นส่วนตัว (Private) ไม่สามารถโคลนได้");
           return;
        }

        setTemplate(data);
      } catch (err) {
        console.error("Error fetching template:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id]);

  const handleCloneTemplate = async () => {
    setIsCloning(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login first to use this template.");
        // ตรงนี้คุณอาจจะเด้งไปหน้าแรก หรือเปิด Modal Login ได้
        setIsCloning(false);
        return;
      }

      // 1. สร้างทริปใหม่ให้ผู้ใช้งานอัตโนมัติ โดยอิงประเทศจากเทมเพลตต้นฉบับ
      const countryCode = template.trips?.country || "th";
      const { data: newTrip, error: tripError } = await supabase
        .from('trips')
        .insert({
          profile_id: user.id,
          country: countryCode,
        })
        .select()
        .single();

      if (tripError) throw tripError;

      // 2. เรียกใช้ฟังก์ชันโคลนเข้าทริปที่เพิ่งสร้าง
      const { error: cloneError } = await supabase.rpc('clone_template', {
        source_template_id: template.id,
        new_trip_id: newTrip.id
      });

      if (cloneError) throw cloneError;

      alert("Template cloned successfully!");
      // พาผู้ใช้ไปหน้าแก้ไขของทริปใหม่ทันที เพื่อให้เริ่มจัดแผนต่อได้เลย
      router.push(`/mytrips/edit/${newTrip.id}`); 

    } catch (err: any) {
      console.error("Clone error:", err.message);
      alert("Failed to clone template: " + err.message);
    } finally {
      setIsCloning(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;

  if (debugError || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Template Not Found</h1>
          <p className="text-gray-500 mb-6 text-center max-w-md">This template may be private or has been deleted.</p>
          
          {debugError && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl mb-6 max-w-lg w-full flex gap-3 text-sm items-start shadow-sm">
               <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
               <div>
                  <span className="font-bold block mb-1">Developer Debug Info:</span>
                  {debugError}
               </div>
            </div>
          )}

          <button onClick={() => router.push('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition shadow-sm">
              Go to Homepage
          </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="max-w-3xl mx-auto pt-20 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{template.template_name || 'Untitled Template'}</h1>
              <div className="flex items-center gap-4 text-gray-500 text-sm">
                <span className="flex items-center gap-1 uppercase"><MapPin size={16} /> {template.trips?.country || 'N/A'}</span>
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
              onClick={handleCloneTemplate}
              disabled={isCloning}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl flex justify-center items-center gap-2 transition disabled:opacity-70 shadow-sm cursor-pointer"
            >
              {isCloning ? <Loader2 className="w-5 h-5 animate-spin" /> : <Copy className="w-5 h-5" />}
              {isCloning ? 'Creating your trip & Cloning...' : 'Use this Template'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}