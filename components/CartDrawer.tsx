'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowLeft,
  ArrowRight,
  Tag,
  CheckCircle,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import { Price } from './Price';
import { PaymentIcons } from './PaymentIcons';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onProceedToCheckout }) => {
  const router = useRouter();
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotalSAR,
    cartDiscountSAR,
    cartTotalSAR,
    getCartItemLocalPrice,
    cartSubtotalLocal,
    cartDiscountLocal,
    cartTotalLocal,
    country,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    formatPrice,
    language,
    t,
  } = useApp();

  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Lock background body scroll when cart is open
  useEffect(() => {
    if (isCartOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const res = applyCoupon(couponInput);
    setCouponFeedback({
      text: res.message,
      isError: !res.success,
    });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Drawer Container: Full width on mobile, sleek max-w-md on desktop */}
      <div className="fixed inset-y-0 end-0 w-full max-w-full sm:max-w-md flex pointer-events-auto">
        <div className="w-full h-full bg-white shadow-2xl flex flex-col justify-between overflow-hidden border-s border-slate-200/50">
          
          {/* 1. Luxury Header */}
          <div className="px-5 py-4 bg-slate-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
              </div>
              <div>
                <h2 className="text-base font-bold font-kufi tracking-tight">
                  {t('سلة المشتريات', 'Shopping Bag')}
                </h2>
                <span className="text-[11px] text-slate-400 font-sans">
                  {cart.length}{' '}
                  {cart.length === 1
                    ? t('منتج في السلة', 'item in bag')
                    : t('منتجات في السلة', 'items in bag')}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsCartOpen(false)}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 2. Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 divide-y divide-slate-100">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-20 h-20 rounded-full bg-slate-50 border border-slate-100 text-slate-300 flex items-center justify-center mb-4 shadow-inner">
                  <ShoppingBag className="w-10 h-10" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-kufi mb-1.5">
                  {t('سلة المشتريات فارغة حالياً', 'Your bag is currently empty')}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                  {t(
                    'استكشف تشكيلاتنا الفاخرة من النظارات والعدسات اللاصقة وابدأ تجربة تسوق استثنائية.',
                    'Explore our luxury eyewear and contact lenses collections.'
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-kufi transition-colors cursor-pointer shadow-sm"
                >
                  {t('تصفح التشكيلات الآن', 'Browse Collections')}
                </button>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.id}
                  className="pt-3.5 first:pt-0 flex gap-3.5 items-center group"
                >
                  {/* Product Thumbnail */}
                  <div
                    onClick={() => {
                      setIsCartOpen(false);
                      router.push(`/${item.product.slug}`);
                    }}
                    className="relative w-20 h-20 bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 p-1.5 shrink-0 flex items-center justify-center cursor-pointer hover:border-slate-400 transition-colors"
                  >
                    <Image
                      src={item.selectedColor.image || '/images/prod_acetate.webp'}
                      alt={item.product.nameAr}
                      fill
                      sizes="80px"
                      referrerPolicy="no-referrer"
                      className="object-contain p-1"
                    />
                  </div>

                  {/* Product Details & Controls */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          onClick={() => {
                            setIsCartOpen(false);
                            router.push(`/${item.product.slug}`);
                          }}
                          className="text-xs sm:text-sm font-bold text-slate-900 truncate cursor-pointer hover:text-[#A58454] transition-colors"
                        >
                          {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                        </h4>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1 -mt-1 -me-1 cursor-pointer"
                          title={t('حذف من السلة', 'Remove item')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Variant & Color */}
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-500">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: item.selectedColor.hex }}
                        />
                        <span className="truncate">
                          {language === 'ar'
                            ? item.selectedColor.nameAr
                            : item.selectedColor.nameEn}
                        </span>
                      </div>

                      {/* Custom prescription details if attached */}
                      {item.lensConfig && (
                        <div className="mt-1.5 px-2 py-1 rounded-lg bg-amber-50/80 border border-amber-200/60 text-[10px] text-slate-700">
                          <span className="font-bold text-[#8C6D3F]">
                            {t('عدسات طبية مخصصة:', 'Custom Lenses:')}
                          </span>{' '}
                          Index {item.lensConfig.lensIndex}
                        </div>
                      )}

                      {/* Contact Lenses custom options details */}
                      {item.product.category === 'contact-lenses' && (
                        <div className="mt-1.5 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-[10px] text-slate-700 space-y-0.5">
                          {item.isSeparatePower && (
                            <div className="inline-block px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded font-bold mb-1">
                              {t('عبوة مزدوجة (مقاسات مختلفة)', 'Double Pack (Separate Powers)')}
                            </div>
                          )}
                          {item.selectedPackSize && (
                            <div>
                              <span className="font-bold text-slate-500">
                                {t('العبوة:', 'Pack:')}
                              </span>{' '}
                              <span>
                                {language === 'ar' ? item.selectedPackSize.labelAr : item.selectedPackSize.labelEn}
                              </span>
                            </div>
                          )}
                          {(item.contactLensPowerRight || item.contactLensPowerLeft) && (
                            <div>
                              <span className="font-bold text-[#8C6D3F]">
                                {t('قياس النظر SPH:', 'Sphere Power SPH:')}
                              </span>{' '}
                              <span className="font-mono">
                                R: {item.contactLensPowerRight || '0.00'} | L: {item.contactLensPowerLeft || '0.00'}
                              </span>
                            </div>
                          )}
                          {(item.contactLensCylinderRight || item.contactLensCylinderLeft) && (
                            <div>
                              <span className="font-bold text-[#8C6D3F]">
                                {t('الانحراف CYL/AXIS:', 'Toric CYL/AXIS:')}
                              </span>{' '}
                              <span className="font-mono">
                                {item.contactLensCylinderRight ? `R: ${item.contactLensCylinderRight} (${item.contactLensAxisRight || '0'}°)` : 'R: -'} 
                                {' | '}
                                {item.contactLensCylinderLeft ? `L: ${item.contactLensCylinderLeft} (${item.contactLensAxisLeft || '0'}°)` : 'L: -'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quantity Stepper & Price */}
                    <div className="flex items-center justify-between mt-2.5">
                      <div className="flex items-center border border-slate-200/90 bg-white rounded-xl shadow-xs overflow-hidden">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="p-1.5 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-slate-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="p-1.5 px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <Price
                        amountSAR={item.unitPriceSAR * item.quantity}
                        customAmount={country === 'SA' ? undefined : getCartItemLocalPrice(item, country) * item.quantity}
                        size="xs"
                        className="text-xs sm:text-sm font-bold font-kufi text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 3. Luxury Summary & Checkout Section */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 bg-slate-50/90 border-t border-slate-200/90 space-y-3.5 shrink-0">
              
              {/* Promo Coupon Field */}
              <div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-900">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="font-semibold">
                        {t('كوبون مفعل:', 'Applied Coupon:')}{' '}
                        <strong className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200 text-emerald-800">
                          {appliedCoupon.code}
                        </strong>{' '}
                        (
                        {appliedCoupon.discountType === 'percentage' ? (
                          `-${appliedCoupon.discountValue}%`
                        ) : (
                          <Price amountSAR={appliedCoupon.discountValue} size="xs" prefix="-" />
                        )}
                        )
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-xs text-rose-600 hover:text-rose-800 hover:underline font-bold cursor-pointer"
                    >
                      {t('إلغاء', 'Remove')}
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="w-3.5 h-3.5 text-slate-400 absolute start-3 top-3" />
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        placeholder={t('كود الخصم (مثال: WATANI أو LENS50)', 'Coupon code (e.g. WATANI)')}
                        className="w-full text-xs ps-8 pe-3 py-2.5 rounded-xl border border-slate-300/80 bg-white uppercase font-mono outline-none focus:border-slate-800 transition-colors"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold font-kufi transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      {t('تطبيق', 'Apply')}
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[11px] mt-1.5 font-medium ${
                      couponFeedback.isError ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {couponFeedback.text}
                  </p>
                )}
              </div>

              {/* Price Breakdown: Subtotal & Total only (Free Shipping & All-inclusive price) */}
              <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">
                    {t('المجموع الفرعي:', 'Subtotal:')}
                  </span>
                  <Price
                    amountSAR={cartSubtotalSAR}
                    customAmount={country === 'SA' ? undefined : cartSubtotalLocal}
                    size="xs"
                    className="font-mono font-bold text-slate-800"
                  />
                </div>

                {cartDiscountSAR > 0 && (
                  <div className="flex justify-between items-center text-emerald-700 font-bold">
                    <span>{t('قيمة الخصم:', 'Discount:')}</span>
                    <Price
                      amountSAR={cartDiscountSAR}
                      customAmount={country === 'SA' ? undefined : cartDiscountLocal}
                      size="xs"
                      prefix="-"
                      className="font-mono text-emerald-700"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center pt-2.5 border-t border-slate-300 text-slate-900">
                  <div>
                    <span className="text-sm font-bold font-kufi block">
                      {t('المجموع الكلي:', 'Total:')}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold block">
                      {t('شحن مجاني لكافة الطلبات', 'Free Fast Shipping Included')}
                    </span>
                  </div>
                  <Price
                    amountSAR={cartTotalSAR}
                    customAmount={country === 'SA' ? undefined : cartTotalLocal}
                    size="md"
                    className="text-xl font-bold font-kufi text-[#A58454]"
                  />
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] via-[#A58454] to-[#8C6D3F] hover:opacity-95 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <span>{t('متابعة الشراء والدفع', 'Proceed to Checkout')}</span>
                {language === 'ar' ? (
                  <ArrowLeft className="w-4 h-4" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
              </button>

              {/* Payment Trust Badges based on active country */}
              <div className="flex items-center justify-center gap-1.5 pt-1 flex-wrap">
                <PaymentIcons.ApplePay className="h-5 w-auto" />
                {country === 'SA' && <PaymentIcons.Mada className="h-5 w-auto" />}
                {country === 'KW' && <PaymentIcons.Knet className="h-5 w-auto" />}
                {country === 'BH' && <PaymentIcons.Benefit className="h-5 w-auto" />}
                {country === 'QA' && <PaymentIcons.QPay className="h-5 w-auto" />}
                {country === 'OM' && <PaymentIcons.OmanNet className="h-5 w-auto" />}
                <PaymentIcons.Visa className="h-5 w-auto" />
                <PaymentIcons.Mastercard className="h-5 w-auto" />
                {country === 'SA' && <PaymentIcons.Tamara className="h-5 w-auto" />}
                {(country === 'SA' || country === 'AE' || country === 'KW') && <PaymentIcons.Tabby className="h-5 w-auto" />}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
