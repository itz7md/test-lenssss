import { Product, CountryInfo, PackSizeOption } from '@/types';
import { getBrandName } from './brands';

export interface CategoryDef {
  id: Product['category'];
  nameAr: string;
  nameEn: string;
  icon: string;
  subcategories: Array<{ id: string; nameAr: string; nameEn: string }>;
}

export const CATALOG_CATEGORIES: CategoryDef[] = [];

export const FRAME_SHAPES = [
  { id: 'geometric', nameAr: 'هندسي مضلع (Geometric)', nameEn: 'Geometric', shortAr: 'هندسي', shortEn: 'Geometric' },
  { id: 'rectangle', nameAr: 'مستطيل (Rectangle)', nameEn: 'Rectangle', shortAr: 'مستطيل', shortEn: 'Rectangle' },
  { id: 'square', nameAr: 'مربع (Square)', nameEn: 'Square', shortAr: 'مربع', shortEn: 'Square' },
  { id: 'round', nameAr: 'دائري (Round)', nameEn: 'Round', shortAr: 'دائري', shortEn: 'Round' },
  { id: 'rimless', nameAr: 'بدون إطار (Rimless)', nameEn: 'Rimless', shortAr: 'بدون إطار', shortEn: 'Rimless' },
  { id: 'half-rim', nameAr: 'نصف إطار (Half-Rim)', nameEn: 'Half-Rim', shortAr: 'نصف إطار', shortEn: 'Half-Rim' },
  { id: 'cat-eye', nameAr: 'عين القطة (Cat Eye)', nameEn: 'Cat-Eye', shortAr: 'كات آي', shortEn: 'Cat-Eye' },
  { id: 'hexagon', nameAr: 'سداسي (Hexagon)', nameEn: 'Hexagon', shortAr: 'سداسي', shortEn: 'Hexagon' },
  { id: 'aviator', nameAr: 'أفياتور طيار (Aviator)', nameEn: 'Aviator', shortAr: 'أفياتور', shortEn: 'Aviator' },
  { id: 'oval', nameAr: 'بيضاوي (Oval)', nameEn: 'Oval', shortAr: 'بيضاوي', shortEn: 'Oval' },
];

/**
 * Universal shape matcher that checks if a product's frame shape matches a target shape ID.
 * Works with either a Product object or a productShape string.
 */
export function matchShape(
  productOrShape?: string | Product | { frameShape?: string; frameShapeAr?: string; frameShapeEn?: string },
  targetShapeId?: string
): boolean {
  if (!targetShapeId || targetShapeId === 'all') return true;
  if (!productOrShape) return false;

  let pShape = '';
  if (typeof productOrShape === 'string') {
    pShape = productOrShape.toLowerCase().trim();
  } else {
    const p = productOrShape as any;
    pShape = (
      p.frameShape ||
      p.frameShapeEn ||
      p.frameShapeAr ||
      p.specs?.frameShape ||
      p.specs?.shape ||
      ''
    ).toLowerCase().trim();
  }

  if (!pShape || pShape === 'none') return false;

  const t = targetShapeId.toLowerCase().trim();
  if (pShape === t) return true;

  if (t === 'geometric' || t === 'هندسي') {
    return pShape === 'geometric' || pShape.includes('هندس') || pShape.includes('geomet');
  }
  if (t === 'rectangle' || t === 'مستطيل') {
    return pShape === 'rectangle' || pShape.includes('مستطيل') || pShape.includes('rectang');
  }
  if (t === 'square' || t === 'مربع') {
    return pShape === 'square' || pShape.includes('مربع') || pShape.includes('square');
  }
  if (t === 'round' || t === 'دائري') {
    return pShape === 'round' || pShape.includes('دائر') || pShape.includes('round');
  }
  if (t === 'rimless' || t === 'بدون إطار' || t === 'بدون اطار') {
    return pShape === 'rimless' || pShape.includes('بدون') || pShape.includes('فرملس') || pShape.includes('rimless');
  }
  if (t === 'half-rim' || t === 'نصف إطار' || t === 'نصف اطار' || t === 'semi-rimless') {
    return pShape === 'half-rim' || pShape.includes('نصف') || pShape.includes('half') || pShape.includes('semi');
  }
  if (t === 'cat-eye' || t === 'عين القطة' || t === 'كات اي' || t === 'كات آي') {
    return pShape === 'cat-eye' || pShape.includes('كات') || pShape.includes('cat') || pShape.includes('عين القطة');
  }
  if (t === 'hexagon' || t === 'سداسي') {
    return pShape === 'hexagon' || pShape.includes('سداس') || pShape.includes('hexagon');
  }
  if (t === 'aviator' || t === 'أفياتور' || t === 'افياتور') {
    return pShape === 'aviator' || pShape.includes('افياتور') || pShape.includes('أفياتور') || pShape.includes('aviator') || pShape.includes('طيار');
  }
  if (t === 'oval' || t === 'بيضاوي') {
    return pShape === 'oval' || pShape.includes('بيضاوي') || pShape.includes('oval');
  }

  return pShape === t;
}

/**
 * Returns a human-friendly localized frame shape label.
 */
export function getFrameShapeName(shapeKey?: string, lang: 'ar' | 'en' = 'ar'): string {
  if (!shapeKey || shapeKey === 'none') return lang === 'ar' ? 'غير محدد' : 'None';
  const found = FRAME_SHAPES.find((s) => matchShape(shapeKey, s.id));
  if (found) {
    return lang === 'ar' ? found.shortAr : found.shortEn;
  }
  return shapeKey;
}

export const FRAME_MATERIALS: Array<{ id: string; nameAr: string; nameEn: string }> = [];

export const CONTACT_LENS_TYPES: Array<{ id: string; nameAr: string; nameEn: string }> = [];

export const CONTACT_LENS_DURATIONS: Array<{ id: string; nameAr: string; nameEn: string }> = [];

export const DEFAULT_PACK_SIZES: PackSizeOption[] = [];

export const POPULAR_BRANDS: Array<{ id: string; nameAr: string; nameEn: string; category: string }> = [];

/**
 * Auto-generates clean SEO Meta and Schema data for any product
 */
export function autoGenerateProductSeo(product: Partial<Product>): {
  slug: string;
  seoTitleAr: string;
  seoTitleEn: string;
  seoDescAr: string;
  seoDescEn: string;
  seoKeywords: string;
} {
  const brandNameAr = getBrandName(product.brandAr || product.brand || '', 'ar');
  const brandNameEn = getBrandName(product.brandEn || product.brand || '', 'en');
  const nameAr = product.nameAr || 'منتج بصري فاخر';
  const nameEn = product.nameEn || 'Luxury Optical Product';

  const baseSlug = (product.nameEn || product.nameAr || 'product')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const brandSlug = (product.brandEn || product.brand || 'product').toLowerCase().replace(/\s+/g, '-');
  const slug = `${brandSlug}-${baseSlug || Date.now()}`;

  let seoTitleAr = '';
  let seoTitleEn = '';
  let seoDescAr = '';
  let seoDescEn = '';
  let keywords = '';

  if (product.category === 'contact-lenses') {
    seoTitleAr = `عدسات ${brandNameAr} ${nameAr} الأصلية | متجر لِـنس كود`;
    seoTitleEn = `Original ${brandNameEn} ${nameEn} Contact Lenses | LensCode`;
    seoDescAr = `تسوق عدسات ${nameAr} من ماركة ${brandNameAr} المعتمدة مع خيارات قياس النظر والاستجماتيزم وتوصيل سريع في السعودية والخليج.`;
    seoDescEn = `Shop authentic ${nameEn} contact lenses by ${brandNameEn} at LensCode. Available in cosmetic, vision powers, and astigmatism toric options.`;
    keywords = `عدسات, ${nameAr}, ${brandNameAr}, عدسات لاصقة, استجماتيزم, عدسات ملونة, LensCode, ${nameEn}, ${brandNameEn}`;
  } else if (product.category === 'sunglasses') {
    seoTitleAr = `نظارة شمسية ${brandNameAr} ${nameAr} حماية UV400 | لِـنس كود`;
    seoTitleEn = `${brandNameEn} ${nameEn} Luxury Sunglasses UV400 | LensCode`;
    seoDescAr = `اكتشف نظارات ${brandNameAr} ${nameAr} الشمسية الفاخرة مع عدسات مستقطبة وحماية 100% من أشعة الشمس مع شحن مجاني وسريع.`;
    seoDescEn = `Discover ${brandNameEn} ${nameEn} luxury sunglasses with 100% UV protection and polarized clarity. Free express insured shipping.`;
    keywords = `نظارات شمسية, ${nameAr}, ${brandNameAr}, بولارايزد, LensCode, ${nameEn}, ${brandNameEn}`;
  } else if (product.category === 'kids') {
    seoTitleAr = `نظارات أطفال ${brandNameAr} ${nameAr} طبية مرنة | لِـنس كود`;
    seoTitleEn = `Safe Kids ${brandNameEn} ${nameEn} Flexible Glasses | LensCode`;
    seoDescAr = `نظارات أطفال آمنة ومرنة ${nameAr} بدون براغي حادة ومقاومة للكسر مع فحص نظر مجاني.`;
    seoDescEn = `Shatter-proof flexible children eyeglasses ${nameEn} by ${brandNameEn} with blue-light protection and ergonomic fit.`;
    keywords = `نظارات أطفال, ${nameAr}, ${brandNameAr}, نظارات سيليكون, LensCode`;
  } else if (product.category === 'accessories') {
    seoTitleAr = `${nameAr} من ${brandNameAr} | إكسسوارات وعناية بالعيون لِـنس كود`;
    seoTitleEn = `${nameEn} by ${brandNameEn} | LensCare Accessories | LensCode`;
    seoDescAr = `تسوق ${nameAr} الأصلي للعناية بالنظارات والعدسات اللاصقة مع أعلى معايير الجودة والتعقيم.`;
    seoDescEn = `Premium authentic ${nameEn} eyewear and contact lens care accessories with top clinical sterilization standards.`;
    keywords = `إكسسوارات نظارات, ${nameAr}, محاليل عدسات, حافظات نظارات, LensCode`;
  } else {
    seoTitleAr = `إطار طبي ${nameAr} من براند ${brandNameAr} | منصة لِـنس كود`;
    seoTitleEn = `${brandNameEn} ${nameEn} Optical Frame | LensCode Luxury Eyewear`;
    seoDescAr = `إطار طبي فاخر وخفيف ${nameAr} من ماركة ${brandNameAr} مع إمكانية تفصيل العدسات الطبية حسب مقاسك وشحن سريع.`;
    seoDescEn = `Luxury lightweight ${nameEn} optical frame by ${brandNameEn}. Customizable with custom digital prescription lenses at LensCode.`;
    keywords = `إطارات طبية, ${nameAr}, ${brandNameAr}, نظارات طبية, تفصيل عدسات, LensCode, ${nameEn}, ${brandNameEn}`;
  }

  return {
    slug,
    seoTitleAr,
    seoTitleEn,
    seoDescAr,
    seoDescEn,
    seoKeywords: keywords,
  };
}

/**
 * Builds standard Schema.org JSON-LD for rich snippets
 */
export function buildProductSchemaJson(product: Product, country: CountryInfo, appUrl: string = 'https://lenscode.sa') {
  const currentPrice = Number(
    ((product.customGccPrices && product.customGccPrices[country.code]) || product.basePriceSAR * country.rateToSAR).toFixed(3)
  );
  const brandName = getBrandName(product.brand, 'ar');
  const imageUrl = product.colors[0]?.image || `${appUrl}/images/prod_acetate.jpg`;
  const absoluteImage = imageUrl.startsWith('http') ? imageUrl : `${appUrl}${imageUrl}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nameAr,
    image: [absoluteImage],
    description: product.descriptionAr,
    sku: product.sku,
    mpn: product.sku,
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      url: `${appUrl}/${product.slug}`,
      priceCurrency: country.symbol || 'SAR',
      price: currentPrice,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        product.colors.reduce((s, c) => s + c.stock, 0) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'LensCode Luxury Optics',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: product.rating || 4.9,
      reviewCount: product.reviewsCount || 38,
      bestRating: '5',
      worstRating: '1',
    },
  };
}
