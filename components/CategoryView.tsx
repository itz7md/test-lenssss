'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CategoryConfig, Product } from '@/types';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { SeoHead } from '@/components/SeoHead';
import { getBrandName, matchesBrand, getBrandFromSegment } from '@/lib/brands';
import { matchShape } from '@/lib/catalogHelpers';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  ArrowUpDown,
} from 'lucide-react';

// Mini SVG Glasses Icon
const GlassesMiniIcon = ({ className = 'w-4.5 h-4.5 text-slate-500' }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="6.5" cy="12" r="4.5" />
    <circle cx="17.5" cy="12" r="4.5" />
    <path d="M11 12h2" />
    <path d="M2 12h0.01M22 12h0.01" />
  </svg>
);

// SVG Frame Shape Icons
const FrameShapeIcon: React.FC<{ shapeId: string; className?: string }> = ({
  shapeId,
  className = 'w-4.5 h-4.5',
}) => {
  const norm = (shapeId || '').toLowerCase();

  if (norm.includes('round') || norm.includes('دائري')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="6.5" cy="12" r="4.5" />
        <circle cx="17.5" cy="12" r="4.5" />
        <path d="M11 12h2" />
        <path d="M2 12h0.01M22 12h0.01" />
      </svg>
    );
  }

  if (norm.includes('square') || norm.includes('مربع')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2.5" y="7.5" width="8" height="8" rx="1.5" />
        <rect x="13.5" y="7.5" width="8" height="8" rx="1.5" />
        <path d="M10.5 11.5h3" />
        <path d="M2 11.5h0.5M21.5 11.5h0.5" />
      </svg>
    );
  }

  if (norm.includes('rectangle') || norm.includes('مستطيل')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="8.5" width="8.5" height="7" rx="1.5" />
        <rect x="13.5" y="8.5" width="8.5" height="7" rx="1.5" />
        <path d="M10.5 12h3" />
        <path d="M2 12h0.01M22 12h0.01" />
      </svg>
    );
  }

  if (norm.includes('cat') || norm.includes('قطة') || norm.includes('كات')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2.5 10C2.5 14 5 15.5 7.5 15.5c2.5 0 3.5-2 3.5-3.5 0-1.5-1-3-2.5-3-2.5 0-6 0.5-6 1z" />
        <path d="M21.5 10c0 4-2.5 5.5-5 5.5-2.5 0-3.5-2-3.5-3.5 0-1.5 1-3 2.5-3 2.5 0 6 0.5 6 1z" />
        <path d="M11 11.5h2" />
        <path d="M2 9.5l2 1M22 9.5l-2 1" />
      </svg>
    );
  }

  if (norm.includes('aviator') || norm.includes('طيار') || norm.includes('أفياتور')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2.5 10.5c0 3.5 2 5.5 4.5 5.5s4-2 4-5.5c0-2-1.5-3-4-3s-4.5 1-4.5 3z" />
        <path d="M13 10.5c0 3.5 1.5 5.5 4 5.5s4.5-2 4.5-5.5c0-2-2-3-4.5-3s-4 1-4 3z" />
        <path d="M11 9.5h2" />
        <path d="M11 12h2" />
      </svg>
    );
  }

  if (norm.includes('hexagon') || norm.includes('سداسي')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="3.5,12 5.5,8 9.5,8 11.5,12 9.5,16 5.5,16" />
        <polygon points="12.5,12 14.5,8 18.5,8 20.5,12 18.5,16 14.5,16" />
        <path d="M11.5 12h1" />
      </svg>
    );
  }

  if (norm.includes('geometric') || norm.includes('هندسي') || norm.includes('مضلع')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polygon points="3,10 6.5,7.5 10.5,9.5 10,14.5 6,16 3,14" />
        <polygon points="13.5,9.5 17.5,7.5 21,10 21,14 18,16 14,14.5" />
        <path d="M10.5 11.5h3" />
      </svg>
    );
  }

  if (norm.includes('half') || norm.includes('نصف')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 11c0-2.5 2.5-3.5 5-3.5s5 1 5 3.5" strokeWidth="2.4" />
        <path d="M12 11c0-2.5 2.5-3.5 5-3.5s5 1 5 3.5" strokeWidth="2.4" />
        <path d="M10.5 10.5h3" strokeWidth="1.8" />
        <path d="M3 11c0 3 2 4.5 4 4.5s4-1.5 4-4.5" strokeDasharray="1.5 1.5" />
        <path d="M13 11c0 3 2 4.5 4 4.5s4-1.5 4-4.5" strokeDasharray="1.5 1.5" />
      </svg>
    );
  }

  if (norm.includes('rimless') || norm.includes('بدون')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="9" width="7.5" height="6" rx="1.5" strokeDasharray="2 2" />
        <rect x="13.5" y="9" width="7.5" height="6" rx="1.5" strokeDasharray="2 2" />
        <path d="M10.5 12h3" />
        <circle cx="2" cy="12" r="0.8" fill="currentColor" />
        <circle cx="22" cy="12" r="0.8" fill="currentColor" />
      </svg>
    );
  }

  if (norm.includes('oval') || norm.includes('بيضاوي')) {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <ellipse cx="6.5" cy="12" rx="4.5" ry="3.5" />
        <ellipse cx="17.5" cy="12" rx="4.5" ry="3.5" />
        <path d="M11 12h2" />
      </svg>
    );
  }

  return <GlassesMiniIcon className={className} />;
};

// Gender Icons
const GenderIcon: React.FC<{ genderId: string; className?: string }> = ({
  genderId,
  className = 'w-4.5 h-4.5',
}) => {
  if (genderId === 'women') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="9" r="5" />
        <path d="M12 14v7M9 18h6" />
      </svg>
    );
  }
  if (genderId === 'men') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="7" r="4" />
        <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      </svg>
    );
  }
  if (genderId === 'kids') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="8" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="10" x2="9.01" y2="10" strokeWidth="2.5" />
        <line x1="15" y1="10" x2="15.01" y2="10" strokeWidth="2.5" />
      </svg>
    );
  }
  return <GlassesMiniIcon className={className} />;
};

// Single Horizontal Row Container
interface DraggableFilterRowProps {
  children: React.ReactNode;
  resetTrigger?: any;
}

const DraggableFilterRow: React.FC<DraggableFilterRowProps> = ({ children, resetTrigger }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !containerRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.clientX;
    scrollLeftRef.current = containerRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasDraggedRef.current = true;
      }
      containerRef.current.scrollLeft = scrollLeftRef.current - deltaX;
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

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollLeft = 0;
    }
  }, [resetTrigger]);

  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onClickCapture={handleClickCapture}
      onDragStart={(e) => e.preventDefault()}
      className="w-full overflow-x-auto no-scrollbar cursor-grab active:cursor-grabbing select-none py-1.5 touch-pan-x"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-max mx-auto px-4 justify-center">
        {children}
      </div>
    </div>
  );
};

export function CategoryView({
  slug = 'eyeglasses',
  slugSegments,
}: {
  slug?: string;
  slugSegments?: string[];
}) {
  const router = useRouter();
  const segments = useMemo(() => {
    const raw =
      slugSegments && slugSegments.length > 0
        ? slugSegments
        : slug
        ? [slug]
        : ['eyeglasses'];
    return raw.map((s) =>
      decodeURIComponent(s).toLowerCase().trim().replace(/^\/+|\/+$/g, '')
    );
  }, [slug, slugSegments]);

  const primarySlug = segments[0] || 'eyeglasses';
  const { language, t, products, getCategoryConfig, categoryConfigs } = useApp();

  const targetConfig = getCategoryConfig(primarySlug);

  const dynamicDurationOptions = useMemo(
    () =>
      categoryConfigs
        .filter((config) => config.itemType === 'duration')
        .map((config) => ({
          id: config.nameAr || config.slug || config.id,
          labelAr: config.nameAr || config.slug || config.id,
          labelEn: config.nameEn || config.nameAr || config.slug || config.id,
          slug: config.slug,
        })),
    [categoryConfigs]
  );

  const dynamicShapeOptions = useMemo(
    () =>
      categoryConfigs
        .filter((config) => config.itemType === 'shape')
        .map((config) => ({
          id: config.slug || config.id,
          labelAr: config.nameAr || config.slug || config.id,
          labelEn: config.nameEn || config.nameAr || config.slug || config.id,
          slug: config.slug,
        })),
    [categoryConfigs]
  );

  const dynamicSubcategoryOptions = useMemo(
    () =>
      categoryConfigs
        .filter((config) => config.itemType === 'subcategory')
        .map((config) => ({
          id: config.slug || config.id,
          labelAr: config.nameAr || config.heroTitleAr || config.slug,
          labelEn: config.nameEn || config.heroTitleEn || config.slug,
          slug: config.slug || config.id,
          iconImage: config.iconImage || config.cardImage,
          badge: (config.nameAr || config.slug || 'عد').slice(0, 2),
          config,
        })),
    [categoryConfigs]
  );

  // 0. Kids Category check
  const isKidsCategory =
    primarySlug === 'kids' ||
    primarySlug === 'نظارات-أطفال' ||
    primarySlug === 'أطفال' ||
    targetConfig?.id === 'category-kids' ||
    targetConfig?.slug === 'kids';

  // 0.1 Accessories & Care check
  const isAccessoriesOrCareCategory =
    primarySlug === 'accessories' ||
    primarySlug === 'care' ||
    primarySlug === 'إكسسوارات' ||
    primarySlug === 'اكسسوارات' ||
    primarySlug === 'عناية' ||
    primarySlug === 'عنايه' ||
    targetConfig?.id === 'category-accessories' ||
    targetConfig?.id === 'category-care' ||
    targetConfig?.slug === 'accessories' ||
    targetConfig?.slug === 'care';

  // 1. Duration matching
  const durationMatch = useMemo(() => {
    return dynamicDurationOptions.find((duration) =>
      segments.some(
        (segment) =>
          segment === duration.slug?.toLowerCase().trim() ||
          segment === duration.id.toLowerCase().trim() ||
          segment === duration.labelEn.toLowerCase().trim()
      )
    );
  }, [dynamicDurationOptions, segments]);
  const isDurationSlug = targetConfig?.itemType === 'duration' || Boolean(durationMatch && segments.length === 1);
  const detectedDurationId = durationMatch ? durationMatch.id : targetConfig?.nameAr || primarySlug;

  // 2. Shape matching
  const shapeMatch = useMemo(() => {
    return dynamicShapeOptions.find((shape) =>
      segments.some(
        (segment) =>
          segment === shape.slug?.toLowerCase().trim() ||
          segment === shape.id.toLowerCase().trim() ||
          segment === shape.labelEn.toLowerCase().trim()
      )
    );
  }, [dynamicShapeOptions, segments]);
  const isShapeSlug = targetConfig?.itemType === 'shape' || Boolean(shapeMatch && segments.length === 1);
  const detectedShapeId = shapeMatch ? shapeMatch.id : targetConfig?.nameAr || primarySlug;

  // 2.1 Subcategory matching and route check (e.g. /color-contact-lenses, /corrective-contact-lenses)
  const isLensSubcategorySlug = useMemo(() => {
    if (isAccessoriesOrCareCategory || isKidsCategory) return false;
    if (targetConfig?.itemType === 'subcategory') return true;
    return dynamicSubcategoryOptions.some(
      (opt) => opt.slug?.toLowerCase().trim() === primarySlug
    );
  }, [isAccessoriesOrCareCategory, isKidsCategory, targetConfig, dynamicSubcategoryOptions, primarySlug]);

  const matchedSubcategoryConfig = useMemo<CategoryConfig | undefined>(() => {
    if (targetConfig?.itemType === 'subcategory') return targetConfig;

    for (const seg of segments) {
      const clean = seg.toLowerCase().trim();
      const match = categoryConfigs.find(
        (c) =>
          c.itemType === 'subcategory' &&
          (c.slug?.toLowerCase().trim() === clean ||
            c.id?.toLowerCase().trim() === clean ||
            c.nameEn?.toLowerCase().trim() === clean ||
            c.nameAr?.trim() === seg.trim())
      );
      if (match) return match;
    }

    for (const seg of segments) {
      const clean = seg.toLowerCase().trim();
      if (!clean) continue;
      const found = categoryConfigs.find((c) => {
        if (c.itemType !== 'subcategory') return false;
        const cSlug = (c.slug || '').toLowerCase().trim();
        const cEn = (c.nameEn || '').toLowerCase().trim();
        const cAr = (c.nameAr || '').trim();
        return (
          (cSlug && (clean === cSlug || clean.includes(cSlug) || cSlug.includes(clean))) ||
          (cEn && (clean === cEn || clean.includes(cEn) || cEn.includes(clean))) ||
          (cAr && (seg.trim() === cAr || seg.trim().includes(cAr) || cAr.includes(seg.trim())))
        );
      });
      if (found) return found;
    }

    return undefined;
  }, [segments, targetConfig, categoryConfigs]);

  // 3. Contact Lens Brand matching (checked for primary route or in-segment)
  const lensBrandMatch = useMemo(
    () => {
      const brandConfigs = (categoryConfigs || []).filter((c) => c.itemType === 'brand');
      return brandConfigs.find(
        (b) =>
          (b.slug && b.slug.toLowerCase() === primarySlug) ||
          b.nameAr === primarySlug ||
          (b.nameEn && b.nameEn.toLowerCase() === primarySlug) ||
          matchesBrand(b.nameAr, primarySlug)
      );
    },
    [categoryConfigs, primarySlug]
  );
  const isLensBrandByCatalog = useMemo(
    () =>
      products.some(
        (p) =>
          matchesBrand(p.brand, primarySlug) &&
          p.category === 'contact-lenses'
      ),
    [products, primarySlug]
  );
  const isLensBrandSlug =
    !isAccessoriesOrCareCategory &&
    !isKidsCategory &&
    !isDurationSlug &&
    !isShapeSlug &&
    !isLensSubcategorySlug &&
    (isLensBrandByCatalog ||
      (Boolean(lensBrandMatch) && !products.some((p) => matchesBrand(p.brand, primarySlug) && p.category !== 'contact-lenses')) ||
      (Boolean(getBrandFromSegment(primarySlug)) && products.some((p) => matchesBrand(p.brand, primarySlug) && p.category === 'contact-lenses')));
  const detectedLensBrandId = lensBrandMatch ? lensBrandMatch.nameAr : (getBrandFromSegment(primarySlug) || targetConfig?.nameAr || primarySlug);

  // 4. Glasses Brand matching (checked for primary route)
  const glassesBrandMatch = useMemo(
    () => {
      const brandConfigs = (categoryConfigs || []).filter((c) => c.itemType === 'brand');
      return brandConfigs.find(
        (b) =>
          (b.slug && b.slug.toLowerCase() === primarySlug) ||
          b.nameAr === primarySlug ||
          (b.nameEn && b.nameEn.toLowerCase() === primarySlug) ||
          matchesBrand(b.nameAr, primarySlug)
      );
    },
    [categoryConfigs, primarySlug]
  );
  const isGlassesBrandByCatalog = useMemo(
    () =>
      products.some(
        (p) =>
          matchesBrand(p.brand, primarySlug) &&
          p.category !== 'contact-lenses'
      ),
    [products, primarySlug]
  );
  const isGlassesBrandSlug =
    !isAccessoriesOrCareCategory &&
    !isKidsCategory &&
    !isDurationSlug &&
    !isShapeSlug &&
    !isLensBrandSlug &&
    !isLensSubcategorySlug &&
    (isGlassesBrandByCatalog ||
      Boolean(glassesBrandMatch) ||
      Boolean(getBrandFromSegment(primarySlug)) ||
      (targetConfig?.itemType === 'brand' && !isLensBrandByCatalog));
  const detectedGlassesBrandId = glassesBrandMatch ? glassesBrandMatch.nameAr : (getBrandFromSegment(primarySlug) || targetConfig?.nameAr || primarySlug);

  // 6. Gender / Target Audience matching
  const GENDER_KEYS = [
    'men',
    'man',
    'women',
    'womens',
    'unisex',
    'رجال',
    'نساء',
    'رجالي',
    'نسائي',
  ];

  const isGenderSlug =
    !isAccessoriesOrCareCategory &&
    !isKidsCategory &&
    (targetConfig?.itemType === 'gender' ||
      (!isDurationSlug &&
        !isShapeSlug &&
        !isLensBrandSlug &&
        !isGlassesBrandSlug &&
        !isLensSubcategorySlug &&
        GENDER_KEYS.includes(primarySlug)));

  const detectedGenderId = useMemo(() => {
    if (primarySlug === 'women' || primarySlug === 'womens' || primarySlug === 'نساء' || primarySlug === 'نسائي') return 'women';
    if (primarySlug === 'men' || primarySlug === 'man' || primarySlug === 'رجال' || primarySlug === 'رجالي') return 'men';
    if (primarySlug === 'kids' || primarySlug === 'أطفال') return 'kids';
    if (primarySlug === 'unisex') return 'unisex';
    if (targetConfig?.itemType === 'gender') {
      const s = targetConfig.slug?.toLowerCase();
      if (s === 'women' || s === 'womens' || s === 'نساء' || s === 'نسائي') return 'women';
      if (s === 'men' || s === 'man' || s === 'رجال' || s === 'رجالي') return 'men';
      if (s === 'kids' || s === 'أطفال') return 'kids';
      return s || 'women';
    }
    return 'women';
  }, [primarySlug, targetConfig]);

  // Terminal step check
  const isTerminalStep =
    isAccessoriesOrCareCategory ||
    ((isDurationSlug || isShapeSlug) && segments.length === 1);

  // Lenses flow check
  const isLensesCategory =
    !isAccessoriesOrCareCategory &&
    !isGenderSlug &&
    !isGlassesBrandSlug &&
    (isDurationSlug ||
      isLensBrandSlug ||
      isLensSubcategorySlug ||
      primarySlug === 'contact-lenses');

  // Sub-option segment extraction
  const parsedGender = useMemo(() => {
    if (isGenderSlug) return detectedGenderId;
    if (segments.some((s) => s === 'women' || s === 'نساء' || s === 'نسائي')) return 'women';
    if (segments.some((s) => s === 'men' || s === 'رجال' || s === 'رجالي')) return 'men';
    if (segments.some((s) => s === 'kids' || s === 'أطفال')) return 'kids';
    if (segments.some((s) => s === 'unisex')) return 'unisex';
    if (primarySlug === 'kids') return 'kids';
    return 'all';
  }, [segments, isGenderSlug, detectedGenderId, primarySlug]);

  const parsedGlassesTypeCategory = useMemo(() => {
    if (isGenderSlug || isGlassesBrandSlug) {
      for (const seg of segments.slice(1)) {
        if (seg === 'eyeglasses' || seg === 'نظارات-طبية' || seg === 'optical') return 'eyeglasses';
        if (seg === 'sunglasses' || seg === 'نظارات-شمسية') return 'sunglasses';
        if (seg === 'kids' || seg === 'نظارات-أطفال') return 'kids';
        const cfg = categoryConfigs.find(
          (c) =>
            c.itemType === 'category' &&
            c.slug !== 'contact-lenses' &&
            (c.slug?.toLowerCase() === seg || c.id?.toLowerCase() === seg)
        );
        if (cfg) return cfg.slug;
      }
      return 'all';
    }

    if (segments.some((s) => s === 'eyeglasses' || s === 'نظارات-طبية' || s === 'optical')) return 'eyeglasses';
    if (segments.some((s) => s === 'sunglasses' || s === 'نظارات-شمسية')) return 'sunglasses';
    if (segments.some((s) => s === 'kids' || s === 'نظارات-أطفال')) return 'kids';
    return 'all';
  }, [segments, isGenderSlug, isGlassesBrandSlug, categoryConfigs]);

  const parsedLensType = useMemo(() => {
    return matchedSubcategoryConfig?.slug || 'all';
  }, [matchedSubcategoryConfig]);

  const parsedLensBrand = useMemo(() => {
    if (isLensBrandSlug) return detectedLensBrandId;
    for (const seg of segments.slice(1)) {
      const cfg = categoryConfigs.find((c) => c.itemType === 'brand' && (c.slug === seg || c.nameAr === seg || c.nameEn?.toLowerCase() === seg));
      if (cfg) return cfg.nameAr;
      const dictBrand = getBrandFromSegment(seg);
      if (dictBrand) return dictBrand;
      const foundProduct = products.find(
        (p) =>
          p.category === 'contact-lenses' &&
          p.brand &&
          (matchesBrand(p.brand, seg) || p.brand.toLowerCase() === seg || seg.includes(p.brand.toLowerCase()))
      );
      if (foundProduct && foundProduct.brand) return foundProduct.brand;
    }
    return 'all';
  }, [isLensBrandSlug, detectedLensBrandId, segments, categoryConfigs, products]);

  const parsedGlassesBrand = useMemo(() => {
    if (isGlassesBrandSlug) return detectedGlassesBrandId;

    const searchSegments = segments.slice(1);
    for (const seg of searchSegments) {
      const cfg = categoryConfigs.find((c) => c.itemType === 'brand' && (c.slug === seg || c.nameAr === seg || c.nameEn?.toLowerCase() === seg));
      if (cfg) return cfg.nameAr;
      const dictBrand = getBrandFromSegment(seg);
      if (dictBrand) return dictBrand;
      const foundProduct = products.find(
        (p) =>
          p.category !== 'contact-lenses' &&
          p.brand &&
          (matchesBrand(p.brand, seg) ||
            p.brand.toLowerCase() === seg ||
            p.brand.toLowerCase().replace(/\s+/g, '-') === seg ||
            seg.includes(p.brand.toLowerCase()))
      );
      if (foundProduct && foundProduct.brand) return foundProduct.brand;
    }

    return 'all';
  }, [isGlassesBrandSlug, detectedGlassesBrandId, segments, products, categoryConfigs]);

  const parsedDuration = useMemo(() => {
    if (isDurationSlug) return detectedDurationId;
    return durationMatch?.id || 'all';
  }, [isDurationSlug, detectedDurationId, durationMatch]);

  const parsedShape = useMemo(() => {
    if (isShapeSlug) return detectedShapeId;
    return shapeMatch?.id || 'all';
  }, [isShapeSlug, detectedShapeId, shapeMatch]);

  // Direct client state for final options (instant in-place filtering without page reload)
  const [prevDurationProp, setPrevDurationProp] = useState(parsedDuration);
  const [selectedDuration, setSelectedDuration] = useState(parsedDuration);
  if (prevDurationProp !== parsedDuration) {
    setPrevDurationProp(parsedDuration);
    setSelectedDuration(parsedDuration);
  }

  const [prevShapeProp, setPrevShapeProp] = useState(parsedShape);
  const [selectedFrameShape, setSelectedFrameShape] = useState(parsedShape);
  if (prevShapeProp !== parsedShape) {
    setPrevShapeProp(parsedShape);
    setSelectedFrameShape(parsedShape);
  }

  // Derived currentStep
  const currentStep = useMemo<1 | 2 | 3>(() => {
    if (isLensBrandSlug) {
      // Contact Lens Brand Flow (e.g. /diva, /linas, /acuvue):
      // Step 1: تسوق حسب التصنيف (Shop by Category: عدسات ملونة / عدسات طبية)
      // Step 2: تسوق حسب مدة الاستخدام (Shop by Duration: يومي، شهري...)
      if (parsedLensType !== 'all') return 2;
      return 1;
    }

    if (isLensSubcategorySlug) {
      // Contact Lens Subcategory Flow (e.g. /color-contact-lenses, /colored-lenses, /medical-lenses):
      // Step 1: تسوق حسب الماركة (Shop by Brand)
      // Step 2: تسوق حسب مدة الاستخدام (Shop by Duration)
      if (parsedLensBrand !== 'all') return 2;
      return 1;
    }

    if (isLensesCategory) {
      // General Contact Lenses Flow (e.g. /contact-lenses):
      // Step 1: تسوق حسب نوع العدسة (Shop by Lens Type)
      // Step 2: تسوق حسب الماركة (Shop by Brand)
      // Step 3: تسوق حسب مدة الاستخدام (Shop by Duration)
      if (parsedLensBrand !== 'all') return 3;
      if (parsedLensType !== 'all') return 2;
      return 1;
    }

    if (isGlassesBrandSlug) {
      // Glasses Brand Flow (e.g. /yuva, /ando, /rayban-glasses):
      // Step 1: تسوق حسب القسم الرئيسي (Shop by Main Department: نظارات طبية، نظارات شمسية، نظارات أطفال)
      // Step 2: تسوق حسب شكل الإطار (Shop by Frame Shape)
      if (parsedGlassesTypeCategory !== 'all') return 2;
      return 1;
    }

    if (isKidsCategory) {
      // Kids Flow:
      // Step 1: تسوق حسب الماركة (Shop by Brand)
      // Step 2: تسوق حسب شكل الإطار (Shop by Frame Shape)
      if (parsedGlassesBrand !== 'all') return 2;
      return 1;
    }

    if (isGenderSlug) {
      // Gender Flow:
      // Step 1: تسوق حسب القسم (Shop by Department)
      // Step 2: تسوق حسب الماركة (Shop by Brand)
      // Step 3: تسوق حسب شكل الإطار (Shop by Frame Shape)
      if (parsedGlassesBrand !== 'all') return 3;
      if (parsedGlassesTypeCategory !== 'all') return 2;
      return 1;
    }

    // General Glasses Categories (e.g. /eyeglasses, /sunglasses):
    // Step 1: من تتسوق له؟ (Who are you shopping for?)
    // Step 2: تسوق حسب الماركة (Shop by Brand)
    // Step 3: تسوق حسب شكل الإطار (Shop by Frame Shape)
    if (parsedGlassesBrand !== 'all') return 3;
    if (parsedGender !== 'all') return 2;
    return 1;
  }, [
    isLensBrandSlug,
    isLensSubcategorySlug,
    isLensesCategory,
    isGlassesBrandSlug,
    isKidsCategory,
    isGenderSlug,
    parsedLensType,
    parsedLensBrand,
    parsedGlassesTypeCategory,
    parsedGlassesBrand,
    parsedGender,
  ]);

  // Helper functions for consistent URL slug generation matching extra.txt & categoryConfigs
  const getBrandSlug = useCallback((brandId: string): string => {
    const clean = (brandId || '').toLowerCase().trim();
    const cfg = categoryConfigs.find(
      (c) =>
        c.itemType === 'brand' &&
        (c.nameAr === brandId ||
          c.nameEn?.toLowerCase() === clean ||
          c.id.toLowerCase().includes(clean) ||
          c.slug?.toLowerCase().trim() === clean)
    );
    if (cfg?.slug) return cfg.slug;
    return clean.replace(/\s+/g, '-');
  }, [categoryConfigs]);

  const getShapeSlug = useCallback((shapeId: string): string => {
    const clean = (shapeId || '').toLowerCase().trim();
    const configuredShape = categoryConfigs.find(
      (config) =>
        config.itemType === 'shape' &&
        (config.slug?.toLowerCase().trim() === clean ||
          config.id?.toLowerCase().trim() === clean ||
          config.nameAr?.toLowerCase().trim() === clean ||
          config.nameEn?.toLowerCase().trim() === clean)
    );
    return configuredShape?.slug || clean.replace(/\s+/g, '-');
  }, [categoryConfigs]);

  const getDurationSlug = useCallback((durationId: string): string => {
    const clean = (durationId || '').toLowerCase().trim();
    const configuredDuration = categoryConfigs.find(
      (config) =>
        config.itemType === 'duration' &&
        (config.slug?.toLowerCase().trim() === clean ||
          config.id?.toLowerCase().trim() === clean ||
          config.nameAr?.toLowerCase().trim() === clean ||
          config.nameEn?.toLowerCase().trim() === clean)
    );
    return configuredDuration?.slug || clean.replace(/\s+/g, '-');
  }, [categoryConfigs]);

  const getGenderSlug = useCallback((genderId: string): string => {
    const clean = (genderId || '').toLowerCase().trim();
    const cfg = categoryConfigs.find(
      (c) =>
        c.itemType === 'gender' &&
        (c.slug?.toLowerCase().trim() === clean ||
          c.id?.toLowerCase().trim() === clean ||
          c.nameAr?.trim() === genderId.trim() ||
          c.nameEn?.toLowerCase().trim() === clean)
    );
    if (cfg?.slug) return cfg.slug;
    if (clean === 'women' || clean === 'womens' || clean === 'نساء' || clean === 'نسائي') return 'women';
    if (clean === 'men' || clean === 'man' || clean === 'رجال' || clean === 'رجالي') return 'men';
    if (clean === 'kids' || clean === 'أطفال') return 'kids';
    return clean;
  }, [categoryConfigs]);

  const getLensTypeSlug = useCallback(
    (typeIdOrSlug: string): string => {
      if (!typeIdOrSlug) return '';
      const clean = typeIdOrSlug.toLowerCase().trim();
      const subcategories = categoryConfigs.filter((config) => config.itemType === 'subcategory');

      const exactMatch = subcategories.find(
        (config) =>
          config.slug?.toLowerCase().trim() === clean ||
          config.id?.toLowerCase().trim() === clean ||
          config.nameAr?.trim() === typeIdOrSlug.trim() ||
          config.nameEn?.toLowerCase().trim() === clean
      );
      if (exactMatch?.slug) return exactMatch.slug;

      const partialMatch = subcategories.find((config) => {
        const sSlug = (config.slug || '').toLowerCase().trim();
        const sAr = (config.nameAr || '').trim();
        const sEn = (config.nameEn || '').toLowerCase().trim();
        return (
          (sSlug && (clean.includes(sSlug) || sSlug.includes(clean))) ||
          (sEn && (clean.includes(sEn) || sEn.includes(clean))) ||
          (sAr && (typeIdOrSlug.includes(sAr) || sAr.includes(typeIdOrSlug)))
        );
      });
      if (partialMatch?.slug) return partialMatch.slug;

      return clean.replace(/\s+/g, '-');
    },
    [categoryConfigs]
  );

  // Active Category Config Profile
  const activeCategoryConfig = useMemo(() => {
    // 1. Check if Glasses Brand is active
    if (parsedGlassesBrand !== 'all') {
      const brandConfig =
        getCategoryConfig(getBrandSlug(parsedGlassesBrand)) ||
        getCategoryConfig(parsedGlassesBrand);
      if (brandConfig) return brandConfig;
    }

    // 2. Check if Lens Brand is active
    if (parsedLensBrand !== 'all') {
      const brandConfig =
        getCategoryConfig(getBrandSlug(parsedLensBrand)) ||
        getCategoryConfig(parsedLensBrand);
      if (brandConfig && (brandConfig.heroBannerImage || brandConfig.heroTitleAr || brandConfig.sectionDescAr)) {
        return brandConfig;
      }
      if (matchedSubcategoryConfig && (matchedSubcategoryConfig.heroBannerImage || matchedSubcategoryConfig.heroTitleAr || matchedSubcategoryConfig.sectionDescAr)) {
        return matchedSubcategoryConfig;
      }
      if (brandConfig) return brandConfig;
    }

    // 3. Glasses Type Category for Gender Flow
    if (parsedGlassesTypeCategory !== 'all' && isGenderSlug) {
      const typeConfig = getCategoryConfig(parsedGlassesTypeCategory);
      if (typeConfig) return typeConfig;
    }

    // 4. Subcategory (matched from route slug or subcategory selection)
    if (matchedSubcategoryConfig) {
      return matchedSubcategoryConfig;
    }

    // 5. Gender
    if (parsedGender !== 'all' && parsedGender !== 'kids' && primarySlug !== 'kids') {
      const genderConfig =
        getCategoryConfig(getGenderSlug(parsedGender)) ||
        getCategoryConfig(parsedGender);
      if (genderConfig) return genderConfig;
    }

    // 6. Frame Shape
    if (parsedShape !== 'all' && !isShapeSlug) {
      const shapeConfig =
        getCategoryConfig(getShapeSlug(parsedShape)) ||
        getCategoryConfig(parsedShape);
      if (shapeConfig) return shapeConfig;
    }

    // 7. Duration
    if (parsedDuration !== 'all' && !isDurationSlug) {
      const durConfig =
        getCategoryConfig(getDurationSlug(parsedDuration)) ||
        getCategoryConfig(parsedDuration);
      if (durConfig) return durConfig;
    }

    // 8. Direct Root / Terminal Slug Config
    const primaryConfig = getCategoryConfig(primarySlug);
    return primaryConfig;
  }, [
    getCategoryConfig,
    primarySlug,
    parsedGlassesBrand,
    parsedLensBrand,
    parsedGlassesTypeCategory,
    isGenderSlug,
    matchedSubcategoryConfig,
    parsedGender,
    parsedShape,
    isShapeSlug,
    parsedDuration,
    isDurationSlug,
    getBrandSlug,
    getShapeSlug,
    getDurationSlug,
    getGenderSlug,
  ]);

  // Lens brands configured in Firestore
  const configuredLensBrands = useMemo(() => {
    const list: Array<{ id: string; labelAr: string; labelEn: string; badge: string }> = [];
    (categoryConfigs || [])
      .filter((c) => c.itemType === 'brand')
      .forEach((c) => {
        list.push({
          id: c.nameAr,
          labelAr: c.nameAr,
          labelEn: c.nameEn || c.nameAr,
          badge: c.nameAr.slice(0, 2),
        });
      });
    return list;
  }, [categoryConfigs]);

  // Master definition of lens durations
  const allLensDurationOptions = useMemo(
    () =>
      dynamicDurationOptions.map((duration) => ({
        id: duration.id,
        labelAr: duration.labelAr,
        labelEn: duration.labelEn,
        slug: duration.slug,
        badge: duration.labelAr.slice(0, 2),
      })),
    [dynamicDurationOptions]
  );

  // Master definition of gender options from Firestore categoryConfigs
  const allGenderOptions = useMemo(() => {
    const configuredGenders = categoryConfigs
      .filter((c) => c.itemType === 'gender' && c.slug !== 'unisex')
      .map((c) => ({
        id: c.slug || c.id,
        labelAr: c.nameAr || c.slug,
        labelEn: c.nameEn || c.nameAr || c.slug,
        slug: c.slug || c.id,
      }));
    if (configuredGenders.length > 0) return configuredGenders;
    return [
      { id: 'women', labelAr: 'نساء', labelEn: 'Women', slug: 'women' },
      { id: 'men', labelAr: 'رجال', labelEn: 'Men', slug: 'men' },
    ];
  }, [categoryConfigs]);

  // Glasses brands configured in Firestore
  const configuredGlassesBrands = useMemo(() => {
    const list: Array<{ id: string; labelAr: string; labelEn: string; avatar: string }> = [];
    (categoryConfigs || [])
      .filter((c) => c.itemType === 'brand')
      .forEach((c) => {
        list.push({
          id: c.nameAr,
          labelAr: c.nameAr,
          labelEn: c.nameEn || c.nameAr,
          avatar: c.cardImage || c.heroBannerImage || c.iconImage || '',
        });
      });
    return list;
  }, [categoryConfigs]);

  // Master definition of frame shapes
  const allFrameShapeOptions = useMemo(
    () =>
      dynamicShapeOptions.map((shape) => ({
        id: shape.id,
        labelAr: shape.labelAr,
        labelEn: shape.labelEn,
        slug: shape.slug,
      })),
    [dynamicShapeOptions]
  );

  const matchesConfiguredDuration = useCallback(
    (rawDuration: string, durationId: string) => {
      const normalize = (value: string) =>
        value.toLowerCase().trim().replace(/[-_]+/g, ' ');
      const selected = normalize(durationId);
      const configuredDuration = dynamicDurationOptions.find((duration) => {
        const values = [
          duration.id,
          duration.labelAr,
          duration.labelEn,
          duration.slug,
        ]
          .filter(Boolean)
          .map((value) => normalize(value!));
        return values.some(
          (value) =>
            value === selected ||
            value.includes(selected) ||
            selected.includes(value)
        );
      });
      const candidates = configuredDuration
        ? [
            configuredDuration.id,
            configuredDuration.labelAr,
            configuredDuration.labelEn,
            configuredDuration.slug,
          ]
        : [durationId];
      const normalizedDuration = normalize(rawDuration);
      if (!normalizedDuration) return false;

      return candidates
        .filter(Boolean)
        .map((value) => normalize(value!))
        .some(
          (value) =>
            normalizedDuration.includes(value) ||
            value.includes(normalizedDuration)
        );
    },
    [dynamicDurationOptions]
  );

  const matchesSubcategory = useCallback((p: Product, subConfig?: CategoryConfig | null) => {
    if (!subConfig) return true;
    const targetSlug = (subConfig.slug || '').toLowerCase().trim();
    const targetNameAr = (subConfig.nameAr || '').trim();
    const targetNameEn = (subConfig.nameEn || '').toLowerCase().trim();

    const pSub = (p.subCategory || '').trim();
    const pSubAr = (p.subCategoryAr || '').trim();
    const pSubEn = (p.subCategoryEn || '').toLowerCase().trim();
    const pLensType = (p.lensType || '').toLowerCase().trim();
    const pContactLensType = (p.contactLensType || '').trim();

    // Direct name match
    if (targetNameAr) {
      if (
        pSub === targetNameAr ||
        pSubAr === targetNameAr ||
        pContactLensType === targetNameAr ||
        (targetNameAr.length > 2 && (pSub.includes(targetNameAr) || pContactLensType.includes(targetNameAr)))
      ) {
        return true;
      }
    }

    if (targetNameEn) {
      if (pSubEn === targetNameEn || (targetNameEn.length > 2 && pSubEn.includes(targetNameEn))) {
        return true;
      }
    }

    // Slug & direct attributes match
    if (targetSlug) {
      if (pSubEn.replace(/\s+/g, '-') === targetSlug || pSubEn.includes(targetSlug)) {
        return true;
      }
      if (pLensType && (pLensType === targetSlug || targetSlug.includes(pLensType) || pLensType.includes(targetSlug))) {
        return true;
      }
      if (p.category && (p.category === targetSlug || p.category === subConfig.id)) {
        return true;
      }
    }

    if (pLensType && (targetNameEn.includes(pLensType) || targetSlug.includes(pLensType))) {
      return true;
    }

    // Flexible semantics for color / medical if present in the configured names or slug
    const isTargetColor =
      targetSlug.includes('color') ||
      targetNameEn.includes('color') ||
      targetNameAr.includes('ملون');
    if (isTargetColor) {
      if (
        pLensType === 'colored' ||
        pSub.includes('ملون') ||
        pSubAr.includes('ملون') ||
        pContactLensType.includes('ملون') ||
        pSubEn.includes('color')
      ) {
        return true;
      }
    }

    const isTargetMedical =
      targetSlug.includes('medic') ||
      targetSlug.includes('correct') ||
      targetSlug.includes('clear') ||
      targetNameEn.includes('correct') ||
      targetNameEn.includes('medic') ||
      targetNameAr.includes('طب');
    if (isTargetMedical) {
      if (
        pLensType === 'medical' ||
        pSub.includes('طب') ||
        pSubAr.includes('طب') ||
        pContactLensType.includes('طب') ||
        pSubEn.includes('correct') ||
        pSubEn.includes('medic') ||
        pSubEn.includes('clear')
      ) {
        return true;
      }
    }

    return false;
  }, []);

  // ==========================================
  // 1. BASE CATEGORY PRODUCTS
  // ==========================================
  const baseCategoryProducts = useMemo(() => {
    return products.filter((p) => {
      // Duration Terminal Step
      if (isDurationSlug) {
        if (p.category !== 'contact-lenses') return false;
        const dur = (p.contactLensDurationAr || p.contactLensDuration || p.specs?.duration || '').toLowerCase();
        return matchesConfiguredDuration(dur, detectedDurationId);
      }

      // Shape Terminal Step
      if (isShapeSlug) {
        if (p.category === 'contact-lenses') return false;
        return matchShape(p, detectedShapeId);
      }

      // Lens Brand Direct URL
      if (isLensBrandSlug) {
        if (p.category !== 'contact-lenses') return false;
        return matchesBrand(p.brand, detectedLensBrandId);
      }

      // Glasses Brand Direct URL
      if (isGlassesBrandSlug) {
        if (p.category === 'contact-lenses') return false;
        return matchesBrand(p.brand, detectedGlassesBrandId);
      }

      // Gender / Target Audience Direct URL
      if (isGenderSlug) {
        if (p.category === 'contact-lenses') return false;
        const isUnisex = p.gender === 'unisex' || p.genderAr === 'للجنسين' || p.genderEn?.toLowerCase() === 'unisex';
        if (detectedGenderId === 'women') {
          return p.gender === 'women' || p.genderAr === 'نساء' || p.genderAr === 'نسائي' || isUnisex;
        }
        if (detectedGenderId === 'men') {
          return p.gender === 'men' || p.genderAr === 'رجال' || p.genderAr === 'رجالي' || isUnisex;
        }
        if (detectedGenderId === 'kids') return p.gender === 'kids' || p.category === 'kids';
        return true;
      }

      // Lens Subcategories Direct URL
      if (isLensSubcategorySlug) {
        if (p.category !== 'contact-lenses') return false;
        if (matchedSubcategoryConfig) {
          return matchesSubcategory(p, matchedSubcategoryConfig);
        }
        return true;
      }

      // Standard Lenses Categories
      if (isLensesCategory) {
        if (p.category !== 'contact-lenses') return false;
        if (matchedSubcategoryConfig) {
          return matchesSubcategory(p, matchedSubcategoryConfig);
        }
        return true;
      }

      // Accessories & Care Categories
      if (
        primarySlug === 'accessories' ||
        primarySlug === 'إكسسوارات' ||
        primarySlug === 'اكسسوارات' ||
        targetConfig?.id === 'category-accessories' ||
        targetConfig?.slug === 'accessories'
      ) {
        return p.category === 'accessories';
      }
      if (
        primarySlug === 'care' ||
        primarySlug === 'عناية' ||
        primarySlug === 'عنايه' ||
        targetConfig?.id === 'category-care' ||
        targetConfig?.slug === 'care'
      ) {
        return p.category === 'care';
      }

      // Standard Glasses Categories
      if (primarySlug === 'eyeglasses') return p.category === 'eyeglasses';
      if (primarySlug === 'sunglasses') return p.category === 'sunglasses';
      if (primarySlug === 'yuva') {
        const b = (p.brand || '').toLowerCase();
        return b.includes('يوفا') || b.includes('yuva') || p.category === 'yuva';
      }
      if (primarySlug === 'kids') return p.category === 'kids' || p.gender === 'kids';
      if (primarySlug === 'all') return p.category !== 'contact-lenses';

      // Fallback for category configs
      if (targetConfig?.itemType === 'category') {
        return p.category === targetConfig.slug || p.category === targetConfig.id;
      }

      return p.category === primarySlug;
    });
  }, [
    products,
    isDurationSlug,
    isShapeSlug,
    isLensBrandSlug,
    isGlassesBrandSlug,
    isGenderSlug,
    isLensesCategory,
    isLensSubcategorySlug,
    isKidsCategory,
    primarySlug,
    detectedDurationId,
    detectedShapeId,
    detectedLensBrandId,
    detectedGlassesBrandId,
    detectedGenderId,
    matchesConfiguredDuration,
    matchesSubcategory,
    matchedSubcategoryConfig,
    targetConfig,
  ]);

  // ==========================================
  // 2. LENSES FLOW DYNAMIC OPTIONS
  // ==========================================
  const availableLensTypeOptions = useMemo(() => {
    return dynamicSubcategoryOptions.filter((opt) => {
      return baseCategoryProducts.some((p) => matchesSubcategory(p, opt.config));
    });
  }, [dynamicSubcategoryOptions, baseCategoryProducts, matchesSubcategory]);

  const step2LensCandidates = useMemo(() => {
    return baseCategoryProducts.filter((p) => {
      if (matchedSubcategoryConfig) {
        return matchesSubcategory(p, matchedSubcategoryConfig);
      }
      return true;
    });
  }, [baseCategoryProducts, matchedSubcategoryConfig, matchesSubcategory]);

  const availableLensBrandOptions = useMemo(() => {
    const brandMap = new Map<string, { id: string; labelAr: string; labelEn: string; badge: string }>();

    configuredLensBrands.forEach((opt) => {
      const hasMatch = step2LensCandidates.some((p) => matchesBrand(p.brand, opt.id));
      if (hasMatch) {
        brandMap.set(opt.id, opt);
      }
    });

    return Array.from(brandMap.values());
  }, [configuredLensBrands, step2LensCandidates]);

  const step3LensCandidates = useMemo(() => {
    return step2LensCandidates.filter((p) => {
      if (parsedLensBrand === 'all') return true;
      return matchesBrand(p.brand, parsedLensBrand);
    });
  }, [step2LensCandidates, parsedLensBrand]);

  const availableLensDurationOptions = useMemo(() => {
    return allLensDurationOptions.filter((opt) => {
      return step3LensCandidates.some((p) => {
        const dur = (p.contactLensDurationAr || p.contactLensDuration || p.specs?.duration || '').toLowerCase();
        return matchesConfiguredDuration(dur, opt.id);
      });
    });
  }, [allLensDurationOptions, matchesConfiguredDuration, step3LensCandidates]);

  // ==========================================
  // 3. GLASSES FLOW DYNAMIC OPTIONS
  // ==========================================
  const availableGenderOptions = useMemo(() => {
    return allGenderOptions.filter((opt) => {
      const target = opt.id;
      if (target === 'women') {
        return baseCategoryProducts.some((p) => {
          const isUnisex = p.gender === 'unisex' || p.genderAr === 'للجنسين' || p.genderEn?.toLowerCase() === 'unisex';
          return p.gender === 'women' || p.genderAr === 'نساء' || p.genderAr === 'نسائي' || isUnisex;
        });
      }
      if (target === 'men') {
        return baseCategoryProducts.some((p) => {
          const isUnisex = p.gender === 'unisex' || p.genderAr === 'للجنسين' || p.genderEn?.toLowerCase() === 'unisex';
          return p.gender === 'men' || p.genderAr === 'رجال' || p.genderAr === 'رجالي' || isUnisex;
        });
      }
      return false;
    });
  }, [allGenderOptions, baseCategoryProducts]);

  const step2GlassesCandidates = useMemo(() => {
    return baseCategoryProducts.filter((p) => {
      if (isKidsCategory) return true;
      if (parsedGender === 'all') return true;
      const isUnisex = p.gender === 'unisex' || p.genderAr === 'للجنسين' || p.genderEn?.toLowerCase() === 'unisex';
      if (parsedGender === 'women') {
        return p.gender === 'women' || p.genderAr === 'نساء' || p.genderAr === 'نسائي' || isUnisex;
      }
      if (parsedGender === 'men') {
        return p.gender === 'men' || p.genderAr === 'رجال' || p.genderAr === 'رجالي' || isUnisex;
      }
      if (parsedGender === 'kids') return p.gender === 'kids' || p.category === 'kids';
      return true;
    });
  }, [baseCategoryProducts, parsedGender, isKidsCategory]);

  // For Glasses Brands: Step 2 "تسوق حسب النوع" OR For Gender: Step 1 "تسوق حسب القسم"
  const availableGlassesTypeOptions = useMemo(() => {
    if (!isGlassesBrandSlug && !isGenderSlug) return [];

    const candidates = isGenderSlug ? baseCategoryProducts : step2GlassesCandidates;
    const catSet = new Set<string>();
    candidates.forEach((p) => {
      if (p.category && p.category !== 'contact-lenses') catSet.add(p.category);
    });

    const options: { id: string; labelAr: string; labelEn: string; iconImage?: string }[] = [];
    const seenCategorySlugs = new Set<string>();

    categoryConfigs
      .filter(
        (cfg) =>
          cfg.itemType === 'category' &&
          cfg.slug !== 'contact-lenses' &&
          cfg.slug !== 'accessories' &&
          cfg.slug !== 'care'
      )
      .forEach((cfg) => {
        const slug = cfg.slug || cfg.id;
        if (
          !seenCategorySlugs.has(slug) &&
          (catSet.has(cfg.slug) || catSet.has(cfg.id) || (slug === 'kids' && catSet.has('kids')))
        ) {
          seenCategorySlugs.add(slug);
          options.push({
            id: cfg.slug || cfg.id,
            labelAr: cfg.nameAr || cfg.heroTitleAr || '',
            labelEn: cfg.nameEn || cfg.heroTitleEn || cfg.slug || '',
            iconImage: cfg.iconImage,
          });
        }
      });

    return options;
  }, [
    isGlassesBrandSlug,
    isGenderSlug,
    baseCategoryProducts,
    step2GlassesCandidates,
    getCategoryConfig,
    categoryConfigs,
  ]);

  const availableGlassesBrandOptions = useMemo(() => {
    const brandMap = new Map<string, { id: string; labelAr: string; labelEn: string; avatar: string }>();

    // For isGenderSlug, filter by parsedGlassesTypeCategory if selected
    const candidates = step2GlassesCandidates.filter((p) => {
      if (isGenderSlug && parsedGlassesTypeCategory !== 'all') {
        return p.category === parsedGlassesTypeCategory;
      }
      return true;
    });

    configuredGlassesBrands.forEach((opt) => {
      const hasMatch = candidates.some((p) => matchesBrand(p.brand, opt.id));
      if (hasMatch) {
        brandMap.set(opt.id, opt);
      }
    });

    return Array.from(brandMap.values());
  }, [configuredGlassesBrands, step2GlassesCandidates, isGenderSlug, parsedGlassesTypeCategory]);

  const step3GlassesCandidates = useMemo(() => {
    return step2GlassesCandidates.filter((p) => {
      if (isKidsCategory) {
        if (parsedGlassesBrand === 'all') return true;
        return matchesBrand(p.brand, parsedGlassesBrand);
      }
      if (isGlassesBrandSlug) {
        if (parsedGlassesTypeCategory !== 'all' && p.category !== parsedGlassesTypeCategory) {
          return false;
        }
        return true;
      }
      if (isGenderSlug) {
        if (parsedGlassesTypeCategory !== 'all' && p.category !== parsedGlassesTypeCategory) {
          return false;
        }
        if (parsedGlassesBrand === 'all') return true;
        return matchesBrand(p.brand, parsedGlassesBrand);
      }
      if (parsedGlassesBrand === 'all') return true;
      return matchesBrand(p.brand, parsedGlassesBrand);
    });
  }, [step2GlassesCandidates, isKidsCategory, isGlassesBrandSlug, isGenderSlug, parsedGlassesTypeCategory, parsedGlassesBrand]);

  const availableFrameShapeOptions = useMemo(() => {
    return allFrameShapeOptions.filter((opt) => {
      return step3GlassesCandidates.some((p) => matchShape(p, opt.id));
    });
  }, [allFrameShapeOptions, step3GlassesCandidates]);

  // ==========================================
  // 4. FINAL FILTERED PRODUCTS (Filters in-place immediately)
  // ==========================================
  const filteredProducts = useMemo(() => {
    if (isTerminalStep) {
      return baseCategoryProducts;
    }

    if (isLensesCategory) {
      return step3LensCandidates.filter((p) => {
        if (selectedDuration !== 'all') {
          const dur = (p.contactLensDurationAr || p.contactLensDuration || p.specs?.duration || '').toLowerCase();
          if (!matchesConfiguredDuration(dur, selectedDuration)) return false;
        }
        return true;
      });
    }

    return step3GlassesCandidates.filter((p) => {
      if (selectedFrameShape !== 'all') {
        if (!matchShape(p, selectedFrameShape)) return false;
      }
      return true;
    });
  }, [
    isTerminalStep,
    isLensesCategory,
    baseCategoryProducts,
    step3LensCandidates,
    step3GlassesCandidates,
    selectedDuration,
    selectedFrameShape,
    matchesConfiguredDuration,
  ]);

  // Sorting state: default featured (best seller / recommended)
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');

  // Sorted products for final presentation
  const displayedProducts = useMemo(() => {
    const list = [...filteredProducts];
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => a.basePriceSAR - b.basePriceSAR);
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => b.basePriceSAR - a.basePriceSAR);
    }
    if (sortBy === 'rating') {
      return list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
    }
    // Default 'featured': In-stock first, featured first, then rating
    return list.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      if (a.inStock !== b.inStock) return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0);
      return (b.rating || 0) - (a.rating || 0);
    });
  }, [filteredProducts, sortBy]);

  // Handlers for URL updating upon option selection
  const handleSelectLensType = (subSlugOrId: string) => {
    const matched = categoryConfigs.find(
      (c) =>
        c.itemType === 'subcategory' &&
        (c.slug?.toLowerCase().trim() === subSlugOrId.toLowerCase().trim() ||
          c.id?.toLowerCase().trim() === subSlugOrId.toLowerCase().trim() ||
          c.nameAr?.trim() === subSlugOrId.trim() ||
          c.nameEn?.toLowerCase().trim() === subSlugOrId.toLowerCase().trim())
    );
    const targetSlug = matched?.slug || getLensTypeSlug(subSlugOrId);

    if (isLensBrandSlug) {
      router.push(`/${primarySlug}/${targetSlug}`);
      return;
    }

    if (primarySlug === 'contact-lenses' || isLensSubcategorySlug) {
      router.push(`/${targetSlug}`);
      return;
    }

    router.push(`/${primarySlug}/${targetSlug}`);
  };

  const handleSelectLensBrand = (brandId: string) => {
    const brandSlug = getBrandSlug(brandId);
    if (isLensSubcategorySlug) {
      router.push(`/${primarySlug}/${brandSlug}`);
    } else {
      const basePath = segments.slice(0, Math.max(1, currentStep - 1)).join('/');
      router.push(`/${basePath}/${brandSlug}`);
    }
  };

  const handleSelectGlassesCategoryForBrand = (catId: string) => {
    const cfg = categoryConfigs.find(
      (c) =>
        c.itemType === 'category' &&
        (c.slug === catId || c.id.toLowerCase().includes(catId.toLowerCase()))
    );
    const slug = cfg?.slug || catId;
    router.push(`/${primarySlug}/${slug}`);
  };

  // Immediate in-place duration toggle without page reload
  const handleSelectLensDuration = (durationId: string) => {
    const isCurrentlySelected = selectedDuration === durationId;
    const nextDuration = isCurrentlySelected ? 'all' : durationId;
    setSelectedDuration(nextDuration);

    if (typeof window !== 'undefined') {
      const durSlug = getDurationSlug(durationId);

      const nonDurationSegments = segments.filter(
        (segment) =>
          !dynamicDurationOptions.some(
            (duration) =>
              segment === duration.slug?.toLowerCase().trim() ||
              segment === duration.id.toLowerCase().trim() ||
              segment === duration.labelEn.toLowerCase().trim()
          )
      );

      const newPath = isCurrentlySelected
        ? `/${nonDurationSegments.join('/')}`
        : `/${nonDurationSegments.join('/')}/${durSlug}`;

      window.history.pushState(null, '', newPath);
    }
  };

  const handleSelectGender = (genderId: string) => {
    const slug = getGenderSlug(genderId);
    router.push(`/${primarySlug}/${slug}`);
  };

  const handleSelectGlassesCategoryForGender = (catId: string) => {
    const cfg = categoryConfigs.find(
      (c) =>
        c.itemType === 'category' &&
        (c.slug === catId || c.id.toLowerCase().includes(catId.toLowerCase()))
    );
    const slug = cfg?.slug || catId;
    router.push(`/${primarySlug}/${slug}`);
  };

  const handleSelectGlassesBrand = (brandId: string) => {
    const brandSlug = getBrandSlug(brandId);
    const basePath = isKidsCategory
      ? primarySlug
      : isGenderSlug
      ? `${primarySlug}/${parsedGlassesTypeCategory}`
      : segments.slice(0, 2).join('/') || `${primarySlug}/${parsedGender}`;
    router.push(`/${basePath}/${brandSlug}`);
  };

  const handleSelectGlassesType = (typeId: string) => {
    const basePath = segments.slice(0, 2).join('/') || `${primarySlug}/${parsedGender}`;
    router.push(`/${basePath}/${typeId}`);
  };

  // Immediate in-place frame shape toggle without page reload
  const handleSelectFrameShape = (shapeId: string) => {
    const isCurrentlySelected = selectedFrameShape === shapeId;
    const nextShape = isCurrentlySelected ? 'all' : shapeId;
    setSelectedFrameShape(nextShape);

    if (typeof window !== 'undefined') {
      const shapeSlug = getShapeSlug(shapeId);
      const nonShapeSegments = segments.filter(
        (segment) =>
          !dynamicShapeOptions.some(
            (shape) =>
              segment === shape.slug?.toLowerCase().trim() ||
              segment === shape.id.toLowerCase().trim() ||
              segment === shape.labelEn.toLowerCase().trim()
          )
      );

      const newPath = isCurrentlySelected
        ? `/${nonShapeSegments.join('/')}`
        : `/${nonShapeSegments.join('/')}/${shapeSlug}`;

      window.history.pushState(null, '', newPath);
    }
  };

  const handleStepBack = (toStep: 1 | 2 | 3) => {
    setSelectedDuration('all');
    setSelectedFrameShape('all');
    if (toStep === 1) {
      router.push(`/${primarySlug}`);
    } else if (toStep === 2) {
      if (isKidsCategory || isGlassesBrandSlug || isLensBrandSlug || isLensSubcategorySlug) {
        router.push(`/${primarySlug}`);
      } else if (isGenderSlug) {
        router.push(`/${primarySlug}/${parsedGlassesTypeCategory}`);
      } else {
        const step2Path = segments.slice(0, 2).join('/');
        router.push(`/${step2Path}`);
      }
    }
  };

  // Root category title for Breadcrumbs
  const parentCategoryTitle = useMemo(() => {
    // 1. Direct subcategory match
    if (isLensSubcategorySlug || matchedSubcategoryConfig) {
      if (matchedSubcategoryConfig) {
        return language === 'ar'
          ? (matchedSubcategoryConfig.heroTitleAr || matchedSubcategoryConfig.nameAr)
          : (matchedSubcategoryConfig.heroTitleEn || matchedSubcategoryConfig.nameEn || matchedSubcategoryConfig.nameAr);
      }
    }

    // 2. Direct parent config by primarySlug
    const parentCfg =
      getCategoryConfig(primarySlug) ||
      categoryConfigs.find(
        (c) =>
          c.slug?.toLowerCase().trim() === primarySlug ||
          c.id?.toLowerCase().trim() === primarySlug ||
          c.nameAr?.trim() === primarySlug
      );
    if (parentCfg) {
      return language === 'ar'
        ? (parentCfg.heroTitleAr || parentCfg.nameAr)
        : (parentCfg.heroTitleEn || parentCfg.nameEn || parentCfg.nameAr);
    }

    if (isGlassesBrandSlug) return getBrandName(detectedGlassesBrandId, language);
    if (isLensBrandSlug) return getBrandName(detectedLensBrandId, language);

    // Dynamic brand or custom lookup
    const brandMatch = categoryConfigs.find(
      (c) =>
        c.itemType === 'brand' &&
        (c.slug === primarySlug || c.nameAr === primarySlug || c.nameEn?.toLowerCase() === primarySlug)
    );
    if (brandMatch) {
      return language === 'ar' ? brandMatch.nameAr : (brandMatch.nameEn || brandMatch.nameAr);
    }

    return t('الأقسام', 'Collections');
  }, [
    isLensSubcategorySlug,
    matchedSubcategoryConfig,
    primarySlug,
    getCategoryConfig,
    categoryConfigs,
    language,
    t,
    isGlassesBrandSlug,
    isLensBrandSlug,
    detectedGlassesBrandId,
    detectedLensBrandId,
  ]);

  // Current specific category / sub-option title
  const currentCategoryTitle = useMemo(() => {
    // 1. If activeCategoryConfig exists and has a custom name from admin dashboard
    if (activeCategoryConfig) {
      const customTitle =
        language === 'ar'
          ? (activeCategoryConfig.heroTitleAr || activeCategoryConfig.nameAr)
          : (activeCategoryConfig.heroTitleEn || activeCategoryConfig.nameEn || activeCategoryConfig.nameAr);
      if (customTitle) return customTitle;
    }

    // 2. Glasses Brand flow
    if (isGlassesBrandSlug) {
      if (parsedGlassesTypeCategory !== 'all') {
        const catCfg = categoryConfigs.find(
          (c) => c.itemType === 'category' && (c.slug === parsedGlassesTypeCategory || c.id === parsedGlassesTypeCategory)
        );
        const catName = catCfg
          ? (language === 'ar' ? (catCfg.heroTitleAr || catCfg.nameAr) : (catCfg.heroTitleEn || catCfg.nameEn || catCfg.nameAr))
          : parsedGlassesTypeCategory;
        return `${catName} - ${getBrandName(detectedGlassesBrandId, language)}`;
      }
      return getBrandName(detectedGlassesBrandId, language);
    }

    // 3. Contact Lens Brand flow
    if (isLensBrandSlug) {
      if (parsedLensType !== 'all') {
        const subConfig = categoryConfigs.find(
          (c) => c.itemType === 'subcategory' && (c.slug === parsedLensType || c.id === parsedLensType)
        );
        const typeName = subConfig
          ? (language === 'ar' ? (subConfig.heroTitleAr || subConfig.nameAr) : (subConfig.heroTitleEn || subConfig.nameEn || subConfig.nameAr))
          : parsedLensType;
        return `${typeName} - ${getBrandName(detectedLensBrandId, language)}`;
      }
      return getBrandName(detectedLensBrandId, language);
    }

    // 4. Contact Lens Subcategory flow
    if (isLensSubcategorySlug || matchedSubcategoryConfig) {
      const subConfig =
        matchedSubcategoryConfig ||
        categoryConfigs.find(
          (c) => c.itemType === 'subcategory' && (c.slug === primarySlug || c.slug === parsedLensType)
        );
      const subName = subConfig
        ? (language === 'ar' ? (subConfig.heroTitleAr || subConfig.nameAr) : (subConfig.heroTitleEn || subConfig.nameEn || subConfig.nameAr))
        : '';
      if (parsedLensBrand !== 'all') {
        return subName
          ? `${subName} - ${getBrandName(parsedLensBrand, language)}`
          : getBrandName(parsedLensBrand, language);
      }
      if (subName) return subName;
    }

    if (parsedGlassesBrand !== 'all') return getBrandName(parsedGlassesBrand, language);
    if (parsedLensBrand !== 'all') return getBrandName(parsedLensBrand, language);

    if (isGlassesBrandSlug) return getBrandName(detectedGlassesBrandId, language);
    if (isLensBrandSlug) return getBrandName(detectedLensBrandId, language);

    // 5. Usage Duration
    if (parsedDuration !== 'all') {
      const found = allLensDurationOptions.find((d) => d.id === parsedDuration || d.slug === parsedDuration);
      return found ? (language === 'ar' ? found.labelAr : found.labelEn) : parsedDuration;
    }
    if (isDurationSlug) {
      const found = allLensDurationOptions.find((d) => d.id === detectedDurationId || d.slug === detectedDurationId);
      return found ? (language === 'ar' ? found.labelAr : found.labelEn) : detectedDurationId;
    }

    // 6. Frame Shape
    if (parsedShape !== 'all') {
      const found = allFrameShapeOptions.find((s) => s.id === parsedShape || s.slug === parsedShape);
      return found ? (language === 'ar' ? found.labelAr : found.labelEn) : parsedShape;
    }
    if (isShapeSlug) {
      const found = allFrameShapeOptions.find((s) => s.id === detectedShapeId || s.slug === detectedShapeId);
      return found ? (language === 'ar' ? found.labelAr : found.labelEn) : detectedShapeId;
    }

    // 7. Subcategory / Lens Type selection
    if (parsedLensType !== 'all') {
      const subConfig = categoryConfigs.find(
        (c) => c.itemType === 'subcategory' && (c.slug === parsedLensType || c.id === parsedLensType)
      );
      if (subConfig) {
        return language === 'ar'
          ? (subConfig.heroTitleAr || subConfig.nameAr)
          : (subConfig.heroTitleEn || subConfig.nameEn || subConfig.nameAr);
      }
    }

    // 8. Gender flow
    if (parsedGlassesTypeCategory !== 'all' && isGenderSlug) {
      const catCfg = categoryConfigs.find(
        (c) => c.itemType === 'category' && (c.slug === parsedGlassesTypeCategory || c.id === parsedGlassesTypeCategory)
      );
      if (catCfg) {
        return language === 'ar'
          ? (catCfg.heroTitleAr || catCfg.nameAr)
          : (catCfg.heroTitleEn || catCfg.nameEn || catCfg.nameAr);
      }
    }

    if (parsedGender !== 'all' && parsedGender !== 'kids' && primarySlug !== 'kids') {
      const genderCfg = categoryConfigs.find(
        (c) => c.itemType === 'gender' && (c.slug === parsedGender || c.id === parsedGender)
      );
      if (genderCfg) {
        return language === 'ar' ? genderCfg.nameAr : (genderCfg.nameEn || genderCfg.nameAr);
      }
    }

    if (isGenderSlug) {
      const genderCfg = categoryConfigs.find(
        (c) => c.itemType === 'gender' && (c.slug === detectedGenderId || c.id === detectedGenderId)
      );
      if (genderCfg) {
        return language === 'ar' ? genderCfg.nameAr : (genderCfg.nameEn || genderCfg.nameAr);
      }
    }

    // 9. Root Category by primarySlug from DB
    const rootCfg =
      getCategoryConfig(primarySlug) ||
      categoryConfigs.find(
        (c) =>
          c.slug?.toLowerCase().trim() === primarySlug ||
          c.id?.toLowerCase().trim() === primarySlug ||
          c.nameAr?.trim() === primarySlug
      );
    if (rootCfg) {
      return language === 'ar'
        ? (rootCfg.heroTitleAr || rootCfg.nameAr)
        : (rootCfg.heroTitleEn || rootCfg.nameEn || rootCfg.nameAr);
    }

    return t('الأقسام', 'Collections');
  }, [
    activeCategoryConfig,
    language,
    isGlassesBrandSlug,
    parsedGlassesTypeCategory,
    categoryConfigs,
    detectedGlassesBrandId,
    isLensBrandSlug,
    parsedLensType,
    detectedLensBrandId,
    isLensSubcategorySlug,
    matchedSubcategoryConfig,
    primarySlug,
    parsedLensBrand,
    parsedGlassesBrand,
    parsedDuration,
    allLensDurationOptions,
    isDurationSlug,
    detectedDurationId,
    parsedShape,
    allFrameShapeOptions,
    isShapeSlug,
    detectedShapeId,
    isGenderSlug,
    parsedGender,
    detectedGenderId,
    getCategoryConfig,
    t,
  ]);

  return (
    <>
      <SeoHead
        title={
          language === 'ar'
            ? activeCategoryConfig?.metaTitleAr || activeCategoryConfig?.heroTitleAr || currentCategoryTitle
            : activeCategoryConfig?.metaTitleEn || activeCategoryConfig?.heroTitleEn || currentCategoryTitle
        }
        description={
          language === 'ar'
            ? activeCategoryConfig?.metaDescAr || activeCategoryConfig?.heroSubTitleAr
            : activeCategoryConfig?.metaDescEn || activeCategoryConfig?.heroSubTitleEn
        }
        keywords={activeCategoryConfig?.metaKeywords}
      />

      {activeCategoryConfig?.schemaJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: activeCategoryConfig.schemaJson }}
        />
      )}

      <div className="bg-white min-h-screen pb-8 sm:pb-12">
        {/* Full-Width Hero Banner (Edge-to-edge, flat top, rounded bottom) */}
        {activeCategoryConfig?.heroBannerImage && (
          <div className="relative w-full h-[200px] sm:h-[280px] md:h-[350px] lg:h-[380px] rounded-t-none rounded-b-2xl sm:rounded-b-3xl md:rounded-b-[2.5rem] overflow-hidden shadow-md mb-6 sm:mb-8">
            <Image
              src={activeCategoryConfig.heroBannerImage}
              alt={
                language === 'ar'
                  ? activeCategoryConfig.heroTitleAr || activeCategoryConfig.nameAr
                  : activeCategoryConfig.heroTitleEn || activeCategoryConfig.nameEn
              }
              fill
              priority
              referrerPolicy="no-referrer"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/45 to-slate-950/20" />
            <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 md:py-10 flex flex-col justify-end text-white z-10">
              <div className="max-w-2xl">
                <span className="text-[10px] sm:text-xs font-bold text-[#A58454] tracking-widest uppercase block mb-1 font-mono">
                  {activeCategoryConfig.itemType === 'brand' ? 'MARQUE EXCLUSIVE' : 'COLLECTION EXCLUSIVE'}
                </span>
                <h1 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold font-kufi text-white drop-shadow-md mb-1.5">
                  {language === 'ar'
                    ? activeCategoryConfig.heroTitleAr || activeCategoryConfig.nameAr
                    : activeCategoryConfig.heroTitleEn || activeCategoryConfig.nameEn}
                </h1>
                {(activeCategoryConfig.heroSubTitleAr || activeCategoryConfig.heroSubTitleEn) && (
                  <p className="text-xs sm:text-sm md:text-base text-slate-200/95 line-clamp-2 leading-relaxed font-sans">
                    {language === 'ar'
                      ? activeCategoryConfig.heroSubTitleAr
                      : activeCategoryConfig.heroSubTitleEn}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 mb-4 sm:mb-6">
          {/* Clean Minimal Title Header when no Hero Banner Image is configured */}
          {!activeCategoryConfig?.heroBannerImage && (
            <div className="pt-4 sm:pt-6 mb-4 sm:mb-6 pb-3 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <span className="w-1.5 h-6 sm:h-7 bg-[#A58454] rounded-full shrink-0" />
                <div>
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold font-kufi text-slate-900 tracking-tight">
                    {currentCategoryTitle}
                  </h1>
                  {activeCategoryConfig && (activeCategoryConfig.heroSubTitleAr || activeCategoryConfig.heroSubTitleEn) && (
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      {language === 'ar' ? activeCategoryConfig.heroSubTitleAr : activeCategoryConfig.heroSubTitleEn}
                    </p>
                  )}
                </div>
              </div>
              <span className="text-xs text-slate-400 font-mono">
                {displayedProducts.length} {t('منتج', 'items')}
              </span>
            </div>
          )}

          {/* Section Description Card (Only shown if explicitly defined on the active config) */}
          {activeCategoryConfig && (activeCategoryConfig.sectionDescAr || activeCategoryConfig.sectionDescEn) && (
            <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-slate-50/70 border border-slate-100 text-slate-700 flex gap-3 items-start animate-fadeIn">
              <div className="h-4 w-1 bg-[#A58454] rounded-full shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans whitespace-pre-line">
                {language === 'ar' ? activeCategoryConfig.sectionDescAr : activeCategoryConfig.sectionDescEn}
              </p>
            </div>
          )}

          {/* Breadcrumb Row */}
          {!isTerminalStep && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-sans border-b border-slate-100 pb-3 flex-wrap">
              <button
                type="button"
                onClick={() => handleStepBack(1)}
                className="font-semibold text-slate-900 font-kufi hover:underline cursor-pointer"
              >
                {parentCategoryTitle}
              </button>

              {currentStep >= 2 && (
                <>
                  {language === 'ar' ? (
                    <ChevronLeft className="w-3 h-3 text-slate-300" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleStepBack(1)}
                    className="hover:text-slate-900 transition-colors font-medium text-slate-600 cursor-pointer"
                  >
                    {isGlassesBrandSlug
                      ? (() => {
                          const catCfg = categoryConfigs.find(
                            (c) => c.itemType === 'category' && (c.slug === parsedGlassesTypeCategory || c.id === parsedGlassesTypeCategory)
                          );
                          return catCfg
                            ? (language === 'ar' ? (catCfg.heroTitleAr || catCfg.nameAr) : (catCfg.heroTitleEn || catCfg.nameEn || catCfg.nameAr))
                            : t('القسم', 'Department');
                        })()
                      : isLensBrandSlug
                      ? (() => {
                          const subConfig = categoryConfigs.find(
                            (c) => c.itemType === 'subcategory' && (c.slug === parsedLensType || c.id === parsedLensType)
                          );
                          return subConfig
                            ? (language === 'ar' ? (subConfig.nameAr || subConfig.heroTitleAr) : (subConfig.nameEn || subConfig.heroTitleEn || subConfig.nameAr))
                            : t('القسم الفرعي', 'Subcategory');
                        })()
                      : isLensSubcategorySlug
                      ? getBrandName(parsedLensBrand, language)
                      : isKidsCategory
                      ? getBrandName(parsedGlassesBrand, language)
                      : isLensesCategory
                      ? (() => {
                          if (parsedLensType !== 'all') {
                            const subConfig = categoryConfigs.find(
                              (c) => c.itemType === 'subcategory' && (c.slug === parsedLensType || c.id === parsedLensType)
                            );
                            if (subConfig) {
                              return language === 'ar' ? (subConfig.nameAr || subConfig.heroTitleAr) : (subConfig.nameEn || subConfig.heroTitleEn || subConfig.nameAr);
                            }
                          }
                          return t('نوع العدسة', 'Lens Type');
                        })()
                      : isGenderSlug
                      ? (() => {
                          const catCfg = categoryConfigs.find(
                            (c) => c.itemType === 'category' && (c.slug === parsedGlassesTypeCategory || c.id === parsedGlassesTypeCategory)
                          );
                          return catCfg
                            ? (language === 'ar' ? (catCfg.heroTitleAr || catCfg.nameAr) : (catCfg.heroTitleEn || catCfg.nameEn || catCfg.nameAr))
                            : t('القسم', 'Department');
                        })()
                      : (() => {
                          const genderCfg = categoryConfigs.find(
                            (c) => c.itemType === 'gender' && (c.slug === parsedGender || c.id === parsedGender)
                          );
                          return genderCfg
                            ? (language === 'ar' ? genderCfg.nameAr : (genderCfg.nameEn || genderCfg.nameAr))
                            : t('الفئة المستهدفة', 'Gender');
                        })()}
                  </button>
                </>
              )}

              {currentStep === 3 && !isKidsCategory && !isGlassesBrandSlug && !isLensBrandSlug && !isLensSubcategorySlug && (
                <>
                  {language === 'ar' ? (
                    <ChevronLeft className="w-3 h-3 text-slate-300" />
                  ) : (
                    <ChevronRight className="w-3 h-3 text-slate-300" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleStepBack(2)}
                    className="hover:text-slate-900 transition-colors font-medium text-slate-600 cursor-pointer"
                  >
                    {isLensesCategory
                      ? getBrandName(parsedLensBrand, language)
                      : getBrandName(parsedGlassesBrand, language)}
                  </button>
                </>
              )}

              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => handleStepBack(1)}
                  className="ms-auto inline-flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>{t('إعادة البدء', 'Start Over')}</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 2. Filter Selector Section */}
        {!isTerminalStep && (
          <div className="max-w-5xl mx-auto px-2 sm:px-4 text-center my-3 sm:my-6">
            {isLensesCategory ? (
              <>
                {/* CASE A: Contact Lens Brand Page (e.g. /diva, /linas, /acuvue) */}
                {isLensBrandSlug ? (
                  <>
                    {/* Step 1: تسوق حسب التصنيف (Shop by Category: عدسات ملونة / عدسات طبية) */}
                    {currentStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب التصنيف', 'Shop by Category')}
                        </h1>

                        {availableLensTypeOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`lens-brand-type-${primarySlug}`}>
                            {availableLensTypeOptions.map((opt) => {
                              const isSelected = parsedLensType === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensType(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {optConfig?.iconImage ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={optConfig.iconImage}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {opt.badge}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر خيارات حالياً', 'No options available')}</p>
                        )}
                      </div>
                    )}

                    {/* Step 2: تسوق حسب مدة الاستخدام (Shop by Duration) */}
                    {currentStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب مدة الاستخدام', 'Shop by Duration')}
                        </h1>

                        {availableLensDurationOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`lens-brand-duration-${primarySlug}-${parsedLensType}`}>
                            {availableLensDurationOptions.map((opt) => {
                              const isSelected = selectedDuration === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensDuration(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  <span
                                    className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-slate-900 text-white shadow-3xs'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {opt.badge}
                                  </span>
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر خيارات مدة مطابقة', 'No duration options available')}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : isLensSubcategorySlug ? (
                  /* CASE B: Contact Lens Subcategory Page (e.g. /colored-lenses, /color-contact-lenses, /medical-lenses) */
                  <>
                    {/* Step 1: تسوق حسب الماركة (Shop by Brand) */}
                    {currentStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب الماركة', 'Shop by Brand')}
                        </h1>

                        {availableLensBrandOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`lens-subcat-brand-${primarySlug}`}>
                            {availableLensBrandOptions.map((opt) => {
                              const isSelected = parsedLensBrand === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              const img = optConfig?.iconImage;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensBrand(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {img ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={img}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {opt.badge}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر ماركات حالياً', 'No brands available')}</p>
                        )}
                      </div>
                    )}

                    {/* Step 2: تسوق حسب مدة الاستخدام (Shop by Duration) */}
                    {currentStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب مدة الاستخدام', 'Shop by Duration')}
                        </h1>

                        {availableLensDurationOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`lens-subcat-duration-${primarySlug}-${parsedLensBrand}`}>
                            {availableLensDurationOptions.map((opt) => {
                              const isSelected = selectedDuration === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensDuration(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  <span
                                    className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-slate-900 text-white shadow-3xs'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {opt.badge}
                                  </span>
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر خيارات مدة مطابقة', 'No duration options available')}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  /* CASE C: Standard Contact Lenses Flow (e.g. /contact-lenses) */
                  <>
                    {/* Lenses STEP 1 */}
                    {currentStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب نوع العدسة', 'Shop by Lens Type')}
                        </h1>

                        {availableLensTypeOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger="lens-type">
                            {availableLensTypeOptions.map((opt) => {
                              const isSelected = parsedLensType === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensType(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {optConfig?.iconImage ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={optConfig.iconImage}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {opt.badge}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر خيارات حالياً', 'No options available')}</p>
                        )}
                      </div>
                    )}

                    {/* Lenses STEP 2 */}
                    {currentStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('ماركات العدسات', 'Lens Brands')}
                        </h1>

                        {availableLensBrandOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`lens-brand-${parsedLensType}`}>
                            {availableLensBrandOptions.map((opt) => {
                              const isSelected = parsedLensBrand === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              const img = optConfig?.iconImage;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensBrand(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {img ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={img}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-700'
                                      }`}
                                    >
                                      {opt.badge}
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر ماركات حالياً', 'No brands available')}</p>
                        )}
                      </div>
                    )}

                    {/* Lenses STEP 3 */}
                    {currentStep === 3 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب مدة الاستخدام', 'Shop by Duration')}
                        </h1>

                        {availableLensDurationOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`lens-duration-${parsedLensBrand}`}>
                            {availableLensDurationOptions.map((opt) => {
                              const isSelected = selectedDuration === opt.id;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectLensDuration(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  <span
                                    className={`h-full aspect-square rounded-full text-xs font-bold font-kufi flex items-center justify-center shrink-0 transition-colors ${
                                      isSelected
                                        ? 'bg-slate-900 text-white shadow-3xs'
                                        : 'bg-slate-100 text-slate-700'
                                    }`}
                                  >
                                    {opt.badge}
                                  </span>
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر خيارات مدة مطابقة', 'No duration options available')}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              /* Glasses Flow */
              <>
                {/* CASE A: Glasses Brand Page (e.g. /yuva, /ando, /rayban-glasses) */}
                {isGlassesBrandSlug ? (
                  <>
                    {/* Step 1: تسوق حسب القسم الرئيسي (Shop by Main Department) */}
                    {currentStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب القسم الرئيسي', 'Shop by Main Department')}
                        </h1>

                        {availableGlassesTypeOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`brand-category-${primarySlug}`}>
                            {availableGlassesTypeOptions.map((opt) => {
                              const isSelected = parsedGlassesTypeCategory === opt.id;
                              const optConfig =
                                getCategoryConfig(opt.id) ||
                                getCategoryConfig(opt.labelEn) ||
                                getCategoryConfig(opt.labelAr);
                              const img = opt.iconImage || optConfig?.iconImage;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectGlassesCategoryForBrand(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {img ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={img}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full flex items-center justify-center shrink-0 transition-colors p-1 ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      <GlassesMiniIcon className={isSelected ? 'text-white' : 'text-slate-600'} />
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر أقسام مطابقة حالياً', 'No departments available')}</p>
                        )}
                      </div>
                    )}

                    {/* Step 2: تسوق حسب شكل الإطار (Shop by Frame Shape) */}
                    {currentStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب شكل الإطار', 'Shop by Frame Shape')}
                        </h1>

                        {availableFrameShapeOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`brand-shape-${primarySlug}-${parsedGlassesTypeCategory}`}>
                            {availableFrameShapeOptions.map((opt) => {
                              const isSelected = selectedFrameShape === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectFrameShape(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {optConfig?.iconImage ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={optConfig.iconImage}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full flex items-center justify-center shrink-0 transition-colors p-1 ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      <FrameShapeIcon
                                        shapeId={opt.id}
                                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                                          isSelected ? 'text-white' : 'text-slate-600'
                                        }`}
                                      />
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر أشكال إطارات مطابقة', 'No frame shapes available')}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : isKidsCategory ? (
                  <>
                    {/* Kids STEP 1: Brand (تسوق حسب الماركة) */}
                    {currentStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب الماركة', 'Shop by Brand')}
                        </h1>

                        {availableGlassesBrandOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`glasses-brand-${parsedGender}`}>
                            {availableGlassesBrandOptions.map((opt) => {
                              const isSelected = parsedGlassesBrand === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              const img = optConfig?.iconImage || opt.avatar;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectGlassesBrand(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0">
                                    <Image
                                      src={img}
                                      alt={opt.labelAr}
                                      fill
                                      sizes="34px"
                                      referrerPolicy="no-referrer"
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر ماركات حالياً', 'No brands available')}</p>
                        )}
                      </div>
                    )}

                    {/* Kids STEP 2: Frame Shape (تسوق حسب شكل الإطار) */}
                    {currentStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب شكل الإطار', 'Shop by Frame Shape')}
                        </h1>

                        {availableFrameShapeOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`glasses-shape-${parsedGlassesBrand}-${parsedGlassesTypeCategory}`}>
                            {availableFrameShapeOptions.map((opt) => {
                              const isSelected = selectedFrameShape === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectFrameShape(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {optConfig?.iconImage ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={optConfig.iconImage}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full flex items-center justify-center shrink-0 transition-colors p-1 ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      <FrameShapeIcon
                                        shapeId={opt.id}
                                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                                          isSelected ? 'text-white' : 'text-slate-600'
                                        }`}
                                      />
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر أشكال إطارات مطابقة', 'No frame shapes available')}</p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Glasses STEP 1: Department (if Gender Direct URL) OR Target Audience (Gender) */}
                    {currentStep === 1 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {isGenderSlug
                            ? t('تسوق حسب القسم', 'Shop by Department')
                            : t('من تتسوق له؟', 'Who are you shopping for?')}
                        </h1>

                        {isGenderSlug ? (
                          availableGlassesTypeOptions.length > 0 ? (
                            <DraggableFilterRow resetTrigger={`gender-category-${primarySlug}`}>
                              {availableGlassesTypeOptions.map((opt) => {
                                const isSelected = parsedGlassesTypeCategory === opt.id;
                                const optConfig =
                                  getCategoryConfig(opt.id) ||
                                  getCategoryConfig(opt.labelEn) ||
                                  getCategoryConfig(opt.labelAr);
                                const img = opt.iconImage || optConfig?.iconImage;
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectGlassesCategoryForGender(opt.id)}
                                    className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                      isSelected
                                        ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                        : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                    }`}
                                  >
                                    {img ? (
                                      <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        <Image
                                          src={img}
                                          alt={opt.labelAr}
                                          fill
                                          sizes="34px"
                                          referrerPolicy="no-referrer"
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <span
                                        className={`h-full aspect-square rounded-full flex items-center justify-center shrink-0 transition-colors p-1 ${
                                          isSelected
                                            ? 'bg-slate-900 text-white shadow-3xs'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        <GlassesMiniIcon className={isSelected ? 'text-white' : 'text-slate-600'} />
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                      {language === 'ar' ? opt.labelAr : opt.labelEn}
                                    </span>
                                  </button>
                                );
                              })}
                            </DraggableFilterRow>
                          ) : (
                            <p className="text-xs text-slate-400">{t('لا تتوفر أقسام مطابقة حالياً', 'No departments available')}</p>
                          )
                        ) : (
                          availableGenderOptions.length > 0 ? (
                            <DraggableFilterRow resetTrigger="glasses-gender">
                              {availableGenderOptions.map((opt: any) => {
                                const targetId = opt.id;
                                const isSelected = parsedGender === targetId;
                                const optConfig = getCategoryConfig(targetId) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                                return (
                                  <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => handleSelectGender(targetId)}
                                    className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                      isSelected
                                        ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                        : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                    }`}
                                  >
                                    {optConfig?.iconImage ? (
                                      <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                        <Image
                                          src={optConfig.iconImage}
                                          alt={opt.labelAr}
                                          fill
                                          sizes="34px"
                                          referrerPolicy="no-referrer"
                                          className="object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <span
                                        className={`h-full aspect-square rounded-full flex items-center justify-center shrink-0 transition-colors p-1 ${
                                          isSelected
                                            ? 'bg-slate-900 text-white shadow-3xs'
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                      >
                                        <GenderIcon
                                          genderId={targetId}
                                          className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                                            isSelected ? 'text-white' : 'text-slate-600'
                                          }`}
                                        />
                                      </span>
                                    )}
                                    <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                      {language === 'ar' ? opt.labelAr : opt.labelEn}
                                    </span>
                                  </button>
                                );
                              })}
                            </DraggableFilterRow>
                          ) : (
                            <p className="text-xs text-slate-400">{t('لا تتوفر فئات حالياً', 'No categories available')}</p>
                          )
                        )}
                      </div>
                    )}

                    {/* Glasses STEP 2: Brand */}
                    {currentStep === 2 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب الماركة', 'Shop by Brand')}
                        </h1>

                        {availableGlassesBrandOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`glasses-brand-${parsedGender}`}>
                            {availableGlassesBrandOptions.map((opt) => {
                              const isSelected = parsedGlassesBrand === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              const img = optConfig?.iconImage || opt.avatar;
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectGlassesBrand(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0">
                                    <Image
                                      src={img}
                                      alt={opt.labelAr}
                                      fill
                                      sizes="34px"
                                      referrerPolicy="no-referrer"
                                      className="object-cover"
                                    />
                                  </div>
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر ماركات حالياً', 'No brands available')}</p>
                        )}
                      </div>
                    )}

                    {/* Glasses STEP 3: Frame Shape */}
                    {currentStep === 3 && (
                      <div className="space-y-3 sm:space-y-4 animate-fadeIn">
                        <h1 className="text-base sm:text-xl font-bold font-kufi text-slate-900 tracking-tight">
                          {t('تسوق حسب شكل الإطار', 'Shop by Frame Shape')}
                        </h1>

                        {availableFrameShapeOptions.length > 0 ? (
                          <DraggableFilterRow resetTrigger={`glasses-shape-${parsedGlassesBrand}-${parsedGlassesTypeCategory}`}>
                            {availableFrameShapeOptions.map((opt) => {
                              const isSelected = selectedFrameShape === opt.id;
                              const optConfig = getCategoryConfig(opt.id) || getCategoryConfig(opt.labelEn) || getCategoryConfig(opt.labelAr);
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => handleSelectFrameShape(opt.id)}
                                  className={`h-8 sm:h-8.5 rounded-full border transition-all cursor-pointer flex items-center gap-2 shadow-3xs shrink-0 select-none bg-white ps-0 pe-3.5 sm:pe-4 py-0 overflow-hidden ${
                                    isSelected
                                      ? 'border-slate-900 ring-1 ring-slate-900 text-slate-950 font-bold bg-slate-50/90'
                                      : 'border-slate-200/90 text-slate-700 hover:border-slate-400 hover:bg-slate-50/80'
                                  }`}
                                >
                                  {optConfig?.iconImage ? (
                                    <div className="relative h-full aspect-square rounded-full overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                                      <Image
                                        src={optConfig.iconImage}
                                        alt={opt.labelAr}
                                        fill
                                        sizes="34px"
                                        referrerPolicy="no-referrer"
                                        className="object-cover"
                                      />
                                    </div>
                                  ) : (
                                    <span
                                      className={`h-full aspect-square rounded-full flex items-center justify-center shrink-0 transition-colors p-1 ${
                                        isSelected
                                          ? 'bg-slate-900 text-white shadow-3xs'
                                          : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      <FrameShapeIcon
                                        shapeId={opt.id}
                                        className={`w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                                          isSelected ? 'text-white' : 'text-slate-600'
                                        }`}
                                      />
                                    </span>
                                  )}
                                  <span className="text-xs sm:text-[13px] font-semibold font-kufi whitespace-nowrap">
                                    {language === 'ar' ? opt.labelAr : opt.labelEn}
                                  </span>
                                </button>
                              );
                            })}
                          </DraggableFilterRow>
                        ) : (
                          <p className="text-xs text-slate-400">{t('لا تتوفر أشكال إطارات مطابقة', 'No frame shapes available')}</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        )}

        {/* Products Grid Area */}
        <div className="max-w-7xl mx-auto px-4 pt-4 sm:pt-6">
          {/* Products Count and Sort Bar */}
          <div className="flex items-center justify-between gap-3 mb-4 sm:mb-6 pb-3 border-b border-slate-100 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-800 font-kufi">
                {language === 'ar' ? 'المنتجات المعروضة' : 'Products'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-mono font-medium">
                {displayedProducts.length}
              </span>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 ms-auto">
              <div className="relative flex items-center bg-white border border-slate-200/90 hover:border-slate-300 rounded-xl px-2.5 sm:px-3 py-1.5 text-xs text-slate-700 shadow-3xs transition-colors">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 me-1.5 shrink-0" />
                <label htmlFor="category-sort-select" className="sr-only">
                  {t('ترتيب حسب', 'Sort by')}
                </label>
                <select
                  id="category-sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent border-none outline-none font-medium cursor-pointer text-xs text-slate-800 font-kufi pe-1"
                >
                  <option value="featured">{t('المقترح / الأكثر طلباً', 'Featured / Best Seller')}</option>
                  <option value="price-asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
                  <option value="price-desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
                  <option value="newest">{t('الأحدث وصولاً', 'Newest Arrivals')}</option>
                  <option value="rating">{t('الأعلى تقييماً', 'Highest Rated')}</option>
                </select>
              </div>
            </div>
          </div>

          {displayedProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6">
              {displayedProducts.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 4} isCategoryPage={true} />
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-10 text-center border border-slate-200/80 space-y-3 max-w-md mx-auto my-8">
              <h3 className="text-sm font-bold text-slate-900 font-kufi">
                {t('لا توجد منتجات مطابقة لهذا الاختيار', 'No products match this selection')}
              </h3>
              <p className="text-xs text-slate-500">
                {t('يرجى تجربة خيار آخر أو إعادة بدء التصفية.', 'Try selecting another option.')}
              </p>
              <button
                type="button"
                onClick={() => handleStepBack(1)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {t('عرض جميع المنتجات', 'View All Products')}
              </button>
            </div>
          )}

          {/* Dynamic Bottom Description Section */}
          {activeCategoryConfig && (activeCategoryConfig.bottomDescriptionAr || activeCategoryConfig.bottomDescriptionEn) && (
            <div className="max-w-4xl mx-auto mt-10 mb-6 p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-2xs space-y-2 text-slate-700">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-4 w-1 bg-[#A58454] rounded-full" />
                <h3 className="text-xs sm:text-sm font-bold font-kufi text-slate-900">
                  {language === 'ar' ? (activeCategoryConfig.heroTitleAr || activeCategoryConfig.nameAr) : (activeCategoryConfig.heroTitleEn || activeCategoryConfig.nameEn)}
                </h3>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed text-slate-600 font-sans whitespace-pre-line">
                {language === 'ar' ? activeCategoryConfig.bottomDescriptionAr : activeCategoryConfig.bottomDescriptionEn}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
