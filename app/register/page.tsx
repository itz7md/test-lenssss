'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SeoHead } from '@/components/SeoHead';
import {
  signInWithGoogle,
  registerWithEmail,
  formatAuthError,
} from '@/lib/authService';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const GoogleGIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export default function RegisterPage() {
  const router = useRouter();
  const { currentUser, language, country, t } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If already logged in, redirect to account page
  useEffect(() => {
    if (currentUser) {
      router.push('/account');
    }
  }, [currentUser, router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle(country);
      setSuccessMsg(
        language === 'ar'
          ? 'تم إنشاء الحساب بنجاح! جاري تحويلك...'
          : 'Account created successfully! Redirecting...'
      );
      setTimeout(() => {
        router.push('/account');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!name.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى إدخال بريدك الإلكتروني.' : 'Please enter your email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg(
        language === 'ar'
          ? 'كلمة المرور يجب ألا تقل عن 6 خانات.'
          : 'Password must be at least 6 characters.'
      );
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(
        language === 'ar'
          ? 'كلمتا المرور غير متطابقتين.'
          : 'Passwords do not match.'
      );
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(name, email, password, phone, country);
      setSuccessMsg(
        language === 'ar'
          ? 'تم إنشاء الحساب بنجاح! جاري تحويلك...'
          : 'Account created successfully! Redirecting...'
      );
      setTimeout(() => {
        router.push('/account');
      }, 1000);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      <SeoHead
        title={language === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
        description={
          language === 'ar'
            ? 'أنشئ حساباً في لنس كود للاستمتاع بخدمات البصريات الفاخرة، وحفظ مقاسات النظر، وتتبع طلباتك.'
            : 'Create a new LensCode customer account to track orders and save optical prescriptions.'
        }
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
            <span className="text-slate-900 font-semibold">{t('إنشاء حساب جديد', 'Create Account')}</span>
          </nav>
        </div>
      </div>

      {/* Main Register Card Container */}
      <div className="max-w-md mx-auto px-4 pt-10 sm:pt-16">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-slate-950 text-white p-6 sm:p-8 text-center relative">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A58454]/20 border border-[#A58454]/40 text-[#D8B480] text-[11px] font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5 text-[#D8B480]" />
              <span>{t('منصة لنس كود الفاخرة', 'LensCode Luxury Optical')}</span>
            </div>
            <h1 className="text-2xl font-bold font-kufi text-white">
              {t('إنشاء حساب عميل جديد', 'Create a New Account')}
            </h1>
            <p className="text-xs text-slate-400 mt-1.5">
              {t('انضم إلى منصة لنس كود واستمتع بتجربة تسوق بصرية مخصصة', 'Join LensCode for personalized luxury optical shopping')}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6 sm:p-8 space-y-5">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Quick Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-3xs hover:shadow-xs hover:border-slate-400 disabled:opacity-50 cursor-pointer"
            >
              <GoogleGIcon />
              <span>{t('إنشاء حساب فوري باستخدام Google', 'Sign up with Google')}</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
                {t('أو عبر البريد الإلكتروني', 'OR via Email')}
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('الاسم الكامل', 'Full Name')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('مثال: عبد الله أحمد', 'e.g. Abdullah Ahmed')}
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 text-xs font-semibold outline-hidden transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('البريد الإلكتروني', 'Email Address')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    dir="ltr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 text-xs font-semibold outline-hidden transition-all text-start"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('رقم الجوال (اختياري)', 'Phone Number (Optional)')}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    dir="ltr"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+966 5x xxx xxxx"
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 text-xs font-semibold outline-hidden transition-all text-start font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('كلمة المرور', 'Password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 text-xs font-semibold outline-hidden transition-all text-start"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('تأكيد كلمة المرور', 'Confirm Password')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    dir="ltr"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 text-xs font-semibold outline-hidden transition-all text-start"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-[#C5A880] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4 cursor-pointer"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>{t('إنشاء الحساب الآن', 'Create Account')}</span>
                    {language === 'ar' ? (
                      <ArrowLeft className="w-4 h-4" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </>
                )}
              </button>
            </form>

            {/* Toggle Footer */}
            <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
              <p>
                {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                <Link
                  href="/login"
                  className="font-bold text-[#8C6D3F] hover:underline"
                >
                  {t('تسجيل الدخول', 'Sign In')}
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{t('حساب محمي ومشفّر بالكامل', 'Fully Protected & Encrypted Account')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
