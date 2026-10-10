'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CategoryConfig } from '@/types';

interface FeaturedCategoriesProps {
  initialCategories?: CategoryConfig[];
}

export const FeaturedCategories: React.FC<FeaturedCategoriesProps> = ({ initialCategories }) => {
  const { language, t, setActiveCategory, categoryConfigs } = useApp();
  const router = useRouter();

  // استقبال المجموعات المعالجة فورياً في السيرفر أو استخدام كاش السياق
  const currentCategories = initialCategories && initialCategories.length > 0 ? initialCategories : categoryConfigs;
  const exploreCategories = (currentCategories || []).filter((c) => c.showInExplore);

  const handleCategoryClick = (categoryKey: string) => {
    setActiveCategory(categoryKey);
    router.push(`/${categoryKey}`);
  };

  if (exploreCategories.length === 0) return null;

  return (
    <section className="py-6 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="text-center mb-4 sm:mb-8">
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-1">
            <div className="h-[1px] w-6 sm:w-16 bg-[#A58454]/60" />
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold font-kufi text-slate-900 tracking-tight">
              {t('استكشف مجموعاتنا', 'Explore Our Collections')}
            </h2>
            <div className="h-[1px] w-6 sm:w-16 bg-[#A58454]/60" />
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-500 max-w-lg mx-auto">
            {t(
              'تشكيلات منتقاة بعناية تلبي كافة احتياجات الرؤية والأناقة لجميع أفراد العائلة',
              'Carefully curated collections catering to optical precision and timeless sophistication'
            )}
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-2.5 sm:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory px-3.5 sm:px-0 -mx-3.5 sm:mx-0 pb-2">
          {exploreCategories.map((cat, idx) => {
            const title = language === 'ar' ? (cat.cardTitleAr || cat.nameAr) : (cat.cardTitleEn || cat.nameEn);
            const desc = language === 'ar' ? (cat.cardDescAr || cat.heroSubTitleAr || '') : (cat.cardDescEn || cat.heroSubTitleEn || '');
            const cta = language === 'ar' ? (cat.cardCtaAr || 'تسوق الآن') : (cat.cardCtaEn || 'Shop Now');
            const img = cat.cardImage || cat.heroBannerImage || cat.iconImage || '/images/cat_yuva.webp';

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.slug)}
                className="group relative w-[180px] sm:w-[240px] md:w-auto h-[160px] sm:h-[220px] md:h-[340px] shrink-0 snap-start rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer border border-slate-100"
              >
                <Image
                  src={img}
                  alt={title}
                  fill
                  priority={idx < 3}
                  sizes="(max-width: 640px) 180px, (max-width: 768px) 240px, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-3 sm:p-5 flex flex-col justify-end text-white z-10">
                  <h3 className="text-xs sm:text-base md:text-xl font-bold font-kufi mb-0.5 sm:mb-1 text-white drop-shadow-xs">
                    {title}
                  </h3>
                  {desc && (
                    <p className="text-[9px] sm:text-xs text-slate-200/90 mb-1.5 sm:mb-2.5 line-clamp-1 leading-relaxed">
                      {desc}
                    </p>
                  )}
                  <div className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-semibold px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white w-fit group-hover:border-[#C5A880] group-hover:text-amber-200 transition-colors">
                    <span>{cta}</span>
                    {language === 'ar' ? (
                      <ArrowLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover:translate-x-1 transition-transform" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
