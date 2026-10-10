'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { CustomerDetails, Order } from '@/types';
import confetti from 'canvas-confetti';
import {
  X,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Printer,
  Truck,
  ArrowRight,
  ArrowLeft,
  Coins,
  QrCode,
  FileText,
  BadgeCheck,
  MapPin,
  Sparkles,
  ShoppingBag,
  Lock,
  Info,
} from 'lucide-react';
import Image from 'next/image';
import Logo from '@/components/Logo';
import { PaymentIcons } from '@/components/PaymentIcons';
import { Price } from '@/components/Price';
import { SaudiRiyal } from '@/components/SaudiRiyal';
import { MapsModal } from '@/components/MapsModal';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const {
    cart,
    cartSubtotalSAR,
    cartDiscountSAR,
    cartShippingSAR,
    cartTaxSAR,
    cartTotalSAR,
    getCartItemLocalPrice,
    cartSubtotalLocal,
    cartDiscountLocal,
    cartTotalLocal,
    formatPrice,
    placeOrder,
    country,
    currentCountryInfo,
    language,
    t,
  } = useApp();

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  // Country-Specific dynamic shipping fields (supporting GCC and OTO Logistics)
  const [buildingNumber, setBuildingNumber] = useState('');
  const [shortAddressCode, setShortAddressCode] = useState('');
  const [emirate, setEmirate] = useState('Dubai');
  const [postalCode, setPostalCode] = useState('');
  const [block, setBlock] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [civilId, setCivilId] = useState('');
  const [zone, setZone] = useState('');
  
  // Interactive Google Maps states
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isLocateSuccess, setIsLocateSuccess] = useState(false);

  const handleLocateMe = () => {
    setIsMapOpen(true);
  };

  const handleConfirmMapLocation = (details: any) => {
    setIsLocateSuccess(true);
    setCity(details.city);
    setDistrict(details.district);
    setAddress(details.address);
    if (details.buildingNumber) setBuildingNumber(details.buildingNumber);
    if (details.shortAddressCode) setShortAddressCode(details.shortAddressCode);
    if (details.postalCode) setPostalCode(details.postalCode);
    if (details.block) setBlock(details.block);
    if (details.houseNumber) setHouseNumber(details.houseNumber);
    if (details.zone) setZone(details.zone);
    if (details.emirate) setEmirate(details.emirate);
  };

  // Device & SDK States
  const [isAppleDevice, setIsAppleDevice] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);
  const [cardInstance, setCardInstance] = useState<any>(null);
  const [threeDSecureUrl, setThreeDSecureUrl] = useState<string | null>(null);

  // Methods
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('mada');
  const [shippingMethod, setShippingMethod] = useState<Order['shippingMethod']>(
    country === 'SA' ? 'fast_local' : 'express_gcc'
  );

  // Loyalty points discount (e.g. user has 500 points = 25 SAR discount)
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const loyaltyDiscountSAR = useLoyaltyPoints ? 25 : 0;

  // Order state after completion
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // 1. Detect if Apple Device for Apple Pay device-specific filtering
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const hasApplePay = !!(window as any).ApplePaySession;
      const isApple = isIOS || isSafari || hasApplePay;
      setIsAppleDevice(isApple);
      
      // Default payment method
      if (isApple) {
        setPaymentMethod('apple_pay');
      } else {
        if (country === 'SA') setPaymentMethod('mada');
        else if (country === 'KW') setPaymentMethod('knet');
        else if (country === 'BH') setPaymentMethod('benefit');
        else setPaymentMethod('card');
      }
    }
  }, [country]);

  // 2. Stop Background Scrolling when Checkout modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 3. Dynamically load Tap Payments Card SDK Web V2
  React.useEffect(() => {
    if (!isOpen) return;

    const scriptId = 'tap-card-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;

    const initCardSDK = () => {
      if ((window as any).CardSDK) {
        setIsSdkLoaded(true);
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://tap-sdks.b-cdn.net/card/1.0.2/index.js';
      script.async = true;
      script.onload = initCardSDK;
      document.body.appendChild(script);
    } else {
      if ((window as any).CardSDK) {
        initCardSDK();
      } else {
        script.onload = initCardSDK;
      }
    }
  }, [isOpen]);

  const isCardPayment =
    paymentMethod === 'mada' ||
    paymentMethod === 'card' ||
    paymentMethod === 'knet' ||
    paymentMethod === 'benefit';

  // 4. Initialize or update Tap Card SDK Web V2
  React.useEffect(() => {
    if (!isOpen || !isSdkLoaded || !isCardPayment) {
      if (cardInstance) {
        try {
          cardInstance.unmount();
        } catch (e) {}
        setCardInstance(null);
      }
      return;
    }

    // Give React a small tick to ensure the DOM element is mounted
    const timer = setTimeout(() => {
      const container = document.getElementById('card-sdk-id');
      if (!container) return;

      try {
        if (cardInstance) {
          try {
            cardInstance.unmount();
          } catch (e) {}
        }

        const { renderTapCard, Theme, Currencies, Direction, Edges, Locale } = (window as any).CardSDK;

        // Map country currency
        let tapCurrency = Currencies.SAR;
        if (country === 'KW') tapCurrency = Currencies.KWD;
        else if (country === 'BH') tapCurrency = Currencies.BHD;
        else if (country === 'AE') tapCurrency = Currencies.AED;
        else if (country === 'QA') tapCurrency = Currencies.QAR;
        else if (country === 'OM') tapCurrency = Currencies.OMR;

        const finalTotal = Math.max(0, cartTotalSAR - loyaltyDiscountSAR);
        const convertedTotal = country === 'SA'
          ? finalTotal
          : Math.max(0, cartTotalLocal - (loyaltyDiscountSAR * currentCountryInfo.rateToSAR));

        const instance = renderTapCard('card-sdk-id', {
          publicKey: process.env.NEXT_PUBLIC_TAP_PUBLIC_KEY || 'pk_test_Vlk842B1EA7tDN5QbrfGjYzh',
          merchant: {
            id: process.env.NEXT_PUBLIC_TAP_MERCHANT_ID || ''
          },
          transaction: {
            amount: country === 'SA' ? finalTotal : convertedTotal,
            currency: tapCurrency
          },
          customer: {
            name: [
              {
                lang: language === 'ar' ? Locale.AR : Locale.EN,
                first: name?.split(' ')[0] || 'Customer',
                last: name?.split(' ').slice(1).join(' ') || 'LensCode'
              }
            ],
            contact: {
              email: email || 'customer@lenscode.sa',
              phone: {
                countryCode: currentCountryInfo.phoneCode.replace('+', ''),
                number: phone || '500000000'
              }
            }
          },
          acceptance: {
            supportedBrands: ['VISA', 'MASTERCARD', 'MADA', 'AMERICAN_EXPRESS'],
            supportedCards: 'ALL'
          },
          fields: {
            cardHolder: true
          },
          addons: {
            displayPaymentBrands: true,
            loader: true,
            saveCard: false
          },
          interface: {
            locale: language === 'ar' ? Locale.AR : Locale.EN,
            theme: Theme.LIGHT,
            edges: Edges.CURVED,
            direction: language === 'ar' ? Direction.RTL : Direction.LTR
          },
          onReady: () => {
            console.log('Card SDK Mounted & Ready');
          },
          onSuccess: async (tokenData: any) => {
            console.log('Tokenization success:', tokenData);
            if (tokenData && tokenData.id) {
              await handleProcessCardCharge(tokenData.id);
            }
          },
          onError: (err: any) => {
            console.error('Card SDK Error:', err);
            setPaymentError(err?.message || 'حدث خطأ في قراءة بيانات البطاقة. يرجى التحقق من المدخلات.');
            setIsProcessingPayment(false);
          }
        });

        setCardInstance(instance);
      } catch (e: any) {
        console.error('Error mounting Card SDK:', e);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [isOpen, isSdkLoaded, paymentMethod, name, phone, email, country, useLoyaltyPoints]);

  if (!isOpen) return null;

  // Process Card charge using CardSDK token
  const handleProcessCardCharge = async (tokenId: string) => {
    setIsProcessingPayment(true);
    setPaymentError(null);

    const finalTotalSAR = Math.max(0, cartTotalSAR - loyaltyDiscountSAR);
    const convertedTotal = country === 'SA'
      ? finalTotalSAR
      : Math.max(0, cartTotalLocal - (loyaltyDiscountSAR * currentCountryInfo.rateToSAR));

    // Dynamic country-specific descriptive address compilation (for OTO shipping APIs)
    let compiledAddress = address;
    if (country === 'SA') {
      compiledAddress = `${address} · الحي: ${district} · رقم المبنى: ${buildingNumber || 'N/A'} · الرمز الوطني: ${shortAddressCode || 'N/A'}`;
    } else if (country === 'AE') {
      compiledAddress = `${address} · الإمارة: ${emirate} · المنطقة: ${district} · صندوق بريد: ${postalCode || 'N/A'}`;
    } else if (country === 'KW') {
      compiledAddress = `${address} · قطعة: ${block || 'N/A'} · المنطقة: ${district} · منزل/شقة: ${houseNumber || 'N/A'} · بطاقة مدنية: ${civilId || 'N/A'}`;
    } else if (country === 'QA') {
      compiledAddress = `${address} · منطقة: ${district} · البلدية: ${city} · رقم مبنى: ${buildingNumber || 'N/A'} · بطاقة قطرية: ${civilId || 'N/A'} · زون: ${zone || 'N/A'}`;
    } else if (country === 'BH') {
      compiledAddress = `${address} · المحافظة: ${city} · طريق: ${address} · مجمع: ${block || 'N/A'} · مبنى: ${buildingNumber || 'N/A'}`;
    } else if (country === 'OM') {
      compiledAddress = `${address} · الولاية: ${city} · المنطقة: ${district} · بطاقة شخصية: ${civilId || 'N/A'}`;
    }

    const pendingOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
      status: 'processing',
      paymentStatus: 'pending',
      items: [...cart],
      customer: {
        name,
        phone: `${currentCountryInfo.phoneCode}${phone.replace(/^0+/, '')}`,
        email,
        country,
        city: country === 'AE' ? emirate : city,
        district: district || emirate || city,
        address: compiledAddress,
      },
      paymentMethod,
      shippingMethod,
      shippingCostSAR: cartShippingSAR,
      discountSAR: cartDiscountSAR,
      loyaltyDiscountSAR,
      subtotalSAR: cartSubtotalSAR,
      taxSAR: cartTaxSAR,
      totalSAR: finalTotalSAR,
      currency: country === 'SA' ? 'SAR' : currentCountryInfo.currencyEn,
      totalInSelectedCurrency: convertedTotal,
    };

    try {
      const res = await fetch('/api/tap/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: country === 'SA' ? finalTotalSAR : convertedTotal,
          currency: country === 'SA' ? 'SAR' : currentCountryInfo.currencyEn,
          customer: {
            name,
            email,
            phoneCountryCode: currentCountryInfo.phoneCode.replace('+', ''),
            phone: phone.replace(/^0+/, ''),
          },
          orderId: pendingOrder.id,
          orderNumber: pendingOrder.orderNumber,
          sourceId: tokenId,
          description: `طلب لِـنس كود #${pendingOrder.orderNumber}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        try {
          localStorage.setItem('lenscode_pending_order', JSON.stringify(pendingOrder));
        } catch {}

        if (data.redirectUrl) {
          // Keep user in the same page by showing 3D Secure verification in an iframe
          setThreeDSecureUrl(data.redirectUrl);
        } else {
          const order = placeOrder(pendingOrder.customer, paymentMethod, shippingMethod, loyaltyDiscountSAR);
          setCompletedOrder(order);
          setIsProcessingPayment(false);
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#A58454', '#C5A880', '#0F172A', '#059669'],
            });
          } catch {}
        }
      } else {
        setPaymentError(data.error || 'فشلت عملية الدفع. يرجى التحقق من بيانات البطاقة.');
        setIsProcessingPayment(false);
      }
    } catch (err: any) {
      setPaymentError(err?.message || 'حدث خطأ أثناء معالجة الدفع.');
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setPaymentError(null);

    // Dynamic country-specific descriptive address compilation (for OTO shipping APIs)
    let compiledAddress = address;
    if (country === 'SA') {
      compiledAddress = `${address} · الحي: ${district} · رقم المبنى: ${buildingNumber || 'N/A'} · الرمز الوطني: ${shortAddressCode || 'N/A'}`;
    } else if (country === 'AE') {
      compiledAddress = `${address} · الإمارة: ${emirate} · المنطقة: ${district} · صندوق بريد: ${postalCode || 'N/A'}`;
    } else if (country === 'KW') {
      compiledAddress = `${address} · قطعة: ${block || 'N/A'} · المنطقة: ${district} · منزل/شقة: ${houseNumber || 'N/A'} · بطاقة مدنية: ${civilId || 'N/A'}`;
    } else if (country === 'QA') {
      compiledAddress = `${address} · منطقة: ${district} · البلدية: ${city} · رقم مبنى: ${buildingNumber || 'N/A'} · بطاقة قطرية: ${civilId || 'N/A'} · زون: ${zone || 'N/A'}`;
    } else if (country === 'BH') {
      compiledAddress = `${address} · المحافظة: ${city} · طريق: ${address} · مجمع: ${block || 'N/A'} · مبنى: ${buildingNumber || 'N/A'}`;
    } else if (country === 'OM') {
      compiledAddress = `${address} · الولاية: ${city} · المنطقة: ${district} · بطاقة شخصية: ${civilId || 'N/A'}`;
    }

    const customer: CustomerDetails = {
      name,
      phone: `${currentCountryInfo.phoneCode}${phone.replace(/^0+/, '')}`,
      email,
      country,
      city: country === 'AE' ? emirate : city,
      district: district || emirate || city,
      address: compiledAddress,
    };

    const isTapMethod =
      paymentMethod === 'apple_pay' ||
      paymentMethod === 'mada' ||
      paymentMethod === 'card' ||
      paymentMethod === 'tap_payment' ||
      paymentMethod === 'knet' ||
      paymentMethod === 'benefit' ||
      paymentMethod === 'tabby' ||
      paymentMethod === 'tamara';

    // If it is an inline Card payment, we trigger tokenize instead of doing standard redirect
    if (isCardPayment) {
      if (!cardInstance) {
        setPaymentError('بوابة البطاقات غير جاهزة بعد، يرجى ملء البيانات وإعادة المحاولة.');
        return;
      }
      setIsProcessingPayment(true);
      try {
        cardInstance.tokenize();
      } catch (err: any) {
        setPaymentError('تعذر تجميع بيانات البطاقة بشكل آمن. يرجى المحاولة لاحقاً.');
        setIsProcessingPayment(false);
      }
      return;
    }

    // For Apple Pay or other Redirect methods (Tabby, Tamara)
    if (isTapMethod) {
      setIsProcessingPayment(true);
      try {
        const orderNumber = `LC-${Math.floor(1000 + Math.random() * 9000)}`;
        const orderId = `ord-${Date.now()}`;
        const finalTotalSAR = Math.max(0, cartTotalSAR - loyaltyDiscountSAR);
        const convertedTotal = country === 'SA'
          ? finalTotalSAR
          : Math.max(0, cartTotalLocal - (loyaltyDiscountSAR * currentCountryInfo.rateToSAR));

        // Determine sourceId for Tap Payments
        let sourceId = 'src_all';
        if (paymentMethod === 'tabby') sourceId = 'src_tabby.installement';
        else if (paymentMethod === 'tamara') sourceId = country === 'SA' ? 'src_sa.tamara' : 'src_tamara.installement';
        else if (paymentMethod === 'apple_pay') sourceId = 'src_all'; // Hosted automatically supports Apple Pay

        const pendingOrder: Order = {
          id: orderId,
          orderNumber,
          createdAt: new Date().toISOString(),
          status: 'processing',
          paymentStatus: 'pending',
          items: [...cart],
          customer,
          paymentMethod,
          shippingMethod,
          shippingCostSAR: cartShippingSAR,
          discountSAR: cartDiscountSAR,
          loyaltyDiscountSAR,
          subtotalSAR: cartSubtotalSAR,
          taxSAR: cartTaxSAR,
          totalSAR: finalTotalSAR,
          currency: country === 'SA' ? 'SAR' : currentCountryInfo.currencyEn,
          totalInSelectedCurrency: convertedTotal,
        };

        const res = await fetch('/api/tap/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: country === 'SA' ? finalTotalSAR : convertedTotal,
            currency: country === 'SA' ? 'SAR' : currentCountryInfo.currencyEn,
            customer: {
              name,
              email,
              phoneCountryCode: currentCountryInfo.phoneCode.replace('+', ''),
              phone: phone.replace(/^0+/, ''),
            },
            orderId,
            orderNumber,
            sourceId,
            description: `طلب لِـنس كود #${orderNumber}`,
          }),
        });

        const data = await res.json();

        if (data.success && data.redirectUrl) {
          try {
            localStorage.setItem('lenscode_pending_order', JSON.stringify(pendingOrder));
          } catch {}

          // For Apple Pay, Tabby, Tamara, redirect top-level window as they require direct authentication & native sheets
          window.location.href = data.redirectUrl;
          return;
        } else {
          setPaymentError(
            data.error ||
              t(
                'تعذر الاتصال ببوابة Tap Payments. يرجى مراجعة إعدادات المفاتيح أو المحاولة بطريقة دفع أخرى.',
                'Failed to connect to Tap Payments gateway. Please check API keys or use another payment method.'
              )
          );
          setIsProcessingPayment(false);
        }
      } catch (err: any) {
        setPaymentError(err?.message || t('حدث خطأ في معالجة بوابة الدفع', 'Payment processing error'));
        setIsProcessingPayment(false);
      }
      return;
    }

    // COD or other local checkout
    const order = placeOrder(customer, paymentMethod, shippingMethod, loyaltyDiscountSAR);
    setCompletedOrder(order);

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A58454', '#C5A880', '#0F172A', '#059669'],
      });
    } catch {}
  };

  const handleClose = () => {
    setCompletedOrder(null);
    setThreeDSecureUrl(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col w-full h-full md:h-screen overflow-hidden animate-fadeIn">
      <div className="relative w-full h-full bg-white flex flex-col max-h-screen">
        {/* Top Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h2 className="text-base font-bold font-kufi">
                {completedOrder
                  ? t('تأكيد الطلب والفاتورة', 'Order Confirmed & Invoice')
                  : t('إتمام الطلب والدفع الآمن', 'Secure Checkout')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('بوابة دفع مشفرة 256-bit بمعايير البنك المركزي السعودي SAMA', '256-bit encrypted checkout compliant with SAMA')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {completedOrder ? (
            /* ORDER SUCCESS SCREEN */
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="text-xs font-bold text-[#8C6D3F] uppercase tracking-wider block mb-1">
                  {t('تم تسجيل طلبك بنجاح!', 'Order Placed Successfully!')}
                </span>
                <h3 className="text-2xl font-bold font-kufi text-slate-900">
                  {t('رقم الطلب:', 'Order Number:')}{' '}
                  <span className="font-mono text-[#A58454]">{completedOrder.orderNumber}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  {t(
                    `شكراً لاختيارك لِـنس كود. تم إرسال تفاصيل الشحنة وفاتورة الشراء إلى ${completedOrder.customer.email}.`,
                    `Thank you for shopping with LensCode. Receipt has been dispatched to ${completedOrder.customer.email}.`
                  )}
                </p>
              </div>

              {/* Order Summary Snapshot */}
              <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 text-start max-w-lg mx-auto space-y-3">
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t('طريقة الدفع:', 'Payment Method:')}</span>
                  <span className="font-semibold text-slate-800 uppercase">
                    {completedOrder.paymentMethod.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t('عنوان التوصيل:', 'Shipping Address:')}</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[240px]">
                    {completedOrder.customer.city} · {completedOrder.customer.district}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                  <span className="text-slate-500">{t('عدد المنتجات:', 'Total Items:')}</span>
                  <span className="font-bold text-slate-800">
                    {completedOrder.items.reduce((s, i) => s + i.quantity, 0)} {t('قطع', 'items')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-sm pt-1">
                  <span className="font-bold font-kufi text-slate-900">
                    {t('المبلغ المدفوع:', 'Total Amount Paid:')}
                  </span>
                  <Price
                    amountSAR={completedOrder.totalSAR}
                    size="md"
                    className="font-bold font-kufi text-[#A58454] text-base"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(true)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#C5A880]" />
                  <span>{t('معايرة وطباعة الفاتورة الضريبية ZATCA', 'Print ZATCA Tax Invoice')}</span>
                </button>

                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
                >
                  {t('العودة للتسوق', 'Return to Store')}
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT FORM */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUMN 1: CLIENT DETAILS, MAP DETECTOR, AND PAYMENTS (Spans 7 columns on desktop) */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Step 1: Shipping and Geographical Location */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-950 text-white text-xs font-bold flex items-center justify-center">
                          1
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 font-kufi">
                          {t('بيانات العميل وعنوان التوصيل', 'Shipping Details')}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-[#A58454]/10 text-[#8C6D3F] text-[10px] font-bold">
                        {currentCountryInfo.flag} {currentCountryInfo.nameAr}
                      </span>
                    </div>

                    {/* Google Maps Automation Simulator Button */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={handleLocateMe}
                        disabled={isLocating}
                        className={`w-full flex items-center justify-center gap-2.5 p-3.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                          isLocateSuccess
                            ? 'bg-emerald-50 text-emerald-800 border-2 border-emerald-300'
                            : 'bg-gradient-to-r from-amber-50 to-orange-50/50 border-2 border-dashed border-amber-300 hover:border-amber-400 text-slate-800 hover:bg-amber-100/50'
                        }`}
                      >
                        {isLocating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                            <span>{t('جاري تحديد موقعك الجغرافي من الخرائط...', 'Fetching location from Google Maps...')}</span>
                          </>
                        ) : isLocateSuccess ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-bounce" />
                            <span>{t('تم تعبئة العنوان بنجاح من خرائط جوجل! ✓', 'Address populated successfully from Google Maps! ✓')}</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-4 h-4 text-[#A58454] animate-pulse" />
                            <span>{t('تحديد موقعي التلقائي عبر الخرائط لسهولة التعبئة 📍', 'Locate Me Automatically via Google Maps 📍')}</span>
                          </>
                        )}
                      </button>
                      <p className="text-[9px] text-slate-400 mt-1 text-center font-sans">
                        {t('قم بتمكين تحديد الموقع لملء تفاصيل الحي والشارع والمدينة بلمسة واحدة تلقائياً', 'Enable location services to auto-fill street and city details with one click')}
                      </p>
                    </div>

                    {/* Basic Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {t('الاسم الثلاثي للمستلم *', 'Full Name *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="أدخل اسمك الكامل"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {t('رقم الجوال لتنسيق التوصيل *', 'Phone Number *')}
                        </label>
                        <div className="relative flex">
                          <span className="inline-flex items-center px-3 rounded-s-xl border border-e-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-mono font-bold">
                            {currentCountryInfo.phoneCode}
                          </span>
                          <input
                            type="tel"
                            required
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="5xxxxxxxx"
                            className="flex-1 text-xs px-3 py-3 rounded-e-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] transition-colors font-mono font-bold"
                          />
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          {t('البريد الإلكتروني لإرسال الفاتورة والضمان *', 'Email for Tax Invoice *')}
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] transition-colors"
                        />
                      </div>
                    </div>

                    {/* DYNAMIC COUNTRY-SPECIFIC SHIPMENT FIELDS (For GCC compliance and OTO Logistics routing) */}
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <span className="block text-xs font-bold text-[#8C6D3F] font-kufi">
                        {t('بيانات العنوان اللوجستية المخصصة لدولتك:', 'Dynamic address inputs customized for your region:')}
                      </span>

                      {/* SAUDI ARABIA ADDRESS FIELDS */}
                      {country === 'SA' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('المدينة *', 'City *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="مثال: الرياض"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('الحي التابع للعاصمة/المدينة *', 'District *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              placeholder="مثال: حي العليا"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('اسم الشارع والوصف الدقيق *', 'Street Address *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="مثال: طريق الملك فهد، بجوار برج المملكة"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('رقم المبنى الوطني', 'Building No')}
                              </label>
                              <input
                                type="text"
                                maxLength={4}
                                value={buildingNumber}
                                onChange={(e) => setBuildingNumber(e.target.value.replace(/\D/g, ''))}
                                placeholder="3474"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1">
                                <span>{t('العنوان المختصر', 'Short Code')}</span>
                                <span title="مثل DMAJ8089">
                                  <Info className="w-3 h-3 text-slate-400 cursor-help" />
                                </span>
                              </label>
                              <input
                                type="text"
                                maxLength={8}
                                value={shortAddressCode}
                                onChange={(e) => setShortAddressCode(e.target.value.toUpperCase())}
                                placeholder="RHOD3474"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* UNITED ARAB EMIRATES ADDRESS FIELDS */}
                      {country === 'AE' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('الإمارة *', 'Emirate *')}
                            </label>
                            <select
                              value={emirate}
                              onChange={(e) => setEmirate(e.target.value)}
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-semibold"
                            >
                              <option value="Dubai">{t('دبي', 'Dubai')}</option>
                              <option value="Abu Dhabi">{t('أبوظبي', 'Abu Dhabi')}</option>
                              <option value="Sharjah">{t('الشارقة', 'Sharjah')}</option>
                              <option value="Ajman">{t('عجمان', 'Ajman')}</option>
                              <option value="Ras Al Khaimah">{t('رأس الخيمة', 'Ras Al Khaimah')}</option>
                              <option value="Fujairah">{t('الفجيرة', 'Fujairah')}</option>
                              <option value="Umm Al Quwain">{t('أم القيوين', 'Umm Al Quwain')}</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('المنطقة/الحي التابع للإمارة *', 'District/Area *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              placeholder="مثال: وسط مدينة دبي"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('اسم الشارع ورقم الفيلا/الشقة والمبنى *', 'Street, Villa & Bldg *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="مثال: بوليفارد الشيخ محمد بن راشد، شقة 104"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('صندوق البريد / الرمز البريدي', 'P.O. Box / Postal Code')}
                            </label>
                            <input
                              type="text"
                              value={postalCode}
                              onChange={(e) => setPostalCode(e.target.value)}
                              placeholder="34123"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                            />
                          </div>
                        </div>
                      )}

                      {/* KUWAIT ADDRESS FIELDS */}
                      {country === 'KW' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('المحافظة/المنطقة السكنية *', 'Governorate/Area *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              placeholder="مثال: السالمية"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('القطعة والشارع والمنزل *', 'Block & Street *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="مثال: شارع سالم المبارك، قطعة 4"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('القطعة / Block *', 'Block *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={block}
                                onChange={(e) => setBlock(e.target.value)}
                                placeholder="4"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('رقم المنزل/الشقة *', 'House/Apt No *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={houseNumber}
                                onChange={(e) => setHouseNumber(e.target.value)}
                                placeholder="12B"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                              <span className="text-red-600 font-bold">{t('الرقم المدني الكويتي *', 'Civil ID *')}</span>
                              <span title="مطلوب للتخليص الجمركي والشحن الدولي">
                                <Info className="w-3 h-3 text-slate-400" />
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={12}
                              value={civilId}
                              onChange={(e) => setCivilId(e.target.value.replace(/\D/g, ''))}
                              placeholder="295081204561"
                              className="w-full text-xs p-3 rounded-xl border border-red-200 bg-white outline-none focus:border-red-400 font-mono font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {/* QATAR ADDRESS FIELDS */}
                      {country === 'QA' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('البلدية *', 'Municipality *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="مثال: الدوحة"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('المنطقة والزون والشارع *', 'District & Zone *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="مثال: الكورنيش، زون 60"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('رقم المنطقة / Zone *', 'Zone *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                placeholder="60"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('رقم المبنى *', 'Building No *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={buildingNumber}
                                onChange={(e) => setBuildingNumber(e.target.value)}
                                placeholder="45"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                              <span className="text-red-600 font-bold">{t('الرقم الشخصي القطري *', 'QID *')}</span>
                              <span title="مطلوب للتخليص الجمركي من قبل OTO">
                                <Info className="w-3 h-3 text-slate-400" />
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={11}
                              value={civilId}
                              onChange={(e) => setCivilId(e.target.value.replace(/\D/g, ''))}
                              placeholder="29712345678"
                              className="w-full text-xs p-3 rounded-xl border border-red-200 bg-white outline-none focus:border-red-400 font-mono font-bold"
                            />
                          </div>
                        </div>
                      )}

                      {/* BAHRAIN ADDRESS FIELDS */}
                      {country === 'BH' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('المحافظة/المدينة *', 'Governorate/City *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="مثال: المنامة"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('الحي أو المنطقة *', 'District *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              placeholder="مثال: الجفير"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('رقم المجمع (Block) والشارع *', 'Block & Road *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="مثال: طريق 2408، مجمع 324"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('مجمع / Block *', 'Block *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={block}
                                onChange={(e) => setBlock(e.target.value)}
                                placeholder="324"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                {t('رقم المبنى/المنزل *', 'Building No *')}
                              </label>
                              <input
                                type="text"
                                required
                                value={buildingNumber}
                                onChange={(e) => setBuildingNumber(e.target.value)}
                                placeholder="120"
                                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454] font-mono"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* OMAN ADDRESS FIELDS */}
                      {country === 'OM' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('المحافظة/المدينة *', 'Governorate/City *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={city}
                              onChange={(e) => setCity(e.target.value)}
                              placeholder="مثال: مسقط"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('الولاية/المنطقة *', 'Wilayat/District *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={district}
                              onChange={(e) => setDistrict(e.target.value)}
                              placeholder="مثال: الخوير"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div className="sm:col-span-2">
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              {t('اسم الشارع والتفاصيل والمعالم البارزة *', 'Street Address *')}
                            </label>
                            <input
                              type="text"
                              required
                              value={address}
                              onChange={(e) => setAddress(e.target.value)}
                              placeholder="مثال: شارع السلطان قابوس، بجوار مسقط مول"
                              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white outline-none focus:border-[#A58454]"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                              <span className="text-red-600 font-bold">{t('رقم الهوية العمانية للمستلم *', 'Civil ID *')}</span>
                              <span title="مطلوب للتخليص الجمركي الدولي">
                                <Info className="w-3 h-3 text-slate-400" />
                              </span>
                            </label>
                            <input
                              type="text"
                              required
                              maxLength={12}
                              value={civilId}
                              onChange={(e) => setCivilId(e.target.value.replace(/\D/g, ''))}
                              placeholder="12345678"
                              className="w-full text-xs p-3 rounded-xl border border-red-200 bg-white outline-none focus:border-red-400 font-mono font-bold"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Payment and Installment Methods (Country Adaptive) */}
                  <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
                    <div className="pb-3 border-b border-slate-100 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                        2
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 font-kufi">
                        {t('طرق الدفع وخيارات التقسيط المعتمدة لدولتك', 'Payment & Installment Options')}
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      
                      {/* Apple Pay - Universally available on Apple Devices for all 6 countries */}
                      {isAppleDevice && (
                        <div
                          onClick={() => setPaymentMethod('apple_pay')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'apple_pay'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PaymentIcons.ApplePay className="h-8 w-auto shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-slate-900">Apple Pay</span>
                              <span className="text-[10px] text-slate-500">
                                {t('دفع فوري بلمسة واحدة من جهازك', 'One-touch secure payment')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'apple_pay' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* SA: Mada Card Payments */}
                      {country === 'SA' && (
                        <div
                          onClick={() => setPaymentMethod('mada')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'mada'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1.5 shrink-0">
                              <PaymentIcons.Mada className="h-6 w-auto" />
                              <div className="flex gap-1">
                                <PaymentIcons.Visa className="h-4 w-auto" />
                                <PaymentIcons.Mastercard className="h-4 w-auto" />
                              </div>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('مدى والبطاقات الائتمانية', 'Mada & Credit Cards')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('دفع آمن ومشفر 100% عبر مدى أو فيزا أو ماستركارد', 'Visa / Mastercard / Mada')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'mada' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* KW: KNET Payments */}
                      {country === 'KW' && (
                        <div
                          onClick={() => setPaymentMethod('knet')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'knet'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 shrink-0">
                              <PaymentIcons.Knet className="h-7 w-auto" />
                              <div className="flex gap-1">
                                <PaymentIcons.Visa className="h-4 w-auto" />
                                <PaymentIcons.Mastercard className="h-4 w-auto" />
                              </div>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('كي نت والبطاقات الائتمانية', 'KNET & Credit Cards')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('دفع كويتي وطني سريع ومؤمن بالكامل', 'Direct KNET bank debit')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'knet' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* BH: Benefit Pay Payments */}
                      {country === 'BH' && (
                        <div
                          onClick={() => setPaymentMethod('benefit')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'benefit'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 shrink-0">
                              <PaymentIcons.Benefit className="h-7 w-auto" />
                              <div className="flex gap-1">
                                <PaymentIcons.Visa className="h-4 w-auto" />
                                <PaymentIcons.Mastercard className="h-4 w-auto" />
                              </div>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('بنفت والبطاقات الائتمانية', 'Benefit & Credit Cards')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('دفع مباشر عبر تطبيق BenefitPay والبطاقات', 'Direct Bahraini benefit debit')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'benefit' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* QA: QPay/NAPS Payments */}
                      {country === 'QA' && (
                        <div
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 shrink-0">
                              <PaymentIcons.QPay className="h-7 w-auto" />
                              <div className="flex gap-1">
                                <PaymentIcons.Visa className="h-4 w-auto" />
                                <PaymentIcons.Mastercard className="h-4 w-auto" />
                              </div>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('كيو باي والبطاقات الوطنية القطرية', 'QPay & Qatari Cards')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('الدفع الإلكتروني الوطني وبطاقات الائتمان', 'Direct QPay debit & Credit cards')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'card' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* OM: OmanNet Payments */}
                      {country === 'OM' && (
                        <div
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1 shrink-0">
                              <PaymentIcons.OmanNet className="h-7 w-auto" />
                              <div className="flex gap-1">
                                <PaymentIcons.Visa className="h-4 w-auto" />
                                <PaymentIcons.Mastercard className="h-4 w-auto" />
                              </div>
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('عمان نت والبطاقات البنكية العمانية', 'OmanNet & Credit Cards')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('دفع آمن بالكامل ومتوافق مع بوابة عمان نت', 'Direct Omani debit cards')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'card' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* AE & General: International Credit Cards */}
                      {country === 'AE' && (
                        <div
                          onClick={() => setPaymentMethod('card')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'card'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex gap-1.5 shrink-0">
                              <PaymentIcons.Visa className="h-6 w-auto" />
                              <PaymentIcons.Mastercard className="h-6 w-auto" />
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('البطاقات الائتمانية والبنكية', 'Credit & Debit Cards')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('دفع آمن 3D Secure مدعوم بالكامل ومحمي', 'Visa & Mastercard international')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'card' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* Tamara 4 Installments - Available in Saudi Arabia */}
                      {country === 'SA' && (
                        <div
                          onClick={() => setPaymentMethod('tamara')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'tamara'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PaymentIcons.Tamara className="h-8 w-auto shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('تقسيط تمارا (4 دفعات)', 'Tamara (4 Installments)')}
                              </span>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Price
                                  amountSAR={cartTotalSAR / 4}
                                  customAmount={country === 'SA' ? undefined : cartTotalLocal / 4}
                                  size="xs"
                                />
                                <span>{t('شهرياً بدون فوائد', '/mo no interest')}</span>
                              </div>
                            </div>
                          </div>
                          {paymentMethod === 'tamara' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* Tabby 4 Installments - Available in SA, AE, KW */}
                      {(country === 'SA' || country === 'AE' || country === 'KW') && (
                        <div
                          onClick={() => setPaymentMethod('tabby')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'tabby'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <PaymentIcons.Tabby className="h-8 w-auto shrink-0" />
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('تقسيط تابي (4 دفعات)', 'Tabby (4 Installments)')}
                              </span>
                              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                <Price
                                  amountSAR={cartTotalSAR / 4}
                                  customAmount={country === 'SA' ? undefined : cartTotalLocal / 4}
                                  size="xs"
                                />
                                <span>{t('شهرياً بدون أي رسوم', '/mo interest-free')}</span>
                              </div>
                            </div>
                          </div>
                          {paymentMethod === 'tabby' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}

                      {/* Cash on Delivery (COD) - Available everywhere except Kuwait as they prefer online */}
                      {country !== 'KW' && (
                        <div
                          onClick={() => setPaymentMethod('cod')}
                          className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
                            paymentMethod === 'cod'
                              ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-bold font-mono">
                              COD
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900">
                                {t('الدفع عند الاستلام', 'Cash on Delivery')}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {t('ادفع نقداً أو ببطاقتك مع مندوب التوصيل', 'Pay at your doorstep')}
                              </span>
                            </div>
                          </div>
                          {paymentMethod === 'cod' && (
                            <CheckCircle2 className="w-4 h-4 text-[#A58454] shrink-0" />
                          )}
                        </div>
                      )}
                    </div>

                    {/* Inline Card SDK container (Fully Integrated directly on checkout page) */}
                    {isCardPayment && (
                      <div className="mt-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl animate-fadeIn space-y-3">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs font-kufi">
                          <CreditCard className="w-4 h-4 text-[#A58454]" />
                          <span>{t('إدخال بيانات البطاقة بأمان في نفس الصفحة', 'Enter Card Details Inline')}</span>
                        </div>
                        <div id="card-sdk-id" className="w-full bg-white rounded-xl min-h-[140px] border border-slate-200 p-2"></div>
                        <div className="flex items-start gap-1.5 text-[9px] text-slate-500 leading-relaxed font-sans">
                          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>
                            {t(
                              'تنبيه أمني: يتم إدخال وتشفير تفاصيل بطاقتك وتمريرها مباشرة عبر خوادم بوابة Tap Payments الآمنة والمتوافقة مع معايير PCI-DSS لضمان خصوصيتك الكاملة. لا نقوم بتخزين أي معلومات على خوادمنا.',
                              'Security Alert: Your payment details are tokenized and processed securely via PCI-DSS compliant Tap Payments servers. No sensitive information is stored in our database.'
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step 3: Loyalty points panel */}
                  <div className="bg-amber-50/50 rounded-2xl border border-amber-200/60 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-amber-100 text-[#8C6D3F] flex items-center justify-center">
                        <Coins className="w-4 h-4 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block font-kufi">
                          {t('استبدال نقاط الولاء (500 نقطة متوفرة)', 'Redeem Loyalty Points (500 pts)')}
                        </span>
                        <span className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                          <span>{t('خصم فوري بقيمة', 'Get an instant')}</span>
                          <Price
                            amountSAR={25}
                            customAmount={country === 'SA' ? undefined : 25 * currentCountryInfo.rateToSAR}
                            size="xs"
                            className="font-bold text-[#8C6D3F]"
                          />
                          <span>{t('يخصم مباشرة من الفاتورة', 'deduction')}</span>
                        </span>
                      </div>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyaltyPoints}
                        onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#A58454]" />
                    </label>
                  </div>
                </div>

                {/* COLUMN 2: SELECTED PRODUCTS REVIEW & ORDER TOTALS (Spans 5 columns on desktop) */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Products purchased summary */}
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-5 space-y-4">
                    <div className="pb-3 border-b border-slate-200/60 flex items-center gap-2">
                      <ShoppingBag className="w-4.5 h-4.5 text-[#A58454]" />
                      <h4 className="text-xs font-bold text-slate-800 font-kufi">
                        {t('المنتجات المحددة للشراء في سلتك', 'Selected Products for Purchase')}
                      </h4>
                      <span className="ms-auto bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[9px] font-bold">
                        {cart.reduce((sum, item) => sum + item.quantity, 0)} {t('قطع', 'items')}
                      </span>
                    </div>

                    {/* Cart Items List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-3 bg-white p-2.5 rounded-xl border border-slate-200/60 shadow-2xs">
                          <div className="relative w-12 h-12 rounded-lg bg-slate-50 border border-slate-100 overflow-hidden shrink-0">
                            <Image
                              src={item.selectedColor?.image || item.product.galleryImages?.[0] || '/images/placeholder.jpg'}
                              fill
                              alt={language === 'ar' ? item.product.nameAr : item.product.nameEn}
                              className="object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h5 className="text-[11px] font-bold text-slate-900 truncate font-kufi">
                              {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                            </h5>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1 font-sans">
                              <span>{t('اللون:', 'Color:')}</span>
                              <span className="font-semibold text-slate-700">
                                {language === 'ar' ? item.selectedColor.nameAr : item.selectedColor.nameEn}
                              </span>
                            </p>
                            {item.lensConfig && (
                              <p className="text-[9px] text-[#A58454] font-semibold font-sans mt-0.5 truncate">
                                {language === 'ar' ? 'عدسات طبية مخصصة' : 'Custom prescription lenses'}
                              </p>
                            )}
                          </div>
                          <div className="text-end shrink-0 flex flex-col justify-between items-end">
                            <span className="text-[10px] text-slate-400 font-sans">
                              x{item.quantity}
                            </span>
                            <Price
                              amountSAR={item.unitPriceSAR * item.quantity}
                              customAmount={country === 'SA' ? undefined : getCartItemLocalPrice(item, country) * item.quantity}
                              size="xs"
                              className="font-bold text-[#A58454]"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order summary calculations */}
                    <div className="border-t border-slate-200/60 pt-3 space-y-2 text-xs text-slate-600">
                      <div className="flex justify-between font-sans">
                        <span>{t('المجموع الفرعي (شامل ضريبة القيمة المضافة):', 'Subtotal (Incl. VAT):')}</span>
                        <Price
                          amountSAR={cartSubtotalSAR}
                          customAmount={country === 'SA' ? undefined : cartSubtotalLocal}
                          size="xs"
                          className="font-bold text-slate-800"
                        />
                      </div>

                      {cartDiscountSAR > 0 && (
                        <div className="flex justify-between text-emerald-700 font-medium font-sans">
                          <span>{t('خصم كوبون التوفير:', 'Promo Discount:')}</span>
                          <Price
                            amountSAR={cartDiscountSAR}
                            customAmount={country === 'SA' ? undefined : cartDiscountLocal}
                            size="xs"
                            prefix="-"
                            className="font-bold"
                          />
                        </div>
                      )}

                      {useLoyaltyPoints && (
                        <div className="flex justify-between text-emerald-700 font-medium font-sans">
                          <span>{t('خصم نقاط الولاء المستبدلة:', 'Loyalty Points Discount:')}</span>
                          <Price
                            amountSAR={25}
                            customAmount={country === 'SA' ? undefined : 25 * currentCountryInfo.rateToSAR}
                            size="xs"
                            prefix="-"
                            className="font-bold"
                          />
                        </div>
                      )}


                      <div className="flex justify-between font-bold text-slate-900 text-sm pt-3 border-t border-slate-200">
                        <span className="font-kufi">{t('الإجمالي النهائي المطلوب سداده:', 'Grand Total Due:')}</span>
                        <Price
                          amountSAR={Math.max(0, cartTotalSAR - loyaltyDiscountSAR)}
                          customAmount={country === 'SA' ? undefined : Math.max(0, cartTotalLocal - (loyaltyDiscountSAR * currentCountryInfo.rateToSAR))}
                          size="sm"
                          className="font-bold font-kufi text-[#A58454]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment security assurance card */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-5 space-y-4 shadow-md text-start">
                    <div className="flex items-center gap-2.5">
                      <ShieldCheck className="w-5 h-5 text-[#C5A880] shrink-0" />
                      <div>
                        <h4 className="text-xs font-bold font-kufi text-white">
                          {t('حماية أمنية مشفرة بـ 256 بت', '256-bit Bank Grade Security')}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                          {t(
                            'تتم معالجة جميع الدفعات بشكل مشفر بالكامل تحت حماية البنك المركزي السعودي SAMA وبوابة الدفع العالمية Tap Payments.',
                            'Compliant with Saudi Central Bank SAMA regulations and backed by Tap Payments gateway.'
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800 pt-3">
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{t('متوافق مع معايير PCI-DSS', 'PCI-DSS Compliant')}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <BadgeCheck className="w-3.5 h-3.5 text-[#C5A880]" />
                        <span>{t('توصيل آمن عبر OTO Logistics', 'Insured GCC OTO Shipping')}</span>
                      </div>
                    </div>

                    {paymentError && (
                      <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs flex items-start gap-2 animate-fadeIn">
                        <X className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                        <div className="flex-1 text-start">
                          <span className="font-bold block mb-0.5">{t('تنبيه بوابة الدفع:', 'Payment Alert:')}</span>
                          <span>{paymentError}</span>
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isProcessingPayment}
                      className={`w-full py-4 rounded-xl bg-gradient-to-r from-[#C5A880] via-[#A58454] to-[#8C6D3F] hover:opacity-95 text-slate-950 font-bold text-xs sm:text-sm tracking-wide transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                        isProcessingPayment ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {isProcessingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                          <span>{t('جاري التفاوض مع بوابة الدفع الآمنة...', 'Processing secure checkout...')}</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4.5 h-4.5" />
                          <span>
                            {t('تأكيد الدفع وشراء المنتجات الآن', 'Confirm Payment & Buy Now')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ZATCA Official Tax Invoice Preview Modal */}
      {showInvoiceModal && completedOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 shadow-2xl space-y-5">
            {/* Invoice Top Header */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="mb-2">
                  <Logo widthDesktop={160} widthMobile={130} />
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  شركة لِـنس كود للبصريات والعدسات الطبية
                </p>
                <p className="text-[10px] text-slate-400">
                  الرقم الضريبي (VAT): 311075666400003 · ترخيص: 0000178830
                </p>
                <p className="text-[10px] text-slate-400">
                  شارع الإمام فيصل بن تركي، حي الديرة، الرياض، المملكة العربية السعودية
                </p>
              </div>

              {/* QR Code Simulation for ZATCA Fatoora */}
              <div className="text-center">
                <div className="w-20 h-20 bg-slate-900 text-white rounded-lg flex items-center justify-center p-1.5 shadow-xs">
                  <QrCode className="w-16 h-16 text-white" />
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1 block">ZATCA QR Valid</span>
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 text-xs gap-3 bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-500 block">رقم الفاتورة:</span>
                <strong className="font-mono text-slate-800">{completedOrder.orderNumber}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">تاريخ الإصدار:</span>
                <strong className="text-slate-800">
                  {new Date(completedOrder.createdAt).toLocaleDateString('ar-SA')}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block">اسم العميل:</span>
                <strong className="text-slate-800">{completedOrder.customer.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block">رقم الجوال:</span>
                <strong className="font-mono text-slate-800">{completedOrder.customer.phone}</strong>
              </div>
            </div>

            {/* Line Items Table */}
            <table className="w-full text-xs text-start">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                  <th className="py-2 text-start">{t('الصنف', 'Item')}</th>
                  <th className="py-2 text-center">{t('الكمية', 'Qty')}</th>
                  <th className="py-2 text-end">{t('السعر', 'Price')}</th>
                  <th className="py-2 text-end">{t('الإجمالي', 'Total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2">
                      <strong className="block text-slate-800">
                        {language === 'ar' ? it.product.nameAr : it.product.nameEn}
                      </strong>
                      <span className="text-[10px] text-slate-400">
                        {language === 'ar' ? it.selectedColor.nameAr : it.selectedColor.nameEn}{' '}
                        {it.lensConfig ? `· Index ${it.lensConfig.lensIndex}` : ''}
                      </span>
                    </td>
                    <td className="py-2 text-center font-mono">{it.quantity}</td>
                    <td className="py-2 text-end font-mono">
                      <Price
                        amountSAR={it.unitPriceSAR}
                        customAmount={country === 'SA' ? undefined : getCartItemLocalPrice(it, country)}
                        size="xs"
                      />
                    </td>
                    <td className="py-2 text-end font-mono font-bold">
                      <Price
                        amountSAR={it.unitPriceSAR * it.quantity}
                        customAmount={country === 'SA' ? undefined : getCartItemLocalPrice(it, country) * it.quantity}
                        size="xs"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="border-t border-slate-200 pt-3 space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>{t('المجموع الفرعي (شامل الضريبة):', 'Subtotal (Incl. VAT):')}</span>
                <Price
                  amountSAR={completedOrder.subtotalSAR}
                  customAmount={country === 'SA' ? undefined : completedOrder.items.reduce((sum, item) => sum + getCartItemLocalPrice(item, country) * item.quantity, 0)}
                  size="xs"
                  className="font-mono"
                />
              </div>
              {completedOrder.discountSAR > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('الخصم:', 'Discount:')}</span>
                  <Price
                    amountSAR={completedOrder.discountSAR}
                    customAmount={country === 'SA' ? undefined : completedOrder.discountSAR * currentCountryInfo.rateToSAR}
                    size="xs"
                    prefix="-"
                    className="font-mono"
                  />
                </div>
              )}
              {completedOrder.loyaltyDiscountSAR > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>{t('خصم نقاط الولاء:', 'Loyalty Points Discount:')}</span>
                  <Price
                    amountSAR={completedOrder.loyaltyDiscountSAR}
                    customAmount={country === 'SA' ? undefined : completedOrder.loyaltyDiscountSAR * currentCountryInfo.rateToSAR}
                    size="xs"
                    prefix="-"
                    className="font-mono"
                  />
                </div>
              )}
              <div className="flex justify-between">
                <span>{t('الشحن والتوصيل:', 'Shipping & Delivery:')}</span>
                <span className="text-emerald-700 font-bold">{t('مجاناً (سريع ومؤمن)', 'Free (Express Insured)')}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
                <span>{t('المبلغ الإجمالي النهائي:', 'Final Grand Total:')}</span>
                <Price
                  amountSAR={completedOrder.totalSAR}
                  customAmount={country === 'SA' ? undefined : completedOrder.totalInSelectedCurrency}
                  size="sm"
                  className="font-mono text-[#A58454]"
                />
              </div>
            </div>

            {/* Print button */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الفاتورة</span>
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 3D Secure Inline iFrame Overlay */}
      {threeDSecureUrl && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col h-full w-full">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#C5A880]" />
              <span className="font-bold font-kufi text-xs sm:text-sm">
                {t('التحقق الآمن ثلاثي الأبعاد (3D Secure)', 'Secure 3D Verification')}
              </span>
            </div>
            <button
              onClick={() => {
                setThreeDSecureUrl(null);
                setIsProcessingPayment(false);
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1 font-bold"
            >
              <X className="w-4 h-4" />
              <span>{t('إلغاء وعودة', 'Cancel & Return')}</span>
            </button>
          </div>
          <div className="flex-1 w-full relative bg-slate-50">
            <iframe
              src={threeDSecureUrl}
              className="w-full h-full border-0 absolute inset-0"
              title="3D Secure Verification"
            />
          </div>
        </div>
      )}

      {/* Interactive Google Maps Modal */}
      <MapsModal
        isOpen={isMapOpen}
        onClose={() => setIsMapOpen(false)}
        onConfirm={handleConfirmMapLocation}
        activeCountry={country}
      />
    </div>
  );
};
