'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { SeoHead } from '@/components/SeoHead';
import {
  BookOpen,
  Clock,
  Calendar,
  Search,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Share2,
  Bookmark,
} from 'lucide-react';

export const BlogListingView: React.FC = () => {
  const { blogPosts, language, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    blogPosts.forEach((post) => {
      const cat = language === 'ar' ? (post.categoryAr || post.category) : (post.categoryEn || post.category);
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [blogPosts, language]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    return blogPosts.filter((post) => {
      const title = (language === 'ar' ? post.titleAr : post.titleEn) || '';
      const excerpt = (language === 'ar' ? post.excerptAr : post.excerptEn) || '';
      const cat = (language === 'ar' ? (post.categoryAr || post.category) : (post.categoryEn || post.category)) || '';

      const matchesSearch =
        !searchQuery.trim() ||
        title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || cat.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [blogPosts, language, searchQuery, selectedCategory]);

  const featuredPost = filteredPosts[0] || blogPosts[0];
  const gridPosts = filteredPosts.length > 1 ? filteredPosts.slice(1) : filteredPosts;

  const pageTitle = language === 'ar' ? 'مدونة البصريات وأدلة العناية بالعين' : 'Optical Blog & Eye Care Guides';
  const pageDesc =
    language === 'ar'
      ? 'دليلك المتخصص في صحة العيون، كيفية اختيار النظارات الطبية والشمسية، وأحدث الإرشادات الطبية المعتمدة للعدسات اللاصقة مع نخبة أخصائيي لِـنس كود.'
      : 'Your specialized guide to eye health, luxury optical frame selection, and certified contact lens care tips curated by LensCode optometrists.';

  return (
    <div className="bg-white min-h-screen pb-16">
      <SeoHead title={pageTitle} description={pageDesc} />

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
            <span className="text-slate-900 font-semibold">{t('المدونة والمقالات', 'Blog & Guides')}</span>
          </nav>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#8C6D3F] bg-amber-50/80 px-2.5 py-1 rounded-full border border-[#A58454]/30">
            <BookOpen className="w-3.5 h-3.5 text-[#A58454]" />
            <span>{blogPosts.length} {t('مقال ودليل إرشادي', 'Articles & Guides')}</span>
          </div>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-slate-950 text-white py-10 sm:py-16 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A58454]/20 border border-[#A58454]/40 text-[#D8B480] text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D8B480]" />
            <span>{t('المحتوى التثقيفي المعتمد', 'Certified Optical Knowledge')}</span>
          </span>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-kufi text-white mb-3 sm:mb-4 tracking-tight">
            {t('مدونة البصريات وصحة العين', 'Optical Blog & Eye Health Guides')}
          </h1>
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed font-sans">
            {t(
              'مقالات متخصصة وأدلة شاملة لاختيار النظارة المثالية والعناية بصحة بصرك برفقة استشاريي البصريات المعتمدين.',
              'In-depth articles and comprehensive guides to choose your perfect frames and maintain crystal clear eyesight.'
            )}
          </p>

          {/* Search Box */}
          <div className="max-w-md mx-auto mt-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('ابحث في المقالات والنصائح الطبية...', 'Search articles and medical advice...')}
              className="w-full ps-10 pe-4 py-2.5 sm:py-3 rounded-full bg-slate-900/90 border border-slate-700 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#A58454] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8">
          <button
            type="button"
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {t('جميع المقالات', 'All Articles')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Post Hero (if matching results) */}
        {featuredPost && !searchQuery && selectedCategory === 'all' && (
          <div className="mb-10 sm:mb-14">
            <Link
              href={`/blog/${featuredPost.slug || featuredPost.id}`}
              className="group block bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
                <div className="lg:col-span-7 relative h-56 sm:h-80 lg:h-96 w-full overflow-hidden bg-slate-100">
                  <Image
                    src={featuredPost.coverImage}
                    alt={language === 'ar' ? (featuredPost.coverImageAltAr || featuredPost.titleAr) : (featuredPost.coverImageAltEn || featuredPost.titleEn)}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    referrerPolicy="no-referrer"
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-3.5 start-3.5">
                    <span className="px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 text-xs font-bold backdrop-blur-xs">
                      {t('مقال مميز', 'Featured Guide')}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-5 p-5 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                      <span className="font-semibold text-[#8C6D3F]">
                        {language === 'ar' ? (featuredPost.categoryAr || featuredPost.category) : (featuredPost.categoryEn || featuredPost.category)}
                      </span>
                      <span>·</span>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{featuredPost.readTime}</span>
                      </div>
                      <span>·</span>
                      <span>{featuredPost.date}</span>
                    </div>

                    <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold font-kufi text-slate-900 group-hover:text-[#A58454] transition-colors leading-snug mb-3">
                      {language === 'ar' ? featuredPost.titleAr : featuredPost.titleEn}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4 font-sans">
                      {language === 'ar' ? featuredPost.excerptAr : featuredPost.excerptEn}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm font-bold text-[#8C6D3F]">
                    <span>{t('اقرأ الدليل كاملاً', 'Read Full Guide')}</span>
                    {language === 'ar' ? (
                      <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1.5 transition-transform" />
                    ) : (
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Articles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
          {gridPosts.map((post) => (
            <article
              key={post.id}
              className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <Link href={`/blog/${post.slug || post.id}`} className="block relative w-full h-44 sm:h-52 bg-slate-100 overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={language === 'ar' ? (post.coverImageAltAr || post.titleAr) : (post.coverImageAltEn || post.titleEn)}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  referrerPolicy="no-referrer"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3">
                  <span className="px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                    {language === 'ar' ? (post.categoryAr || post.category) : (post.categoryEn || post.category)}
                  </span>
                </div>
              </Link>

              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
                    <Clock className="w-3 h-3" />
                    <span>{post.readTime}</span>
                    <span>·</span>
                    <span>{post.date}</span>
                  </div>

                  <Link href={`/blog/${post.slug || post.id}`}>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#A58454] transition-colors leading-snug mb-2 line-clamp-2">
                      {language === 'ar' ? post.titleAr : post.titleEn}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-sans mb-3">
                    {language === 'ar' ? post.excerptAr : post.excerptEn}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#8C6D3F]">
                  <Link href={`/blog/${post.slug || post.id}`} className="flex items-center gap-1 hover:underline">
                    <span>{t('اقرأ الدليل كاملاً', 'Read Full Guide')}</span>
                    {language === 'ar' ? (
                      <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    )}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="py-16 text-center">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">
              {t('لا توجد مقالات مطابقة لبحثك', 'No matching articles found')}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {t('جرّب البحث بكلمات أخرى أو عرض كافة المقالات.', 'Try searching with other keywords or clear filter.')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              {t('عرض جميع المقالات', 'Show All Articles')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
