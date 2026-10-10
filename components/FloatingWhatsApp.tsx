'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { Headphones, Phone, Mail, MessageCircle, X, ArrowUpRight } from 'lucide-react';

export const FloatingWhatsApp: React.FC = () => {
  const { language, t, settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Smart scroll detection: Hide when scrolling down, reveal when stopped or scrolling up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 120) {
        // Scrolling down
        setIsVisible(false);
        setIsOpen(false);
      } else {
        // Scrolling up
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;

      // Show back after user stops scrolling for 1.2s
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, 1200);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  // Filter available methods strictly from settings configured in Admin Dashboard
  const contactMethods = useMemo(() => {
    const methods: Array<{
      id: 'whatsapp' | 'phone' | 'email';
      titleAr: string;
      titleEn: string;
      subtitleAr: string;
      subtitleEn: string;
      icon: React.ComponentType<{ className?: string }>;
      href: string;
      isExternal?: boolean;
    }> = [];

    // 1. WhatsApp
    const wa = (settings?.whatsAppNumber || '').trim();
    if (wa) {
      const cleanWa = wa.replace(/[^0-9]/g, '');
      const defaultMsg = encodeURIComponent(
        language === 'ar'
          ? 'مرحباً، أود الاستفسار عن منتجات وخدمات لِـنس كود.'
          : 'Hello, I would like to inquire about LensCode eyewear and lenses.'
      );
      methods.push({
        id: 'whatsapp',
        titleAr: 'محادثة واتساب',
        titleEn: 'WhatsApp Chat',
        subtitleAr: 'تواصل فوري مع أخصائي البصريات',
        subtitleEn: 'Instant chat with optical specialist',
        icon: MessageCircle,
        href: `https://wa.me/${cleanWa}?text=${defaultMsg}`,
        isExternal: true,
      });
    }

    // 2. Phone
    const phone = (settings?.phoneNumber || '').trim();
    if (phone) {
      methods.push({
        id: 'phone',
        titleAr: 'اتصال هاتفي مباشر',
        titleEn: 'Direct Phone Call',
        subtitleAr: phone,
        subtitleEn: phone,
        icon: Phone,
        href: `tel:${phone}`,
      });
    }

    // 3. Email
    const email = (settings?.supportEmail || '').trim();
    if (email) {
      methods.push({
        id: 'email',
        titleAr: 'البريد الإلكتروني',
        titleEn: 'Email Support',
        subtitleAr: email,
        subtitleEn: email,
        icon: Mail,
        href: `mailto:${email}?subject=${encodeURIComponent(
          language === 'ar' ? 'استفسار - لِـنس كود' : 'Inquiry - LensCode'
        )}`,
      });
    }

    return methods;
  }, [settings, language]);

  // If no contact methods are configured by the admin in settings, do not render anything
  if (contactMethods.length === 0) return null;

  return (
    <aside
      aria-label="Floating Contact"
      className={`fixed bottom-20 sm:bottom-6 end-4 sm:end-6 z-40 select-none transition-all duration-300 ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-6 pointer-events-none'
      }`}
    >
      {/* Contact Options Popover Window */}
      {isOpen && (
        <div className="absolute bottom-14 end-0 w-64 sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 overflow-hidden animate-slideUp mb-1.5 p-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#A58454] animate-pulse" />
              <span className="text-xs font-bold font-kufi text-slate-800">
                {t('تواصل معنا', 'Contact Us')}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors cursor-pointer"
              title={t('إغلاق', 'Close')}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Contact Methods List */}
          <div className="space-y-1.5">
            {contactMethods.map((method) => {
              const Icon = method.icon;
              return (
                <a
                  key={method.id}
                  href={method.href}
                  target={method.isExternal ? '_blank' : undefined}
                  rel={method.isExternal ? 'noopener noreferrer' : undefined}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#A58454]/10 border border-slate-100 hover:border-[#A58454]/30 transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-[#A58454] text-slate-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-slate-800 group-hover:text-[#A58454] truncate transition-colors">
                      {language === 'ar' ? method.titleAr : method.titleEn}
                    </p>
                    <p className="text-[9px] text-slate-400 truncate dir-ltr text-start">
                      {language === 'ar' ? method.subtitleAr : method.subtitleEn}
                    </p>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#A58454] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button - Small Icon Only with Muted Matte Luxury Identity */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#2C2825]/90 hover:bg-[#3E3830] text-[#D8C7B0] hover:text-white border border-[#A58454]/30 hover:border-[#A58454]/60 shadow-md hover:shadow-lg backdrop-blur-xs flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group"
        title={t('تواصل معنا', 'Contact Us')}
        aria-label="Contact Us"
      >
        {isOpen ? (
          <X className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-200" />
        ) : (
          <Headphones className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#C5A880] group-hover:scale-110 transition-transform duration-200" />
        )}
      </button>
    </aside>
  );
};

