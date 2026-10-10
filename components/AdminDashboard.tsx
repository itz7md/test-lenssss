'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Product, ProductColorVariant, PackSizeOption, CountryCode, BlogPost, Order, HeroSlide } from '@/types';
import {
  X,
  Package,
  ShoppingBag,
  Calendar,
  Tag,
  Copy,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Edit,
  Send,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  Layers,
  Globe,
  Check,
  BarChart3,
  TrendingUp,
  Glasses,
  Eye,
  Sun,
  Shield,
  FileCode,
  RefreshCw,
  ExternalLink,
  FileText,
  BookOpen,
  LogOut,
  ChevronDown,
  User,
  Database,
  Cloud,
  Settings,
} from 'lucide-react';
import Image from 'next/image';
import Logo from './Logo';
import { Price } from './Price';
import { SaudiRiyal } from './SaudiRiyal';
import { CategoryManager } from './CategoryManager';
import { ImageUploader } from './ImageUploader';
import {
  autoGenerateProductSeo,
  buildProductSchemaJson,
} from '@/lib/catalogHelpers';
import { getBrandName } from '@/lib/brands';
import { GCC_COUNTRIES } from '@/data/countries';
import {
  saveProductToFirestore,
  saveCategoryToFirestore,
  saveSettingsToFirestore,
} from '@/lib/firestoreService';

const DEFAULT_PACK_SIZES: PackSizeOption[] = [
  {
    id: 'pack-size-default',
    count: 30,
    labelAr: 'علبة 30 عدسة',
    labelEn: 'Box of 30 Lenses',
    priceSAR: 0,
    customGccPrices: {}
  }
];

// --- Localized Suggestions Dictionaries & Writable Combobox ---
export interface ComboboxOption {
  ar: string;
  en: string;
}

export const FIXED_MAIN_CATEGORIES: ComboboxOption[] = [
  { ar: 'نظارات طبية', en: 'Eyeglasses' },
  { ar: 'نظارات شمسية', en: 'Sunglasses' },
  { ar: 'عدسات لاصقة', en: 'Contact Lenses' },
  { ar: 'نظارات أطفال', en: 'Kids Eyewear' },
  { ar: 'إكسسوارات', en: 'Accessories' },
  { ar: 'عناية', en: 'Care' },
];

export const CATEGORY_SUGGESTIONS: ComboboxOption[] = [];
export const BRAND_SUGGESTIONS: ComboboxOption[] = [];
export const GENDER_SUGGESTIONS: ComboboxOption[] = [];
export const FRAME_SHAPE_SUGGESTIONS: ComboboxOption[] = [];
export const CL_SUBCATEGORY_SUGGESTIONS: ComboboxOption[] = [];
export const CL_DURATION_SUGGESTIONS: ComboboxOption[] = [];
export const ACCESSORY_MATERIAL_SUGGESTIONS: ComboboxOption[] = [];
export const ACCESSORY_FEATURE_SUGGESTIONS: ComboboxOption[] = [];
export const DYNAMIC_SPEC_SUGGESTIONS: ComboboxOption[] = [];

const WritableCombobox: React.FC<{
  labelAr: string;
  labelEn: string;
  suggestions: ComboboxOption[];
  valueAr: string;
  valueEn: string;
  onChangeAr: (val: string) => void;
  onChangeEn: (val: string) => void;
  onDeleteOption?: (opt: ComboboxOption) => void;
  required?: boolean;
  readOnly?: boolean;
}> = ({ labelAr, labelEn, suggestions, valueAr, valueEn, onChangeAr, onChangeEn, onDeleteOption, required = false, readOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [prevValueAr, setPrevValueAr] = useState(valueAr);
  const [search, setSearch] = useState(valueAr);

  if (valueAr !== prevValueAr) {
    setPrevValueAr(valueAr);
    setSearch(valueAr);
  }

  // When opening dropdown without user typing a different search query, show all stored options
  const isActivelyFiltering = search.trim() !== '' && search.trim() !== (valueAr || '').trim();
  const filtered = isActivelyFiltering
    ? suggestions.filter(s => 
        s.ar.toLowerCase().includes(search.toLowerCase()) || 
        s.en.toLowerCase().includes(search.toLowerCase())
      )
    : suggestions;

  return (
    <div className="relative space-y-1">
      <div className="flex justify-between items-center">
        <label className="block text-[11px] font-bold text-slate-700 font-kufi">
          {labelAr} {required && '*'}
        </label>
        {!readOnly && <span className="text-[10px] text-slate-400 font-sans">{labelEn}</span>}
      </div>
      
      <div className={readOnly ? "grid grid-cols-1" : "grid grid-cols-1 sm:grid-cols-2 gap-2.5"}>
        <div className="relative">
          <input
            type="text"
            required={required}
            readOnly={readOnly}
            value={search}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 250)}
            onChange={(e) => {
              if (readOnly) return;
              const text = e.target.value;
              setSearch(text);
              onChangeAr(text);
              const matched = suggestions.find(s => s.ar === text);
              if (matched) {
                onChangeEn(matched.en);
              }
            }}
            placeholder={readOnly ? "اضغط لاختيار القسم..." : "اختر أو اكتب قيمة..."}
            className={`w-full text-xs p-2.5 rounded-xl border border-slate-300 pr-8 bg-white font-semibold ${readOnly ? 'cursor-pointer' : ''}`}
          />
          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsOpen(prev => !prev);
            }}
            className="absolute inset-y-0 end-0 px-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            ▾
          </button>

          {isOpen && (
            <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-50">
              {filtered.map((opt) => (
                <div
                  key={opt.ar + '-' + opt.en}
                  className="w-full text-start text-xs p-2.5 hover:bg-slate-50 text-slate-800 font-semibold transition-colors flex items-center justify-between cursor-pointer group/item"
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onChangeAr(opt.ar);
                      onChangeEn(opt.en);
                      setSearch(opt.ar);
                      setIsOpen(false);
                    }}
                    className="flex-1 text-start py-0.5 truncate pe-1"
                  >
                    {opt.ar} <span className="text-slate-400 font-normal">({opt.en})</span>
                  </button>
                  {onDeleteOption && !readOnly && (
                    <button
                      type="button"
                      title="حذف القيمة الانجليزية والعربية من الكومبوبوكس"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onDeleteOption(opt);
                      }}
                      className="opacity-60 group-hover/item:opacity-100 text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-md transition-all shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              {filtered.length === 0 && !readOnly && (
                <div className="text-slate-400 text-[11px] p-2.5 text-center font-sans">
                  ✍️ اكتب قيمة مخصصة لحفظها
                </div>
              )}
            </div>
          )}
        </div>

        {!readOnly && (
          <input
            type="text"
            required={required}
            value={valueEn}
            onChange={(e) => onChangeEn(e.target.value)}
            placeholder="English equivalent..."
            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-mono text-slate-600"
          />
        )}
      </div>
    </div>
  );
};

export const AdminDashboard: React.FC = () => {
  const {
    isAdmin,
    isAdminOpen,
    setIsAdminOpen,
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    duplicateProduct,
    reorderProductColors,
    orders,
    updateOrderStatus,
    appointments,
    updateAppointmentStatus,
    coupons,
    addCoupon,
    country,
    blogPosts,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    isFirestoreSyncing,
    syncDatabaseToFirestore,
    settings,
    updateSettings,
    categoryConfigs,
    addCategoryConfig,
    deleteCategoryConfig,
  } = useApp();

  // Force Admin Dashboard interface to be 100% Arabic ALWAYS
  const language = 'ar';
  const t = (arText: string, _enText?: string) => arText;

  // Dynamic state for Combobox Suggestions so items can be deleted with their linked EN values

  const [categorySuggestions, setCategorySuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_category_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return FIXED_MAIN_CATEGORIES;
  });

  const [brandSuggestions, setBrandSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_brand_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return BRAND_SUGGESTIONS;
  });

  const [genderSuggestions, setGenderSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_gender_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return GENDER_SUGGESTIONS;
  });

  const [frameShapeSuggestions, setFrameShapeSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_frame_shape_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return FRAME_SHAPE_SUGGESTIONS;
  });

  const [clSubcategorySuggestions, setClSubcategorySuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_cl_subcategory_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return CL_SUBCATEGORY_SUGGESTIONS;
  });

  const [clDurationSuggestions, setClDurationSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_cl_duration_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return CL_DURATION_SUGGESTIONS;
  });

  const [accessoryMaterialSuggestions, setAccessoryMaterialSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_acc_material_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return ACCESSORY_MATERIAL_SUGGESTIONS;
  });

  // Derived active suggestions combining database categoryConfigs, stored products, and runtime options
  const activeCategorySuggestions = useMemo(() => {
    const list: ComboboxOption[] = [...categorySuggestions];
    (categoryConfigs || [])
      .filter((c) => c.itemType === 'category')
      .forEach((c) => {
        if (!list.some((item) => item.ar === c.nameAr || item.en.toLowerCase() === c.nameEn?.toLowerCase())) {
          list.push({ ar: c.nameAr, en: c.nameEn });
        }
      });
    return list;
  }, [categorySuggestions, categoryConfigs]);

  const activeBrandSuggestions = useMemo(() => {
    const list: ComboboxOption[] = [];
    const addIfNew = (ar?: string, en?: string) => {
      const cleanAr = (ar || '').trim();
      const cleanEn = (en || ar || '').trim();
      if (!cleanAr) return;
      if (!list.some(item => item.ar.toLowerCase() === cleanAr.toLowerCase())) {
        list.push({ ar: cleanAr, en: cleanEn });
      }
    };

    // 1. From categoryConfigs in database / Firestore
    (categoryConfigs || []).forEach(c => {
      if (c.itemType === 'brand') {
        addIfNew(c.nameAr, c.nameEn);
      }
    });

    // 2. From all products in the database
    (products || []).forEach(p => {
      if (p.brandAr || p.brand) {
        addIfNew(p.brandAr || p.brand, p.brandEn || p.brand);
      }
    });

    // 3. From user's runtime brandSuggestions state
    brandSuggestions.forEach(s => addIfNew(s.ar, s.en));

    return list;
  }, [categoryConfigs, products, brandSuggestions]);

  const activeGenderSuggestions = useMemo(() => {
    return [
      { ar: 'للجنسين', en: 'Unisex' },
      { ar: 'رجال', en: 'Men' },
      { ar: 'نساء', en: 'Women' },
    ];
  }, []);

  const activeFrameShapeSuggestions = useMemo(() => {
    const list: ComboboxOption[] = [];
    const addIfNew = (ar?: string, en?: string) => {
      const cleanAr = (ar || '').trim();
      const cleanEn = (en || ar || '').trim();
      if (!cleanAr) return;
      if (!list.some(item => item.ar.toLowerCase() === cleanAr.toLowerCase())) {
        list.push({ ar: cleanAr, en: cleanEn });
      }
    };

    // 1. From categoryConfigs in database / Firestore
    (categoryConfigs || []).forEach(c => {
      if (c.itemType === 'shape') {
        addIfNew(c.nameAr, c.nameEn);
      }
    });

    // 2. From all products in the database
    (products || []).forEach(p => {
      if (p.frameShapeAr || p.frameShape) {
        addIfNew(p.frameShapeAr || p.frameShape, p.frameShapeEn || p.frameShape);
      }
    });

    // 3. From user's runtime frameShapeSuggestions state
    frameShapeSuggestions.forEach(s => addIfNew(s.ar, s.en));

    return list;
  }, [categoryConfigs, products, frameShapeSuggestions]);

  const activeClDurationSuggestions = useMemo(() => {
    const list: ComboboxOption[] = [];
    const addIfNew = (ar?: string, en?: string) => {
      const cleanAr = (ar || '').trim();
      const cleanEn = (en || ar || '').trim();
      if (!cleanAr) return;
      if (!list.some(item => item.ar.toLowerCase() === cleanAr.toLowerCase())) {
        list.push({ ar: cleanAr, en: cleanEn });
      }
    };

    // 1. From categoryConfigs in database / Firestore
    (categoryConfigs || []).forEach(c => {
      if (c.itemType === 'duration') {
        addIfNew(c.nameAr, c.nameEn);
      }
    });

    // 2. From all products in the database
    (products || []).forEach(p => {
      if (p.contactLensDurationAr || p.contactLensDuration) {
        addIfNew(p.contactLensDurationAr || p.contactLensDuration, p.contactLensDurationEn || p.contactLensDuration);
      }
    });

    // 3. From user's runtime clDurationSuggestions state
    clDurationSuggestions.forEach(s => addIfNew(s.ar, s.en));

    return list;
  }, [categoryConfigs, products, clDurationSuggestions]);

  const activeClSubcategorySuggestions = useMemo(() => {
    const list: ComboboxOption[] = [];
    const addIfNew = (ar?: string, en?: string) => {
      const cleanAr = (ar || '').trim();
      const cleanEn = (en || ar || '').trim();
      if (!cleanAr) return;
      if (!list.some(item => item.ar.toLowerCase() === cleanAr.toLowerCase())) {
        list.push({ ar: cleanAr, en: cleanEn });
      }
    };

    // 1. From categoryConfigs in database / Firestore
    (categoryConfigs || []).forEach(c => {
      if (c.itemType === 'subcategory') {
        addIfNew(c.nameAr, c.nameEn);
      }
    });

    // 2. From all products in the database
    (products || []).forEach(p => {
      if (p.subCategoryAr || p.subCategory) {
        addIfNew(p.subCategoryAr || p.subCategory, p.subCategoryEn || p.subCategory);
      }
    });

    // 3. From user's runtime clSubcategorySuggestions state
    clSubcategorySuggestions.forEach(s => addIfNew(s.ar, s.en));

    return list;
  }, [categoryConfigs, products, clSubcategorySuggestions]);

  const [accessoryFeatureSuggestions, setAccessoryFeatureSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_acc_feature_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return ACCESSORY_FEATURE_SUGGESTIONS;
  });

  const [dynamicSpecSuggestions, setDynamicSpecSuggestions] = useState<ComboboxOption[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('lc_dyn_spec_suggestions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return DYNAMIC_SPEC_SUGGESTIONS;
  });

  const handleDeleteCategoryOption = (optToDelete: ComboboxOption) => {
    setCategorySuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_category_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
    const matched = (categoryConfigs || []).find(c => c.itemType === 'category' && (c.nameAr === optToDelete.ar || c.nameEn === optToDelete.en));
    if (matched) {
      deleteCategoryConfig(matched.id);
    }
  };

  const handleDeleteBrandOption = (optToDelete: ComboboxOption) => {
    setBrandSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_brand_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
    const matched = (categoryConfigs || []).find(c => c.itemType === 'brand' && (c.nameAr === optToDelete.ar || c.nameEn === optToDelete.en));
    if (matched) {
      deleteCategoryConfig(matched.id);
    }
  };

  const handleDeleteGenderOption = (optToDelete: ComboboxOption) => {
    setGenderSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_gender_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleDeleteFrameShapeOption = (optToDelete: ComboboxOption) => {
    setFrameShapeSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_frame_shape_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
    const matched = (categoryConfigs || []).find(c => c.itemType === 'shape' && (c.nameAr === optToDelete.ar || c.nameEn === optToDelete.en));
    if (matched) {
      deleteCategoryConfig(matched.id);
    }
  };

  const handleDeleteClSubcategoryOption = (optToDelete: ComboboxOption) => {
    setClSubcategorySuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_cl_subcategory_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
    const matched = (categoryConfigs || []).find(c => c.itemType === 'subcategory' && (c.nameAr === optToDelete.ar || c.nameEn === optToDelete.en));
    if (matched) {
      deleteCategoryConfig(matched.id);
    }
  };

  const handleDeleteClDurationOption = (optToDelete: ComboboxOption) => {
    setClDurationSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_cl_duration_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
    const matched = (categoryConfigs || []).find(c => c.itemType === 'duration' && (c.nameAr === optToDelete.ar || c.nameEn === optToDelete.en));
    if (matched) {
      deleteCategoryConfig(matched.id);
    }
  };

  const handleDeleteAccessoryMaterialOption = (optToDelete: ComboboxOption) => {
    setAccessoryMaterialSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_acc_material_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleDeleteAccessoryFeatureOption = (optToDelete: ComboboxOption) => {
    setAccessoryFeatureSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_acc_feature_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const handleDeleteDynamicSpecOption = (optToDelete: ComboboxOption) => {
    setDynamicSpecSuggestions(prev => {
      const next = prev.filter(opt => opt.ar !== optToDelete.ar && opt.en !== optToDelete.en);
      try { localStorage.setItem('lc_dyn_spec_suggestions', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  // Prevent background page scrolling while Admin Dashboard is open
  useEffect(() => {
    if (isAdminOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isAdminOpen]);

  // Admin user menu dropdown state
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const handleLogout = () => {
    setIsUserMenuOpen(false);
    setIsAdminOpen(false);
    if (typeof window !== 'undefined') {
      alert('تم تسجيل الخروج من لوحة التحكم بنجاح');
    }
  };

  const handleBackToSite = () => {
    setIsUserMenuOpen(false);
    setIsAdminOpen(false);
  };

  const [activeTab, setActiveTab] = useState<
    'overview' | 'products' | 'orders' | 'brands' | 'appointments' | 'coupons' | 'settings' | 'blog'
  >('overview');

  // Product Catalog Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');
  const [selectedStockFilter, setSelectedStockFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock'>('all');

  // Product Editor Modal State & Sub-tab
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddMode, setIsAddMode] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'basic' | 'pricing' | 'specs' | 'colors' | 'seo'>('basic');
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [activeLangTab, setActiveLangTab] = useState<'ar' | 'en'>('ar');
  const [editorMode, setEditorMode] = useState<'visual' | 'source'>('visual');

  // Blog Post Editor State
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isBlogAddMode, setIsBlogAddMode] = useState<boolean>(false);
  const [blogWizardStep, setBlogWizardStep] = useState<number>(1);
  const [blogEditorMode, setBlogEditorMode] = useState<'visual' | 'source'>('visual');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogLangTab, setBlogLangTab] = useState<'ar' | 'en'>('ar');

  // Orders Search & Filter
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOtoCarrier, setSelectedOtoCarrier] = useState<{ [orderId: string]: string }>({});
  const [otoFulfillmentStatus, setOtoFulfillmentStatus] = useState<{ [orderId: string]: 'idle' | 'loading' | 'success' | 'error' }>({});
  const [otoErrorMessage, setOtoErrorMessage] = useState<{ [orderId: string]: string }>({});
  const [otoWaybillUrl, setOtoWaybillUrl] = useState<{ [orderId: string]: string }>({});
  const [otoTrackingNumber, setOtoTrackingNumber] = useState<{ [orderId: string]: string }>({});

  // New Coupon Form State
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'percentage' | 'fixed'>('percentage');
  const [newCouponVal, setNewCouponVal] = useState<number>(0);
  const [newCouponMin, setNewCouponMin] = useState<number>(0);

  // Success Notification banner
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Local settings state for manual save-on-click
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleFulfillWithOto = async (order: Order) => {
    const carrier = selectedOtoCarrier[order.id] || 'Aramex';
    
    setOtoFulfillmentStatus(prev => ({ ...prev, [order.id]: 'loading' }));
    setOtoErrorMessage(prev => ({ ...prev, [order.id]: '' }));
    
    try {
      const res = await fetch('/api/oto/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order, carrier })
      });
      
      const data = await res.json();
      
      if (data.success) {
        setOtoFulfillmentStatus(prev => ({ ...prev, [order.id]: 'success' }));
        if (data.shipmentDetails?.waybillPdf) {
          setOtoWaybillUrl(prev => ({ ...prev, [order.id]: data.shipmentDetails.waybillPdf }));
        }
        if (data.shipmentDetails?.trackingNumber) {
          setOtoTrackingNumber(prev => ({ ...prev, [order.id]: data.shipmentDetails.trackingNumber }));
        }
        
        // Update order status in client/Firebase to "shipped"
        updateOrderStatus(order.id, 'shipped');
        showNotice(`✅ تم تسجيل الشحنة مع ${data.shipmentDetails.deliveryCompany} برقم تتبع ${data.shipmentDetails.trackingNumber}!`);
      } else {
        setOtoFulfillmentStatus(prev => ({ ...prev, [order.id]: 'error' }));
        setOtoErrorMessage(prev => ({ ...prev, [order.id]: data.error || 'فشلت معالجة الشحن.' }));
      }
    } catch (err: any) {
      setOtoFulfillmentStatus(prev => ({ ...prev, [order.id]: 'error' }));
      setOtoErrorMessage(prev => ({ ...prev, [order.id]: err.message || 'حدث خطأ غير متوقع.' }));
    }
  };

  const handleSaveSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      setIsSavingSettings(true);
      await updateSettings(localSettings);
      showNotice('✅ تم حفظ إعدادات المنصة والهوية بنجاح في Firebase!');
    } catch (err: any) {
      showNotice(`فشل حفظ الإعدادات: ${err?.message || 'يرجى المحاولة مجدداً'}`);
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Hero Slides Helpers
  const handleAddHeroSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-slide-${Date.now()}`,
      image: '',
      badgeAr: '',
      badgeEn: '',
      highlightAr: '',
      highlightEn: '',
      titleAr: '',
      titleEn: '',
      subtitleAr: '',
      subtitleEn: '',
      ctaTextAr: 'تسوق الآن',
      ctaTextEn: 'Shop Now',
      ctaLink: '/shop',
      secondaryCtaTextAr: '',
      secondaryCtaTextEn: '',
      secondaryCtaLink: '',
      isVipAction: false,
    };
    setLocalSettings((prev) => ({
      ...prev,
      heroSlides: [...(prev.heroSlides || []), newSlide],
    }));
  };

  const handleUpdateHeroSlide = (index: number, updatedField: Partial<HeroSlide>) => {
    setLocalSettings((prev) => {
      const slides = [...(prev.heroSlides || [])];
      if (slides[index]) {
        slides[index] = { ...slides[index], ...updatedField };
      }
      return { ...prev, heroSlides: slides };
    });
  };

  const handleDeleteHeroSlide = (index: number) => {
    setLocalSettings((prev) => {
      const slides = (prev.heroSlides || []).filter((_, idx) => idx !== index);
      return { ...prev, heroSlides: slides };
    });
  };

  const handleMoveHeroSlide = (index: number, direction: 'up' | 'down') => {
    setLocalSettings((prev) => {
      const slides = [...(prev.heroSlides || [])];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= slides.length) return prev;
      const temp = slides[index];
      slides[index] = slides[targetIndex];
      slides[targetIndex] = temp;
      return { ...prev, heroSlides: slides };
    });
  };

  // Active country info for Schema.org preview
  const currentCountryInfo = GCC_COUNTRIES[country] || GCC_COUNTRIES['SA'];

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  // KPI Calculations
  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.totalSAR : 0), 0);
    const totalOrdersCount = orders.length;
    const totalUnitsInStock = products.reduce(
      (sum, p) => sum + p.colors.reduce((s, c) => s + c.stock, 0),
      0
    );
    const lowStockCount = products.filter(
      (p) => p.colors.reduce((s, c) => s + c.stock, 0) < 10
    ).length;
    const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pending').length;

    return {
      totalRevenue,
      totalOrdersCount,
      totalUnitsInStock,
      lowStockCount,
      pendingAppointmentsCount,
      totalProductsCount: products.length,
    };
  }, [orders, products, appointments]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        productSearch === '' ||
        p.nameAr.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.nameEn.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.brand.toLowerCase().includes(productSearch.toLowerCase());

      const matchCategory =
        selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;

      const matchBrand =
        selectedBrandFilter === 'all' || p.brand.toLowerCase() === selectedBrandFilter.toLowerCase();

      const totalStock = p.colors.reduce((s, c) => s + c.stock, 0);
      let matchStock = true;
      if (selectedStockFilter === 'in_stock') matchStock = totalStock >= 10;
      else if (selectedStockFilter === 'low_stock') matchStock = totalStock > 0 && totalStock < 10;
      else if (selectedStockFilter === 'out_of_stock') matchStock = totalStock === 0;

      return matchSearch && matchCategory && matchBrand && matchStock;
    });
  }, [products, productSearch, selectedCategoryFilter, selectedBrandFilter, selectedStockFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        orderSearch === '' ||
        o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.name.toLowerCase().includes(orderSearch.toLowerCase()) ||
        o.customer.phone.includes(orderSearch);

      const matchStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [orders, orderSearch, orderStatusFilter]);

  if (!isAdminOpen) return null;

  const handleDuplicate = (id: string) => {
    const clone = duplicateProduct(id);
    if (clone) {
      showNotice(
        language === 'ar'
          ? `تم تكرار المنتج بنجاح! المخزون متزامن برمز SKU (${clone.sku}).`
          : `Product cloned! Shared SKU (${clone.sku}) synchronized.`
      );
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    // Automatically persist any newly typed Brand to categoryConfigs if not already saved
    if (editingProduct.brandAr || editingProduct.brand) {
      const bAr = (editingProduct.brandAr || editingProduct.brand || '').trim();
      const bEn = (editingProduct.brandEn || editingProduct.brand || bAr || '').trim();
      const bSlug = bEn.toLowerCase().replace(/\s+/g, '-');
      const exists = (categoryConfigs || []).some(c => c.itemType === 'brand' && (c.nameAr === bAr || c.slug === bSlug));
      if (!exists && bAr) {
        addCategoryConfig({
          id: `brand-${Date.now()}-${bSlug}`,
          itemType: 'brand',
          nameAr: bAr,
          nameEn: bEn,
          slug: bSlug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
        });
      }
    }

    // Automatically persist any newly typed Frame Shape to categoryConfigs if not already saved
    if (editingProduct.frameShapeAr || editingProduct.frameShape) {
      const sAr = (editingProduct.frameShapeAr || editingProduct.frameShape || '').trim();
      const sEn = (editingProduct.frameShapeEn || editingProduct.frameShape || sAr || '').trim();
      const sSlug = sEn.toLowerCase().replace(/\s+/g, '-');
      const exists = (categoryConfigs || []).some(c => c.itemType === 'shape' && (c.nameAr === sAr || c.slug === sSlug));
      if (!exists && sAr) {
        addCategoryConfig({
          id: `shape-${Date.now()}-${sSlug}`,
          itemType: 'shape',
          nameAr: sAr,
          nameEn: sEn,
          slug: sSlug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
        });
      }
    }

    // Automatically persist any newly typed Duration to categoryConfigs if not already saved
    if (editingProduct.contactLensDurationAr || editingProduct.contactLensDuration) {
      const dAr = (editingProduct.contactLensDurationAr || editingProduct.contactLensDuration || '').trim();
      const dEn = (editingProduct.contactLensDurationEn || editingProduct.contactLensDuration || dAr || '').trim();
      const dSlug = dEn.toLowerCase().replace(/\s+/g, '-');
      const exists = (categoryConfigs || []).some(c => c.itemType === 'duration' && (c.nameAr === dAr || c.slug === dSlug));
      if (!exists && dAr) {
        addCategoryConfig({
          id: `duration-${Date.now()}-${dSlug}`,
          itemType: 'duration',
          nameAr: dAr,
          nameEn: dEn,
          slug: dSlug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
        });
      }
    }

    // Automatically persist any newly typed Lens Subcategory to categoryConfigs if not already saved
    if (editingProduct.subCategoryAr || editingProduct.subCategory) {
      const subAr = (editingProduct.subCategoryAr || editingProduct.subCategory || '').trim();
      const subEn = (editingProduct.subCategoryEn || editingProduct.subCategory || subAr || '').trim();
      const subSlug = subEn.toLowerCase().replace(/\s+/g, '-');
      const exists = (categoryConfigs || []).some(c => c.itemType === 'subcategory' && (c.nameAr === subAr || c.slug === subSlug));
      if (!exists && subAr) {
        addCategoryConfig({
          id: `sub-${Date.now()}-${subSlug}`,
          itemType: 'subcategory',
          nameAr: subAr,
          nameEn: subEn,
          slug: subSlug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
        });
      }
    }

    if (isAddMode) {
      addProduct(editingProduct);
      showNotice(language === 'ar' ? 'تمت إضافة المنتج الجديد بنجاح!' : 'New product added successfully!');
    } else {
      updateProduct(editingProduct.id, editingProduct);
      showNotice(language === 'ar' ? 'تم حفظ تعديلات المنتج بنجاح!' : 'Product updated successfully!');
    }
    setEditingProduct(null);
  };

  // --- BLOG POST HELPER FUNCTIONS ---
  const autoGenerateBlogPostSeo = (post: Partial<BlogPost>) => {
    const titleAr = post.titleAr || 'مقال جديد في المدونة';
    const titleEn = post.titleEn || 'New Blog Article';
    const excerptAr = post.excerptAr || 'مقال مميز يتناول أهم النصائح والمعلومات الطبية والفنية للعناية بالعين والعدسات اللاصقة...';
    const excerptEn = post.excerptEn || 'An insightful article sharing premium tips, guidelines, and reviews on optical frames, lenses, and eye care...';

    const baseSlug = (post.titleEn || post.titleAr || 'blog-post')
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const slug = baseSlug || `post-${Date.now()}`;

    const seoTitleAr = `${titleAr} | مدونة لنس كود الطبية`;
    const seoTitleEn = `${titleEn} | LensCode Medical Blog`;
    const seoDescAr = `${excerptAr.substring(0, 150)}... تفضل بقراءة المقال الكامل.`;
    const seoDescEn = `${excerptEn.substring(0, 150)}... Read the full article on LensCode.`;
    const categoryKeywordAr = post.categoryAr || post.category || 'نظارات';
    const categoryKeywordEn = post.categoryEn || post.category || 'glasses';
    const seoKeywords = `${categoryKeywordAr}, مدونة عدسات, نصائح عيون, ${categoryKeywordEn}, eye-care, blog`;

    return {
      slug,
      seoTitleAr,
      seoTitleEn,
      seoDescAr,
      seoDescEn,
      seoKeywords,
    };
  };

  const buildBlogPostSchemaJson = (post: BlogPost, countryUrl: string) => {
    return JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": `${countryUrl}/blog/${post.slug}`
      },
      "headline": post.titleAr,
      "description": post.excerptAr,
      "image": post.coverImage,
      "author": {
        "@type": "Organization",
        "name": "LensCode Opticals",
        "url": countryUrl
      },
      "publisher": {
        "@type": "Organization",
        "name": "LensCode",
        "logo": {
          "@type": "ImageObject",
          "url": `${countryUrl}/images/logo.png`
        }
      },
      "datePublished": post.date || new Date().toISOString().split('T')[0],
      "dateModified": new Date().toISOString().split('T')[0]
    }, null, 2);
  };

  const handleSaveBlogPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBlogPost) return;

    if (isBlogAddMode) {
      addBlogPost(editingBlogPost);
      showNotice(language === 'ar' ? 'تمت إضافة المقال الجديد بنجاح!' : 'New blog post added successfully!');
    } else {
      updateBlogPost(editingBlogPost.id, editingBlogPost);
      showNotice(language === 'ar' ? 'تم حفظ تعديلات المقال بنجاح!' : 'Blog post updated successfully!');
    }
    setEditingBlogPost(null);
  };

  const handleOpenAddBlog = () => {
    const newId = `blog-${Date.now()}`;
    const initialPost: BlogPost = {
      id: newId,
      slug: `blog-post-${Date.now()}`,
      titleAr: '',
      titleEn: '',
      excerptAr: '',
      excerptEn: '',
      contentAr: '',
      contentEn: '',
      coverImage: '',
      coverImageAltAr: '',
      coverImageAltEn: '',
      date: new Date().toISOString().split('T')[0],
      readTime: '',
      category: '',
      categoryAr: '',
      categoryEn: '',
      seoTitleAr: '',
      seoTitleEn: '',
      seoDescAr: '',
      seoDescEn: '',
      seoKeywords: '',
      schemaJson: '',
    };

    setEditingBlogPost(initialPost);
    setIsBlogAddMode(true);
    setBlogWizardStep(1);
  };

  const handleOpenEditBlog = (post: BlogPost) => {
    setEditingBlogPost({ ...post });
    setIsBlogAddMode(false);
    setBlogWizardStep(1);
  };

  const handleDuplicateBlog = (post: BlogPost) => {
    const clone: BlogPost = {
      ...post,
      id: `blog-dup-${Date.now()}`,
      slug: `${post.slug}-copy`,
      titleAr: `${post.titleAr} (نسخة)`,
      titleEn: `${post.titleEn} (Copy)`,
      date: new Date().toISOString().split('T')[0]
    };
    addBlogPost(clone);
    showNotice(language === 'ar' ? 'تم تكرار المقال بنجاح!' : 'Blog post duplicated!');
  };

  const handleBlogAutoSeo = () => {
    if (!editingBlogPost) return;
    const autoSeo = autoGenerateBlogPostSeo(editingBlogPost);
    setEditingBlogPost({
      ...editingBlogPost,
      seoTitleAr: autoSeo.seoTitleAr,
      seoTitleEn: autoSeo.seoTitleEn,
      seoDescAr: autoSeo.seoDescAr,
      seoDescEn: autoSeo.seoDescEn,
      seoKeywords: autoSeo.seoKeywords,
      schemaJson: buildBlogPostSchemaJson(editingBlogPost, 'https://lenscode.sa')
    });
    showNotice(language === 'ar' ? 'تم توليد الـ SEO والسكيما للمقال بنجاح!' : 'Blog SEO & Schema generated!');
  };

  const handleOpenAdd = () => {
    const newId = `prod-${Date.now()}`;
    const initialProduct: Product = {
      id: newId,
      sku: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
      nameAr: '',
      nameEn: '',
      slug: `product-${Date.now()}`,
      brand: '',
      brandAr: '',
      brandEn: '',
      category: 'eyeglasses',
      categoryAr: 'نظارات طبية',
      categoryEn: 'Eyeglasses',
      subCategory: '',
      subCategoryAr: '',
      subCategoryEn: '',
      descriptionAr: '',
      descriptionEn: '',
      shortDescriptionAr: '',
      shortDescriptionEn: '',
      basePriceSAR: 0,
      frameShape: '',
      frameShapeAr: '',
      frameShapeEn: '',
      frameMaterial: 'tr90',
      contactLensDuration: '',
      contactLensDurationAr: '',
      contactLensDurationEn: '',
      gender: 'unisex',
      genderAr: 'للجنسين',
      genderEn: 'Unisex',
      lensType: 'medical',
      colors: [
        {
          id: `clr-${Date.now()}-1`,
          nameAr: '',
          nameEn: '',
          hex: '#000000',
          image: '',
          stock: 0,
        },
      ],
      specs: {
        frameMaterial: '',
        lensWidth: '',
        bridgeWidth: '',
        templeLength: '',
        origin: '',
        weight: '',
      },
      rating: 5.0,
      reviewsCount: 0,
      isFeatured: false,
      isBestSeller: false,
      isNewArrival: false,
      seoTitleAr: '',
      seoTitleEn: '',
      seoDescAr: '',
      seoDescEn: '',
      seoKeywords: '',
    };

    setEditingProduct(initialProduct);
    setIsAddMode(true);
    setModalTab('basic');
    setWizardStep(1);
  };

  const handleAddColorToEditing = () => {
    if (!editingProduct) return;
    const newColor: ProductColorVariant = {
      id: `clr-${Date.now()}-${editingProduct.colors.length + 1}`,
      nameAr: '',
      nameEn: '',
      hex: '#000000',
      image: '',
      stock: 0,
    };
    setEditingProduct({
      ...editingProduct,
      colors: [...editingProduct.colors, newColor],
    });
  };

  const handleAddPackSizeToEditing = () => {
    if (!editingProduct) return;
    const newPack: PackSizeOption = {
      id: `pack-${Date.now()}`,
      count: 0,
      labelAr: '',
      labelEn: '',
      priceSAR: 0,
    };
    setEditingProduct({
      ...editingProduct,
      packSizes: [...(editingProduct.packSizes || []), newPack],
    });
  };

  const handleApplyAutoSeo = () => {
    if (!editingProduct) return;
    const seo = autoGenerateProductSeo(editingProduct);
    setEditingProduct({
      ...editingProduct,
      slug: seo.slug,
      seoTitleAr: seo.seoTitleAr,
      seoTitleEn: seo.seoTitleEn,
      seoDescAr: seo.seoDescAr,
      seoDescEn: seo.seoDescEn,
      seoKeywords: seo.seoKeywords,
    });
    showNotice(language === 'ar' ? 'تم توليد بيانات الـ SEO والـ Schema بنجاح!' : 'SEO & Schema auto-generated!');
  };

  const insertTag = (field: 'ar' | 'en', openTag: string, closeTag: string) => {
    if (!editingProduct) return;
    const textareaId = field === 'ar' ? 'desc-ar-textarea' : 'desc-en-textarea';
    const el = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const replacement = openTag + (selected || '') + closeTag;
    const newValue = before + replacement + after;
    
    if (field === 'ar') {
      setEditingProduct({ ...editingProduct, descriptionAr: newValue });
    } else {
      setEditingProduct({ ...editingProduct, descriptionEn: newValue });
    }
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + (selected || '').length);
    }, 50);
  };

  const insertBlogTag = (field: 'ar' | 'en', openTag: string, closeTag: string) => {
    if (!editingBlogPost) return;
    const textareaId = field === 'ar' ? 'blog-content-ar-textarea' : 'blog-content-en-textarea';
    const el = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const before = text.substring(0, start);
    const selected = text.substring(start, end);
    const after = text.substring(end);
    
    const replacement = openTag + (selected || '') + closeTag;
    const newValue = before + replacement + after;
    
    if (field === 'ar') {
      setEditingBlogPost({ ...editingBlogPost, contentAr: newValue });
    } else {
      setEditingBlogPost({ ...editingBlogPost, contentEn: newValue });
    }
    
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + openTag.length, start + openTag.length + (selected || '').length);
    }, 50);
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    addCoupon({
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: newCouponVal,
      minSpendSAR: newCouponMin,
      expiryDate: '2026-12-31',
      isActive: true,
    });

    setNewCouponCode('');
    showNotice(
      language === 'ar' ? 'تم تفعيل كوبون الخصم الجديد بنجاح!' : 'New promo coupon activated successfully!'
    );
  };

  if (!isAdminOpen || !isAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-screen h-screen overflow-hidden animate-fadeIn">
      <div className="relative w-full h-full flex flex-col overflow-hidden bg-white">
        {/* Top Header Bar */}
        <div className="p-4 sm:px-6 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              <Logo widthDesktop={140} widthMobile={110} textColor="text-white" />
            </div>
            <div className="hidden sm:block border-s border-slate-700 ps-3">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-kufi">
                  {t('لوحة القيادة الإدارية والكتالوج الشامل', 'LensCode Executive Dashboard & Catalog')}
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                  Live Master Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {t(
                  'إدارة المنتجات، النظارات والعدسات اللاصقة والاستجماتيزم، فواتير ZATCA، و Schema.org',
                  'Full catalog, contact lenses & astigmatism, frame shapes, SEO & ZATCA'
                )}
              </p>
            </div>
          </div>

          {/* Admin User Profile & Dropdown Menu (Replaces old close button) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white transition-all cursor-pointer border border-slate-700/80 shadow-xs"
              title="حساب المسؤول"
            >
              <div className="w-7 h-7 rounded-full bg-[#A58454] text-white flex items-center justify-center text-xs font-bold shadow-2xs font-mono">
                D
              </div>
              <div className="text-start hidden sm:block">
                <span className="text-xs font-bold block leading-none">DEV</span>
                <span className="text-[10px] text-amber-300 block leading-tight">مشرف النظام</span>
              </div>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isUserMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsUserMenuOpen(false)}
                />
                <div className="absolute top-full mt-2 end-0 z-50 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200/90 py-2 w-56 font-kufi animate-fadeIn">
                  {/* User Profile Card Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60 rounded-t-2xl">
                    <span className="text-xs font-bold text-slate-900 block">DEV (المدير العام)</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5 font-mono">dev@lenscode.sa</span>
                  </div>

                  <div className="p-1 space-y-1">
                    {/* Back to Website */}
                    <button
                      type="button"
                      onClick={handleBackToSite}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors cursor-pointer text-start"
                    >
                      <ExternalLink className="w-4 h-4 text-[#A58454]" />
                      <span>الرجوع إلى الموقع</span>
                    </button>

                    {/* Log Out */}
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-start border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-600" />
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Global Notice Toast */}
        {adminNotice && (
          <div className="bg-emerald-600 text-white px-6 py-2.5 text-xs font-semibold flex items-center justify-between animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{adminNotice}</span>
            </div>
            <button onClick={() => setAdminNotice(null)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation Tabs Bar */}
        <div className="bg-slate-100 px-3 sm:px-6 py-2 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar border-b border-slate-200 shrink-0">
          {[
            { id: 'overview', labelAr: 'الرئيسية والتحليلات', labelEn: 'Overview', icon: BarChart3 },
            { id: 'products', labelAr: 'المنتجات والكتالوج', labelEn: 'Products & Catalog', icon: Package },
            { id: 'orders', labelAr: 'الطلبات وفواتير ZATCA', labelEn: 'Orders & ZATCA', icon: ShoppingBag },
            { id: 'brands', labelAr: 'الماركات والتصنيفات', labelEn: 'Brands & Categories', icon: Layers },
            { id: 'appointments', labelAr: 'مواعيد فحص VIP', labelEn: 'VIP Appointments', icon: Calendar },
            { id: 'coupons', labelAr: 'الكوبونات والعروض', labelEn: 'Coupons & Promos', icon: Tag },
            { id: 'blog', labelAr: 'المدونة والمقالات', labelEn: 'Blog & Articles', icon: FileText },
            { id: 'settings', labelAr: 'إعدادات المنصة', labelEn: 'Platform Settings', icon: Settings },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#A58454]' : 'text-slate-400'}`} />
                <span>{language === 'ar' ? tab.labelAr : tab.labelEn}</span>
              </button>
            );
          })}
        </div>

        {/* Main Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* 1. OVERVIEW & ANALYTICS */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-xs">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>{t('إجمالي المبيعات', 'Total Sales')}</span>
                    <TrendingUp className="w-4 h-4 text-[#C5A880]" />
                  </div>
                  <Price
                    amountSAR={stats.totalRevenue}
                    size="lg"
                    className="text-xl sm:text-2xl font-bold font-kufi text-white"
                  />
                  <span className="text-[10px] text-emerald-400 block mt-1">
                    {stats.totalOrdersCount} {t('طلباً مكتملاً وجارياً', 'active & completed orders')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                    <span>{t('إجمالي المنتجات', 'Total Products')}</span>
                    <Package className="w-4 h-4 text-[#A58454]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 font-kufi">
                    {stats.totalProductsCount}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {t('مفعلة ومتزامنة برمز SKU', 'Synced with shared SKU')}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                    <span>{t('إجمالي قطع المخزون', 'Units in Stock')}</span>
                    <Layers className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
                    {stats.totalUnitsInStock}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {stats.lowStockCount > 0 ? (
                      <span className="text-amber-600 font-semibold">
                        {stats.lowStockCount} {t('منتجات قاربت على النفاد', 'low stock products')}
                      </span>
                    ) : (
                      t('المخزون متوفر بالكامل', 'All items in healthy stock')
                    )}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
                    <span>{t('مواعيد VIP المعلقة', 'Pending VIP Appointments')}</span>
                    <Calendar className="w-4 h-4 text-[#8C6D3F]" />
                  </div>
                  <div className="text-xl sm:text-2xl font-bold text-slate-900 font-kufi">
                    {stats.pendingAppointmentsCount}
                  </div>
                  <span className="text-[10px] text-amber-600 font-semibold block mt-1">
                    {t('بحاجة لتأكيد واتساب فوري', 'Awaiting WhatsApp dispatch')}
                  </span>
                </div>
              </div>

              {/* Quick Actions & Catalog Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 font-kufi">
                    {t('إجراءات سريعة وفورية', 'Quick Actions')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleOpenAdd}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#C5A880]" />
                      <span>{t('إضافة منتج أو عدسات جديدة', 'Add New Product or Lenses')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('orders')}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-[#A58454]" />
                      <span>{t('معاينة طلبات ZATCA', 'View ZATCA Orders')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('settings')}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Globe className="w-4 h-4 text-emerald-600" />
                      <span>{t('إعدادات المنصة والـ SEO', 'Platform Settings & SEO')}</span>
                    </button>
                  </div>
                </div>

                <div className="p-5 rounded-2xl border border-slate-200 bg-white space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 font-kufi">
                    {t('توزيع الأقسام والكتالوج', 'Categories Overview')}
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    {activeCategorySuggestions.slice(0, 3).map((c) => {
                      const count = products.filter((p) => p.category === c.en || p.categoryAr === c.ar).length;
                      return (
                        <div key={c.en || c.ar} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                          <span className="text-[11px] text-slate-500 block truncate">
                            {c.ar}
                          </span>
                          <strong className="text-sm font-bold text-slate-900 font-mono">{count}</strong>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. PRODUCTS & CATALOG MANAGEMENT */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              {/* Header & Controls */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-kufi text-slate-900">
                    {t('إدارة المنتجات والمخزون المشترك والعدسات', 'Products, Shared SKU & Lens Catalog')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t(
                      'تحكم كامل بالنظارات الطبية والشمسية، العدسات الملونة والطبية، الاستجماتيزم، الألوان، والمواصفات.',
                      'Manage frames, optical parameters, contact lenses with astigmatism toric & multi-colors.'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleOpenAdd}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-xs self-start"
                >
                  <Plus className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('إضافة منتج جديد', 'Add New Product')}</span>
                </button>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div className="relative sm:col-span-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    placeholder={t('بحث بالاسم أو SKU...', 'Search name or SKU...')}
                    className="w-full text-xs ps-8 pe-3 py-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>

                <div>
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white cursor-pointer font-bold"
                  >
                    <option value="all">{t('جميع الأقسام', 'All Categories')}</option>
                    {activeCategorySuggestions.map((c) => (
                      <option key={c.en || c.ar} value={c.en || c.ar}>
                        {c.ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedBrandFilter}
                    onChange={(e) => setSelectedBrandFilter(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white cursor-pointer font-bold"
                  >
                    <option value="all">{t('جميع الماركات', 'All Brands')}</option>
                    {activeBrandSuggestions.map((b) => (
                      <option key={b.en || b.ar} value={b.en || b.ar}>
                        {b.ar}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <select
                    value={selectedStockFilter}
                    onChange={(e) => setSelectedStockFilter(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="all">{t('كل حالات المخزون', 'All Stock Status')}</option>
                    <option value="in_stock">{t('متوفر (10+)', 'In Stock (10+)')}</option>
                    <option value="low_stock">{t('مخزون منخفض (<10)', 'Low Stock (<10)')}</option>
                    <option value="out_of_stock">{t('نفذ المخزون (0)', 'Out of Stock (0)')}</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-slate-200 rounded-2xl overflow-x-auto shadow-xs bg-white w-full">
                <table className="w-full text-xs text-start min-w-[850px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-bold">
                    <tr>
                      <th className="py-3 px-3 text-start">{t('المنتج', 'Product')}</th>
                      <th className="py-3 px-3 text-start">SKU</th>
                      <th className="py-3 px-3 text-start">{t('الماركة / الفئة', 'Brand / Cat')}</th>
                      <th className="py-3 px-3 text-end">{t('السعر الأساسي', 'Base Price')}</th>
                      <th className="py-3 px-3 text-center">{t('المخزون الكلي', 'Total Stock')}</th>
                      <th className="py-3 px-3 text-center">{t('الألوان والترتيب', 'Colors')}</th>
                      <th className="py-3 px-4 text-center sticky end-0 bg-slate-100 border-s border-slate-200 shadow-2xs z-10">{t('الإجراءات والتحكم', 'Actions')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          {t('لا توجد منتجات تطابق شروط البحث', 'No products matching criteria')}
                        </td>
                      </tr>
                    ) : (
                      filteredProducts.map((p) => {
                        const totalStock = p.colors.reduce((s, c) => s + c.stock, 0);
                        const brandDisplay = getBrandName(p.brand, language);
                        return (
                          <tr key={p.id} className="hover:bg-slate-50/70 transition-colors group">
                            <td className="py-2.5 px-3">
                              <div className="flex items-center gap-2.5">
                                <div className="relative w-11 h-11 rounded-lg bg-slate-50 p-1 border border-slate-200 shrink-0 flex items-center justify-center">
                                  <Image
                                    src={p.colors[0]?.image || '/images/prod_acetate.webp'}
                                    alt={p.nameAr}
                                    fill
                                    sizes="44px"
                                    referrerPolicy="no-referrer"
                                    className="object-contain"
                                  />
                                </div>
                                <div className="min-w-0">
                                  <span className="font-bold text-slate-900 truncate block max-w-[160px]">
                                    {language === 'ar' ? p.nameAr : p.nameEn}
                                  </span>
                                  <span className="text-[10px] text-slate-400 truncate block">
                                    {p.subCategory || p.category}
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 font-bold whitespace-nowrap">
                              {p.sku}
                            </td>

                            <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                              <span className="font-semibold text-slate-800">{brandDisplay}</span>
                              <span className="text-[10px] text-slate-400 block">{p.category}</span>
                            </td>

                            <td className="py-2.5 px-3 text-end font-mono font-bold text-slate-900 whitespace-nowrap">
                              <Price amountSAR={p.basePriceSAR} size="xs" />
                            </td>

                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  totalStock > 10
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : totalStock > 0
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-rose-50 text-rose-700'
                                }`}
                              >
                                {totalStock} {t('قطعة', 'units')}
                              </span>
                            </td>

                            {/* Color Swatches & Quick Reorder */}
                            <td className="py-2.5 px-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                {p.colors.map((c, cIdx) => (
                                  <div key={c.id} className="relative group/swatch">
                                    <span
                                      className="w-4 h-4 rounded-full border border-slate-300 inline-block shadow-2xs"
                                      style={{ backgroundColor: c.hex }}
                                      title={`${c.nameAr} (${c.stock})`}
                                    />
                                    <div className="absolute -top-7 start-1/2 -translate-x-1/2 hidden group-hover/swatch:flex items-center gap-0.5 bg-slate-900 text-white rounded p-0.5 shadow-md z-10">
                                      <button
                                        type="button"
                                        onClick={() => reorderProductColors(p.id, cIdx, cIdx - 1)}
                                        disabled={cIdx === 0}
                                        className="p-0.5 hover:bg-slate-700 disabled:opacity-30"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-2.5 h-2.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => reorderProductColors(p.id, cIdx, cIdx + 1)}
                                        disabled={cIdx === p.colors.length - 1}
                                        className="p-0.5 hover:bg-slate-700 disabled:opacity-30"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-2.5 h-2.5" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </td>

                            {/* Sticky Action Buttons: Edit, Copy, Delete */}
                            <td className="py-2.5 px-4 text-center whitespace-nowrap sticky end-0 bg-white group-hover:bg-slate-50 border-s border-slate-200/80 shadow-2xs z-10">
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingProduct(p);
                                    setIsAddMode(false);
                                    setModalTab('basic');
                                    setWizardStep(1);
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title={t('تعديل المنتج والمواصفات', 'Edit Product')}
                                >
                                  <Edit className="w-3.5 h-3.5 text-[#C5A880]" />
                                  <span>{t('تعديل', 'Edit')}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDuplicate(p.id)}
                                  className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/80 text-[#8C6D3F] border border-[#A58454]/40 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title={t('تكرار المنتج مع مزامنة SKU', 'Clone Product')}
                                >
                                  <Copy className="w-3.5 h-3.5 text-[#A58454]" />
                                  <span>{t('نسخ', 'Copy')}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(language === 'ar' ? 'هل أنت تأكد من رغبتك في حذف هذا المنتج نهائياً؟' : 'Delete this product permanently?')) {
                                      deleteProduct(p.id);
                                    }
                                  }}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                                  title={t('حذف المنتج', 'Delete')}
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                                  <span>{t('حذف', 'Delete')}</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. ORDERS & ZATCA MANAGEMENT */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold font-kufi text-slate-900">
                    {t('قائمة الطلبات وتتبع التجهيز وفواتير ZATCA', 'Orders, Fulfillment & ZATCA Compliance')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t(
                      'متابعة تفاصيل الشحن، خيارات العدسات الطبية، وفحص بيانات الوصفات',
                      'Track delivery status, optical parameters, doctor RX attachments & billing'
                    )}
                  </p>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  >
                    <option value="all">{t('جميع الحالات', 'All Statuses')}</option>
                    <option value="new">جديد (New)</option>
                    <option value="processing">قيد التجهيز (Processing)</option>
                    <option value="shipped">تم الشحن (Shipped)</option>
                    <option value="delivered">مكتمل (Delivered)</option>
                    <option value="cancelled">ملغي (Cancelled)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {filteredOrders.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs border border-slate-200 rounded-2xl bg-white">
                    {t('لا توجد طلبات مطابقة للبحث', 'No orders matching filter')}
                  </div>
                ) : (
                  filteredOrders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-4 text-start"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <strong className="text-sm font-bold font-mono text-slate-900">
                              {ord.orderNumber}
                            </strong>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ord.status === 'delivered'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'shipped'
                                  ? 'bg-blue-100 text-blue-800'
                                  : ord.status === 'processing'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {ord.status.toUpperCase()}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                              ZATCA Tax Invoice ✓
                            </span>
                          </div>

                          <div className="text-xs text-slate-700">
                            <strong>{ord.customer.name}</strong> · {ord.customer.phone} ·{' '}
                            {ord.customer.city} ({ord.customer.district})
                          </div>

                          {/* Order Items Breakdown */}
                          <div className="space-y-1 pt-1">
                            {ord.items.map((it, iIdx) => (
                              <div key={iIdx} className="text-[11px] text-slate-600 flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-slate-800">
                                  {it.quantity}x {language === 'ar' ? it.product.nameAr : it.product.nameEn}
                                </span>
                                <span className="text-slate-400">({it.selectedColor.nameAr})</span>
                                {it.lensConfig && (
                                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[#8C6D3F] font-mono text-[10px]">
                                    Index {it.lensConfig.lensIndex}
                                    {it.lensConfig.rightEye
                                      ? ` (OD: ${it.lensConfig.rightEye.sph}/${it.lensConfig.rightEye.cyl})`
                                      : ''}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                          <Price
                            amountSAR={ord.totalSAR}
                            size="sm"
                            className="font-bold font-kufi text-[#A58454]"
                          />

                          <select
                            value={ord.status}
                            onChange={(e) => updateOrderStatus(ord.id, e.target.value as any)}
                            className="text-xs p-2 rounded-xl border border-slate-300 bg-white font-medium cursor-pointer"
                          >
                            <option value="new">جديد (New)</option>
                            <option value="processing">قيد التجهيز (Processing)</option>
                            <option value="shipped">تم الشحن (Shipped)</option>
                            <option value="delivered">مكتمل (Delivered)</option>
                            <option value="cancelled">ملغي (Cancelled)</option>
                          </select>

                          {/* Toggle Expand Button */}
                          <button
                            type="button"
                            onClick={() => setExpandedOrderId(expandedOrderId === ord.id ? null : ord.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-250 text-slate-700 text-xs font-bold transition-all cursor-pointer border border-slate-200"
                          >
                            {expandedOrderId === ord.id ? 'إغلاق التفاصيل ▴' : 'تفاصيل الشحن OTO ▾'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section with OTO Logistics Carrier Selection */}
                      {expandedOrderId === ord.id && (
                        <div className="mt-4 pt-4 border-t border-slate-200 animate-fadeIn space-y-4">
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                            <h4 className="font-bold text-slate-800 font-kufi">📋 بيانات الشحن والتوصيل للعميل:</h4>
                            <div><strong>العنوان بالكامل:</strong> {ord.customer.address}</div>
                            <div><strong>المدينة والحي:</strong> {ord.customer.city} · {ord.customer.district}</div>
                            <div><strong>رقم الجوال:</strong> {ord.customer.phone}</div>
                            <div><strong>البريد الإلكتروني:</strong> {ord.customer.email}</div>
                          </div>

                          <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200 text-xs space-y-3">
                            <h4 className="font-bold text-[#8C6D3F] font-kufi flex items-center gap-2">
                              🚚 إدارة الشحنة عبر بوابة OTO Logistics
                            </h4>
                            <p className="text-[11px] text-slate-500">
                              حدد شركة الشحن المطلوبة من القائمة أدناه ليقوم النظام بالاتصال ببوابة OTO وحجز الشحنة تلقائياً وتوليد بوليصة الشحن وتحديث حالة الطلب.
                            </p>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex-1 min-w-[200px]">
                                <label className="block text-[10px] font-bold text-slate-600 mb-1">اختر شركة الشحن المناسبة:</label>
                                <select
                                  value={selectedOtoCarrier[ord.id] || 'Aramex'}
                                  onChange={(e) => setSelectedOtoCarrier(prev => ({ ...prev, [ord.id]: e.target.value }))}
                                  className="w-full text-xs p-2 rounded-lg border border-slate-300 bg-white font-bold"
                                >
                                  <option value="Aramex">Aramex (أرامكس - محلي ودولي)</option>
                                  <option value="SMSA">SMSA Express (سمسا إكسبريس - محلي سريع)</option>
                                  <option value="SPL">SPL (البريد السعودي سبل)</option>
                                  <option value="DHL">DHL Express (دي إتش إل - دولي سريع)</option>
                                  <option value="J&T">J&T Express (جي أند تي)</option>
                                  <option value="iMile">iMile (آي مايل للتوصيل)</option>
                                  <option value="Barq">Barq (برق للتوصيل السريع)</option>
                                  <option value="OTOExpress">OTO Express (أوتو إكسبريس)</option>
                                </select>
                              </div>

                              <div className="pt-5">
                                <button
                                  type="button"
                                  onClick={() => handleFulfillWithOto(ord)}
                                  disabled={otoFulfillmentStatus[ord.id] === 'loading'}
                                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-[#C5A880] font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                  {otoFulfillmentStatus[ord.id] === 'loading' ? (
                                    <>
                                      <div className="w-3.5 h-3.5 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
                                      <span>جاري حجز الشحنة وتوليد البوليصة...</span>
                                    </>
                                  ) : (
                                    <span>تأكيد وحجز الشحنة عبر OTO 🚀</span>
                                  )}
                                </button>
                              </div>
                            </div>

                            {/* OTO Status Alerts */}
                            {(otoFulfillmentStatus[ord.id] === 'success' || ord.status === 'shipped') && (
                              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 space-y-1">
                                <p className="font-bold">✓ تم إرسال الشحنة لـ OTO وتجهيزها بنجاح!</p>
                                {otoTrackingNumber[ord.id] && (
                                  <div>رقم تتبع الشحنة: <strong className="font-mono">{otoTrackingNumber[ord.id]}</strong></div>
                                )}
                                {otoWaybillUrl[ord.id] && (
                                  <div className="pt-1">
                                    <a
                                      href={otoWaybillUrl[ord.id]}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] transition-colors"
                                    >
                                      📥 تحميل وطباعة بوليصة الشحن (PDF)
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {otoFulfillmentStatus[ord.id] === 'error' && (
                              <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-200">
                                <p className="font-bold">⚠️ خطأ من بوابة OTO Logistics:</p>
                                <p className="text-[11px] mt-0.5">{otoErrorMessage[ord.id]}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 4. BRANDS & CATEGORIES HUB - LISTS & CATEGORIES MANAGER */}
          {activeTab === 'brands' && (
            <CategoryManager />
          )}

          {/* 5. VIP APPOINTMENTS */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold font-kufi text-slate-900">
                  {t('جدول مواعيد فحص النظر وزيارات VIP المنزلية', 'VIP Vision Appointments & Concierge')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('تواصل وتأكيد فوري مع العميل عبر رسائل WhatsApp المباشرة', 'Instant confirmation & WhatsApp concierge notifications')}
                </p>
              </div>

              <div className="space-y-3">
                {appointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-[#FAFAFA] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            apt.type === 'home_vip'
                              ? 'bg-amber-100 text-[#8C6D3F]'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {apt.type === 'home_vip' ? 'زيارة VIP منزلية 🚘' : 'فحص بالفرع 🏥'}
                        </span>
                        <strong className="text-xs font-bold text-slate-900">
                          {apt.customerName}
                        </strong>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {apt.phone}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <span>
                          {apt.city} - {apt.district} ({apt.preferredDate} · {apt.preferredTime})
                        </span>
                        {apt.notes && (
                          <p className="text-[11px] text-slate-500 mt-1 italic">
                            &ldquo;{apt.notes}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={`https://wa.me/${apt.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                          `مرحباً ${apt.customerName}، معكم خدمة عملاء لِـنس كود بخصوص موعد فحص النظر VIP الخاص بكم بتاريخ ${apt.preferredDate}.`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>WhatsApp VIP</span>
                      </a>

                      <select
                        value={apt.status}
                        onChange={(e) => updateAppointmentStatus(apt.id, e.target.value as any)}
                        className="text-xs p-2 rounded-xl border border-slate-300 bg-white"
                      >
                        <option value="pending">معلق (Pending)</option>
                        <option value="confirmed">مؤكد (Confirmed)</option>
                        <option value="completed">تم الفحص (Completed)</option>
                        <option value="cancelled">ملغي (Cancelled)</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. COUPONS & PROMOS */}
          {activeTab === 'coupons' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold font-kufi text-slate-900">
                  {t('إدارة كوبونات الخصم والعروض الترويجية', 'Discount Coupons & Marketing Promos')}
                </h3>
              </div>

              {/* Add Coupon Form */}
              <form
                onSubmit={handleCreateCoupon}
                className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end shadow-xs"
              >
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('كود الكوبون', 'Coupon Code')}
                  </label>
                  <input
                    type="text"
                    required
                    value={newCouponCode}
                    onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                    placeholder="VIP20"
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('نوع الخصم', 'Discount Type')}
                  </label>
                  <select
                    value={newCouponType}
                    onChange={(e) => setNewCouponType(e.target.value as any)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="percentage">نسبة مئوية (%)</option>
                    <option value="fixed">مبلغ ثابت (ريال)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('قيمة الخصم', 'Value')}
                  </label>
                  <input
                    type="number"
                    required
                    value={newCouponVal}
                    onChange={(e) => setNewCouponVal(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer shadow-xs"
                >
                  {t('إضافة وتفعيل الكوبون', 'Activate Coupon')}
                </button>
              </form>

              {/* Coupons List */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="p-3.5 rounded-2xl border border-slate-200 bg-white flex items-center justify-between shadow-xs"
                  >
                    <div>
                      <strong className="text-sm font-mono font-bold text-slate-900 block">
                        {c.code}
                      </strong>
                      <div className="text-xs text-[#8C6D3F] font-semibold flex items-center gap-1">
                        {c.discountType === 'percentage' ? (
                          <span>خصم {c.discountValue}%</span>
                        ) : (
                          <>
                            <span>خصم {c.discountValue}</span>
                            <SaudiRiyal className="w-3.5 h-3.5 inline-block stroke-[2.2]" />
                          </>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span>حد أدنى {c.minSpendSAR}</span>
                        <SaudiRiyal className="w-3 h-3 inline-block stroke-[2]" />
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {c.isActive ? 'فعال' : 'معطل'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOG POSTS MANAGEMENT */}
          {activeTab === 'blog' && (
            <div className="space-y-6 font-kufi">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-kufi">
                    {t('إدارة مدونة المقالات الطبية والتثقيفية', 'Medical & Educational Blog Management')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {t('أضف مقالات جديدة وتثقيفية لزوار متجرك مع تهيئة كاملة لمحركات البحث (SEO) والبيانات المنظمة (Schema).', 'Write educational blog articles with comprehensive SEO tuning & schema.')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddBlog}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-center"
                >
                  <Plus className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('إضافة مقال جديد', 'Add New Article')}</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-2 max-w-md bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={blogSearch}
                  onChange={(e) => setBlogSearch(e.target.value)}
                  placeholder={t('البحث في المقالات بالعنوان أو القسم...', 'Search articles by title or category...')}
                  className="bg-transparent border-none outline-none text-xs w-full font-semibold text-slate-700"
                />
              </div>

              {/* Blog Posts list */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {blogPosts
                  .filter(
                    (p) =>
                      p.titleAr.toLowerCase().includes(blogSearch.toLowerCase()) ||
                      p.titleEn.toLowerCase().includes(blogSearch.toLowerCase()) ||
                      (p.categoryAr && p.categoryAr.toLowerCase().includes(blogSearch.toLowerCase())) ||
                      (p.categoryEn && p.categoryEn.toLowerCase().includes(blogSearch.toLowerCase())) ||
                      p.category.toLowerCase().includes(blogSearch.toLowerCase())
                  )
                  .map((post) => (
                    <div
                      key={post.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition-all flex gap-3.5 relative overflow-hidden group"
                    >
                      <div className="w-24 h-24 rounded-xl overflow-hidden relative shrink-0 bg-slate-100">
                        <Image
                          src={post.coverImage || 'https://picsum.photos/seed/blog/150/150'}
                          alt={post.coverImageAltAr || post.titleAr}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="flex-1 flex flex-col justify-between min-w-0">
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-[#8C6D3F] font-bold">
                              {language === 'ar' ? (post.categoryAr || post.category) : (post.categoryEn || post.category)}
                            </span>
                            <span className="text-[9px] text-slate-400 font-mono">
                              {post.date} · {post.readTime}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate font-kufi">
                            {post.titleAr}
                          </h4>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                            {post.excerptAr}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3 pt-2.5 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditBlog(post)}
                            className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5 text-slate-500" />
                            <span>تعديل</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDuplicateBlog(post)}
                            className="px-2.5 py-1 rounded-lg hover:bg-slate-50 text-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>تكرار</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المقال نهائياً؟' : 'Are you sure you want to delete this article?')) {
                                deleteBlogPost(post.id);
                                showNotice(language === 'ar' ? 'تم حذف المقال بنجاح!' : 'Article deleted successfully!');
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg hover:bg-red-50 text-red-600 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ms-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* BLOG WRITER MODAL POPUP */}
              {editingBlogPost && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 animate-fadeIn">
                  <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-slideUp">
                    {/* Header */}
                    <div className="bg-slate-900 px-5 py-4 flex items-center justify-between text-white shrink-0">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[#C5A880]" />
                        <div>
                          <h3 className="text-xs sm:text-sm font-bold font-kufi">
                            {isBlogAddMode ? t('إضافة مقال طبي جديد', 'Create New Medical Article') : t('تعديل المقال والتنسيق', 'Edit Blog Post & Formatting')}
                          </h3>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingBlogPost(null)}
                        className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Stepper */}
                    <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 shrink-0">
                      <div className="flex items-center justify-between max-w-md mx-auto text-xs font-bold text-slate-500">
                        {[1, 2, 3].map((step) => {
                          const labels = [
                            t('البيانات الأساسية', 'Basic Info'),
                            t('محتوى المقال الكامل', 'Full Content'),
                            t('SEO والـ Schema', 'SEO & Schema')
                          ];
                          const isActive = blogWizardStep === step;
                          const isCompleted = blogWizardStep > step;
                          return (
                            <div key={step} className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => setBlogWizardStep(step)}
                                className={`w-5 h-5 rounded-full flex items-center justify-center border font-mono transition-all text-[9px] cursor-pointer ${
                                  isActive
                                    ? 'bg-slate-900 border-slate-900 text-white ring-2 ring-slate-900/20'
                                    : isCompleted
                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                    : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                                }`}
                              >
                                {isCompleted ? '✓' : step}
                              </button>
                              <span className={`text-[10px] hidden sm:inline ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>
                                {labels[step - 1]}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Form Scroll Area */}
                    <form onSubmit={handleSaveBlogPost} className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                      
                      {/* STEP 1: BASIC INFO */}
                      {blogWizardStep === 1 && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                عنوان المقال بالعربية
                              </label>
                              <input
                                type="text"
                                required
                                value={editingBlogPost.titleAr}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, titleAr: e.target.value })}
                                placeholder="مثال: أهمية غسل اليدين قبل لمس العدسات اللاصقة"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Article Title (English)
                              </label>
                              <input
                                type="text"
                                required
                                value={editingBlogPost.titleEn}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, titleEn: e.target.value })}
                                placeholder="e.g. Importance of washing hands before handling contact lenses"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>
                          </div>

                          {/* BILINGUAL CATEGORY CONTAINERS */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                قسم المقال بالعربية (Category Arabic)
                              </label>
                              <input
                                type="text"
                                required
                                value={editingBlogPost.categoryAr ?? editingBlogPost.category ?? ''}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setEditingBlogPost({
                                    ...editingBlogPost,
                                    categoryAr: val,
                                    category: val,
                                  });
                                }}
                                placeholder="مثال: صحة العيون / نصائح وأناقة / عدسات لاصقة"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Category Name (English)
                              </label>
                              <input
                                type="text"
                                value={editingBlogPost.categoryEn || ''}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, categoryEn: e.target.value })}
                                placeholder="e.g. Eye Health / Style & Advice / Contact Lenses"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                مدة القراءة المتوقعة (Read Time)
                              </label>
                              <input
                                type="text"
                                required
                                value={editingBlogPost.readTime}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, readTime: e.target.value })}
                                placeholder="مثال: 5 دقائق قراءة"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                رابط المقال (Slug) - للمبرمجين والسيو
                              </label>
                              <input
                                type="text"
                                required
                                value={editingBlogPost.slug}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, slug: e.target.value })}
                                placeholder="how-to-wear-lenses"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                              />
                            </div>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-slate-100">
                            <div>
                              <ImageUploader
                                value={editingBlogPost.coverImage || ''}
                                onChange={(url) => setEditingBlogPost({ ...editingBlogPost, coverImage: url })}
                                folder="blog"
                                label="صورة غلاف المقال (Cover Image) - رفع تلقائي WebP إلى Firebase Storage"
                                placeholder="رابط صورة الغلاف أو اختر ملفاً للرفع المباشر..."
                              />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-[11px] font-bold text-[#A58454] mb-1">
                                  وصف الصورة بالعربية (Alt Tag) - هام جداً للسيو
                                </label>
                                <input
                                  type="text"
                                  value={editingBlogPost.coverImageAltAr || ''}
                                  onChange={(e) => setEditingBlogPost({ ...editingBlogPost, coverImageAltAr: e.target.value })}
                                  placeholder="مثال: فتاة تضع قطرة مرطبة في عينيها أثناء ارتداء عدسات لاصقة"
                                  className="w-full text-xs p-2.5 rounded-xl border border-amber-200 focus:border-[#A58454] font-semibold bg-amber-50/20"
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-bold text-[#A58454] mb-1">
                                  Image Alt Attribute (English Alt)
                                </label>
                                <input
                                  type="text"
                                  value={editingBlogPost.coverImageAltEn || ''}
                                  onChange={(e) => setEditingBlogPost({ ...editingBlogPost, coverImageAltEn: e.target.value })}
                                  placeholder="e.g. Young woman applying hydrating eye drops with lenses on"
                                  className="w-full text-xs p-2.5 rounded-xl border border-amber-200 focus:border-[#A58454] font-semibold bg-amber-50/20"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                ملخص المقال بالعربية (ExcerptAr - يظهر في قائمة المقالات)
                              </label>
                              <textarea
                                rows={3}
                                required
                                value={editingBlogPost.excerptAr}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerptAr: e.target.value })}
                                placeholder="اكتب ملخصاً وجاذباً لا يتجاوز سطرين لجذب القارئ..."
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Excerpt English (ExcerptEn)
                              </label>
                              <textarea
                                rows={3}
                                required
                                value={editingBlogPost.excerptEn}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, excerptEn: e.target.value })}
                                placeholder="Short attractive overview to capture reader attention on list cards..."
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* STEP 2: RICH CONTENT (HTML EDITOR) */}
                      {blogWizardStep === 2 && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b border-slate-200 pb-1 shrink-0">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => setBlogLangTab('ar')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  blogLangTab === 'ar'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                🇸🇦 كود المقال بالعربية
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlogLangTab('en')}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                                  blogLangTab === 'en'
                                    ? 'bg-slate-900 text-white shadow-xs'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                🇺🇸 English Article Code
                              </button>
                            </div>

                            {/* Mode indicators */}
                            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                              <button
                                type="button"
                                onClick={() => setBlogEditorMode('visual')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  blogEditorMode === 'visual'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <Eye className={`w-3.5 h-3.5 ${blogEditorMode === 'visual' ? 'text-[#A58454]' : 'text-slate-400'}`} />
                                <span>محرر جنباً إلى جنب (معاينة حية)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setBlogEditorMode('source')}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                  blogEditorMode === 'source'
                                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                <FileCode className={`w-3.5 h-3.5 ${blogEditorMode === 'source' ? 'text-[#A58454]' : 'text-slate-400'}`} />
                                <span>كود HTML المصدر (كامل العرض)</span>
                              </button>
                            </div>
                          </div>

                          {/* Toolbar */}
                          <div className="bg-[#0b1329] rounded-2xl p-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-slate-300 font-sans shadow-md select-none border border-slate-800">
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<h1>', '</h1>')}
                                className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                H1
                              </button>
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<h2>', '</h2>')}
                                className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                H2
                              </button>
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<h3>', '</h3>')}
                                className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                H3
                              </button>
                            </div>

                            <div className="h-5 w-[1px] bg-slate-700" />

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<strong>', '</strong>')}
                                className="w-6 h-6 rounded-md text-xs font-bold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                B
                              </button>
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<em>', '</em>')}
                                className="w-6 h-6 rounded-md text-xs italic bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-serif"
                              >
                                I
                              </button>
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<mark class="bg-amber-100 px-1 rounded">', '</mark>')}
                                className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#A58454] text-slate-950 hover:bg-yellow-400 transition-colors uppercase"
                              >
                                MARK
                              </button>
                            </div>

                            <div className="h-5 w-[1px] bg-slate-700" />

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<ul>\n  <li>', '</li>\n</ul>')}
                                className="px-2 py-1 rounded-md text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                • قائمة
                              </button>
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<ol>\n  <li>', '</li>\n</ol>')}
                                className="px-2 py-1 rounded-md text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                              >
                                1. قائمة
                              </button>
                            </div>

                            <div className="h-5 w-[1px] bg-slate-700" />

                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<blockquote class="border-r-4 border-[#A58454] pr-4 italic text-slate-600 my-2 bg-slate-50 p-2 rounded-xl">', '</blockquote>')}
                                className="w-6 h-6 rounded-md text-sm font-bold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-center"
                              >
                                ”
                              </button>
                            </div>

                            <div className="h-5 w-[1px] bg-slate-700 hidden lg:block" />

                            {/* Custom Blog Elements */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<div class="p-4 my-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900"><strong class="block mb-1 text-emerald-950">💡 نصيحة الطبيب:</strong>', '</div>')}
                                className="px-2 py-1 rounded-md text-[10px] bg-emerald-950 text-emerald-300 hover:bg-emerald-900 hover:text-white transition-all font-bold"
                              >
                                + نصيحة طبية
                              </button>
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<div class="p-4 my-4 rounded-2xl bg-slate-50 border border-slate-200"><strong class="text-slate-900 block mb-1">❓ سؤال وجواب شائع:</strong><p class="font-bold">س: ...؟</p><p class="text-slate-600">ج: ...</p></div>', '')}
                                className="px-2 py-1 rounded-md text-[10px] bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-white transition-all font-bold"
                              >
                                + سؤال وجواب
                              </button>
                            </div>

                            {/* Images & tables */}
                            <div className="flex items-center gap-1 ms-auto">
                              <button
                                type="button"
                                onClick={() => insertBlogTag(blogLangTab, '<img src="https://picsum.photos/seed/optics/800/400" alt="صورة توضيحية داخل المقال" class="rounded-2xl my-4 max-w-full" />', '')}
                                className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-xs flex items-center justify-center transition-colors"
                                title="إضافة صورة توضيحية"
                              >
                                🖼️
                              </button>
                            </div>
                          </div>

                          {/* Editor Panel Grid */}
                          <div className={blogEditorMode === 'visual' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                            <div className="space-y-1.5 flex flex-col">
                              <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                                <span>محرر كود الـ HTML والفقرات التفصيلية للمقال</span>
                                <span className="font-mono text-slate-400">RTL Input Panel</span>
                              </div>
                              <textarea
                                id={blogLangTab === 'ar' ? 'blog-content-ar-textarea' : 'blog-content-en-textarea'}
                                rows={14}
                                required
                                value={blogLangTab === 'ar' ? (editingBlogPost.contentAr || '') : (editingBlogPost.contentEn || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (blogLangTab === 'ar') {
                                    setEditingBlogPost({ ...editingBlogPost, contentAr: val });
                                  } else {
                                    setEditingBlogPost({ ...editingBlogPost, contentEn: val });
                                  }
                                }}
                                placeholder={blogLangTab === 'ar'
                                  ? "اكتب هنا محتوى مقالك بالكامل من فقرات وعناوين منسقة كود HTML..."
                                  : "Write your complete educational article content in formatted HTML here..."
                                }
                                className={`w-full text-xs p-3 rounded-2xl border border-slate-300 font-mono leading-relaxed bg-white shadow-2xs focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none ${
                                  blogEditorMode === 'source' ? 'h-[440px]' : 'h-[340px]'
                                }`}
                              />
                            </div>

                            {/* Preview */}
                            {blogEditorMode === 'visual' && (
                              <div className="space-y-1.5 flex flex-col">
                                <div className="flex justify-between items-center text-[10px] text-[#A58454] font-bold">
                                  <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    معاينة القارئ الحية للمقال (Article Live Preview)
                                  </span>
                                  <span className="font-mono text-slate-400">WYSIWYG Reader View</span>
                                </div>

                                <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 overflow-y-auto h-[340px] shadow-inner text-slate-800 text-xs sm:text-sm leading-relaxed max-h-[340px] custom-scrollbar">
                                  {blogLangTab === 'ar' ? (
                                    editingBlogPost.contentAr ? (
                                      <div
                                        className="prose prose-slate prose-xs max-w-none text-right rtl"
                                        dangerouslySetInnerHTML={{ __html: editingBlogPost.contentAr }}
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-slate-400 text-center text-xs italic">
                                        سيظهر هنا شكل المقال المنسق بالكامل كما سيقرأه الزائر تماماً...
                                      </div>
                                    )
                                  ) : (
                                    editingBlogPost.contentEn ? (
                                      <div
                                        className="prose prose-slate prose-xs max-w-none text-left ltr font-sans"
                                        dangerouslySetInnerHTML={{ __html: editingBlogPost.contentEn }}
                                      />
                                    ) : (
                                      <div className="flex h-full items-center justify-center text-slate-400 text-center text-xs italic">
                                        Live preview of the formatted article content will appear here as the reader sees it...
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* STEP 3: SEO, META & SCHEMA */}
                      {blogWizardStep === 3 && (
                        <div className="space-y-4">
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <strong className="text-xs font-bold block text-slate-900">
                                توليد بيانات السيو والـ Schema تلقائياً للمقال
                              </strong>
                              <p className="text-[11px] text-slate-500">
                                يعتمد النظام على ذكاء الأرشفة لتوليد المخططات البنيوية (JSON-LD) المعتمدة من جوجل والعناوين التعريفية والكلمات المفتاحية للمدونة.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleBlogAutoSeo}
                              className="px-4 py-2 rounded-xl bg-slate-900 text-[#C5A880] text-xs font-bold hover:bg-slate-800 flex items-center gap-1.5 transition-all shrink-0 cursor-pointer"
                            >
                              <Sparkles className="w-4 h-4" />
                              <span>توليد ذكي تلقائي</span>
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                عنوان الـ SEO المخصص (Ar)
                              </label>
                              <input
                                type="text"
                                value={editingBlogPost.seoTitleAr || ''}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, seoTitleAr: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Meta SEO Title (En)
                              </label>
                              <input
                                type="text"
                                value={editingBlogPost.seoTitleEn || ''}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, seoTitleEn: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                وصف الميتا المخصص (Ar) - Meta Description
                              </label>
                              <textarea
                                rows={2}
                                value={editingBlogPost.seoDescAr || ''}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, seoDescAr: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                Meta Description (En)
                              </label>
                              <textarea
                                rows={2}
                                value={editingBlogPost.seoDescEn || ''}
                                onChange={(e) => setEditingBlogPost({ ...editingBlogPost, seoDescEn: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              الكلمات المفتاحية للمقال (Keywords) - مفصولة بفاصلة
                            </label>
                            <input
                              type="text"
                              value={editingBlogPost.seoKeywords || ''}
                              onChange={(e) => setEditingBlogPost({ ...editingBlogPost, seoKeywords: e.target.value })}
                              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                            />
                          </div>

                          <div>
                            <div className="flex justify-between items-center mb-1">
                              <label className="block text-[11px] font-bold text-slate-700">
                                كود سكيما مقالات جوجل (Google BlogPosting JSON-LD Schema)
                              </label>
                              <span className="text-[10px] text-emerald-600 font-semibold">تنسيق معتمد 100% لأجهزة البحث</span>
                            </div>
                            <textarea
                              rows={5}
                              value={editingBlogPost.schemaJson || ''}
                              onChange={(e) => setEditingBlogPost({ ...editingBlogPost, schemaJson: e.target.value })}
                              className="w-full text-xs p-3 rounded-2xl border border-slate-300 font-mono bg-slate-900 text-emerald-400 shadow-inner h-[150px] outline-none"
                            />
                          </div>
                        </div>
                      )}

                    </form>

                    {/* Footer Buttons */}
                    <div className="bg-slate-50 px-5 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
                      <div className="flex gap-2">
                        {blogWizardStep > 1 && (
                          <button
                            type="button"
                            onClick={() => setBlogWizardStep(blogWizardStep - 1)}
                            className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                          >
                            السابق
                          </button>
                        )}
                        {blogWizardStep < 3 && (
                          <button
                            type="button"
                            onClick={() => setBlogWizardStep(blogWizardStep + 1)}
                            className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-all cursor-pointer"
                          >
                            التالي
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingBlogPost(null)}
                          className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                        >
                          إلغاء
                        </button>
                        <button
                          type="button"
                          onClick={handleSaveBlogPost}
                          className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isBlogAddMode ? t('حفظ ونشر المقال', 'Publish Post') : t('حفظ التعديلات', 'Save Changes')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 7. PLATFORM SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-6 font-kufi">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-3xs">
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-kufi text-slate-900">
                    {t('إعدادات المنصة والهوية السحابية', 'Platform Settings & Contact Info')}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {t(
                      'إدارة معلومات التواصل والروابط الاجتماعية، وأرقام التوثيق والضريبة والميتا الرئيسية للموقع.',
                      'Manage support contacts, social links, legal compliance registrations, and homepage metadata.'
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A58454] to-[#C5A880] hover:from-[#927344] hover:to-[#B59870] text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>{isSavingSettings ? 'جاري الحفظ...' : 'حفظ التغييرات في قاعدة البيانات'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Contact & Support Card */}
                <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-[#A58454]" />
                    <span>{t('معلومات الاتصال والدعم الفني', 'Support & Contact Info')}</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        البريد الإلكتروني للدعم (Support Email)
                      </label>
                      <input
                        type="email"
                        value={localSettings.supportEmail || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, supportEmail: e.target.value })}
                        placeholder="info@lenscode.sa"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        رقم هاتف الدعم (Phone Number)
                      </label>
                      <input
                        type="text"
                        value={localSettings.phoneNumber || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, phoneNumber: e.target.value })}
                        placeholder="+966556359090"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        رقم الواتساب (WhatsApp Number)
                      </label>
                      <input
                        type="text"
                        value={localSettings.whatsAppNumber || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, whatsAppNumber: e.target.value })}
                        placeholder="+966556359090"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        العنوان الفعلي والمقر (Physical Address)
                      </label>
                      <textarea
                        value={localSettings.address || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, address: e.target.value })}
                        placeholder="مثلاً: الرياض، حي الديرة..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Metadata Card */}
                <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-[#A58454]" />
                    <span>{t('إعدادات محركات البحث للرئيسية (Homepage SEO)', 'Search Engine Optimization')}</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الميتا للرئيسية (Meta Title)
                      </label>
                      <input
                        type="text"
                        value={localSettings.metaTitle || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, metaTitle: e.target.value })}
                        placeholder="مثلاً: منصة لنس كود الفاخرة"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">
                        * سيظهر بجوار العنوان تلقائياً النص الثابت: | لنس كود السعودية (أو الدولة المحددة) / | LensCode Saudi Arabia
                      </p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف الميتا للرئيسية (Meta Description)
                      </label>
                      <textarea
                        value={localSettings.metaDescription || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, metaDescription: e.target.value })}
                        placeholder="مثلاً: متجر لنس كود الفاخر للبصريات..."
                        rows={5}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Social Networks Links */}
                <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#A58454]" />
                    <span>{t('روابط قنوات التواصل الاجتماعي', 'Social Media Links')}</span>
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">رابط انستغرام (Instagram)</label>
                      <input
                        type="url"
                        value={localSettings.instagramLink || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, instagramLink: e.target.value })}
                        placeholder="https://instagram.com/..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">رابط إكس / تويتر (X / Twitter)</label>
                      <input
                        type="url"
                        value={localSettings.twitterLink || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, twitterLink: e.target.value })}
                        placeholder="https://twitter.com/..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">رابط فيسبوك (Facebook)</label>
                      <input
                        type="url"
                        value={localSettings.facebookLink || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, facebookLink: e.target.value })}
                        placeholder="https://facebook.com/..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">رابط تيك توك (TikTok)</label>
                      <input
                        type="url"
                        value={localSettings.tiktokLink || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, tiktokLink: e.target.value })}
                        placeholder="https://tiktok.com/@..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">رابط سناب شات (Snapchat)</label>
                      <input
                        type="url"
                        value={localSettings.snapchatLink || ''}
                        onChange={(e) => setLocalSettings({ ...localSettings, snapchatLink: e.target.value })}
                        placeholder="https://snapchat.com/add/..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Compliance & Verification Certificates */}
                <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <h4 className="text-xs font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-[#A58454]" />
                    <span>{t('التوثيق الرسمي والرقم الضريبي للمتجر', 'Compliance & Licensing')}</span>
                  </h4>

                  <div className="space-y-4">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          رقم توثيق المركز السعودي للأعمال (Maroof / SBC)
                        </label>
                        <input
                          type="text"
                          value={localSettings.maroofNumber || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, maroofNumber: e.target.value })}
                          placeholder="0000178830"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                        />
                      </div>
                      <ImageUploader
                        value={localSettings.maroofImage || ''}
                        onChange={(url) => setLocalSettings({ ...localSettings, maroofImage: url })}
                        folder="compliance"
                        label="صورة شهادة/شعار التوثيق (SBC Logo)"
                        placeholder="رابط الصورة أو اختر ملفاً للرفع..."
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          الرقم الضريبي للمنشأة (Tax / VAT Number)
                        </label>
                        <input
                          type="text"
                          value={localSettings.taxNumber || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, taxNumber: e.target.value })}
                          placeholder="311075886400003"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold font-mono text-start"
                        />
                      </div>
                      <ImageUploader
                        value={localSettings.taxImage || ''}
                        onChange={(url) => setLocalSettings({ ...localSettings, taxImage: url })}
                        folder="compliance"
                        label="صورة شهادة الرقم الضريبي (VAT Logo)"
                        placeholder="رابط الصورة أو اختر ملفاً للرفع..."
                      />
                    </div>
                  </div>
                </div>

                {/* 5. Homepage Hero Slider & Banners Management */}
                <div className="md:col-span-2 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#A58454]" />
                        <span>{t('إدارة شرائح الهيرو بالواجهة الرئيسية (Hero Slider & Banners)', 'Homepage Hero Banners')}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-[#8C6D3F] border border-amber-200 font-mono">
                          {(localSettings.heroSlides || []).length} {t('شريحة', 'Slides')}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-1">
                        {t(
                          'أضف وخصص شرائح البانر الرئيسي بالواجهة الرئيسية. يمكنك رفع الصورة، وتحديد البادج، والعنوان، والوصف، والأزرار، وروابط التوجيه.',
                          'Add and customize hero banner slides. Upload custom images, badges, headings, subtitles, and destination links.'
                        )}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddHeroSlide}
                      className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>{t('+ إضافة شريحة هيرو جديدة', '+ Add New Hero Slide')}</span>
                    </button>
                  </div>

                  {/* Anti-Slop Rule Note */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 flex items-start gap-2">
                    <span className="text-amber-600 text-sm leading-none shrink-0">💡</span>
                    <span>
                      {t(
                        'قاعدة ذكية: أي حقل تتركه فارغاً (مثل البادج، أو الوصف، أو الأزرار) لن تظهر حاويته نهائياً في الهيرو بالصفحة الرئيسية.',
                        'Smart rule: Any field you leave empty (such as badge, subtitle, or secondary button) will completely hide its container from the live homepage hero.'
                      )}
                    </span>
                  </div>

                  {/* Slides List */}
                  {(!localSettings.heroSlides || localSettings.heroSlides.length === 0) ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <p className="text-xs text-slate-500 font-medium">
                        {t('لا توجد أي شرائح هيرو مضافة حالياً. اضغط على الزر أعلاه لإضافة شريحة.', 'No hero slides configured. Click the button above to add one.')}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {localSettings.heroSlides.map((slide, sIdx) => (
                        <div
                          key={slide.id || sIdx}
                          className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4 transition-all"
                        >
                          {/* Slide Header Toolbar */}
                          <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-6 h-6 rounded-lg bg-[#A58454] text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                                {sIdx + 1}
                              </span>
                              <h5 className="text-xs font-bold text-slate-800 truncate">
                                {slide.titleAr || slide.titleEn || `شريحة هيرو #${sIdx + 1}`}
                              </h5>
                              {slide.image && (
                                <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                  <span>{t('الصورة محددة', 'Image Set')}</span>
                                </span>
                              )}
                            </div>

                            {/* Reorder and Delete Actions */}
                            <div className="flex items-center gap-1 shrink-0">
                              <button
                                type="button"
                                disabled={sIdx === 0}
                                onClick={() => handleMoveHeroSlide(sIdx, 'up')}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                title="تحريك لأعلى"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                disabled={sIdx === (localSettings.heroSlides?.length || 1) - 1}
                                onClick={() => handleMoveHeroSlide(sIdx, 'down')}
                                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                                title="تحريك لأسفل"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteHeroSlide(sIdx)}
                                className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                                title="حذف الشريحة"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>

                          {/* 1. Hero Image Uploader */}
                          <div>
                            <ImageUploader
                              value={slide.image || ''}
                              onChange={(url) => handleUpdateHeroSlide(sIdx, { image: url })}
                              folder="hero"
                              label="صورة خلفية الهيرو (Hero Background Image)"
                              placeholder="رابط الصورة أو اختر ملفاً لرفعه من جهازك..."
                            />
                          </div>

                          {/* 2. Grid Inputs: Arabic & English */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                            {/* Badges */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                البادج الصغير بالعربي (Badge AR)
                              </label>
                              <input
                                type="text"
                                value={slide.badgeAr || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { badgeAr: e.target.value })}
                                placeholder="مثلاً: اليوم الوطني السعودي 🇸🇦 أو كولكشن يوفا"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                البادج بالإنجليزي (Badge EN)
                              </label>
                              <input
                                type="text"
                                value={slide.badgeEn || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { badgeEn: e.target.value })}
                                placeholder="e.g. Saudi National Celebration or Luxury Eyewear"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-start font-sans"
                              />
                            </div>

                            {/* Highlight text next to badge */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                النص المميز للبادج بالعربي (Highlight AR)
                              </label>
                              <input
                                type="text"
                                value={slide.highlightAr || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { highlightAr: e.target.value })}
                                placeholder="مثلاً: خصومات تصل إلى 60%"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                النص المميز للبادج بالإنجليزي (Highlight EN)
                              </label>
                              <input
                                type="text"
                                value={slide.highlightEn || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { highlightEn: e.target.value })}
                                placeholder="e.g. Up to 60% Off"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-start font-sans"
                              />
                            </div>

                            {/* Hero Main Heading */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                عنوان الهيرو الرئيسي بالعربي (Title AR)
                              </label>
                              <input
                                type="text"
                                value={slide.titleAr || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { titleAr: e.target.value })}
                                placeholder="مثلاً: رؤية لوطن أعظم أو أناقة تليق بك"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                عنوان الهيرو الرئيسي بالإنجليزي (Title EN)
                              </label>
                              <input
                                type="text"
                                value={slide.titleEn || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { titleEn: e.target.value })}
                                placeholder="e.g. A Vision for Greatness"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-start font-sans"
                              />
                            </div>

                            {/* Hero Subtitle / Description */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                وصف الهيرو بالعربي (Subtitle AR)
                              </label>
                              <textarea
                                value={slide.subtitleAr || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { subtitleAr: e.target.value })}
                                placeholder="اكتب وصفاً جذاباً للهيرو، أو اتركه فارغاً لإخفاء حاوية الوصف تماماً..."
                                rows={2}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                وصف الهيرو بالإنجليزي (Subtitle EN)
                              </label>
                              <textarea
                                value={slide.subtitleEn || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { subtitleEn: e.target.value })}
                                placeholder="Hero subtitle in English (or leave blank to hide)..."
                                rows={2}
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-start font-sans"
                              />
                            </div>

                            {/* Primary Button Text */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                نص الزر الرئيسي بالعربي (Primary Button AR)
                              </label>
                              <input
                                type="text"
                                value={slide.ctaTextAr || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { ctaTextAr: e.target.value })}
                                placeholder="مثلاً: تسوق العروض الحصرية أو تسوق الآن"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                نص الزر الرئيسي بالإنجليزي (Primary Button EN)
                              </label>
                              <input
                                type="text"
                                value={slide.ctaTextEn || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { ctaTextEn: e.target.value })}
                                placeholder="e.g. Shop Exclusive Deals"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-start font-sans"
                              />
                            </div>

                            {/* Primary Button Destination Link */}
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                مكان التوجيه للزر الرئيسي (Primary Button Destination Link / Category)
                              </label>
                              <input
                                type="text"
                                value={slide.ctaLink || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { ctaLink: e.target.value })}
                                placeholder="مثلاً: /shop أو /eyeglasses أو /sunglasses أو /contact-lenses أو رابط خارجي https://..."
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white font-mono text-start"
                              />
                              <p className="text-[10px] text-slate-400 mt-1">
                                * يمكنك كتابة /shop لفتح المتجر، أو اسم القسم مثل /eyeglasses أو رابط صفحة كاملة.
                              </p>
                            </div>

                            {/* Secondary Button Text */}
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                نص الزر الثانوي بالعربي (اختياري - Secondary Button AR)
                              </label>
                              <input
                                type="text"
                                value={slide.secondaryCtaTextAr || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { secondaryCtaTextAr: e.target.value })}
                                placeholder="مثلاً: احجز فحص نظر VIP (اتركه فارغاً لإخفاء الزر)"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                نص الزر الثانوي بالإنجليزي (اختياري - Secondary Button EN)
                              </label>
                              <input
                                type="text"
                                value={slide.secondaryCtaTextEn || ''}
                                onChange={(e) => handleUpdateHeroSlide(sIdx, { secondaryCtaTextEn: e.target.value })}
                                placeholder="e.g. Book VIP Exam (leave blank to hide)"
                                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold bg-white text-start font-sans"
                              />
                            </div>

                            {/* Secondary Button Action Type */}
                            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-xl bg-white border border-slate-200">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={Boolean(slide.isVipAction)}
                                  onChange={(e) => handleUpdateHeroSlide(sIdx, { isVipAction: e.target.checked })}
                                  className="w-4 h-4 rounded text-[#A58454] focus:ring-[#A58454]"
                                />
                                <span className="text-xs font-bold text-slate-800">
                                  فتح نافذة حجز فحص نظر VIP مباشرة عند النقر (Open VIP Exam Modal)
                                </span>
                              </label>

                              {!slide.isVipAction && (
                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={slide.secondaryCtaLink || ''}
                                    onChange={(e) => handleUpdateHeroSlide(sIdx, { secondaryCtaLink: e.target.value })}
                                    placeholder="رابط الزر الثانوي البديل..."
                                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono text-start"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 6. Clinic / Free Vision Exam Banner Management */}
                <div className="md:col-span-2 p-5 sm:p-6 rounded-3xl border border-slate-200 bg-white shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[#A58454]" />
                      <span>{t('صورة وبانر فحص النظر المجاني بالواجهة الرئيسية (Free Vision Exam Banner)', 'Clinic Banner')}</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {t(
                        'ارفع من هنا الصورة المخصصة التي تظهر في بانر "احجز فحص نظرك مجاناً" بالصفحة الرئيسية. يتم تطبيق الصورة المرفوعة فوراً وحذف أي صور ثابتة.',
                        'Upload the custom image for the "Book Your Free Vision Exam" banner on the homepage. Replaces all static images completely.'
                      )}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {/* Image Uploader */}
                    <ImageUploader
                      value={localSettings.clinicBannerImage || ''}
                      onChange={(url) => setLocalSettings({ ...localSettings, clinicBannerImage: url })}
                      folder="banners"
                      label="صورة بانر فحص النظر (Clinic Diagnostic Suite Banner Image)"
                      placeholder="رابط الصورة أو اختر ملفاً لرفعه من جهازك..."
                    />

                    {/* Banner Title & Subtitle Customizations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          عنوان البانر بالعربي (اختياري)
                        </label>
                        <input
                          type="text"
                          value={localSettings.clinicBannerTitleAr || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, clinicBannerTitleAr: e.target.value })}
                          placeholder="الافتراضي: احجز فحص نظرك مجاناً"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          عنوان البانر بالإنجليزي (اختياري)
                        </label>
                        <input
                          type="text"
                          value={localSettings.clinicBannerTitleEn || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, clinicBannerTitleEn: e.target.value })}
                          placeholder="Default: Book Your Free Vision Exam"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          وصف البانر بالعربي (اختياري)
                        </label>
                        <textarea
                          value={localSettings.clinicBannerSubtitleAr || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, clinicBannerSubtitleAr: e.target.value })}
                          placeholder="الافتراضي: مع أخصائيين معتمدين وأحدث أجهزة الفحص الرقمية المتطورة"
                          rows={2}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          وصف البانر بالإنجليزي (اختياري)
                        </label>
                        <textarea
                          value={localSettings.clinicBannerSubtitleEn || ''}
                          onChange={(e) => setLocalSettings({ ...localSettings, clinicBannerSubtitleEn: e.target.value })}
                          placeholder="Default: With certified optometrists and cutting-edge digital diagnostic technology"
                          rows={2}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold text-start font-sans"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Sticky Save Button */}
              <div className="flex justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  disabled={isSavingSettings}
                  className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Check className="w-4 h-4 text-[#C5A880]" />
                  <span>{isSavingSettings ? 'جاري الحفظ لـ Firebase...' : 'حفظ كافة إعدادات المنصة'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MASTER PRODUCT ADD / EDIT MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden border border-slate-200 shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#A58454]/20 border border-[#A58454]/40 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-[#C5A880]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold font-kufi">
                    {isAddMode ? t('إضافة منتج أو عدسات جديدة', 'Add New Product / Lenses') : t('تعديل تفاصيل المنتج والكتالوج', 'Edit Product Catalog Details')}
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-slate-400 font-mono">
                    SKU: {editingProduct.sku}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Wizard Step Progress Stepper */}
            <div className="bg-slate-50 px-4 sm:px-6 py-3 border-b border-slate-200 shrink-0">
              <div className="flex items-center justify-between max-w-2xl mx-auto text-xs font-bold font-kufi text-slate-500">
                {[1, 2, 3, 4, 5, 6].map((num) => {
                  const labels = [
                    t('البيانات الأساسية', 'Basic Info'),
                    t('الصور والألوان', 'Media & Colors'),
                    t('الأوصاف والـ HTML', 'Descriptions'),
                    t('خيارات القسم', 'Category Options'),
                    t('الأسعار والمواصفات', 'Prices & Specs'),
                    t('SEO والسكيما', 'SEO & Schema')
                  ];
                  const isActive = wizardStep === num;
                  const isCompleted = wizardStep > num;
                  return (
                    <div key={num} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setWizardStep(num)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center border font-mono transition-all text-[10px] cursor-pointer ${
                          isActive
                            ? 'bg-slate-900 border-slate-900 text-white ring-2 ring-slate-900/20'
                            : isCompleted
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white border-slate-300 text-slate-500 hover:border-slate-400'
                        }`}
                      >
                        {isCompleted ? '✓' : num}
                      </button>
                      <span className={`hidden md:inline text-[9px] ${isActive ? 'text-slate-900 font-bold' : 'text-slate-400 font-normal'}`}>
                        {labels[num - 1]}
                      </span>
                      {num < 6 && (
                        <div className={`hidden md:block h-[1px] w-2 ${isCompleted ? 'bg-emerald-600' : 'bg-slate-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveProduct} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
              
              {/* STEP 1: BASIC INFO */}
              {wizardStep === 1 && (
                <div className="space-y-4 font-kufi">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      الخطوة الأولى: البيانات الأساسية للتعريف بالمنتج
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      أدخل الاسم باللغتين العربية والإنجليزية، وحدد القسم الرئيسي والماركة ورمز المخزون SKU.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        اسم المنتج بالعربي *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.nameAr || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, nameAr: e.target.value })}
                        placeholder="مثلاً: نظارة سيرانو شمسية سوداء"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Product Name (English) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.nameEn || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, nameEn: e.target.value })}
                        placeholder="e.g. Serrano Sunglasses Black"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        رمز المخزون الفريد (SKU) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.sku || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                        placeholder="e.g. SR-SUN-BLK"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                      />
                    </div>

                    {/* Category Writable Combobox with linked auto-population */}
                    <div>
                      <WritableCombobox
                        labelAr="القسم الرئيسي"
                        labelEn="Main Category"
                        suggestions={activeCategorySuggestions}
                        valueAr={editingProduct.categoryAr || ''}
                        valueEn={editingProduct.categoryEn || ''}
                        readOnly={true}
                        onChangeAr={(valAr) => {
                          const matched = activeCategorySuggestions.find(s => s.ar === valAr || valAr.includes(s.ar));
                          const valEn = matched ? matched.en : (editingProduct.categoryEn || '');
                          setEditingProduct({
                            ...editingProduct,
                            categoryAr: valAr,
                            categoryEn: valEn,
                            category: matched ? matched.en : valEn.toLowerCase()
                          });
                        }}
                        onChangeEn={(valEn) => {
                          const matched = activeCategorySuggestions.find(s => s.en.toLowerCase() === valEn.toLowerCase());
                          setEditingProduct({
                            ...editingProduct,
                            categoryEn: valEn,
                            category: valEn.toLowerCase(),
                            categoryAr: matched ? matched.ar : (editingProduct.categoryAr || '')
                          });
                        }}
                        required
                      />
                    </div>

                    {/* Brand Writable Combobox */}
                    <div className="sm:col-span-2">
                      <WritableCombobox
                        labelAr="الماركة / العلامة التجارية"
                        labelEn="Brand Name"
                        suggestions={activeBrandSuggestions}
                        valueAr={editingProduct.brandAr || ''}
                        valueEn={editingProduct.brandEn || ''}
                        onDeleteOption={handleDeleteBrandOption}
                        onChangeAr={(valAr) => {
                          const matched = activeBrandSuggestions.find(s => s.ar === valAr);
                          const valEn = matched ? matched.en : (editingProduct.brandEn || '');
                          setEditingProduct({
                            ...editingProduct,
                            brandAr: valAr,
                            brandEn: valEn,
                            brand: matched ? matched.en : valAr
                          });
                        }}
                        onChangeEn={(valEn) => {
                          const matched = activeBrandSuggestions.find(s => s.en.toLowerCase() === valEn.toLowerCase());
                          setEditingProduct({
                            ...editingProduct,
                            brandEn: valEn,
                            brand: valEn,
                            brandAr: matched ? matched.ar : (editingProduct.brandAr || '')
                          });
                        }}
                        required
                      />
                    </div>

                    {/* Dynamic Total Stock display / direct manual entry */}
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        المخزون الكلي للمنتج *
                      </label>
                      {editingProduct.colors && editingProduct.colors.length > 0 && editingProduct.colors[0].id !== 'default' ? (
                        <div className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-slate-600 flex justify-between items-center">
                          <span>{editingProduct.colors.reduce((sum, c) => sum + (c.stock || 0), 0)} وحدة</span>
                          <span className="text-[10px] text-emerald-600 font-kufi font-normal">(يُحسب تلقائياً كإجمالي مخزون الألوان المدرجة)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <input
                            type="number"
                            required
                            min={0}
                            value={editingProduct.colors?.[0]?.stock || 0}
                            onChange={(e) => {
                              const stockVal = Number(e.target.value);
                              const updatedColors = [...(editingProduct.colors || [])];
                              if (updatedColors.length === 0) {
                                updatedColors.push({
                                  id: 'default',
                                  nameAr: 'افتراضي',
                                  nameEn: 'Default',
                                  hex: '#0F172A',
                                  image: '/images/prod_acetate.webp',
                                  stock: stockVal
                                });
                              } else {
                                updatedColors[0].stock = stockVal;
                              }
                              setEditingProduct({
                                ...editingProduct,
                                colors: updatedColors
                              });
                            }}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold bg-amber-50/10"
                          />
                          <p className="text-[10px] text-slate-400">
                            لا توجد ألوان مخصصة لهذا المنتج حالياً، لذا يتم إدخال المخزون العام مباشرة هنا.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: MEDIA & COLORS */}
              {wizardStep === 2 && (
                <div className="space-y-4 font-kufi">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      الخطوة الثانية: صور المنتج ومتغيرات الألوان
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      يمكنك تحديد ما إذا كان المنتج يتوفر بألوان معينة أو تفعيل الصور العامة الموحدة (بدون ألوان) مع كتابة نصوص الـ Alt.
                    </p>
                  </div>

                  {/* Multi-colors toggle selector */}
                  <div className="flex items-center gap-3 p-3 bg-slate-100 rounded-xl">
                    <span className="text-xs font-bold text-slate-700">هل تود تفعيل خيارات الألوان المتعددة لهذا المنتج؟</span>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          // Toggle YES: convert default to real colors if empty
                          const existingColors = editingProduct.colors || [];
                          const cleaned = existingColors.filter(c => c.id !== 'default');
                          if (cleaned.length === 0) {
                            cleaned.push({
                              id: `clr-${Date.now()}-1`,
                              nameAr: 'أسود مطفي كلاسيكي',
                              nameEn: 'Classic Matte Black',
                              hex: '#0F172A',
                              image: '/images/prod_acetate.webp',
                              stock: existingColors[0]?.stock || 25,
                              images: []
                            });
                          }
                          setEditingProduct({ ...editingProduct, colors: cleaned });
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                          editingProduct.colors && editingProduct.colors.length > 0 && editingProduct.colors[0].id !== 'default'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        نعم، بخصائص ألوان
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // Toggle NO: save current aggregate stock inside default color variant
                          const totalS = editingProduct.colors ? editingProduct.colors.reduce((sum, c) => sum + (c.stock || 0), 0) : 10;
                          const defaultColor: ProductColorVariant = {
                            id: 'default',
                            nameAr: 'افتراضي',
                            nameEn: 'Default',
                            hex: '#0F172A',
                            image: editingProduct.colors?.[0]?.image || '/images/prod_acetate.webp',
                            stock: totalS,
                            images: []
                          };
                          setEditingProduct({
                            ...editingProduct,
                            colors: [defaultColor]
                          });
                        }}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-colors ${
                          !editingProduct.colors || editingProduct.colors.length === 0 || editingProduct.colors[0].id === 'default'
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        لا، صور عامة موحدة
                      </button>
                    </div>
                  </div>

                  {/* DISPLAY COLORS SUB-FORM */}
                  {editingProduct.colors && editingProduct.colors.length > 0 && editingProduct.colors[0].id !== 'default' ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pt-2">
                        <strong className="text-xs font-bold text-slate-800">قائمة الألوان والكميات والصور الفرعية المتعددة:</strong>
                        <button
                          type="button"
                          onClick={handleAddColorToEditing}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all shadow-xs"
                        >
                          + إضافة لون إضافي
                        </button>
                      </div>

                      <div className="space-y-4">
                        {editingProduct.colors.map((color, idx) => (
                          <div
                            key={color.id}
                            className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 shadow-2xs"
                          >
                            <div className="flex flex-wrap items-center gap-3">
                              <div className="flex items-center gap-1.5 shrink-0">
                                <input
                                  type="color"
                                  value={color.hex}
                                  onChange={(e) => {
                                    const updated = [...editingProduct.colors];
                                    updated[idx].hex = e.target.value;
                                    setEditingProduct({ ...editingProduct, colors: updated });
                                  }}
                                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0"
                                />
                                <span className="text-[10px] font-bold text-slate-500">اختر اللون</span>
                              </div>

                              <input
                                type="text"
                                required
                                value={color.nameAr || ''}
                                onChange={(e) => {
                                  const updated = [...editingProduct.colors];
                                  updated[idx].nameAr = e.target.value;
                                  setEditingProduct({ ...editingProduct, colors: updated });
                                }}
                                placeholder="الاسم بالعربي (مثلا: هافانا عسلي)"
                                className="w-40 text-xs p-2 rounded-xl border border-slate-300 bg-white"
                              />

                              <input
                                type="text"
                                required
                                value={color.nameEn || ''}
                                onChange={(e) => {
                                  const updated = [...editingProduct.colors];
                                  updated[idx].nameEn = e.target.value;
                                  setEditingProduct({ ...editingProduct, colors: updated });
                                }}
                                placeholder="Name (En) e.g. Honey Havana"
                                className="w-40 text-xs p-2 rounded-xl border border-slate-300 bg-white font-mono"
                              />

                              <div className="flex items-center gap-1 shrink-0">
                                <span className="text-[10px] font-bold text-slate-500">مخزون اللون:</span>
                                <input
                                  type="number"
                                  required
                                  min={0}
                                  value={color.stock}
                                  onChange={(e) => {
                                    const updated = [...editingProduct.colors];
                                    updated[idx].stock = Number(e.target.value);
                                    setEditingProduct({ ...editingProduct, colors: updated });
                                  }}
                                  className="w-16 text-xs p-2 rounded-xl border border-slate-300 bg-white text-center font-mono font-bold"
                                />
                              </div>

                              <button
                                type="button"
                                onClick={() => {
                                  const updated = editingProduct.colors.filter((_, i) => i !== idx);
                                  setEditingProduct({ ...editingProduct, colors: updated });
                                }}
                                disabled={editingProduct.colors.length <= 1}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 cursor-pointer ms-auto"
                                title="حذف هذا اللون"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Main Color Image input */}
                            <div>
                              <ImageUploader
                                value={color.image || ''}
                                onChange={(url) => {
                                  const updated = [...editingProduct.colors];
                                  updated[idx].image = url;
                                  setEditingProduct({ ...editingProduct, colors: updated });
                                }}
                                folder="products"
                                label="رابط الصورة الرئيسية لهذا اللون (Main Color Image) *"
                                placeholder="رابط الصورة الرئيسية أو اختر ملفاً للرفع المباشر..."
                              />
                            </div>

                            {/* Additional images list for this color */}
                            <div className="pt-2 border-t border-slate-200/60 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-600">صور إضافية لهذا اللون (زوايا متعددة):</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...editingProduct.colors];
                                    if (!updated[idx].images) {
                                      updated[idx].images = [];
                                    }
                                    updated[idx].images!.push({ url: '', alt: `${color.nameAr} - زاوية إضافية` });
                                    setEditingProduct({ ...editingProduct, colors: updated });
                                  }}
                                  className="text-[10px] text-[#A58454] hover:underline font-bold"
                                >
                                  + إضافة صورة إضافية للون
                                </button>
                              </div>

                              {color.images && color.images.length > 0 && (
                                <div className="grid grid-cols-1 gap-2">
                                  {color.images.map((img, imgIdx) => (
                                    <div key={imgIdx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                                      <ImageUploader
                                        value={img.url || ''}
                                        onChange={(url) => {
                                          const updated = [...editingProduct.colors];
                                          updated[idx].images![imgIdx].url = url;
                                          setEditingProduct({ ...editingProduct, colors: updated });
                                        }}
                                        folder="products"
                                        label={`الصورة الإضافية ${imgIdx + 1}`}
                                        placeholder="رابط الصورة الإضافية أو اختر ملفاً للرفع..."
                                      />
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={img.alt || ''}
                                          onChange={(e) => {
                                            const updated = [...editingProduct.colors];
                                            updated[idx].images![imgIdx].alt = e.target.value;
                                            setEditingProduct({ ...editingProduct, colors: updated });
                                          }}
                                          placeholder="عنوان الصورة alt (مهم لمحركات البحث)"
                                          className="flex-1 text-[11px] p-2 rounded-xl border border-slate-200 bg-white outline-none"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            const updated = [...editingProduct.colors];
                                            updated[idx].images = updated[idx].images!.filter((_, i) => i !== imgIdx);
                                            setEditingProduct({ ...editingProduct, colors: updated });
                                          }}
                                          className="p-2 rounded-xl border border-rose-200 text-rose-500 hover:bg-rose-50 cursor-pointer transition-colors"
                                          title="حذف هذه الصورة الإضافية"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    /* NO COLORS SUB-FORM (GENERAL PRODUCT IMAGE GALLERY) */
                    <div className="space-y-3 p-4 rounded-2xl bg-amber-50/10 border border-amber-200/50">
                      <div className="flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-slate-800">معرض الصور العام للمنتج (Product Images):</strong>
                          <span className="block text-[10px] text-slate-500">أدخل صوراً عامة للمنتج بدون الحاجة لربطها بمتغيرات ألوان معينة.</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedDefaults = [...(editingProduct.defaultImages || [])];
                            updatedDefaults.push({ url: '', alt: `${editingProduct.nameAr} - صورة المعرض` });
                            setEditingProduct({ ...editingProduct, defaultImages: updatedDefaults });
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all shadow-xs"
                        >
                          + إضافة صورة للمعرض
                        </button>
                      </div>

                      {/* Display Default Images List */}
                      <div className="space-y-2">
                        {(!editingProduct.defaultImages || editingProduct.defaultImages.length === 0) ? (
                          <div className="p-4 text-center text-[11px] text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                            لا توجد صور مضافة لمعرض المنتج حتى الآن. اضغط على الزر بالأعلى لإضافة صورة.
                          </div>
                        ) : (
                          editingProduct.defaultImages.map((img, dIdx) => (
                            <div key={dIdx} className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                              <ImageUploader
                                value={img.url || ''}
                                onChange={(url) => {
                                  const updatedDefaults = [...(editingProduct.defaultImages || [])];
                                  updatedDefaults[dIdx].url = url;
                                  setEditingProduct({ ...editingProduct, defaultImages: updatedDefaults });
                                }}
                                folder="products"
                                label={`صورة المعرض ${dIdx + 1}`}
                                placeholder="رابط الصورة أو اختر ملفاً للرفع..."
                              />
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={img.alt || ''}
                                  onChange={(e) => {
                                    const updatedDefaults = [...(editingProduct.defaultImages || [])];
                                    updatedDefaults[dIdx].alt = e.target.value;
                                    setEditingProduct({ ...editingProduct, defaultImages: updatedDefaults });
                                  }}
                                  placeholder="عنوان الصورة البديل (Alt Text) لمحركات البحث"
                                  className="flex-1 text-[11px] p-2 rounded-xl border border-slate-200 outline-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updatedDefaults = editingProduct.defaultImages!.filter((_, i) => i !== dIdx);
                                    setEditingProduct({ ...editingProduct, defaultImages: updatedDefaults });
                                  }}
                                  className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="حذف هذه الصورة من المعرض"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3: DESCRIPTIONS & HTML */}
              {wizardStep === 3 && (
                <div className="space-y-5 font-kufi">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      الخطوة الثالثة: الأوصاف والوصف الكامل بصيغة HTML المتقدمة
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      اكتب أوصفاً مختصرة لبطاقة المنتج، واستعمل المحرر المرئي التفاعلي بالأسفل لصياغة وصف كامل وجذاب يدعم العناوين والربط الداخلي.
                    </p>
                  </div>

                  {/* Short Descriptions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الوصف المختصر بالعربي (يظهر في كرت المنتج وقوائم البحث)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.shortDescriptionAr || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, shortDescriptionAr: e.target.value })}
                        placeholder="مثال: إطار طبي خفيف وعصري مصنع من مادة TR90 المرنة"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Short Description (English)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.shortDescriptionEn || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, shortDescriptionEn: e.target.value })}
                        placeholder="e.g. Ultra-lightweight optical frame crafted from flexible TR90 polymer"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                  </div>

                  {/* HIGH-FIDELITY HTML RICH EDITOR SPLIT SECTION */}
                  <div className="space-y-4 pt-3 border-t border-slate-200">
                    
                    {/* Language Switcher Tabs */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-1 shrink-0">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveLangTab('ar')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeLangTab === 'ar'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          🇸🇦 الوصف الكامل بالعربية
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveLangTab('en')}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            activeLangTab === 'en'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          🇺🇸 English Description
                        </button>
                      </div>

                      {/* Mode Indicators */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setEditorMode('visual')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            editorMode === 'visual'
                              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <Eye className={`w-3.5 h-3.5 ${editorMode === 'visual' ? 'text-[#A58454]' : 'text-slate-400'}`} />
                          <span>محرر جنباً إلى جنب (معاينة حية)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorMode('source')}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                            editorMode === 'source'
                              ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80 font-bold'
                              : 'text-slate-500 hover:text-slate-800'
                          }`}
                        >
                          <FileCode className={`w-3.5 h-3.5 ${editorMode === 'source' ? 'text-[#A58454]' : 'text-slate-400'}`} />
                          <span>كود HTML المصدر (كامل العرض)</span>
                        </button>
                      </div>
                    </div>

                    {/* Main Title bar of the chosen language */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                        {activeLangTab === 'ar'
                          ? 'تفاصيل ووصف المنتج الكامل (بالعربية - يدعم HTML)'
                          : 'Detailed Product Description & Full Specifications (HTML format)'}
                      </h4>
                    </div>

                    {/* Toolbar Panel (The elegant dark bar in the user\'s mockup) */}
                    <div className="bg-[#0b1329] rounded-2xl p-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-slate-300 font-sans shadow-md select-none border border-slate-800">
                      
                      {/* Heading tags group */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<h1>', '</h1>')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                          title="العنوان الرئيسي H1"
                        >
                          H2 H1
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<h2>', '</h2>')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                          title="العنوان الفرعي H2"
                        >
                          H3 H2
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<h3>', '</h3>')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                          title="العنوان الصغير H3"
                        >
                          H3
                        </button>
                      </div>

                      <div className="h-5 w-[1px] bg-slate-700" />

                      {/* Inline styling group */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<strong>', '</strong>')}
                          className="w-6 h-6 rounded-md text-xs font-bold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                          title="عريض B"
                        >
                          B
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<em>', '</em>')}
                          className="w-6 h-6 rounded-md text-xs italic bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors font-serif"
                          title="مائل I"
                        >
                          I
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<mark class="bg-amber-100 px-1 rounded">', '</mark>')}
                          className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#A58454] text-slate-950 hover:bg-yellow-400 transition-colors uppercase"
                          title="تحديد وتمييز النص"
                        >
                          MARK
                        </button>
                      </div>

                      <div className="h-5 w-[1px] bg-slate-700" />

                      {/* Lists Group */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<ul>\n  <li>', '</li>\n</ul>')}
                          className="px-2 py-1 rounded-md text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                          title="قائمة نقطية"
                        >
                          • قائمة
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<ol>\n  <li>', '</li>\n</ol>')}
                          className="px-2 py-1 rounded-md text-[10px] bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors"
                          title="قائمة مرقمة"
                        >
                          1. قائمة
                        </button>
                      </div>

                      <div className="h-5 w-[1px] bg-slate-700" />

                      {/* Quotes and links */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<blockquote class="border-r-4 border-[#A58454] pr-4 italic text-slate-600 my-2 bg-slate-50 p-2 rounded-xl">', '</blockquote>')}
                          className="w-6 h-6 rounded-md text-sm font-bold bg-slate-800 hover:bg-slate-700 hover:text-white transition-colors text-center"
                          title="اقتباس مقتبس"
                        >
                          ”
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<a href="/lens-wizard" class="text-[#A58454] hover:underline font-bold">', '</a>')}
                          className="px-2.5 py-1 rounded-md text-[10px] font-bold bg-[#A58454]/20 border border-[#A58454]/40 hover:bg-[#A58454]/40 hover:text-white transition-all flex items-center gap-1 text-[#C5A880]"
                          title="رابط داخلي في الموقع"
                        >
                          <span>🔗 رابط داخلي</span>
                        </button>
                      </div>

                      <div className="h-5 w-[1px] bg-slate-700 hidden lg:block" />

                      {/* Enhanced rich block additions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<div class="p-3.5 my-3 rounded-xl bg-slate-50 border border-slate-200"><strong class="text-slate-900 block mb-1">📌 أهم النقاط:</strong><ul class="list-disc pr-4 space-y-1"><li>', '</li></ul></div>')}
                          className="px-2 py-1 rounded-md text-[10px] bg-emerald-950 text-emerald-300 hover:bg-emerald-900 hover:text-white transition-all font-bold"
                          title="إضافة قائمة نقاط فنية مميزة"
                        >
                          + أهم النقاط
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<div class="p-3.5 my-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900"><strong class="block mb-1">💡 نصيحة الخبير:</strong>', '</div>')}
                          className="px-2 py-1 rounded-md text-[10px] bg-amber-950 text-amber-300 hover:bg-amber-900 hover:text-white transition-all font-bold"
                          title="إضافة نصيحة طبية أو فنية"
                        >
                          + نصيحة
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<div class="p-3.5 my-3 rounded-xl bg-slate-50 border border-slate-200"><strong class="block mb-1">❓ الأسئلة الشائعة:</strong><p class="font-bold">س: ...؟</p><p>ج: ...</p>', '</div>')}
                          className="px-2 py-1 rounded-md text-[10px] bg-blue-950 text-blue-300 hover:bg-blue-900 hover:text-white transition-all font-bold"
                          title="إضافة سؤال وجواب"
                        >
                          + أسئلة
                        </button>
                      </div>

                      {/* Icons helpers */}
                      <div className="flex items-center gap-1 ms-auto">
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<table class="w-full text-xs text-start border-collapse my-3"><thead class="bg-slate-100"><tr><th class="border p-2">المواصفة</th><th class="border p-2">التفاصيل</th></tr></thead><tbody><tr><td class="border p-2">الخاصية 1</td><td class="border p-2">القيمة 1</td></tr></tbody></table>', '')}
                          className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-xs flex items-center justify-center transition-colors"
                          title="إضافة جدول مواصفات"
                        >
                          田
                        </button>
                        <button
                          type="button"
                          onClick={() => insertTag(activeLangTab, '<img src="https://picsum.photos/seed/design/800/400" alt="صورة توضيحية للمنتج" class="rounded-xl my-3 max-w-full" referrerPolicy="no-referrer" />', '')}
                          className="w-6 h-6 rounded-md bg-slate-800 hover:bg-slate-700 text-xs flex items-center justify-center transition-colors"
                          title="إضافة صورة توضيحية داخل الوصف"
                        >
                          🖼️
                        </button>
                      </div>
                    </div>

                    {/* Editor & Preview Side-By-Side Grid layout */}
                    <div className={editorMode === 'visual' ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 gap-4"}>
                      
                      {/* RIGHT COLUMN: TEXT SOURCE CODE EDITOR */}
                      <div className="space-y-1.5 flex flex-col">
                        <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold">
                          <span>محرر كود الـ HTML والوصف التفصيلي للمنتج</span>
                          <span className="font-mono text-slate-400">RTL Input Panel</span>
                        </div>
                        <textarea
                          id={activeLangTab === 'ar' ? 'desc-ar-textarea' : 'desc-en-textarea'}
                          rows={12}
                          required
                          value={activeLangTab === 'ar' ? (editingProduct.descriptionAr || '') : (editingProduct.descriptionEn || '')}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (activeLangTab === 'ar') {
                              setEditingProduct({ ...editingProduct, descriptionAr: val });
                            } else {
                              setEditingProduct({ ...editingProduct, descriptionEn: val });
                            }
                          }}
                          placeholder={activeLangTab === 'ar'
                            ? "اكتب هنا تفاصيل المنتج ووصفه الشامل بصيغة HTML أو فقرات منسقة... يمكنك استخدام الأزرار في الشريط بالأعلى لإضافة العناوين، الجداول، القوائم المنقطة والمميزة لتظهر للعميل بشكل جذاب واحترافي."
                            : "Enter the detailed product specifications, features, and descriptions in HTML format. You can use the rich formatting toolbar above to insert headlines, bullet lists, custom callouts, tables, and images."
                          }
                          className={`w-full text-xs p-3 rounded-2xl border border-slate-300 font-mono leading-relaxed bg-white shadow-2xs focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all outline-none ${
                            editorMode === 'source' ? 'h-[420px]' : 'h-[320px]'
                          }`}
                        />
                      </div>

                      {/* LEFT COLUMN: LIVE VISITOR PREVIEW CONTAINER */}
                      {editorMode === 'visual' && (
                        <div className="space-y-1.5 flex flex-col animate-fadeIn">
                          <div className="flex justify-between items-center text-[10px] text-[#A58454] font-bold">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              معاينة العرض الحية للزوار (Live Preview)
                            </span>
                            <span className="font-mono text-slate-400">WYSIWYG Visitor View</span>
                          </div>

                          <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 p-4 overflow-y-auto h-[320px] shadow-inner shrink-0 text-slate-800 text-xs sm:text-sm leading-relaxed max-h-[320px] custom-scrollbar">
                            {activeLangTab === 'ar' ? (
                              editingProduct.descriptionAr ? (
                                <div
                                  className="prose prose-slate prose-xs max-w-none text-right rtl"
                                  dangerouslySetInnerHTML={{ __html: editingProduct.descriptionAr }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-400 text-center text-xs italic">
                                  سيظهر هنا عرض حي ومعاينة تفاعلية لكيفية ظهور الوصف التفصيلي لعملائك لضمان التنسيق الجذاب والجميل...
                                </div>
                              )
                            ) : (
                              editingProduct.descriptionEn ? (
                                <div
                                  className="prose prose-slate prose-xs max-w-none text-left ltr font-sans"
                                  dangerouslySetInnerHTML={{ __html: editingProduct.descriptionEn }}
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-400 text-center text-xs italic">
                                  A real-time live preview of the detailed product description will appear here, showing exactly how it will be displayed to your store visitors...
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: CATEGORY OPTIONS */}
              {wizardStep === 4 && (
                <div className="space-y-4 font-kufi">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      الخطوة الرابعة: الخصائص الفردية للقسم والمنتج
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      يقوم النظام تلقائياً بتحميل الخيارات الملائمة بناءً على اختيارك لقسم المنتج الرئيسي في الخطوة الأولى.
                    </p>
                  </div>

                  {/* 1. EYEGLASSES AND SUNGLASSES OPTIONS */}
                  {(editingProduct.category === 'eyeglasses' || editingProduct.category === 'sunglasses' || editingProduct.category === 'kids' || editingProduct.categoryAr?.includes('نظار')) && (
                    <div className="space-y-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs">
                      <span className="text-xs font-bold text-[#A58454] block">🛡️ خيارات النظارات والعدسات الطبية:</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Target Gender - Fixed non-creatable options (رجال، نساء، للجنسين) with English text input removed */}
                        <div>
                          <label className="block text-[11px] font-bold text-slate-700 font-kufi mb-1">
                            الفئة المستهدفة *
                          </label>
                          <select
                            value={
                              editingProduct.genderAr === 'رجال' || editingProduct.genderAr === 'رجالي' || editingProduct.gender === 'men'
                                ? 'رجال'
                                : editingProduct.genderAr === 'نساء' || editingProduct.genderAr === 'نسائي' || editingProduct.gender === 'women'
                                ? 'نساء'
                                : 'للجنسين'
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === 'رجال') {
                                setEditingProduct({
                                  ...editingProduct,
                                  genderAr: 'رجال',
                                  genderEn: 'Men',
                                  gender: 'men',
                                });
                              } else if (val === 'نساء') {
                                setEditingProduct({
                                  ...editingProduct,
                                  genderAr: 'نساء',
                                  genderEn: 'Women',
                                  gender: 'women',
                                });
                              } else {
                                setEditingProduct({
                                  ...editingProduct,
                                  genderAr: 'للجنسين',
                                  genderEn: 'Unisex',
                                  gender: 'unisex',
                                });
                              }
                            }}
                            className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none cursor-pointer"
                          >
                            <option value="للجنسين">للجنسين (Unisex)</option>
                            <option value="رجال">رجال (Men)</option>
                            <option value="نساء">نساء (Women)</option>
                          </select>
                        </div>

                        {/* Frame Shape */}
                        <WritableCombobox
                          labelAr="شكل الإطار الهندسي"
                          labelEn="Frame Geometric Shape"
                          suggestions={activeFrameShapeSuggestions}
                          valueAr={editingProduct.frameShapeAr || ''}
                          valueEn={editingProduct.frameShapeEn || ''}
                          onDeleteOption={handleDeleteFrameShapeOption}
                          onChangeAr={(valAr) => {
                            const matched = activeFrameShapeSuggestions.find(s => s.ar === valAr);
                            setEditingProduct({
                              ...editingProduct,
                              frameShapeAr: valAr,
                              frameShapeEn: matched ? matched.en : (editingProduct.frameShapeEn || ''),
                              frameShape: matched ? matched.en : valAr
                            });
                          }}
                          onChangeEn={(valEn) => {
                            const matched = activeFrameShapeSuggestions.find(s => s.en.toLowerCase() === valEn.toLowerCase());
                            setEditingProduct({
                              ...editingProduct,
                              frameShapeEn: valEn,
                              frameShape: valEn,
                              frameShapeAr: matched ? matched.ar : (editingProduct.frameShapeAr || '')
                            });
                          }}
                        />
                      </div>

                      {/* Support Lens Customization Switcher */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-slate-800 block">دعم تخصيص وتركيب عدسات طبية للمنتج؟</strong>
                          <span className="text-[10px] text-slate-500 block">عند تفعيله، سيظهر للعميل زر لدخول معالج تفصيل عدسات النظر على مقاس فحصه الشخصي.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.lensType === 'medical' || editingProduct.lensType === 'prescribable' || editingProduct.specs.frameMaterial !== undefined}
                            onChange={(e) => {
                              const isChecked = e.target.checked;
                              setEditingProduct({
                                ...editingProduct,
                                lensType: isChecked ? 'medical' : 'sun'
                              });
                            }}
                            className="w-5 h-5 rounded text-[#A58454]"
                          />
                          <span className="ms-2 text-xs font-bold text-slate-700">تفعيل خيار التخصيص</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {/* 2. CONTACT LENSES OPTIONS */}
                  {(editingProduct.category === 'contact-lenses' || editingProduct.categoryAr?.includes('عدسات')) && (
                    <div className="space-y-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs">
                      <span className="text-xs font-bold text-[#A58454] block">👁️ خيارات وتصنيفات العدسات اللاصقة:</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Contact Lens Subcategory */}
                        <WritableCombobox
                          labelAr="التصنيف الفرعي للعدسات"
                          labelEn="Contact Lens Subcategory"
                          suggestions={activeClSubcategorySuggestions}
                          valueAr={editingProduct.subCategoryAr || ''}
                          valueEn={editingProduct.subCategoryEn || ''}
                          onDeleteOption={handleDeleteClSubcategoryOption}
                          onChangeAr={(valAr) => {
                            const matched = activeClSubcategorySuggestions.find(s => s.ar === valAr);
                            setEditingProduct({
                              ...editingProduct,
                              subCategoryAr: valAr,
                              subCategoryEn: matched ? matched.en : (editingProduct.subCategoryEn || ''),
                              subCategory: matched ? matched.en : valAr
                            });
                          }}
                          onChangeEn={(valEn) => {
                            const matched = activeClSubcategorySuggestions.find(s => s.en.toLowerCase() === valEn.toLowerCase());
                            setEditingProduct({
                              ...editingProduct,
                              subCategoryEn: valEn,
                              subCategory: valEn,
                              subCategoryAr: matched ? matched.ar : (editingProduct.subCategoryAr || '')
                            });
                          }}
                        />

                        {/* Duration of usage */}
                        <WritableCombobox
                          labelAr="مدة الاستخدام"
                          labelEn="Usage Duration"
                          suggestions={activeClDurationSuggestions}
                          valueAr={editingProduct.contactLensDurationAr || ''}
                          valueEn={editingProduct.contactLensDurationEn || ''}
                          onDeleteOption={handleDeleteClDurationOption}
                          onChangeAr={(valAr) => {
                            const matched = activeClDurationSuggestions.find(s => s.ar === valAr);
                            setEditingProduct({
                              ...editingProduct,
                              contactLensDurationAr: valAr,
                              contactLensDurationEn: matched ? matched.en : (editingProduct.contactLensDurationEn || ''),
                              contactLensDuration: matched ? matched.en : valAr
                            });
                          }}
                          onChangeEn={(valEn) => {
                            const matched = activeClDurationSuggestions.find(s => s.en.toLowerCase() === valEn.toLowerCase());
                            setEditingProduct({
                              ...editingProduct,
                              contactLensDurationEn: valEn,
                              contactLensDuration: valEn,
                              contactLensDurationAr: matched ? matched.ar : (editingProduct.contactLensDurationAr || '')
                            });
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. ACCESSORIES & GIFTS GENERAL OPTIONS */}
                  {(editingProduct.category !== 'eyeglasses' && editingProduct.category !== 'sunglasses' && editingProduct.category !== 'contact-lenses' && editingProduct.category !== 'kids') && (
                    <div className="space-y-4 p-4 rounded-2xl border border-slate-200 bg-white shadow-3xs">
                      <span className="text-xs font-bold text-[#A58454] block">🎁 خيارات الإكسسوارات والهدايا الفاخرة:</span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        {/* Accessory material */}
                        <WritableCombobox
                          labelAr="مادة الصنع الأساسية"
                          labelEn="Accessory Material"
                          suggestions={accessoryMaterialSuggestions}
                          valueAr={editingProduct.specs.frameMaterial || ''}
                          valueEn={editingProduct.specs.frameMaterial || ''}
                          onDeleteOption={handleDeleteAccessoryMaterialOption}
                          onChangeAr={(val) => {
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, frameMaterial: val }
                            });
                          }}
                          onChangeEn={(val) => {
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, frameMaterial: val }
                            });
                          }}
                        />

                        {/* Special Features */}
                        <WritableCombobox
                          labelAr="الميزة التنافسية أو الفائدة الفريدة"
                          labelEn="Core Product Feature"
                          suggestions={accessoryFeatureSuggestions}
                          valueAr={editingProduct.specs.oxygenPermeability || ''}
                          valueEn={editingProduct.specs.oxygenPermeability || ''}
                          onDeleteOption={handleDeleteAccessoryFeatureOption}
                          onChangeAr={(val) => {
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, oxygenPermeability: val }
                            });
                          }}
                          onChangeEn={(val) => {
                            setEditingProduct({
                              ...editingProduct,
                              specs: { ...editingProduct.specs, oxygenPermeability: val }
                            });
                          }}
                        />
                      </div>

                      {/* Gift wrapping support checkbox */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <strong className="text-xs font-bold text-slate-800 block">دعم خيارات التغليف الفاخر والإهداء الفوري؟</strong>
                          <span className="text-[10px] text-slate-500 block">عند التفعيل، يمكن للعميل طلب تغليف هدية فاخرة وإرفاق كرت تهنئة مخصص في صفحة الدفع.</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={editingProduct.isNewArrival || false}
                            onChange={(e) => {
                              setEditingProduct({
                                ...editingProduct,
                                isNewArrival: e.target.checked
                              });
                            }}
                            className="w-5 h-5 rounded text-[#A58454]"
                          />
                          <span className="ms-2 text-xs font-bold text-slate-700">تفعيل دعم الهدايا</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: PRICES, PACK SIZES, AND SPECS */}
              {wizardStep === 5 && (
                <div className="space-y-4 font-kufi">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      الخطوة الخامسة: الأسعار المحلية، أسعار دول الخليج والمواصفات الديناميكية
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      عيّن السعر الأساسي بالريال، ليقوم النظام بتوزيع أسعار بقية دول الخليج بنسب الصرف تلقائياً مع قابلية التعديل الكامل.
                    </p>
                  </div>

                  {/* Core Base Prices */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        السعر الأساسي بالريال السعودي (SAR) *
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        step="0.5"
                        value={editingProduct.basePriceSAR}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updatedGcc: Partial<Record<CountryCode, number>> = {};
                          Object.keys(GCC_COUNTRIES).forEach((key) => {
                            const code = key as CountryCode;
                            if (code !== 'SA') {
                              const rate = GCC_COUNTRIES[code].rateToSAR;
                              updatedGcc[code] = Number((val * rate).toFixed(2));
                            }
                          });
                          setEditingProduct({
                            ...editingProduct,
                            basePriceSAR: val,
                            customGccPrices: {
                              ...editingProduct.customGccPrices,
                              ...updatedGcc
                            }
                          });
                        }}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* GCC Dynamic & Writable Country Prices */}
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
                    <strong className="text-xs font-bold text-slate-800 block">🌍 أسعار دول الخليج الأخرى (تتعبأ تلقائياً وقابلة للتعديل):</strong>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                      {Object.keys(GCC_COUNTRIES).map((key) => {
                        const code = key as CountryCode;
                        if (code === 'SA') return null;
                        const country = GCC_COUNTRIES[code];
                        const customVal = editingProduct.customGccPrices?.[code] !== undefined
                          ? editingProduct.customGccPrices[code]
                          : Number((editingProduct.basePriceSAR * country.rateToSAR).toFixed(2));
                        return (
                          <div key={code} className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] text-slate-500 font-bold block mb-1">
                              {country.flag} {language === 'ar' ? country.nameAr : country.nameEn}
                            </span>
                            <div className="relative">
                              <input
                                type="number"
                                step="0.01"
                                value={customVal}
                                onChange={(e) => {
                                  const newVal = Number(e.target.value);
                                  const prices = { ...(editingProduct.customGccPrices || {}) };
                                  prices[code] = newVal;
                                  setEditingProduct({
                                    ...editingProduct,
                                    customGccPrices: prices
                                  });
                                }}
                                className="w-full text-[11px] p-2 rounded-lg border border-slate-300 font-mono font-bold"
                              />
                              <span className="absolute end-1.5 bottom-1.5 text-[9px] text-slate-400 font-bold">
                                {country.currencyEn}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* 1. If Contact Lenses: render SPH, Cyl, and Pack Sizes list */}
                  {(editingProduct.category === 'contact-lenses' || editingProduct.categoryAr?.includes('عدسات')) && (
                    <div className="p-4 rounded-2xl bg-amber-50/20 border border-amber-200/40 space-y-4">
                      <strong className="text-xs font-bold text-[#8C6D3F] block">📦 خيارات ومقاسات علب العدسات اللاصقة والأسعار الإضافية:</strong>
                      
                      {/* SPH & Astigmatism toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-slate-200">
                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.hasPowerOption !== false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, hasPowerOption: e.target.checked })}
                              className="w-4 h-4 rounded text-[#A58454]"
                            />
                            <span>دعم قوة قياس النظر (Sphere SPH)</span>
                          </label>
                          {editingProduct.hasPowerOption !== false && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400">فارق السعر للعدسة الطبية مقارنة بالزينة (+SAR):</span>
                                <input
                                  type="number"
                                  value={editingProduct.powerPriceAddonSAR || 0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updatedGcc: Partial<Record<CountryCode, number>> = {};
                                    Object.keys(GCC_COUNTRIES).forEach((key) => {
                                      const code = key as CountryCode;
                                      if (code !== 'SA') {
                                        const rate = GCC_COUNTRIES[code].rateToSAR;
                                        updatedGcc[code] = Number((val * rate).toFixed(2));
                                      }
                                    });
                                    setEditingProduct({
                                      ...editingProduct,
                                      powerPriceAddonSAR: val,
                                      customPowerPriceAddonGccPrices: {
                                        ...(editingProduct.customPowerPriceAddonGccPrices || {}),
                                        ...updatedGcc
                                      }
                                    });
                                  }}
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                                />
                              </div>
                              
                              {/* Power custom GCC addons grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1.5 border-t border-slate-100 bg-slate-50/50 p-2 rounded-xl">
                                {Object.keys(GCC_COUNTRIES).map((key) => {
                                  const code = key as CountryCode;
                                  if (code === 'SA') return null;
                                  const country = GCC_COUNTRIES[code];
                                  const addonVal = editingProduct.customPowerPriceAddonGccPrices?.[code] !== undefined
                                    ? editingProduct.customPowerPriceAddonGccPrices[code]
                                    : Number(((editingProduct.powerPriceAddonSAR || 0) * country.rateToSAR).toFixed(2));
                                  return (
                                    <div key={code} className="text-[10px]">
                                      <span className="text-slate-500 block mb-0.5 font-semibold">{country.flag} {country.currencyEn}</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={addonVal}
                                        onChange={(e) => {
                                          const newVal = Number(e.target.value);
                                          const prices = { ...(editingProduct.customPowerPriceAddonGccPrices || {}) };
                                          prices[code] = newVal;
                                          setEditingProduct({
                                            ...editingProduct,
                                            customPowerPriceAddonGccPrices: prices
                                          });
                                        }}
                                        className="w-full text-[10px] p-1 rounded border border-slate-200 font-mono font-bold text-center"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editingProduct.hasAstigmatismOption || false}
                              onChange={(e) => setEditingProduct({ ...editingProduct, hasAstigmatismOption: e.target.checked })}
                              className="w-4 h-4 rounded text-[#A58454]"
                            />
                            <span>دعم الاستجماتيزم والانحراف (Toric CYL/AXIS)</span>
                          </label>
                          {editingProduct.hasAstigmatismOption && (
                            <div className="space-y-2">
                              <div className="space-y-1">
                                <span className="text-[10px] text-slate-400">فارق سعر عدسات توريك المخصصة (+SAR):</span>
                                <input
                                  type="number"
                                  value={editingProduct.astigmatismPriceAddonSAR || 0}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    const updatedGcc: Partial<Record<CountryCode, number>> = {};
                                    Object.keys(GCC_COUNTRIES).forEach((key) => {
                                      const code = key as CountryCode;
                                      if (code !== 'SA') {
                                        const rate = GCC_COUNTRIES[code].rateToSAR;
                                        updatedGcc[code] = Number((val * rate).toFixed(2));
                                      }
                                    });
                                    setEditingProduct({
                                      ...editingProduct,
                                      astigmatismPriceAddonSAR: val,
                                      customAstigmatismPriceAddonGccPrices: {
                                        ...(editingProduct.customAstigmatismPriceAddonGccPrices || {}),
                                        ...updatedGcc
                                      }
                                    });
                                  }}
                                  className="w-full text-xs p-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                                />
                              </div>
                              
                              {/* Astigmatism custom GCC addons grid */}
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1.5 border-t border-slate-100 bg-slate-50/50 p-2 rounded-xl">
                                {Object.keys(GCC_COUNTRIES).map((key) => {
                                  const code = key as CountryCode;
                                  if (code === 'SA') return null;
                                  const country = GCC_COUNTRIES[code];
                                  const addonVal = editingProduct.customAstigmatismPriceAddonGccPrices?.[code] !== undefined
                                    ? editingProduct.customAstigmatismPriceAddonGccPrices[code]
                                    : Number(((editingProduct.astigmatismPriceAddonSAR || 0) * country.rateToSAR).toFixed(2));
                                  return (
                                    <div key={code} className="text-[10px]">
                                      <span className="text-slate-500 block mb-0.5 font-semibold">{country.flag} {country.currencyEn}</span>
                                      <input
                                        type="number"
                                        step="0.01"
                                        value={addonVal}
                                        onChange={(e) => {
                                          const newVal = Number(e.target.value);
                                          const prices = { ...(editingProduct.customAstigmatismPriceAddonGccPrices || {}) };
                                          prices[code] = newVal;
                                          setEditingProduct({
                                            ...editingProduct,
                                            customAstigmatismPriceAddonGccPrices: prices
                                          });
                                        }}
                                        className="w-full text-[10px] p-1 rounded border border-slate-200 font-mono font-bold text-center"
                                      />
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Writable Pack Sizes Sub-list */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">أحجام وعبوات البيع للعدسات (Pack Sizes):</span>
                          <button
                            type="button"
                            onClick={handleAddPackSizeToEditing}
                            className="text-[10px] text-[#A58454] hover:underline font-bold"
                          >
                            + إضافة حجم عبوة إضافي
                          </button>
                        </div>

                        {(editingProduct.packSizes || DEFAULT_PACK_SIZES).map((pk, pkIdx) => (
                          <div key={pk.id || pkIdx} className="flex flex-col gap-2 p-3 rounded-xl bg-white border border-slate-200 text-xs shadow-3xs">
                            <div className="flex flex-wrap items-center gap-2.5">
                              <div className="flex-1 min-w-32">
                                <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">الاسم بالعربي</span>
                                <input
                                  type="text"
                                  required
                                  value={pk.labelAr}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.packSizes || DEFAULT_PACK_SIZES)];
                                    updated[pkIdx].labelAr = e.target.value;
                                    setEditingProduct({ ...editingProduct, packSizes: updated });
                                  }}
                                  className="w-full text-xs p-1.5 rounded border border-slate-200 font-semibold"
                                />
                              </div>
                              <div className="flex-1 min-w-32 font-mono">
                                <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">English Label</span>
                                <input
                                  type="text"
                                  required
                                  value={pk.labelEn}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.packSizes || DEFAULT_PACK_SIZES)];
                                    updated[pkIdx].labelEn = e.target.value;
                                    setEditingProduct({ ...editingProduct, packSizes: updated });
                                  }}
                                  className="w-full text-xs p-1.5 rounded border border-slate-200"
                                />
                              </div>
                              <div className="w-16">
                                <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">العدد بالعلبة</span>
                                <input
                                  type="number"
                                  required
                                  value={pk.count}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.packSizes || DEFAULT_PACK_SIZES)];
                                    updated[pkIdx].count = Number(e.target.value);
                                    setEditingProduct({ ...editingProduct, packSizes: updated });
                                  }}
                                  className="w-full text-xs p-1.5 rounded border border-slate-200 text-center font-mono font-bold"
                                />
                              </div>
                              <div className="w-20">
                                <span className="text-[9px] text-slate-400 block mb-0.5 font-bold">السعر بالريال</span>
                                <input
                                  type="number"
                                  required
                                  value={pk.priceSAR}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.packSizes || DEFAULT_PACK_SIZES)];
                                    const val = Number(e.target.value);
                                    updated[pkIdx].priceSAR = val;
                                    
                                    // Auto-populate other GCC currencies
                                    const updatedGcc: Partial<Record<CountryCode, number>> = { ...(updated[pkIdx].customGccPrices || {}) };
                                    Object.keys(GCC_COUNTRIES).forEach((key) => {
                                      const code = key as CountryCode;
                                      if (code !== 'SA') {
                                        const rate = GCC_COUNTRIES[code].rateToSAR;
                                        updatedGcc[code] = Number((val * rate).toFixed(2));
                                      }
                                    });
                                    updated[pkIdx].customGccPrices = updatedGcc;
                                    
                                    setEditingProduct({ ...editingProduct, packSizes: updated });
                                  }}
                                  className="w-full text-xs p-1.5 rounded border border-slate-200 text-center font-mono font-bold text-slate-800"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = (editingProduct.packSizes || DEFAULT_PACK_SIZES).filter((_, i) => i !== pkIdx);
                                  setEditingProduct({ ...editingProduct, packSizes: updated });
                                }}
                                disabled={(editingProduct.packSizes || DEFAULT_PACK_SIZES).length <= 1}
                                className="p-1.5 text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Custom GCC Prices for Pack Sizes Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1.5 border-t border-slate-100 bg-slate-50 p-2 rounded-lg">
                              {Object.keys(GCC_COUNTRIES).map((key) => {
                                const code = key as CountryCode;
                                if (code === 'SA') return null;
                                const country = GCC_COUNTRIES[code];
                                const customVal = pk.customGccPrices?.[code] !== undefined
                                  ? pk.customGccPrices[code]
                                  : Number((pk.priceSAR * country.rateToSAR).toFixed(2));
                                return (
                                  <div key={code} className="text-[10px]">
                                    <span className="text-slate-500 block mb-0.5 font-semibold">
                                      {country.flag} {country.currencyEn}
                                    </span>
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={customVal}
                                      onChange={(e) => {
                                        const newVal = Number(e.target.value);
                                        const updated = [...(editingProduct.packSizes || DEFAULT_PACK_SIZES)];
                                        const prices = { ...(updated[pkIdx].customGccPrices || {}) };
                                        prices[code] = newVal;
                                        updated[pkIdx].customGccPrices = prices;
                                        setEditingProduct({ ...editingProduct, packSizes: updated });
                                      }}
                                      className="w-full text-[10px] p-1 rounded border border-slate-200 font-mono font-bold text-center"
                                    />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DYNAMIC SPECIFICATIONS SUB-FORM */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong className="text-xs font-bold text-slate-800 block">🔧 المواصفات الفنية والخصائص الديناميكية المخصصة:</strong>
                        <span className="text-[10px] text-slate-500 block">أضف خصائص غير محدودة للمنتج لتظهر بذكاء في تبويب التفاصيل بصفحة المنتج.</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updatedSpecs = [...(editingProduct.dynamicSpecs || [])];
                          updatedSpecs.push({
                            nameAr: 'مادة الصنع',
                            nameEn: 'Material',
                            valueAr: 'TR90 بوليمر مرن',
                            valueEn: 'TR90 Flexible Polymer'
                          });
                          setEditingProduct({
                            ...editingProduct,
                            dynamicSpecs: updatedSpecs
                          });
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold transition-all shadow-xs"
                      >
                        + إضافة مواصفة جديدة
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(!editingProduct.dynamicSpecs || editingProduct.dynamicSpecs.length === 0) ? (
                        <div className="p-4 text-center text-[11px] text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                          لا توجد مواصفات ديناميكية مضافة حالياً. سيتم عرض المواصفات الافتراضية للقسم فقط.
                        </div>
                      ) : (
                        editingProduct.dynamicSpecs.map((spec, specIdx) => (
                          <div key={specIdx} className="p-3 bg-white rounded-xl border border-slate-200 space-y-2.5 shadow-3xs">
                            <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                              <span className="text-[10px] text-[#A58454] font-bold font-mono">Specification #{specIdx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  const updatedSpecs = editingProduct.dynamicSpecs!.filter((_, i) => i !== specIdx);
                                  setEditingProduct({
                                    ...editingProduct,
                                    dynamicSpecs: updatedSpecs
                                  });
                                }}
                                className="p-1 text-slate-400 hover:text-rose-500"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {/* Spec Name Writable Combobox */}
                              <WritableCombobox
                                labelAr="اسم الخاصية"
                                labelEn="Property Name"
                                suggestions={dynamicSpecSuggestions}
                                valueAr={spec.nameAr || ''}
                                valueEn={spec.nameEn || ''}
                                onDeleteOption={handleDeleteDynamicSpecOption}
                                onChangeAr={(valAr) => {
                                  const matched = dynamicSpecSuggestions.find(s => s.ar === valAr);
                                  const updatedSpecs = [...editingProduct.dynamicSpecs!];
                                  updatedSpecs[specIdx].nameAr = valAr;
                                  if (matched) updatedSpecs[specIdx].nameEn = matched.en;
                                  setEditingProduct({ ...editingProduct, dynamicSpecs: updatedSpecs });
                                }}
                                onChangeEn={(valEn) => {
                                  const matched = dynamicSpecSuggestions.find(s => s.en.toLowerCase() === valEn.toLowerCase());
                                  const updatedSpecs = [...editingProduct.dynamicSpecs!];
                                  updatedSpecs[specIdx].nameEn = valEn;
                                  if (matched) updatedSpecs[specIdx].nameAr = matched.ar;
                                  setEditingProduct({ ...editingProduct, dynamicSpecs: updatedSpecs });
                                }}
                              />

                              {/* Spec Value */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block mb-0.5">القيمة بالعربي</span>
                                  <input
                                    type="text"
                                    required
                                    value={spec.valueAr || ''}
                                    onChange={(e) => {
                                      const updatedSpecs = [...editingProduct.dynamicSpecs!];
                                      updatedSpecs[specIdx].valueAr = e.target.value;
                                      setEditingProduct({ ...editingProduct, dynamicSpecs: updatedSpecs });
                                    }}
                                    placeholder="مثلاً: 14.2 ملم"
                                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-semibold"
                                  />
                                </div>
                                <div>
                                  <span className="text-[9px] text-slate-400 font-bold block mb-0.5">English Value</span>
                                  <input
                                    type="text"
                                    required
                                    value={spec.valueEn || ''}
                                    onChange={(e) => {
                                      const updatedSpecs = [...editingProduct.dynamicSpecs!];
                                      updatedSpecs[specIdx].valueEn = e.target.value;
                                      setEditingProduct({ ...editingProduct, dynamicSpecs: updatedSpecs });
                                    }}
                                    placeholder="e.g. 14.2 mm"
                                    className="w-full text-xs p-2 rounded-lg border border-slate-300 font-mono text-slate-600"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: SEO & SCHEMA.ORG */}
              {wizardStep === 6 && (
                <div className="space-y-4 font-kufi">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 text-slate-800 space-y-1">
                    <strong className="text-xs font-bold block text-slate-900">
                      الخطوة السادسة والأخيرة: تهيئة محركات البحث (SEO) وبنية السكيما
                    </strong>
                    <p className="text-[11px] text-slate-500">
                      قم بإنشاء العناوين والوصف المخصصين لتظهر بشكل جذاب ومنظم على نتائج محركات البحث Google.
                    </p>
                  </div>

                  {/* Auto-generate helper trigger */}
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60">
                    <div className="max-w-md">
                      <strong className="text-xs font-bold text-slate-900 block font-kufi">
                        توليد تلقائي فوري لبيانات الـ SEO والسكيما؟
                      </strong>
                      <span className="text-[10px] text-slate-600 block">
                        سيقوم النظام بنسخ أسماء ومواصفات المنتج وتوليد عناوين ووصف ورابط متوافق مع خوارزميات جوجل.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleApplyAutoSeo}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>توليد تلقائي الآن</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        الرابط الدائم لصفحة المنتج (Slug / URL) *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingProduct.slug || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        عنوان الميتا بالعربي (Meta Title)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.seoTitleAr || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, seoTitleAr: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Meta Title (English)
                      </label>
                      <input
                        type="text"
                        value={editingProduct.seoTitleEn || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, seoTitleEn: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        وصف الميتا بالعربي (Meta Description)
                      </label>
                      <textarea
                        rows={3}
                        value={editingProduct.seoDescAr || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, seoDescAr: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-semibold leading-relaxed"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Meta Description (English)
                      </label>
                      <textarea
                        rows={3}
                        value={editingProduct.seoDescEn || ''}
                        onChange={(e) => setEditingProduct({ ...editingProduct, seoDescEn: e.target.value })}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Schema.org Interactive Code Visual Block */}
                  <div className="pt-3 border-t border-slate-200">
                    <span className="text-xs font-bold text-slate-800 block mb-1">📝 كود السكيما المدمج تلقائياً (Schema.org JSON-LD):</span>
                    <p className="text-[10px] text-slate-500 mb-2">تُزرع هذه السكيما في خلفية كود الصفحة ليقرأها محرك بحث Google فوراً ويفهم سعر المنتج وتوفره ومواصفاته.</p>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[9px] text-emerald-400 overflow-x-auto max-h-36 custom-scrollbar whitespace-pre-wrap">
                      {JSON.stringify(buildProductSchemaJson(editingProduct, GCC_COUNTRIES.SA), null, 2)}
                    </div>
                  </div>
                </div>
              )}

              {/* Submit / Cancel Footer with Wizard Navigation */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {t('إلغاء الخروج', 'Cancel')}
                </button>

                <div className="flex items-center gap-2">
                  {wizardStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep - 1)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      {t('السابق', 'Back')}
                    </button>
                  )}

                  {wizardStep < 6 ? (
                    <button
                      type="button"
                      onClick={() => setWizardStep(wizardStep + 1)}
                      className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      {t('التالي', 'Next')}
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 text-[#C5A880]" />
                      <span>{t('حفظ بيانات المنتج والكتالوج', 'Save Product & Specs')}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
