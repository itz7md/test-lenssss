'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, X } from 'lucide-react';
import Image from 'next/image';

interface RealProofItem {
  id: string;
  name: string;
  city: string;
  itemTitle: string;
  image: string;
}

export const SocialProofToast: React.FC = () => {
  const { t } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const [proof, setProof] = useState<RealProofItem | null>(null);

  useEffect(() => {
    // Only show ONCE per browser session
    try {
      const hasBeenShown = sessionStorage.getItem('lc_real_purchase_notified');
      if (hasBeenShown === 'true') return;
    } catch {}

    // Check if a real order was just placed in this session (e.g. redirected from payment)
    const checkSessionPurchase = () => {
      try {
        const stored = sessionStorage.getItem('lc_latest_real_purchase');
        if (stored) {
          const parsed = JSON.parse(stored) as RealProofItem;
          if (parsed && parsed.name) {
            setProof(parsed);
            sessionStorage.removeItem('lc_latest_real_purchase');
            sessionStorage.setItem('lc_real_purchase_notified', 'true');
            const timer = setTimeout(() => {
              setIsVisible(true);
            }, 1200);
            return () => clearTimeout(timer);
          }
        }
      } catch {}
    };

    const cleanup = checkSessionPurchase();

    // Listen for real order completion event in the current session
    const handleOrderCompleted = (event: Event) => {
      try {
        const alreadyNotified = sessionStorage.getItem('lc_real_purchase_notified');
        if (alreadyNotified === 'true') return;

        const customEvent = event as CustomEvent<RealProofItem>;
        if (!customEvent.detail) return;

        setProof(customEvent.detail);
        sessionStorage.setItem('lc_real_purchase_notified', 'true');

        setTimeout(() => {
          setIsVisible(true);
        }, 1000);
      } catch {}
    };

    window.addEventListener('lenscode_order_completed', handleOrderCompleted);

    return () => {
      window.removeEventListener('lenscode_order_completed', handleOrderCompleted);
      if (cleanup) cleanup();
    };
  }, []);

  // Auto hide after 6.5 seconds once visible
  useEffect(() => {
    if (!isVisible) return;
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 6500);
    return () => clearTimeout(hideTimer);
  }, [isVisible]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem('lc_real_purchase_notified', 'true');
    } catch {}
  };

  if (!isVisible || !proof) return null;

  return (
    <aside
      aria-label="Verified Customer Purchase Activity"
      className="fixed bottom-20 sm:bottom-6 start-4 sm:start-6 z-40 max-w-[290px] sm:max-w-xs bg-white/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xl flex items-center gap-2.5 animate-slideUp font-kufi"
    >
      {/* Product Image */}
      <div className="relative w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden shrink-0 flex items-center justify-center">
        <Image
          src={proof.image || '/images/prod_acetate.webp'}
          alt={proof.itemTitle}
          fill
          sizes="44px"
          referrerPolicy="no-referrer"
          className="object-cover"
        />
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0 text-start">
        <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span className="truncate">
            {proof.name} {proof.city ? `· ${proof.city}` : ''}
          </span>
        </div>

        <p className="text-[11px] font-bold text-slate-800 truncate leading-tight mt-0.5">
          {proof.itemTitle}
        </p>

        <span className="text-[9px] text-slate-400 block mt-0.5">
          {t('طلب مؤكد حديثاً', 'Recently verified purchase')}
        </span>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={handleDismiss}
        className="p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors cursor-pointer shrink-0"
        title={t('إغلاق', 'Dismiss')}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
};
