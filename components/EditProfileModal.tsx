"use client";

import { useState, useCallback } from "react";
import { X, User, Loader2, Check, ZoomIn } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "./Navbar";
import Cropper from "react-easy-crop";

interface EditProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

// --- Helper Function สำหรับทำการตัดรูป (Crop) จาก Canvas ---
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // ป้องกันปัญหา CORS
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number }
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      // แปลง Blob ให้เป็น File เพื่อพร้อมอัปโหลดเข้า Supabase
      const file = new File([blob], "cropped_avatar.jpg", {
        type: "image/jpeg",
      });
      resolve(file);
    }, "image/jpeg");
  });
}

export default function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null);
  const [isFocused, setIsFocused] = useState(false);

  // --- States สำหรับการตัดรูป (Cropping) ---
  const [isCropping, setIsCropping] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // 1. เมื่อผู้ใช้เลือกรูป
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setIsCropping(true); // เปิดหน้าจอ Crop
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 2. เมื่อผู้ใช้กดยืนยันการตัดรูป
  const handleCropConfirm = async () => {
    if (imageSrc && croppedAreaPixels) {
      try {
        const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
        setAvatarFile(croppedFile);
        setAvatarPreview(URL.createObjectURL(croppedFile)); // อัปเดต Preview รูปที่ตัดแล้ว
        setIsCropping(false); // ปิดหน้าจอ Crop
      } catch (e) {
        console.error("Crop failed", e);
        alert("Failed to crop image.");
      }
    }
  };

  // 3. ฟังก์ชัน Submit ข้อมูลเข้าฐานข้อมูล
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user.id) throw new Error("User ID not found");

      let avatarUrl = user.image;

      // อัปโหลดรูป (ถ้ามีการเปลี่ยน/ตัดรูปใหม่)
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatar')
          .upload(filePath, avatarFile, {
            cacheControl: '3600',
            upsert: true // ทับไฟล์เก่าได้เลย
          });

        if (uploadError) throw uploadError;

        // ดึง URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatar')
          .getPublicUrl(filePath);

        avatarUrl = publicUrl;
      }

      // บันทึกข้อมูล
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id); 

      if (updateError) throw updateError;

      onSuccess();

    } catch (error: any) {
      console.error("Error updating profile:", error);
      alert("Error updating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ✅ นอกสุด: มือถือพื้นหลังขาวล้วน (bg-white) เลื่อนขึ้นมา | Desktop มี Backdrop (sm:bg-black/40)
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white sm:bg-black/40 sm:backdrop-blur-sm sm:p-4 animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:fade-in duration-300">
      
      {/* ✅ กล่องใน: มือถือเต็มจอ 100dvh ไม่มีขอบมน | Desktop กว้าง 483px มีขอบมนและเงา */}
      <div className="relative w-full h-[100dvh] sm:h-auto sm:min-h-[400px] sm:max-w-[483px] bg-[#FFFFFF] sm:rounded-[16px] sm:border-[2px] sm:border-[#C2DCF3] sm:shadow-[5px_8px_11px_0px_#00000059] flex flex-col p-6 pt-16 sm:p-[32px] gap-6 sm:gap-[32px] overflow-y-auto">

        {/* ปุ่มปิด (X) - วางตำแหน่ง Absolute มุมขวาบน */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition flex-shrink-0 z-10"
        >
          <X size={24} className="sm:w-5 sm:h-5" />
        </button>

        {/* ---------------------------------------------------- */}
        {/* หน้าจอ CROP IMAGE */}
        {/* ---------------------------------------------------- */}
        {isCropping ? (
          <div className="flex flex-col flex-1 gap-4 relative animate-in fade-in zoom-in-95 duration-200 min-h-[300px]">
            <h3 className="font-inter font-bold text-[24px] sm:text-[36px] text-[#194473] text-center leading-none tracking-normal">
              Adjust Photo
            </h3>
            
            {/* พื้นที่ Crop */}
            <div className="relative flex-1 w-full bg-gray-100 rounded-[12px] overflow-hidden border border-gray-200 min-h-[300px] sm:min-h-[250px]">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              )}
            </div>

            {/* แถบเลื่อน Zoom */}
            <div className="flex items-center gap-3 px-2">
              <ZoomIn size={18} className="text-gray-500 flex-shrink-0" />
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* ปุ่มยืนยัน / ยกเลิก */}
            <div className="flex items-center gap-3 mt-auto pt-2">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="flex-1 h-12 sm:h-10 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 h-12 sm:h-10 bg-[#194473] hover:bg-[#14365d] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Check size={18} className="sm:w-4 sm:h-4" /> Confirm
              </button>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* หน้าจอแก้ไขโปรไฟล์ปกติ */
          /* ---------------------------------------------------- */
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:gap-8 h-full animate-in fade-in duration-200">
            
            {/* ✅ Title: ตรงกลางตามแบบ Design (มือถือและ Desktop) */}
            <h3 className="font-inter font-bold text-[32px] sm:text-[36px] text-[#194473] leading-none tracking-normal text-center w-full truncate px-4">
              {user.name}
            </h3>

            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-3 mt-2 sm:mt-0">
              <label className="relative w-[110px] h-[110px] sm:w-[91px] sm:h-[90px] cursor-pointer group">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <div className="w-full h-full rounded-full overflow-hidden border-[3px] border-gray-100 shadow-md group-hover:border-blue-400 transition-all">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="w-10 h-10 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                {/* ไอคอน Edit ดินสอ ตามภาพ Design */}
                <div className="absolute bottom-0 right-0 bg-gray-200 text-gray-700 p-2 rounded-full shadow-md border border-white transition-all transform group-hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.91l-.495 3.762a1 1 0 0 0 1.08 1.08l3.762-.495a2 2 0 0 0 .91-.5l13.573-13.577z" />
                  </svg>
                </div>
              </label>

              <p className="font-inter font-normal text-[13px] sm:text-[12px] text-[#9E9E9E] leading-none tracking-normal text-center mt-1">
                Click icon to change photo
              </p>
            </div>

            {/* Username Section */}
            <div className="w-full flex flex-col gap-2 sm:gap-[16px] mt-4 sm:mt-0">
              <label className="font-inter font-bold text-[18px] sm:text-[20px] text-[#194473] leading-none tracking-normal">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
                className={`w-full h-[48px] sm:h-[43px] bg-[#FFFFFF] border-[1px] border-[#EEEEEE] rounded-[8px] px-[16px] py-[12px] outline-none focus:border-[#2196F3] transition-all shadow-sm sm:shadow-none
                  font-inter font-medium text-[16px] leading-none tracking-normal
                  ${(isFocused || username !== user.name) ? "text-[#212121]" : "text-[#9E9E9E]"}
                `}
                placeholder="Display name"
              />
            </div>

            {/* Action Buttons - ดันลงล่างสุดถ้ามีที่ว่าง */}
            <div className="mt-4 sm:mt-auto pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] sm:h-12 bg-gray-400 sm:bg-[#194473] hover:bg-gray-500 sm:hover:bg-[#14365d] text-white font-medium text-[16px] rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}