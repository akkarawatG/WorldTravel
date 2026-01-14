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
  // ฟังก์ชันสำหรับจัดการการ Paste
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').slice(0, 6).split('');

    if (pasteData.length > 0) {
      const newOtp = [...otp];
      // TypeScript ปกติจะรู้ type เอง แต่ถ้ามันฟ้อง สามารถระบุชัดเจนแบบนี้ได้ครับ
      pasteData.forEach((char: string, index: number) => {
        // อัปเดตเฉพาะช่องที่มีข้อมูลและไม่เกินจำนวนช่อง
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);

      // (Optional) ย้าย Focus ไปช่องสุดท้ายที่ถูกกรอก
      const nextFocusIndex = Math.min(pasteData.length, 5);
      const nextInput = document.getElementById(`otp-input-${nextFocusIndex}`);
      if (nextInput) nextInput.focus();
    }
  };

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
      {/* ✅ Modified: Main Container with Dynamic Size based on View */}
      <div className={`relative bg-[#FAFAFA] rounded-[16px] shadow-[4px_9px_8px_0px_rgba(0,0,0,0.45)] flex flex-col items-center px-[96px] py-[70px] transition-all duration-300
        ${view === 'verify'
          ? 'w-[552px] h-[467px] gap-[10px]' // ขนาดสำหรับ View 3 (Verify)
          : 'w-[558px] h-[343px] gap-8'      // ขนาดสำหรับ View อื่นๆ (Options, Email)
        }
      `}>

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
            <h2 className="font-inter font-bold text-[36px] text-[#194473] leading-none text-center tracking-normal">
              Sign in
            </h2>
            <div className="w-[366px] h-[127px] flex flex-col gap-4 mt-8">
              <div className="w-[366px] h-[71px] flex flex-col gap-[12px]">
                <button
                  onClick={() => handleLogin('google')}
                  disabled={loading}
                  className="w-[366px] h-[40px] rounded-[24px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] flex items-center justify-center gap-4 px-[40px] py-[8px] hover:bg-[#E0E0E0] transition-colors active:scale-[0.99] cursor-pointer"
                >
                  <FcGoogle className="w-[24px] h-[24px]" />
                  <span className="font-inter font-normal text-[16px] text-[#212121] leading-none tracking-normal">
                    Sign in with Google
                  </span>
                </button>
                <div className="relative w-[366px] flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#EEEEEE]"></div>
                  </div>
                  <span className="relative bg-[#FAFAFA] px-4 text-[#9E9E9E] text-[16px] font-inter font-normal">
                    or
                  </span>
                </div>
              </div>
              <button
                onClick={() => setView('email')}
                className="w-[366px] h-[40px] rounded-[24px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] flex items-center justify-center gap-4 px-[40px] py-[8px] hover:bg-[#E0E0E0] transition-colors active:scale-[0.99] cursor-pointer"
              >
                <Mail className="w-[24px] h-[24px] text-[#212121]" strokeWidth={1.5} />
                <span className="font-inter font-normal text-[16px] text-[#212121] leading-none tracking-normal">
                  Sign in with Email
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ================= VIEW 2: EMAIL FORM ================= */}
        {view === 'email' && (
          <div className="w-[360px] h-[213px] flex flex-col items-center gap-8 animate-in slide-in-from-right-4 duration-300">
            <h2 className="font-inter font-bold text-[36px] text-[#194473] leading-none text-center tracking-normal">
              Sign in
            </h2>
            <form onSubmit={handleEmailSubmit} className="w-[360px] flex flex-col gap-4">
              <label className="font-inter font-normal text-[18px] leading-none tracking-normal text-[#212121] align-middle">
                Email Address
              </label>
              <div className="w-[360px] h-[99px] flex flex-col gap-6">
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-[360px] h-[40px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] rounded-[8px] px-[16px] py-[8px] outline-none focus:border-[#2196F3] transition-all font-inter font-normal text-[14px] leading-none tracking-normal text-[#212121] placeholder:text-[#9E9E9E]"
                />
                <button
                  type="submit"
                  disabled={loading || !email}
                  className={`w-[360px] h-[35px] rounded-[8px] flex items-center justify-center gap-4 px-[40px] py-[8px] border transition-all active:scale-[0.99] cursor-pointer font-inter font-normal text-[16px] leading-none tracking-normal
                    ${email ? "bg-[#2196F3] hover:bg-[#1976D2] text-white border-transparent shadow-md" : "bg-[#C0C0C0] text-[#616161] border-[#EEEEEE] cursor-not-allowed"}
                  `}
                >
                  {loading ? "Sending..." : "Request OTP"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ================= VIEW 3: VERIFY EMAIL (OTP) ================= */}
        {view === 'verify' && (
          /* Wrapper: w-[360px] h-[327px] gap-8 (32px) */
          <div className="w-[360px] h-[327px] flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300">

            <h2 className="font-inter font-bold text-[36px] text-[#194473] leading-none text-center tracking-normal">
              Verify your email
            </h2>

            {/* Wrapper: w-[360px] h-[157px] gap-6 (24px) */}
            <div className="w-[360px] h-[157px] flex flex-col gap-6">

              {/* Description Text */}
              <div className="flex flex-col gap-1 text-left w-full">
                <p className="font-inter font-normal text-[12px] leading-none tracking-normal text-[#212121]">
                  The Verification link has been sent. If you don’t have it in your inbox, check spam folder
                </p>
                <p className="font-inter font-normal text-[12px] leading-none tracking-normal text-[#212121]">
                  The OTP will be sent to your email. <span className="font-bold">{email}</span>
                </p>
              </div>

              {/* OTP Inputs */}
              {/* Container: w-[360px] h-[40px] justify-between */}
              <div className="w-[360px] h-[40px] flex justify-between">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    id={`otp-input-${index}`}
                    type="text"
                    maxLength={1}
                    value={data}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className="w-[40px] h-[40px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] rounded-[8px] py-[8px] text-center outline-none focus:border-[#2196F3] transition-colors
                               font-inter font-normal text-[14px] text-[#212121] leading-none tracking-normal"
                  />
                ))}
              </div>

              {/* Resend Button */}
              <div className="w-full flex justify-end">
                <button
                  onClick={handleResendOtp}
                  disabled={timer > 0 || loading}
                  className={`w-[150px] h-[24px] bg-[#F5F5F5] border-[2px] border-[#EEEEEE] rounded-[8px] 
                             px-[16px] py-[4px] flex items-center justify-center gap-2 transition-colors 
                             ${timer > 0 ? 'cursor-not-allowed' : 'hover:bg-[#E0E0E0] cursor-pointer'}`}
                >
                  <RefreshCw
                    size={12}
                    color={timer > 0 ? "#9E9E9E" : "#2196F3"}
                    className={loading ? "animate-spin" : ""}
                  />
                  <span className={`font-inter font-normal text-[12px] leading-none tracking-normal whitespace-nowrap 
                                  ${timer > 0 ? 'text-[#9E9E9E]' : 'text-[#2196F3]'}`}>
                    {timer > 0 ? `Resend in ${timer}s` : "Resend OTP"}
                  </span>
                </button>
              </div>

            </div>
  
            {/* Verify Button */}
            <button
              onClick={handleVerifySubmit}
              disabled={loading}
              className={`w-[360px] h-[32px] rounded-[8px] border-[1px] flex items-center justify-center gap-4 px-[40px] py-[4px] transition-all active:scale-[0.99] cursor-pointer
                font-inter font-normal text-[16px] leading-none tracking-normal
                ${otp.join("").length === 6
                  ? "bg-[#2196F3] border-[#90CAF9] text-white shadow-md hover:bg-[#1976D2]"
                  : "bg-[#C0C0C0] border-[#EEEEEE] text-[#616161] cursor-not-allowed"
                }
              `}
            >
              {loading ? "Verifying..." : "Verify"}
            </button>
          </div>
        )}

        {/* ================= VIEW 4: ONBOARDING ================= */}
        {view === 'onboarding' && (
          /* Code ส่วน Onboarding (ย่อไว้ตามเดิม หรือใส่เต็มถ้าต้องการ) */
          <div className="flex flex-col items-center animate-in slide-in-from-right-4 duration-300 w-full">
            {/* ... existing onboarding code ... */}
            <h2 className="text-[30px] font-Inter font-[900] text-[#194473] mb-6">Create Profile</h2>
            {/* ... form ... */}
          </div>
        )}

      </div>
    </div>
  );
}