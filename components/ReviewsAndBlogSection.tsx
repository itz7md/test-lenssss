'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { Clock, ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const ReviewsAndBlogSection: React.FC = () => {
  const { blogPosts, language, t } = useApp();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState<1 | -1>(1);

  // Present top 8 featured articles in homepage slider to keep dots sleek and compact
  const posts = blogPosts && blogPosts.length > 0 ? blogPosts.slice(0, 8) : [];

  // Auto-play interval: switches article automatically every 5 seconds
  useEffect(() => {
    if (posts.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIdx((prev) => (prev + 1) % posts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [posts.length, isPaused]);

  if (posts.length === 0) return null;

  const currentPost = posts[currentIdx] || posts[0];

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIdx((prev) => (prev === 0 ? posts.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setDirection(1);
    setCurrentIdx((prev) => (prev + 1) % posts.length);
  };

  const handleDotClick = (idx: number) => {
    if (idx === currentIdx) return;
    setDirection(idx > currentIdx ? 1 : -1);
    setCurrentIdx(idx);
  };

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <section className="py-6 sm:py-12 bg-white border-t border-slate-100">
      <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div id="blog-section" className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#8C6D3F] uppercase tracking-wider block mb-0.5 sm:mb-1">
              {t('مدونة البصريات وصحة العين', 'Optical Blog & Guides')}
            </span>
            <h2 className="text-base sm:text-2xl md:text-3xl font-bold font-kufi text-slate-900 tracking-tight">
              {t('أدلة العناية بالعين واختيار النظارة', 'Eye Care & Eyewear Style Guides')}
            </h2>
          </div>

          <Link
            href="/blog"
            className="text-xs font-bold text-[#8C6D3F] hover:underline flex items-center gap-1 shrink-0"
          >
            <span>{t('عرض كافة المقالات', 'View All Articles')}</span>
            {language === 'ar' ? (
              <ArrowLeft className="w-3.5 h-3.5" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </Link>
        </div>

        {/* Single Article Horizontal Auto Slider */}
        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="overflow-hidden min-h-[360px] sm:min-h-[300px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.article
                key={currentPost.id}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="group bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300"
              >
                <div className="grid grid-cols-1 md:grid-cols-12 items-center">
                  {/* Article Cover Image */}
                  <div className="md:col-span-5 relative h-48 sm:h-64 md:h-72 w-full overflow-hidden bg-slate-100">
                    <Link href={`/blog/${currentPost.slug || currentPost.id}`} className="block w-full h-full">
                      <Image
                        src={currentPost.coverImage}
                        alt={
                          language === 'ar'
                            ? currentPost.coverImageAltAr || currentPost.titleAr
                            : currentPost.coverImageAltEn || currentPost.titleEn
                        }
                        fill
                        sizes="(max-width: 768px) 100vw, 42vw"
                        referrerPolicy="no-referrer"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </Link>
                    <div className="absolute top-3 start-3">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                        {language === 'ar'
                          ? currentPost.categoryAr || currentPost.category
                          : currentPost.categoryEn || currentPost.category}
                      </span>
                    </div>
                  </div>

                  {/* Article Content Details */}
                  <div className="md:col-span-7 p-4 sm:p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-2">
                        <span className="font-semibold text-[#8C6D3F]">
                          {language === 'ar'
                            ? currentPost.categoryAr || currentPost.category
                            : currentPost.categoryEn || currentPost.category}
                        </span>
                        <span>·</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{currentPost.readTime}</span>
                        </div>
                        <span>·</span>
                        <span>{currentPost.date}</span>
                      </div>

                      <Link href={`/blog/${currentPost.slug || currentPost.id}`}>
                        <h3 className="text-sm sm:text-lg md:text-xl font-bold font-kufi text-slate-900 group-hover:text-[#A58454] transition-colors leading-snug mb-2 sm:mb-3 line-clamp-2">
                          {language === 'ar' ? currentPost.titleAr : currentPost.titleEn}
                        </h3>
                      </Link>

                      <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-sans line-clamp-3 mb-4 sm:mb-6">
                        {language === 'ar' ? currentPost.excerptAr : currentPost.excerptEn}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <Link
                        href={`/blog/${currentPost.slug || currentPost.id}`}
                        className="text-xs sm:text-sm font-semibold text-[#8C6D3F] hover:underline flex items-center gap-1.5"
                      >
                        <span>{t('اقرأ الدليل كاملاً', 'Read Full Guide')}</span>
                        {language === 'ar' ? (
                          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                        ) : (
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        )}
                      </Link>

                      {/* Article Slide Counter */}
                      <span className="text-[11px] text-slate-400 font-mono">
                        {currentIdx + 1} / {posts.length}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.article>
            </AnimatePresence>
          </div>

          {/* Smooth, Flat, Compact Bottom Dots & Navigation Controls */}
          {posts.length > 1 && (
            <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
              {/* Previous Slide Button */}
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous article"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'ar' ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>

              {/* Flat Dots Indicators */}
              <div className="flex items-center gap-1.5">
                {posts.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDotClick(idx)}
                    aria-label={`Go to article ${idx + 1}`}
                    className={`transition-all duration-300 rounded-full cursor-pointer h-1.5 ${
                      currentIdx === idx
                        ? 'w-6 bg-[#A58454]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>

              {/* Next Slide Button */}
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next article"
                className="w-7 h-7 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {language === 'ar' ? (
                  <ChevronLeft className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
