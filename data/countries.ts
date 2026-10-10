import { CountryCode, CountryInfo } from '@/types';

export const GCC_COUNTRIES: Record<CountryCode, CountryInfo> = {
  SA: {
    code: 'SA',
    nameAr: 'المملكة العربية السعودية',
    nameEn: 'Saudi Arabia',
    flag: '🇸🇦',
    currencyAr: 'ر.س',
    currencyEn: 'SAR',
    symbol: 'ر.س',
    rateToSAR: 1.0,
    vatRate: 0.0,
    freeShippingThresholdSAR: 250,
    phoneCode: '+966',
    canonicalPrefixAr: '',
    canonicalPrefixEn: '/en',
  },
  AE: {
    code: 'AE',
    nameAr: 'الإمارات العربية المتحدة',
    nameEn: 'United Arab Emirates',
    flag: '🇦🇪',
    currencyAr: 'د.إ',
    currencyEn: 'AED',
    symbol: 'AED',
    rateToSAR: 0.979,
    vatRate: 0.0,
    freeShippingThresholdSAR: 300,
    phoneCode: '+971',
    canonicalPrefixAr: '/ae',
    canonicalPrefixEn: '/ae-en',
  },
  KW: {
    code: 'KW',
    nameAr: 'الكويت',
    nameEn: 'Kuwait',
    flag: '🇰🇼',
    currencyAr: 'د.ك',
    currencyEn: 'KWD',
    symbol: 'KWD',
    rateToSAR: 0.0818,
    vatRate: 0.0,
    freeShippingThresholdSAR: 300,
    phoneCode: '+965',
    canonicalPrefixAr: '/kw',
    canonicalPrefixEn: '/kw-en',
  },
  QA: {
    code: 'QA',
    nameAr: 'قطر',
    nameEn: 'Qatar',
    flag: '🇶🇦',
    currencyAr: 'ر.ق',
    currencyEn: 'QAR',
    symbol: 'QAR',
    rateToSAR: 0.971,
    vatRate: 0.0,
    freeShippingThresholdSAR: 300,
    phoneCode: '+974',
    canonicalPrefixAr: '/qa',
    canonicalPrefixEn: '/qa-en',
  },
  BH: {
    code: 'BH',
    nameAr: 'مملكة البحرين',
    nameEn: 'Bahrain',
    flag: '🇧🇭',
    currencyAr: 'د.ب',
    currencyEn: 'BHD',
    symbol: 'BHD',
    rateToSAR: 0.1005,
    vatRate: 0.0,
    freeShippingThresholdSAR: 300,
    phoneCode: '+973',
    canonicalPrefixAr: '/bh',
    canonicalPrefixEn: '/bh-en',
  },
  OM: {
    code: 'OM',
    nameAr: 'سلطنة عمان',
    nameEn: 'Oman',
    flag: '🇴🇲',
    currencyAr: 'ر.ع',
    currencyEn: 'OMR',
    symbol: 'OMR',
    rateToSAR: 0.1026,
    vatRate: 0.0,
    freeShippingThresholdSAR: 300,
    phoneCode: '+968',
    canonicalPrefixAr: '/om',
    canonicalPrefixEn: '/om-en',
  },
};

export const SHORT_COUNTRY_NAMES: Record<CountryCode, { ar: string; en: string }> = {
  SA: { ar: 'السعودية', en: 'Saudi Arabia' },
  AE: { ar: 'الإمارات', en: 'UAE' },
  KW: { ar: 'الكويت', en: 'Kuwait' },
  QA: { ar: 'قطر', en: 'Qatar' },
  BH: { ar: 'البحرين', en: 'Bahrain' },
  OM: { ar: 'عُمان', en: 'Oman' },
};

/**
 * Universal Meta Title Formatter:
 * Appends fixed brand & country suffix:
 *   Arabic: " | لنس كود [اسم الدولة]" (e.g. " | لنس كود السعودية")
 *   English: " | LensCode [Country Name]" (e.g. " | LensCode Saudi Arabia" / " | LensCode UAE")
 * Strips existing brand/country suffixes cleanly to completely prevent duplicates.
 */
export function formatMetaTitle(
  rawTitle?: string,
  lang: 'ar' | 'en' = 'ar',
  countryCode: CountryCode = 'SA'
): string {
  const shortCountry = SHORT_COUNTRY_NAMES[countryCode] || { ar: 'السعودية', en: 'Saudi Arabia' };
  const countryName = lang === 'ar' ? shortCountry.ar : shortCountry.en;
  const brandSuffix = lang === 'ar' ? `لنس كود ${countryName}` : `LensCode ${countryName}`;
  const fullSuffix = ` | ${brandSuffix}`;

  if (!rawTitle || !rawTitle.trim()) {
    return brandSuffix;
  }

  let clean = rawTitle.trim();

  // Strip existing brand & suffix occurrences to prevent duplicates
  clean = clean
    .replace(/\s*([|–—-])\s*(?:لِـنس\s*كود|لنس\s*كود|LensCode|Lens\s*Code|lenscode)(?:\s+[\u0621-\u064AA-Za-z\s]+)?$/i, '')
    .replace(/\s*([|–—-])\s*(?:السعودية|المملكة\s*العربية\s*السعودية|الإمارات|الإمارات\s*العربية\s*المتحدة|الكويت|قطر|البحرين|مملكة\s*البحرين|عمان|عُمان|سلطنة\s*عمان|Saudi\s*Arabia|UAE|Kuwait|Qatar|Bahrain|Oman)\s*$/i, '')
    .replace(/[\s|–—-]+$/, '')
    .trim();

  if (!clean) {
    return brandSuffix;
  }

  return `${clean}${fullSuffix}`;
}
