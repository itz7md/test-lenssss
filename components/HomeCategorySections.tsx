'use client';

import React, { useRef, useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { Product, CategoryConfig } from '@/types';
import {
  Sparkles,
  Glasses,
  Sun,
  Eye,
  ShieldCheck,
  Baby,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface CategorySectionConfig {
  id: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string;
  subtitleEn: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  link: string;
  filterFn: (p: Product) => boolean;
}

interface HomeCategorySectionsProps {
  initialProducts?: Product[];
  initialCategories?: CategoryConfig[];
}

const DraggableProductRow: React.FC<{
  products: Product[];
  language: 'ar' | 'en';
}> = ({ products, language }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScrollBounds = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
  };

  useEffect(() => {
    checkScrollBounds();
    const el = scrollContainerRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScrollBounds, { passive: true });
    window.addEventListener('resize', checkScrollBounds);
    return () => {
      el.removeEventListener('scroll', checkScrollBounds);
      window.removeEventListener('resize', checkScrollBounds);
    };
  }, [products]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !scrollContainerRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = scrollContainerRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !scrollContainerRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 5) {
        hasDraggedRef.current = true;
      }
      scrollContainerRef.current.scrollLeft = scrollLeftRef.current - deltaX;
    };

    const handleGlobalMouseUp = () => {
      if (!isDraggingRef.current) return;
      isDraggingRef.current = false;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 120);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  const handleArrowScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 360;
    const isRtl = language === 'ar';
    const delta = direction === 'right' ? (isRtl ? -scrollAmount : scrollAmount) : (isRtl ? scrollAmount : -scrollAmount);
    scrollContainerRef.current.scrollBy({ left: delta, behavior: 'smooth' });
  };

  return (
    <div className="relative group/row">
      <button
        type="button"
        onClick={() => handleArrowScroll('left')}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 start-0 -ms-3.5 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg border border-slate-200/80 items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        title="Scroll Left"
        aria-label="Scroll Left"
      >
        <ChevronRight className="w-5 h-5 rtl:rotate-0 ltr:rotate-180 text-slate-700" />
      </button>

      <button
        type="button"
        onClick={() => handleArrowScroll('right')}
        className="hidden md:flex absolute top-1/2 -translate-y-1/2 end-0 -me-3.5 z-20 w-10 h-10 rounded-full bg-white/95 hover:bg-white text-slate-800 shadow-lg border border-slate-200/80 items-center justify-center opacity-0 group-hover/row:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        title="Scroll Right"
        aria-label="Scroll Right"
      >
        <ChevronLeft className="w-5 h-5 rtl:rotate-0 ltr:rotate-180 text-slate-700" />
      </button>

      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
        onClickCapture={(e) => {
          if (hasDraggedRef.current) {
            e.stopPropagation();
            e.preventDefault();
          }
        }}
        className="w-full overflow-x-auto no-scrollbar py-3 px-1 cursor-grab active:cursor-grabbing select-none touch-pan-x"
      >
        <div className="flex items-stretch gap-3 sm:gap-4 md:gap-5 w-max">
          {products.map((product, idx) => (
            <div key={product.id} className="w-[215px] sm:w-[230px] md:w-[245px] lg:w-[260px] shrink-0">
              <ProductCard product={product} priority={idx < 2} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HomeCategorySections: React.FC<HomeCategorySectionsProps> = ({ initialProducts, initialCategories }) => {
  const { products: contextProducts, language, t, categoryConfigs: contextCategories } = useApp();

  const products = initialProducts && initialProducts.length > 0 ? initialProducts : contextProducts;
  const categoryConfigs = initialCategories && initialCategories.length > 0 ? initialCategories : contextCategories;

  const enabledHomeSlugs = useMemo(() => {
    return new Set(categoryConfigs ? categoryConfigs.filter((c) => c.showInHome).map((c) => c.slug) : []);
  }, [categoryConfigs]);

  const sectionsConfig: CategorySectionConfig[] = useMemo(() => {
    const list: CategorySectionConfig[] = [
      {
        id: 'featured',
        titleAr: 'الأكثر طلباً ومبيعاً',
        titleEn: 'Best Sellers & Top Picks',
        subtitleAr: 'الموديلات الأكثر طلباً وتقييماً والأعلى مبيعاً لدى عملائنا',
        subtitleEn: 'Most loved & best-selling eyewear and contact lenses',
        icon: Sparkles,
        accentColor: 'from-amber-500 to-amber-700',
        link: '/shop',
        filterFn: (p: Product) => Boolean(p.isBestSeller || p.rating >= 4.9),
      },
    ];

    const getIcon = (slug: string) => {
      if (slug === 'eyeglasses') return Glasses;
      if (slug === 'sunglasses') return Sun;
      if (slug === 'contact-lenses') return Eye;
      if (slug === 'kids') return Baby;
      if (slug === 'care') return ShieldCheck;
      return Sparkles;
    };

    const homeConfigs = (categoryConfigs || []).filter((c) => c.showInHome);

    homeConfigs.forEach((c) => {
      list.push({
        id: c.slug,
        titleAr: c.homeTitleAr || c.heroTitleAr || c.nameAr,
        titleEn: c.homeTitleEn || c.heroTitleEn || c.nameEn,
        subtitleAr: c.homeSubtitleAr || c.heroSubTitleAr || '',
        subtitleEn: c.homeSubtitleEn || c.heroSubTitleEn || '',
        icon: getIcon(c.slug),
        accentColor: 'from-[#A58454] to-[#735A31]',
        link: `/${c.slug}`,
        filterFn: (p: Product) => {
          if (c.itemType === 'category') return p.category === c.slug;
          if (c.itemType === 'brand') {
            const b = (p.brand || '').toLowerCase();
            const bSlug = c.slug.toLowerCase();
            return b === bSlug || p.brand === c.nameAr || p.brandAr === c.nameAr;
          }
          if (c.itemType === 'subcategory') {
            const cSlug = (c.slug || '').toLowerCase();
            const cNameAr = (c.nameAr || '').trim();
            const cNameEn = (c.nameEn || '').toLowerCase().trim();
            return (
              p.subCategory === cNameAr ||
              p.subCategoryAr === cNameAr ||
              (Boolean(p.subCategoryEn) && p.subCategoryEn!.toLowerCase() === cNameEn) ||
              (Boolean(p.lensType) && (p.lensType!.toLowerCase() === cSlug || cSlug.includes(p.lensType!.toLowerCase()))) ||
              (Boolean(p.contactLensType) && p.contactLensType!.includes(cNameAr))
            );
          }
          return p.category === c.slug;
        },
      });
    });

    return list;
  }, [categoryConfigs]);

  return (
    <div className="bg-white py-8 sm:py-14 space-y-10 sm:space-y-16 border-t border-slate-100">
      {sectionsConfig.map((section) => {
        if (section.id !== 'featured' && enabledHomeSlugs.size > 0 && !enabledHomeSlugs.has(section.id)) {
          return null;
        }

        const catConfig = categoryConfigs?.find((c) => c.slug === section.id || c.id === section.id);
        const title = language === 'ar' 
          ? (catConfig?.homeTitleAr || catConfig?.heroTitleAr || catConfig?.nameAr || section.titleAr) 
          : (catConfig?.homeTitleEn || catConfig?.heroTitleEn || catConfig?.nameEn || section.titleEn);
        const subtitle = language === 'ar' 
          ? (catConfig?.homeSubtitleAr || catConfig?.heroSubTitleAr || section.subtitleAr) 
          : (catConfig?.homeSubtitleEn || catConfig?.heroSubTitleEn || section.subtitleEn);

        const sectionProducts = (products || []).filter(section.filterFn).slice(0, 15);
        if (sectionProducts.length === 0) return null;

                return (
          <section
            key={section.id}
            className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8"
          >
            {/* Section Header Bar */}
            <div className="flex items-center justify-between gap-3 mb-3 sm:mb-5 pb-2.5 border-b border-slate-200/80">
              {/* Vertical Accent Bar + Title & Subtitle */}
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <span className="w-1.5 h-6 sm:h-7 bg-[#A58454] rounded-full shrink-0" />
                <div className="min-w-0">
                  <h2 className="text-base sm:text-xl md:text-2xl font-bold font-kufi text-slate-900 tracking-tight truncate">
                    {title}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-500 truncate hidden xs:block sm:block mt-0.5">
                    {subtitle}
                  </p>
                </div>
              </div>

              {/* View All Button */}
              <Link
                href={section.link}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-white hover:bg-amber-50/70 text-slate-700 hover:text-[#A58454] border border-slate-200/90 hover:border-[#A58454]/40 text-xs sm:text-sm font-semibold transition-all shrink-0 shadow-2xs hover:shadow-xs group"
              >
                <span>{t('عرض الكل', 'View All')}</span>
                {language === 'ar' ? (
                  <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-[#A58454] transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 group-hover:text-[#A58454] transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </div>

            {/* Horizontal Draggable Carousel */}
            <DraggableProductRow
              products={sectionProducts}
              language={language}
            />
          </section>
        );
      })}
    </div>
  );
};
