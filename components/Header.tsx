'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { GCC_COUNTRIES } from '@/data/countries';
import { CountryCode } from '@/types';
import {
  Search,
  Heart,
  ShoppingBag,
  Calendar,
  ChevronDown,
  Globe,
  Sparkles,
  Truck,
  ShieldCheck,
  Glasses,
  UserCheck,
  User as UserIcon,
  LogOut,
  Package,
  Eye,
  SlidersHorizontal,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from '@/components/Logo';

export const Header: React.FC = () => {
  const {
    country,
    setCountry,
    language,
    setLanguage,
    t,
    cartCount,
    setIsCartOpen,
    setIsSearchOpen,
    wishlistIds,
    setIsWishlistOpen,
    setIsVipModalOpen,
    setIsAdminOpen,
    setIsTrackOrderOpen,
    activeCategory,
    setActiveCategory,
    categoryConfigs,
    currentUser,
    userProfile,
    isAdmin,
    openAuthModal,
    logout,
  } = useApp();

  const router = useRouter();
  const pathname = usePathname();
  const [isCountryMenuOpen, setIsCountryMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const currentCountry = GCC_COUNTRIES[country] || GCC_COUNTRIES.SA;

  // Alternating Promo Messages (Free Delivery everywhere + 6-hour delivery in Riyadh for SA)
  const promoMessages = useMemo(() => {
    if (country === 'SA') {
      return [
        {
          ar: 'توصيل مجاني لجميع الطلبات 🚚',
          en: 'Free Delivery on All Orders 🚚',
        },
        {
          ar: 'توصيل خلال 6 ساعات للرياض ⏱️',
          en: 'Express 6-Hour Delivery in Riyadh ⏱️',
        },
      ];
    }
    return [
      {
        ar: 'توصيل مجاني لجميع الطلبات 🚚',
        en: 'Free Delivery on All Orders 🚚',
      },
      {
        ar: 'شحن دولي سريع وموثوق لجميع دول الخليج ✈️',
        en: 'Express GCC Shipping & 100% Authentic Guarantee ✈️',
      },
    ];
  }, [country]);

  const [activePromoIndex, setActivePromoIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActivePromoIndex((prev) => (prev + 1) % promoMessages.length);
    }, 3600);
    return () => clearInterval(timer);
  }, [promoMessages.length]);

  // Derive active category from current URL pathname
  const currentActiveTabId = React.useMemo(() => {
    if (!pathname) return null;
    if (pathname === '/shop') return 'all';
    const cleanSlug = pathname.replace(/^\//, '').split('/')[0];
    return cleanSlug || null;
  }, [pathname]);

  // 1. Hide category nav on vertical scroll down with anti-jitter damping, show on scroll up or top
  const [isCategoriesVisible, setIsCategoriesVisible] = useState(true);
  const lastScrollYRef = useRef(0);
  const accumulatedDownRef = useRef(0);
  const accumulatedUpRef = useRef(0);
  const isVisibleRef = useRef(true);
  const isLockedRef = useRef(false);

  // Keep ref synchronized with state
  useEffect(() => {
    isVisibleRef.current = isCategoriesVisible;
  }, [isCategoriesVisible]);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      window.requestAnimationFrame(() => {
        const currentY = Math.max(0, window.scrollY);
        const delta = currentY - lastScrollYRef.current;

        // 1. Near the top of the page (hero banner / top of store): ALWAYS SHOW
        if (currentY <= 60) {
          if (!isVisibleRef.current && !isLockedRef.current) {
            isLockedRef.current = true;
            setIsCategoriesVisible(true);
            setTimeout(() => {
              isLockedRef.current = false;
            }, 350);
          }
          accumulatedDownRef.current = 0;
          accumulatedUpRef.current = 0;
          lastScrollYRef.current = currentY;
          ticking = false;
          return;
        }

        // If animation transition is currently in progress, do not trigger state changes
        if (isLockedRef.current) {
          lastScrollYRef.current = currentY;
          ticking = false;
          return;
        }

        // 2. Track directional delta
        if (delta > 0) {
          // Scrolling DOWN
          accumulatedUpRef.current = 0;
          accumulatedDownRef.current += delta;

          // Only hide when user has scrolled well into page (> 200px) and scrolls continuously down (> 40px)
          if (currentY > 200 && accumulatedDownRef.current > 40 && isVisibleRef.current) {
            isLockedRef.current = true;
            setIsCategoriesVisible(false);
            accumulatedDownRef.current = 0;
            setTimeout(() => {
              isLockedRef.current = false;
            }, 350);
          }
        } else if (delta < 0) {
          // Scrolling UP
          accumulatedDownRef.current = 0;
          accumulatedUpRef.current += Math.abs(delta);

          // Reveal only on deliberate upward scroll (> 35px)
          if (accumulatedUpRef.current > 35 && !isVisibleRef.current) {
            isLockedRef.current = true;
            setIsCategoriesVisible(true);
            accumulatedUpRef.current = 0;
            setTimeout(() => {
              isLockedRef.current = false;
            }, 350);
          }
        }

        lastScrollYRef.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Smooth Mouse drag-to-scroll for Desktop PC + Native Touch for mobile
  const navContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag on left click (button === 0)
    if (e.button !== 0 || !navContainerRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = navContainerRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !navContainerRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasDraggedRef.current = true;
      }
      navContainerRef.current.scrollLeft = scrollLeftRef.current - deltaX;
    };

    const handleGlobalMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleCategoryClick = (id: string) => {
    if (hasDraggedRef.current) return;
    setActiveCategory(id);
    if (id === 'all' || id === 'shop') {
      router.push('/shop');
    } else if (id === 'blog') {
      router.push('/blog');
    } else {
      router.push(`/${id}`);
    }
  };

  const navLinks = useMemo(() => {
    const showHeaderCats = categoryConfigs ? categoryConfigs.filter((c) => c.showInHeaderNav) : [];
    const seenSlugs = new Set<string>();
    const uniqueCats: typeof showHeaderCats = [];
    for (const cat of showHeaderCats) {
      if (cat.slug && !seenSlugs.has(cat.slug)) {
        seenSlugs.add(cat.slug);
        uniqueCats.push(cat);
      }
    }
    return [
      { id: 'all', labelAr: 'المتجر', labelEn: 'Shop' },
      ...uniqueCats.map((c) => ({
        id: c.slug,
        labelAr: c.nameAr,
        labelEn: c.nameEn,
      })),
      { id: 'blog', labelAr: 'المدونة', labelEn: 'Blog' },
    ];
  }, [categoryConfigs]);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] mb-11">
      {/* 1. Dynamic Top Banner */}
      <div className="bg-[#0F172A] text-slate-200 text-xs py-1 sm:py-1.5 px-3 sm:px-4 border-b border-slate-800 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 min-h-[22px] sm:min-h-[26px]">
          {/* Center Promo Message with Smooth Alternating Animation */}
          <div className="flex-1 min-w-0 flex items-center justify-center overflow-hidden h-5">
            <div className="flex items-center justify-center gap-1.5 max-w-full">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <div className="relative h-5 flex items-center justify-center min-w-0 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`${country}-${activePromoIndex}`}
                    initial={{ opacity: 0, y: 7 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -7 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="text-amber-300 truncate text-[10.5px] sm:text-xs font-semibold whitespace-nowrap"
                  >
                    {language === 'ar'
                      ? promoMessages[activePromoIndex]?.ar
                      : promoMessages[activePromoIndex]?.en}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Edge Controls: Country & Language Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 border-s sm:border-s-0 border-slate-800/80 ps-2 sm:ps-0 z-10">
            {/* Country Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCountryMenuOpen(!isCountryMenuOpen)}
                className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-slate-800/60 sm:bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10px] sm:text-xs font-medium"
                title="Change Country"
              >
                <span className="text-[11px] sm:text-sm leading-none">{currentCountry.flag}</span>
                <span className="font-semibold text-[10px] sm:text-xs">{currentCountry.currencyEn}</span>
                <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400" />
              </button>

              {isCountryMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-50"
                    onClick={() => setIsCountryMenuOpen(false)}
                  />
                  <div className="absolute top-full mt-1.5 end-0 sm:start-0 z-50 bg-white text-slate-800 rounded-lg shadow-xl border border-slate-100 py-1 min-w-[200px]">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 border-b border-slate-100 uppercase tracking-wider">
                      {t('اختر دولتك والعملة', 'Select Country & Currency')}
                    </div>
                    {(Object.keys(GCC_COUNTRIES) as CountryCode[]).map((code) => {
                      const item = GCC_COUNTRIES[code];
                      return (
                        <button
                          key={code}
                          type="button"
                          onClick={() => {
                            setCountry(code);
                            setIsCountryMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 text-xs text-start hover:bg-slate-50 transition-colors ${
                            country === code ? 'bg-amber-50/70 text-[#A58454] font-semibold' : 'text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{item.flag}</span>
                            <span>{language === 'ar' ? item.nameAr : item.nameEn}</span>
                          </div>
                          <span className="text-slate-500 font-mono text-[11px]">
                            {item.currencyEn}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded bg-slate-800/60 sm:bg-slate-800/80 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer text-[10px] sm:text-xs font-semibold"
            >
              <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C5A880]" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>
          </div>

          {/* Desktop Utilities: Track order */}
          <div className="hidden lg:flex items-center gap-2 sm:gap-3 text-[11px] shrink-0 z-10">
            <button
              onClick={() => setIsTrackOrderOpen(true)}
              className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>{t('تتبع الطلب', 'Track Order')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="relative z-20 bg-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between min-h-[42px] sm:min-h-[46px] gap-2">
            {/* Start side (Left in LTR / Right in RTL) */}
            <div className="flex items-center gap-2 flex-1 min-w-0 justify-start">
              {/* Vision Exam Button - Saudi Arabia ONLY */}
              {country === 'SA' && (
                <>
                  {/* Desktop / Tablet: Free Vision Exam Button */}
                  <button
                    type="button"
                    onClick={() => setIsVipModalOpen(true)}
                    className="hidden sm:inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg border border-[#A58454]/40 hover:border-[#A58454] bg-[#A58454]/5 hover:bg-[#A58454]/10 text-[#8C6D3F] hover:text-[#5F4622] text-xs font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
                    title={t('فحص نظر مجاني', 'Free Vision Exam')}
                  >
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#A58454] shrink-0" />
                    <span className="hidden md:inline">{t('فحص نظر مجاني', 'Free Vision Exam')}</span>
                    <span className="inline md:hidden">{t('فحص نظر', 'Vision Exam')}</span>
                  </button>

                  {/* Mobile: Compact Vision Exam icon button */}
                  <button
                    type="button"
                    onClick={() => setIsVipModalOpen(true)}
                    className="sm:hidden p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer border border-slate-200/60"
                    title={t('فحص نظر مجاني', 'Free Vision Exam')}
                    aria-label={t('فحص نظر مجاني', 'Free Vision Exam')}
                  >
                    <Calendar className="w-4 h-4 text-[#A58454]" />
                  </button>
                </>
              )}
            </div>

            {/* Exactly Centered Brand Identity Logo */}
            <div className="flex items-center justify-center shrink-0 px-1 sm:px-3 z-10">
              <Logo className="py-0.5" />
            </div>

            {/* End side (Right in LTR / Left in RTL) */}
            <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0 justify-end">
              {/* 1. Desktop: Search Input Pill */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 hover:bg-slate-200/80 text-slate-500 text-xs transition-colors cursor-pointer w-36 xl:w-48"
              >
                <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{t('ابحث عن المنتج ...', 'Search products...')}</span>
              </button>

              {/* Mobile & Tablet (< lg): Search Icon Button */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title={t('بحث', 'Search')}
                aria-label={t('بحث', 'Search')}
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
              </button>

              {/* 2. Wishlist */}
              <button
                type="button"
                onClick={() => setIsWishlistOpen(true)}
                className="relative hidden sm:inline-flex p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                title={t('المفضلة', 'Wishlist')}
                aria-label={t('المفضلة', 'Wishlist')}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-0 end-0 sm:top-0.5 sm:end-0.5 w-4 h-4 bg-rose-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {wishlistIds.length}
                  </span>
                )}
              </button>

              {/* 3. Shopping Bag Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative hidden sm:inline-flex p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-900 transition-colors cursor-pointer"
                title={t('سلة المشتريات', 'Shopping Bag')}
                aria-label={t('سلة المشتريات', 'Shopping Bag')}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                {cartCount > 0 && (
                  <span className="absolute top-0 end-0 sm:top-0.5 sm:end-0.5 w-4 h-4 bg-[#A58454] text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* 4. User Account & Auth Button / Menu */}
              <div className="relative">
                {currentUser ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      className="relative p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                      title={t('حسابي الشخصي', 'My Account')}
                      aria-label={t('حسابي الشخصي', 'My Account')}
                    >
                      <div className="w-5 h-5 sm:w-5 sm:h-5 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                        {currentUser.photoURL ? (
                          <Image
                            src={currentUser.photoURL}
                            alt="Avatar"
                            width={20}
                            height={20}
                            className="w-full h-full object-cover rounded-full"
                            unoptimized
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                        )}
                      </div>
                      <span className="hidden sm:inline text-xs font-bold text-slate-800">
                        {(userProfile?.displayName || currentUser.displayName || '').split(' ')[0] || t('دخول', 'Account')}
                      </span>
                      <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:inline" />
                    </button>

                    {isUserMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        />
                        <div className="absolute top-full mt-2 end-0 z-50 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 py-2 min-w-[220px] divide-y divide-slate-100 animate-fadeIn">
                          {/* User Header */}
                          <div className="px-4 py-2.5">
                            <span className="text-xs font-bold text-slate-900 block truncate">
                              {userProfile?.displayName || currentUser.displayName || t('عميل لنس كود', 'Customer')}
                            </span>
                            <span className="text-[11px] text-slate-400 block truncate font-mono">
                              {currentUser.email}
                            </span>
                          </div>

                          {/* Menu Links */}
                          <div className="py-1">
                            <Link
                              href="/account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <UserIcon className="w-4 h-4 text-[#A58454]" />
                              <span>{t('لوحة حسابي والعناوين', 'My Account & Addresses')}</span>
                            </Link>

                            <Link
                              href="/account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Package className="w-4 h-4 text-[#A58454]" />
                              <span>{t('سجل طلباتي وتتبعها', 'My Orders & Tracking')}</span>
                            </Link>

                            <Link
                              href="/account"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                            >
                              <Eye className="w-4 h-4 text-[#A58454]" />
                              <span>{t('مقاسات النظر المحفوظة', 'Saved Prescriptions')}</span>
                            </Link>
                          </div>

                          {/* Admin & Logout */}
                          <div className="py-1">
                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsUserMenuOpen(false);
                                  setIsAdminOpen(true);
                                }}
                                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-[#8C6D3F] hover:bg-amber-50/60 transition-colors cursor-pointer text-start"
                              >
                                <SlidersHorizontal className="w-4 h-4 text-[#A58454]" />
                                <span>{t('لوحة الإدارة والمتجر', 'Store Admin Panel')}</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={async () => {
                                setIsUserMenuOpen(false);
                                await logout();
                              }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-start"
                            >
                              <LogOut className="w-4 h-4 text-rose-500" />
                              <span>{t('تسجيل الخروج', 'Sign Out')}</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="relative p-1.5 sm:p-2 rounded-full hover:bg-slate-100 text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
                    title={t('دخول', 'Sign In')}
                    aria-label={t('دخول', 'Sign In')}
                  >
                    <UserIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-800" />
                    <span className="hidden sm:inline text-xs font-bold text-slate-800">{t('دخول', 'Sign In')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Mega-Menu Categories Nav Strip */}
      <div
        className={`absolute top-full inset-x-0 z-10 bg-white border-t border-b border-slate-100/80 shadow-xs transition-all duration-300 ease-out ${
          isCategoriesVisible
            ? 'translate-y-0 opacity-100 pointer-events-auto'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1">
          <nav
            ref={navContainerRef}
            onMouseDown={handleMouseDown}
            onDragStart={(e) => e.preventDefault()}
            className="w-full overflow-x-auto no-scrollbar py-0.5 cursor-grab active:cursor-grabbing select-none touch-pan-x"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            <div className="flex items-center justify-start md:justify-center min-w-max mx-auto gap-1 sm:gap-2.5 text-xs whitespace-nowrap px-3 sm:px-4">
              {navLinks.map((link) => {
                const isActive = currentActiveTabId === link.id;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleCategoryClick(link.id)}
                    className={`relative px-3 sm:px-3.5 py-1.5 text-xs shrink-0 select-none transition-all cursor-pointer bg-transparent border-b-2 ${
                      isActive
                        ? 'border-[#A58454] text-[#A58454] font-bold'
                        : 'border-transparent text-slate-600 hover:text-slate-900 font-medium'
                    }`}
                  >
                    {language === 'ar' ? link.labelAr : link.labelEn}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
