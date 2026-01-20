"use client";
import { useState } from "react";
import { X, User, Loader2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "./Navbar";

interface EditProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditProfileModal({ user, onClose, onSuccess }: EditProfileModalProps) {
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(user.name || "");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user.image || null);
  const [isFocused, setIsFocused] = useState(false);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user.id) throw new Error("User ID not found");

      let avatarUrl = user.image;

      // 1. Upload รูป (ถ้ามี)
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();

        // ❌ แบบเดิม (วางกองไว้หน้าบ้าน):
        // const fileName = `${user.id}-${Date.now()}.${fileExt}`;
        // const filePath = `${fileName}`;

        // ✅ แบบใหม่ (ใส่เข้าโฟลเดอร์ user.id):
        // Structure จะเป็น: user_id_xxxx/timestamp.jpg
        // Policy จะเช็คเจอทันทีว่า "อ๋อ โฟลเดอร์นี้เป็นของ User คนนี้นี่นา" -> ผ่านฉลุย!
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

      // 2. บันทึกข้อมูล (เปลี่ยนเป็น UPDATE)
      // เราใช้ .update() และระบุ .eq('id', user.id) เพื่อบอกว่าแก้ยูสเซอร์คนนี้เท่านั้น
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: username,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id); // ⚠️ สำคัญ: ต้องระบุว่าจะแก้แถวไหน

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
      {/* ✅ Modal Card: ปรับสไตล์ตามสเปก */}
      <div className="relative w-[483px] h-[439px] bg-[#FFFFFF] rounded-[16px] border-[2px] border-[#C2DCF3] shadow-[5px_8px_11px_0px_#00000059] p-[32px] flex flex-col gap-[32px]">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="font-inter font-bold text-[36px] text-[#194473] leading-none tracking-normal">
            {/* แสดงชื่อเดิม (user.name) ไม่เปลี่ยนตาม Input */}
            {user.name}
          </h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 rounded-full transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 h-full">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">

            {/* ✅ เปลี่ยน div เป็น label และใส่ cursor-pointer */}
            {/* ใส่ group เพื่อให้เวลา hover ที่รูป แล้ว icon เปลี่ยนสีได้ด้วย (Optional) */}
            <label className="relative w-[91px] h-[90px] cursor-pointer group">

              {/* ย้าย input มาไว้ตรงนี้ เพื่อให้ครอบคลุมพื้นที่ทั้งหมด */}
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleAvatarChange}
              />

              {/* ส่วนแสดงรูปภาพ (เพิ่ม transition ให้ขอบเปลี่ยนสีตอน Hover) */}
              <div className="w-full h-full rounded-full overflow-hidden border-2 border-gray-100 shadow-sm group-hover:border-blue-400 transition-all">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Edit Icon: เปลี่ยนจาก label เป็น div ธรรมดา (เพราะตัวแม่เป็น label แล้ว) */}
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
          {/* Wrapper: w-[419px] h-[75px] gap-[16px] */}
          <div className="w-[419px] h-[75px] flex flex-col gap-[16px]">
            <label className="font-inter font-bold text-[20px] text-[#194473] leading-none tracking-normal">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              /* ✅ เพิ่ม 2 บรรทัดนี้เพื่อจับจังหวะคลิก */
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
      </div>
    </div>
  );
}