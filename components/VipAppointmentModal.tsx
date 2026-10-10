'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  X,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  Phone,
  User,
  CheckCircle2,
  Send,
  Glasses,
  Building,
  Car,
} from 'lucide-react';

export const VipAppointmentModal: React.FC = () => {
  const { isVipModalOpen, setIsVipModalOpen, language, t, bookAppointment, currentCountryInfo } =
    useApp();

  const [type, setType] = useState<'home_vip' | 'clinic'>('home_vip');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [preferredTime, setPreferredTime] = useState('06:00 مساءً - 08:00 مساءً');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedAptId, setConfirmedAptId] = useState<string | null>(null);

  if (!isVipModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !phone) return;

    const newApt = bookAppointment({
      type,
      customerName,
      phone: `${currentCountryInfo.phoneCode}${phone.replace(/^0+/, '')}`,
      city,
      district,
      address,
      preferredDate,
      preferredTime,
      notes,
    });

    setConfirmedAptId(newApt.id);
    setIsSuccess(true);
  };

  const handleClose = () => {
    setIsSuccess(false);
    setIsVipModalOpen(false);
  };

  const whatsappMessage = encodeURIComponent(
    `مرحباً لِـنس كود، أود تأكيد حجز موعد ${
      type === 'home_vip' ? 'زيارة فحص منزلي VIP 🚘' : 'فحص نظر في الفرع 🏥'
    }\nالاسم: ${customerName}\nالمدينة: ${city} - ${district}\nالموعد: ${preferredDate} (${preferredTime})`
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#A58454]/20 border border-[#A58454]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#C5A880]" />
            </div>
            <div>
              <h2 className="text-base font-bold font-kufi">
                {t('خدمة فحص النظر VIP', 'VIP Vision Care Concierge')}
              </h2>
              <p className="text-[11px] text-slate-400">
                {t('أخصائي بصريات مرخص وأحدث أجهزة الفحص الرقمية', 'Licensed optometrist & precision digital suite')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {isSuccess ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold font-kufi text-slate-900">
                {t('تم تسجيل طلب الموعد بنجاح!', 'Appointment Requested Successfully!')}
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                {t(
                  `شكراً لك ${customerName}. تم تأكيد رغبتك بالموعد بتاريخ ${preferredDate}. سيتواصل معك فريق خدمة كبار العملاء خلال ساعتين للتأكيد النهائي.`,
                  `Thank you ${customerName}. Your appointment for ${preferredDate} has been registered. Our concierge team will reach out to you shortly.`
                )}
              </p>

              {/* WhatsApp Quick Confirmation Action */}
              <div className="pt-3">
                <a
                  href={`https://wa.me/966556359090?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('تأكيد فوري عبر واتساب (WhatsApp)', 'Instant WhatsApp Confirmation')}</span>
                </a>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                >
                  {t('إغلاق والعودة للتسوق', 'Close and Return to Shop')}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('home_vip')}
                  className={`p-3.5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                    type === 'home_vip'
                      ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Car className="w-4 h-4 text-[#A58454]" />
                    <span className="text-xs font-bold text-slate-900">
                      {t('زيارة منزلية VIP 🚘', 'VIP Home Visit 🚘')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('فحص منزلي وحقيبة إطارات فاخرة لباب منزلك', 'Mobile clinic & frame suitcase to your home')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setType('clinic')}
                  className={`p-3.5 rounded-2xl border-2 text-start transition-all cursor-pointer ${
                    type === 'clinic'
                      ? 'border-[#A58454] bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Building className="w-4 h-4 text-[#A58454]" />
                    <span className="text-xs font-bold text-slate-900">
                      {t('فحص في الفرع 🏥', 'In-Clinic Appointment 🏥')}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t('زيارة أقرب مركز بصريات معتمد لدينا', 'Visit our flagship optical center')}
                  </p>
                </button>
              </div>

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('الاسم بالكامل *', 'Full Name *')}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute start-3 top-3" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={t('حمد المنصور', 'Hamad Al-Mansoor')}
                      className="w-full text-xs ps-9 pe-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#A58454]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('رقم الجوال *', 'Phone Number *')}
                  </label>
                  <div className="relative flex">
                    <span className="inline-flex items-center px-2.5 rounded-s-xl border border-e-0 border-slate-200 bg-slate-100 text-slate-600 text-xs font-mono">
                      {currentCountryInfo.phoneCode}
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="556359090"
                      className="flex-1 text-xs px-3 py-2.5 rounded-e-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#A58454] font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('المدينة *', 'City *')}
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                  >
                    <option value="الرياض">الرياض (Riyadh)</option>
                    <option value="جدة">جدة (Jeddah)</option>
                    <option value="الدمام">الدمام (Dammam)</option>
                    <option value="الخبر">الخبر (Khobar)</option>
                    <option value="الكويت">مدينة الكويت (Kuwait City)</option>
                    <option value="دبي">دبي (Dubai)</option>
                    <option value="أبوظبي">أبوظبي (Abu Dhabi)</option>
                    <option value="الدوحة">الدوحة (Doha)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('الحي *', 'District *')}
                  </label>
                  <input
                    type="text"
                    required
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder={t('حي حطين / النرجس', 'e.g. Al-Hittin')}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white outline-none focus:border-[#A58454]"
                  />
                </div>
              </div>

              {/* Address (for home VIP) */}
              {type === 'home_vip' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('تفاصيل العنوان / الشارع أو الفيلا', 'Street / Villa Address')}
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('شارع الأمير تركي، فيلا 12', 'e.g. Prince Turki St, Villa 12')}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                  />
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('التاريخ المفضل *', 'Preferred Date *')}
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t('الفترة الزمنية المفضلة', 'Preferred Time Slot')}
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none"
                  >
                    <option value="10:00 صباحاً - 12:00 ظهراً">10:00 AM - 12:00 PM</option>
                    <option value="01:00 ظهراً - 03:00 مساءً">01:00 PM - 03:00 PM</option>
                    <option value="04:00 مساءً - 06:00 مساءً">04:00 PM - 06:00 PM</option>
                    <option value="06:00 مساءً - 08:00 مساءً">06:00 PM - 08:00 PM</option>
                    <option value="08:00 مساءً - 10:00 مساءً">08:00 PM - 10:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {t('ملاحظات خاصة أو رغبة في تجربة ماركات محددة', 'Notes or Preferred Brands')}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t('أرغب في تجربة إطارات التيتانيوم الإيطالية من Yuva وفحص لشخصين', 'e.g. Bring titanium frames and rimless models')}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 outline-none resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm tracking-wide transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4 text-[#C5A880]" />
                <span>{t('تأكيد حجز الموعد مجاناً', 'Confirm Appointment Request')}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
