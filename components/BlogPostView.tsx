'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useApp } from '@/context/AppContext';
import { SeoHead } from '@/components/SeoHead';
import {
  Clock,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  BookOpen,
  Eye,
  ShieldCheck,
  MessageCircle,
} from 'lucide-react';

export const BlogPostView: React.FC<{ slug: string }> = ({ slug }) => {
  const { blogPosts, language, t, currentCountryInfo } = useApp();
  const [copied, setCopied] = useState(false);

  const cleanSlug = decodeURIComponent(slug).toLowerCase().trim();

  // Find matching blog post
  const post = useMemo(() => {
    return (
      blogPosts.find(
        (p) =>
          (p.slug && p.slug.toLowerCase().trim() === cleanSlug) ||
          (p.id && p.id.toLowerCase().trim() === cleanSlug)
      ) || blogPosts[0]
    );
  }, [blogPosts, cleanSlug]);

  // Related posts (excluding current)
  const relatedPosts = useMemo(() => {
    return blogPosts.filter((p) => p.id !== post.id).slice(0, 3);
  }, [blogPosts, post.id]);

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    if (typeof window !== 'undefined') {
      const text = `${language === 'ar' ? post.titleAr : post.titleEn}\n${window.location.href}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const postTitle = language === 'ar' ? (post.seoTitleAr || post.titleAr) : (post.seoTitleEn || post.titleEn);
  const postDesc = language === 'ar' ? (post.seoDescAr || post.excerptAr) : (post.seoDescEn || post.excerptEn);
  const postCategory = language === 'ar' ? (post.categoryAr || post.category) : (post.categoryEn || post.category);
  const postContent = language === 'ar' ? post.contentAr : post.contentEn;

  // JSON-LD Article Schema
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: language === 'ar' ? post.titleAr : post.titleEn,
    description: language === 'ar' ? post.excerptAr : post.excerptEn,
    image: post.coverImage,
    datePublished: post.date,
    dateModified: post.date,
    author: {
      '@type': 'Organization',
      name: 'LensCode Medical Optical Board',
      url: 'https://lenscode.sa',
    },
    publisher: {
      '@type': 'Organization',
      name: 'LensCode',
      logo: {
        '@type': 'ImageObject',
        url: 'https://lenscode.sa/images/hero_national_day.webp',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://lenscode.sa/blog/${post.slug || post.id}`,
    },
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      {/* Dynamic SEO Head configured from admin inputs */}
      <SeoHead
        title={postTitle}
        description={postDesc}
        keywords={post.seoKeywords}
      />

      {/* JSON-LD Schema */}
      {post.schemaJson ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: post.schemaJson }}
        />
      ) : (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
      )}

      {/* Breadcrumbs */}
      <div className="bg-white border-b border-slate-100 py-3 sm:py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
            <Link href="/" className="hover:text-slate-900 transition-colors shrink-0">
              {t('الرئيسية', 'Home')}
            </Link>
            {language === 'ar' ? (
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <Link href="/blog" className="hover:text-slate-900 transition-colors shrink-0">
              {t('المدونة', 'Blog')}
            </Link>
            {language === 'ar' ? (
              <ChevronLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            )}
            <span className="text-slate-900 font-semibold truncate">
              {language === 'ar' ? post.titleAr : post.titleEn}
            </span>
          </nav>
        </div>
      </div>

      {/* Article Container */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Header Metadata */}
        <header className="mb-6 sm:mb-8 text-start">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-3 sm:mb-4">
            <span className="px-3 py-1 rounded-full bg-amber-50 text-[#8C6D3F] border border-[#A58454]/30 font-bold text-xs">
              {postCategory}
            </span>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.date}</span>
            </div>
            <span>·</span>
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.readTime}</span>
            </div>
            {post.author && (
              <>
                <span>·</span>
                <span className="font-semibold text-slate-700">
                  {language === 'ar' ? `بقلم: ${post.author}` : `By: ${post.author}`}
                </span>
              </>
            )}
          </div>

          <h1 className="text-xl sm:text-3xl lg:text-4xl font-bold font-kufi text-slate-900 leading-tight sm:leading-snug mb-4">
            {language === 'ar' ? post.titleAr : post.titleEn}
          </h1>

          <p className="text-xs sm:text-base text-slate-600 leading-relaxed font-sans bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            {language === 'ar' ? post.excerptAr : post.excerptEn}
          </p>
        </header>

        {/* Featured Cover Image */}
        <div className="relative w-full h-56 sm:h-96 lg:h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm mb-8 bg-slate-100">
          <Image
            src={post.coverImage}
            alt={language === 'ar' ? (post.coverImageAltAr || post.titleAr) : (post.coverImageAltEn || post.titleEn)}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            referrerPolicy="no-referrer"
            className="object-cover"
          />
        </div>

        {/* Article Body Content */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10 border border-slate-200/80 shadow-xs">
          {/* Rich Content rendering (Supports HTML from admin visual editor) */}
          <div
            className="prose prose-slate max-w-none text-slate-800 text-sm sm:text-base leading-relaxed font-sans space-y-4"
            dangerouslySetInnerHTML={{ __html: postContent }}
          />

          {/* Expert Optometry Advice Callout */}
          <div className="mt-8 p-4 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-50/80 to-orange-50/40 border border-[#A58454]/30 flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-[#A58454]/20 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5 text-[#8C6D3F]" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-[#5F4622] mb-1 font-kufi">
                {t('ملاحظة طبية معتمدة من استشاري البصريات:', 'Certified Medical Optometry Note:')}
              </h4>
              <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                {t(
                  'المعلومات الواردة في هذا الدليل مراجعة من قِبل أخصائيي البصريات المعتمدين في لِـنس كود. ننصح بإجراء فحص نظر دوري كل 6 إلى 12 شهراً للتأكد من سلامة القرنية وتحديث مقاس العدسات.',
                  'The medical information in this guide is reviewed by certified optometrists at LensCode. We recommend periodic vision checkups every 6-12 months.'
                )}
              </p>
            </div>
          </div>

          {/* Share Actions Bar */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Share2 className="w-4 h-4 text-[#A58454]" />
              <span>{t('شارك المقال مع أصدقائك:', 'Share this article:')}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{t('واتساب', 'WhatsApp')}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer border border-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? t('تم النسخ!', 'Copied!') : t('نسخ الرابط', 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Related Articles Section */}
        {relatedPosts.length > 0 && (
          <div className="mt-12 sm:mt-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base sm:text-xl font-bold font-kufi text-slate-900">
                {t('مقالات وأدلة ذات صلة', 'Related Guides & Articles')}
              </h3>
              <Link
                href="/blog"
                className="text-xs font-bold text-[#8C6D3F] hover:underline flex items-center gap-1"
              >
                <span>{t('عرض جميع المقالات', 'View All')}</span>
                {language === 'ar' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              {relatedPosts.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/blog/${rel.slug || rel.id}`}
                  className="group bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col"
                >
                  <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                    <Image
                      src={rel.coverImage}
                      alt={language === 'ar' ? rel.titleAr : rel.titleEn}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      referrerPolicy="no-referrer"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#A58454] transition-colors line-clamp-2 leading-snug mb-2">
                      {language === 'ar' ? rel.titleAr : rel.titleEn}
                    </h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{rel.readTime}</span>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
};
