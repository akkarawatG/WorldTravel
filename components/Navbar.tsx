"use client";

import { LogOut, ChevronLeft, Search, MapPin, Globe, Map, Menu, X as CloseIcon, ArrowLeft } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

interface SearchResult {
  type: 'country' | 'province' | 'place';
  name: string;
  id?: number | string;
  subText?: string;
  country?: string;
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
  const searchParams = useSearchParams();
  const supabase = createClient();

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(user);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [imageError, setImageError] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) setCurrentUser(user);
  }, [user]);

  useEffect(() => {
    if (searchParams.get('action') === 'edit-profile') {
      setShowEditProfileModal(true);
      const newUrl = window.location.pathname;
      window.history.replaceState(null, '', newUrl);
    }
  }, [searchParams]);

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

  useEffect(() => {
    if (isMobileSearchOpen && mobileInputRef.current) {
      setTimeout(() => {
        mobileInputRef.current?.focus();
      }, 100);
    }
  }, [isMobileSearchOpen]);

  const handleLoginTrigger = () => {
    if (onLoginClick) {
      onLoginClick();
    } else {
      setShowAuthModal(true);
    }
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = (u: AuthUserProfile) => {
    setShowAuthModal(false);
    window.location.reload();
  };

  const handleLogoutTrigger = async () => {
    if (onLogout) {
      onLogout();
      setShowUserMenu(false);
      setIsMobileMenuOpen(false);
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

      places.forEach(place => {
        const country = place.country;
        if (country && country.toLowerCase().includes(lowerQuery) && !addedKeys.has(`country-${country}`)) {
          tempResults.push({ type: 'country', name: country });
          addedKeys.add(`country-${country}`);
        }
      });

      places.forEach(place => {
        const province = place.province_state;
        if (province && province.toLowerCase().includes(lowerQuery) && !addedKeys.has(`province-${province}`)) {
          tempResults.push({
            type: 'province',
            name: province,
            subText: place.country,
            country: place.country
          });
          addedKeys.add(`province-${province}`);
        }
      });

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

  const handleSelectResult = (result: SearchResult) => {
    setShowDropdown(false);
    setIsMobileSearchOpen(false);
    setLocalQuery(result.name);
    if (setSearchQuery) setSearchQuery(result.name);

    if (result.type === 'country') {
      router.push(`/explore?country=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'province') {
      const targetCountry = result.country || "Thailand";
      router.push(`/explore?country=${encodeURIComponent(targetCountry)}&search=${encodeURIComponent(result.name)}`);
    } else if (result.type === 'place' && result.id) {
      router.push(`/detail?id=${result.id}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowDropdown(false);
      setIsMobileSearchOpen(false);
      router.push(`/explore?search=${encodeURIComponent(localQuery)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalQuery(val);
    if (setSearchQuery) setSearchQuery(val);
    setShowDropdown(true);
  };

  const handleProtectedLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    setIsMobileMenuOpen(false);
    if (currentUser) {
      router.push(path);
    } else {
      handleLoginTrigger();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <header className="w-full h-[65px] bg-[#F5F5F5] relative z-[50] shadow-sm">
        
        {/* Backdrop for Dropdowns */}
        {(showUserMenu || showDropdown) && (
          <div className="fixed inset-0 z-30 bg-transparent" onClick={() => { setShowUserMenu(false); setShowDropdown(false); }}></div>
        )}
        
        {/* Backdrop for Mobile Menu */}
        {isMobileMenuOpen && (
           <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

        <div className="w-full max-w-[1440px] h-full mx-auto flex justify-between items-center px-4 md:px-8 xl:px-[156px] gap-2 md:gap-4">

          {/* LEFT: Logo & Hamburger */}
          <div className="flex items-center gap-2 md:gap-3 relative z-50 shrink-0">
            <button 
              className="lg:hidden p-1 -ml-1 text-[#072A4F] hover:bg-gray-200 rounded-md transition"
              onClick={toggleMobileMenu}
            >
              <Menu size={26} />
            </button>

            {showBack && (
              <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-900 transition p-1 hover:bg-gray-200 rounded-full hidden sm:block">
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <Link href="/" className="transition flex items-center shrink-0">
              <div className="relative w-[110px] h-[28px] sm:w-[138px] sm:h-[36px]">
                 <img
                  src={`${basePath}/Logo.png`}
                  alt="WorldTravel Logo"
                  className="w-full h-full object-contain"
                />
              </div>
            </Link>
          </div>

          {/* CENTER: Desktop & Tablet Search Box (ซ่อนในมือถือ) */}
          <div className="hidden md:flex items-center justify-center flex-1 max-w-xl mx-4 relative z-50">
            <div className="relative w-full">
              <div className="flex items-center w-full h-[36px] gap-[8px] px-2 py-1 bg-[#194473] border border-[#E0E0E0] rounded-[8px] transition">
                <Search className="w-4 h-4 md:w-5 md:h-5 text-white flex-shrink-0 ml-1" />
                <div className="flex items-center flex-1 h-full bg-[#FFFFFF] rounded-[4px] px-2">
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full h-full bg-transparent border-none outline-none text-[13px] font-inter font-[400] text-gray-900 leading-none placeholder-gray-400"
                    value={localQuery}
                    onChange={handleInputChange}
                    onFocus={() => setShowDropdown(true)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
              {/* Dropdown Results (Desktop/Tablet) */}
              {showDropdown && localQuery && results.length > 0 && (
                <div className="absolute top-[42px] left-0 w-full bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden py-2 animate-in fade-in zoom-in-95 duration-200">
                  {results.map((item, index) => {
                    const countryCode = item.type === 'country' ? getCountryCode(item.name) : "";
                    return (
                      <div
                        key={`${item.type}-${index}`}
                        onClick={() => handleSelectResult(item)}
                        className="px-4 py-2.5 hover:bg-blue-50 cursor-pointer flex items-center gap-3 transition-colors group"
                      >
                        <div className="text-gray-400 group-hover:text-blue-500 flex-shrink-0 w-[20px] flex justify-center">
                          {item.type === 'country' ? (
                            countryCode ? (
                              // @ts-ignore
                              <ReactCountryFlag countryCode={countryCode} svg style={{ width: '1.2em', height: '1.2em' }} title={item.name} />
                            ) : ( <Globe size={16} /> )
                          ) : item.type === 'province' ? ( <Map size={16} /> ) : ( <MapPin size={16} /> )}
                        </div>

                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[13px] font-inter font-medium text-gray-800 truncate">
                            {item.name}
                          </span>
                          <span className="text-[11px] text-gray-400 capitalize truncate">
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

          {/* RIGHT: Mobile Search Icon (แสดงเฉพาะมือถือ) */}
          <div className="flex md:hidden items-center relative z-50 shrink-0">
            <button 
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 text-[#072A4F] hover:bg-gray-200 rounded-full transition"
            >
              <Search size={24} />
            </button>
          </div>

          {/* RIGHT: Desktop Menu (ซ่อนในแท็บเล็ต/มือถือ) */}
          <div className="hidden lg:flex relative items-center gap-8 z-40 shrink-0">
            <div className="flex items-center gap-6">
              <a
                href={`${basePath}/mytrips`}
                onClick={(e) => handleProtectedLinkClick(e, '/mytrips')}
                className="text-[18px] xl:text-[20px] font-inter font-[400] text-[#000000] hover:text-[#1976D2] transition leading-none whitespace-nowrap cursor-pointer"
              >
                MyTrip
              </a>
              <a
                href={`${basePath}/itinerary`}
                onClick={(e) => handleProtectedLinkClick(e, '/itinerary')}
                className="text-[18px] xl:text-[20px] font-inter font-[400] text-[#000000] hover:text-[#1976D2] transition leading-none whitespace-nowrap cursor-pointer"
              >
                MyPlan
              </a>
            </div>

            <div className="flex items-center justify-end">
              {currentUser ? (
                <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setShowUserMenu(!showUserMenu)}>
                  <div className="w-[32px] h-[32px] flex-shrink-0 rounded-full bg-[#D9D9D9] flex items-center justify-center text-white text-[14px] font-bold border border-white shadow-sm overflow-hidden">
                    {currentUser.image && !imageError ? (
                      <img src={currentUser.image} alt={currentUser.name || "Profile"} className="w-full h-full object-cover" onError={() => setImageError(true)} />
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
                  className="flex h-[32px] items-center justify-center gap-[8px] px-[12px] rounded-[8px] bg-[#1976D2] hover:bg-[#1565C0] text-white text-[14px] font-inter font-[500] transition shadow-sm cursor-pointer"
                >
                  {/* @ts-ignore */}
                  <Icon path={mdiLockOutline} size={0.6} />
                  <span>Login</span>
                </button>
              )}

              {/* Desktop User Dropdown Menu */}
              {showUserMenu && currentUser && (
                <div className="absolute right-0 top-[45px] w-[190px] bg-white rounded-[8px] border border-[#EEEEEE] p-4 flex flex-col gap-4 z-50 shadow-[0px_4px_20px_rgba(0,0,0,0.1)] font-inter animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col gap-1 justify-center border-b border-gray-100 pb-3">
                    <p className="font-inter font-bold text-[16px] text-[#212121] truncate">
                      {currentUser.name || "User"}
                    </p>
                    <p className="font-inter font-normal text-[12px] text-[#757575] truncate">
                      {currentUser.email || ""}
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => { router.push('/review-history?action=edit-profile'); setShowUserMenu(false); }}
                      className="w-full rounded-[8px] flex items-center px-2 py-2 text-left hover:text-[#194473] hover:bg-blue-50 transition-colors font-inter font-normal text-[14px] text-[#212121]"
                    >
                      Edit profile
                    </button>
                    <button
                      onClick={() => { setShowUserMenu(false); router.push('/review-history'); }}
                      className="w-full rounded-[8px] flex items-center px-2 py-2 text-left hover:text-[#194473] hover:bg-blue-50 transition-colors font-inter font-normal text-[14px] text-[#212121]"
                    >
                      Review
                    </button>
                  </div>

                  <button
                    onClick={handleLogoutTrigger}
                    className="w-full rounded-[8px] flex items-center justify-center gap-2 px-2 py-2 border border-[#EF9A9A] bg-[#F44336] hover:bg-[#d32f2f] transition-colors font-inter font-normal text-[14px] text-white"
                  >
                    <LogOut className="w-[14px] h-[14px]" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </header>

      {/* ====================================================
          📱 MOBILE FULL-SCREEN SEARCH OVERLAY (แก้ปัญหาล้นจอ 100%)
      ==================================================== */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col md:hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header ค้นหา */}
          <div className="flex items-center gap-2 p-3 border-b border-gray-200 shadow-sm bg-white shrink-0">
            <button 
              onClick={() => setIsMobileSearchOpen(false)} 
              className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition shrink-0"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex-1 flex items-center bg-[#F0F2F5] h-[40px] rounded-full px-3 gap-2 overflow-hidden">
               <input
                  ref={mobileInputRef}
                  type="text"
                  placeholder="ค้นหาสถานที่, ประเทศ..."
                  className="w-full h-full bg-transparent border-none outline-none text-[16px] font-inter text-gray-900 placeholder-gray-500"
                  value={localQuery}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                />
                {localQuery && (
                  <button onClick={() => { setLocalQuery(""); if(setSearchQuery) setSearchQuery(""); }} className="p-1 text-gray-400 shrink-0">
                    <CloseIcon size={16} />
                  </button>
                )}
            </div>
          </div>

          {/* รายการผลลัพธ์ (List) */}
          <div className="flex-1 overflow-y-auto bg-white">
            {results.length > 0 ? (
               <div className="flex flex-col pb-4">
                 {results.map((item, index) => {
                    const countryCode = item.type === 'country' ? getCountryCode(item.name) : "";
                    return (
                      <div
                        key={`mobile-${item.type}-${index}`}
                        onClick={() => handleSelectResult(item)}
                        className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50 border-b border-gray-100 active:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <div className="w-[40px] h-[40px] rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                          {item.type === 'country' ? (
                            countryCode ? (
                              // @ts-ignore
                              <ReactCountryFlag countryCode={countryCode} svg style={{ width: '1.5em', height: '1.5em', borderRadius: '50%' }} title={item.name} />
                            ) : ( <Globe size={20} className="text-gray-500" /> )
                          ) : item.type === 'province' ? ( <Map size={20} className="text-gray-500" /> ) : ( <MapPin size={20} className="text-gray-500" /> )}
                        </div>

                        <div className="flex flex-col overflow-hidden">
                          <span className="text-[15px] font-medium text-gray-900 truncate">
                            {item.name}
                          </span>
                          <span className="text-[13px] text-gray-500 capitalize truncate">
                            {item.type === 'place' ? item.subText : item.type === 'province' ? item.subText : item.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
               </div>
            ) : localQuery.trim() !== "" ? (
               <div className="flex flex-col items-center justify-center pt-10 text-gray-500 px-4">
                 <Search size={40} className="text-gray-300 mb-3" />
                 <p className="text-[15px] text-center">ไม่พบผลลัพธ์สำหรับ "{localQuery}"</p>
               </div>
            ) : (
               <div className="p-4 text-center text-gray-400 text-[14px]">
                  พิมพ์เพื่อค้นหาสถานที่ หรือจังหวัด...
               </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          📱 MOBILE SLIDE-IN MENU
      ==================================================== */}
      <div 
        className={`fixed top-0 left-0 h-[100dvh] w-[258px] bg-[#DEECF9] shadow-[2px_0px_10px_rgba(0,0,0,0.2)] z-[100] transform transition-transform duration-300 ease-in-out flex flex-col lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Profile Header Section & Close Button */}
        {currentUser ? (
          <div className="relative pt-12 pb-4 px-4 border-b border-[#072A4F]/20 flex items-center gap-3">
             <button 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="absolute top-4 right-4 p-1 text-[#072A4F] hover:bg-[#cde0f5] rounded-full transition z-10"
             >
               <CloseIcon size={20} />
             </button>
             <div className="w-[40px] h-[40px] flex-shrink-0 rounded-full bg-[#D9D9D9] flex items-center justify-center text-white text-[16px] font-bold overflow-hidden border border-white">
                {currentUser.image && !imageError ? (
                  <img src={currentUser.image} alt={currentUser.name || "Profile"} className="w-full h-full object-cover" onError={() => setImageError(true)} />
                ) : (
                  <div className="w-full h-full bg-[#1976D2] flex items-center justify-center">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              <div className="flex flex-col overflow-hidden pr-6">
                <span className="font-bold text-[14px] text-[#072A4F] truncate">{currentUser.name}</span>
                <span className="text-[10px] text-[#072A4F]/70 truncate">{currentUser.email}</span>
              </div>
          </div>
        ) : (
          <div className="relative flex items-center justify-start p-4 pt-12 border-b border-[#072A4F]/20">
            <button 
               onClick={() => setIsMobileMenuOpen(false)} 
               className="absolute top-4 right-4 p-1 text-[#072A4F] hover:bg-[#cde0f5] rounded-full transition z-10"
             >
               <CloseIcon size={20} />
             </button>
            <img src={`${basePath}/Logo.png`} alt="WorldTravel Logo" className="h-[24px] object-contain" />
          </div>
        )}

        {/* Menu Links */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          <a
            href={`${basePath}/`}
            onClick={(e) => {
              e.preventDefault();
              setIsMobileMenuOpen(false);
              router.push('/');
            }}
            className="w-full px-[24px] py-[16px] text-[16px] font-inter font-[700] text-[#072A4F] hover:bg-[#cde0f5] border-b border-[#072A4F]/20 transition text-left"
          >
            Home
          </a>
           <a
            href={`${basePath}/mytrips`}
            onClick={(e) => handleProtectedLinkClick(e, '/mytrips')}
            className="w-full px-[24px] py-[16px] text-[16px] font-inter font-[700] text-[#072A4F] hover:bg-[#cde0f5] border-b border-[#072A4F]/20 transition text-left"
          >
            MyTrip
          </a>
          <a
            href={`${basePath}/itinerary`}
            onClick={(e) => handleProtectedLinkClick(e, '/itinerary')}
            className="w-full px-[24px] py-[16px] text-[16px] font-inter font-[700] text-[#072A4F] hover:bg-[#cde0f5] border-b border-[#072A4F]/20 transition text-left"
          >
            MyPlan
          </a>
          
          {currentUser && (
            <>
              <button
                onClick={() => { router.push('/review-history?action=edit-profile'); setIsMobileMenuOpen(false); }}
                className="w-full px-[24px] py-[16px] text-[15px] font-inter font-[500] text-[#072A4F] hover:bg-[#cde0f5] border-b border-[#072A4F]/20 transition text-left"
              >
                Edit Profile
              </button>
              <button
                onClick={() => { router.push('/review-history'); setIsMobileMenuOpen(false); }}
                className="w-full px-[24px] py-[16px] text-[15px] font-inter font-[500] text-[#072A4F] hover:bg-[#cde0f5] border-b border-[#072A4F]/20 transition text-left"
              >
                Review
              </button>
            </>
          )}
        </div>

        {/* Bottom Actions (Logout / Login) */}
        <div className="p-4 pb-8 mt-auto flex justify-center">
          {currentUser ? (
             <button
             onClick={handleLogoutTrigger}
             className="w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#F44336] text-white font-bold text-[14px] hover:bg-[#d32f2f] transition shadow-sm"
           >
             <LogOut size={16} /> Logout
           </button>
          ) : (
            <button
             onClick={handleLoginTrigger}
             className="w-[140px] flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-[#072A4F] text-white font-bold text-[14px] hover:bg-[#051E3A] transition shadow-md"
           >
             {/* @ts-ignore */}
             <Icon path={mdiLockOutline} size={0.8} /> Login
           </button>
          )}
        </div>
      </div>

      {/* ====================================================
          MODALS
      ==================================================== */}
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