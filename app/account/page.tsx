'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { SeoHead } from '@/components/SeoHead';
import { Price } from '@/components/Price';
import {
  User,
  Package,
  Heart,
  FileText,
  MapPin,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Save,
  CheckCircle2,
  AlertCircle,
  Eye,
  Calendar,
  Truck,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const {
    currentUser,
    userProfile,
    isAuthLoading,
    isAdmin,
    setIsAdminOpen,
    logout,
    updateProfileData,
    orders,
    wishlistIds,
    products,
    language,
    country,
    currentCountryInfo,
    t,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'prescription' | 'wishlist'>('profile');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');

  // Prescription fields
  const [sphereRight, setSphereRight] = useState('');
  const [sphereLeft, setSphereLeft] = useState('');
  const [cylinderRight, setCylinderRight] = useState('');
  const [cylinderLeft, setCylinderLeft] = useState('');
  const [axisRight, setAxisRight] = useState('');
  const [axisLeft, setAxisLeft] = useState('');
  const [pd, setPd] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state when userProfile loads
  useEffect(() => {
    if (userProfile) {
      setDisplayName(userProfile.displayName || '');
      setPhone(userProfile.phoneNumber || '');
      setCity(userProfile.city || '');
      setDistrict(userProfile.district || '');
      setAddress(userProfile.address || '');

      if (userProfile.savedPrescription) {
        setSphereRight(userProfile.savedPrescription.sphereRight || '');
        setSphereLeft(userProfile.savedPrescription.sphereLeft || '');
        setCylinderRight(userProfile.savedPrescription.cylinderRight || '');
        setCylinderLeft(userProfile.savedPrescription.cylinderLeft || '');
        setAxisRight(userProfile.savedPrescription.axisRight || '');
        setAxisLeft(userProfile.savedPrescription.axisLeft || '');
        setPd(userProfile.savedPrescription.pd || '');
      }
    }
  }, [userProfile]);

  // Protect route
  useEffect(() => {
    if (!isAuthLoading && !currentUser) {
      router.push('/login');
    }
  }, [isAuthLoading, currentUser, router]);

  if (isAuthLoading || !currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#A58454] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            {t('جاري تحميل بيانات حسابك...', 'Loading account details...')}
          </p>
        </div>
      </div>
    );
  }

  // Filter orders matching current customer email
  const userOrders = orders.filter(
    (o) =>
      o.customer?.email?.toLowerCase().trim() === currentUser.email?.toLowerCase().trim()
  );

  // Wishlist products
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);
    try {
      await updateProfileData({
        displayName,
        phoneNumber: phone,
        city,
        district,
        address,
        savedPrescription: {
          sphereRight,
          sphereLeft,
          cylinderRight,
          cylinderLeft,
          axisRight,
          axisLeft,
          pd,
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  return (
    <div className="bg-white min-h-screen pb-16">
      <SeoHead
        title={language === 'ar' ? 'حسابي الشخصي' : 'My Account'}
        description={
          language === 'ar'
            ? 'لوحة إدارة الحساب الشخصي لعملاء متجر لنس كود: تتبع الطلبات، الوصفات الطبية، والعناوين.'
            : 'LensCode customer account portal: track orders, saved optical prescriptions, and shipping addresses.'
        }
      />

      {/* Breadcrumbs */}
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
            <span className="text-slate-900 font-semibold">{t('حسابي الشخصي', 'My Account')}</span>
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-3 py-1.5 rounded-full border border-rose-200/60 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t('تسجيل الخروج', 'Sign Out')}</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* User Hero Banner */}
        <div className="bg-slate-950 text-white rounded-3xl p-6 sm:p-8 mb-8 border border-slate-900 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-[#A58454]/20 border-2 border-[#A58454] flex items-center justify-center text-xl font-bold font-kufi text-[#D8B480] shrink-0 overflow-hidden">
              {currentUser.photoURL ? (
                <Image
                  src={currentUser.photoURL}
                  alt={currentUser.displayName || 'Avatar'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{(userProfile?.displayName || currentUser.displayName || 'U')[0].toUpperCase()}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold font-kufi text-white">
                  {userProfile?.displayName || currentUser.displayName || t('عميل لنس كود المميز', 'Valued Customer')}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold font-mono">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t('حساب موثق', 'Verified')}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{currentUser.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="block text-lg font-bold text-[#D8B480]">{userOrders.length}</span>
              <span className="text-[10px] text-slate-400">{t('الطلبات', 'Orders')}</span>
            </div>
            <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-center">
              <span className="block text-lg font-bold text-[#D8B480]">{wishlistProducts.length}</span>
              <span className="text-[10px] text-slate-400">{t('المفضلة', 'Wishlist')}</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation & Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar Tabs */}
          <div className="lg:col-span-3 space-y-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`w-full p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <User className={`w-4 h-4 ${activeTab === 'profile' ? 'text-[#C5A880]' : 'text-slate-400'}`} />
              <span>{t('البيانات الشخصية والعناوين', 'Personal Info & Addresses')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`w-full p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Package className={`w-4 h-4 ${activeTab === 'orders' ? 'text-[#C5A880]' : 'text-slate-400'}`} />
                <span>{t('سجل طلباتي وتتبعها', 'My Orders & Tracking')}</span>
              </div>
              {userOrders.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#A58454] text-white text-[10px] font-bold">
                  {userOrders.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('prescription')}
              className={`w-full p-3.5 rounded-2xl text-xs font-bold flex items-center gap-3 transition-all cursor-pointer ${
                activeTab === 'prescription'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <Eye className={`w-4 h-4 ${activeTab === 'prescription' ? 'text-[#C5A880]' : 'text-slate-400'}`} />
              <span>{t('مقاسات النظر المحفوظة', 'Saved Vision Prescription')}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('wishlist')}
              className={`w-full p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                activeTab === 'wishlist'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Heart className={`w-4 h-4 ${activeTab === 'wishlist' ? 'text-rose-400' : 'text-slate-400'}`} />
                <span>{t('قائمة المفضلة', 'My Wishlist')}</span>
              </div>
              {wishlistProducts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                  {wishlistProducts.length}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                type="button"
                onClick={() => setIsAdminOpen(true)}
                className="w-full p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer bg-amber-50/70 hover:bg-amber-100 text-[#8C6D3F] border border-[#A58454]/40 mt-4 shadow-3xs"
              >
                <div className="flex items-center gap-3">
                  <SlidersHorizontal className="w-4 h-4 text-[#A58454]" />
                  <span>{t('لوحة الإدارة والمتجر', 'Store Admin Panel')}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#A58454] text-white text-[9px] font-bold">
                  ADMIN
                </span>
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9">
            {/* TAB 1: Profile & Address */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-kufi text-slate-900">
                      {t('البيانات الشخصية وعناوين التوصيل', 'Personal Profile & Shipping Address')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('تُستخدم هذه البيانات لملء معلومات الشحن تلقائياً عند إتمام الطلب', 'Auto-fills shipping at checkout')}
                    </p>
                  </div>
                  {savedSuccess && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('تم حفظ التعديلات بنجاح', 'Saved successfully!')}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('الاسم الكامل', 'Full Name')}
                      </label>
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('البريد الإلكتروني (المسجل)', 'Email Address')}
                      </label>
                      <input
                        type="email"
                        disabled
                        dir="ltr"
                        value={currentUser.email || ''}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed text-start font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('رقم الجوال للتوصيل', 'Phone Number')}
                      </label>
                      <input
                        type="tel"
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+966 5x xxx xxxx"
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 outline-hidden text-start font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('المدينة', 'City')}
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder={t('مثال: الرياض / جدة', 'e.g. Riyadh / Jeddah')}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('الحي', 'District')}
                      </label>
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder={t('مثال: حي النخيل', 'e.g. Al Nakheel')}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        {t('العنوان التفصيلي / الشارع', 'Detailed Address / Street')}
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder={t('اسم الشارع، رقم المبنى أو الشقة', 'Street name, building or apt')}
                        className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 focus:border-[#A58454] focus:ring-2 focus:ring-[#A58454]/20 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-[#C5A880] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ التعديلات', 'Save Changes')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 2: Orders */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                  <h2 className="text-lg font-bold font-kufi text-slate-900 mb-1">
                    {t('سجل الطلبات السابقة', 'Order History')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('تتبع حالة جميع طلباتك والشحنات ومشترياتك السابقة', 'Live status & details for your optical orders')}
                  </p>
                </div>

                {userOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
                    <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">
                      {t('لا توجد طلبات مسجلة بعد', 'No orders found yet')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {t('لم تقم بإجراء أي طلب حتى الآن. تصفح المتجر واختر إطاراتك وعدساتك المفضلة الآن.', 'Explore our collection to place your first luxury optical order.')}
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-2xl bg-slate-950 text-[#C5A880] text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t('تصفح المتجر الآن', 'Shop Collection')}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                              {t('رقم الطلب', 'Order #')}
                            </span>
                            <span className="text-xs font-bold font-mono text-slate-900">{order.orderNumber}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(order.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}</span>
                            </span>
                            <span
                              className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                                order.status === 'delivered'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : order.status === 'shipped'
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}
                            >
                              {order.status === 'delivered'
                                ? t('تم التوصيل', 'Delivered')
                                : order.status === 'shipped'
                                ? t('تم الشحن', 'Shipped')
                                : t('قيد التجهيز', 'Processing')}
                            </span>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="py-3 flex items-center justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 p-1 shrink-0 relative flex items-center justify-center">
                                  <Image
                                    src={item.selectedColor?.image || '/images/prod_acetate.webp'}
                                    alt={item.product.nameAr}
                                    fill
                                    sizes="48px"
                                    className="object-contain p-1"
                                  />
                                </div>
                                <div>
                                  <h4 className="text-xs font-bold text-slate-900">
                                    {language === 'ar' ? item.product.nameAr : item.product.nameEn}
                                  </h4>
                                  <p className="text-[11px] text-slate-500">
                                    {t('الكمية:', 'Qty:')} {item.quantity} | {item.selectedColor?.nameAr || item.selectedColor?.nameEn}
                                  </p>
                                </div>
                              </div>

                              <Price
                                amountSAR={item.unitPriceSAR * item.quantity}
                                className="text-xs font-bold text-slate-900"
                              />
                            </div>
                          ))}
                        </div>

                        {/* Order Footer */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-600">{t('إجمالي الطلب:', 'Order Total:')}</span>
                          <Price
                            amountSAR={order.totalSAR}
                            size="md"
                            className="font-bold font-kufi text-[#8C6D3F] text-sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Prescription */}
            {activeTab === 'prescription' && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
                <div className="border-b border-slate-100 pb-4 mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold font-kufi text-slate-900">
                      {t('مقاسات النظر والوصفة الطبية المحفوظة', 'Saved Optical Prescription')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t('احفظ كشف نظرك هنا ليتم تطبيقه تلقائياً عند طلب أي نظارة طبية أو عدسات', 'Saves your vision numbers for 1-click lens customization')}
                    </p>
                  </div>
                  {savedSuccess && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t('تم حفظ المقاسات', 'Prescription saved!')}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Right Eye (OD) */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-[#A58454]/20 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#A58454]" />
                      <span>{t('العين اليمنى (OD - Right Eye)', 'Right Eye (OD)')}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('درجة النظر (SPH)', 'Sphere (SPH)')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={sphereRight}
                          onChange={(e) => setSphereRight(e.target.value)}
                          placeholder="-2.50"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('الانحراف / الاستجماتيزم (CYL)', 'Cylinder (CYL)')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={cylinderRight}
                          onChange={(e) => setCylinderRight(e.target.value)}
                          placeholder="-0.75"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('محور الانحراف (AXIS)', 'Axis (AXIS)')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={axisRight}
                          onChange={(e) => setAxisRight(e.target.value)}
                          placeholder="180°"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Left Eye (OS) */}
                  <div className="p-4 rounded-2xl bg-amber-50/50 border border-[#A58454]/20 space-y-3">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#A58454]" />
                      <span>{t('العين اليسرى (OS - Left Eye)', 'Left Eye (OS)')}</span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('درجة النظر (SPH)', 'Sphere (SPH)')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={sphereLeft}
                          onChange={(e) => setSphereLeft(e.target.value)}
                          placeholder="-2.25"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('الانحراف / الاستجماتيزم (CYL)', 'Cylinder (CYL)')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={cylinderLeft}
                          onChange={(e) => setCylinderLeft(e.target.value)}
                          placeholder="-0.50"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          {t('محور الانحراف (AXIS)', 'Axis (AXIS)')}
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={axisLeft}
                          onChange={(e) => setAxisLeft(e.target.value)}
                          placeholder="175°"
                          className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pupillary Distance (PD) */}
                  <div className="max-w-xs">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      {t('المسافة بين البؤبؤين (PD)', 'Pupillary Distance (PD)')}
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={pd}
                      onChange={(e) => setPd(e.target.value)}
                      placeholder="63 mm"
                      className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 bg-white focus:border-[#A58454] outline-hidden font-mono"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-3 rounded-2xl bg-slate-950 hover:bg-slate-800 text-[#C5A880] font-bold text-xs flex items-center gap-2 transition-all shadow-md cursor-pointer disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? t('جاري الحفظ...', 'Saving...') : t('حفظ مقاسات النظر', 'Save Prescription')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* TAB 4: Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
                  <h2 className="text-lg font-bold font-kufi text-slate-900 mb-1">
                    {t('المنتجات المحفوظة في المفضلة', 'Saved Wishlist Items')}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {t('الإطارات والعدسات المفضلة لديك للرجوع إليها وإضافتها لسلة التسوق في أي وقت', 'Quick access to your curated optical favorites')}
                  </p>
                </div>

                {wishlistProducts.length === 0 ? (
                  <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">
                      {t('قائمة المفضلة فارغة حالياً', 'Your wishlist is empty')}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      {t('اضغط على علامة القلب بجانب أي نظارة أو عدسة لحفظها في قائمتك المفضلة والرجوع إليها لاحقاً.', 'Click the heart icon on any frame to save it to your wishlist.')}
                    </p>
                    <Link
                      href="/shop"
                      className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-2xl bg-slate-950 text-[#C5A880] text-xs font-bold hover:bg-slate-800 transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{t('استكشف التشكيلة الفاخرة', 'Discover Collection')}</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {wishlistProducts.map((product) => (
                      <Link
                        key={product.id}
                        href={`/${product.slug || product.id}`}
                        className="bg-white rounded-2xl border border-slate-200/80 p-4 hover:shadow-md transition-all group flex flex-col justify-between"
                      >
                        <div className="relative aspect-square w-full rounded-xl bg-slate-50 mb-3 flex items-center justify-center overflow-hidden">
                          <Image
                            src={product.colors[0]?.image || '/images/prod_acetate.webp'}
                            alt={product.nameAr}
                            fill
                            sizes="200px"
                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-[#8C6D3F] uppercase tracking-wider block">
                            {product.brand}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-[#8C6D3F] transition-colors">
                            {language === 'ar' ? product.nameAr : product.nameEn}
                          </h4>
                          <div className="mt-2 flex items-center justify-between">
                            <Price amountSAR={product.basePriceSAR} className="text-xs font-bold text-slate-900" />
                            <span className="text-[11px] font-semibold text-[#8C6D3F] flex items-center gap-0.5">
                              <span>{t('عرض التفاصيل', 'View')}</span>
                              <ChevronLeft className="w-3.5 h-3.5" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
