"use client";
import { LogOut, ChevronLeft, Search, MapPin, Globe, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from '@mdi/react';
import { mdiLockOutline } from '@mdi/js';

import { ATTRACTIONS_DATA } from "../data/attractionsData";
import AuthModal, { UserProfile as AuthUserProfile } from "./AuthModal";
import EditProfileModal from "./EditProfileModal"; 
import { createClient } from "@/utils/supabase/client";

export interface UserProfile {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

// *** 1. เพิ่ม onLoginClick และ onLogout ใน Interface ***
interface NavbarProps {
  user: UserProfile | null;
  showBack?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

interface SearchResult {
  type: 'country' | 'province' | 'place';
  name: string;
  id?: number | string;
  subText?: string;
}

export default function Navbar({
  user,
  showBack = false,
  searchQuery = "",
  setSearchQuery,
  onLoginClick, // *** รับค่ามาใช้ ***
  onLogout      // *** รับค่ามาใช้ ***
}: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(user);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  // ✅ DEBUG LOGIC: เช็ค Session และ Database
  useEffect(() => {
    const checkUserStatus = async () => {
      // console.log("🔍 [Navbar] 1. เริ่มตรวจสอบสถานะ User...");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("❌ [Navbar] Error getting session:", sessionError);
        return;
      }

      if (session?.user) {
        // อัปเดต currentUser ฝั่ง Client
        if (!currentUser) {
           const userData = {
              id: session.user.id,
              email: session.user.email,
              name: session.user.user_metadata?.full_name || session.user.email,
              image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
           };
           setCurrentUser(userData);
        }

        // ✅ แก้ไขจุดที่ 1: ดึง username มาเช็คด้วย
        // console.log("🔍 [Navbar] 3. กำลังค้นหาข้อมูลในตาราง profiles...");
        const { data: profile, error: dbError } = await supabase
          .from('profiles')
          .select('id, username') // ดึง username มาเช็ค
          .eq('id', session.user.id)
          .maybeSingle();

        if (dbError) console.error("❌ [Navbar] DB Error:", dbError.message);

        // ✅ แก้ไขจุดที่ 2: เปลี่ยนเงื่อนไข
        const isProfileIncomplete = !profile || !profile.username;

        // console.log("🔍 [Navbar] 4. สถานะข้อมูล:", isProfileIncomplete ? "ยังไม่สมบูรณ์ (ต้องกรอก)" : "สมบูรณ์แล้ว ✅");

        if (isProfileIncomplete) {
          // console.log("🚨 [Navbar] 5. เปิด Modal เพื่อให้กรอกข้อมูลให้ครบ");
          setShowEditProfileModal(true);
        } else {
          // console.log("✅ [Navbar] 5. ข้อมูลครบถ้วน");
        }

      }
    };

    checkUserStatus();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN') {
            checkUserStatus();
        }
    });

    return () => subscription.unsubscribe();

  }, []);

  useEffect(() => {
    setImageError(false);
  }, [currentUser]);

  // *** Logic Login: ถ้ามี Props ส่งมาให้ใช้ Props ถ้าไม่มีให้เปิด Modal เอง ***
  const handleLoginTrigger = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setShowAuthModal(true);
    }
  };

  const handleAuthSuccess = (u: AuthUserProfile) => {
    setShowAuthModal(false);
    window.location.reload();
  };

  // *** Logic Logout: ถ้ามี Props ส่งมาให้ใช้ Props ถ้าไม่มีให้ทำเอง ***
  const handleLogoutTrigger = async () => {
    if (onLogout) {
      onLogout();
      setShowUserMenu(false);
      return;
    }

    try {
      await supabase.auth.signOut();
      if (typeof window !== 'undefined') {
        localStorage.clear();
        sessionStorage.clear();
      }
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });
      window.location.reload();
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  // ... (Search Logic เดิม) ...
  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    if (!localQuery || localQuery.trim() === "") {
      setResults([]);
      return;
    }
    const lowerQuery = localQuery.toLowerCase();
    const tempResults: SearchResult[] = [];
    const addedKeys = new Set();
    ATTRACTIONS_DATA.forEach(place => {
      const country = place.location.country;
      if (country.toLowerCase().includes(lowerQuery) && !addedKeys.has(`country-${country}`)) {
        tempResults.push({ type: 'country', name: country });
        addedKeys.add(`country-${country}`);
      }
    });
    ATTRACTIONS_DATA.forEach(place => {
      const province = place.location.province_state;
      if (province.toLowerCase().includes(lowerQuery) && !addedKeys.has(`province-${province}`)) {
        tempResults.push({ type: 'province', name: province, subText: place.location.country });
        addedKeys.add(`province-${province}`);
      }
    });
    ATTRACTIONS_DATA.forEach(place => {
      if (place.name.toLowerCase().includes(lowerQuery)) {
        tempResults.push({
          type: 'place',
          name: place.name,
          id: place.id,
          subText: `${place.location.province_state}, ${place.location.country}`
        });
      }
    });
    setResults(tempResults.slice(0, 8));
  }, [localQuery]);

  const handleSelectResult = (result: SearchResult) => {
    setShowDropdown(false);
    setLocalQuery(result.name);
    if (setSearchQuery) setSearchQuery(result.name);
    if (result.type === 'country') {
      router.push(`/explore?country=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'province') {
      router.push(`/explore?search=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'place' && result.id) {
      router.push(`/detail?id=${result.id}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (setSearchQuery) setSearchQuery(val);
    setShowDropdown(true);
  };

  return (
    <>
      <header className="w-full min-w-[1024px] h-[65px] bg-[#F5F5F5] relative z-[50]">
        
        {(showUserMenu || showDropdown) && (
          <div className="fixed inset-0 z-30 bg-transparent" onClick={() => { setShowUserMenu(false); setShowDropdown(false); }}></div>
        )}

        <div className="w-full max-w-[1440px] h-full mx-auto flex justify-between items-center px-[156px]">

          {/* LEFT: Logo */}
          <div className="flex items-center gap-4 relative z-40">
             {showBack && (
              <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 transition p-1 hover:bg-gray-200 rounded-full">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            <Link href="/" className="transition flex items-center">
              <img src="/Logo.png" alt="TripVibe Logo" className="w-[138px] h-[36px] object-contain" />
            </Link>
          </div>

          {/* CENTER: Search Box */}
          <div className="flex items-center justify-center flex-1 mx-4 relative z-50">
             <div className="relative">
              <div className="flex items-center w-[268px] h-[31px] gap-[8px] px-[8px] py-[4px] bg-[#194473] border border-[#E0E0E0] rounded-[8px] transition">
                <Search className="w-[24px] h-[24px] p-[4px] text-white flex-shrink-0" />
                <div className="flex items-center w-[220px] h-[23px] bg-[#FFFFFF] rounded-[4px] px-[8px]">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-full bg-transparent border-none outline-none text-[12px] font-inter font-[400] text-[#9E9E9E] leading-none placeholder-[#9E9E9E]"
                    value={localQuery}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                  />
                </div>
              </div>
              {/* Dropdown Results */}
              {showDropdown && localQuery && results.length > 0 && (
                <div className="absolute top-[40px] left-0 w-[268px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  {results.map((item, index) => (
                    <div
                      key={`${item.type}-${index}`}
                      onClick={() => handleSelectResult(item)}
                      className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors group"
                    >
                      <div className="text-gray-400 group-hover:text-blue-500">
                        {item.type === 'country' && <Globe size={14} />}
                        {item.type === 'province' && <Map size={14} />}
                        {item.type === 'place' && <MapPin size={14} />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[12px] font-inter font-medium text-gray-800 line-clamp-1">
                          {item.name}
                        </span>
                        <span className="text-[10px] text-gray-400 capitalize">
                          {item.type === 'place' ? item.subText : item.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Menu */}
          <div className="relative w-[151px] h-[24px] flex items-center justify-between z-40">
            <Link href="/mytrips" className="text-[20px] font-inter font-[400] text-[#000000] hover:text-[#1976D2] transition leading-none whitespace-nowrap">
              MyTrip
            </Link>

            <div className="flex items-center justify-end">
              {currentUser ? (
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="w-[24px] h-[24px] flex-shrink-0 rounded-full bg-[#D9D9D9] flex items-center justify-center text-white text-[12px] font-bold border border-white shadow-sm overflow-hidden">
                    {currentUser.image && !imageError ? (
                      <img 
                        src={currentUser.image} 
                        alt={currentUser.name || "Profile"} 
                        className="w-full h-full object-cover" 
                        onError={() => setImageError(true)} 
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1976D2] flex items-center justify-center">
                        {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <button 
                  onClick={handleLoginTrigger} // *** ใช้ function ที่เราสร้างใหม่ ***
                  className="flex w-[68px] h-[24px] items-center justify-center gap-[8px] px-[8px] py-[4px] rounded-[8px] bg-[#1976D2] hover:bg-[#1565C0] text-white text-[12px] leading-none font-inter font-[400] transition border border-[#90CAF9] shadow-sm cursor-pointer"
                >
                  <Icon path={mdiLockOutline} size={0.5} />
                  <span>Login</span>
                </button>
              )}

              {showUserMenu && currentUser && (
                <div className="absolute right-0 top-8 w-56 bg-white rounded-xl shadow-lg py-2 z-50 border border-gray-100 text-gray-800 animate-in fade-in zoom-in-95 duration-200">
                  <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-bold text-gray-900 truncate">{currentUser.name || "User"}</p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">{currentUser.email || ""}</p>
                  </div>
                  <div className="p-1.5">
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowEditProfileModal(true);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition cursor-pointer text-left"
                    >
                        Edit profile
                    </button>

                    <button 
                      onClick={handleLogoutTrigger} // *** ใช้ function ที่เราสร้างใหม่ ***
                      className="flex items-center gap-3 w-full px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition mt-1 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ถ้าไม่มี onLoginClick ส่งมา เราก็ยังใช้ Modal ภายในตัวมันเองได้เหมือนเดิม */}
      {showAuthModal && (
        <AuthModal 
          onClose={() => setShowAuthModal(false)} 
          onSuccess={handleAuthSuccess} 
        />
      )}

      {/* ✅ 5. แสดง Modal เมื่อ State สั่ง + มี user */}
      {showEditProfileModal && currentUser && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setShowEditProfileModal(false)}
          onSuccess={() => {
            setShowEditProfileModal(false);
            window.location.reload(); 
          }}
        />
      )}
    </>
  );
}