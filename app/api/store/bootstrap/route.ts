import { NextResponse } from 'next/server';
import { getFirestore, collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { DEFAULT_SETTINGS } from '@/context/AppContext';

// In-memory server-side cache for high performance
let cachedData: {
  categories: any[];
  products: any[];
  settings: any;
  timestamp: number;
} | null = null;

const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export async function GET() {
  const now = Date.now();
  if (cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(cachedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  }

  try {
    const db = getFirestore(app, 'lens-store');

    const [catsSnap, prodsSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'categoryConfigs')).catch(() => null),
      getDocs(collection(db, 'products')).catch(() => null),
      getDoc(doc(db, 'settings', 'global')).catch(() => null),
    ]);

    const categories =
      catsSnap && !catsSnap.empty
        ? catsSnap.docs.map((d) => d.data())
        : [];

    const products =
      prodsSnap && !prodsSnap.empty
        ? prodsSnap.docs.map((d) => d.data())
        : [];

    const settings =
      settingsSnap && settingsSnap.exists()
        ? { ...DEFAULT_SETTINGS, ...settingsSnap.data() }
        : DEFAULT_SETTINGS;

    cachedData = {
      categories,
      products,
      settings,
      timestamp: now,
    };

    return NextResponse.json(cachedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error) {
    console.warn('Bootstrap API error, serving fallback:', error);
    return NextResponse.json(
      {
        categories: [],
        products: [],
        settings: DEFAULT_SETTINGS,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60',
        },
      }
    );
  }
}

