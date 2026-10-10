import React from 'react';
import { SeoHead } from '@/components/SeoHead';
import { HeroSlider } from '@/components/HeroSlider';
import { FeaturedCategories } from '@/components/FeaturedCategories';
import { ClinicBanner } from '@/components/ClinicBanner';
import { HomeCategorySections } from '@/components/HomeCategorySections';
import { ReviewsAndBlogSection } from '@/components/ReviewsAndBlogSection';
import { 
  fetchProductsFromFirestore, 
  fetchCategoriesFromFirestore, 
  fetchSettingsFromFirestore 
} from '@/lib/firestoreService';

// تحفيز الكاش الفوري وإعادة التحقق كل 30 ثانية لتحديث البيانات خلف الكواليس تلقائياً
export const revalidate = 30; 

export default async function HomePage() {
  // ⚡ جلب البيانات بالتوازي مباشرة من خوادم السيرفر لسرعة لمح البصر
  const [products, categories, settings] = await Promise.all([
    fetchProductsFromFirestore(),
    fetchCategoriesFromFirestore(),
    fetchSettingsFromFirestore()
  ]);

  return (
    <>
      {/* Dynamic SEO & Schema for Homepage */}
      <SeoHead />

      {/* 1. Hero Campaign Carousel */}
      <HeroSlider initialSlides={settings?.heroSlides || []} />

      {/* 2. Featured Collections Grid */}
      <FeaturedCategories initialCategories={categories || []} />

      {/* 3. Free Vision Clinic / VIP Banner */}
      <ClinicBanner initialSettings={settings} />

      {/* 4. Categorized Horizontal Product Rows */}
      <HomeCategorySections initialProducts={products || []} initialCategories={categories || []} />

      {/* 5. Verified Reviews & Optical Health Blog */}
      <ReviewsAndBlogSection />
    </>
  );
}
