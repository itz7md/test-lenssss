'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { ProductColorVariant } from '@/types';
import { Price } from '@/components/Price';
import { SaudiRiyal } from '@/components/SaudiRiyal';
import { PaymentIcons } from '@/components/PaymentIcons';
import { ProductCard } from '@/components/ProductCard';
import { SeoHead } from '@/components/SeoHead';
import { getBrandName } from '@/lib/brands';
import Link from 'next/link';
import Image from 'next/image';
import {
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Heart,
  ShoppingBag,
  Share2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileText,
  Info,
  Home,
  MessageCircle,
  Sparkles,
  Award,
  Layers,
  Calendar,
  Eye,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function ProductView({ slug = '' }: { slug: string }) {
  const normalizedSlug = slug?.toLowerCase();

  const {
    products,
    language,
    t,
    addToCart,
    openLensWizard,
    isInWishlist,
    toggleWishlist,
    setIsVipModalOpen,
    country,
    currentCountryInfo,
  } = useApp();

  // Find product by slug or id
  const product = useMemo(() => {
    return (
      products.find((p) => p.slug === normalizedSlug || p.id === normalizedSlug) ||
      products[0]
    );
  }, [products, normalizedSlug]);

  const [selectedColor, setSelectedColor] = useState<ProductColorVariant>(
    product?.colors?.[0] || {
      id: 'default',
      nameAr: 'افتراضي',
      nameEn: 'Default',
      hex: '#0F172A',
      image: '/images/prod_acetate.webp',
      stock: 10,
    }
  );

  const [activeImageOverride, setActiveImageOverride] = useState<string | null>(null);

  const [rxOption, setRxOption] = useState<'plano' | 'prescription'>('plano');
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    desc: true,
    specs: false,
    shipping: false,
    warranty: false,
    reviews: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };
  const [isCopied, setIsCopied] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Review submission state
  const [newReviewerName, setNewReviewerName] = useState('');
  const [newReviewText, setNewReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Contact Lenses Selections
  const [clPackSizeId, setClPackSizeId] = useState<string | null>(null);
  const [clPowerMode, setClPowerMode] = useState<'same' | 'separate'>('same');
  const [clPowerRight, setClPowerRight] = useState<string>('0.00');
  const [clPowerLeft, setClPowerLeft] = useState<string>('0.00');
  const [clCylRight, setClCylRight] = useState<string>('');
  const [clCylLeft, setClCylLeft] = useState<string>('');
  const [clAxisRight, setClAxisRight] = useState<string>('');
  const [clAxisLeft, setClAxisLeft] = useState<string>('');
  const [clQtyBoth, setClQtyBoth] = useState<number>(1);
  const [clQtyRight, setClQtyRight] = useState<number>(1);
  const [clQtyLeft, setClQtyLeft] = useState<number>(1);
  const packScrollRef = React.useRef<HTMLDivElement>(null);
  const relatedScrollRef = React.useRef<HTMLDivElement>(null);

  // Mouse drag-to-scroll horizontal handler for PC
  useEffect(() => {
    const el = packScrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
    };
    const onMouseUp = () => {
      isDown = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, [product?.packSizes]);

  // Mouse drag-to-scroll horizontal handler for PC on "You May Also Like" carousel
  useEffect(() => {
    const el = relatedScrollRef.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select')) return;
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };
    const onMouseLeave = () => {
      isDown = false;
    };
    const onMouseUp = () => {
      isDown = false;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp);
    el.addEventListener('mousemove', onMouseMove);

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp);
      el.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  // Derive pack size during render to avoid synchronous useEffect state updates
  const clPackSize = useMemo(() => {
    if (!product || !product.packSizes || product.packSizes.length === 0) return null;
    return product.packSizes.find(pk => pk.id === clPackSizeId) || product.packSizes[0];
  }, [product, clPackSizeId]);

  // Dynamic price calculation with active power/astigmatism addons
  const displayedPrice = useMemo(() => {
    if (!product) return 0;
    let price = product.basePriceSAR;
    if (product.category === 'contact-lenses') {
      if (clPackSize) {
        price += clPackSize.priceSAR;
      }
      const hasPowerRight = clPowerRight && clPowerRight !== '0.00';
      const hasPowerLeft = clPowerMode === 'separate' ? (clPowerLeft && clPowerLeft !== '0.00') : hasPowerRight;
      if ((hasPowerRight || hasPowerLeft) && product.powerPriceAddonSAR) {
        price += product.powerPriceAddonSAR;
      }
      const hasCylRight = clCylRight && clCylRight !== '';
      const hasCylLeft = clPowerMode === 'separate' ? (clCylLeft && clCylLeft !== '') : hasCylRight;
      if ((hasCylRight || hasCylLeft) && product.astigmatismPriceAddonSAR) {
        price += product.astigmatismPriceAddonSAR;
      }

      if (clPowerMode === 'separate') {
        return price * (clQtyRight + clQtyLeft);
      }
      return price * clQtyBoth;
    }
    return price;
  }, [product, clPackSize, clPowerRight, clPowerLeft, clCylRight, clCylLeft, clPowerMode, clQtyBoth, clQtyRight, clQtyLeft]);

  // Local currency price calculation with custom GCC options and rates
  const displayedPriceLocal = useMemo(() => {
    if (!product) return 0;
    
    let basePrice = product.basePriceSAR;
    if (country !== 'SA' && product.customGccPrices?.[country] !== undefined) {
      basePrice = product.customGccPrices[country]!;
    } else if (country !== 'SA') {
      const rate = currentCountryInfo.rateToSAR || 1;
      basePrice = basePrice * rate;
    }

    let price = basePrice;

    if (product.category === 'contact-lenses') {
      if (clPackSize) {
        let packPrice = clPackSize.priceSAR;
        if (country !== 'SA' && clPackSize.customGccPrices?.[country] !== undefined) {
          packPrice = clPackSize.customGccPrices[country]!;
        } else if (country !== 'SA') {
          const rate = currentCountryInfo.rateToSAR || 1;
          packPrice = packPrice * rate;
        }
        price += packPrice;
      }

      const hasPowerRight = clPowerRight && clPowerRight !== '0.00';
      const hasPowerLeft = clPowerMode === 'separate' ? (clPowerLeft && clPowerLeft !== '0.00') : hasPowerRight;
      if ((hasPowerRight || hasPowerLeft) && product.powerPriceAddonSAR) {
        let powerAddon = product.powerPriceAddonSAR;
        if (country !== 'SA' && product.customPowerPriceAddonGccPrices?.[country] !== undefined) {
          powerAddon = product.customPowerPriceAddonGccPrices[country]!;
        } else if (country !== 'SA') {
          const rate = currentCountryInfo.rateToSAR || 1;
          powerAddon = powerAddon * rate;
        }
        price += powerAddon;
      }

      const hasCylRight = clCylRight && clCylRight !== '';
      const hasCylLeft = clPowerMode === 'separate' ? (clCylLeft && clCylLeft !== '') : hasCylRight;
      if ((hasCylRight || hasCylLeft) && product.astigmatismPriceAddonSAR) {
        let astigmatismAddon = product.astigmatismPriceAddonSAR;
        if (country !== 'SA' && product.customAstigmatismPriceAddonGccPrices?.[country] !== undefined) {
          astigmatismAddon = product.customAstigmatismPriceAddonGccPrices[country]!;
        } else if (country !== 'SA') {
          const rate = currentCountryInfo.rateToSAR || 1;
          astigmatismAddon = astigmatismAddon * rate;
        }
        price += astigmatismAddon;
      }

      if (clPowerMode === 'separate') {
        return price * (clQtyRight + clQtyLeft);
      }
      return price * clQtyBoth;
    }

    return price;
  }, [product, clPackSize, clPowerRight, clPowerLeft, clCylRight, clCylLeft, country, currentCountryInfo, clPowerMode, clQtyBoth, clQtyRight, clQtyLeft]);

  if (!product) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold font-kufi text-slate-900 mb-2">
          {t('المنتج غير موجود', 'Product Not Found')}
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          {t(
            'يرجى التحقق من الرابط أو استعراض تشكيلتنا الحصرية.',
            'Please check the URL or browse our collection.'
          )}
        </p>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
        >
          {t('العودة للمتجر', 'Return to Store')}
        </Link>
      </div>
    );
  }

  const isFavorited = isInWishlist(product.id);

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 8);

  // Discount percentage calculation (Removed as requested)
  const hasDiscount = false;
  const discountPercent = 0;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const handleAddToCart = () => {
    if (rxOption === 'prescription' && product.category === 'eyeglasses') {
      openLensWizard(product, selectedColor);
    } else if (product.category === 'contact-lenses') {
      const clQuantity = clPowerMode === 'separate' ? (clQtyRight + clQtyLeft) : clQtyBoth;
      addToCart(
        product,
        selectedColor,
        undefined,
        clQuantity,
        clPackSize || undefined,
        clPowerRight,
        clPowerLeft,
        clCylRight,
        clCylLeft,
        clAxisRight,
        clAxisLeft,
        clPowerMode === 'separate'
      );
      setIsAddedFeedback(true);
      setTimeout(() => setIsAddedFeedback(false), 2500);
    } else {
      addToCart(product, selectedColor, undefined, 1);
      setIsAddedFeedback(true);
      setTimeout(() => setIsAddedFeedback(false), 2500);
    }
  };

  const handleBuyNow = () => {
    if (rxOption === 'prescription' && product.category === 'eyeglasses') {
      openLensWizard(product, selectedColor);
    } else if (product.category === 'contact-lenses') {
      const clQuantity = clPowerMode === 'separate' ? (clQtyRight + clQtyLeft) : clQtyBoth;
      addToCart(
        product,
        selectedColor,
        undefined,
        clQuantity,
        clPackSize || undefined,
        clPowerRight,
        clPowerLeft,
        clCylRight,
        clCylLeft,
        clAxisRight,
        clAxisLeft,
        clPowerMode === 'separate'
      );
      const cartTrigger = document.querySelector('[data-testid="cart-trigger"]') as HTMLElement;
      if (cartTrigger) cartTrigger.click();
    } else {
      addToCart(product, selectedColor, undefined, 1);
      const cartTrigger = document.querySelector('[data-testid="cart-trigger"]') as HTMLElement;
      if (cartTrigger) cartTrigger.click();
    }
  };

  const handleWhatsAppInquiry = () => {
    const text = `مرحباً متجر لِـنس كود، أود الاستفسار عن إطار ${product.nameAr} (${product.brand}) بسعر ${product.basePriceSAR} ريال.`;
    const url = `https://wa.me/966556359090?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white min-h-screen">
      <SeoHead
        title={
          language === 'ar'
            ? product.seoTitleAr || product.nameAr
            : product.seoTitleEn || product.nameEn
        }
        description={
          language === 'ar'
            ? product.seoDescAr || product.descriptionAr
            : product.seoDescEn || product.descriptionEn
        }
        keywords={product.seoKeywords}
      />

      {/* 1. Breadcrumbs */}
      <div className="bg-white border-b border-slate-200/80 py-2.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 text-xs text-slate-500 font-sans">
          <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>{t('الرئيسية', 'Home')}</span>
          </Link>
          {language === 'ar' ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
          <Link
            href={`/${product.category}`}
            className="hover:text-slate-900 transition-colors capitalize"
          >
            {product.category === 'eyeglasses'
              ? t('نظارات طبية', 'Eyeglasses')
              : product.category === 'sunglasses'
              ? t('نظارات شمسية', 'Sunglasses')
              : product.category === 'contact-lenses'
              ? t('عدسات لاصقة', 'Contact Lenses')
              : product.category}
          </Link>
          {language === 'ar' ? (
            <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="font-semibold text-slate-900 truncate max-w-xs">
            {language === 'ar' ? product.nameAr : product.nameEn}
          </span>
        </div>
      </div>

      {/* 2. Main Product Showcase */}
      <div className="max-w-7xl mx-auto px-2.5 sm:px-4 py-4 sm:py-10 pb-36 sm:pb-12">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3.5 sm:p-10 border border-slate-200/80 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 lg:gap-12">
          {/* Column A: Gallery & Visuals (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="relative aspect-square w-full bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 p-3 sm:p-6 flex items-center justify-center overflow-hidden group shadow-3xs">
              {/* Badges */}
              <div className="absolute top-4 start-4 z-10 flex flex-col gap-1.5">
                <span className="px-2.5 py-1 rounded-full bg-slate-900 text-white font-bold text-xs tracking-wider uppercase">
                  {getBrandName(product.brand, language, true)}
                </span>
                {hasDiscount && (
                  <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-bold text-[10px] tracking-wide">
                    {t(`خصم ${discountPercent}%`, `${discountPercent}% OFF`)}
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-2.5 py-1 rounded-full bg-amber-500 text-slate-950 font-bold text-[10px]">
                    {t('الأكثر مبيعاً', 'Best Seller')}
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="absolute top-4 end-4 z-10 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-600 hover:text-slate-900 flex items-center justify-center shadow-xs border border-slate-200/60 transition-transform hover:scale-105 cursor-pointer"
                  title={t('مشاركة الرابط', 'Share Link')}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => toggleWishlist(product.id)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center shadow-xs border transition-transform hover:scale-105 cursor-pointer ${
                    isFavorited
                      ? 'bg-rose-50 border-rose-200 text-rose-600'
                      : 'bg-white/90 border-slate-200/60 text-slate-400 hover:text-rose-500'
                  }`}
                  title={isFavorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-600' : ''}`} />
                </button>
              </div>

              {/* Main Image */}
              <div className="relative w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                <Image
                  src={activeImageOverride || selectedColor.image || '/images/prod_acetate.webp'}
                  alt={product.nameAr}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                  referrerPolicy="no-referrer"
                  className="object-contain p-4"
                />
              </div>
            </div>

            {/* Extra image thumbnails (angles / multiple views) */}
            {((selectedColor.images && selectedColor.images.length > 0) || (selectedColor.id === 'default' && product.defaultImages && product.defaultImages.length > 0)) && (
              <div className="flex items-center gap-2 overflow-x-auto py-1.5 justify-center">
                {/* Include the main image of the color as the first option */}
                <button
                  type="button"
                  onClick={() => setActiveImageOverride(null)}
                  className={`relative w-12 h-12 rounded-lg bg-white border transition-all p-0.5 cursor-pointer ${
                    activeImageOverride === null
                      ? 'border-[#A58454] ring-2 ring-[#A58454]/20'
                      : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={selectedColor.image || '/images/prod_acetate.webp'}
                      alt="Main View"
                      fill
                      sizes="48px"
                      referrerPolicy="no-referrer"
                      className="object-contain p-0.5"
                    />
                  </div>
                </button>

                {/* Additional color images */}
                {selectedColor.images && selectedColor.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageOverride(img.url)}
                    className={`relative w-12 h-12 rounded-lg bg-white border transition-all p-0.5 cursor-pointer ${
                      activeImageOverride === img.url
                        ? 'border-[#A58454] ring-2 ring-[#A58454]/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={img.url}
                        alt={img.alt || 'angle view'}
                        fill
                        sizes="48px"
                        referrerPolicy="no-referrer"
                        className="object-contain p-0.5"
                      />
                    </div>
                  </button>
                ))}

                {/* Default product fallback images (if no colors) */}
                {selectedColor.id === 'default' && product.defaultImages && product.defaultImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageOverride(img.url)}
                    className={`relative w-12 h-12 rounded-lg bg-white border transition-all p-0.5 cursor-pointer ${
                      activeImageOverride === img.url
                        ? 'border-[#A58454] ring-2 ring-[#A58454]/20'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={img.url}
                        alt={img.alt || 'angle view'}
                        fill
                        sizes="48px"
                        referrerPolicy="no-referrer"
                        className="object-contain p-0.5"
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Color Variant Thumbnails */}
            {product.colors && product.colors.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {product.colors.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => { setSelectedColor(c); setActiveImageOverride(null); }}
                    className={`relative w-16 h-16 rounded-xl bg-white border-2 overflow-hidden shrink-0 transition-all p-1 cursor-pointer ${
                      selectedColor.id === c.id
                        ? 'border-[#A58454] shadow-md scale-105'
                        : 'border-slate-200 hover:border-slate-300 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={c.image}
                      alt={c.nameAr}
                      fill
                      sizes="64px"
                      referrerPolicy="no-referrer"
                      className="object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Column B: Product Details & Purchase Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Brand, Category & Gender */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#8C6D3F] uppercase tracking-wider font-mono">
                    {getBrandName(product.brand, language)} · {language === 'ar' ? (product.categoryAr || product.subCategoryAr || product.category) : (product.categoryEn || product.subCategoryEn || product.category)}
                  </span>
                  {product.gender && product.category !== 'contact-lenses' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-[#8C6D3F] border border-amber-200/80 shadow-3xs">
                      {language === 'ar' 
                        ? (product.genderAr || (product.gender === 'women' ? 'نساء' : product.gender === 'men' ? 'رجال' : product.gender === 'kids' ? 'أطفال' : 'للجنسين'))
                        : (product.genderEn || (product.gender === 'women' ? 'Women' : product.gender === 'men' ? 'Men' : product.gender === 'kids' ? 'Kids' : 'Unisex'))
                      }
                    </span>
                  )}
                  {product.frameShape && product.category !== 'contact-lenses' && product.frameShape !== 'none' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200/80 shadow-3xs">
                      {language === 'ar'
                        ? (product.frameShapeAr || product.specs.frameShape || product.frameShape)
                        : (product.frameShapeEn || product.frameShape)
                      }
                    </span>
                  )}
                </div>
                <span className="text-xs text-slate-400 font-mono">SKU: {product.sku}</span>
              </div>

              {/* Product Name & Short Description */}
              <div>
                <h1 className="text-xl sm:text-3xl font-bold font-kufi text-slate-900 tracking-tight">
                  {language === 'ar' ? product.nameAr : product.nameEn}
                </h1>
                {(product.shortDescriptionAr || product.shortDescriptionEn) && (
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    {language === 'ar'
                      ? product.shortDescriptionAr || product.descriptionAr
                      : product.shortDescriptionEn || product.descriptionEn}
                  </p>
                )}
              </div>

              {/* Rating & Reviews */}
              <div className="flex items-center gap-2 text-xs">
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating)
                          ? 'fill-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-slate-800">{product.rating}</span>
                <span className="text-slate-400">
                  ({product.reviewsCount} {t('تقييم موثق', 'Verified Reviews')})
                </span>
              </div>

              {/* Price Block */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex items-baseline gap-3">
                  <Price
                    amountSAR={displayedPrice}
                    customAmount={country === 'SA' ? undefined : displayedPriceLocal}
                    size="lg"
                    className="font-bold font-kufi text-slate-900 text-2xl sm:text-3xl"
                  />
                </div>

                {/* Tabby & Tamara Installments Badge */}
                <div className="pt-2 border-t border-slate-200/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <PaymentIcons.Tabby className="h-5 w-auto" />
                    <span>
                      {t('4 دفعات بقيمة', '4 payments of')}{' '}
                      <strong>
                        {(displayedPriceLocal / 4).toFixed(1)}{' '}
                        {language === 'ar' ? currentCountryInfo.currencyAr : currentCountryInfo.currencyEn}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200">
                    <PaymentIcons.Tamara className="h-5 w-auto" />
                    <span>
                      {t('أو قسّمها على 4 بدون فوائد', 'Split in 4, 0% interest')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {t('اللون المختار:', 'Selected Color:')}{' '}
                    <span className="font-normal text-[#8C6D3F]">
                      {language === 'ar' ? selectedColor.nameAr : selectedColor.nameEn}
                    </span>
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {t(
                      `متوفر في المخزون (${selectedColor.stock} قطعة)`,
                      `In Stock (${selectedColor.stock} units)`
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  {product.colors.map((clr) => (
                    <button
                      key={clr.id}
                      type="button"
                      onClick={() => { setSelectedColor(clr); setActiveImageOverride(null); }}
                      style={{ backgroundColor: clr.hex }}
                      className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer relative flex items-center justify-center ${
                        selectedColor.id === clr.id
                          ? 'border-[#A58454] scale-110 shadow-md ring-2 ring-[#A58454]/40'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                      title={language === 'ar' ? clr.nameAr : clr.nameEn}
                    >
                      {selectedColor.id === clr.id && (
                        <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Prescription vs Plano Choice (For Medical Frames) */}
              {product.category === 'eyeglasses' && (
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-800 block">
                    {t('نوع العدسات المطلوبة:', 'Prescription Option:')}
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setRxOption('plano')}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        rxOption === 'plano'
                          ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <strong className="block text-slate-900 text-xs">
                        {t('إطار فقط بدون مقاس', 'Frame Only (Plano)')}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {t('عدسات شفافة أولية جاهزة', 'Ready demo lenses')}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRxOption('prescription')}
                      className={`p-3 rounded-xl border text-start transition-all cursor-pointer ${
                        rxOption === 'prescription'
                          ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <strong className="block text-slate-900 text-xs text-[#8C6D3F]">
                        {t('تفصيل عدسات طبية مخصصة', 'Custom Prescription')}
                      </strong>
                      <span className="text-[10px] text-slate-500">
                        {t('أدخل مقاسك أو ارفع الكشف', 'Enter Rx or upload photo')}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Contact Lenses Specific Selection Form */}
              {product.category === 'contact-lenses' && (
                <div className="space-y-4 pt-4 border-t border-slate-200/60">
                  {/* Pack Size Selector (Horizontal single row, max 3 visible, scrollable if > 3, full price with SaudiRiyal) */}
                  {product.packSizes && product.packSizes.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                        <span>
                          {t('حجم العبوة', 'Pack Size')}
                          {clPackSize && (
                            <span className="text-[#8C6D3F] font-semibold ms-1">
                              - {language === 'ar' ? clPackSize.labelAr : clPackSize.labelEn}
                            </span>
                          )}
                        </span>
                      </div>
                      
                      <div className="border border-slate-200/90 rounded-2xl p-1.5 sm:p-2 bg-slate-50/40">
                        <div
                          ref={packScrollRef}
                          className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5 px-0.5 select-none touch-pan-x cursor-grab active:cursor-grabbing"
                        >
                          {product.packSizes.map((pk) => {
                            const isSelected = clPackSize?.id === pk.id;
                            const fullPackPrice = (product.basePriceSAR || 0) + (pk.priceSAR || 0);
                            return (
                              <button
                                key={pk.id}
                                type="button"
                                onClick={() => setClPackSizeId(pk.id)}
                                className={`py-3 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                                  product.packSizes!.length <= 3
                                    ? 'flex-1 min-w-[90px]'
                                    : 'flex-none min-w-[31%] sm:min-w-[28%]'
                                } ${
                                  isSelected
                                    ? 'border-[#A58454] bg-[#FAF7F2] text-[#8C6D3F] shadow-xs ring-1 ring-[#A58454]/50 font-bold'
                                    : 'border-slate-200 hover:border-slate-300 bg-white text-slate-800'
                                }`}
                              >
                                <strong className="block text-xs truncate">
                                  {language === 'ar' ? pk.labelAr : pk.labelEn}
                                </strong>
                                <div className={`text-xs font-bold font-kufi flex items-center justify-center gap-1 mt-1 ${
                                  isSelected ? 'text-[#8C6D3F]' : 'text-slate-600'
                                }`}>
                                  <span>{fullPackPrice}</span>
                                  <SaudiRiyal className={`w-3 h-3 ${isSelected ? 'text-[#A58454]' : 'text-slate-500'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SPH Power Selectors (Matches Images 3, 4, 5, 6) */}
                  {product.hasPowerOption !== false && (
                    <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-slate-50/70 border border-slate-200/80">
                      {/* Section Title */}
                      <div className="text-center font-bold text-slate-900 text-xs sm:text-sm font-kufi">
                        {t('توزيع القوة للعدسات', 'Lens Power Distribution')}
                      </div>

                      {/* Mode Toggle Tabs: Same vs Separate */}
                      <div className="p-1 bg-slate-200/60 rounded-xl sm:rounded-2xl flex items-center gap-1.5 w-full max-w-md mx-auto select-none">
                        <button
                          type="button"
                          onClick={() => {
                            setClPowerMode('same');
                            setClPowerLeft(clPowerRight);
                          }}
                          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer font-kufi ${
                            clPowerMode === 'same'
                              ? 'bg-[#E5F4E8] text-[#1C4E2D] border border-[#BCDDC1] shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t('نفس القوة للعينين', 'Same for both eyes')}
                        </button>
                        <button
                          type="button"
                          onClick={() => setClPowerMode('separate')}
                          className={`flex-1 py-2 sm:py-2.5 px-2 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all text-center cursor-pointer font-kufi ${
                            clPowerMode === 'separate'
                              ? 'bg-[#E5F4E8] text-[#1C4E2D] border border-[#BCDDC1] shadow-3xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {t('قوتين مختلفتين', 'Different powers')}
                        </button>
                      </div>

                      {/* Same Power Layout: Image 3 (Desktop) & Image 5 (Mobile) */}
                      {clPowerMode === 'same' && (
                        <div className="pt-1.5 sm:pt-2">
                          <div className="flex items-end justify-between gap-2.5 sm:gap-3 flex-row">
                            {/* Dropdown with Label on Top (Right in RTL) */}
                            <div className="flex-1 min-w-0">
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-800 mb-1 sm:mb-1.5 text-start font-kufi">
                                {t('اختيار القوة (لكلا العينين)', 'Choose Power (Both Eyes)')}
                              </label>
                              <div className="relative">
                                <div className="w-full rounded-2xl border border-slate-200/90 bg-white px-3 sm:px-3.5 py-2 flex items-center justify-between text-xs cursor-pointer shadow-3xs hover:border-[#A58454]/60 transition-all h-11">
                                  <span className="font-bold text-slate-800 font-kufi text-xs truncate">
                                    {clPowerRight && clPowerRight !== '0.00' ? (
                                      <span className="font-bold font-mono text-slate-950 text-xs sm:text-sm" dir="ltr">
                                        {clPowerRight}
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 font-semibold font-kufi text-xs">
                                        {t('اختر القوة...', 'Choose Power...')}
                                      </span>
                                    )}
                                  </span>
                                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                    <ChevronDown className="w-4 h-4" />
                                  </div>
                                </div>
                                <select
                                  value={clPowerRight}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setClPowerRight(val);
                                    setClPowerLeft(val);
                                  }}
                                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                >
                                  <option value="0.00">{t('اختر القوة... (0.00 زينة)', 'Choose Power... (0.00 Plano)')}</option>
                                  {Array.from({ length: 40 }).map((_, i) => {
                                    const val = -((i + 1) * 0.25);
                                    const formatted = val.toFixed(2);
                                    return <option key={`neg-b-${i}`} value={formatted}>{formatted}</option>;
                                  })}
                                  {Array.from({ length: 24 }).map((_, i) => {
                                    const val = ((i + 1) * 0.25);
                                    const formatted = `+${val.toFixed(2)}`;
                                    return <option key={`pos-b-${i}`} value={formatted}>{formatted}</option>;
                                  })}
                                </select>
                              </div>
                            </div>

                            {/* Quantity Box with Pack Badge on Top (Left in RTL) */}
                            <div className="shrink-0 flex flex-col items-center">
                              <span className="mb-1 sm:mb-1.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-slate-200/70 text-slate-700 text-[10px] font-bold font-kufi">
                                {clPackSize ? (language === 'ar' ? clPackSize.labelAr : clPackSize.labelEn) : '90 عدسة/علبة'}
                              </span>
                              <div className="flex items-center justify-between border border-slate-200/90 rounded-2xl bg-white px-2 sm:px-2.5 py-1.5 select-none shadow-3xs h-11 min-w-[88px] sm:min-w-[95px] gap-1 sm:gap-2">
                                <button
                                  type="button"
                                  onClick={() => setClQtyBoth((prev) => prev + 1)}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                  aria-label="Increase"
                                >
                                  +
                                </button>
                                <span className="font-bold text-xs sm:text-sm font-mono text-slate-900 min-w-[16px] text-center">
                                  {clQtyBoth}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setClQtyBoth((prev) => Math.max(1, prev - 1))}
                                  className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                  aria-label="Decrease"
                                >
                                  -
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Separate Powers Layout: Image 4 (Desktop) & Image 6 (Mobile) */}
                      {clPowerMode === 'separate' && (
                        <div className="pt-1.5 sm:pt-2">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            {/* Right Eye: (Right column on desktop, Top row on mobile) */}
                            <div className="space-y-1 sm:space-y-1.5">
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-800 text-start font-kufi">
                                {t('العين اليمين (Right)', 'Right Eye (Right)')}
                              </label>
                              <div className="flex items-center gap-2">
                                {/* Dropdown */}
                                <div className="relative flex-1 min-w-0">
                                  <div className="w-full rounded-2xl border border-slate-200/90 bg-white px-3 py-2 flex items-center justify-between text-xs cursor-pointer shadow-3xs hover:border-[#A58454]/60 transition-all h-11">
                                    <span className="font-bold text-slate-800 font-kufi text-xs truncate">
                                      {clPowerRight && clPowerRight !== '0.00' ? (
                                        <span className="font-bold font-mono text-slate-950 text-xs sm:text-sm" dir="ltr">
                                          {clPowerRight}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 font-semibold font-kufi text-xs">
                                          {t('اختر القوة...', 'Choose Power...')}
                                        </span>
                                      )}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                      <ChevronDown className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <select
                                    value={clPowerRight}
                                    onChange={(e) => setClPowerRight(e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  >
                                    <option value="0.00">{t('اختر القوة... (0.00 زينة)', 'Choose Power... (0.00 Plano)')}</option>
                                    {Array.from({ length: 40 }).map((_, i) => {
                                      const val = -((i + 1) * 0.25);
                                      const formatted = val.toFixed(2);
                                      return <option key={`neg-r-${i}`} value={formatted}>{formatted}</option>;
                                    })}
                                    {Array.from({ length: 24 }).map((_, i) => {
                                      const val = ((i + 1) * 0.25);
                                      const formatted = `+${val.toFixed(2)}`;
                                      return <option key={`pos-r-${i}`} value={formatted}>{formatted}</option>;
                                    })}
                                  </select>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center justify-between border border-slate-200/90 rounded-2xl bg-white px-2 sm:px-2.5 py-1.5 select-none shadow-3xs h-11 shrink-0 min-w-[82px] sm:min-w-[85px] gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setClQtyRight((prev) => prev + 1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                    aria-label="Increase"
                                  >
                                    +
                                  </button>
                                  <span className="font-bold text-xs sm:text-sm font-mono text-slate-900 min-w-[16px] text-center">
                                    {clQtyRight}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setClQtyRight((prev) => Math.max(1, prev - 1))}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                    aria-label="Decrease"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Left Eye: (Left column on desktop, Bottom row on mobile) */}
                            <div className="space-y-1 sm:space-y-1.5">
                              <label className="block text-[11px] sm:text-xs font-bold text-slate-800 text-start font-kufi">
                                {t('العين اليسار (Left)', 'Left Eye (Left)')}
                              </label>
                              <div className="flex items-center gap-2">
                                {/* Dropdown */}
                                <div className="relative flex-1 min-w-0">
                                  <div className="w-full rounded-2xl border border-slate-200/90 bg-white px-3 py-2 flex items-center justify-between text-xs cursor-pointer shadow-3xs hover:border-[#A58454]/60 transition-all h-11">
                                    <span className="font-bold text-slate-800 font-kufi text-xs truncate">
                                      {clPowerLeft && clPowerLeft !== '0.00' ? (
                                        <span className="font-bold font-mono text-slate-950 text-xs sm:text-sm" dir="ltr">
                                          {clPowerLeft}
                                        </span>
                                      ) : (
                                        <span className="text-slate-500 font-semibold font-kufi text-xs">
                                          {t('اختر القوة...', 'Choose Power...')}
                                        </span>
                                      )}
                                    </span>
                                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 text-slate-500">
                                      <ChevronDown className="w-4 h-4" />
                                    </div>
                                  </div>
                                  <select
                                    value={clPowerLeft}
                                    onChange={(e) => setClPowerLeft(e.target.value)}
                                    className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                                  >
                                    <option value="0.00">{t('اختر القوة... (0.00 زينة)', 'Choose Power... (0.00 Plano)')}</option>
                                    {Array.from({ length: 40 }).map((_, i) => {
                                      const val = -((i + 1) * 0.25);
                                      const formatted = val.toFixed(2);
                                      return <option key={`neg-l-${i}`} value={formatted}>{formatted}</option>;
                                    })}
                                    {Array.from({ length: 24 }).map((_, i) => {
                                      const val = ((i + 1) * 0.25);
                                      const formatted = `+${val.toFixed(2)}`;
                                      return <option key={`pos-l-${i}`} value={formatted}>{formatted}</option>;
                                    })}
                                  </select>
                                </div>

                                {/* Quantity */}
                                <div className="flex items-center justify-between border border-slate-200/90 rounded-2xl bg-white px-2 sm:px-2.5 py-1.5 select-none shadow-3xs h-11 shrink-0 min-w-[82px] sm:min-w-[85px] gap-1">
                                  <button
                                    type="button"
                                    onClick={() => setClQtyLeft((prev) => prev + 1)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                    aria-label="Increase"
                                  >
                                    +
                                  </button>
                                  <span className="font-bold text-xs sm:text-sm font-mono text-slate-900 min-w-[16px] text-center">
                                    {clQtyLeft}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setClQtyLeft((prev) => Math.max(1, prev - 1))}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-base font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
                                    aria-label="Decrease"
                                  >
                                    -
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Astigmatism (Toric CYL/AXIS) Selectors */}
                  {product.hasAstigmatismOption && (
                    <div className="space-y-4 p-4 rounded-2xl bg-amber-50/30 border border-amber-200/50">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          {t('تفاصيل الاستجماتيزم والانحراف (Toric Correction):', 'Astigmatism Details (Toric):')}
                        </span>
                        {product.astigmatismPriceAddonSAR && product.astigmatismPriceAddonSAR > 0 && (
                          <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-800 font-bold rounded-md font-mono">
                            {t(`إضافة انحراف: +${product.astigmatismPriceAddonSAR} ر.س`, `Custom Toric: +${product.astigmatismPriceAddonSAR} SAR`)}
                          </span>
                        )}
                      </div>

                      {/* Right Eye Astigmatism */}
                      <div className="space-y-1.5">
                        <span className="block text-[10px] font-bold text-[#8C6D3F] border-b border-amber-200/40 pb-0.5">
                          {clPowerMode === 'separate' ? t('مقاسات العين اليمنى (OD Astigmatism):', 'Right Eye (OD Astigmatism):') : t('مقاسات العينين (Both Eyes):', 'Astigmatism for both eyes:')}
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <label className="block text-[9px] text-slate-500 mb-0.5">{t('السلندر CYL', 'Cylinder CYL')}</label>
                            <select
                              value={clCylRight}
                              onChange={(e) => {
                                const val = e.target.value;
                                setClCylRight(val);
                                if (clPowerMode === 'same') setClCylLeft(val);
                              }}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                            >
                              <option value="">{t('لا يوجد (Plano)', 'None')}</option>
                              <option value="-0.75">-0.75</option>
                              <option value="-1.25">-1.25</option>
                              <option value="-1.75">-1.75</option>
                              <option value="-2.25">-2.25</option>
                              <option value="-2.75">-2.75</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[9px] text-slate-500 mb-0.5">{t('المحور AXIS', 'Axis AXIS')}</label>
                            <select
                              value={clAxisRight}
                              onChange={(e) => {
                                const val = e.target.value;
                                setClAxisRight(val);
                                if (clPowerMode === 'same') setClAxisLeft(val);
                              }}
                              disabled={!clCylRight}
                              className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono disabled:opacity-50"
                            >
                              <option value="">{t('اختر المحور', 'Select Axis')}</option>
                              {Array.from({ length: 18 }).map((_, idx) => {
                                const axisVal = (idx + 1) * 10;
                                return <option key={`axis-r-${idx}`} value={`${axisVal}`}>{axisVal}°</option>;
                              })}
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Left Eye Astigmatism */}
                      {clPowerMode === 'separate' && (
                        <div className="space-y-1.5 pt-2 border-t border-amber-200/20">
                          <span className="block text-[10px] font-bold text-[#8C6D3F] border-b border-amber-200/40 pb-0.5">
                            {t('مقاسات العين اليسرى (OS Astigmatism):', 'Left Eye (OS Astigmatism):')}
                          </span>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <label className="block text-[9px] text-slate-500 mb-0.5">{t('السلندر CYL', 'Cylinder CYL')}</label>
                              <select
                                value={clCylLeft}
                                onChange={(e) => setClCylLeft(e.target.value)}
                                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono"
                              >
                                <option value="">{t('لا يوجد (Plano)', 'None')}</option>
                                <option value="-0.75">-0.75</option>
                                <option value="-1.25">-1.25</option>
                                <option value="-1.75">-1.75</option>
                                <option value="-2.25">-2.25</option>
                                <option value="-2.75">-2.75</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[9px] text-slate-500 mb-0.5">{t('المحور AXIS', 'Axis AXIS')}</label>
                              <select
                                value={clCylLeft ? clAxisLeft : ''}
                                onChange={(e) => setClAxisLeft(e.target.value)}
                                disabled={!clCylLeft}
                                className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono disabled:opacity-50"
                              >
                                <option value="">{t('اختر المحور', 'Select Axis')}</option>
                                {Array.from({ length: 18 }).map((_, idx) => {
                                  const axisVal = (idx + 1) * 10;
                                  return <option key={`axis-l-${idx}`} value={`${axisVal}`}>{axisVal}°</option>;
                                })}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTAs: Add to Cart & Buy Now (Hidden on mobile because they are shown in the fixed bottom bar) */}
            <div className="space-y-2.5 pt-4 border-t border-slate-200">
              <div className="hidden sm:grid sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 font-kufi"
                >
                  <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                  <span>
                    {isAddedFeedback
                      ? t('تمت الإضافة بنجاح ✓', 'Added to Bag ✓')
                      : rxOption === 'prescription' && product.category === 'eyeglasses'
                      ? t('تفصيل العدسات الطبية', 'Configure Medical Lenses')
                      : t('أضف إلى السلة', 'Add to Bag')}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3.5 px-4 rounded-xl bg-[#A58454] hover:bg-[#8C6D3F] text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 font-kufi"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{t('شراء فوري سريع', 'Buy Now (Instant Checkout)')}</span>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={handleWhatsAppInquiry}
                  className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-800 font-semibold p-1 transition-colors cursor-pointer font-kufi text-[11px] sm:text-xs"
                >
                  <MessageCircle className="w-4 h-4 shrink-0" />
                  <span>{t('استفسر عن المنتج عبر واتساب', 'Inquire on WhatsApp')}</span>
                </button>

                {country === 'SA' && (
                  <button
                    type="button"
                    onClick={() => setIsVipModalOpen(true)}
                    className="flex items-center gap-1.5 text-[#8C6D3F] hover:text-slate-900 font-semibold p-1 transition-colors cursor-pointer font-kufi text-[11px] sm:text-xs"
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>{t('احجز فحص نظر منزلي VIP', 'Book VIP Exam')}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Detailed Collapsible Accordion Containers (حاويات الوصف الفاخرة) */}
        <div className="mt-8 space-y-4 font-kufi">
          
          {/* Section 1: Product Description */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-3xs overflow-hidden transition-all hover:border-[#A58454]/30">
            <button
              type="button"
              onClick={() => toggleSection('desc')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6D3F] flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                    {t('وصف ومميزات المنتج', 'Product Description & Features')}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {t('نبذة عامة، المواد، الميزات والخصائص الإضافية', 'Overview, materials, and benefit highlights')}
                  </span>
                </div>
              </div>
              <div>
                {openSections.desc ? (
                  <ChevronUp className="w-4 h-4 text-[#A58454]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openSections.desc && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-4">
                    <div 
                      className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-600 leading-relaxed font-sans"
                      dangerouslySetInnerHTML={{
                        __html: language === 'ar' ? product.descriptionAr : product.descriptionEn
                      }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            'مفصلات مرنة معززة مقاومة للكسر والضغط',
                            'Reinforced flexible flex hinges'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            'وسادات أنف سيليكون مريحة لا تترك أثراً',
                            'Soft hypoallergenic silicone nose pads'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            'طلاء حماية مضاد للخدوش والبصمات',
                            'Anti-scratch & smudge resistant finish'
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 text-xs sm:text-sm">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          {t(
                            'علبة فاخرة ومنديل ميكروفايبر أصلي متضمن',
                            'Luxury hardcase & microfiber cloth included'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 2: Technical Specs */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-3xs overflow-hidden transition-all hover:border-[#A58454]/30">
            <button
              type="button"
              onClick={() => toggleSection('specs')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6D3F] flex items-center justify-center">
                  <Info className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                    {t('المواصفات والأبعاد الفنية', 'Specifications & Dimensions')}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {t('المقاسات الدقيقة، المحتوى المائي، القطر والبلد المصنع', 'Exact dimensions, water content, base curve, and origin')}
                  </span>
                </div>
              </div>
              <div>
                {openSections.specs ? (
                  <ChevronUp className="w-4 h-4 text-[#A58454]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openSections.specs && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-5">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                      {product.category === 'contact-lenses' ? (
                        <>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('قطر العدسة (DIA)', 'Diameter (DIA)')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.diameter || '14.2 mm'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('منحنى القاعدة (BC)', 'Base Curve (BC)')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.baseCurve || '8.6 mm'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('المحتوى المائي', 'Water Content')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.waterContent || '38%'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('مدة الاستخدام', 'Duration')}
                            </span>
                            <strong className="text-slate-900 text-xs">
                              {product.specs.duration || t('شهرية (30 يوم)', 'Monthly (30 Days)')}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('نفاذية الأكسجين', 'Oxygen Permeability')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.oxygenPermeability || '32 DK/t'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('بلد المنشأ', 'Origin')}
                            </span>
                            <strong className="text-slate-900 text-xs">
                              {product.specs.origin || t('كوريا الجنوبية', 'South Korea')}
                            </strong>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('عرض العدسة', 'Lens Width')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.lensWidth || '53 ملم'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('جسر الأنف', 'Bridge Width')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.bridgeWidth || '18 ملم'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('طول الذراع', 'Temple Length')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.templeLength || '140 ملم'}
                            </strong>
                          </div>
                          {product.frameShape && (
                            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                              <span className="text-slate-400 block text-[10px] mb-1">
                                {t('شكل الإطار', 'Frame Shape')}
                              </span>
                              <strong className="text-slate-900 text-xs">
                                {language === 'ar'
                                  ? (product.frameShapeAr || product.specs.frameShape || product.frameShape)
                                  : (product.frameShapeEn || product.frameShape)
                                }
                              </strong>
                            </div>
                          )}
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('خامة الإطار', 'Frame Material')}
                            </span>
                            <strong className="text-slate-900 text-xs">
                              {product.specs.frameMaterial || 'تيتانيوم وأسيتات فاخر'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('الوزن الخفيف', 'Weight')}
                            </span>
                            <strong className="text-slate-900 font-mono text-sm">
                              {product.specs.weight || '16 غرام'}
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('الفئة / الجنس', 'Target Gender')}
                            </span>
                            <strong className="text-slate-900 text-xs">
                              {language === 'ar'
                                ? (product.genderAr || (product.gender === 'women' ? 'نساء' : product.gender === 'men' ? 'رجال' : product.gender === 'kids' ? 'أطفال' : 'للجنسين'))
                                : (product.genderEn || (product.gender === 'women' ? 'Women' : product.gender === 'men' ? 'Men' : product.gender === 'kids' ? 'Kids' : 'Unisex'))
                              }
                            </strong>
                          </div>
                          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block text-[10px] mb-1">
                              {t('بلد المنشأ', 'Origin')}
                            </span>
                            <strong className="text-slate-900 text-xs">
                              {product.specs.origin || 'إيطاليا'}
                            </strong>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Dynamic Specifications */}
                    {product.dynamicSpecs && product.dynamicSpecs.length > 0 && (
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <span className="text-slate-800 text-xs font-bold block mb-2">{t('مواصفات إضافية:', 'Additional Specifications:')}</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          {product.dynamicSpecs.map((spec, specIdx) => (
                            <div 
                              key={specIdx} 
                              className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-2xs hover:border-[#A58454]/40 transition-colors"
                            >
                              <span className="text-[#8C6D3F] block text-[10px] mb-1 font-bold font-kufi">
                                {language === 'ar' ? spec.nameAr : spec.nameEn}
                              </span>
                              <strong className="text-slate-900 text-xs font-semibold">
                                {language === 'ar' ? spec.valueAr : spec.valueEn}
                              </strong>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 3: Shipping & Fast Delivery */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-3xs overflow-hidden transition-all hover:border-[#A58454]/30">
            <button
              type="button"
              onClick={() => toggleSection('shipping')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6D3F] flex items-center justify-center">
                  <Truck className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                    {t('الشحن والتوصيل السريع والمجاني', 'Fast Shipping & Delivery')}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {t('خيارات شحن سريعة لجميع مدن المملكة ودول الخليج', 'Fast secure shipping options across KSA & GCC')}
                  </span>
                </div>
              </div>
              <div>
                {openSections.shipping ? (
                  <ChevronUp className="w-4 h-4 text-[#A58454]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openSections.shipping && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <p>
                      {t(
                        'نهتم في لِـنس كود بتوصيل طلباتكم بأعلى درجات السرعة والأمان بالتعاون مع أفضل شركات الشحن السريع في الخليج (سمسا، أرامكس، ودي إتش إل):',
                        'At LensCode, we ensure your orders are shipped with maximum speed and care using premium express couriers (SMSA, Aramex, and DHL):'
                      )}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <strong className="text-slate-950 text-xs block font-bold">📍 الرياض ومدن المملكة (SA)</strong>
                        <span className="text-slate-500 text-[11px] block">
                          {t('توصيل خلال 1 - 3 أيام عمل.', 'Delivered within 1 - 3 business days.')}
                        </span>
                        <span className="text-emerald-700 text-[10px] font-bold block">{t('شحن مجاني بالكامل', '100% Free Shipping')}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <strong className="text-slate-950 text-xs block font-bold">🌍 بقية دول الخليج (GCC)</strong>
                        <span className="text-slate-500 text-[11px] block">
                          {t('شحن سريع ومؤمن خلال 3 - 5 أيام عمل.', 'Express delivery in 3 - 5 business days.')}
                        </span>
                        <span className="text-emerald-700 text-[10px] font-bold block">{t('شحن مجاني بالكامل', '100% Free Express')}</span>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <strong className="text-slate-950 text-xs block font-bold">🛡️ تأمين شامل على الشحنة</strong>
                        <span className="text-slate-500 text-[11px] block">
                          {t('جميع الشحنات مؤمنة بالكامل ضد الضياع والتلف.', 'All shipments are fully insured against loss or damage.')}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 4: Returns & Warranty */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-3xs overflow-hidden transition-all hover:border-[#A58454]/30">
            <button
              type="button"
              onClick={() => toggleSection('warranty')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6D3F] flex items-center justify-center">
                  <RotateCcw className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                    {t('الضمان الذهبي وسياسة الاسترجاع', 'Warranty & Flex Returns')}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {t('ضمان أصالة 100% واستبدال مرن وسهل خلال 14 يوماً', '100% authentic guarantee and easy returns in 14 days')}
                  </span>
                </div>
              </div>
              <div>
                {openSections.warranty ? (
                  <ChevronUp className="w-4 h-4 text-[#A58454]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openSections.warranty && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <p>
                      {t(
                        'تسوق مطمئناً! نحن نثق بجودة منتجاتنا ونقدم لعملائنا الضمان الذهبي وسياسات مرنة ومريحة بالكامل:',
                        'Shop with peace of mind! We stand by our products and offer comprehensive warranty and return policies:'
                      )}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="p-3.5 bg-amber-50/30 rounded-2xl border border-amber-100 space-y-1">
                        <strong className="text-[#8C6D3F] text-xs block font-bold">✨ ضمان أصالة وجودة المنتجات 100%</strong>
                        <p className="text-slate-500 text-[11px]">
                          {t('جميع النظارات الطبية والشمسية والعدسات اللاصقة المتوفرة أصلية 100% من وكلائها الرسميين ومعتمدة طبياً.', 'All glasses and contact lenses are guaranteed 100% original, sourced from official distributors and medically certified.')}
                        </p>
                      </div>
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                        <strong className="text-slate-950 text-xs block font-bold">🔄 استبدال واسترجاع مرن وسهل</strong>
                        <p className="text-slate-500 text-[11px]">
                          {t('يمكنك طلب الاستبدال أو الاسترجاع خلال 14 يوماً من تاريخ استلام الطلب بسهولة تامة (يطبق على العدسات والنظارات غير الطبية المخصصة).', 'You can request returns or exchanges within 14 days of receiving your order with total ease (applies to non-custom lenses & non-prescription glasses).')}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Section 5: Customer Reviews */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-3xs overflow-hidden transition-all hover:border-[#A58454]/30">
            <button
              type="button"
              onClick={() => toggleSection('reviews')}
              className="w-full p-4 sm:p-5 flex items-center justify-between text-start cursor-pointer select-none bg-slate-50/40 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#8C6D3F] flex items-center justify-center">
                  <Star className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                    {t(`التقييمات وآراء العملاء الموثقة (${product.reviewsCount})`, `Verified Customer Reviews (${product.reviewsCount})`)}
                  </h4>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {t('آراء وتجارب المشترين مع هذا الموديل وتقييماتهم', 'Experiences and star reviews from real buyers of this model')}
                  </span>
                </div>
              </div>
              <div>
                {openSections.reviews ? (
                  <ChevronUp className="w-4 h-4 text-[#A58454]" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {openSections.reviews && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                >
                  <div className="p-4 sm:p-6 border-t border-slate-100 bg-white space-y-6">
                    {/* Existing Reviews List */}
                    <div className="space-y-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-slate-900">سعد الشمري (الرياض)</span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-slate-600">
                          &quot;ما شاء الله الإطار في الواقع أفخم بكثير من الصور، وخفيف جداً على الأنف ومريح طوال ساعات العمل أمام الكمبيوتر.&quot;
                        </p>
                      </div>
                    </div>

                    {/* Add Review Form */}
                    <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-white space-y-3 max-w-xl">
                      <h4 className="text-xs font-bold font-kufi text-slate-900">
                        {t('أضف تقييمك لهذا الموديل', 'Add Your Review')}
                      </h4>
                      {reviewSubmitted ? (
                        <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>
                            {t(
                              'شكراً لتقييمك! تم إرسال مراجعتك بنجاح.',
                              'Thank you! Your review is submitted.'
                            )}
                          </span>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            setReviewSubmitted(true);
                          }}
                          className="space-y-2.5"
                        >
                          <div>
                            <input
                              type="text"
                              required
                              placeholder={t('اسمك الكريم', 'Your Name')}
                              value={newReviewerName}
                              onChange={(e) => setNewReviewerName(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#A58454]"
                            />
                          </div>
                          <div>
                            <textarea
                              required
                              rows={3}
                              placeholder={t(
                                'اكتب رأيك وتجربتك مع النظارة...',
                                'Write your feedback...'
                              )}
                              value={newReviewText}
                              onChange={(e) => setNewReviewText(e.target.value)}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 outline-none focus:border-[#A58454]"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer animate-pulse"
                          >
                            {t('نشر التقييم', 'Submit Review')}
                          </button>
                        </form>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* 4. Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-2xl font-bold font-kufi text-slate-900">
                {t('قد يعجبك أيضاً', 'You May Also Like')}
              </h3>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${product.category}`}
                  className="text-xs font-semibold text-[#8C6D3F] hover:underline"
                >
                  {t('عرض المزيد من هذا القسم', 'View More from Category')}
                </Link>
                {/* Arrow navigation buttons for PC */}
                <div className="hidden sm:flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      if (relatedScrollRef.current) {
                        relatedScrollRef.current.scrollBy({
                          left: language === 'ar' ? 300 : -300,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors shadow-3xs cursor-pointer"
                    aria-label="Previous"
                  >
                    {language === 'ar' ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (relatedScrollRef.current) {
                        relatedScrollRef.current.scrollBy({
                          left: language === 'ar' ? -300 : 300,
                          behavior: 'smooth',
                        });
                      }
                    }}
                    className="w-8 h-8 rounded-full border border-slate-200/90 bg-white hover:bg-slate-50 flex items-center justify-center text-slate-700 transition-colors shadow-3xs cursor-pointer"
                    aria-label="Next"
                  >
                    {language === 'ar' ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal Scrollable Carousel - Touch swipe on mobile & Mouse drag on PC */}
            <div
              ref={relatedScrollRef}
              className="flex items-stretch gap-3.5 sm:gap-6 overflow-x-auto scrollbar-none py-2 px-1 select-none touch-pan-x cursor-grab active:cursor-grabbing"
            >
              {relatedProducts.map((p) => (
                <div key={p.id} className="w-[200px] sm:w-[260px] shrink-0">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. Mobile Fixed Sticky Action Bar (Directly Above Mobile Bottom Nav) */}
      <div className="sm:hidden fixed bottom-[52px] inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-3.5 py-2.5 flex items-center justify-between gap-3 animate-fadeIn select-none">
        {/* Total Price */}
        <div className="shrink-0 text-start min-w-[70px]">
          <span className="text-[10px] text-slate-400 block font-kufi leading-none mb-0.5">
            {t('السعر الإجمالي', 'Total')}
          </span>
          <div className="flex items-center gap-1 font-bold text-slate-900 font-kufi text-sm sm:text-base">
            <span>{displayedPriceLocal.toLocaleString()}</span>
            <SaudiRiyal className="w-3.5 h-3.5 text-[#A58454]" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex-1 flex items-center gap-2">
          {rxOption === 'prescription' && product.category === 'eyeglasses' ? (
            <button
              type="button"
              onClick={() => openLensWizard(product, selectedColor)}
              className="w-full py-2.5 px-3 rounded-xl bg-[#A58454] hover:bg-[#8C6D3F] text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-kufi active:scale-[0.98]"
            >
              <Eye className="w-4 h-4" />
              <span>{t('تفصيل العدسات الطبية', 'Configure Lenses')}</span>
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 py-2.5 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-kufi active:scale-[0.98]"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="truncate">
                  {isAddedFeedback ? t('تمت الإضافة ✓', 'Added ✓') : t('أضف للسلة', 'Add to Bag')}
                </span>
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                className="flex-1 py-2.5 px-2.5 rounded-xl bg-[#A58454] hover:bg-[#8C6D3F] text-slate-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer font-kufi active:scale-[0.98]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span className="truncate">{t('شراء فوري', 'Buy Now')}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
