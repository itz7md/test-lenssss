import type { Metadata } from 'next';
import { Cairo, Tajawal, Noto_Kufi_Arabic, Playfair_Display } from 'next/font/google';
import './globals.css';
import { ClientProviders } from '@/components/ClientProviders';
import { 
  fetchProductsFromFirestore, 
  fetchCategoriesFromFirestore, 
  fetchSettingsFromFirestore 
} from '@/lib/firestoreService';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
});

const notoKufi = Noto_Kufi_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-kufi',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'لنس كود السعودية | LensCode Saudi Arabia',
  description: 'منصة لنس كود الفاخرة للنظارات الطبية والشمسية والعدسات اللاصقة وفحص النظر المعتمد.',
  openGraph: {
    title: 'لنس كود السعودية | LensCode Saudi Arabia',
    description: 'منصة لنس كود الفاخرة للنظارات الطبية والشمسية والعدسات اللاصقة وفحص النظر المعتمد.',
    type: 'website',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'لنس كود السعودية | LensCode Saudi Arabia',
    description: 'منصة لنس كود الفاخرة للنظارات الطبية والشمسية والعدسات اللاصقة وفحص النظر المعتمد.',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // ⚡ جلب البيانات بالتوازي مباشرة على خوادم السيرفر لدمجها بالـ HTML الفوري
  const [products, categories, settings] = await Promise.all([
    fetchProductsFromFirestore(),
    fetchCategoriesFromFirestore(),
    fetchSettingsFromFirestore()
  ]);

  return (
    <html
      lang="ar"
      dir="rtl"
      data-scroll-behavior="smooth"
      className={`${cairo.variable} ${tajawal.variable} ${notoKufi.variable} ${playfair.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://googleapis.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://googleapis.com" />
        <link rel="preconnect" href="https://firebasestorage.app" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://firebasestorage.app" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var savedSettings = localStorage.getItem('lenscode_settings_v5');
                  var savedCountry = localStorage.getItem('lenscode_country') || 'SA';
                  var savedLang = localStorage.getItem('lenscode_lang') || 'ar';
                  var countryNames = {
                    SA: { ar: 'السعودية', en: 'Saudi Arabia' },
                    AE: { ar: 'الإمارات', en: 'UAE' },
                    KW: { ar: 'الكويت', en: 'Kuwait' },
                    QA: { ar: 'قطر', en: 'Qatar' },
                    BH: { ar: 'البحرين', en: 'Bahrain' },
                    OM: { ar: 'عُمان', en: 'Oman' }
                  };
                  var cInfo = countryNames[savedCountry] || countryNames['SA'];
                  var cName = savedLang === 'en' ? cInfo.en : cInfo.ar;
                  var suffix = savedLang === 'en' ? (' | LensCode ' + cName) : (' | لنس كود ' + cName);

                  if (savedSettings) {
                    var parsed = JSON.parse(savedSettings);
                    if (parsed && parsed.metaTitle && parsed.metaTitle.trim()) {
                      var clean = parsed.metaTitle.trim()
                        .replace(/\\s*([|–—-])\\s*(?:لِـنس\\s*كود|لنس\\s*كود|LensCode|Lens\\s*Code|lenscode)(?:\\s+[\\u0621-\\u064AA-Za-z\\s]+)?$/i, '')
                        .replace(/\\s*([|–—-])\\s*(?:السعودية|المملكة\\s*العربية\\s*السعودية|الإمارات|الكويت|قطر|البحرين|عمان|عُمان|Saudi\\s*Arabia|UAE|Kuwait|Qatar|Bahrain|Oman)\\s*$/i, '')
                        .replace(/[\\s|–—-]+$/, '')
                        .trim();
                      if (clean) {
                        document.title = clean + suffix;
                      }
                    }
                    if (parsed && parsed.metaDescription && parsed.metaDescription.trim()) {
                      var m = document.querySelector('meta[name="description"]');
                      if (m) m.setAttribute('content', parsed.metaDescription.trim());
                    }
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`bg-white text-slate-900 antialiased ${cairo.className}`}
        style={{ fontFamily: 'var(--font-cairo), Cairo, system-ui, sans-serif' }}
      >
        {/* ✅ تمرير البيانات المستلمة فوراً من السيرفر لـ ClientProviders */}
        <ClientProviders 
          initialProducts={products || []} 
          initialCategories={categories || []} 
          initialSettings={settings}
        >
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
