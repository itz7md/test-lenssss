'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import Image from 'next/image';
import { CheckCircle2, Calendar } from 'lucide-react';
import { SiteSettings } from '@/types';

// 1. تعريف واجهة الـ Props لـ TypeScript لتقبل الخصائص القادمة من السيرفر بنجاح
interface ClinicBannerProps {
  initialSettings?: SiteSettings | null;
}

// 2. تحديث المكون ليستقبل الـ initialSettings كـ Prop اختياري
export const ClinicBanner: React.FC<ClinicBannerProps> = ({ initialSettings }) => {
  const { country, language, t, setIsVipModalOpen, settings: contextSettings } = useApp();

  // استخدام الإعدادات المستلمة من السيرفر مباشرة لتسريع العرض، أو العودة لبيانات الـ Context كـ Fallback
  const settings = initialSettings || contextSettings;

  // Vision Exam clinic & home visits are currently only available in Saudi Arabia (SA branch)
  if (country !== 'SA') {
    return null;
  }

  const features = [
    { ar: 'فحص شامل', en: 'Comprehensive Exam' },
    { ar: 'استشارة مجانية', en: 'Free Consultation' },
    { ar: 'تقرير مفصل', en: 'Detailed Vision Report' },
  ];

  // Dynamic image uploaded and managed strictly from Platform Settings in Admin Dashboard
  const bannerImage = settings?.clinicBannerImage?.trim() || '';

  const title =
    language === 'ar'
      ? settings?.clinicBannerTitleAr?.trim() || t('احجز فحص نظرك مجاناً', 'Book Your Free Vision Exam')
      : settings?.clinicBannerTitleEn?.trim() || t('احجز فحص نظرك مجاناً', 'Book Your Free Vision Exam');

  const subtitle =
    language === 'ar'
      ? settings?.clinicBannerSubtitleAr?.trim() ||
        t(
          'مع أخصائيين معتمدين وأحدث أجهزة الفحص الرقمية المتطورة',
          'With certified optometrists and cutting-edge digital diagnostic technology'
        )
      : settings?.clinicBannerSubtitleEn?.trim() ||
        t(
          'مع أخصائيين معتمدين وأحدث أجهزة الفحص الرقمية المتطورة',
          'With certified optometrists and cutting-edge digital diagnostic technology'
        );

  return (
    <section className="py-4 sm:py-8 bg-white">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-50 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Text Content */}
            <div className={`${bannerImage ? 'lg:col-span-6' : 'lg:col-span-12 max-w-3xl mx-auto text-center'} p-4 sm:p-8 lg:p-12 z-10`}>
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#A58454]/10 text-[#8C6D3F] text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 ${!bannerImage ? 'mx-auto' : ''}`}>
                <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>{t('خدمة مجانية معتمدة', 'Complimentary Certified Service')}</span>
              </div>

              <h2 className="text-lg sm:text-3xl lg:text-4xl font-bold font-kufi text-slate-900 mb-1 sm:mb-1.5 tracking-tight">
                {title}
              </h2>
              <p className="text-[11px] sm:text-sm text-slate-600 mb-3 sm:mb-6 font-sans leading-relaxed">
                {subtitle}
              </p>

              {/* 3 Badges */}
              <div className={`flex flex-wrap items-center gap-2 sm:gap-6 mb-3.5 sm:mb-8 text-[10px] sm:text-xs font-semibold text-slate-700 ${!bannerImage ? 'justify-center' : ''}`}>
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-1 sm:gap-1.5">
                    <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#A58454]/20 text-[#A58454] flex items-center justify-center">
                      <CheckCircle2 className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 text-[#A58454]" />
                    </span>
                    <span>{language === 'ar' ? feat.ar : feat.en}</span>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className={`flex items-center gap-2.5 sm:gap-4 ${!bannerImage ? 'justify-center' : ''}`}>
                <button
                  type="button"
                  onClick={() => setIsVipModalOpen(true)}
                  className="px-4 py-2 sm:px-8 sm:py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <span>{t('احجز الآن', 'Book Now')}</span>
                </button>
                <span className="text-[10px] sm:text-xs text-slate-500">
                  {t('في الفرع أو زيارة منزلية VIP', 'In-clinic or VIP Home Visit')}
                </span>
              </div>
            </div>

            {/* Clinic Equipment Image */}
            {bannerImage && (
              <div className="lg:col-span-6 relative h-[140px] sm:h-[240px] lg:h-[360px] w-full">
                <Image
                  src={bannerImage}
                  alt={title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  referrerPolicy="no-referrer"
                  className="object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-transparent via-transparent to-slate-50/20" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
