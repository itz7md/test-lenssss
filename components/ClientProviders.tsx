'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { AppProvider } from '@/context/AppContext';
import { Header } from '@/components/Header';
import { NewsletterAndFooter } from '@/components/NewsletterAndFooter';
import { FloatingWhatsApp } from '@/components/FloatingWhatsApp';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { SocialProofToast } from '@/components/SocialProofToast';
import { Product, CategoryConfig, SiteSettings } from '@/types';

// Lazy load heavy client modals & Admin Dashboard to drastically reduce initial JS bundle size
const CustomLensWizardModal = dynamic(
  () => import('@/components/CustomLensWizardModal').then((mod) => mod.CustomLensWizardModal),
  { ssr: false }
);
const VipAppointmentModal = dynamic(
  () => import('@/components/VipAppointmentModal').then((mod) => mod.VipAppointmentModal),
  { ssr: false }
);
const CartDrawer = dynamic(
  () => import('@/components/CartDrawer').then((mod) => mod.CartDrawer),
  { ssr: false }
);
const CheckoutModal = dynamic(
  () => import('@/components/CheckoutModal').then((mod) => mod.CheckoutModal),
  { ssr: false }
);
const SingleProductModal = dynamic(
  () => import('@/components/SingleProductModal').then((mod) => mod.SingleProductModal),
  { ssr: false }
);
const PredictiveSearchModal = dynamic(
  () => import('@/components/PredictiveSearchModal').then((mod) => mod.PredictiveSearchModal),
  { ssr: false }
);
const WishlistDrawer = dynamic(
  () => import('@/components/WishlistDrawer').then((mod) => mod.WishlistDrawer),
  { ssr: false }
);
const AdminDashboard = dynamic(
  () => import('@/components/AdminDashboard').then((mod) => mod.AdminDashboard),
  { ssr: false }
);
const TrackOrderModal = dynamic(
  () => import('@/components/TrackOrderModal').then((mod) => mod.TrackOrderModal),
  { ssr: false }
);
const AuthModal = dynamic(
  () => import('@/components/AuthModal').then((mod) => mod.AuthModal),
  { ssr: false }
);

interface ClientProvidersProps {
  children: React.ReactNode;
  initialProducts: Product[];
  initialCategories: CategoryConfig[];
  initialSettings: SiteSettings | null;
}

function AppLayoutShell({ children }: { children: React.ReactNode }) {
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 selection:bg-[#A58454] selection:text-white pb-14 sm:pb-0">
      
      {/* ✅ تصحيح: تم حذف الخاصية المسببة للمشكلة، والـ Header سيقرأ التصنيفات فوراً من الـ Context المحقون بالسيرفر */}
      <Header />

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Newsletter & Streamlined Footer */}
      <NewsletterAndFooter />

      {/* Floating Utilities */}
      <FloatingWhatsApp />
      <MobileBottomNav />
      <SocialProofToast />

      {/* Global Interactive Modals (Dynamically Loaded On-Demand) */}
      <CustomLensWizardModal />
      <VipAppointmentModal />
      <CartDrawer onProceedToCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
      <SingleProductModal />
      <PredictiveSearchModal />
      <WishlistDrawer />
      <AdminDashboard />
      <TrackOrderModal />
      <AuthModal />
    </div>
  );
}

export function ClientProviders({ 
  children, 
  initialProducts, 
  initialCategories, 
  initialSettings 
}: ClientProvidersProps) {
  return (
    // حقن البيانات الأولية المستلمة من السيرفر لتكون جاهزة للموقع بالكامل فوراً
    <AppProvider 
      initialProducts={initialProducts} 
      initialCategories={initialCategories} 
      initialSettings={initialSettings}
    >
      <AppLayoutShell>
        {children}
      </AppLayoutShell>
    </AppProvider>
  );
}
