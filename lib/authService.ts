import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from './firebase';
import { UserProfile, CountryCode } from '@/types';

/**
 * Format Firebase Auth Error Codes into user-friendly localized messages
 */
export function formatAuthError(error: any, language: 'ar' | 'en' = 'ar'): string {
  const code = error?.code || '';
  
  if (language === 'ar') {
    switch (code) {
      case 'auth/invalid-email':
        return 'البريد الإلكتروني المدخل غير صالح.';
      case 'auth/user-disabled':
        return 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني.';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'البريد الإلكتروني أو كلمة المرور غير صحيحة.';
      case 'auth/email-already-in-use':
        return 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول مباشرة.';
      case 'auth/weak-password':
        return 'كلمة المرور ضعيفة. يجب أن تتكون من 6 أحرف أو أرقام على الأقل.';
      case 'auth/popup-closed-by-user':
        return 'تم إغلاق نافذة تسجيل الدخول قبل إتمام العملية.';
      case 'auth/popup-blocked':
        return 'تم حظر النافذة المنبثقة من قِبل المتصفح. يرجى السماح بالنوافذ المنبثقة والمحاولة مجدداً.';
      case 'auth/too-many-requests':
        return 'تم حظر المحاولات مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار قليلاً.';
      case 'auth/network-request-failed':
        return 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.';
      default:
        return error?.message || 'حدث خطأ غير متوقع أثناء المصادقة. يرجى المحاولة لاحقاً.';
    }
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'The email address is invalid.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please log in.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed before completing.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet.';
    default:
      return error?.message || 'An unexpected error occurred during authentication.';
  }
}

/**
 * Sync / Create customer document in Firestore 'users/{uid}'
 */
export async function syncUserProfileInFirestore(
  user: User,
  additionalData?: Partial<UserProfile>
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const snapshot = await getDoc(userRef);

  const now = new Date().toISOString();

  if (snapshot.exists()) {
    const existing = snapshot.data() as UserProfile;
    const updated: UserProfile = {
      ...existing,
      email: user.email || existing.email,
      displayName: additionalData?.displayName || user.displayName || existing.displayName || 'عميل لنس كود',
      photoURL: user.photoURL || existing.photoURL || '',
      phoneNumber: additionalData?.phoneNumber || user.phoneNumber || existing.phoneNumber || '',
      updatedAt: now,
      ...(additionalData?.country ? { country: additionalData.country } : {}),
      ...(additionalData?.city ? { city: additionalData.city } : {}),
      ...(additionalData?.district ? { district: additionalData.district } : {}),
      ...(additionalData?.address ? { address: additionalData.address } : {}),
    };

    await updateDoc(userRef, { ...updated });
    return updated;
  } else {
    const newProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName: additionalData?.displayName || user.displayName || 'عميل لنس كود',
      photoURL: user.photoURL || '',
      phoneNumber: additionalData?.phoneNumber || user.phoneNumber || '',
      country: additionalData?.country || 'SA',
      city: additionalData?.city || '',
      district: additionalData?.district || '',
      address: additionalData?.address || '',
      createdAt: now,
      updatedAt: now,
    };

    await setDoc(userRef, newProfile);
    return newProfile;
  }
}

/**
 * Fetch User Profile by UID
 */
export async function fetchUserProfile(uid: string): Promise<UserProfile | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Failed to fetch user profile from Firestore:', error);
    return null;
  }
}

/**
 * Update User Profile
 */
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
): Promise<void> {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * Sign In with Google Popup
 */
export async function signInWithGoogle(countryCode: CountryCode = 'SA'): Promise<{ user: User; profile: UserProfile }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = await syncUserProfileInFirestore(result.user, { country: countryCode });
    return { user: result.user, profile };
  } catch (error) {
    console.error('Google Sign In Error:', error);
    throw error;
  }
}

/**
 * Sign In with Email & Password
 */
export async function loginWithEmail(
  email: string,
  pass: string
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const result = await signInWithEmailAndPassword(auth, email.trim(), pass);
    let profile = await fetchUserProfile(result.user.uid);
    if (!profile) {
      profile = await syncUserProfileInFirestore(result.user);
    }
    return { user: result.user, profile };
  } catch (error) {
    console.error('Email Login Error:', error);
    throw error;
  }
}

/**
 * Register with Email & Password
 */
export async function registerWithEmail(
  name: string,
  email: string,
  pass: string,
  phone?: string,
  country: CountryCode = 'SA'
): Promise<{ user: User; profile: UserProfile }> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    
    // Update Auth Display Name
    if (name.trim()) {
      await updateProfile(result.user, {
        displayName: name.trim(),
      });
    }

    const profile = await syncUserProfileInFirestore(result.user, {
      displayName: name.trim(),
      phoneNumber: phone?.trim() || '',
      country,
    });

    return { user: result.user, profile };
  } catch (error) {
    console.error('Email Register Error:', error);
    throw error;
  }
}

/**
 * Send Password Reset Email
 */
export async function resetUserPassword(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error) {
    console.error('Reset Password Error:', error);
    throw error;
  }
}

/**
 * Sign Out
 */
export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Signout Error:', error);
    throw error;
  }
}
