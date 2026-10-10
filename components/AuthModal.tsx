'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
  resetUserPassword,
  formatAuthError,
} from '@/lib/authService';
import {
  X,
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
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Official Google "G" Icon SVG
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

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    language,
    country,
    t,
  } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Lock background body scroll when auth modal is open
  useEffect(() => {
    if (isAuthModalOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const resetState = () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setPhone('');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle(country);
      setSuccessMsg(
        language === 'ar'
          ? 'تم تسجيل الدخول بنجاح! أهلاً بك في لنس كود.'
          : 'Successfully signed in! Welcome to LensCode.'
      );
      setTimeout(() => {
        closeAuthModal();
        resetState();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(formatAuthError(err, language));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (authModalMode === 'login') {
      if (!email.trim() || !password) {
        setErrorMsg(
          language === 'ar'
            ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.'
            : 'Please enter your email and password.'
        );
        return;
      }
      setLoading(true);
      try {
        await loginWithEmail(email, password);
        setSuccessMsg(
          language === 'ar'
            ? 'تم تسجيل الدخول بنجاح!'
            : 'Logged in successfully!'
        );
        setTimeout(() => {
          closeAuthModal();
          resetState();
        }, 1200);
      } catch (err: any) {
        setErrorMsg(formatAuthError(err, language));
      } finally {
        setLoading(false);
      }
    } else if (authModalMode === 'register') {
      if (!name.trim()) {
        setErrorMsg(language === 'ar' ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.');
        return;
      }
      if (!email.trim()) {
        setErrorMsg(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني.' : 'Please enter your email.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg(
          language === 'ar'
            ? 'كلمة المرور يجب أن تكون 6 خانات على الأقل.'
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
            ? 'تم إنشاء حسابك بنجاح! أهلاً بك في عائلة لنس كود.'
            : 'Account created successfully! Welcome to LensCode.'
        );
        setTimeout(() => {
          closeAuthModal();
          resetState();
        }, 1200);
      } catch (err: any) {
        setErrorMsg(formatAuthError(err, language));
      } finally {
        setLoading(false);
      }
    } else if (authModalMode === 'forgot_password') {
      if (!email.trim()) {
        setErrorMsg(
          language === 'ar'
            ? 'يرجى إدخال بريدك الإلكتروني المسجل.'
            : 'Please enter your registered email.'
        );
        return;
      }
      setLoading(true);
      try {
        await resetUserPassword(email);
        setSuccessMsg(
          language === 'ar'
            ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.'
            : 'Password reset link sent to your email successfully.'
        );
      } catch (err: any) {
        setErrorMsg(formatAuthError(err, language));
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto"
      >
        {/* Header Ribbon */}
        <div className="bg-slate-950 text-white px-6 py-5 relative">
          <button
            type="button"
            onClick={() => {
              closeAuthModal();
              resetState();
            }}
            className="absolute top-4.5 end-4.5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#A58454]" />
            <span className="text-[11px] font-bold text-[#A58454] tracking-wider uppercase">
              {t('منصة لنس كود الفاخرة', 'LensCode Luxury Optical')}
            </span>
          </div>

          <h3 className="text-xl font-bold font-kufi text-white">
            {authModalMode === 'login' && t('تسجيل الدخول إلى حسابك', 'Sign In to Your Account')}
            {authModalMode === 'register' && t('إنشاء حساب عميل جديد', 'Create a New Account')}
            {authModalMode === 'forgot_password' && t('استعادة كلمة المرور', 'Reset Password')}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {authModalMode === 'login' &&
              t('سجّل دخولك لمتابعة طلباتك وتتبع الشحنات وحفظ مقاسات النظر', 'Track your orders, view saved prescriptions & fast checkout')}
            {authModalMode === 'register' &&
              t('انضم إلينا للاستمتاع بتجربة تسوق بصرية مخصصة وفحص نظر حصري', 'Join us for personalized luxury optical shopping & exclusive perks')}
            {authModalMode === 'forgot_password' &&
              t('أدخل بريدك الإلكتروني وسنرسل لك رابطاً لاستعادة حسابك فوراً', 'Enter your registered email to receive a password reset link')}
          </p>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {/* Notification Alerts */}
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

          {/* 1. Quick Google Sign-In (Login & Register modes) */}
          {authModalMode !== 'forgot_password' && (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3 px-4 rounded-2xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-3xs hover:shadow-xs hover:border-slate-400 disabled:opacity-50 cursor-pointer"
              >
                <GoogleGIcon />
                <span>
                  {authModalMode === 'login'
                    ? t('تسجيل الدخول السريع باستخدام Google', 'Continue with Google')
                    : t('إنشاء حساب فوري باستخدام Google', 'Sign up with Google')}
                </span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 shrink-0 uppercase tracking-wider">
                  {t('أو عبر البريد الإلكتروني', 'OR via Email')}
                </span>
                <div className="border-t border-slate-200 w-full" />
              </div>
            </>
          )}

          {/* 2. Main Auth Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {/* Name (Register only) */}
            {authModalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('الاسم الكامل', 'Full Name')} <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('مثال: محمد السعيد', 'e.g. John Doe')}
                    className="w-full ps-10 pe-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 text-xs font-semibold outline-hidden transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">
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

            {/* Phone (Register only) */}
            {authModalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
            )}

            {/* Password (Login & Register) */}
            {authModalMode !== 'forgot_password' && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-slate-700">
                    {t('كلمة المرور', 'Password')} <span className="text-rose-500">*</span>
                  </label>
                  {authModalMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg(null);
                        setSuccessMsg(null);
                        setAuthModalMode('forgot_password');
                      }}
                      className="text-[11px] font-semibold text-[#8C6D3F] hover:underline cursor-pointer"
                    >
                      {t('نسيت كلمة المرور؟', 'Forgot Password?')}
                    </button>
                  )}
                </div>
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
            )}

            {/* Confirm Password (Register only) */}
            {authModalMode === 'register' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
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
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-[#C5A880] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 mt-4 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {authModalMode === 'login' && t('تسجيل الدخول', 'Sign In')}
                    {authModalMode === 'register' && t('إنشاء الحساب الآن', 'Create Account')}
                    {authModalMode === 'forgot_password' && t('إرسال رابط الاستعادة', 'Send Reset Link')}
                  </span>
                  {language === 'ar' ? (
                    <ArrowLeft className="w-4 h-4" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                </>
              )}
            </button>
          </form>

          {/* Toggle Modes Footer */}
          <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
            {authModalMode === 'login' && (
              <p>
                {t('ليس لديك حساب بعد؟', "Don't have an account?")}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setAuthModalMode('register');
                  }}
                  className="font-bold text-[#8C6D3F] hover:underline cursor-pointer"
                >
                  {t('إنشاء حساب جديد', 'Create Account')}
                </button>
              </p>
            )}

            {authModalMode === 'register' && (
              <p>
                {t('لديك حساب بالفعل؟', 'Already have an account?')}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setAuthModalMode('login');
                  }}
                  className="font-bold text-[#8C6D3F] hover:underline cursor-pointer"
                >
                  {t('تسجيل الدخول', 'Sign In')}
                </button>
              </p>
            )}

            {authModalMode === 'forgot_password' && (
              <p>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMsg(null);
                    setSuccessMsg(null);
                    setAuthModalMode('login');
                  }}
                  className="font-bold text-[#8C6D3F] hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('العودة لتسجيل الدخول', 'Back to Sign In')}</span>
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
