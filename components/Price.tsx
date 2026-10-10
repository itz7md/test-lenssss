'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SaudiRiyal } from './SaudiRiyal';

interface PriceProps {
  amountSAR: number;
  customAmount?: number;
  originalAmountSAR?: number;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showCurrency?: boolean;
  prefix?: string;
  suffix?: string;
}

export const Price: React.FC<PriceProps> = ({
  amountSAR,
  customAmount,
  originalAmountSAR,
  className = '',
  size = 'md',
  showCurrency = true,
  prefix = '',
  suffix = '',
}) => {
  const { country, formatPrice, currentCountryInfo } = useApp();

  const isSaudi = country === 'SA';
  
  const numericValue = customAmount !== undefined
    ? (() => {
        const isHighPrecisionCurrency = ['KWD', 'BHD', 'OMR'].includes(currentCountryInfo.currencyEn);
        return isHighPrecisionCurrency
          ? customAmount.toFixed(3)
          : customAmount % 1 === 0
          ? customAmount.toFixed(0)
          : customAmount.toFixed(1);
      })()
    : formatPrice(amountSAR, false);

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
    xl: 'w-5 h-5',
    '2xl': 'w-6 h-6',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-kufi font-bold tabular-nums ${className}`}>
      {prefix && <span className="font-sans font-normal opacity-90">{prefix}</span>}
      <span>{numericValue}</span>
      {showCurrency && (
        isSaudi ? (
          <SaudiRiyal className={`${iconSizes[size]} inline-block shrink-0 stroke-[2.2]`} aria-label="ريال سعودي" />
        ) : (
          <span className="text-[0.75em] font-sans font-semibold text-slate-500">
            {currentCountryInfo.currencyEn}
          </span>
        )
      )}
      {suffix && <span className="text-xs font-normal opacity-80 ms-0.5">{suffix}</span>}
      {originalAmountSAR && originalAmountSAR > amountSAR && (
        <span className="line-through text-slate-400 font-normal text-[0.7em] ms-1">
          {formatPrice(originalAmountSAR, false)}
        </span>
      )}
    </span>
  );
};

export default Price;
