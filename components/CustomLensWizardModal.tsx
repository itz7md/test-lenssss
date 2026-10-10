'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CustomLensConfig, ProductColorVariant } from '@/types';
import {
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Shield,
  Sun,
  Eye,
  Sparkles,
  Layers,
  FileText,
  HelpCircle,
} from 'lucide-react';
import Image from 'next/image';
import { Price } from './Price';
import { getBrandName } from '@/lib/brands';

interface UsageOption {
  id: CustomLensConfig['usage'];
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
}

const USAGE_OPTIONS: UsageOption[] = [
  {
    id: 'distance',
    titleAr: 'مسافات واستخدام يومي',
    titleEn: 'Distance & Daily Vision',
    descAr: 'لرؤية واضحة ونقية أثناء القيادة والأنشطة اليومية المفتوحة',
    descEn: 'For crystal-clear vision while driving and everyday activities',
  },
  {
    id: 'reading',
    titleAr: 'قراءة ومسافات قريبة',
    titleEn: 'Reading & Close-up Work',
    descAr: 'مخصصة للتركيز المريح على الهواتف، الحواسيب، والكتب',
    descEn: 'Optimized for effortless focus on phones, laptops, and documents',
  },
  {
    id: 'plano-blueblock',
    titleAr: 'حماية شاشات بدون مقاس (زيرو)',
    titleEn: 'Zero-Power Screen Shield',
    descAr: 'عدسات بدون درجة طبية مع فلتر متطور لحماية العين من الشاشات',
    descEn: 'Plano lenses with advanced anti-fatigue blue light filtration',
  },
  {
    id: 'progressive',
    titleAr: 'عدسات متعددة البؤر (Progressive)',
    titleEn: 'Progressive Multifocal',
    descAr: 'رؤية متدرجة وسلسة للقريب والمتوسط والبعيد دون خط فاصل',
    descEn: 'Seamless smooth transition for near, intermediate, and distance',
  },
];

interface IndexOption {
  id: CustomLensConfig['lensIndex'];
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  badgeAr?: string;
  badgeEn?: string;
}

const INDEX_OPTIONS: IndexOption[] = [
  {
    id: '1.56',
    nameAr: 'عدسات قياسية (1.56 Standard)',
    nameEn: 'Standard Clear (Index 1.56)',
    descAr: 'عدسات متينة عالية النقاوة، مناسبة للدرجات الخفيفة حتى -2.50',
    descEn: 'Durable clarity, ideal for mild prescriptions up to -2.50',
    price: 0,
    badgeAr: 'مشمولة مجاناً',
    badgeEn: 'Included Free',
  },
  {
    id: '1.61',
    nameAr: 'عدسات رقيقة ومقاومة للكسر (1.61 Thin)',
    nameEn: 'Thin & Impact Resistant (Index 1.61)',
    descAr: 'أنحف بنسبة 25% من القياسية، ممتازة للإطارات والدرجات حتى -4.00',
    descEn: '25% thinner, high impact resistance for prescriptions up to -4.00',
    price: 95,
    badgeAr: 'الأكثر طلباً ⭐',
    badgeEn: 'Most Popular ⭐',
  },
  {
    id: '1.67',
    nameAr: 'عدسات فائقة النحافة (1.67 Ultra-Thin)',
    nameEn: 'Ultra-Thin Featherlight (Index 1.67)',
    descAr: 'أنحف بنسبة 40%، جمالية فائقة تمنع تشوه العين للدرجات حتى -7.00',
    descEn: '40% thinner profile, eliminates distortion up to -7.00',
    price: 180,
  },
  {
    id: '1.74',
    nameAr: 'عدسات فائقة الرقة للدرجات العالية (1.74 Extreme)',
    nameEn: 'Extreme High-Power (Index 1.74)',
    descAr: 'أعلى معامل انكسار ورقة، خفيفة جداً للدرجات من -7.00 فما فوق',
    descEn: 'Max optical index, ultra-flat profile for high corrections > -7.00',
    price: 320,
  },
];

interface CoatingOption {
  id: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  descEn: string;
  price: number;
  icon: any;
  badgeAr?: string;
  badgeEn?: string;
}

const COATING_OPTIONS: CoatingOption[] = [
  {
    id: 'blue-block',
    nameAr: 'حماية الضوء الأزرق للشاشات (Blue Block)',
    nameEn: 'Blue-Block Digital Filter',
    descAr: 'فلترة الأشعة الرقمية الضارة للحد من إجهاد العين والصداع',
    descEn: 'Filters harmful screen rays to reduce digital fatigue and headaches',
    price: 0,
    icon: Shield,
    badgeAr: 'موصى به',
    badgeEn: 'Recommended',
  },
  {
    id: 'anti-glare',
    nameAr: 'طبقة مقاومة للخدوش والانعكاس (Anti-Glare)',
    nameEn: 'Anti-Scratch & Anti-Glare Coating',
    descAr: 'طلاء نانوي مزدوج يمنع الوهج أثناء القيادة ويزيد صلابة العدسة',
    descEn: 'Double nano-coating eliminating reflections and driving glare',
    price: 0,
    icon: Sparkles,
    badgeAr: 'مشمول',
    badgeEn: 'Included',
  },
  {
    id: 'transitions',
    nameAr: 'عدسات فوتوكروميك تتحول مع الشمس (Transitions)',
    nameEn: 'Photochromic Sun-Adaptive (Transitions)',
    descAr: 'تتحول تلقائياً إلى نظارة شمسية في الخارج وتعود شفافة في الأماكن المغلقة',
    descEn: 'Adapts dynamically to sunlight outdoors and stays clear indoors',
    price: 140,
    icon: Sun,
  },
  {
    id: 'sun-tint',
    nameAr: 'طبقة تلوين شمسية مخصصة (Custom Sun Tint)',
    nameEn: 'Custom Permanent Sun Tint',
    descAr: 'تلوين العدسات الطبية بدرجة شمسية ثابتة وراقية مع حماية UV كاملة',
    descEn: 'Permanent fashion tint with 100% UV400 sun protection',
    price: 90,
    icon: Eye,
  },
];

export const CustomLensWizardModal: React.FC = () => {
  const {
    isLensWizardOpen,
    setIsLensWizardOpen,
    lensWizardProduct,
    language,
    t,
    addToCart,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Usage
  const [usage, setUsage] = useState<CustomLensConfig['usage']>('distance');

  // Step 2: Prescription Mode & Values
  const [prescriptionType, setPrescriptionType] = useState<'manual' | 'upload' | 'none'>('manual');
  const [prescriptionFile, setPrescriptionFile] = useState<string | null>(null);
  const [rightSph, setRightSph] = useState<string>('-1.50');
  const [rightCyl, setRightCyl] = useState<string>('-0.50');
  const [rightAxis, setRightAxis] = useState<string>('180');
  const [leftSph, setLeftSph] = useState<string>('-1.25');
  const [leftCyl, setLeftCyl] = useState<string>('-0.25');
  const [leftAxis, setLeftAxis] = useState<string>('175');
  const [pd, setPd] = useState<string>('63');

  // Step 3: Lens Index
  const [lensIndex, setLensIndex] = useState<CustomLensConfig['lensIndex']>('1.61');

  // Step 4: Coatings (store IDs)
  const [selectedCoatings, setSelectedCoatings] = useState<string[]>([
    'blue-block',
    'anti-glare',
  ]);

  // Lock body vertical scroll when modal is open
  useEffect(() => {
    if (isLensWizardOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isLensWizardOpen]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isLensWizardOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLensWizardOpen(false);
        setStep(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLensWizardOpen, setIsLensWizardOpen]);

  if (!isLensWizardOpen || !lensWizardProduct) return null;

  // Pricing calculation
  const getIndexPrice = (idx: CustomLensConfig['lensIndex']) => {
    switch (idx) {
      case '1.56':
        return 0; // Standard Free with frame
      case '1.61':
        return 95; // Thin & impact resistant
      case '1.67':
        return 180; // Ultra-thin
      case '1.74':
        return 320; // Extreme thin for high powers
      default:
        return 0;
    }
  };

  const getCoatingsPrice = () => {
    let cost = 0;
    if (selectedCoatings.includes('transitions')) cost += 140;
    if (selectedCoatings.includes('sun-tint')) cost += 90;
    return cost;
  };

  const lensTotalPriceSAR = getIndexPrice(lensIndex) + getCoatingsPrice();
  const grandTotalSAR = lensWizardProduct.basePriceSAR + lensTotalPriceSAR;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const fakeUrl = URL.createObjectURL(file);
      setPrescriptionFile(fakeUrl);
    }
  };

  const toggleCoating = (id: string) => {
    setSelectedCoatings((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleConfirm = () => {
    // Generate localized coating labels for cart details
    const coatingNames = selectedCoatings.map((cid) => {
      const opt = COATING_OPTIONS.find((c) => c.id === cid);
      return opt ? (language === 'ar' ? opt.nameAr : opt.nameEn) : cid;
    });

    const config: CustomLensConfig = {
      usage,
      prescriptionType,
      prescriptionFile: prescriptionFile || undefined,
      rightEye:
        prescriptionType === 'manual'
          ? { sph: rightSph, cyl: rightCyl, axis: rightAxis }
          : undefined,
      leftEye:
        prescriptionType === 'manual'
          ? { sph: leftSph, cyl: leftCyl, axis: leftAxis }
          : undefined,
      pd: prescriptionType === 'manual' ? pd : undefined,
      lensIndex,
      coatings: coatingNames,
      lensPriceSAR: lensTotalPriceSAR,
    };

    const targetColor: ProductColorVariant =
      lensWizardProduct.colors && lensWizardProduct.colors.length > 0
        ? lensWizardProduct.colors[0]
        : {
            id: 'c1',
            nameAr: 'افتراضي',
            nameEn: 'Default',
            hex: '#000000',
            image: '/images/prod_acetate.webp',
            stock: 10,
          };

    addToCart(lensWizardProduct, targetColor, config, 1);
    setIsLensWizardOpen(false);
    setStep(1);
  };

  const handleClose = () => {
    setIsLensWizardOpen(false);
    setStep(1);
  };

  const productName = language === 'ar' ? lensWizardProduct.nameAr : lensWizardProduct.nameEn;
  const brandName = getBrandName(lensWizardProduct.brand, language);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-xl sm:max-w-2xl bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 flex flex-col max-h-[92vh] sm:max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3.5 sm:px-6 sm:py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#A58454]/20 border border-[#A58454]/40 flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold font-kufi truncate">
                {t('معالج تفصيل واختيار العدسات الطبية', 'Custom Optical Lens Wizard')}
              </h2>
              <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
                {productName} · {t('خطوة', 'Step')} {step} {t('من', 'of')} 5
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close"
            className="p-1.5 sm:p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer shrink-0 ms-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1 sm:h-1.5 flex shrink-0">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`h-full flex-1 transition-all duration-300 ${
                i <= step ? 'bg-gradient-to-r from-[#C5A880] to-[#A58454]' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Step Body */}
        <div className="p-4 sm:p-6 overflow-y-auto overscroll-contain flex-1 custom-scrollbar">
          {/* STEP 1: USAGE */}
          {step === 1 && (
            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kufi mb-1">
                  {t('الخطوة 1: حدد نوع استخدام النظارة', 'Step 1: Choose Your Lens Usage')}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {t(
                    'اختر الغرض الأساسي للعدسات لنقوم بتحسين البعد البؤري المناسب لك',
                    'Select the primary purpose so we calibrate focal geometry perfectly'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1">
                {USAGE_OPTIONS.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setUsage(item.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      usage === item.id
                        ? 'border-[#A58454] bg-amber-50/60 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                        {language === 'ar' ? item.titleAr : item.titleEn}
                      </h4>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ms-2 ${
                          usage === item.id ? 'bg-[#A58454] text-white' : 'border border-slate-300'
                        }`}
                      >
                        {usage === item.id && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                      {language === 'ar' ? item.descAr : item.descEn}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: PRESCRIPTION INPUT */}
          {step === 2 && (
            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kufi mb-1">
                  {t('الخطوة 2: إدخال مقاس النظر', 'Step 2: Enter Your Vision Prescription')}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {t(
                    'يمكنك رفع صورة الوصفة الطبية الصادرة من الطبيب أو إدخال القياسات يدوياً',
                    'Upload your doctor prescription photo or enter optical parameters manually'
                  )}
                </p>
              </div>

              {/* Mode Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setPrescriptionType('manual')}
                  className={`flex-1 py-2 sm:py-2.5 rounded-lg transition-colors cursor-pointer text-center text-xs ${
                    prescriptionType === 'manual'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('إدخال يدوي (SPH / CYL / AXIS)', 'Manual Entry (SPH / CYL / AXIS)')}
                </button>
                <button
                  type="button"
                  onClick={() => setPrescriptionType('upload')}
                  className={`flex-1 py-2 sm:py-2.5 rounded-lg transition-colors cursor-pointer text-center text-xs ${
                    prescriptionType === 'upload'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t('رفع صورة الوصفة الطبية 📄', 'Upload Prescription Photo 📄')}
                </button>
              </div>

              {prescriptionType === 'upload' ? (
                <div className="border-2 border-dashed border-slate-300 hover:border-[#A58454] rounded-2xl p-5 sm:p-8 text-center bg-slate-50/80 transition-colors">
                  <input
                    type="file"
                    id="rx-upload"
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label htmlFor="rx-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 rounded-full bg-amber-50 text-[#A58454] flex items-center justify-center mb-2.5">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
                      {prescriptionFile
                        ? t('تم إرفاق الوصفة بنجاح! انقر للتغيير', 'Prescription Attached! Click to change')
                        : t('انقر لرفع صورة فحص النظر أو اسحبها هنا', 'Click to upload doctor prescription or drag & drop')}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {t('JPG, PNG, PDF (أقصى حجم 10MB)', 'JPG, PNG, PDF (Max 10MB)')}
                    </span>
                  </label>
                  {prescriptionFile && (
                    <div className="mt-3 relative w-32 h-20 mx-auto rounded-lg overflow-hidden border border-slate-200 shadow-xs">
                      <Image
                        src={prescriptionFile}
                        alt="Prescription preview"
                        fill
                        sizes="128px"
                        referrerPolicy="no-referrer"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5 bg-slate-50/90 p-3.5 sm:p-4 rounded-2xl border border-slate-200/70">
                  {/* Right Eye OD */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">
                      {t('العين اليمنى (OD - Right Eye):', 'Right Eye (OD):')}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {t('SPH (الدرجة)', 'SPH (Sphere)')}
                        </label>
                        <input
                          type="text"
                          value={rightSph}
                          onChange={(e) => setRightSph(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                          placeholder="-1.50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {t('CYL (الانحراف)', 'CYL (Cylinder)')}
                        </label>
                        <input
                          type="text"
                          value={rightCyl}
                          onChange={(e) => setRightCyl(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                          placeholder="-0.50"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {t('AXIS (المحور)', 'AXIS (Axis)')}
                        </label>
                        <input
                          type="text"
                          value={rightAxis}
                          onChange={(e) => setRightAxis(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                          placeholder="180"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Left Eye OS */}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block mb-1.5">
                      {t('العين اليسرى (OS - Left Eye):', 'Left Eye (OS):')}
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {t('SPH (الدرجة)', 'SPH (Sphere)')}
                        </label>
                        <input
                          type="text"
                          value={leftSph}
                          onChange={(e) => setLeftSph(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                          placeholder="-1.25"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {t('CYL (الانحراف)', 'CYL (Cylinder)')}
                        </label>
                        <input
                          type="text"
                          value={leftCyl}
                          onChange={(e) => setLeftCyl(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                          placeholder="-0.25"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500 font-semibold block mb-1">
                          {t('AXIS (المحور)', 'AXIS (Axis)')}
                        </label>
                        <input
                          type="text"
                          value={leftAxis}
                          onChange={(e) => setLeftAxis(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                          placeholder="175"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pupillary Distance */}
                  <div>
                    <label className="text-[11px] font-bold text-slate-800 block mb-1">
                      {t('مسافة بؤبؤ العينين (PD mm):', 'Pupillary Distance (PD mm):')}
                    </label>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={pd}
                        onChange={(e) => setPd(e.target.value)}
                        className="w-28 text-xs p-2 rounded-lg border border-slate-200 bg-white font-mono text-center focus:border-[#A58454] focus:outline-hidden"
                        placeholder="63"
                      />
                      <span className="text-[10px] text-slate-400 ms-2">
                        {t('متوسط القياس 62-64 ملم', 'Typically 62–64 mm')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: LENS INDEX & THICKNESS */}
          {step === 3 && (
            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kufi mb-1">
                  {t('الخطوة 3: باقة وسماكة العدسة (معامل الانكسار)', 'Step 3: Lens Index & Thickness')}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {t(
                    'كلما زاد معامل الانكسار كانت العدسة أنحف وأخف وزناً ومناسبة للدرجات العالية',
                    'Higher index numbers mean thinner, lighter lenses with superior edge aesthetics'
                  )}
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3 pt-1">
                {INDEX_OPTIONS.map((item) => {
                  const isSelected = lensIndex === item.id;
                  const badgeText = language === 'ar' ? item.badgeAr : item.badgeEn;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setLensIndex(item.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-2.5 sm:gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#A58454] bg-amber-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                            {language === 'ar' ? item.nameAr : item.nameEn}
                          </h4>
                          {badgeText && (
                            <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100/90 text-[#8C6D3F] whitespace-nowrap shrink-0">
                              {badgeText}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                          {language === 'ar' ? item.descAr : item.descEn}
                        </p>
                      </div>

                      <div className="text-end shrink-0 ps-1 flex flex-col items-end justify-center">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                          {item.price === 0 ? (
                            <span className="text-emerald-700 font-bold">{t('مجاناً', 'Free')}</span>
                          ) : (
                            <Price amountSAR={item.price} size="xs" prefix="+" />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: COATINGS & PROTECTIONS */}
          {step === 4 && (
            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kufi mb-1">
                  {t('الخطوة 4: حماية وإضافات العدسة', 'Step 4: Lens Treatments & Upgrades')}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {t(
                    'طبقات متقدمة تحمي عينيك من الإجهاد الرقمي وأشعة الشمس والخدوش',
                    'Advanced multi-coatings protecting your eyes against screen strain, UV, and scratches'
                  )}
                </p>
              </div>

              <div className="space-y-2.5 sm:space-y-3 pt-1">
                {COATING_OPTIONS.map((item) => {
                  const isChecked = selectedCoatings.includes(item.id);
                  const Icon = item.icon;
                  const badgeText = language === 'ar' ? item.badgeAr : item.badgeEn;
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCoating(item.id)}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-2.5 sm:gap-3 transition-all cursor-pointer ${
                        isChecked
                          ? 'border-[#A58454] bg-amber-50/60 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                            isChecked ? 'bg-[#A58454] text-white shadow-xs' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                              {language === 'ar' ? item.nameAr : item.nameEn}
                            </h4>
                            {badgeText && (
                              <span className="inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap shrink-0">
                                {badgeText}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] sm:text-xs text-slate-500 leading-relaxed">
                            {language === 'ar' ? item.descAr : item.descEn}
                          </p>
                        </div>
                      </div>

                      <div className="text-end shrink-0 ps-1 flex flex-col items-end justify-center">
                        <span className="text-xs sm:text-sm font-bold text-slate-900 whitespace-nowrap">
                          {item.price === 0 ? (
                            <span className="text-emerald-700 font-bold">{t('مجاناً', 'Free')}</span>
                          ) : (
                            <Price amountSAR={item.price} size="xs" prefix="+" />
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: SUMMARY & BREAKDOWN */}
          {step === 5 && (
            <div className="space-y-3.5 sm:space-y-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 font-kufi mb-1">
                  {t('الخطوة 5: ملخص وتأكيد الطلب', 'Step 5: Summary & Confirmation')}
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-500">
                  {t(
                    'راجع تفاصيل العدسات والإطار المختار قبل الإضافة إلى سلة المشتريات',
                    'Review your customized lenses and frame selection before adding to shopping bag'
                  )}
                </p>
              </div>

              <div className="bg-slate-50/90 rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 space-y-3.5">
                {/* Frame Info */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 gap-3">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <div className="relative w-11 h-11 sm:w-12 sm:h-12 bg-white rounded-lg p-1 border border-slate-200 shrink-0">
                      <Image
                        src={lensWizardProduct.colors[0]?.image || '/images/prod_acetate.webp'}
                        alt={productName}
                        fill
                        sizes="48px"
                        referrerPolicy="no-referrer"
                        className="object-contain"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                        {productName}
                      </h4>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {brandName} {lensWizardProduct.subCategory ? `· ${lensWizardProduct.subCategory}` : ''}
                      </span>
                    </div>
                  </div>
                  <Price amountSAR={lensWizardProduct.basePriceSAR} size="sm" />
                </div>

                {/* Customization Details List */}
                <div className="space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between items-center">
                    <span>{t('نوع الاستخدام:', 'Usage:')}</span>
                    <strong className="text-slate-800 text-end">
                      {usage === 'distance'
                        ? t('مسافات واستخدام يومي', 'Distance & Daily Vision')
                        : usage === 'reading'
                        ? t('قراءة ومسافات قريبة', 'Reading & Close-up Work')
                        : usage === 'plano-blueblock'
                        ? t('حماية شاشات بدون مقاس (بلو لايت)', 'Zero-Power Screen Shield')
                        : t('عدسات متعددة البؤر (Progressive)', 'Progressive Multifocal')}
                    </strong>
                  </div>

                  <div className="flex justify-between items-center">
                    <span>{t('سماكة العدسة:', 'Lens Index:')}</span>
                    <div className="flex items-center gap-1">
                      <strong className="text-slate-800">Index {lensIndex}</strong>
                      <span className="text-slate-500">
                        (<Price amountSAR={getIndexPrice(lensIndex)} size="xs" />)
                      </span>
                    </div>
                  </div>

                  {prescriptionType === 'manual' ? (
                    <div className="flex justify-between items-center flex-wrap gap-1">
                      <span>{t('القياسات الطبية:', 'Prescription:')}</span>
                      <span className="font-mono text-slate-800 text-[11px] sm:text-xs">
                        OD: {rightSph}/{rightCyl} · OS: {leftSph}/{leftCyl} (PD: {pd}mm)
                      </span>
                    </div>
                  ) : prescriptionType === 'upload' ? (
                    <div className="flex justify-between items-center text-emerald-700 font-semibold">
                      <span>{t('الوصفة الطبية:', 'Prescription:')}</span>
                      <span>{t('تم إرفاق صورة الوصفة الطبية 📄', 'Doctor Prescription Attached 📄')}</span>
                    </div>
                  ) : null}

                  <div className="pt-2 border-t border-slate-200">
                    <span className="font-semibold text-slate-700 block mb-1">
                      {t('الحمايات والطبقات المرفقة:', 'Coatings & Treatments Applied:')}
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 ps-1">
                      {selectedCoatings.map((cid) => {
                        const opt = COATING_OPTIONS.find((c) => c.id === cid);
                        if (!opt) return <li key={cid}>{cid}</li>;
                        return (
                          <li key={opt.id}>
                            {language === 'ar' ? opt.nameAr : opt.nameEn}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t border-slate-300 flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 font-kufi">
                    {t('المجموع الكلي (الإطار + العدسات):', 'Grand Total (Frame + Lenses):')}
                  </span>
                  <Price amountSAR={grandTotalSAR} size="md" className="text-base sm:text-lg font-bold font-kufi text-[#A58454]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-3.5 sm:px-6 sm:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
            >
              {language === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              <span>{t('السابق', 'Previous')}</span>
            </button>
          ) : (
            <div />
          )}

          {step < 5 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s + 1)}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>{t('التالي', 'Next')}</span>
              {language === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirm}
              className="px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#C5A880] via-[#A58454] to-[#8C6D3F] hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>{t('تأكيد وإضافة للسلة', 'Confirm & Add to Bag')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
