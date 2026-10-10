'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { X, Heart, ShoppingBag, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { Price } from './Price';
import { getBrandName } from '@/lib/brands';

export const WishlistDrawer: React.FC = () => {
  const router = useRouter();
  const {
    isWishlistOpen,
    setIsWishlistOpen,
    wishlistIds,
    products,
    toggleWishlist,
    formatPrice,
    addToCart,
    language,
    t,
  } = useApp();

  if (!isWishlistOpen) return null;

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      <div
        onClick={() => setIsWishlistOpen(false)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 end-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
              <h2 className="text-base font-bold font-kufi">
                {t('قائمة أمنياتي', 'My Wishlist')}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                ({wishlistProducts.length})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsWishlistOpen(false)}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {wishlistProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mb-3">
                  <Heart className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900 font-kufi mb-1">
                  {t('قائمة أمنياتك فارغة', 'Your wishlist is empty')}
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-4">
                  {t('انقر على أيقونة القلب على أي نظارة لحفظها والرجوع إليها لاحقاً.', 'Click the heart icon on any eyewear to save it.')}
                </p>
              </div>
            ) : (
              wishlistProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3.5 p-3 rounded-2xl border border-slate-100 bg-[#FAFAFA] hover:border-slate-200 transition-all"
                >
                  <div
                    onClick={() => {
                      setIsWishlistOpen(false);
                      router.push(`/${product.slug}`);
                    }}
                    className="relative w-16 h-16 bg-white rounded-xl overflow-hidden border border-slate-200/60 p-1 shrink-0 flex items-center justify-center cursor-pointer"
                  >
                    <Image
                      src={product.colors[0]?.image || '/images/prod_acetate.webp'}
                      alt={product.nameAr}
                      fill
                      sizes="64px"
                      referrerPolicy="no-referrer"
                      className="object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-[#8C6D3F] uppercase block">
                      {getBrandName(product.brand, language)}
                    </span>
                    <h4
                      onClick={() => {
                        setIsWishlistOpen(false);
                        router.push(`/${product.slug}`);
                      }}
                      className="text-xs sm:text-sm font-bold text-slate-900 truncate cursor-pointer hover:text-[#A58454]"
                    >
                      {language === 'ar' ? product.nameAr : product.nameEn}
                    </h4>
                    <Price
                      amountSAR={product.basePriceSAR}
                      size="xs"
                      className="text-xs font-bold font-kufi text-slate-900 block mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => addToCart(product, product.colors[0])}
                      className="p-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                      title={t('أضف للسلة', 'Add to bag')}
                    >
                      <ShoppingBag className="w-4 h-4 text-[#C5A880]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleWishlist(product.id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 transition-colors"
                      title={t('حذف', 'Remove')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
