'use client';

import React, { useState, memo } from 'react';
import { useRouter } from 'next/navigation';
import { Product, ProductColorVariant } from '@/types';
import { useApp } from '@/context/AppContext';
import { getBrandName } from '@/lib/brands';
import Image from 'next/image';
import { Heart, ShoppingBag } from 'lucide-react';
import { Price } from './Price';

interface ProductCardProps {
  product: Product;
  className?: string;
  priority?: boolean;
  isCategoryPage?: boolean;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  className = '',
  priority = false,
  isCategoryPage = false,
}) => {
  const router = useRouter();
  const {
    language,
    t,
    addToCart,
    openLensWizard,
    isInWishlist,
    toggleWishlist,
  } = useApp();

  // Active color variant state initialized with the first color variant
  const [selectedColor, setSelectedColor] = useState<ProductColorVariant | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );

  const [hasImageError, setHasImageError] = useState(false);
  const isFavorited = isInWishlist(product.id);
  const hasMultipleColors = Boolean(product.colors && product.colors.length > 1);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedColor) return;
    if (product.category === 'eyeglasses') {
      openLensWizard(product, selectedColor);
    } else {
      addToCart(product, selectedColor, undefined, 1);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedColor) return;
    addToCart(product, selectedColor, undefined, 1);
  };

  const currentImageUrl = selectedColor?.image || product.colors?.[0]?.image || '';

  return (
    <div
      onClick={() => router.push(`/${product.slug}`)}
      onDragStart={(e) => e.preventDefault()}
      className={`group bg-white rounded-xl sm:rounded-2xl border border-slate-100/90 hover:border-slate-300/80 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative select-none ${className}`}
    >
      {/* 1. Media Area - Pure white background matching image background perfectly, with slight height increase on mobile in category pages */}
      <div
        className={`relative w-full ${
          isCategoryPage ? 'aspect-[16/13] sm:aspect-[16/11]' : 'aspect-[16/11]'
        } bg-white flex items-center justify-center p-0.5 sm:p-1.5 overflow-hidden select-none`}
      >
        {/* Brand Tag */}
        <div className="absolute top-1.5 end-1.5 sm:top-2.5 sm:end-2.5 z-10 pointer-events-none select-none">
          <span className="px-1.5 py-0.5 sm:px-2 sm:py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[8px] sm:text-[10px] font-semibold tracking-wide shadow-xs">
            {getBrandName(product.brand, language, true)}
          </span>
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className={`absolute top-1.5 start-1.5 sm:top-2.5 sm:start-2.5 z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-xs ${
            isFavorited
              ? 'bg-rose-50 text-rose-600'
              : 'bg-white/90 text-slate-400 hover:text-rose-500'
          }`}
          title={isFavorited ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isFavorited ? 'fill-rose-600 text-rose-600' : ''}`} />
        </button>

        {/* Product Image - Zoomed slightly, with increased zoom on mobile category pages */}
        <div
          className={`relative w-full h-full flex items-center justify-center ${
            isCategoryPage ? 'scale-[1.17] sm:scale-[1.08]' : 'scale-[1.08]'
          } ${
            isCategoryPage ? 'group-hover:scale-[1.22] sm:group-hover:scale-[1.13]' : 'group-hover:scale-[1.13]'
          } transition-transform duration-500 ease-out select-none pointer-events-none`}
        >
          {currentImageUrl && !hasImageError ? (
            <Image
              src={currentImageUrl}
              alt={language === 'ar' ? product.nameAr : product.nameEn}
              fill
              priority={priority}
              sizes="(max-width: 640px) 180px, (max-width: 1024px) 33vw, 25vw"
              referrerPolicy="no-referrer"
              className={`object-contain ${
                isCategoryPage ? 'p-0 sm:p-1' : 'p-0.5 sm:p-1'
              } pointer-events-none select-none`}
              draggable={false}
              onError={() => setHasImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300 text-xs font-kufi">
              <span>{getBrandName(product.brand, language, true)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Product Information Area */}
      <div className={`p-2 sm:p-3 flex-1 flex flex-col justify-between ${isCategoryPage ? 'pt-1 sm:pt-3' : ''}`}>
        <div>
          {/* Price */}
          <div className="flex items-center justify-between gap-1 mb-0.5 sm:mb-1">
            <Price
              amountSAR={product.basePriceSAR}
              size="xs"
              className="text-xs sm:text-base font-bold font-kufi text-slate-900"
            />
          </div>

          {/* Product Title with Selected Color Name (Only when product has multiple color variants) */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#A58454] transition-colors leading-snug truncate">
            {language === 'ar' ? product.nameAr : product.nameEn}
            {hasMultipleColors && selectedColor && (
              <span className="text-slate-600 font-medium">
                {` - ${language === 'ar' ? selectedColor.nameAr : selectedColor.nameEn}`}
              </span>
            )}
          </h3>

          {/* Subtitle / Model Info */}
          <p className="text-[9.5px] sm:text-xs text-slate-400 mt-0.5 line-clamp-1 font-sans">
            {language === 'ar'
              ? product.shortDescriptionAr || product.descriptionAr
              : product.shortDescriptionEn || product.descriptionEn}
          </p>
        </div>

        {/* Color Swatches - Subtly smaller on mobile category pages */}
        {hasMultipleColors && (
          <div className={`${isCategoryPage ? 'mt-1 pt-1 sm:mt-1.5 sm:pt-1.5' : 'mt-1.5 pt-1.5'} border-t border-slate-100`}>
            <div className="flex items-center justify-between gap-1">
              <div className={`flex items-center ${isCategoryPage ? 'gap-1 sm:gap-1.5' : 'gap-1.5'} flex-wrap`}>
                {product.colors.slice(0, 4).map((color) => {
                  const isSelected = selectedColor?.id === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHasImageError(false);
                        setSelectedColor(color);
                      }}
                      className={`${
                        isCategoryPage
                          ? 'w-2.5 h-2.5 sm:w-4 sm:h-4'
                          : 'w-3.5 h-3.5 sm:w-4 sm:h-4'
                      } rounded-full transition-all cursor-pointer relative flex items-center justify-center ${
                        isSelected
                          ? 'ring-1.5 ring-offset-1 ring-slate-900 scale-110'
                          : 'hover:scale-110 opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={language === 'ar' ? color.nameAr : color.nameEn}
                    >
                      {isSelected && (
                        <span className={`${isCategoryPage ? 'w-0.5 h-0.5' : 'w-0.5 h-0.5 sm:w-1 sm:h-1'} rounded-full bg-white shadow-xs`} />
                      )}
                    </button>
                  );
                })}
                {product.colors.length > 4 && (
                  <span className={`${isCategoryPage ? 'text-[7.5px] sm:text-[9.5px]' : 'text-[8.5px] sm:text-[9.5px]'} text-slate-400 font-medium`}>
                    +{product.colors.length - 4}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Row - In category pages on mobile, buy now and add to cart buttons are removed completely */}
        <div
          className={`${
            isCategoryPage ? 'hidden sm:flex' : 'flex'
          } ${hasMultipleColors ? 'mt-1.5 sm:mt-2' : 'mt-2 sm:mt-2.5'} items-center gap-1 sm:gap-1.5`}
        >
          <button
            type="button"
            onClick={handleBuyNow}
            className="flex-1 py-1 sm:py-1.5 px-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[10px] sm:text-xs font-bold transition-colors shadow-xs cursor-pointer text-center truncate"
          >
            {t('شراء الآن', 'Buy Now')}
          </button>

          <button
            type="button"
            onClick={handleQuickAdd}
            className="p-1 sm:p-1.5 rounded-lg border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-slate-800 transition-colors cursor-pointer shrink-0"
            title={t('أضف للسلة', 'Add to Cart')}
          >
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent);

