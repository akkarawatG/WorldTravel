"use client";
import { useState, useEffect } from "react";
import { X, Mail, ChevronDown, ArrowLeft, RefreshCw, User } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

// Import Icons
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string;
}

interface AuthModalProps {
  onClose: () => void;
  onSuccess: (u: UserProfile) => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const supabase = createClient();

  const [view, setView] = useState<'options' | 'email' | 'verify' | 'onboarding'>('options');
  const [loading, setLoading] = useState(false);


  // Data State
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  // ✅ เพิ่ม: State สำหรับ Timer
  const [timer, setTimer] = useState(0);

  // Onboarding State
  const [username, setUsername] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Logic ตรวจสอบ Session เมื่อเปิด Modal
  useEffect(() => {
    const initModal = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        setLoading(true);
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setLoading(false);

        if (profile) {
          // profile exists
        } else {
          setUserId(session.user.id);
          if (session.user.email) setEmail(session.user.email);
          setView('onboarding');
        }
      }
    };
    initModal();
  }, []);

  // ✅ เพิ่ม: Logic นับถอยหลัง Timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // --- 1. Login with Google & Facebook ---
  const handleLogin = async (provider: 'google' | 'facebook' | 'twitter') => {
    if (provider === 'twitter') {
      alert("Twitter login coming soon!");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: provider === 'google' ? {
          access_type: 'offline',
          prompt: 'consent select_account',
        } : undefined,
      },
    });

    if (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  // --- 2. Request OTP (Email) ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({ email });

    setLoading(false);
    if (error) {
      alert(error.message);
    } else {
      setTimer(60); // ✅ เริ่มนับเวลา 60 วินาทีเมื่อส่งสำเร็จ
      setView('verify');
    }
  };

  // ✅ เพิ่ม: ฟังก์ชัน Resend OTP
  const handleResendOtp = async () => {
    if (timer > 0) return; // ถ้าเวลายังไม่หมด ห้ามกด

    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      setTimer(60); // ✅ รีเซ็ตเวลาใหม่เป็น 60 วินาที
      alert("OTP resent successfully!");
    }
  };

  // --- 3. Verify OTP & Check Profile ---
  const handleVerifySubmit = async () => {
    const otpValue = otp.join("");
    if (otpValue.length < 6) {
      alert("Please enter a valid 6-digit OTP");
      return;
    }

    setLoading(true);

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      email,
      token: otpValue,
      type: 'email',
    });

    if (error || !session) {
      alert(error?.message || "Verification failed");
      setLoading(false);
      return;
    }

    const uid = session.user.id;
    setUserId(uid);

    // เช็ค Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .single();

    setLoading(false);

    if (profile) {
      onSuccess({
        id: uid,
        name: profile.username,
        email: email,
        image: profile.avatar_url || ""
      });
      onClose();
    } else {
      setView('onboarding');
    }
  };

  // --- 4. Submit Onboarding (Force Create Profile) ---
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !userId || !avatarFile) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    let avatarUrl = "";

    try {
      const fileExt = avatarFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      avatarUrl = publicUrl;

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username,
          avatar_url: avatarUrl,
          role: 'user',
        });

      if (insertError) throw insertError;

      onSuccess({
        id: userId,
        name: username,
        email: email,
        image: avatarUrl
      });
      onClose();

    } catch (error: any) {
      alert("Error creating profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (element: HTMLInputElement, index: number) => {
    if (isNaN(Number(element.value))) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    if (element.nextSibling && element.value !== "") {
      (element.nextSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      // @ts-ignore
      e.target.previousSibling.focus();
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-[#FAFAFA] w-full max-w-[558px] min-h-[513px] rounded-[16px] shadow-[4px_9px_8px_0px_rgba(0,0,0,0.45)] flex flex-col items-center px-[96px] py-[70px] transition-all duration-300">

        {view !== 'onboarding' && (
          <button onClick={onClose} className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-gray-200 rounded-full transition">
            <X className="w-6 h-6" />
          </button>
        )}

        {(view === 'email' || view === 'verify') && (
          <button onClick={() => setView('options')} className="absolute top-6 left-6 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition">
            <ArrowLeft className="w-6 h-6" />
          </button>
        )}

        {/* ================= VIEW 1: OPTIONS ================= */}
        {view === 'options' && (
          <div className="flex flex-col items-center w-full animate-in slide-in-from-left-4 duration-300">
            <h2 className="text-[36px] font-Inter font-[900] text-[#194473] leading-none mb-[32px] text-center tracking-tight">
              Sign in
            </h2>
            <div className="w-full flex flex-col items-center gap-[16px]">

              <button
                onClick={() => handleLogin('google')}
                disabled={loading}
                className="relative w-[366px] h-[40px] flex items-center justify-center bg-[#F5F5F5] border-[2px] border-[#EEEEEE] hover:bg-[#E0E0E0] rounded-[24px] transition-colors active:scale-[0.99] cursor-pointer"
              >
                <div className="absolute left-[60px] flex items-center justify-center">
                  <FcGoogle className="w-[24px] h-[24px]" />
                </div>
                <div className="w-[110px] text-left whitespace-nowrap">
                  <span className="text-[16px] font-Inter font-[400] text-[#212121] leading-none ">
                    Sign in with Google
                  </span>
                </div>
              </button>

              <div className="relative w-[366px] flex items-center justify-center py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#EEEEEE]"></div></div>
                <span className="relative bg-[#FAFAFA] px-4 text-[#9E9E9E] text-[16px] font-Inter font-[400]">or</span>
              </div>

              <button
                onClick={() => setView('email')}
                className="relative w-[366px] h-[40px] flex items-center justify-center bg-[#F5F5F5] border-[2px] border-[#EEEEEE] hover:bg-[#E0E0E0] rounded-[24px] transition-colors active:scale-[0.99] cursor-pointer"
              >
                <div className="absolute left-[60px] flex items-center justify-center">
                  <Mail className="w-[24px] h-[24px] text-[#212121]" strokeWidth={1.5} />
                </div>
                <div className="w-[110px] text-left whitespace-nowrap">
                  <span className="text-[16px] font-Inter font-[400] text-[#212121] leading-none">
                    Sign in with Email
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: EMAIL FORM ================= */}
        {view === 'email' && (
          <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300 w-full">
            <h2 className="text-[36px] font-Inter font-[900] text-[#194473] leading-none mb-[32px] text-center tracking-tight">
              Sign in
            </h2>
            <form onSubmit={handleEmailSubmit} className="w-[360px] flex flex-col gap-[24px]">
              <div className="flex flex-col gap-[16px]">
                <label className="text-[18px] font-Inter font-[400] text-[#212121] leading-none">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-[40px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] rounded-[8px] px-[16px] py-[8px] text-[14px] font-Inter font-[400] text-[#212121] outline-none focus:border-[#2196F3] transition-all placeholder:text-[#9E9E9E]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !email}
                className={`w-full h-[35px] text-[16px] font-Inter font-[400] rounded-[8px] transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer
                ${email ? "bg-[#2196F3] hover:bg-[#1976D2] text-white shadow-md" : "bg-[#C0C0C0] text-[#616161] cursor-not-allowed border border-[#EEEEEE]"}
              `}
              >
                {loading ? "Sending..." : "Request OTP"}
              </button>
            </form>
          </div>
        )}

        {/* ================= VIEW 3: VERIFY EMAIL (OTP) ================= */}
        {view === 'verify' && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-300 mt-4" style={{ width: '360px' }}>
            <h2 className="text-[36px] font-Inter font-[900] text-[#194473] leading-none mb-[32px] text-center tracking-tight">
              Verify your email
            </h2>
            <div className="flex flex-col gap-1 mb-8">
              <h1 className="font-inter font-normal text-[12px] leading-none tracking-normal text-[#212121]">
                The Verification link has been sent. If you don’t have it in your inbox, check spam folder
              </h1>
              <h1 className="font-inter font-normal text-[12px] leading-none tracking-normal text-[#212121]">
                The OTP will be sent to your email. <span className="font-bold">{email}</span>
              </h1>
            </div>

            <div className="flex justify-between w-full mb-8">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={(e) => handleChange(e.target, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="focus:outline-none focus:border-[#2196F3] transition-colors text-center text-[#212121] font-bold text-lg"
                  style={{ width: '40px', height: '40px', backgroundColor: '#F5F5F5', border: '2px solid #EEEEEE', borderRadius: '8px', padding: '8px 0' }}
                />
              ))}
            </div>

            <div className="w-full flex justify-end mb-8">
              {/* ✅ ปรับปรุงปุ่ม Resend OTP */}
              <button
                onClick={handleResendOtp}
                disabled={timer > 0 || loading}
                className={`flex items-center justify-center gap-2 transition-colors ${timer > 0 ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-200 cursor-pointer'}`}
                style={{ width: 'auto', minWidth: '150px', height: '24px', backgroundColor: '#F5F5F5', border: '2px solid #EEEEEE', borderRadius: '8px', padding: '4px 16px' }}
              >
                {/* ✅ ปรับสีไอคอน: ถ้า timer > 0 เป็นสีเทา, ถ้าหมดเวลาเป็นสีฟ้า (#2196F3) */}
                <RefreshCw
                  size={12}
                  color={timer > 0 ? "#9E9E9E" : "#2196F3"}
                  className={loading ? "animate-spin" : ""}
                />

                {/* ✅ ปรับสีตัวอักษร: ใช้ logic เดียวกับไอคอน */}
                <span style={{ fontFamily: 'Inter', fontWeight: 400, fontSize: '12px', color: timer > 0 ? '#9E9E9E' : '#2196F3', whiteSpace: 'nowrap' }}>
                  {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                </span>
              </button>
            </div>

            <button
              onClick={handleVerifySubmit}
              disabled={loading}
              className={`w-full h-[35px] text-[16px] font-Inter font-[400] rounded-[8px] transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer
              ${otp.join("").length === 6
                  ? "bg-[#2196F3] hover:bg-[#1976D2] text-white shadow-md"
                  : "bg-[#C0C0C0] text-[#616161] cursor-not-allowed border border-[#EEEEEE]"
                }`}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}

        {/* ================= VIEW 4: ONBOARDING (Create Profile) ================= */}
        {view === 'onboarding' && (
          <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300 w-full">
            <h2 className="text-[30px] font-Inter font-[900] text-[#194473] leading-none mb-6 text-center tracking-tight">
              Create Profile
            </h2>
            <form onSubmit={handleOnboardingSubmit} className="w-[360px] flex flex-col gap-[20px]">

              {/* Avatar Upload */}
              <div className="flex flex-col items-center gap-4">
                <div className="relative w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden group hover:border-[#2196F3] transition-colors cursor-pointer">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400 group-hover:text-[#2196F3]" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    required
                  />
                  {!avatarPreview && <div className="absolute bottom-2 text-[10px] text-gray-500">Upload</div>}
                </div>
                <p className="text-xs text-gray-500">Tap to upload avatar *</p>
              </div>

              {/* Username Input */}
              <div className="flex flex-col gap-[12px]">
                <label className="text-[16px] font-Inter font-[400] text-[#212121]">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter unique username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  className="w-full h-[40px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] rounded-[8px] px-[16px] py-[8px] text-[14px] font-Inter font-[400] text-[#212121] outline-none focus:border-[#2196F3] transition-all placeholder:text-[#9E9E9E]"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !username || !avatarFile}
                className={`w-full h-[40px] mt-2 text-[16px] font-Inter font-[400] rounded-[8px] transition-all active:scale-[0.99] flex items-center justify-center cursor-pointer
                        ${(username && avatarFile) ? "bg-[#2196F3] hover:bg-[#1976D2] text-white shadow-md" : "bg-[#C0C0C0] text-[#616161] cursor-not-allowed border border-[#EEEEEE]"}
                        `}
              >
                {loading ? "Creating Profile..." : "Complete Signup"}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}