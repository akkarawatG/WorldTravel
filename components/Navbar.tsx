"use client";

import { LogOut, ChevronLeft, Search, MapPin, Globe, Map } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Icon from '@mdi/react';
import { mdiLockOutline } from '@mdi/js';
import ReactCountryFlag from "react-country-flag";

import { searchPlaces } from "@/services/placeService";
import { createClient } from "@/utils/supabase/client";

import AuthModal, { UserProfile as AuthUserProfile } from "./AuthModal";
import EditProfileModal from "./EditProfileModal";

export interface UserProfile {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface NavbarProps {
  user: UserProfile | null;
  showBack?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onLoginClick?: () => void;
  onLogout?: () => void;
}

// ✅ 1. เพิ่ม field 'country' ใน Interface เพื่อเก็บข้อมูลประเทศแม่ของจังหวัดนั้น
interface SearchResult {
  type: 'country' | 'province' | 'place';
  name: string;
  id?: number | string;
  subText?: string;
  country?: string; // <--- เพิ่มตรงนี้
}

const getCountryCode = (countryName: string): string => {
  const mapping: { [key: string]: string } = {
    "China": "CN", "Thailand": "TH", "Malaysia": "MY", "Japan": "JP", "United Arab Emirates": "AE", "Saudi Arabia": "SA", "Singapore": "SG", "Vietnam": "VN", "India": "IN", "South Korea": "KR", "Indonesia": "ID", "Taiwan": "TW", "Bahrain": "BH", "Kuwait": "KW", "Kazakhstan": "KZ", "Philippines": "PH", "Uzbekistan": "UZ", "Cambodia": "KH", "Jordan": "JO", "Laos": "LA", "Brunei": "BN", "Oman": "OM", "Qatar": "QA", "Sri Lanka": "LK", "Iran": "IR",
    "France": "FR", "Spain": "ES", "Italy": "IT", "Poland": "PL", "Hungary": "HU", "Croatia": "HR", "Turkey": "TR", "United Kingdom": "GB", "Germany": "DE", "Greece": "GR", "Denmark": "DK", "Austria": "AT", "Netherlands": "NL", "Portugal": "PT", "Romania": "RO", "Switzerland": "CH", "Belgium": "BE", "Latvia": "LV", "Georgia": "GE", "Sweden": "SE", "Lithuania": "LT", "Estonia": "EE", "Norway": "NO", "Finland": "FI", "Iceland": "IS",
    "United States": "US", "Mexico": "MX", "Canada": "CA", "Dominican Republic": "DO", "Bahamas": "BS", "Cuba": "CU", "Jamaica": "JM", "Costa Rica": "CR", "Guatemala": "GT", "Panama": "PA",
    "Argentina": "AR", "Brazil": "BR", "Chile": "CL", "Peru": "PE", "Paraguay": "PY", "Colombia": "CO", "Uruguay": "UY", "Ecuador": "EC",
    "South Africa": "ZA", "Morocco": "MA", "Egypt": "EG", "Kenya": "KE", "Namibia": "NA", "Tanzania": "TZ",
    "Australia": "AU", "New Zealand": "NZ"
  };
  return mapping[countryName] || "";
};

export default function Navbar({
  user,
  showBack = false,
  searchQuery = "",
  setSearchQuery,
  onLoginClick,
  onLogout
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

  useEffect(() => {
    const checkUserStatus = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ [Navbar] Error getting session:", sessionError);
        return;
      }

      if (session?.user) {
        if (!currentUser) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.email,
            image: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
          };
          setCurrentUser(userData);
        }

        const { data: profile, error: dbError } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('id', session.user.id)
          .maybeSingle();

        if (dbError) console.error("❌ [Navbar] DB Error:", dbError.message);

        const isProfileIncomplete = !profile || !profile.username;

        if (isProfileIncomplete) {
          setShowEditProfileModal(true);
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

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!localQuery || localQuery.trim() === "") {
        setResults([]);
        return;
      }

      const lowerQuery = localQuery.toLowerCase();
      const places = await searchPlaces(lowerQuery);

      const tempResults: SearchResult[] = [];
      const addedKeys = new Set();

      // --- Country ---
      places.forEach(place => {
        const country = place.country;
        if (country && country.toLowerCase().includes(lowerQuery) && !addedKeys.has(`country-${country}`)) {
          tempResults.push({ type: 'country', name: country });
          addedKeys.add(`country-${country}`);
        }
      });

      // --- Province ---
      // ✅ แก้ไข: เก็บ country ของจังหวัดนั้นๆ ลงไปด้วย
      places.forEach(place => {
        const province = place.province_state;
        if (province && province.toLowerCase().includes(lowerQuery) && !addedKeys.has(`province-${province}`)) {
          tempResults.push({ 
            type: 'province', 
            name: province, 
            subText: place.country, 
            country: place.country // <--- สำคัญ: เก็บประเทศไว้ใช้ตอน redirect
          });
          addedKeys.add(`province-${province}`);
        }
      });

      // --- Place ---
      places.forEach(place => {
        if (place.name.toLowerCase().includes(lowerQuery)) {
          tempResults.push({
            type: 'place',
            name: place.name,
            id: place.id,
            subText: `${place.province_state}, ${place.country}`,
            country: place.country
          });
        }
      });

      setResults(tempResults.slice(0, 8));
    };

    const timeoutId = setTimeout(() => {
      fetchSearchResults();
    }, 300);

    return () => clearTimeout(timeoutId);

  }, [localQuery]);

  // ✅ แก้ไข Logic การเลือกผลลัพธ์
  const handleSelectResult = (result: SearchResult) => {
    setShowDropdown(false);
    setLocalQuery(result.name);
    if (setSearchQuery) setSearchQuery(result.name);

    if (result.type === 'country') {
      // ค้นหาทั้งประเทศ
      router.push(`/explore?country=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'province') {
      // ✅ แก้ไข: ส่งทั้ง search (จังหวัด) และ country (ประเทศ) ไปด้วย
      // เพื่อไม่ให้ ExplorePage default เป็น Thailand
      const targetCountry = result.country || "Thailand"; // Fallback กันเหนียว
      router.push(`/explore?country=${encodeURIComponent(targetCountry)}&search=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'place' && result.id) {
      // ไปหน้า Detail โดยตรง
      router.push(`/detail?id=${result.id}`);
    }
  };

  // ✅ เพิ่ม: Handle การกด Enter ใน Input Box
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      // ถ้ากด Enter เฉยๆ โดยไม่เลือก Dropdown ให้ค้นหาด้วยคำนั้น (Default อาจไป Thailand)
      // หรือถ้าอยากให้ฉลาดกว่านี้ อาจจะต้องดึงผลลัพธ์แรกมาใช้
      router.push(`/explore?search=${encodeURIComponent(localQuery)}`);
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
                    onKeyDown={handleKeyDown} // ✅ เพิ่ม event onKeyDown
                  />
                </div>
              </div>
              {/* Dropdown Results */}
              {showDropdown && localQuery && results.length > 0 && (
                <div className="absolute top-[40px] left-0 w-[268px] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  {results.map((item, index) => {
                    const countryCode = item.type === 'country' ? getCountryCode(item.name) : "";
                    return (
                      <div
                        key={`${item.type}-${index}`}
                        onClick={() => handleSelectResult(item)}
                        className="px-4 py-2 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors group"
                      >
                        <div className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 w-[20px] flex justify-center">
                          {item.type === 'country' ? (
                            countryCode ? (
                              <ReactCountryFlag
                                countryCode={countryCode}
                                svg
                                style={{ width: '1.2em', height: '1.2em' }}
                                title={item.name}
                              />
                            ) : (
                              <Globe size={14} />
                            )
                          ) : item.type === 'province' ? (
                            <Map size={14} />
                          ) : (
                            <MapPin size={14} />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <span className="text-[12px] font-inter font-medium text-gray-800 line-clamp-1">
                            {item.name}
                          </span>
                          <span className="text-[10px] text-gray-400 capitalize">
                            {item.type === 'place' ? item.subText : item.type === 'province' ? item.subText : item.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Menu */}
          <div className="relative w-[151px] h-[24px] flex items-center justify-between z-40">
            <Link href="" className="text-[20px] font-inter font-[400] text-[#000000] hover:text-[#1976D2] transition leading-none whitespace-nowrap">
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
                  onClick={handleLoginTrigger}
                  className="flex w-[68px] h-[24px] items-center justify-center gap-[8px] px-[8px] py-[4px] rounded-[8px] bg-[#1976D2] hover:bg-[#1565C0] text-white text-[12px] leading-none font-inter font-[400] transition border border-[#90CAF9] shadow-sm cursor-pointer"
                >
                  <Icon path={mdiLockOutline} size={0.5} />
                  <span>Login</span>
                </button>
              )}

              {/* Dropdown Menu */}
              {showUserMenu && currentUser && (
                <div className="absolute right-0 top-[35px] w-[190px] h-[202px] bg-white rounded-[8px] border border-[#EEEEEE] p-4 flex flex-col gap-4 z-50 shadow-[0px_4px_20px_rgba(0,0,0,0.1)] font-inter animate-in fade-in zoom-in-95 duration-200">

                  <div className="w-[158px] h-[49px] flex flex-col gap-2 justify-center">
                    <p className="font-inter font-bold text-[20px] leading-none text-[#212121] truncate">
                      {currentUser.name || "User"}
                    </p>
                    <p className="font-inter font-normal text-[14px] leading-none text-[#757575] truncate">
                      {currentUser.email || ""}
                    </p>
                  </div>

                  <div className="w-[158px] h-[62px] flex flex-col gap-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowEditProfileModal(true);
                      }}
                      className="w-[158px] h-[27px] rounded-[8px] flex items-center gap-4 px-[8px] py-[4px] text-left hover:text-[#194473] transition-colors
                                 font-inter font-normal text-[16px] leading-none tracking-normal text-[#212121]"
                    >
                      Edit profile
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        router.push('/review-history');
                      }}
                      className="w-[158px] h-[27px] rounded-[8px] flex items-center gap-4 px-[8px] py-[4px] text-left hover:text-[#194473] transition-colors
                                 font-inter font-normal text-[16px] leading-none tracking-normal text-[#212121]"
                    >
                      Review
                    </button>
                  </div>

                  <button
                    onClick={handleLogoutTrigger}
                    className="w-[158px] h-[32px] rounded-[8px] flex items-center justify-center gap-2 px-[8px] py-[4px] border border-[#EF9A9A] bg-[#F44336] hover:bg-[#d32f2f] transition-colors mt-auto
                               font-inter font-normal text-[16px] leading-none text-white"
                  >
                    <LogOut className="w-[16px] h-[16px]" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}

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