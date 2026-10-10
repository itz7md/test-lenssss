'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { X, Search, Truck, CheckCircle2, Clock, PackageCheck, MapPin } from 'lucide-react';

export const TrackOrderModal: React.FC = () => {
  const { isTrackOrderOpen, setIsTrackOrderOpen, orders, language, t } = useApp();
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<any>(null);

  if (!isTrackOrderOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const clean = query.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.orderNumber.toLowerCase() === clean ||
        o.customer.phone.includes(clean) ||
        o.customer.email.toLowerCase() === clean
    );

    setMatchedOrder(found || null);
    setSearched(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Truck className="w-5 h-5 text-[#C5A880]" />
            <div>
              <h2 className="text-base font-bold font-kufi">
                {t('تتبع حالة الشحنة والطلب', 'Track Your Order')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('شحن فوري ومباشر بالتعاون مع سمسا وأرامكس', 'Real-time express logistics')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTrackOrderOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('أدخل رقم الطلب (مثل LC-9021) أو رقم الجوال', 'Enter order # (e.g. LC-9021) or phone')}
                className="w-full text-xs ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#A58454]"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {t('بحث', 'Track')}
            </button>
          </form>

          {searched && (
            matchedOrder ? (
              <div className="space-y-4 pt-2">
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block">{t('رقم الطلب:', 'Order #:')}</span>
                    <strong className="text-base font-mono text-slate-900">
                      {matchedOrder.orderNumber}
                    </strong>
                  </div>
                  <div className="text-end">
                    <span className="text-slate-500 block">{t('شركة الشحن:', 'Carrier:')}</span>
                    <span className="font-bold text-slate-800 font-mono">
                      SMSA Express #982310
                    </span>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4 ps-2 pt-2">
                  {[
                    {
                      labelAr: 'تم استلام وتأكيد الطلب',
                      labelEn: 'Order Confirmed',
                      done: true,
                      date: 'اليوم، 09:30 ص',
                    },
                    {
                      labelAr: 'تجهيز وقص العدسات والفحص الضوئي بالمعمل',
                      labelEn: 'Lens Customization & Quality Lab',
                      done: true,
                      date: 'اليوم، 11:15 ص',
                    },
                    {
                      labelAr: 'تم تسليم الشحنة لشركة النقل',
                      labelEn: 'Dispatched to Courier',
                      done: matchedOrder.status === 'shipped' || matchedOrder.status === 'delivered',
                      date: 'متوقع خلال ساعتين',
                    },
                    {
                      labelAr: 'جاري التوصيل لباب منزلك',
                      labelEn: 'Out for Delivery',
                      done: matchedOrder.status === 'delivered',
                      date: 'خلال اليوم',
                    },
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 relative">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-white text-xs ${
                          step.done ? 'bg-emerald-600' : 'bg-slate-200 text-slate-400'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`text-xs font-bold ${
                            step.done ? 'text-slate-900' : 'text-slate-400'
                          }`}
                        >
                          {language === 'ar' ? step.labelAr : step.labelEn}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-sans">
                          {step.date}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                {t(
                  'لم يتم العثور على طلب بهذا الرقم. تأكد من إدخال رقم الطلب بشكل صحيح.',
                  'No order found matching these details. Please verify your order number.'
                )}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
