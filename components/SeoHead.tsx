'use client';

import React, { useLayoutEffect, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { GCC_COUNTRIES, formatMetaTitle, SHORT_COUNTRY_NAMES } from '@/data/countries';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export const SeoHead: React.FC<SeoHeadProps> = ({ title, description, keywords }) => {
  const { language, country, currentCountryInfo, products, settings } = useApp();

  const shortCountry = SHORT_COUNTRY_NAMES[country] || { ar: 'السعودية', en: 'Saudi Arabia' };
  const shortCountryName = language === 'ar' ? shortCountry.ar : shortCountry.en;

  // 1. Determine Title from props or custom settings in Control Panel
  const rawTitle = title || settings?.metaTitle || '';
  const siteTitle = formatMetaTitle(
    rawTitle,
    language === 'ar' ? 'ar' : 'en',
    country
  );

  // 2. Determine Description: Strictly prefer custom description from page props or Control Panel settings
  const metaDesc = description || settings?.metaDescription || (
    language === 'ar'
      ? `متجر لنس كود الفاخر للنظارات والعدسات اللاصقة وفحص النظر المعتمد في ${shortCountryName}.`
      : `LensCode Luxury Optical in ${shortCountryName}: Designer eyeglasses, sunglasses & certified contact lenses.`
  );

  // 3. Immediate synchronous update to prevent any flash of default text
  useIsomorphicLayoutEffect(() => {
    if (typeof document === 'undefined') return;

    if (siteTitle) {
      document.title = siteTitle;
    }

    // Helper to update or create meta tags
    const setMeta = (attrName: 'name' | 'property', attrValue: string, content: string) => {
      if (!content) return;
      let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    if (metaDesc) {
      setMeta('name', 'description', metaDesc);
      setMeta('property', 'og:description', metaDesc);
      setMeta('name', 'twitter:description', metaDesc);
    }

    if (siteTitle) {
      setMeta('property', 'og:title', siteTitle);
      setMeta('name', 'twitter:title', siteTitle);
    }

    if (keywords) {
      setMeta('name', 'keywords', keywords);
    }
  }, [siteTitle, metaDesc, keywords]);

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'LensCode',
    alternateName: 'لنس كود للبصريات',
    url: 'https://lenscode.sa',
    logo: 'https://lenscode.sa/images/hero_national_day.webp',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: settings?.phoneNumber || '+966556359090',
      contactType: 'customer service',
      areaServed: ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'],
      availableLanguage: ['Arabic', 'English'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings?.address || 'Imam Faisal bin Turki Street, Al-Dirah',
      addressLocality: 'Riyadh',
      addressCountry: 'SA',
    },
  };

  // WebSite Schema with internal search engine
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'LensCode',
    url: 'https://lenscode.sa',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://lenscode.sa/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  // Sample Product Schema for the flagship frame
  const flagship = products[0];
  const productSchema = flagship
    ? {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: flagship.nameAr,
        image: 'https://lenscode.sa' + (flagship.colors[0]?.image || '/images/prod_acetate.webp'),
        description: flagship.descriptionAr,
        sku: flagship.sku,
        brand: {
          '@type': 'Brand',
          name: flagship.brand,
        },
        offers: {
          '@type': 'Offer',
          url: `https://lenscode.sa/${flagship.slug}`,
          priceCurrency: currentCountryInfo.currencyEn,
          price: flagship.basePriceSAR * currentCountryInfo.rateToSAR,
          priceValidUntil: '2027-12-31',
          availability: 'https://schema.org/InStock',
          seller: {
            '@type': 'Organization',
            name: 'LensCode',
          },
        },
        aggregateRating: {
          '@type': 'AggregateRating',
          ratingValue: flagship.rating.toString(),
          reviewCount: flagship.reviewsCount.toString(),
        },
      }
    : null;

  return (
    <>
      <title>{siteTitle}</title>
      {metaDesc && <meta name="description" content={metaDesc} />}
      {siteTitle && <meta property="og:title" content={siteTitle} />}
      {metaDesc && <meta property="og:description" content={metaDesc} />}
      {siteTitle && <meta name="twitter:title" content={siteTitle} />}
      {metaDesc && <meta name="twitter:description" content={metaDesc} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
    </>
  );
};
