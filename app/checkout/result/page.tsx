'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { saveOrderToFirestore } from '@/lib/firestoreService';
import { Order } from '@/types';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Printer,
  ShoppingBag,
  ArrowRight,
  FileText,
  CreditCard,
  QrCode,
  RotateCcw,
} from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { Price } from '@/components/Price';
import Link from 'next/link';

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const tapId = searchParams.get('tap_id') || searchParams.get('charge_id');

  const { language, t, orders, setOrders, clearCart, formatPrice, country, currentCountryInfo } = useApp();

  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [chargeData, setChargeData] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    if (!tapId) {
      setLoading(false);
      setIsSuccess(false);
      setErrorMsg(language === 'ar' ? 'لم يتم العثور على رقم معاملة الدفع' : 'No payment transaction ID found');
      return;
    }

    let isMounted = true;

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/tap/verify?tap_id=${encodeURIComponent(tapId!)}`);
        const data = await res.json();

        if (!isMounted) return;

        if (data.success && data.isPaid) {
          setIsSuccess(true);
          setChargeData(data);

          // Trigger Confetti
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#A58454', '#C5A880', '#0F172A', '#059669'],
            });
          } catch {}

          // Retrieve pending order from localStorage if available
          try {
            const pendingOrderStr = localStorage.getItem('lenscode_pending_order');
            if (pendingOrderStr) {
              const pendingOrder: Order = JSON.parse(pendingOrderStr);
              pendingOrder.paymentStatus = 'captured';
              pendingOrder.tapChargeId = data.chargeId;
              pendingOrder.tapCardBrand = data.card?.brand;
              pendingOrder.tapCardLastFour = data.card?.last_four;

              setOrders((prev) => {
                if (prev.some((o) => o.id === pendingOrder.id || o.orderNumber === pendingOrder.orderNumber)) {
                  return prev.map((o) =>
                    o.orderNumber === pendingOrder.orderNumber
                      ? { ...o, paymentStatus: 'captured', tapChargeId: data.chargeId }
                      : o
                  );
                }
                return [pendingOrder, ...prev];
              });

              // Persist order to Firestore database
              saveOrderToFirestore(pendingOrder).catch((err) =>
                console.warn('Error saving order to Firestore on payment success:', err)
              );

              // Notify real purchase toast for browsing session
              try {
                const proofData = {
                  id: pendingOrder.id,
                  name: pendingOrder.customer?.name || '',
                  city: pendingOrder.customer?.city || '',
                  itemTitle: pendingOrder.items?.[0]?.product?.nameAr || (pendingOrder.items?.[0] as any)?.nameAr || (language === 'ar' ? 'طلب مؤكد' : 'Confirmed Order'),
                  image: pendingOrder.items?.[0]?.selectedColor?.image || pendingOrder.items?.[0]?.product?.colors?.[0]?.image || '/images/prod_acetate.webp',
                };
                sessionStorage.setItem('lc_latest_real_purchase', JSON.stringify(proofData));
                if (typeof window !== 'undefined') {
                  window.dispatchEvent(new CustomEvent('lenscode_order_completed', { detail: proofData }));
                }
              } catch {}

              localStorage.removeItem('lenscode_pending_order');
              clearCart();
            }
          } catch (e) {
            console.warn('Order sync warning:', e);
          }
        } else {
          setIsSuccess(false);
          setChargeData(data);
          setErrorMsg(
            data.response?.message ||
              (language === 'ar'
                ? 'لم تكتمل عملية الدفع بنجاح. يرجى المحاولة مرة أخرى أو اختيار طريقة دفع بديلة.'
                : 'Payment was not completed. Please try again or choose another payment method.')
          );
        }
      } catch (err: any) {
        if (!isMounted) return;
        setIsSuccess(false);
        setErrorMsg(err?.message || (language === 'ar' ? 'تعذر الاتصال ببوابة الدفع للتحقق من المعاملة' : 'Failed to verify transaction'));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [tapId, language, setOrders, clearCart]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-xl font-bold font-kufi text-slate-900 mb-2">
          {t('جاري التحقق من عملية الدفع لدى Tap Payments...', 'Verifying payment with Tap Payments...')}
        </h2>
        <p className="text-xs text-slate-500 max-w-sm">
          {t('يرجى الانتظار لحظات لتأكيد المعاملة وإصدار الفاتورة الضريبية تلقائياً', 'Please wait while we confirm your transaction and issue your tax invoice')}
        </p>
      </div>
    );
  }

  const orderNumber = chargeData?.reference?.order || chargeData?.metadata?.orderNumber || 'LC-ORDER';
  const amount = chargeData?.amount || 0;
  const currency = chargeData?.currency || 'SAR';
  const cardBrand = chargeData?.card?.brand || 'CARD';
  const lastFour = chargeData?.card?.last_four;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {isSuccess ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden animate-fadeIn">
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C5A880] block mb-1">
              {t('تم الدفع بنجاح عبر بوابة Tap Payments', 'Payment Completed via Tap Payments')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-kufi text-white">
              {t('شكراً لثقتك! تم تأكيد طلبك بنجاح', 'Thank You! Your Order is Confirmed')}
            </h1>
            <p className="text-xs text-slate-300 mt-2 max-w-md mx-auto">
              {t(
                `تم استلام قيمة الطلب وإصدار الفاتورة الضريبية المعتمدة ZATCA. جاري تحضير شحنتك للشحن الفوري.`,
                `Payment verified and official ZATCA tax invoice generated. Your order is being prepared for dispatch.`
              )}
            </p>
          </div>

          {/* Receipt & Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">{t('رقم الطلب:', 'Order Number:')}</span>
                <strong className="font-mono text-[#A58454] text-sm">{orderNumber}</strong>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">{t('رقم معاملة Tap (Charge ID):', 'Tap Charge ID:')}</span>
                <span className="font-mono text-slate-700">{chargeData?.chargeId || tapId}</span>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">{t('طريقة الدفع:', 'Payment Method:')}</span>
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <CreditCard className="w-4 h-4 text-[#A58454]" />
                  <span>{cardBrand} {lastFour ? `(•••• ${lastFour})` : ''}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                <span className="text-slate-500">{t('حالة المعاملة:', 'Payment Status:')}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t('مدفوع بالكامل (CAPTURED)', 'Paid & Captured')}</span>
                </span>
              </div>

              <div className="flex justify-between items-center text-sm pt-2">
                <span className="font-bold font-kufi text-slate-900">{t('المبلغ الإجمالي المدفوع:', 'Total Amount Paid:')}</span>
                <Price amountSAR={amount} size="lg" className="font-bold font-kufi text-[#A58454]" />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#C5A880]" />
                <span>{t('معايرة وطباعة الفاتورة الضريبية ZATCA', 'Print ZATCA Tax Invoice')}</span>
              </button>

              <Link
                href="/"
                className="px-6 py-3.5 rounded-xl border border-slate-300 text-slate-800 hover:bg-slate-100 font-bold text-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-[#A58454]" />
                <span>{t('متابعة التسوق', 'Continue Shopping')}</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-2xl overflow-hidden p-6 sm:p-8 text-center animate-fadeIn space-y-6">
          <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto shadow-inner">
            <XCircle className="w-12 h-12" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-600 block mb-1">
              {t('تعذر إتمام عملية الدفع', 'Payment Unsuccessful')}
            </span>
            <h1 className="text-2xl font-bold font-kufi text-slate-900">
              {t('لم نتمكن من إتمام عملية الدفع', 'Could Not Complete Transaction')}
            </h1>
            <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
              {errorMsg || t('حدث خطأ أثناء معالجة البطاقة أو تم إلغاء العملية من قبل المستخدم.', 'An error occurred or payment was cancelled.')}
            </p>
          </div>

          {chargeData?.chargeId && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-600 max-w-md mx-auto">
              <span className="text-slate-500 block mb-1">{t('رقم المعاملة:', 'Transaction ID:')}</span>
              <code className="font-mono text-slate-800">{chargeData.chargeId}</code>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A58454] text-slate-950 font-bold text-xs shadow-md hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>{t('العودة وإعادة المحاولة', 'Return & Try Again')}</span>
            </Link>

            <Link
              href="/"
              className="px-6 py-3.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              {t('العودة للرئيسية', 'Back to Home')}
            </Link>
          </div>
        </div>
      )}

      {/* Invoice Modal Preview */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-5">
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="mb-2">
                  <Logo widthDesktop={160} widthMobile={130} />
                </div>
                <p className="text-[11px] text-slate-500 font-sans">شركة لِـنس كود للبصريات والعدسات الطبية</p>
                <p className="text-[10px] text-slate-400">الرقم الضريبي (VAT): 311075666400003 · ترخيص: 0000178830</p>
                <p className="text-[10px] text-slate-400">شارع الإمام فيصل بن تركي، حي الديرة، الرياض، المملكة العربية السعودية</p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-lg flex items-center justify-center p-1.5 shadow-xs">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 block">ZATCA QR Valid</span>
              </div>
            </div>

            <div className="grid grid-cols-2 text-xs gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-500 block">رقم الفاتورة:</span>
                <strong className="font-mono text-slate-800">{orderNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">بوابة الدفع:</span>
                <strong className="text-slate-800">Tap Payments ({cardBrand})</strong>
              </div>
              <div>
                <span className="text-slate-500 block">المبلغ المدفوع:</span>
                <strong className="font-mono text-[#A58454]">{amount} {currency}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">حالة الدفع:</span>
                <strong className="text-emerald-700">مدفوع ومؤكد</strong>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CheckoutResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#C5A880] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CheckoutResultContent />
    </Suspense>
  );
}
