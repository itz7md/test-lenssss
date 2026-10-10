'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { SeoHead } from '@/components/SeoHead';
import { ProductCatalogSection } from '@/components/ProductCatalogSection';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function ShopPage() {
  const { language, t, products } = useApp();

  return (
    <div className="bg-white min-h-screen">
      <SeoHead
        title={
          language === 'ar'
            ? 'متجر النظارات الفاخرة والعدسات اللاصقة الأصلية'
            : 'Luxury Eyewear, Designer Sunglasses & Authentic Lenses'
        }
        description={
          language === 'ar'
            ? 'اكتشف المتجر الشامل لأرقى النظارات الطبية، النظارات الشمسية المستقطبة، والعدسات اللاصقة اليومية والشهرية الأصلية 100%. أحدث الماركات العالمية وتصاميم حصرية مع خدمة التفصيل الدقيق والتوصيل السريع.'
            : 'Explore the complete luxury optical catalog: premium medical frames, designer polarized sunglasses, and 100% certified contact lenses with custom lens options and express shipping.'
        }
        keywords="متجر نظارات, نظارات طبية فاخرة, نظارات شمسية اصلية, عدسات لاصقة معتمدة, لنس كود, luxury eyewear shop, sunglasses, eyeglasses"
      />

      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-100 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              {t('الرئيسية', 'Home')}
            </Link>
            {language === 'ar' ? (
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="text-slate-900 font-semibold">{t('المتجر', 'Shop')}</span>
          </nav>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6D3F] bg-amber-50/80 px-2.5 py-1 rounded-full border border-[#A58454]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#A58454]" />
            <span>{products.length} {t('منتج فاخر متوفر', 'Luxury Products')}</span>
          </div>
        </div>
      </div>

      {/* Full Catalog Section with Filters & Sort */}
      <ProductCatalogSection />
    </div>
  );
}
