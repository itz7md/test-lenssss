'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronRight, ChevronLeft, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { HeroSlide } from '@/types';

interface HeroSliderProps {
  initialSlides?: HeroSlide[];
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ initialSlides }) => {
  const router = useRouter();
  const { country, language, t, setIsVipModalOpen, setActiveCategory, settings } = useApp();
  const [currentSlide, setCurrentSlide] = useState(0);

  // الاعتماد على السلايدرز القادمة من السيرفر أو المستلمة من الـ Settings
  const slides: HeroSlide[] =
    initialSlides && initialSlides.length > 0
      ? initialSlides
      : settings?.heroSlides && Array.isArray(settings.heroSlides) && settings.heroSlides.length > 0
      ? settings.heroSlides
      : [];

  // ✅ تعديل جوهري: نقل الـ useEffect إلى أعلى المكون قبل أي شرط إرجاع مبكر لحل خطأ الـ Hooks تماماً
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // تأمين التحقق من الطول بعد الـ Hooks
  if (slides.length === 0) {
    return null;
  }

  const safeIndex = currentSlide >= slides.length ? 0 : currentSlide;
  const active = slides[safeIndex];

  if (!active) return null;

  const handleCta = (target?: string) => {
    if (!target) {
      const el = document.getElementById('catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        router.push('/shop');
      }
      return;
    }
    if (target.startsWith('http://') || target.startsWith('https://')) {
      window.location.href = target;
      return;
    }
    if (target === 'all' || target === 'shop') {
      router.push('/shop');
      return;
    }
    if (target.startsWith('/')) {
      router.push(target);
      return;
    }
    setActiveCategory(target);
    router.push(`/${target}`);
  };

  const badgeText = language === 'ar' ? active.badgeAr?.trim() : active.badgeEn?.trim();
  const highlightText = language === 'ar' ? active.highlightAr?.trim() : active.highlightEn?.trim();
  const hasBadgeContainer = Boolean(badgeText || highlightText);

  const titleText = language === 'ar' ? active.titleAr?.trim() : active.titleEn?.trim();
  const subtitleText = language === 'ar' ? active.subtitleAr?.trim() : active.subtitleEn?.trim();

  const primaryBtnText = language === 'ar' ? active.ctaTextAr?.trim() : active.ctaTextEn?.trim();
  const secondaryBtnText =
    language === 'ar' ? active.secondaryCtaTextAr?.trim() : active.secondaryCtaTextEn?.trim();
  const hasButtonsContainer = Boolean(primaryBtnText || secondaryBtnText);

  const hasAnyTextContent = Boolean(hasBadgeContainer || titleText || subtitleText || hasButtonsContainer);

  return (
    <section className="relative w-full bg-slate-950 text-white overflow-hidden min-h-[380px] sm:min-h-[460px] md:min-h-[520px] lg:min-h-[580px] flex items-center">
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id || `slide-${safeIndex}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-0"
        >
          {active.image ? (
            <Image
              src={active.image}
              alt={titleText || 'LensCode Luxury Eyewear'}
              fill
              sizes="100vw"
              priority
              referrerPolicy="no-referrer"
              className="object-cover object-center brightness-90"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950" />
          )}

          {hasAnyTextContent && (
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/95 via-slate-950/60 to-transparent" />
          )}
        </motion.div>
      </AnimatePresence>

      {hasAnyTextContent ? (
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-20 w-full">
          <div className="max-w-xl md:max-w-2xl">
            <motion.div
              key={`content-${active.id || safeIndex}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="space-y-2.5 sm:space-y-4 md:space-y-6"
            >
              {hasBadgeContainer && (
                <div className="inline-flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm font-semibold text-[#C5A880] tracking-wider uppercase">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#A58454] animate-ping" />
                  {badgeText && <span>{badgeText}</span>}
                  {badgeText && highlightText && <span className="text-slate-400">·</span>}
                  {highlightText && (
                    <span className="text-amber-300 font-bold">{highlightText}</span>
                  )}
                </div>
              )}

              {titleText && (
                <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-kufi tracking-tight text-white leading-tight">
                  {titleText}
                </h1>
              )}

              {subtitleText && (
                <p className="text-xs sm:text-base md:text-lg text-slate-200/90 leading-relaxed font-sans max-w-lg line-clamp-2 sm:line-clamp-none">
                  {subtitleText}
                </p>
              )}

              {hasButtonsContainer && (
                <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                  {primaryBtnText && (
                    <button
                      type="button"
                      onClick={() => handleCta(active.ctaLink)}
                      className="px-4 py-2.5 sm:px-6 sm:py-3.5 rounded-lg bg-gradient-to-r from-[#C5A880] via-[#A58454] to-[#8C6D3F] hover:from-[#d6bd99] hover:to-[#785b31] text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-1.5 group"
                    >
                      <span>{primaryBtnText}</span>
                      {language === 'ar' ? (
                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                      )}
                    </button>
                  )}

                  {secondaryBtnText && (
                    <button
                      type="button"
                      onClick={() => {
                        if (active.isVipAction) {
                          setIsVipModalOpen(true);
                        } else if (active.secondaryCtaLink) {
                          handleCta(active.secondaryCtaLink);
                        } else {
                          setIsVipModalOpen(true);
                        }
                      }}
                      className="px-3.5 py-2.5 sm:px-5 sm:py-3.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white font-medium text-xs sm:text-sm transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A880]" />
                      <span>{secondaryBtnText}</span>
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      ) : (
        active.ctaLink && (
          <button
            type="button"
            onClick={() => handleCta(active.ctaLink)}
            className="absolute inset-0 z-10 w-full h-full cursor-pointer bg-transparent border-0"
            aria-label="Hero Slide Banner Link"
          />
        )
      )}

      {slides.length > 1 && (
        <div className="absolute bottom-3 sm:bottom-6 end-3 sm:end-6 z-20 flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1))}
            className="p-1.5 sm:p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white border border-white/10 backdrop-blur-xs transition-colors cursor-pointer"
            title="Previous slide"
          >
            {language === 'ar' ? (
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
                    <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 sm:h-2 rounded-full transition-all cursor-pointer ${
                  safeIndex === idx ? 'w-4 sm:w-6 bg-[#C5A880]' : 'w-1.5 sm:w-2 bg-white/40'
                }`}
                title={`Slide ${idx + 1}`}
              />
            ))}
          </div>
          
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
            className="p-1.5 sm:p-2 rounded-full bg-slate-900/60 hover:bg-slate-900 text-white border border-white/10 backdrop-blur-xs transition-colors cursor-pointer"
            title="Next slide"
          >
            {language === 'ar' ? (
              <ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            )}
          </button>
        </div>
      )}
    </section>
  );
};
