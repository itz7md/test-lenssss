'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { ProductCard } from '@/components/ProductCard';
import { Price } from '@/components/Price';
import { getBrandName } from '@/lib/brands';
import { matchShape } from '@/lib/catalogHelpers';
import { Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles, Check } from 'lucide-react';

export const ProductCatalogSection: React.FC = () => {
  const {
    products,
    language,
    t,
    formatPrice,
    activeCategory,
    setActiveCategory,
    categoryConfigs,
  } = useApp();

  // Filters state
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedShape, setSelectedShape] = useState<string>('all');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(700);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Dynamic category & subcategory tabs derived from database categoryConfigs
  const dynamicCategoryTabs = useMemo(() => {
    const list = [{ id: 'all', labelAr: 'الكل', labelEn: 'All' }];
    (categoryConfigs || [])
      .filter((c) => c.itemType === 'category' || c.itemType === 'subcategory')
      .forEach((c) => {
        const slug = c.slug || c.id;
        if (!list.some((item) => item.id === slug)) {
          list.push({
            id: slug,
            labelAr: c.nameAr || c.heroTitleAr || slug,
            labelEn: c.nameEn || c.heroTitleEn || slug,
          });
        }
      });
    return list;
  }, [categoryConfigs]);

  // Dynamic available frame shapes from categoryConfigs & products
  const availableShapes = useMemo(() => {
    const map = new Map<string, { id: string; nameAr: string; nameEn: string }>();
    (categoryConfigs || [])
      .filter((c) => c.itemType === 'shape')
      .forEach((c) => {
        if (c.slug) map.set(c.slug.toLowerCase(), { id: c.slug, nameAr: c.nameAr, nameEn: c.nameEn });
      });
    products.forEach((p) => {
      const sAr = p.frameShapeAr || p.frameShape;
      const sEn = p.frameShapeEn || p.frameShape;
      const sSlug = (sEn || sAr || '').toLowerCase().trim().replace(/\s+/g, '-');
      if (sSlug && !map.has(sSlug)) {
        map.set(sSlug, { id: sSlug, nameAr: sAr || sSlug, nameEn: sEn || sSlug });
      }
    });
    return Array.from(map.values());
  }, [categoryConfigs, products]);

  // Mouse drag-to-scroll for Catalog Category Tabs
  const catalogTabsRef = useRef<HTMLDivElement>(null);
  const isDraggingTabsRef = useRef(false);
  const startTabsXRef = useRef(0);
  const scrollLeftTabsRef = useRef(0);
  const hasDraggedTabsRef = useRef(false);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0 || !catalogTabsRef.current) return;
    isDraggingTabsRef.current = true;
    hasDraggedTabsRef.current = false;
    startTabsXRef.current = e.clientX;
    scrollLeftTabsRef.current = catalogTabsRef.current.scrollLeft;
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDraggingTabsRef.current || !catalogTabsRef.current) return;
      const deltaX = e.clientX - startTabsXRef.current;
      if (Math.abs(deltaX) > 4) {
        hasDraggedTabsRef.current = true;
      }
      catalogTabsRef.current.scrollLeft = scrollLeftTabsRef.current - deltaX;
    };

    const handleGlobalMouseUp = () => {
      if (!isDraggingTabsRef.current) return;
      isDraggingTabsRef.current = false;
      setTimeout(() => {
        hasDraggedTabsRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
    window.addEventListener('mouseup', handleGlobalMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Available unique brands & shapes
  const brands = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.brand)));
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category match
        if (activeCategory !== 'all') {
          const matchCat =
            p.category === activeCategory ||
            (p.brand && p.brand.toLowerCase() === activeCategory.toLowerCase()) ||
            (p.subCategory && (p.subCategory.toLowerCase() === activeCategory.toLowerCase() || p.subCategory.includes(activeCategory))) ||
            (p.subCategoryAr && (p.subCategoryAr.toLowerCase() === activeCategory.toLowerCase() || p.subCategoryAr.includes(activeCategory))) ||
            (p.subCategoryEn && (p.subCategoryEn.toLowerCase() === activeCategory.toLowerCase() || p.subCategoryEn.includes(activeCategory))) ||
            (p.lensType && (p.lensType.toLowerCase() === activeCategory.toLowerCase() || activeCategory.toLowerCase().includes(p.lensType.toLowerCase()))) ||
            (activeCategory === 'kids' && (p.category === 'kids' || p.gender === 'kids'));
          if (!matchCat) return false;
        }

        // Brand match
        if (selectedBrand !== 'all' && p.brand !== selectedBrand) return false;

        // Shape match
        if (selectedShape !== 'all' && !matchShape(p, selectedShape)) return false;

        // Material match
        if (selectedMaterial !== 'all' && p.frameMaterial !== selectedMaterial) return false;

        // Gender match
        if (selectedGender !== 'all') {
          const isUnisex = p.gender === 'unisex' || p.genderAr === 'للجنسين' || p.genderEn?.toLowerCase() === 'unisex';
          if (selectedGender === 'men' && (p.gender !== 'men' && p.genderAr !== 'رجال' && p.genderAr !== 'رجالي') && !isUnisex) return false;
          if (selectedGender === 'women' && (p.gender !== 'women' && p.genderAr !== 'نساء' && p.genderAr !== 'نسائي') && !isUnisex) return false;
          if (selectedGender === 'kids' && p.gender !== 'kids' && p.category !== 'kids') return false;
        }

        // Max price
        if (p.basePriceSAR > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.basePriceSAR - b.basePriceSAR;
        if (sortBy === 'price-desc') return b.basePriceSAR - a.basePriceSAR;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0);
      });
  }, [
    products,
    activeCategory,
    selectedBrand,
    selectedShape,
    selectedMaterial,
    selectedGender,
    maxPrice,
    sortBy,
  ]);

  const currentCategoryTitle = useMemo(() => {
    if (activeCategory === 'all') return t('كافة المنتجات الفاخرة', 'All Luxury Products');
    const matched = categoryConfigs?.find((c) => c.slug === activeCategory || c.id === activeCategory);
    if (matched) return language === 'ar' ? (matched.heroTitleAr || matched.nameAr) : (matched.heroTitleEn || matched.nameEn || matched.nameAr);
    return activeCategory;
  }, [activeCategory, categoryConfigs, language, t]);

  const clearFilters = () => {
    setSelectedBrand('all');
    setSelectedShape('all');
    setSelectedMaterial('all');
    setSelectedGender('all');
    setMaxPrice(700);
    setSortBy('featured');
    setActiveCategory('all');
  };

  const hasActiveFilters =
    selectedBrand !== 'all' ||
    selectedShape !== 'all' ||
    selectedMaterial !== 'all' ||
    selectedGender !== 'all' ||
    maxPrice < 700 ||
    activeCategory !== 'all';

  return (
    <section id="catalog-section" className="py-8 sm:py-16 bg-transparent">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* 1. Header Bar with Category Tabs and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-5 sm:h-6 bg-[#A58454] rounded-full" />
              <h2 className="text-lg sm:text-3xl font-bold font-kufi text-slate-900 tracking-tight">
                {currentCategoryTitle}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t(
                `عرض ${filteredProducts.length} من أصل ${products.length} منتج متوفر بالمخزون`,
                `Showing ${filteredProducts.length} of ${products.length} in-stock products`
              )}
            </p>
          </div>

          {/* Quick Actions & Sorters */}
          <div className="flex items-center gap-3">
            {/* Filter Toggle Mobile/Desktop */}
            <button
              type="button"
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                hasActiveFilters
                  ? 'bg-amber-50 border-[#A58454] text-[#8C6D3F]'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
              }`}
            >
              <Filter className="w-3.5 h-3.5 text-[#A58454]" />
              <span>{t('تصفية وفلاتر', 'Filter & Refine')}</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#A58454]" />
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="relative flex items-center bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 me-2" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent border-none outline-none font-medium cursor-pointer"
              >
                <option value="featured">{t('المقترح / الأكثر طلباً', 'Featured / Best Seller')}</option>
                <option value="price-asc">{t('السعر: من الأقل للأعلى', 'Price: Low to High')}</option>
                <option value="price-desc">{t('السعر: من الأعلى للأقل', 'Price: High to Low')}</option>
                <option value="rating">{t('الأعلى تقييماً', 'Highest Rated')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Quick Flat Category Tabs Bar - Completely Flat Without Background */}
        <div
          ref={catalogTabsRef}
          onMouseDown={handleTabsMouseDown}
          onDragStart={(e) => e.preventDefault()}
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-slate-200/80 mb-6 cursor-grab active:cursor-grabbing select-none touch-pan-x"
        >
          {dynamicCategoryTabs.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  if (!hasDraggedTabsRef.current) setActiveCategory(cat.id);
                }}
                className={`relative px-3.5 py-1.5 text-xs shrink-0 select-none transition-all cursor-pointer bg-transparent border-b-2 ${
                  isActive
                    ? 'border-[#A58454] text-[#A58454] font-bold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                {language === 'ar' ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* 2. Collapsible Filter Drawer / Bar */}
        {isFilterDrawerOpen && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm mb-8 animate-fadeIn">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#A58454]" />
                <span>{t('خيارات الفلترة الدقيقة', 'Precise Filter Options')}</span>
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-rose-600 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{t('إعادة ضبط الفلاتر', 'Reset Filters')}</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {/* Category */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  {t('الفئة الأساسية', 'Category')}
                </label>
                <select
                  value={activeCategory}
                  onChange={(e) => setActiveCategory(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                >
                  {dynamicCategoryTabs.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {language === 'ar' ? cat.labelAr : cat.labelEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  {t('الفئة المستهدفة', 'Target Gender')}
                </label>
                <select
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                >
                  <option value="all">{t('الكل (رجال، نساء)', 'All (Men, Women)')}</option>
                  <option value="men">{t('رجال', 'Men')}</option>
                  <option value="women">{t('نساء', 'Women')}</option>
                </select>
              </div>

              {/* Brand */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  {t('الماركة', 'Brand')}
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                >
                  <option value="all">{t('جميع الماركات', 'All Brands')}</option>
                  {brands.map((b) => (
                    <option key={b} value={b}>
                      {getBrandName(b, language)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Frame Shape - Only for glasses / non-lens categories */}
              {activeCategory !== 'contact-lenses' &&
                !categoryConfigs?.some((c) => c.itemType === 'subcategory' && (c.slug === activeCategory || c.id === activeCategory)) && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                    {t('شكل الإطار', 'Frame Shape')}
                  </label>
                  <select
                    value={selectedShape}
                    onChange={(e) => setSelectedShape(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                  >
                    <option value="all">{t('جميع الأشكال', 'All Shapes')}</option>
                    {availableShapes.map((s) => (
                      <option key={s.id} value={s.id}>
                        {language === 'ar' ? s.nameAr : s.nameEn}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Material */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1.5">
                  {t('الخامة', 'Material')}
                </label>
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-slate-50 outline-none"
                >
                  <option value="all">{t('جميع الخامات', 'All Materials')}</option>
                  <option value="titanium">{t('تيتانيوم ياباني نقي', 'Titanium')}</option>
                  <option value="tr90">{t('TR90 خفيف ومرن', 'TR90 Flexible')}</option>
                  <option value="acetate">{t('أسيتات فاخر', 'Acetate')}</option>
                  <option value="metal">{t('معدن مطلي', 'Plated Metal')}</option>
                </select>
              </div>

              {/* Price Slider */}
              <div>
                <div className="flex justify-between items-center text-[11px] font-semibold text-slate-500 mb-1.5">
                  <span>{t('أقصى سعر', 'Max Price')}</span>
                  <Price amountSAR={maxPrice} size="xs" className="text-slate-900 font-bold" />
                </div>
                <input
                  type="range"
                  min="90"
                  max="700"
                  step="10"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#A58454] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. Products: Horizontal Slider on Mobile / Grid on Desktop */}
        {filteredProducts.length > 0 ? (
          <div>
            {/* Mobile View Toggle & Hint */}
            <div className="flex sm:hidden items-center justify-between mb-2.5 text-[11px] text-slate-500">
              <span className="font-medium">
                {t('اسحب أفقياً لاستعراض الموديلات 👈', 'Swipe horizontally to browse 👈')}
              </span>
              <span className="text-slate-400 font-mono">
                {filteredProducts.length} {t('منتج', 'items')}
              </span>
            </div>

            <div className="flex md:grid md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 md:gap-6 overflow-x-auto md:overflow-x-visible no-scrollbar snap-x snap-mandatory px-3.5 md:px-0 -mx-3.5 md:mx-0 pb-3 md:pb-0">
              {filteredProducts.map((product, idx) => (
                <div key={product.id} className="w-[205px] sm:w-[225px] md:w-auto shrink-0 snap-start">
                  <ProductCard product={product} priority={idx < 4} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-[#A58454] flex items-center justify-center mx-auto mb-3">
              <Filter className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1 font-kufi">
              {t('لا توجد منتجات مطابقة للخيارات المحددة', 'No matching products found')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('يرجى تجربة تعديل نطاق السعر أو إزالة بعض الفلاتر لعرض نتائج أكثر.', 'Try loosening your price filter or clearing some filters.')}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
            >
              {t('عرض كافة المنتجات', 'Show All Products')}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
