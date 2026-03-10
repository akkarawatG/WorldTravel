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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-[483px] h-[439px] bg-[#FFFFFF] rounded-[16px] border-[2px] border-[#C2DCF3] shadow-[5px_8px_11px_0px_#00000059] p-[32px] flex flex-col gap-[32px]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-inter font-bold text-[36px] text-[#194473] leading-none tracking-normal">
            {isCropping ? "Adjust Photo" : user.name}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        {/* ---------------------------------------------------- */}
        {/* หน้าจอ CROP IMAGE (แสดงเมื่อเลือกรูปใหม่) */}
        {/* ---------------------------------------------------- */}
        {isCropping ? (
          <div className="flex flex-col h-full gap-4 relative animate-in fade-in zoom-in-95 duration-200">
            {/* พื้นที่ Crop */}
            <div className="relative flex-1 w-full bg-gray-100 rounded-[12px] overflow-hidden border border-gray-200">
              {imageSrc && (
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}          // บังคับสัดส่วนให้เป็น 1:1 (สี่เหลี่ยมจัตุรัส)
                  cropShape="round"   // ให้กรอบตัดเป็นวงกลม (เหมาะกับโปรไฟล์)
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
            <div className="flex items-center gap-3 mt-auto">
              <button
                type="button"
                onClick={() => setIsCropping(false)}
                className="flex-1 h-10 border border-gray-300 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCropConfirm}
                className="flex-1 h-10 bg-[#194473] hover:bg-[#14365d] text-white font-medium rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Check size={16} /> Confirm
              </button>
            </div>
          </div>
        ) : (
          /* ---------------------------------------------------- */
          /* หน้าจอแก้ไขโปรไฟล์ปกติ */
          /* ---------------------------------------------------- */
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full animate-in fade-in duration-200">
            
            {/* Avatar Section */}
            <div className="flex flex-col items-center gap-4">
              <label className="relative w-[91px] h-[90px] cursor-pointer group">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 shadow-sm group-hover:border-blue-400 transition-all">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-blue-600 group-hover:bg-blue-700 text-white p-2 rounded-full shadow-md transition-all transform group-hover:scale-105">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.91l-.495 3.762a1 1 0 0 0 1.08 1.08l3.762-.495a2 2 0 0 0 .91-.5l13.573-13.577z" />
                  </svg>
                </div>
              </label>

              <p className="font-inter font-normal text-[12px] text-[#9E9E9E] leading-none tracking-normal">
                Click icon to change photo
              </p>
            </div>

            {/* Username Section */}
            <div className="w-[419px] h-[75px] flex flex-col gap-[16px]">
              <label className="font-inter font-bold text-[20px] text-[#194473] leading-none tracking-normal">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required
                className={`w-[419px] h-[43px] bg-[#FFFFFF] border-[1px] border-[#EEEEEE] rounded-[8px] px-[16px] py-[12px] outline-none focus:border-[#2196F3] transition-all
                  font-inter font-medium text-[16px] leading-none tracking-normal
                  ${(isFocused || username !== user.name) ? "text-[#212121]" : "text-[#9E9E9E]"}
                `}
                placeholder="Display name"
              />
            </div>

            {/* Action Buttons */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 bg-[#194473] hover:bg-[#14365d] text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2 mt-auto disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}