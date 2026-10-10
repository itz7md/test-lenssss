'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, Trash2, CheckCircle2, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { uploadImageToFirebaseStorage, deleteImageFromFirebaseStorage } from '@/lib/firebase';

interface ImageUploaderProps {
  value: string;
  onChange: (newUrl: string) => void;
  folder?: string;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  folder = 'uploads',
  label,
  placeholder = 'رابط الصورة أو اختر ملفاً للرفع...',
  className = '',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setStatusMessage('جاري تحويل الصورة إلى WebP والرفع إلى Firebase Storage...');

      // Convert to WebP and upload to Firebase Storage
      const downloadUrl = await uploadImageToFirebaseStorage(file, folder);

      onChange(downloadUrl);
      setStatusMessage('تم تحويل الصورة إلى WebP ورفعها بنجاح! ⚡');
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setStatusMessage(`فشل الرفع: ${err?.message || 'تأكد من إعدادات الستورج'}`);
      setTimeout(() => setStatusMessage(null), 5000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!value) return;

    const confirmDelete = window.confirm(
      'هل أنت متأكد من حذف هذه الصورة نهائياً من Firebase Storage؟'
    );
    if (!confirmDelete) return;

    try {
      setIsDeleting(true);
      setStatusMessage('جاري حذف الصورة من الستورج...');

      // Delete from Firebase Storage if it was uploaded there
      await deleteImageFromFirebaseStorage(value);

      onChange('');
      setStatusMessage('تم حذف الصورة من الستورج بنجاح!');
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      console.error('Delete failed:', err);
      onChange(''); // Still clear the field
    } finally {
      setIsDeleting(false);
    }
  };

  const isFirebaseHosted =
    value &&
    (value.includes('firebasestorage.googleapis.com') ||
      value.includes('lenscode-store.firebasestorage.app'));

  return (
    <div className={`space-y-1.5 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
          <span>{label}</span>
          {isFirebaseHosted && (
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold">
              <Sparkles className="w-3 h-3 text-emerald-500" />
              مستضافة على Firebase WebP
            </span>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp, image/gif, image/avif, image/svg+xml"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        {/* URL Input */}
        <div className="relative flex-1">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full text-xs p-2.5 ps-8 rounded-xl border border-slate-300 bg-white font-mono shadow-2xs focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
          />
          <ImageIcon className="w-3.5 h-3.5 text-slate-400 absolute start-2.5 top-3" />
        </div>

        {/* Upload Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isDeleting}
          className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs shrink-0 disabled:opacity-50"
          title="رفع صورة من جهازك، تُحوّل تلقائياً إلى صيغة WebP فائقة السرعة"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#C5A880]" />
              <span>جاري التحويل والرفع...</span>
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>رفع من الجهاز (WebP)</span>
            </>
          )}
        </button>

        {/* Delete Image from Storage Button */}
        {value && (
          <button
            type="button"
            onClick={handleDeleteImage}
            disabled={isUploading || isDeleting}
            className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer shrink-0 disabled:opacity-50"
            title="حذف هذه الصورة نهائياً من الستورج والمدخل"
          >
            {isDeleting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Status notification */}
      {statusMessage && (
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Thumbnail preview */}
      {value && (
        <div className="flex items-center gap-2 pt-1">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
            <Image
              src={value}
              alt="معاينة الصورة"
              fill
              sizes="48px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-[10px] text-slate-500 truncate flex-1 font-mono">
            <span>{value}</span>
          </div>
        </div>
      )}
    </div>
  );
};
