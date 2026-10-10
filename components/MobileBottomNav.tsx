'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Home,
  LayoutGrid,
  Search,
  Heart,
  ShoppingBag,
  Glasses,
  Sun,
  Eye,
  Sparkles,
  Baby,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const router = useRouter();
  const {
    language,
    t,
    cartCount,
    wishlistIds,
    setIsCartOpen,
    setIsWishlistOpen,
    setIsSearchOpen,
    setActiveCategory,
  } = useApp();

  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  const handleHomeClick = () => {
    setIsCategorySheetOpen(false);
    router.push('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    setIsCategorySheetOpen(false);
    if (categoryKey === 'all') {
      router.push('/shop');
    } else {
      router.push(`/${categoryKey}`);
    }
  };

  const categoryItems = [
    {
      id: 'eyeglasses',
      titleAr: 'نظارات طبية',
      titleEn: 'Eyeglasses',
      descAr: 'إطارات تيتانيوم وأسيتات مع تفصيل العدسات',
      descEn: 'Titanium & acetate with custom Rx lenses',
      icon: Glasses,
      color: 'bg-amber-100 text-[#8C6D3F]',
    },
    {
      id: 'sunglasses',
      titleAr: 'نظارات شمسية',
      titleEn: 'Sunglasses',
      descAr: 'عدسات بولارايزد وحماية UV400 كاملة',
      descEn: 'Polarized lenses & 100% UV400 shield',
      icon: Sun,
      color: 'bg-sky-100 text-sky-700',
    },
    {
      id: 'contact-lenses',
      titleAr: 'عدسات لاصقة',
      titleEn: 'Contact Lenses',
      descAr: 'عدسات تجميلية وطبية من أرقى الماركات',
      descEn: 'Cosmetic & optical colored lenses',
      icon: Eye,
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'yuva',
      titleAr: 'براند يوفا الإيطالي',
      titleEn: 'Yuva Italian Brand',
      descAr: 'إطارات فريملس وتيتانيوم خفيفة الوزن',
      descEn: 'Featherlight rimless & titanium frames',
      icon: Sparkles,
      color: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'kids',
      titleAr: 'نظارات أطفال',
      titleEn: 'Kids Eyewear',
      descAr: 'إطارات سيليكون غير قابلة للكسر',
      descEn: 'Flexible unbreakable silicone frames',
      icon: Baby,
      color: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <>
      {/* Quick Mobile Categories Popover Drawer */}
      {isCategorySheetOpen && (
        <div
          onClick={() => setIsCategorySheetOpen(false)}
          className="sm:hidden fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex flex-col justify-end animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-t-3xl p-5 pb-8 border-t border-slate-200 shadow-2xl space-y-4 animate-slideUp max-h-[80vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6D3F] flex items-center justify-center">
                  <LayoutGrid className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold font-kufi text-slate-900">
                    {t('أقسام المتجر المستقلة', 'Store Categories')}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {t('اختر القسم للانتقال لصفحته المخصصة', 'Select category to open dedicated page')}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCategorySheetOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category Grid Cards */}
            <div className="grid grid-cols-1 gap-2">
              {categoryItems.map((cat) => {
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/50 border border-slate-200/70 hover:border-[#A58454] transition-all flex items-center justify-between text-start cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${cat.color} flex items-center justify-center shrink-0`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#8C6D3F] font-kufi">
                          {language === 'ar' ? cat.titleAr : cat.titleEn}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {language === 'ar' ? cat.descAr : cat.descEn}
                        </p>
                      </div>
                    </div>
                    {language === 'ar' ? (
                      <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-[#8C6D3F]" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-[#8C6D3F]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* View All Button & Account Button */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCategorySelect('all')}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors text-center font-kufi cursor-pointer"
              >
                {t('كافة المنتجات', 'All Products')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCategorySheetOpen(false);
                  router.push('/account');
                }}
                className="w-full py-3 rounded-xl bg-amber-50 text-[#8C6D3F] border border-[#A58454]/30 font-bold text-xs hover:bg-amber-100 transition-colors text-center font-kufi cursor-pointer"
              >
                {t('حسابي الشخصي', 'My Account')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Persistent Bottom Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-xl px-1.5 py-1 flex items-center justify-around select-none"
      >
        {/* 1. Home */}
        <button
          type="button"
          onClick={handleHomeClick}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 hover:text-[#A58454] transition-colors cursor-pointer"
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">{t('الرئيسية', 'Home')}</span>
        </button>

        {/* 2. Categories */}
        <button
          type="button"
          onClick={() => setIsCategorySheetOpen((prev) => !prev)}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            isCategorySheetOpen ? 'text-[#A58454] font-bold' : 'text-slate-600 hover:text-[#A58454]'
          }`}
        >
          <LayoutGrid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold">{t('الأقسام', 'Shop')}</span>
        </button>

        {/* 3. Floating Search Trigger */}
        <button
          type="button"
          onClick={() => {
            setIsCategorySheetOpen(false);
            setIsSearchOpen(true);
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 hover:text-[#A58454] transition-colors cursor-pointer"
        >
          <div className="relative">
            <Search className="w-5 h-5 mb-0.5" />
          </div>
          <span className="text-[10px] font-semibold">{t('البحث', 'Search')}</span>
        </button>

        {/* 4. Wishlist */}
        <button
          type="button"
          onClick={() => {
            setIsCategorySheetOpen(false);
            setIsWishlistOpen(true);
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-600 hover:text-[#A58454] transition-colors cursor-pointer relative"
        >
          <div className="relative">
            <Heart className="w-5 h-5 mb-0.5" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -end-1.5 w-3.5 h-3.5 bg-rose-600 text-white rounded-full text-[8px] font-bold flex items-center justify-center shadow-xs">
                {wishlistIds.length}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">{t('المفضلة', 'Wishlist')}</span>
        </button>

        {/* 5. Cart */}
        <button
          type="button"
          onClick={() => {
            setIsCategorySheetOpen(false);
            setIsCartOpen(true);
          }}
          className="flex-1 flex flex-col items-center justify-center py-1 text-slate-900 hover:text-[#A58454] transition-colors cursor-pointer relative"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -end-1.5 w-4 h-4 bg-emerald-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center shadow-xs animate-bounce">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold font-kufi">{t('السلة', 'Bag')}</span>
        </button>
      </nav>
    </>
  );
};
