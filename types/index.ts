export type CountryCode = 'SA' | 'AE' | 'KW' | 'QA' | 'BH' | 'OM';
export type Language = 'ar' | 'en';

export type CategoryItemType =
  | 'category'
  | 'brand'
  | 'subcategory'
  | 'duration'
  | 'gender'
  | 'shape'
  | 'custom';

export interface CategoryConfig {
  id: string;
  itemType: CategoryItemType;
  nameAr: string;
  nameEn: string;
  slug: string;
  iconImage?: string; // Shop By button image
  showInHeaderNav?: boolean; // Show in top header category strip
  showInHome?: boolean; // Show in main home category sections
  showInExplore?: boolean; // Show in "Explore Our Collections" grid
  cardTitleAr?: string;
  cardTitleEn?: string;
  cardDescAr?: string;
  cardDescEn?: string;
  cardCtaAr?: string;
  cardCtaEn?: string;
  cardImage?: string;
  heroTitleAr?: string;
  heroTitleEn?: string;
  heroSubTitleAr?: string;
  heroSubTitleEn?: string;
  heroBannerImage?: string;
  bottomDescriptionAr?: string;
  bottomDescriptionEn?: string;
  sectionDescAr?: string;
  sectionDescEn?: string;
  homeTitleAr?: string;
  homeTitleEn?: string;
  homeSubtitleAr?: string;
  homeSubtitleEn?: string;
  metaTitleAr?: string;
  metaTitleEn?: string;
  metaDescAr?: string;
  metaDescEn?: string;
  metaKeywords?: string;
  schemaJson?: string;
}

export interface CountryInfo {
  code: CountryCode;
  nameAr: string;
  nameEn: string;
  flag: string;
  currencyAr: string;
  currencyEn: string;
  symbol: string;
  rateToSAR: number; // 1 SAR = X target currency
  vatRate: number; // e.g. 0.15 for SA
  freeShippingThresholdSAR: number;
  phoneCode: string;
  canonicalPrefixAr: string;
  canonicalPrefixEn: string;
}

export interface ProductColorVariant {
  id: string;
  nameAr: string;
  nameEn: string;
  hex: string;
  image: string;
  stock: number;
  images?: { url: string; alt?: string }[];
}

export interface ProductSpecs {
  lensWidth?: string;
  bridgeWidth?: string;
  templeLength?: string;
  waterContent?: string;
  duration?: string;
  baseCurve?: string;
  diameter?: string;
  lensesPerBox?: string;
  origin?: string;
  frameMaterial?: string;
  frameShape?: string;
  weight?: string;
  oxygenPermeability?: string;
  uvProtection?: string;
}

export interface PackSizeOption {
  id: string;
  count: number;
  labelAr: string;
  labelEn: string;
  priceSAR: number;
  customGccPrices?: Partial<Record<CountryCode, number>>;
}

export interface Product {
  id: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  slug: string;
  brand: string; // fallback raw value
  brandAr?: string;
  brandEn?: string;
  category: 'eyeglasses' | 'sunglasses' | 'contact-lenses' | 'kids' | 'accessories' | 'yuva' | string;
  categoryAr?: string;
  categoryEn?: string;
  subCategory?: string;
  subCategoryAr?: string;
  subCategoryEn?: string;
  descriptionAr: string;
  descriptionEn: string;
  shortDescriptionAr?: string;
  shortDescriptionEn?: string;
  basePriceSAR: number;
  originalPriceSAR?: number;
  customGccPrices?: Partial<Record<CountryCode, number>>;
  
  // Optical & Frame Details
  frameShape?: string; // made string to support combobox writable input
  frameShapeAr?: string;
  frameShapeEn?: string;
  frameMaterial?: string;
  gender?: string; // made string to support combobox writable input
  genderAr?: string;
  genderEn?: string;
  lensType?: 'medical' | 'sun' | 'colored' | 'blue-block' | string;

  // Contact Lens Specific Features
  contactLensType?: string;
  contactLensDuration?: string;
  contactLensDurationAr?: string;
  contactLensDurationEn?: string;
  packSizes?: PackSizeOption[];
  hasPowerOption?: boolean;
  powerPriceAddonSAR?: number; // Price difference when choosing custom vision power vs plano
  customPowerPriceAddonGccPrices?: Partial<Record<CountryCode, number>>;
  hasAstigmatismOption?: boolean; // Toric / Astigmatism support with CYL and AXIS
  astigmatismPriceAddonSAR?: number; // Price difference for astigmatism customization
  customAstigmatismPriceAddonGccPrices?: Partial<Record<CountryCode, number>>;

  colors: ProductColorVariant[];
  galleryImages?: string[];
  defaultImages?: { url: string; alt?: string }[]; // Images if product has NO colors
  dynamicSpecs?: { nameAr: string; nameEn: string; valueAr: string; valueEn: string }[]; // Dynamic specs
  isFeatured?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  rating: number;
  reviewsCount: number;
  specs: ProductSpecs;
  createdAt?: string;
  inStock?: boolean;
  seoTitleAr?: string;
  seoTitleEn?: string;
  seoDescAr?: string;
  seoDescEn?: string;
  seoKeywords?: string;
}

export interface CustomLensConfig {
  usage: 'reading' | 'distance' | 'progressive' | 'plano-blueblock';
  prescriptionType: 'upload' | 'manual' | 'none';
  prescriptionFile?: string;
  rightEye?: {
    sph: string;
    cyl: string;
    axis: string;
  };
  leftEye?: {
    sph: string;
    cyl: string;
    axis: string;
  };
  pd?: string; // Pupillary Distance
  lensIndex: '1.56' | '1.61' | '1.67' | '1.74';
  coatings: string[];
  lensPriceSAR: number;
}

export interface CartItem {
  id: string; // unique item uuid (product.id + color.id + lens hash)
  product: Product;
  selectedColor: ProductColorVariant;
  lensConfig?: CustomLensConfig;
  quantity: number;
  unitPriceSAR: number;
  
  // Contact lens configuration fields
  selectedPackSize?: PackSizeOption;
  contactLensPowerRight?: string;
  contactLensPowerLeft?: string;
  contactLensCylinderRight?: string;
  contactLensCylinderLeft?: string;
  contactLensAxisRight?: string;
  contactLensAxisLeft?: string;
  isSeparatePower?: boolean;
}

export interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
  country: CountryCode;
  city: string;
  district: string;
  address: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  status: 'new' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: CartItem[];
  customer: CustomerDetails;
  paymentMethod: 'mada' | 'apple_pay' | 'card' | 'tamara' | 'tabby' | 'cod' | 'tap_payment' | 'knet' | 'benefit';
  paymentStatus?: 'pending' | 'captured' | 'failed' | 'cancelled' | 'refunded';
  tapChargeId?: string;
  tapPaymentId?: string;
  tapTransactionUrl?: string;
  tapReceiptUrl?: string;
  tapCardBrand?: string;
  tapCardLastFour?: string;
  shippingMethod: 'fast_local' | 'express_gcc';
  shippingCostSAR: number;
  discountSAR: number;
  loyaltyDiscountSAR: number;
  subtotalSAR: number;
  taxSAR: number;
  totalSAR: number;
  currency: string;
  totalInSelectedCurrency: number;
}

export interface Appointment {
  id: string;
  type: 'home_vip' | 'clinic';
  customerName: string;
  phone: string;
  email?: string;
  city: string;
  district: string;
  address?: string;
  preferredDate: string;
  preferredTime: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpendSAR: number;
  expiryDate: string;
  isActive: boolean;
}

export interface BlogPost {
  id: string;
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string;
  excerptEn: string;
  contentAr: string;
  contentEn: string;
  coverImage: string;
  coverImageAltAr?: string;
  coverImageAltEn?: string;
  date: string;
  readTime: string;
  category: string;
  categoryAr?: string;
  categoryEn?: string;
  seoTitleAr?: string;
  seoTitleEn?: string;
  seoDescAr?: string;
  seoDescEn?: string;
  seoKeywords?: string;
  schemaJson?: string;
  author?: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  city: string;
  rating: number;
  date: string;
  comment: string;
  verifiedPurchase: boolean;
  productName: string;
}

export interface HeroSlide {
  id: string;
  image: string;
  badgeAr?: string;
  badgeEn?: string;
  highlightAr?: string;
  highlightEn?: string;
  titleAr?: string;
  titleEn?: string;
  subtitleAr?: string;
  subtitleEn?: string;
  ctaTextAr?: string;
  ctaTextEn?: string;
  ctaLink?: string;
  secondaryCtaTextAr?: string;
  secondaryCtaTextEn?: string;
  secondaryCtaLink?: string;
  isVipAction?: boolean;
}

export interface SiteSettings {
  id: string;
  supportEmail?: string;
  phoneNumber?: string;
  whatsAppNumber?: string;
  address?: string;
  metaTitle?: string;
  metaDescription?: string;
  facebookLink?: string;
  twitterLink?: string;
  instagramLink?: string;
  tiktokLink?: string;
  snapchatLink?: string;
  maroofNumber?: string;
  maroofImage?: string;
  taxNumber?: string;
  taxImage?: string;
  heroSlides?: HeroSlide[];
  clinicBannerImage?: string;
  clinicBannerTitleAr?: string;
  clinicBannerTitleEn?: string;
  clinicBannerSubtitleAr?: string;
  clinicBannerSubtitleEn?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  country?: CountryCode;
  city?: string;
  district?: string;
  address?: string;
  role?: 'admin' | 'superadmin' | 'customer';
  savedPrescription?: {
    sphereRight?: string;
    sphereLeft?: string;
    cylinderRight?: string;
    cylinderLeft?: string;
    axisRight?: string;
    axisLeft?: string;
    pd?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

