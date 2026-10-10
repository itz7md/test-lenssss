import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  getDocsFromCache,
  getDocsFromServer,
  getDocFromCache,
  getDocFromServer,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Product,
  CategoryConfig,
  BlogPost,
  Coupon,
  ReviewItem,
  Order,
  Appointment,
  SiteSettings,
} from '@/types';

// تنظيف undefined لمنع أخطاء الفايربيز
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) return null as unknown as T;
  if (Array.isArray(data)) return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) cleaned[key] = sanitizeForFirestore(value);
    }
    return cleaned as T;
  }
  return data;
}

export async function saveProductToFirestore(product: Product): Promise<void> {
  const ref = doc(db, 'products', product.id);
  await setDoc(ref, sanitizeForFirestore(product), { merge: true });
}

export async function deleteProductFromFirestore(productId: string): Promise<void> {
  await deleteDoc(doc(db, 'products', productId));
}

export async function saveCategoryToFirestore(category: CategoryConfig): Promise<void> {
  const ref = doc(db, 'categoryConfigs', category.id);
  await setDoc(ref, sanitizeForFirestore(category), { merge: true });
}

export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, 'categoryConfigs', categoryId));
}

export async function saveBlogPostToFirestore(post: BlogPost): Promise<void> {
  const ref = doc(db, 'blogPosts', post.id);
  await setDoc(ref, sanitizeForFirestore(post), { merge: true });
}

export async function deleteBlogPostFromFirestore(postId: string): Promise<void> {
  await deleteDoc(doc(db, 'blogPosts', postId));
}

export async function saveCouponToFirestore(coupon: Coupon): Promise<void> {
  const ref = doc(db, 'coupons', coupon.code);
  await setDoc(ref, sanitizeForFirestore(coupon), { merge: true });
}

export async function saveOrderToFirestore(order: Order): Promise<void> {
  const ref = doc(db, 'orders', order.id);
  await setDoc(ref, sanitizeForFirestore(order), { merge: true });
}

export async function saveAppointmentToFirestore(appointment: Appointment): Promise<void> {
  const ref = doc(db, 'appointments', appointment.id);
  await setDoc(ref, sanitizeForFirestore(appointment), { merge: true });
}

// جلب المنتجات بشكل متوافق مع السيرفر والمتصفح
export async function fetchProductsFromFirestore(): Promise<Product[] | null> {
  try {
    if (typeof window !== 'undefined') {
      try {
        const cachedSnap = await getDocsFromCache(collection(db, 'products'));
        if (!cachedSnap.empty) {
          getDocsFromServer(collection(db, 'products')).catch(() => {});
          return cachedSnap.docs.map((d) => d.data() as Product);
        }
      } catch {}
    }
    const snap = await getDocs(collection(db, 'products'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as Product);
  } catch (error) {
    console.warn('Could not fetch products from Firestore:', error);
    return null;
  }
}

// جلب التصنيفات بشكل متوافق مع السيرفر والمتصفح
export async function fetchCategoriesFromFirestore(): Promise<CategoryConfig[] | null> {
  try {
    if (typeof window !== 'undefined') {
      try {
        const cachedSnap = await getDocsFromCache(collection(db, 'categoryConfigs'));
        if (!cachedSnap.empty) {
          getDocsFromServer(collection(db, 'categoryConfigs')).catch(() => {});
          return cachedSnap.docs.map((d) => d.data() as CategoryConfig);
        }
      } catch {}
    }
    const snap = await getDocs(collection(db, 'categoryConfigs'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as CategoryConfig);
  } catch (error) {
    console.warn('Could not fetch categories from Firestore:', error);
    return null;
  }
}

export async function fetchBlogPostsFromFirestore(): Promise<BlogPost[] | null> {
  try {
    const snap = await getDocs(collection(db, 'blogPosts'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as BlogPost);
  } catch (error) {
    return null;
  }
}

export async function fetchCouponsFromFirestore(): Promise<Coupon[] | null> {
  try {
    const snap = await getDocs(collection(db, 'coupons'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as Coupon);
  } catch (error) {
    return null;
  }
}

export async function fetchOrdersFromFirestore(): Promise<Order[] | null> {
  try {
    const snap = await getDocs(collection(db, 'orders'));
    if (snap.empty) return null;
    const items = snap.docs.map((d) => d.data() as Order);
    items.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return items;
  } catch (error) {
    return null;
  }
}

export async function fetchAppointmentsFromFirestore(): Promise<Appointment[] | null> {
  try {
    const snap = await getDocs(collection(db, 'appointments'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as Appointment);
  } catch (error) {
    return null;
  }
}

export async function saveSettingsToFirestore(settings: SiteSettings): Promise<void> {
  const ref = doc(db, 'settings', 'global');
  await setDoc(ref, sanitizeForFirestore(settings), { merge: true });
}

export async function fetchSettingsFromFirestore(): Promise<SiteSettings | null> {
  try {
    const ref = doc(db, 'settings', 'global');
    if (typeof window !== 'undefined') {
      try {
        const cachedSnap = await getDocFromCache(ref);
        if (cachedSnap.exists()) {
          getDocFromServer(ref).catch(() => {});
          return cachedSnap.data() as SiteSettings;
        }
      } catch {}
    }
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as SiteSettings;
  } catch (error) {
    return null;
  }
}

export async function fetchReviewsFromFirestore(): Promise<ReviewItem[] | null> {
  try {
    const snap = await getDocs(collection(db, 'reviews'));
    if (snap.empty) return null;
    return snap.docs.map((d) => d.data() as ReviewItem);
  } catch (error) {
    return null;
  }
}
