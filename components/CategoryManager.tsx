'use client';

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CategoryConfig, CategoryItemType } from '@/types';
import { formatMetaTitle, SHORT_COUNTRY_NAMES } from '@/data/countries';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  Globe,
  Sparkles,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  ExternalLink,
  Eye,
  FileCode,
  Layout,
  Tag,
} from 'lucide-react';
import Image from 'next/image';
import { ImageUploader } from './ImageUploader';

export const DEFAULT_BUILTIN_CONFIGS: CategoryConfig[] = [];

export const CategoryManager: React.FC = () => {
  const {
    categoryConfigs,
    updateCategoryConfig,
    addCategoryConfig,
    deleteCategoryConfig,
    products,
    language,
    t,
  } = useApp();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [editingItem, setEditingProduct] = useState<CategoryConfig | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'display' | 'card' | 'hero' | 'seo'>('basic');

  // Merge categoryConfigs saved in Firestore with dynamic product attributes
  const allMergedConfigs = useMemo(() => {
    const list: CategoryConfig[] = [...categoryConfigs];

    // Helper to push item if not already present by id or slug or nameAr
    const pushIfMissing = (cfg: CategoryConfig) => {
      const exists = list.some(
        (c) =>
          c.id === cfg.id ||
          (c.slug && cfg.slug && c.slug.toLowerCase().trim() === cfg.slug.toLowerCase().trim()) ||
          (c.nameAr && cfg.nameAr && c.nameAr.trim() === cfg.nameAr.trim() && c.itemType === cfg.itemType)
      );
      if (!exists) {
        list.push(cfg);
      }
    };

    // Scan products to dynamically capture any newly entered attributes
    (products || []).forEach((p) => {
      // Frame shape
      if (p.frameShapeAr || p.frameShape) {
        const ar = p.frameShapeAr || p.frameShape || '';
        const en = p.frameShapeEn || p.frameShape || '';
        if (ar) {
          pushIfMissing({
            id: `shape-${ar}`,
            itemType: 'shape',
            nameAr: ar,
            nameEn: en,
            slug: (en || ar).toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }

      // Target Gender
      if (p.genderAr || p.gender) {
        const ar = p.genderAr || p.gender || '';
        const en = p.genderEn || p.gender || '';
        if (ar) {
          pushIfMissing({
            id: `gender-${ar}`,
            itemType: 'gender',
            nameAr: ar,
            nameEn: en,
            slug: (en || ar).toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }

      // Usage Duration
      if (p.contactLensDurationAr || p.contactLensDuration) {
        const ar = p.contactLensDurationAr || p.contactLensDuration || '';
        const en = p.contactLensDurationEn || p.contactLensDuration || '';
        if (ar) {
          pushIfMissing({
            id: `duration-${ar}`,
            itemType: 'duration',
            nameAr: ar,
            nameEn: en,
            slug: (en || ar).toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }

      // Brand
      if (p.brandAr || p.brand) {
        const ar = p.brandAr || p.brand || '';
        const en = p.brandEn || p.brand || '';
        if (ar) {
          pushIfMissing({
            id: `brand-${ar}`,
            itemType: 'brand',
            nameAr: ar,
            nameEn: en,
            slug: (en || ar).toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }

      // Subcategory
      if (p.subCategoryAr || p.subCategory) {
        const ar = p.subCategoryAr || p.subCategory || '';
        const en = p.subCategoryEn || p.subCategory || '';
        if (ar) {
          pushIfMissing({
            id: `sub-${ar}`,
            itemType: 'subcategory',
            nameAr: ar,
            nameEn: en,
            slug: (en || ar).toLowerCase().replace(/\s+/g, '-'),
          });
        }
      }
    });

    return list;
  }, [categoryConfigs, products]);

  const filteredItems = useMemo(() => {
    return allMergedConfigs.filter((item) => {
      if (!['category', 'brand', 'subcategory', 'shape', 'gender', 'duration', 'custom'].includes(item.itemType)) {
        return false;
      }

      const matchSearch =
        search === '' ||
        (item.nameAr || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.nameEn || '').toLowerCase().includes(search.toLowerCase()) ||
        (item.slug || '').toLowerCase().includes(search.toLowerCase());

      const matchType = typeFilter === 'all' || item.itemType === typeFilter;

      return matchSearch && matchType;
    });
  }, [allMergedConfigs, search, typeFilter]);

  const handleCreateNew = () => {
    const newConfig: CategoryConfig = {
      id: 'custom-' + Date.now(),
      itemType: 'category',
      nameAr: '',
      nameEn: '',
      slug: 'category-' + Date.now().toString().slice(-4),
      showInHeaderNav: true,
      showInHome: true,
      showInExplore: false,
      heroTitleAr: '',
      heroTitleEn: '',
      heroSubTitleAr: '',
      heroSubTitleEn: '',
      metaTitleAr: '',
      metaTitleEn: '',
      metaDescAr: '',
      metaDescEn: '',
    };
    setEditingProduct(newConfig);
    setIsAddMode(true);
    setActiveTab('basic');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const existsInDb = categoryConfigs.some((c) => c.id === editingItem.id);
    if (isAddMode || !existsInDb) {
      addCategoryConfig(editingItem);
    } else {
      updateCategoryConfig(editingItem.id, editingItem);
    }
    setEditingProduct(null);
  };

  const getTypeLabel = (type: CategoryItemType) => {
    switch (type) {
      case 'category':
        return { ar: 'قسم رئيسي', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'brand':
        return { ar: 'علامة تجارية', color: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'subcategory':
        return { ar: 'تصنيف فرعي', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'duration':
        return { ar: 'مدة استخدام', color: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'gender':
        return { ar: 'فئة مستهدفة', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'shape':
        return { ar: 'شكل إطار', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
      default:
        return { ar: 'مجموعة مخصصة', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-3xs">
        <div>
          <h3 className="text-sm sm:text-base font-bold font-kufi text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#A58454]" />
            <span>{t('إدارة القوائم والتصنيفات والماركات والخصائص', 'Lists, Categories, Brands & Specs Manager')}</span>
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            التحكم الكامل بجميع الأقسام، الماركات، أشكال الإطارات، الفئات المستهدفة، مدة الاستخدام والخصائص المخصصة.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Search */}
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث في الأقسام والماركات والأشكال والـ Slugs..."
            className="w-full text-xs ps-9 pe-4 py-2.5 rounded-xl border border-slate-200 bg-white font-semibold"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="md:col-span-7 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'category', label: 'الأقسام الرئيسية' },
            { id: 'brand', label: 'الماركات' },
            { id: 'subcategory', label: 'التصنيفات الفرعية' },
            { id: 'shape', label: 'أشكال الإطارات' },
            { id: 'gender', label: 'الفئة المستهدفة' },
            { id: 'duration', label: 'مدة الاستخدام' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                typeFilter === tab.id
                  ? 'bg-[#A58454] text-white shadow-3xs font-bold'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase font-sans">
              <tr>
                <th className="p-3.5 text-start">الاسم والعنصر</th>
                <th className="p-3.5 text-start">الرابط / الـ Slug</th>
                <th className="p-3.5 text-center">أماكن الظهور والتواجد</th>
                <th className="p-3.5 text-center">صورة زر تسوق حسب</th>
                <th className="p-3.5 text-end">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredItems.map((item) => {
                const badge = getTypeLabel(item.itemType);
                const isPrimaryCategory = [
                  'category-eyeglasses',
                  'category-sunglasses',
                  'category-contact-lenses',
                  'category-kids',
                  'category-accessories',
                  'category-care'
                ].includes(item.id) || [
                  'eyeglasses',
                  'sunglasses',
                  'contact-lenses',
                  'kids',
                  'accessories',
                  'care'
                ].includes(item.slug?.toLowerCase().trim());
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-slate-200 bg-slate-100 overflow-hidden relative shrink-0 flex items-center justify-center">
                          {item.iconImage || item.cardImage || item.heroBannerImage ? (
                            <Image
                              src={item.iconImage || item.cardImage || item.heroBannerImage || ''}
                              alt={item.nameAr}
                              fill
                              sizes="40px"
                              referrerPolicy="no-referrer"
                              className="object-cover"
                            />
                          ) : (
                            <Layers className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div>
                          <strong className="text-xs font-bold text-slate-900 block">
                            {item.nameAr}
                          </strong>
                          <span className="text-[11px] text-slate-400 font-mono block">
                            {item.nameEn}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="space-y-1">
                        <code className="block text-[10px] text-slate-500 font-mono">
                          /{item.slug}
                        </code>
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {item.showInHeaderNav && (
                          <span
                            title="ظاهر في شريط الهيدر"
                            className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold"
                          >
                            📌 شريط الهيدر
                          </span>
                        )}
                        {item.showInHome && (
                          <span
                            title="ظاهر في الواجهة الرئيسية"
                            className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-semibold"
                          >
                            🏠 الرئيسية
                          </span>
                        )}
                        {item.showInExplore && (
                          <span
                            title="ظاهر في استكشف مجموعاتنا"
                            className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-semibold"
                          >
                            🌟 مجموعاتنا
                          </span>
                        )}
                        {!item.showInHeaderNav && !item.showInHome && !item.showInExplore && (
                          <span className="text-[10px] text-slate-400">مخفي</span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-center">
                      {item.iconImage ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-700">
                          <ImageIcon className="w-3 h-3 text-emerald-600" />
                          <span>صورة مخصصة</span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-slate-400">أيقونة افتراضية</span>
                      )}
                    </td>

                    <td className="p-3.5 text-end">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingProduct({ ...item });
                            setIsAddMode(false);
                            setActiveTab('basic');
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-colors shadow-3xs cursor-pointer"
                          title="تعديل الإعدادات والصور والـ SEO"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        {!isPrimaryCategory && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت أعدت التأكيد لحذف القسم / العنصر "${item.nameAr}"؟`)) {
                                deleteCategoryConfig(item.id);
                              }
                            }}
                            className="p-1.5 rounded-lg border border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                            title="حذف هذا القسم"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-sans">
                    لا توجد أقسام أو عناصر مطابقة للبحث حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-sm sm:text-base font-bold font-kufi flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#A58454]" />
                  <span>
                    {isAddMode ? 'إضافة قسم / عنصر جديد' : `تعديل قسم: ${editingItem.nameAr}`}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-300">
                  تعديل الصور، الروابط، شريط الأقسام، الواجهة الرئيسية، الهيرو، وعناوين الـ SEO
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs Bar */}
            <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {[
                { id: 'basic', label: '1. البيانات والصورة', icon: Layout },
                { id: 'display', label: '2. أماكن التواجد', icon: Eye },
                { id: 'card', label: '3. كرت المجموعات', icon: Tag },
                { id: 'hero', label: '4. الهيرو والوصف', icon: ImageIcon },
                { id: 'seo', label: '5. الـ SEO والسكيما', icon: Globe },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-3xs border border-slate-200'
                        : 'text-slate-600 hover:bg-white/60'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A58454]' : 'text-slate-400'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
              {/* TAB 1: BASIC INFO & SHOP BY BUTTON IMAGE */}
              {activeTab === 'basic' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        نوع العنصر / التصنيف *
                      </label>
                      <select
                        value={editingItem.itemType || 'category'}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            itemType: e.target.value as CategoryItemType,
                          })
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-900 cursor-pointer"
                      >
                        <option value="category">قسم رئيسي (Category)</option>
                        <option value="brand">ماركة / علامة تجارية (Brand)</option>
                        <option value="subcategory">تصنيف فرعي (Subcategory)</option>
                        <option value="shape">شكل إطار (Frame Shape)</option>
                        <option value="gender">فئة مستهدفة / جنس (Target Gender)</option>
                        <option value="duration">مدة استخدام (Usage Duration)</option>
                        <option value="custom">مجموعة مخصصة (Custom Group)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        رابط الـ Slug بـ URL *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.slug}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            slug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                          })
                        }
                        placeholder="e.g. sunglasses, ray-ban, square, men"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الاسم بالعربي *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.nameAr}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, nameAr: e.target.value })
                        }
                        placeholder="اسم القسم أو الماركة بالعربي"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الاسم بالإنجليزي *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingItem.nameEn}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, nameEn: e.target.value })
                        }
                        placeholder="English Name"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-sans"
                      />
                    </div>
                  </div>

                  {/* Requirement 1: Icon image for Shop By buttons */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <strong className="text-xs font-bold text-slate-900 block">
                        🖼️ صورة زر تسوق حسب (تظهر بدلاً من الأيقونة في الأزرار):
                      </strong>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      عند تحديد صورة هنا، ستظهر داخل الدائرة الخاصة بأزرار التصفية تسوق حسب بدلاً من الأيقونة الرسمية.
                    </p>
                    <ImageUploader
                      value={editingItem.iconImage || ''}
                      onChange={(url) =>
                        setEditingProduct({ ...editingItem, iconImage: url })
                      }
                      folder="categories"
                      label="صورة الأيقونة الدائرية (WebP)"
                      placeholder="رابط الصورة أو اختر ملفاً للرفع..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 2: DISPLAY LOCATIONS */}
              {activeTab === 'display' && (
                <div className="space-y-4 animate-fadeIn">
                  <span className="text-xs font-bold text-slate-800 block">
                    مواقع التواجد والظهور في الموقع:
                  </span>

                  <div className="space-y-3">
                    {/* Requirement 2: Header & Footer Nav */}
                    <label className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:border-[#A58454] transition-colors">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          📌 إظهار في شريط الأقسام (Header & Footer Nav)
                        </strong>
                        <span className="text-[10px] text-slate-500 block">
                          تفعيل ظهور هذا القسم في شريط الملاحة العلوي (Header) وفي قائمة الأقسام بالتذييل (Footer).
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.showInHeaderNav || false}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            showInHeaderNav: e.target.checked,
                          })
                        }
                        className="w-5 h-5 rounded text-[#A58454]"
                      />
                    </label>

                    {/* Requirement 3: Main Home */}
                    <label className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:border-[#A58454] transition-colors">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          🏠 إظهار في الأقسام الأفقية بالواجهة الرئيسية (Main Homepage)
                        </strong>
                        <span className="text-[10px] text-slate-500 block">
                          إنشاء شريط أفقي قابل للسحب بالماوس واللمس يعرض منتجات هذا القسم بالواجهة الرئيسية.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.showInHome || false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, showInHome: e.target.checked })
                        }
                        className="w-5 h-5 rounded text-[#A58454]"
                      />
                    </label>

                    {/* Requirement 5: Explore Collections */}
                    <label className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between cursor-pointer hover:border-[#A58454] transition-colors">
                      <div>
                        <strong className="text-xs font-bold text-slate-900 block">
                          🌟 إظهار كرت في قسم استكشف مجموعاتنا (Explore Our Collections)
                        </strong>
                        <span className="text-[10px] text-slate-500 block">
                          عرض كرت بظلال فاخرة وصورة غلاف في قسم المجموعات الترويجي بالصفحة الرئيسية.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingItem.showInExplore || false}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, showInExplore: e.target.checked })
                        }
                        className="w-5 h-5 rounded text-[#A58454]"
                      />
                    </label>
                  </div>

                  {editingItem.showInHome && (
                    <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-3.5 mt-4">
                      <strong className="text-xs font-bold text-slate-900 block">
                        🏠 تخصيص الاسم والوصف المعروض بالصفحة الرئيسية:
                      </strong>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            الاسم بالواجهة الرئيسية (عربي)
                          </label>
                          <input
                            type="text"
                            value={editingItem.homeTitleAr || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingItem, homeTitleAr: e.target.value })
                            }
                            placeholder={editingItem.nameAr}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            الاسم بالواجهة الرئيسية (إنجليزي)
                          </label>
                          <input
                            type="text"
                            value={editingItem.homeTitleEn || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingItem, homeTitleEn: e.target.value })
                            }
                            placeholder={editingItem.nameEn}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-sans"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            الوصف بالواجهة الرئيسية (عربي)
                          </label>
                          <textarea
                            rows={2}
                            value={editingItem.homeSubtitleAr || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingItem, homeSubtitleAr: e.target.value })
                            }
                            placeholder="وصف ترويجي قصير يظهر أسفل العنوان الرئيسي بالواجهة"
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 mb-1">
                            الوصف بالواجهة الرئيسية (إنجليزي)
                          </label>
                          <textarea
                            rows={2}
                            value={editingItem.homeSubtitleEn || ''}
                            onChange={(e) =>
                              setEditingProduct({ ...editingItem, homeSubtitleEn: e.target.value })
                            }
                            placeholder="Short description under the title on homepage"
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: EXPLORE COLLECTIONS CARD SETTINGS */}
              {activeTab === 'card' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-slate-900 block">
                      🌟 إعدادات الكرت في قسم استكشف مجموعاتنا:
                    </strong>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الكرت (عربي)
                      </label>
                      <input
                        type="text"
                        value={editingItem.cardTitleAr || editingItem.nameAr}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, cardTitleAr: e.target.value })
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الكرت (إنجليزي)
                      </label>
                      <input
                        type="text"
                        value={editingItem.cardTitleEn || editingItem.nameEn}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, cardTitleEn: e.target.value })
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف الكرت (عربي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.cardDescAr || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, cardDescAr: e.target.value })
                        }
                        placeholder="وصف مختصر يظهر أسفل عنوان الكرت"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف الكرت (إنجليزي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.cardDescEn || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, cardDescEn: e.target.value })
                        }
                        placeholder="Card short description"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      value={editingItem.cardImage || ''}
                      onChange={(url) =>
                        setEditingProduct({ ...editingItem, cardImage: url })
                      }
                      folder="categories"
                      label="صورة غلاف الكرت (WebP)"
                      placeholder="رابط صورة الكرت أو اختر ملفاً للرفع..."
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: HERO BANNER & DESCRIPTIONS */}
              {activeTab === 'hero' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-slate-900 block">
                      🖼️ إعدادات الهيرو والعناوين والوصف السفلي للقسم:
                    </strong>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الهيرو الرئيسي (عربي)
                      </label>
                      <input
                        type="text"
                        value={editingItem.heroTitleAr || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, heroTitleAr: e.target.value })
                        }
                        placeholder="e.g. تشكيلة النظارات الطبية الفاخرة"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الهيرو الرئيسي (إنجليزي)
                      </label>
                      <input
                        type="text"
                        value={editingItem.heroTitleEn || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, heroTitleEn: e.target.value })
                        }
                        placeholder="Hero Title in English"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الوصف الفرعي للهيرو (عربي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.heroSubTitleAr || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, heroSubTitleAr: e.target.value })
                        }
                        placeholder="نص ترويجي قصير أسفل عنوان الهيرو"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الوصف الفرعي للهيرو (إنجليزي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.heroSubTitleEn || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, heroSubTitleEn: e.target.value })
                        }
                        placeholder="Hero subtitle in English"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <ImageUploader
                      value={editingItem.heroBannerImage || ''}
                      onChange={(url) =>
                        setEditingProduct({ ...editingItem, heroBannerImage: url })
                      }
                      folder="categories"
                      label="صورة خلفية/بانر الهيرو (WebP)"
                      placeholder="رابط صورة الهيرو أو اختر ملفاً للرفع..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف القسم القصير (يظهر أسفل الهيرو مباشرة بالعربي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.sectionDescAr || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            sectionDescAr: e.target.value,
                          })
                        }
                        placeholder="نص قصير أو تمهيدي للقسم يظهر تحت الهيرو"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف القسم القصير (إنجليزي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.sectionDescEn || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            sectionDescEn: e.target.value,
                          })
                        }
                        placeholder="Short introduction under hero in English"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-100">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الوصف التفصيلي السفلي (يظهر أسفل شبكة المنتجات بالعربي)
                      </label>
                      <textarea
                        rows={3}
                        value={editingItem.bottomDescriptionAr || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            bottomDescriptionAr: e.target.value,
                          })
                        }
                        placeholder="مقالة أو وصف تفصيلي يعزز الـ SEO وأرشفة الصفحة"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الوصف التفصيلي السفلي (إنجليزي)
                      </label>
                      <textarea
                        rows={3}
                        value={editingItem.bottomDescriptionEn || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingItem,
                            bottomDescriptionEn: e.target.value,
                          })
                        }
                        placeholder="Detailed bottom description for SEO"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: SEO & SCHEMA SETTINGS */}
              {activeTab === 'seo' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <strong className="text-xs font-bold text-slate-900 block">
                      🌐 إعدادات SEO محركات البحث والسكيما الهيكلية:
                    </strong>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الميتا SEO (Title Tag - العربي)
                      </label>
                      <input
                        type="text"
                        value={editingItem.metaTitleAr || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, metaTitleAr: e.target.value })
                        }
                        placeholder="عنوان أرشفة قوقل بالعربي"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-bold"
                      />
                      <div className="mt-1 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-[#8C6D3F]">الظهور في قوقل:</span>{' '}
                        <span className="text-slate-700 font-bold font-mono">
                          {formatMetaTitle(
                            editingItem.metaTitleAr || editingItem.nameAr || 'اسم القسم',
                            'ar',
                            'SA'
                          )}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الميتا SEO (Title Tag - الإنجليزي)
                      </label>
                      <input
                        type="text"
                        value={editingItem.metaTitleEn || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, metaTitleEn: e.target.value })
                        }
                        placeholder="Google Meta Title in English"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                      <div className="mt-1 text-[10px] text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-200">
                        <span className="font-semibold text-[#8C6D3F]">Google Preview:</span>{' '}
                        <span className="text-slate-700 font-bold font-mono">
                          {formatMetaTitle(
                            editingItem.metaTitleEn || editingItem.nameEn || 'Category Name',
                            'en',
                            'SA'
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف الميتا SEO (Description Tag - العربي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.metaDescAr || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, metaDescAr: e.target.value })
                        }
                        placeholder="وصف البحث المختر قوقل (120 - 160 حرف)"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف الميتا SEO (Description Tag - الإنجليزي)
                      </label>
                      <textarea
                        rows={2}
                        value={editingItem.metaDescEn || ''}
                        onChange={(e) =>
                          setEditingProduct({ ...editingItem, metaDescEn: e.target.value })
                        }
                        placeholder="Meta Description in English"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      الكلمات المفتاحية (Meta Keywords)
                    </label>
                    <input
                      type="text"
                      value={editingItem.metaKeywords || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingItem, metaKeywords: e.target.value })
                      }
                      placeholder="نظارات طبية, ماركة رايبان, عدسات لاصقة"
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      كود السكيما الهيكلية (JSON-LD Structured Data)
                    </label>
                    <textarea
                      rows={3}
                      value={editingItem.schemaJson || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingItem, schemaJson: e.target.value })
                      }
                      placeholder='{"@context":"https://schema.org","@type":"CollectionPage", ...}'
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono text-slate-700 bg-slate-50"
                    />
                  </div>
                </div>
              )}

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#A58454] hover:bg-[#8e6b3e] text-white font-bold text-xs shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التغييرات بالكامل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
