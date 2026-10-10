import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  collection,
  onSnapshot,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';

export const firebaseConfig = {
  apiKey: "AIzaSyDFfzokzb-lpKlfA0o5vc9q21bVQafP_p8",
  authDomain: "://firebaseapp.com",
  projectId: "lenscode-store",
  storageBucket: "lenscode-store.firebasestorage.app",
  messagingSenderId: "967927567299",
  appId: "1:967927567299:web:377e854ed46035e1092376",
  measurementId: "G-ZQMG3YFLSM",
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore Database (using custom database ID 'lens-store') and Cloud Storage
// ✅ تم إصلاح التهيئة هنا لتعمل بشكل متوافق تماماً مع النوع FirestoreSettings دون إحداث أخطاء في الـ TypeScript Compiler
export const db = typeof window !== 'undefined'
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      }),
    }, 'lens-store')
  : initializeFirestore(app, {}, 'lens-store');

// ✅ تفعيل حظر الـ WebSockets وإجبار الـ Long Polling فقط في المتصفح لمنع خطأ الـ 10 ثوانٍ بطريقة برمجية سليمة ومقبولة هندسياً
if (typeof window !== 'undefined') {
  try {
    (db as any)._settings.forceLongPolling = true;
  } catch (e) {
    console.warn("Failed to set forceLongPolling safely:", e);
  }
}

export const storage = getStorage(app);

// Initialize Analytics (browser only)
export const initAnalytics = async () => {
  if (typeof window !== 'undefined' && (await isSupported())) {
    return getAnalytics(app);
  }
  return null;
};

/**
 * Converts any local image file (PNG, JPG, JPEG, GIF, AVIF, HEIC, etc.)
 * directly into WebP format on the client side using Canvas API.
 * High quality compression (0.88), maintaining aspect ratio.
 */
export async function convertFileToWebp(
  file: File,
  quality = 0.88,
  maxWidth = 2000,
  maxHeight = 2000
): Promise<{ blob: Blob; fileName: string }> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      return reject(new Error('Canvas conversion requires browser environment'));
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let width = img.width;
      let height = img.height;

      // Scale down if dimensions exceed maximum
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        return reject(new Error('Failed to create canvas 2D context'));
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return reject(new Error('Failed to convert image to WebP blob'));
          }

          // Clean original filename and append .webp extension
          const originalBaseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
          const cleanName = originalBaseName.replace(/[^a-zA-Z0-9_\u0600-\u06FF-]/g, '_');
          const webpFileName = `${cleanName}.webp`;

          resolve({ blob, fileName: webpFileName });
        },
        'image/webp',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for conversion'));
    };

    img.src = url;
  });
}

/**
 * Uploads an image file to Firebase Storage.
 * Automatically converts the file to WebP format before uploading,
 * ensuring high speed, reduced size, and fast site performance.
 */
export async function uploadImageToFirebaseStorage(
  file: File,
  folder = 'uploads'
): Promise<string> {
  try {
    // 1. Convert to WebP
    const { blob, fileName } = await convertFileToWebp(file);

    // 2. Generate unique storage path
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const storagePath = `${folder}/${timestamp}_${randomSuffix}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    // 3. Upload to Firebase Storage with webp content type
    const snapshot = await uploadBytes(storageRef, blob, {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000',
    });

    // 4. Retrieve permanent download URL
    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Error uploading image to Firebase Storage:', error);
    throw error;
  }
}

/**
 * Permanently deletes an image from Firebase Storage using its URL or path.
 */
export async function deleteImageFromFirebaseStorage(imageUrl: string): Promise<boolean> {
  if (!imageUrl) return false;

  // Only proceed if the URL belongs to Firebase Storage
  const isFirebaseStorage =
    imageUrl.includes('://googleapis.com') ||
    imageUrl.includes('lenscode-store.firebasestorage.app');

  if (!isFirebaseStorage) {
    console.log('Skipping delete: Image is not hosted on Firebase Storage:', imageUrl);
    return false;
  }

  try {
    const fileRef = ref(storage, imageUrl);
    await deleteObject(fileRef);
    console.log('Successfully deleted image from Firebase Storage:', imageUrl);
    return true;
  } catch (error) {
    console.warn('Failed or already deleted from Firebase Storage:', error);
    return false;
  }
}

/**
 * Check if Cloud Firestore database is active and reachable.
 */
export async function isFirestoreOnline(): Promise<boolean> {
  try {
    const testDoc = doc(db, '_connection_test', 'status');
    await getDoc(testDoc);
    return true;
  } catch (err: any) {
    // If not found or client offline or database does not exist
    if (err?.message?.includes('does not exist') || err?.code === 'not-found') {
      return false;
    }
    return false;
  }
}

/**
 * Downloads an image from any URL (including Cloudinary or local public path) and uploads it to Firebase Storage.
 * It automatically handles conversion to WebP format on the client-side.
 */
export async function uploadExternalUrlToFirebaseStorage(
  url: string,
  folder = 'uploads'
): Promise<string> {
  if (!url) return '';

  // If already a Firebase Storage URL, return as-is
  const isFirebaseStorage =
    url.includes('://googleapis.com') ||
    url.includes('lenscode-store.firebasestorage.app');

  if (isFirebaseStorage) {
    return url;
  }

  try {
    // For local paths like '/images/cat_medical.webp', fetch from local origin
    const targetUrl = url.startsWith('http') ? url : window.location.origin + url;
    
    const response = await fetch(targetUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from URL: ${url}`);
    }

    const blob = await response.blob();

    // Extract filename if possible
    let filename = 'image';
    try {
      const urlObj = new URL(targetUrl);
      const pathname = urlObj.pathname;
      const lastSegment = pathname.substring(pathname.lastIndexOf('/') + 1);
      if (lastSegment && lastSegment.includes('.')) {
        filename = lastSegment.substring(0, lastSegment.lastIndexOf('.')) || lastSegment;
      }
    } catch {}

    const fileType = blob.type || 'image/jpeg';
    const mockFile = new File([blob], `${filename}.${fileType.split('/')[1] || 'jpg'}`, {
      type: fileType,
    });

    return await uploadImageToFirebaseStorage(mockFile, folder);
  } catch (error) {
    console.warn(`Failed to upload external image to Firebase Storage: ${url}`, error);
    // Fallback to original URL
    return url;
  }
}
