'use client';

import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-slate-900 p-4 text-center">
      <h1 className="text-6xl font-bold font-playfair text-[#A58454] mb-4">404</h1>
      <h2 className="text-xl font-bold font-kufi mb-2">عذراً، الصفحة غير موجودة</h2>
      <p className="text-xs text-slate-500 mb-6 max-w-sm">
        الصفحة التي تبحث عنها قد تكون تمت إزالتها أو تغيير اسمها أو غير متاحة مؤقتاً.
      </p>
      <Link
        href="/"
        className="px-6 py-2.5 rounded-xl bg-[#A58454] hover:bg-[#8e6b3e] text-white font-bold text-xs shadow-md transition-all font-kufi"
      >
        العودة للرئيسية
      </Link>
    </div>
  );
}
