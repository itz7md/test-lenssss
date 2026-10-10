'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Search, X, Glasses, ArrowRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import { Price } from './Price';
import { getBrandName } from '@/lib/brands';

export const PredictiveSearchModal: React.FC = () => {
  const router = useRouter();
  const {
    isSearchOpen,
    setIsSearchOpen,
    products,
    language,
    t,
    formatPrice,
    categoryConfigs,
  } = useApp();

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products.filter((p) => {
      const matchAr = p.nameAr.toLowerCase().includes(q);
      const matchEn = p.nameEn.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchShape =
        p.frameShape?.toLowerCase().includes(q) ||
        p.frameShapeAr?.toLowerCase().includes(q) ||
        p.frameShapeEn?.toLowerCase().includes(q) ||
        p.specs?.frameShape?.toLowerCase().includes(q);
      const matchDesc = p.descriptionAr.toLowerCase().includes(q) || p.descriptionEn.toLowerCase().includes(q);
      return matchAr || matchEn || matchBrand || matchSku || matchShape || matchDesc;
    });
  }, [query, products]);

  const popularSearches = useMemo(() => {
    const list: string[] = [];
    (categoryConfigs || [])
      .filter((c) => c.itemType === 'category' || c.itemType === 'brand')
      .slice(0, 6)
      .forEach((c) => {
        const title = language === 'ar' ? c.nameAr : (c.nameEn || c.nameAr);
        if (title && !list.includes(title)) list.push(title);
      });
    if (list.length === 0) {
      Array.from(new Set(products.map((p) => language === 'ar' ? (p.brandAr || p.brand) : (p.brandEn || p.brand))))
        .filter(Boolean)
        .slice(0, 6)
        .forEach((b) => list.push(b));
    }
    return list;
  }, [categoryConfigs, products, language]);

  if (!isSearchOpen) return null;

  return (
    <div
      onClick={() => setIsSearchOpen(false)}
      className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn pt-3 sm:pt-20"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 flex flex-col max-h-[85vh] animate-slideDown"
      >
        {/* Floating Search Input Bar */}
        <div className="p-3.5 sm:p-5 border-b border-slate-100 flex items-center gap-2.5 sm:gap-3 bg-white">
          <Search className="w-5 h-5 text-[#A58454] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t(
              'ابحث بالاسم، الماركة، أو شكل الإطار (مثل: يوفا، شاين، فريملس)...',
              'Search by name, brand, or shape (e.g. Yuva, Shine, Rimless)...'
            )}
            className="flex-1 text-xs sm:text-sm bg-transparent outline-none text-slate-900 placeholder:text-slate-400"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsSearchOpen(false)}
            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
          >
            {t('إلغاء', 'Cancel')}
          </button>
        </div>

        {/* Modal Results Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-5">
          {!query.trim() ? (
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2.5">
                {t('عمليات البحث الشائعة:', 'Trending Searches:')}
              </span>
              <div className="flex flex-wrap gap-2">
                {popularSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-amber-50 hover:text-[#8C6D3F] text-slate-600 text-xs transition-colors cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                {t(`تم العثور على (${results.length}) منتج:`, `Found (${results.length}) results:`)}
              </span>
              {results.map((product) => (
                <div
                  key={product.id}
                  onClick={() => {
                    setIsSearchOpen(false);
                    router.push(`/${product.slug}`);
                  }}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition-all cursor-pointer"
                >
                  <div className="relative w-14 h-14 bg-white rounded-xl overflow-hidden border border-slate-200/60 p-1 shrink-0 flex items-center justify-center">
                    <Image
                      src={product.colors[0]?.image || '/images/prod_acetate.webp'}
                      alt={product.nameAr}
                      fill
                      sizes="56px"
                      referrerPolicy="no-referrer"
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#8C6D3F] uppercase block">
                      {getBrandName(product.brand, language)}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                      {language === 'ar' ? product.nameAr : product.nameEn}
                    </h4>
                    <span className="text-[11px] text-slate-500 line-clamp-1">
                      {language === 'ar' ? product.descriptionAr : product.descriptionEn}
                    </span>
                  </div>

                  <div className="text-end shrink-0 ps-2">
                    <Price
                      amountSAR={product.basePriceSAR}
                      size="xs"
                      className="text-xs sm:text-sm font-bold font-kufi text-slate-900 block"
                    />
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {t('متوفر', 'In Stock')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-xs sm:text-sm text-slate-500">
                {t('لا توجد نتائج مطابقة لبحثك. يرجى تجربة كلمات أخرى.', 'No products matched your search.')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
