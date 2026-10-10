'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Mail,
  Send,
  Phone,
  MapPin,
  CheckCircle,
  Award,
  ChevronLeft,
  ChevronDown,
  User,
  BookOpen,
  Receipt,
  HelpCircle,
  ShieldCheck,
  Headphones,
  Instagram,
  Facebook,
  Shield,
  Truck,
  RotateCcw,
  Lock,
  Circle,
  Smile,
} from 'lucide-react';
import Logo from '@/components/Logo';
import Image from 'next/image';
import {
  MadaIcon,
  TabbyIcon,
  VisaIcon,
  StcPayIcon,
  SamsungPayIcon,
  ApplePayIcon,
  MastercardIcon,
  TamaraIcon,
} from '@/components/PaymentIcons';

// Vector SVG Brand Icons for Social Media (Exact & Authentic Brand Vectors)
export const TwitterXIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const TikTokIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.29 0 .58.04.85.12V9.34a6.32 6.32 0 0 0-1-.08 6.34 6.32 0 1 0 6.34 6.34V9.28a8.28 8.28 0 0 0 4.92 1.61V7.44a4.85 4.85 0 0 1-1-.75z" />
  </svg>
);

export const SnapchatIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12.002 2c-3.32 0-5.833 2.378-5.833 5.371 0 .902.366 2.181.868 3.203.147.3.178.412.065.556-.094.118-.3.209-.613.29-.499.13-1.082.128-1.528.307-.401.16-.512.463-.43.823.121.538.81.85 1.465 1.148.385.175.528.317.432.584-.156.488-.865 1.625-1.232 2.192-.308.476-.498.771-.129 1.05.244.17.566.186.92.186.473 0 .986-.03 1.458-.122.49-.096.64.07.735.408.26 1.03 1.01 1.543 2.12 1.543.43 0 .855-.09 1.264-.268.267-.116.412-.116.678 0 .409.178.834.268 1.264.268 1.11 0 1.86-.513 2.12-1.543.095-.338.245-.504.735-.408.472.092.985.122 1.458.122.354 0 .676-.016.92-.186.369-.279.179-.574-.129-1.05-.367-.567-1.076-1.704-1.232-2.192-.096-.267.047-.409.432-.584.655-.298 1.344-.61 1.465-1.148.082-.36-.029-.663-.43-.823-.446-.179-1.029-.177-1.528-.307-.313-.081-.519-.172-.613-.29-.113-.144-.082-.256.065-.556.502-1.022.868-2.301.868-3.203C17.835 4.378 15.322 2 12.002 2z" />
  </svg>
);

export const FacebookIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

export const InstagramIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const NewsletterAndFooter: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const {
    country,
    language,
    t,
    setActiveCategory,
    setIsTrackOrderOpen,
    setIsVipModalOpen,
    categoryConfigs,
    settings,
  } = useApp();

  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Mobile accordions toggle state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    quickLinks: false,
    shop: false,
    contact: false,
    payments: false,
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setIsSubscribed(true);
    setEmail('');
  };

  const handleCategoryNav = (cat: string) => {
    setActiveCategory(cat);
    router.push(`/${cat}`);
  };

  const footerShopCategories = React.useMemo(() => {
    const list = (categoryConfigs || []).filter((c) => Boolean(c.showInHeaderNav));
    const seen = new Set<string>();
    const uniqueList: typeof list = [];
    list.forEach((c) => {
      if (c.slug && !seen.has(c.slug)) {
        seen.add(c.slug);
        uniqueList.push(c);
      }
    });

    return uniqueList.map((c) => ({
      slug: c.slug,
      title: language === 'ar' ? c.nameAr : (c.nameEn || c.nameAr),
    }));
  }, [categoryConfigs, language]);

  // Visibility helpers based on admin configurations
  const hasSocials = !!(
    settings.facebookLink ||
    settings.twitterLink ||
    settings.instagramLink ||
    settings.tiktokLink ||
    settings.snapchatLink
  );

  const hasContact = !!(settings.supportEmail || settings.phoneNumber || settings.address);
  const hasMaroof = !!settings.maroofNumber;
  const hasTax = !!settings.taxNumber;

  return (
    <footer className="bg-[#0B111E] text-slate-400 font-sans border-t border-slate-900 select-none">
      {/* ========================================================================= */}
      {/* DESKTOP LAYOUT (Image 1 Reference) */}
      {/* ========================================================================= */}
      <div className="hidden md:block max-w-7xl mx-auto px-6 pt-12 pb-8">
        <div className="grid grid-cols-12 gap-8 mb-12">
          {/* Brand Info & Certificates Column */}
          <div className="col-span-4 space-y-5">
            {/* Two-colored Logo */}
            <div className="flex items-center">
              <Logo textColor="text-white" iconColor="text-[#A58454]" />
            </div>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-sm">
              {t(
                'الوجهة الأولى للنظارات العصرية والعدسات الطبية.',
                'The premier destination for modern eyewear and premium prescription lenses.'
              )}
            </p>

            {/* Social Icons Row */}
            {hasSocials && (
              <div className="flex items-center gap-3 pt-2">
                {settings.instagramLink && (
                  <a
                    href={settings.instagramLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 hover:border-[#A58454] transition-all text-slate-200 shadow-md group shrink-0"
                    title="Instagram"
                  >
                    <InstagramIcon className="w-5 h-5" />
                  </a>
                )}
                {settings.twitterLink && (
                  <a
                    href={settings.twitterLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 hover:border-[#A58454] transition-all text-slate-200 shadow-md group shrink-0"
                    title="X (Twitter)"
                  >
                    <TwitterXIcon className="w-5 h-5" />
                  </a>
                )}
                {settings.facebookLink && (
                  <a
                    href={settings.facebookLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 hover:border-[#A58454] transition-all text-slate-200 shadow-md group shrink-0"
                    title="Facebook"
                  >
                    <FacebookIcon className="w-5 h-5" />
                  </a>
                )}
                {settings.tiktokLink && (
                  <a
                    href={settings.tiktokLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 hover:border-[#A58454] transition-all text-slate-200 shadow-md group shrink-0"
                    title="TikTok"
                  >
                    <TikTokIcon className="w-5 h-5" />
                  </a>
                )}
                {settings.snapchatLink && (
                  <a
                    href={settings.snapchatLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 hover:border-[#A58454] transition-all text-slate-200 shadow-md group shrink-0"
                    title="Snapchat"
                  >
                    <SnapchatIcon className="w-5 h-5" />
                  </a>
                )}
              </div>
            )}

            {/* Saudi Business Center Badge */}
            {(hasMaroof || hasTax) && (
              <div className="space-y-3 pt-4 border-t border-slate-900">
                <div className="flex items-center gap-2 text-[#A58454] font-bold text-sm sm:text-base">
                  <ShieldCheck className="w-5 h-5 text-[#A58454] shrink-0" />
                  <span>{t('موثق من المركز السعودي للأعمال', 'Verified Saudi Business Center')}</span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Marouf/Maroof Badge Image & Number */}
                  {hasMaroof && (
                    <div className="flex items-center gap-2.5 bg-[#111827] border border-slate-800 p-2.5 rounded-xl shrink-0">
                      {settings.maroofImage ? (
                        <div className="relative w-9 h-9 rounded overflow-hidden shrink-0">
                          <Image
                            src={settings.maroofImage}
                            alt="Maroof Certification"
                            fill
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded bg-[#7A3F95] flex items-center justify-center text-xs text-white font-bold font-mono shrink-0">M</div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase leading-none mb-1">رقم التوثيق:</p>
                        <p className="text-xs sm:text-sm text-white font-bold font-mono leading-tight">{settings.maroofNumber}</p>
                      </div>
                    </div>
                  )}

                  {/* Tax Certificate Badge Image & Number */}
                  {hasTax && (
                    <div className="flex items-center gap-2.5 bg-[#111827] border border-slate-800 p-2.5 rounded-xl shrink-0">
                      {settings.taxImage ? (
                        <div className="relative w-9 h-9 rounded overflow-hidden shrink-0">
                          <Image
                            src={settings.taxImage}
                            alt="VAT Certification"
                            fill
                            className="object-contain"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded bg-teal-600 flex items-center justify-center text-xs text-white font-bold font-mono shrink-0">TAX</div>
                      )}
                      <div className="text-right">
                        <p className="text-[10px] sm:text-xs text-slate-400 font-medium uppercase leading-none mb-1">الرقم الضريبي:</p>
                        <p className="text-xs sm:text-sm text-white font-bold font-mono leading-tight">{settings.taxNumber}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Column 2: Quick Links (روابط هامة) */}
          <div className="col-span-3 space-y-4">
            <div>
              <h3 className="text-[#A58454] font-bold text-sm sm:text-base tracking-wide">{t('روابط هامة', 'Quick Links')}</h3>
              <div className="w-8 h-0.5 bg-[#A58454] mt-1.5" />
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <div className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-400 group-hover:text-[#A58454] transition-colors" />
                    <span>{t('من نحن', 'About Us')}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start group">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-slate-400 group-hover:text-[#A58454] transition-colors" />
                    <span>{t('المدونة', 'Blog')}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </Link>
              </li>
              <li>
                <button onClick={() => setIsTrackOrderOpen(true)} className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start group">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400 group-hover:text-[#A58454] transition-colors" />
                    <span>{t('تتبع الطلب', 'Track Order')}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </button>
              </li>
              <li>
                <div className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-400 group-hover:text-[#A58454] transition-colors" />
                    <span>{t('اتصل بنا', 'Contact Us')}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </li>
              <li>
                <div className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400 group-hover:text-[#A58454] transition-colors" />
                    <span>{t('الأسئلة الشائعة', 'FAQs')}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </li>
              <li>
                <div className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start cursor-pointer group">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-slate-400 group-hover:text-[#A58454] transition-colors" />
                    <span>{t('الشروط والسياسات', 'Terms & Policies')}</span>
                  </div>
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                </div>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop Categories (تسوق) */}
          <div className="col-span-2 space-y-4">
            <div>
              <h3 className="text-[#A58454] font-bold text-sm sm:text-base tracking-wide">{t('تسوق', 'Shop')}</h3>
              <div className="w-8 h-0.5 bg-[#A58454] mt-1.5" />
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm">
              {footerShopCategories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => handleCategoryNav(cat.slug)}
                    className="hover:text-white transition-colors text-slate-300 flex items-center justify-between w-full text-start group cursor-pointer"
                  >
                    <span>{cat.title}</span>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Us (تواصل معنا) */}
          <div className="col-span-3 space-y-4">
            <div>
              <h3 className="text-[#A58454] font-bold text-sm sm:text-base tracking-wide">{t('تواصل معنا', 'Contact Us')}</h3>
              <div className="w-8 h-0.5 bg-[#A58454] mt-1.5" />
            </div>

            <ul className="space-y-3.5 text-xs sm:text-sm">
              {settings.supportEmail && (
                <li className="flex items-center justify-between group">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-[#A58454] mb-0.5 uppercase tracking-wider">{t('الدعم', 'Support')}</span>
                    <span className="text-slate-300 text-xs sm:text-sm font-medium block">{settings.supportEmail}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0 group-hover:border-[#A58454] transition-colors">
                      <Headphones className="w-4 h-4 text-[#A58454]" />
                    </div>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </div>
                </li>
              )}

              {settings.phoneNumber && (
                <li className="flex items-center justify-between group">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-[#A58454] mb-0.5 uppercase tracking-wider">{t('الهاتف', 'Phone')}</span>
                    <span className="text-slate-300 text-xs sm:text-sm font-medium font-mono block" dir="ltr">{settings.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0 group-hover:border-[#A58454] transition-colors">
                      <Phone className="w-4 h-4 text-[#A58454]" />
                    </div>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </div>
                </li>
              )}

              {settings.address && (
                <li className="flex items-center justify-between group">
                  <div className="text-right">
                    <span className="block text-xs font-bold text-[#A58454] mb-0.5 uppercase tracking-wider">{t('العنوان', 'Address')}</span>
                    <span className="text-slate-300 text-xs leading-relaxed block max-w-[180px]">{settings.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 shrink-0 group-hover:border-[#A58454] transition-colors">
                      <MapPin className="w-4 h-4 text-[#A58454]" />
                    </div>
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-300 transition-colors" />
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Newsletter Subscription Box (Image 1 centered card style) - Rendered on Home Page Only */}
        {isHomePage && (
          <div className="bg-[#111827] border border-slate-800 rounded-3xl p-8 sm:p-10 max-w-4xl mx-auto my-10 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full border-2 border-[#A58454] flex items-center justify-center text-[#A58454] mb-1">
                <Mail className="w-5 h-5" />
              </div>

              <h3 className="text-[#A58454] font-bold text-xl sm:text-2xl font-kufi">
                {t('اشترك في نشرتنا البريدية', 'Join Our Newsletter')}
              </h3>

              <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                {t(
                  'كن أول من يعرف عن جديدنا والعروض الحصرية والمزايا الخاصة.',
                  'Be the first to hear about new collections, private offers, and special rewards.'
                )}
              </p>

              {isSubscribed ? (
                <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-center gap-2 max-w-md mx-auto">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>{t('شكراً لاشتراكك! تم إرسال كود الخصم الترحيبي بنجاح.', 'Thank you! Check your inbox for your welcome discount.')}</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="relative max-w-lg mx-auto pt-2">
                  <div className="relative flex items-center rounded-xl bg-[#0B111E] border border-slate-700/80 overflow-hidden focus-within:border-[#A58454] h-12">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t('البريد الإلكتروني...', 'Enter your email...')}
                      className="flex-1 bg-transparent px-4 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none text-start"
                    />
                    <button
                      type="submit"
                      className="px-6 h-full bg-[#C5A880] hover:bg-[#A58454] text-slate-950 font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2.5">
                    {t('نحن نحترم خصوصيتك ولا نرسل رسائل مزعجة.', 'We respect your privacy. No spam guaranteed.')}
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Bottom Bar: Payments & Features inside Dark Container Card (Image 3 Reference) */}
        <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 my-8 shadow-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 divide-y lg:divide-y-0 lg:divide-x lg:divide-x-reverse divide-slate-800/80">
            {/* Features Badges (Right side in RTL) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full lg:w-auto flex-1 pb-4 lg:pb-0">
              <div className="flex items-center gap-2.5 text-right">
                <Shield className="w-5 h-5 text-[#A58454] shrink-0" />
                <div className="leading-tight">
                  <h4 className="font-bold text-white text-xs mb-0.5">{t('أصالة يمكنك الوثوق بها', '100% Authentic')}</h4>
                  <p className="text-[10px] text-slate-500">{t('منتجات أصلية مختارة بعناية', 'Handpicked original brands')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-right">
                <RotateCcw className="w-5 h-5 text-[#A58454] shrink-0" />
                <div className="leading-tight">
                  <h4 className="font-bold text-white text-xs mb-0.5">{t('تسوق براحة تامة', 'Easy Return')}</h4>
                  <p className="text-[10px] text-slate-500">{t('إرجاع واستبدال بسهولة', 'Flexible return policy')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-right">
                <Lock className="w-5 h-5 text-[#A58454] shrink-0" />
                <div className="leading-tight">
                  <h4 className="font-bold text-white text-xs mb-0.5">{t('دفع آمن وأمن', 'Secure Payments')}</h4>
                  <p className="text-[10px] text-slate-500">{t('خيارات دفع موثوقة ومحمية', 'Protected & encrypted')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-right">
                <Truck className="w-5 h-5 text-[#A58454] shrink-0" />
                <div className="leading-tight">
                  <h4 className="font-bold text-white text-xs mb-0.5">{t('نوصل إلى الخليج بسرعة', 'Fast GCC Delivery')}</h4>
                  <p className="text-[10px] text-slate-500">{t('شحن موثوق إلى جميع دول الخليج', 'GCC shipping')}</p>
                </div>
              </div>
            </div>

            {/* Payment Icons (Left side in RTL) */}
            <div className="flex items-center gap-3 pt-4 lg:pt-0 lg:ps-6 shrink-0 w-full lg:w-auto justify-between lg:justify-end">
              <span className="text-xs text-slate-400 font-bold shrink-0">{t('نحن نقبل:', 'WE ACCEPT')}</span>
              <div className="flex items-center gap-2 flex-wrap">
                <TamaraIcon className="h-7 w-auto shrink-0" />
                <TabbyIcon className="h-7 w-auto shrink-0" />
                <VisaIcon className="h-7 w-auto shrink-0" />
                <StcPayIcon className="h-7 w-auto shrink-0" />
                <SamsungPayIcon className="h-7 w-auto shrink-0" />
                <MastercardIcon className="h-7 w-auto shrink-0" />
                <ApplePayIcon className="h-7 w-auto shrink-0" />
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Copyright Bottom Row */}
        <div className="border-t border-slate-900/80 pt-6 pb-2 flex items-center justify-between text-xs text-slate-500">
          <p>© 2026 {t('لنس كود. جميع الحقوق محفوظة.', 'LensCode. All rights reserved.')}</p>
          <div className="flex items-center gap-2">
            <span className="text-[#A58454] font-bold text-sm border border-[#A58454]/60 px-1.5 py-0.5 rounded">[C]</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE LAYOUT (Image 2 Reference) */}
      {/* ========================================================================= */}
      <div className="block md:hidden max-w-md mx-auto px-4 py-8 space-y-6">
        {/* Brand Information & Socials */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center">
            <Logo textColor="text-white" iconColor="text-[#A58454]" />
          </div>

          <p className="text-slate-300 text-xs sm:text-sm max-w-xs mx-auto leading-relaxed">
            {t(
              'الوجهة الأولى للنظارات العصرية والعدسات الطبية.',
              'The premier destination for modern eyewear and premium prescription lenses.'
            )}
          </p>

          {/* Social Row */}
          {hasSocials && (
            <div className="flex items-center justify-center gap-3 pt-2">
              {settings.instagramLink && (
                <a
                  href={settings.instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 transition-colors text-slate-200"
                >
                  <InstagramIcon className="w-5 h-5" />
                </a>
              )}
              {settings.twitterLink && (
                <a
                  href={settings.twitterLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 transition-colors text-slate-200"
                >
                  <TwitterXIcon className="w-5 h-5" />
                </a>
              )}
              {settings.facebookLink && (
                <a
                  href={settings.facebookLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 transition-colors text-slate-200"
                >
                  <FacebookIcon className="w-5 h-5" />
                </a>
              )}
              {settings.tiktokLink && (
                <a
                  href={settings.tiktokLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 transition-colors text-slate-200"
                >
                  <TikTokIcon className="w-5 h-5" />
                </a>
              )}
              {settings.snapchatLink && (
                <a
                  href={settings.snapchatLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-[#111827] border border-slate-800 flex items-center justify-center hover:bg-[#A58454] hover:text-slate-950 transition-colors text-slate-200"
                >
                  <SnapchatIcon className="w-5 h-5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Mobile Newsletter Sub Box - Rendered on Home Page Only */}
        {isHomePage && (
          <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 text-center space-y-3.5">
            <div className="mx-auto w-11 h-11 rounded-full border border-[#A58454] flex items-center justify-center text-[#A58454]">
              <Mail className="w-5 h-5" />
            </div>

            <h3 className="text-white font-bold text-base sm:text-lg font-kufi">
              {t('اشترك في نشرتنا البريدية', 'Join Our Newsletter')}
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
              {t(
                'كن أول من يعرف عن جديدنا والعروض الحصرية والمزايا الخاصة.',
                'Be the first to hear about new collections, private offers, and special rewards.'
              )}
            </p>

            {isSubscribed ? (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 text-xs flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>{t('تم التسجيل بنجاح!', 'Subscribed successfully!')}</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="relative pt-1">
                <div className="relative flex items-center rounded-lg bg-[#0B111E] border border-slate-700 overflow-hidden focus-within:border-[#A58454] h-11">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('البريد الإلكتروني...', 'Enter your email...')}
                    className="flex-1 bg-transparent px-3.5 text-xs text-white placeholder:text-slate-500 outline-none text-start"
                  />
                  <button
                    type="submit"
                    className="px-4 h-full bg-[#A58454] text-slate-950 font-bold shrink-0 flex items-center justify-center"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Collapsible Accordions (Image 2 layout style) */}
        <div className="border-y border-slate-900 divide-y divide-slate-900/60 text-xs sm:text-sm">
          {/* Accordion 1: Quick Links */}
          <div className="py-2">
            <button
              onClick={() => toggleAccordion('quickLinks')}
              className="w-full flex items-center justify-between text-[#A58454] font-bold py-1.5 text-start font-kufi text-sm"
            >
              <span>{t('روابط هامة', 'Quick Links')}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.quickLinks ? 'rotate-180' : ''}`} />
            </button>

            {openAccordions.quickLinks && (
              <ul className="space-y-2.5 pt-2 pb-1 text-slate-300 text-xs sm:text-sm">
                <li><span className="cursor-pointer hover:text-white">{t('من نحن', 'About Us')}</span></li>
                <li><Link href="/blog" className="hover:text-white">{t('المدونة', 'Blog')}</Link></li>
                <li><button onClick={() => setIsTrackOrderOpen(true)} className="hover:text-white">{t('تتبع الطلب', 'Track Order')}</button></li>
                <li><span className="cursor-pointer hover:text-white">{t('اتصل بنا', 'Contact')}</span></li>
                <li><span className="cursor-pointer hover:text-white">{t('الأسئلة الشائعة', 'FAQs')}</span></li>
                <li><span className="cursor-pointer hover:text-white">{t('الشروط والسياسات', 'Terms & Policies')}</span></li>
              </ul>
            )}
          </div>

          {/* Accordion 2: Shop */}
          <div className="py-2">
            <button
              onClick={() => toggleAccordion('shop')}
              className="w-full flex items-center justify-between text-[#A58454] font-bold py-1.5 text-start font-kufi text-sm"
            >
              <span>{t('تسوق الأقسام', 'Shop')}</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.shop ? 'rotate-180' : ''}`} />
            </button>

            {openAccordions.shop && (
              <ul className="space-y-2.5 pt-2 pb-1 text-slate-300 text-xs sm:text-sm">
                {footerShopCategories.map((cat) => (
                  <li key={cat.slug}>
                    <button
                      onClick={() => handleCategoryNav(cat.slug)}
                      className="hover:text-white transition-colors cursor-pointer text-start w-full"
                    >
                      {cat.title}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Accordion 3: Contact */}
          {hasContact && (
            <div className="py-2">
              <button
                onClick={() => toggleAccordion('contact')}
                className="w-full flex items-center justify-between text-[#A58454] font-bold py-1.5 text-start font-kufi text-sm"
              >
                <span>{t('تواصل معنا', 'Contact Us')}</span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${openAccordions.contact ? 'rotate-180' : ''}`} />
              </button>

              {openAccordions.contact && (
                <ul className="space-y-2.5 pt-2 pb-1 text-slate-300 text-xs sm:text-sm">
                  {settings.supportEmail && <li><span>{t('الدعم:', 'Support:')} {settings.supportEmail}</span></li>}
                  {settings.phoneNumber && <li><span>{t('الهاتف:', 'Phone:')} {settings.phoneNumber}</span></li>}
                  {settings.address && <li><span>{t('العنوان:', 'Address:')} {settings.address}</span></li>}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Saudi Business Center Badge (Mobile) */}
        {(hasMaroof || hasTax) && (
          <div className="space-y-3 bg-[#111827] border border-slate-800 p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-1.5 text-[#A58454] font-bold text-xs">
              <Award className="w-4 h-4 text-[#A58454] shrink-0" />
              <span>{t('موثق من المركز السعودي للأعمال', 'Verified by SBC')}</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              {hasMaroof && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                  <div className="text-right">
                    <p className="text-[6px] text-slate-500 uppercase leading-none">رقم التوثيق</p>
                    <p className="text-[8px] text-[#A58454] font-bold font-mono leading-none">{settings.maroofNumber}</p>
                  </div>
                  {settings.maroofImage ? (
                    <div className="relative w-6 h-6 rounded overflow-hidden">
                      <Image
                        src={settings.maroofImage}
                        alt="Maroof Certification"
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-[#7A3F95] flex items-center justify-center text-[7px] text-white font-bold font-mono">M</div>
                  )}
                </div>
              )}

              {hasTax && (
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1.5 rounded-lg">
                  <div className="text-right">
                    <p className="text-[6px] text-slate-500 uppercase leading-none">الرقم الضريبي</p>
                    <p className="text-[8px] text-emerald-400 font-bold font-mono leading-none">{settings.taxNumber}</p>
                  </div>
                  {settings.taxImage ? (
                    <div className="relative w-6 h-6 rounded overflow-hidden">
                      <Image
                        src={settings.taxImage}
                        alt="VAT Certification"
                        fill
                        className="object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded bg-teal-600 flex items-center justify-center text-[7px] text-white font-bold font-mono">TAX</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mobile Copyright & Bottom */}
        <div className="pt-2 text-center text-[10px] text-slate-600 space-y-1">
          <p>© 2026 {t('لنس كود. جميع الحقوق محفوظة.', 'LensCode. All rights reserved.')}</p>
        </div>
      </div>
    </footer>
  );
};
