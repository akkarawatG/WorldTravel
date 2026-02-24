"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Loader2, Calendar, MapPin, Copy, X, CheckCircle2 } from "lucide-react";
import Navbar from "@/components/Navbar"; 

// --- Helper: สำหรับแปลงรหัสประเทศเป็นชื่อเต็ม ---
const COUNTRY_NAMES: Record<string, string> = {
  cn: "China", th: "Thailand", my: "Malaysia", jp: "Japan", ae: "United Arab Emirates", sa: "Saudi Arabia", sg: "Singapore", vn: "Vietnam", in: "India", kr: "South Korea", id: "Indonesia", tw: "Taiwan",
  fr: "France", es: "Spain", it: "Italy", pl: "Poland", hu: "Hungary", gb: "United Kingdom", de: "Germany",
  us: "United States", au: "Australia", nz: "New Zealand", // (สามารถเติมเพิ่มได้)
};

export default function SharedTemplatePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCloning, setIsCloning] = useState(false);

  // ✅ State สำหรับระบบเลือกทริป (Real System)
  const [showSelectTripModal, setShowSelectTripModal] = useState(false);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);

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

  // ✅ 1. ฟังก์ชันเปิด Modal และดึงรายชื่อทริปของผู้ใช้
  const openSelectTripModal = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert("Please login first to use this template.");
      router.push('/'); // ส่งกลับไปหน้าแรกเพื่อให้ล็อกอิน
      return;
    }

    setLoadingTrips(true);
    setShowSelectTripModal(true);

    try {
      const { data, error } = await supabase
        .from('trips')
        .select('id, country, created_at')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyTrips(data || []);
    } catch (err) {
      console.error("Error fetching user trips:", err);
    } finally {
      setLoadingTrips(false);
    }
  };

  // ✅ 2. ฟังก์ชัน Clone ของจริง (รับ ID จากที่เลือกใน Modal)
  const handleConfirmClone = async () => {
    if (!selectedTripId) return;

    setIsCloning(true);
    try {
      // เรียกใช้ RPC function 'clone_template' 
      const { data, error } = await supabase.rpc('clone_template', {
        source_template_id: id,
        new_trip_id: selectedTripId
      });

      if (error) throw error;

      alert("Template cloned successfully!");
      setShowSelectTripModal(false);
      
      // ส่งผู้ใช้กลับไปหน้าจัดการทริป
      router.push('/mytrips'); 

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
        <button onClick={() => router.push('/')} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
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
                <span className="flex items-center gap-1"><MapPin size={16} /> {template.trips?.country || 'Unknown Country'}</span>
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
              onClick={openSelectTripModal} // ✅ เปลี่ยนมาเรียกฟังก์ชันเปิด Modal
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl flex justify-center items-center gap-2 transition"
            >
              <Copy className="w-5 h-5" />
              Use this Template
            </button>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* ✅ MODAL: Select Target Trip สำหรับระบบจริง */}
      {/* ========================================================= */}
      {showSelectTripModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-[450px] bg-white rounded-2xl p-6 shadow-2xl flex flex-col max-h-[80vh] transform scale-100 animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Select Destination Trip</h3>
              <button onClick={() => setShowSelectTripModal(false)} className="p-1 hover:bg-gray-100 rounded-full transition">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">
              Choose an existing trip to add this template to.
            </p>

            <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-3 custom-blue-scrollbar2">
              {loadingTrips ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : myTrips.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border border-dashed">
                  <p>You don't have any trips yet.</p>
                  <p className="text-sm mt-1">Please create a trip first.</p>
                </div>
              ) : (
                myTrips.map(trip => {
                  const countryName = COUNTRY_NAMES[trip.country?.toLowerCase()] || trip.country;
                  const isSelected = selectedTripId === trip.id;
                  
                  return (
                    <div 
                      key={trip.id}
                      onClick={() => setSelectedTripId(trip.id)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex flex-col pr-8">
                        <span className="font-semibold text-gray-900 text-[16px]">{countryName} Trip</span>
                        <span className="text-xs text-gray-500 mt-1">Created: {new Date(trip.created_at).toLocaleDateString('en-GB')}</span>
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100">
              <button 
                onClick={() => setShowSelectTripModal(false)} 
                className="flex-1 h-[44px] rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button 
                onClick={handleConfirmClone} 
                disabled={!selectedTripId || isCloning}
                className="flex-1 h-[44px] rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isCloning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Clone'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}