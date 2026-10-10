'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, ProductColorVariant } from '@/types';
import {
  X,
  Heart,
  ShoppingBag,
  Glasses,
  Check,
  Star,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Share2,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Price } from './Price';
import { PaymentIcons } from './PaymentIcons';
import { getBrandName } from '@/lib/brands';

export const SingleProductModal: React.FC = () => {
  const {
    selectedProduct,
    openProductModal,
    closeProductModal,
    products,
    language,
    t,
    formatPrice,
    addToCart,
    openLensWizard,
    isInWishlist,
    toggleWishlist,
    setActiveCategory,
  } = useApp();

  // Active color
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | null>(null);
  const [rxOption, setRxOption] = useState<'plano' | 'prescription'>('plano');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewAuthor, setReviewAuthor] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [submittedReview, setSubmittedReview] = useState<boolean>(false);

  if (!selectedProduct) return null;

  const currentColor =
    selectedColor ||
    (selectedProduct.colors && selectedProduct.colors.length > 0
      ? selectedProduct.colors[0]
      : {
          id: 'def',
          nameAr: 'افتراضي',
          nameEn: 'Default',
          hex: '#0F172A',
          image: '/images/prod_acetate.webp',
          stock: 15,
        });

  const isFavorited = isInWishlist(selectedProduct.id);

  // Installment price 4 parts
  const installment4SAR = selectedProduct.basePriceSAR / 4;

  // Related products
  const relatedProducts = products
    .filter((p) => p.category === selectedProduct.category && p.id !== selectedProduct.id)
    .slice(0, 4);

  const handleAdd = () => {
    if (rxOption === 'prescription' && selectedProduct.category === 'eyeglasses') {
      closeProductModal();
      openLensWizard(selectedProduct, currentColor);
    } else {
      addToCart(selectedProduct, currentColor, undefined, 1);
    }
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittedReview(true);
    setReviewComment('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[94vh]">
        {/* Top Minimal Bar */}
        <div className="p-3 sm:px-6 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <span>{t('الرئيسية', 'Home')}</span>
            <span>/</span>
            <span className="capitalize">
              {selectedProduct.category === 'eyeglasses'
                ? t('نظارات طبية', 'Eyeglasses')
                : selectedProduct.category === 'sunglasses'
                ? t('نظارات شمسية', 'Sunglasses')
                : t('عدسات لاصقة', 'Contact Lenses')}
            </span>
            <span>/</span>
            <span className="font-bold text-slate-900 truncate">
              {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
            </span>
          </div>

          <button
            type="button"
            onClick={closeProductModal}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-8 space-y-8">
          {/* Main PDP Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Gallery Column (6 Cols) */}
            <div className="md:col-span-6 space-y-4">
              <div className="relative w-full aspect-square bg-white rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center p-6 shadow-xs">
                {/* Brand & Stock Badges */}
                <div className="absolute top-4 start-4 z-10 flex flex-col gap-1.5">
                  <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-bold shadow-xs">
                    {selectedProduct.brand}
                  </span>
                  {/* Discount tag removed */}
                </div>

                {/* Wishlist & Share */}
                <div className="absolute top-4 end-4 z-10 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => toggleWishlist(selectedProduct.id)}
                    className="p-2 rounded-full bg-white shadow-md hover:scale-110 text-slate-400 hover:text-rose-500 transition-all cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isFavorited ? 'fill-rose-600 text-rose-600' : ''
                      }`}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: selectedProduct.nameAr,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="p-2 rounded-full bg-white shadow-md hover:scale-110 text-slate-400 hover:text-slate-800 transition-all cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Product Image */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={currentColor.image || '/images/prod_acetate.webp'}
                    alt={selectedProduct.nameAr}
                    fill
                    sizes="(max-width: 768px) 100vw, 500px"
                    referrerPolicy="no-referrer"
                    className="object-contain p-4"
                  />
                </div>
              </div>

              {/* Thumbnails Gallery */}
              {selectedProduct.colors && selectedProduct.colors.length > 1 && (
                <div className="flex items-center gap-3 overflow-x-auto pb-1 no-scrollbar">
                  {selectedProduct.colors.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedColor(c)}
                      className={`relative w-16 h-16 rounded-xl border p-1 shrink-0 transition-all cursor-pointer bg-white ${
                        currentColor.id === c.id
                          ? 'border-[#A58454] ring-2 ring-[#A58454]/30'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={c.image}
                        alt={c.nameAr}
                        fill
                        sizes="64px"
                        referrerPolicy="no-referrer"
                        className="object-contain p-1"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Purchase & Details Column (6 Cols) */}
            <div className="md:col-span-6 space-y-5">
              {/* Category tags */}
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <span className="font-semibold text-slate-700">{getBrandName(selectedProduct.brand, language)}</span>
                {selectedProduct.category !== 'contact-lenses' && selectedProduct.frameShape && selectedProduct.frameShape !== 'none' && (
                  <>
                    <span>·</span>
                    <span className="text-[#8C6D3F] font-medium">
                      {language === 'ar' ? (selectedProduct.frameShapeAr || selectedProduct.frameShape) : (selectedProduct.frameShapeEn || selectedProduct.frameShape)}
                    </span>
                  </>
                )}
                <span>·</span>
                <span>
                  {selectedProduct.specs.duration || selectedProduct.specs.frameMaterial}
                </span>
                <span>·</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-slate-800 font-mono">
                    {selectedProduct.rating}
                  </span>
                  <span className="text-slate-400">({selectedProduct.reviewsCount})</span>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-kufi text-slate-900 leading-tight">
                  {language === 'ar' ? selectedProduct.nameAr : selectedProduct.nameEn}
                </h1>
                <div 
                  className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: language === 'ar' ? selectedProduct.descriptionAr : selectedProduct.descriptionEn
                  }}
                />
                <Link
                  href={`/${selectedProduct.slug}`}
                  onClick={closeProductModal}
                  className="inline-flex items-center gap-1.5 text-xs text-[#8C6D3F] hover:text-[#5F4622] font-semibold mt-1.5 hover:underline"
                >
                  <span>{t('عرض صفحة المنتج المستقلة الكاملة', 'View Full Standalone Product Page')}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Price & Taxes */}
              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200/50 flex items-center justify-between">
                <div>
                  <Price
                    amountSAR={selectedProduct.basePriceSAR}
                    size="xl"
                    className="text-2xl sm:text-3xl font-bold font-kufi text-slate-900"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    {t('السعر شامل ضريبة القيمة المضافة (VAT)', 'Price includes VAT')}
                  </span>
                </div>

                <div className="text-end">
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    {t('متوفر بالمخزون', 'In Stock')} ({currentColor.stock})
                  </span>
                </div>
              </div>

              {/* Tamara & Tabby Installments Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                  <PaymentIcons.Tamara className="h-6 w-auto shrink-0" />
                  <span className="text-[11px] text-slate-600 flex items-center gap-1 flex-wrap">
                    <span>{t('4 دفعات بقيمة', '4 payments of')}</span>
                    <Price amountSAR={installment4SAR} size="xs" className="text-slate-900 font-bold" />
                  </span>
                </div>
                <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center gap-2.5">
                  <PaymentIcons.Tabby className="h-6 w-auto shrink-0" />
                  <span className="text-[11px] text-slate-600 flex items-center gap-1 flex-wrap">
                    <span>{t('قسمها على 4 دفعات بدون فوائد', 'Split in 4 without interest')}</span>
                    <Price amountSAR={installment4SAR} size="xs" className="text-slate-900 font-bold" />
                  </span>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <div className="flex justify-between items-center text-xs mb-2">
                  <span className="font-bold text-slate-800">
                    {t('اختر اللون:', 'Choose Color:')}{' '}
                    <strong className="text-[#A58454]">
                      {language === 'ar' ? currentColor.nameAr : currentColor.nameEn}
                    </strong>
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {selectedProduct.colors.map((clr) => {
                    const isSelected = currentColor.id === clr.id;
                    return (
                      <button
                        key={clr.id}
                        type="button"
                        onClick={() => setSelectedColor(clr)}
                        className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white shadow-xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                          style={{ backgroundColor: clr.hex }}
                        />
                        <span className="text-xs font-semibold">
                          {language === 'ar' ? clr.nameAr : clr.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prescription Selector for Glasses or Contact Lenses */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  {t('طريقة تحديد قياس العدسات:', 'Prescription Option:')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRxOption('plano')}
                    className={`py-2.5 px-3 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      rxOption === 'plano'
                        ? 'border-[#A58454] bg-amber-50 text-[#8C6D3F]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {selectedProduct.category === 'contact-lenses'
                      ? t('بدون مقاس طبي (زينة فقط)', 'Plano / Cosmetic Only')
                      : t('بدون قياس (حماية شاشات)', 'Plano / Computer Screen Shield')}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRxOption('prescription');
                      if (selectedProduct.category === 'eyeglasses') {
                        closeProductModal();
                        openLensWizard(selectedProduct, currentColor);
                      }
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 text-center text-xs font-bold transition-all cursor-pointer ${
                      rxOption === 'prescription'
                        ? 'border-[#A58454] bg-amber-50 text-[#8C6D3F]'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {t('مع قياس طبي (تفصيل عدسات) 👓', 'With Prescription 👓')}
                  </button>
                </div>
              </div>

              {/* Main Actions */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5 text-[#C5A880]" />
                  <span>
                    {rxOption === 'prescription' && selectedProduct.category === 'eyeglasses'
                      ? t('تفصيل العدسات الطبية والإضافة للسلة', 'Customize Lenses & Add to Bag')
                      : t('أضف للسلة الآن', 'Add to Bag Now')}
                  </span>
                </button>
              </div>

            </div>
          </div>

          {/* Technical Specifications Grid matching screenshots */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
            <h3 className="text-sm font-bold font-kufi text-slate-900 mb-4 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#A58454] rounded-full" />
              <span>{t('المواصفات الفنية التفصيلية', 'Technical Specifications')}</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
              {selectedProduct.specs.waterContent && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('محتوى الماء (%)', 'Water Content')}
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedProduct.specs.waterContent}
                  </span>
                </div>
              )}

              {selectedProduct.specs.duration && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('مدة الاستخدام', 'Usage Duration')}
                  </span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedProduct.specs.duration}
                  </span>
                </div>
              )}

              {selectedProduct.specs.baseCurve && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('انحناء القاعدة (BC)', 'Base Curve')}
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedProduct.specs.baseCurve}
                  </span>
                </div>
              )}

              {selectedProduct.specs.diameter && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('قطر العدسة (DIA)', 'Diameter')}
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedProduct.specs.diameter}
                  </span>
                </div>
              )}

              {selectedProduct.specs.lensWidth && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('عرض العدسة', 'Lens Width')}
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedProduct.specs.lensWidth}
                  </span>
                </div>
              )}

              {selectedProduct.specs.bridgeWidth && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('جسر الأنف', 'Bridge Width')}
                  </span>
                  <span className="text-sm font-bold text-slate-800 font-mono">
                    {selectedProduct.specs.bridgeWidth}
                  </span>
                </div>
              )}

              {selectedProduct.specs.frameMaterial && (
                <div className="bg-white p-3 rounded-xl border border-slate-200/60 sm:col-span-2">
                  <span className="block text-[11px] text-slate-400 mb-1">
                    {t('الخامة والصناعة', 'Material & Origin')}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {selectedProduct.specs.frameMaterial}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-kufi text-slate-900">
                {t('تقييمات وآراء العملاء', 'Customer Reviews')}
              </h3>
              <div className="flex items-center gap-1.5 text-amber-500">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-slate-800">{selectedProduct.rating}</span>
                <span className="text-xs text-slate-400">
                  ({selectedProduct.reviewsCount} {t('تقييم موثق', 'reviews')})
                </span>
              </div>
            </div>

            {submittedReview ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 text-center">
                {t('شكراً لك! تم إرسال تقييمك وسينشر بعد التحقق.', 'Thank you! Your review has been submitted.')}
              </div>
            ) : (
              <form onSubmit={handleAddReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  {t('كتابة مراجعة جديدة', 'Write a Review')}
                </span>

                <div className="flex items-center gap-1 text-amber-400 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder={t('اسمك الكريم', 'Your Name')}
                    className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none"
                  />
                  <input
                    type="text"
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder={t('شارك تجربتك ورأيك بالمنتج...', 'Share your honest feedback...')}
                    className="text-xs p-2.5 rounded-xl border border-slate-200 bg-white outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 cursor-pointer"
                >
                  {t('إرسال التقييم', 'Submit Review')}
                </button>
              </form>
            )}
          </div>

          {/* Related Products Carousel matching screenshots */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-base font-bold font-kufi text-slate-900 mb-4">
                {t('قد يعجبك أيضاً', 'You May Also Like')}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      setSelectedColor(null);
                      closeProductModal();
                      setTimeout(() => {
                        openProductModal(rel);
                      }, 50);
                    }}
                    className="p-2.5 rounded-xl border border-slate-200/80 hover:border-slate-400 bg-white cursor-pointer transition-all text-center"
                  >
                    <div className="relative w-full aspect-square mb-1">
                      <Image
                        src={rel.colors[0]?.image || '/images/prod_acetate.webp'}
                        alt={rel.nameAr}
                        fill
                        sizes="(max-width: 640px) 25vw, 120px"
                        referrerPolicy="no-referrer"
                        className="object-contain"
                      />
                    </div>
                    <span className="block text-xs font-bold text-slate-800 truncate">
                      {rel.nameAr}
                    </span>
                    <Price
                      amountSAR={rel.basePriceSAR}
                      size="xs"
                      className="text-[11px] font-bold text-[#A58454]"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
