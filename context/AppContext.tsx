'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';

import { INITIAL_APPOINTMENTS, INITIAL_BLOG_POSTS, INITIAL_COUPONS, INITIAL_ORDERS } from '@/data/contentData';
import { GCC_COUNTRIES } from '@/data/countries';
import { getCategoryConfigBySlug } from '@/data/categoryConfigs';
import { fetchUserProfile, logoutUser, updateUserProfile } from '@/lib/authService';
import { auth } from '@/lib/firebase';
import {
  deleteBlogPostFromFirestore,
  deleteCategoryFromFirestore,
  deleteProductFromFirestore,
  fetchAppointmentsFromFirestore,
  fetchBlogPostsFromFirestore,
  fetchCategoriesFromFirestore,
  fetchCouponsFromFirestore,
  fetchOrdersFromFirestore,
  fetchProductsFromFirestore,
  fetchSettingsFromFirestore,
  saveAppointmentToFirestore,
  saveBlogPostToFirestore,
  saveCategoryToFirestore,
  saveCouponToFirestore,
  saveOrderToFirestore,
  saveProductToFirestore,
  saveSettingsToFirestore,
} from '@/lib/firestoreService';
import { usePersistentStore } from '@/lib/usePersistentStore';
import {
  Appointment,
  BlogPost,
  CartItem,
  CategoryConfig,
  CountryCode,
  Coupon,
  CustomerDetails,
  CustomLensConfig,
  HeroSlide,
  Language,
  Order,
  PackSizeOption,
  Product,
  ProductColorVariant,
  SiteSettings,
  UserProfile,
} from '@/types';

type SyncResult = { success: boolean; error?: string };

interface AppContextType {
  country: CountryCode;
  setCountry: (code: CountryCode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  isRtl: boolean;
  t: (keyAr: string, keyEn: string) => string;

  isFirestoreSyncing: boolean;
  isInitialDataLoading: boolean;
  syncDatabaseToFirestore: (onProgress?: (msg: string) => void) => Promise<SyncResult>;

  settings: SiteSettings;
  updateSettings: (updated: Partial<SiteSettings>) => Promise<void>;

  categoryConfigs: CategoryConfig[];
  updateCategoryConfig: (idOrSlug: string, updated: Partial<CategoryConfig>) => void;
  addCategoryConfig: (config: CategoryConfig) => void;
  deleteCategoryConfig: (id: string) => void;
  getCategoryConfig: (slugOrId: string) => CategoryConfig | undefined;

  currentCountryInfo: (typeof GCC_COUNTRIES)[CountryCode];
  formatPrice: (amountSAR: number, withSymbol?: boolean) => string;
  convertPrice: (amountSAR: number) => number;

  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (id: string, updated: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  duplicateProduct: (id: string) => Product | null;
  reorderProductColors: (productId: string, fromIndex: number, toIndex: number) => void;

  cart: CartItem[];
  addToCart: (
    product: Product,
    selectedColor: ProductColorVariant,
    lensConfig?: CustomLensConfig,
    quantity?: number,
    selectedPackSize?: PackSizeOption,
    contactLensPowerRight?: string,
    contactLensPowerLeft?: string,
    contactLensCylinderRight?: string,
    contactLensCylinderLeft?: string,
    contactLensAxisRight?: string,
    contactLensAxisLeft?: string,
    isSeparatePower?: boolean
  ) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotalSAR: number;
  cartDiscountSAR: number;
  cartTaxSAR: number;
  cartShippingSAR: number;
  cartTotalSAR: number;
  getCartItemLocalPrice: (item: CartItem, targetCountry: CountryCode) => number;
  cartSubtotalLocal: number;
  cartDiscountLocal: number;
  cartTotalLocal: number;
  freeShippingThresholdSAR: number;
  freeShippingProgress: number;
  freeShippingRemainingSAR: number;

  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  addCoupon: (coupon: Coupon) => void;

  wishlistIds: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;

  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  placeOrder: (
    customer: CustomerDetails,
    paymentMethod: Order['paymentMethod'],
    shippingMethod: Order['shippingMethod'],
    loyaltyDiscountSAR?: number
  ) => Order;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;

  appointments: Appointment[];
  bookAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Appointment;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;

  blogPosts: BlogPost[];
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (id: string, post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;

  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isVipModalOpen: boolean;
  setIsVipModalOpen: (open: boolean) => void;
  isLensWizardOpen: boolean;
  setIsLensWizardOpen: (open: boolean) => void;
  lensWizardProduct: Product | null;
  openLensWizard: (product: Product, preselectedColor?: ProductColorVariant) => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  isAdmin: boolean;
  isAdminOpen: boolean;
  setIsAdminOpen: (open: boolean) => void;
  isTrackOrderOpen: boolean;
  setIsTrackOrderOpen: (open: boolean) => void;
  selectedProduct: Product | null;
  openProductModal: (product: Product) => void;
  closeProductModal: () => void;
  activeCategory: string;
  setActiveCategory: (cat: string) => void;

  currentUser: User | null;
  userProfile: UserProfile | null;
  isAuthLoading: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register' | 'forgot_password';
  setAuthModalMode: (mode: 'login' | 'register' | 'forgot_password') => void;
  openAuthModal: (mode?: 'login' | 'register' | 'forgot_password') => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [];

export const DEFAULT_SETTINGS: SiteSettings = {
  id: 'global',
  supportEmail: 'info@lenscode.sa',
  phoneNumber: '+966556359090',
  whatsAppNumber: '+966556359090',
  address: 'شارع الإمام فيصل بن تركي، حي الديرة، الرياض، المملكة العربية السعودية',
  metaTitle: 'لِـنس كود منصة البصريات الفاخرة والعدسات',
  metaDescription:
    'متجر لِـنس كود الفاخر للنظارات الطبية والشمسية والعدسات اللاصقة، وفحص النظر المعتمد والزيارات المنزلية VIP في السعودية والخليج.',
  facebookLink: 'https://facebook.com',
  twitterLink: 'https://twitter.com',
  instagramLink: 'https://instagram.com',
  tiktokLink: 'https://tiktok.com',
  snapchatLink: '',
  maroofNumber: '0000178830',
  maroofImage: 'https://googleapis.com',
  taxNumber: '311075886400003',
  taxImage: 'https://googleapis.com',
  heroSlides: [],
  clinicBannerImage: '',
  clinicBannerTitleAr: 'احجز فحص نظرك مجاناً',
  clinicBannerTitleEn: 'Book Your Free Vision Exam',
  clinicBannerSubtitleAr: 'مع أخصائيين معتمدين وأحدث أجهزة الفحص الرقمية المتطورة',
  clinicBannerSubtitleEn:
    'With certified optometrists and cutting-edge digital diagnostic technology',
};

interface AppProviderProps {
  children: React.ReactNode;
  initialProducts?: Product[];
  initialCategories?: CategoryConfig[];
  initialSettings?: SiteSettings | null;
}

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

export const AppProvider: React.FC<AppProviderProps> = ({
  children,
  initialProducts = [],
  initialCategories = [],
  initialSettings = null,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<
    'login' | 'register' | 'forgot_password'
  >('login');
  const authRequestIdRef = useRef(0);

  const openAuthModal = useCallback(
    (mode: 'login' | 'register' | 'forgot_password' = 'login') => {
      setAuthModalMode(mode);
      setIsAuthModalOpen(true);
    },
    []
  );

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setCurrentUser(null);
    setUserProfile(null);
  }, []);

  const updateProfileData = useCallback(
    async (data: Partial<UserProfile>) => {
      if (!currentUser) return;

      await updateUserProfile(currentUser.uid, data);
      setUserProfile((previous) => (previous ? { ...previous, ...data } : previous));
    },
    [currentUser]
  );

  useEffect(() => {
    let isActive = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      const requestId = ++authRequestIdRef.current;

      if (!isActive) return;
      setCurrentUser(user);
      setIsAuthLoading(true);

      if (!user) {
        setUserProfile(null);
        setIsAuthLoading(false);
        return;
      }

      const fallbackProfile = {
        uid: user.uid,
        email: user.email ?? '',
        displayName: user.displayName ?? 'عميل لنس كود',
        photoURL: user.photoURL ?? '',
        phoneNumber: user.phoneNumber ?? '',
      } as UserProfile;

      try {
        const profile = await fetchUserProfile(user.uid);
        if (isActive && requestId === authRequestIdRef.current) {
          setUserProfile(profile ?? fallbackProfile);
        }
      } catch (error) {
        console.warn('Error fetching user profile:', error);
        if (isActive && requestId === authRequestIdRef.current) {
          setUserProfile(fallbackProfile);
        }
      } finally {
        if (isActive && requestId === authRequestIdRef.current) {
          setIsAuthLoading(false);
        }
      }
    });

    return () => {
      isActive = false;
      authRequestIdRef.current += 1;
      unsubscribe();
    };
  }, []);

  const [country, setCountryState] = usePersistentStore<CountryCode>(
    'lenscode_country',
    'SA'
  );
  const [language, setLanguageState] = usePersistentStore<Language>(
    'lenscode_lang',
    'ar'
  );
  const [settings, setSettingsState] = usePersistentStore<SiteSettings>(
    'lenscode_settings_v5',
    initialSettings ?? DEFAULT_SETTINGS
  );
  const [categoryConfigs, setCategoryConfigs] = usePersistentStore<CategoryConfig[]>(
    'lenscode_category_configs_v7',
    initialCategories.length > 0 ? initialCategories : []
  );
  const [products, setProducts] = usePersistentStore<Product[]>(
    'lenscode_products_v3',
    initialProducts.length > 0 ? initialProducts : []
  );
  const [cart, setCart] = usePersistentStore<CartItem[]>('lenscode_cart', []);
  const [wishlistIds, setWishlistIds] = usePersistentStore<string[]>(
    'lenscode_wishlist',
    []
  );
  const [coupons, setCoupons] = useState<Coupon[]>(INITIAL_COUPONS);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [orders, setOrdersState] = useState<Order[]>(INITIAL_ORDERS);
  const [appointments, setAppointments] =
    useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [blogPosts, setBlogPosts] = usePersistentStore<BlogPost[]>(
    'lenscode_blog_posts_v4',
    INITIAL_BLOG_POSTS
  );
  const [isFirestoreSyncing, setIsFirestoreSyncing] = useState(false);
  const [isInitialDataLoading, setIsInitialDataLoading] = useState(
    initialProducts.length === 0 &&
      initialCategories.length === 0 &&
      initialSettings === null
  );

  const settingsRef = useRef(settings);
  const productsRef = useRef(products);
  const categoryConfigsRef = useRef(categoryConfigs);
  const ordersRef = useRef(orders);
  const appointmentsRef = useRef(appointments);
  const syncInFlightRef = useRef<Promise<SyncResult> | null>(null);

  settingsRef.current = settings;
  productsRef.current = products;
  categoryConfigsRef.current = categoryConfigs;
  ordersRef.current = orders;
  appointmentsRef.current = appointments;

  const setOrders = useCallback<React.Dispatch<React.SetStateAction<Order[]>>>(
    (action) => {
      const nextOrders =
        typeof action === 'function'
          ? (action as (previous: Order[]) => Order[])(ordersRef.current)
          : action;
      ordersRef.current = nextOrders;
      setOrdersState(nextOrders);
    },
    []
  );

  const updateSettings = useCallback(
    async (updated: Partial<SiteSettings>) => {
      const merged = { ...settingsRef.current, ...updated };
      settingsRef.current = merged;
      setSettingsState(merged);
      await saveSettingsToFirestore(merged);
    },
    [setSettingsState]
  );

  const syncDatabaseToFirestore = useCallback(
    (onProgress?: (msg: string) => void): Promise<SyncResult> => {
      if (syncInFlightRef.current) return syncInFlightRef.current;

      const runSync = async (): Promise<SyncResult> => {
        setIsFirestoreSyncing(true);

        try {
          onProgress?.('Syncing settings...');
          await saveSettingsToFirestore(settings);

          const syncCollection = async <T,>(
            label: string,
            values: readonly T[],
            save: (value: T) => unknown
          ) => {
            onProgress?.(`Syncing ${label} (${values.length})...`);
            await Promise.all(values.map((value) => Promise.resolve(save(value))));
          };

          await syncCollection('products', products, saveProductToFirestore);
          await syncCollection(
            'categories',
            categoryConfigs,
            saveCategoryToFirestore
          );
          await syncCollection('blog posts', blogPosts, saveBlogPostToFirestore);
          await syncCollection('coupons', coupons, saveCouponToFirestore);
          await syncCollection('orders', orders, saveOrderToFirestore);
          await syncCollection(
            'appointments',
            appointments,
            saveAppointmentToFirestore
          );

          onProgress?.('Sync completed.');
          return { success: true };
        } catch (error) {
          const message = getErrorMessage(error);
          console.warn('Failed to sync database to Firestore:', error);
          return { success: false, error: message };
        } finally {
          setIsFirestoreSyncing(false);
        }
      };

      const promise = runSync().finally(() => {
        syncInFlightRef.current = null;
      });
      syncInFlightRef.current = promise;
      return promise;
    },
    [appointments, blogPosts, categoryConfigs, coupons, orders, products, settings]
  );

  useEffect(() => {
    let isMounted = true;

    const hydrate = async () => {
      try {
        await Promise.allSettled([
          fetchSettingsFromFirestore()
            .then((value) => {
              if (isMounted && value) {
                settingsRef.current = value;
                setSettingsState(value);
              }
            })
            .catch((error) => console.warn('Error fetching settings:', error)),
          fetchProductsFromFirestore()
            .then((value) => {
              if (isMounted && value?.length) {
                productsRef.current = value;
                setProducts(value);
              }
            })
            .catch((error) => console.warn('Error fetching products:', error)),
          fetchCategoriesFromFirestore()
            .then((value) => {
              if (isMounted && value?.length) {
                categoryConfigsRef.current = value;
                setCategoryConfigs(value);
              }
            })
            .catch((error) => console.warn('Error fetching categories:', error)),
          fetchBlogPostsFromFirestore()
            .then((value) => {
              if (isMounted && value?.length) setBlogPosts(value);
            })
            .catch((error) => console.warn('Error fetching blog posts:', error)),
          fetchCouponsFromFirestore()
            .then((value) => {
              if (isMounted && value?.length) setCoupons(value);
            })
            .catch((error) => console.warn('Error fetching coupons:', error)),
          fetchOrdersFromFirestore()
            .then((value) => {
              if (isMounted && value?.length) {
                ordersRef.current = value;
                setOrders(value);
              }
            })
            .catch((error) =>
              console.warn('Error fetching orders from Firestore:', error)
            ),
          fetchAppointmentsFromFirestore()
            .then((value) => {
              if (isMounted && value?.length) {
                appointmentsRef.current = value;
                setAppointments(value);
              }
            })
            .catch((error) =>
              console.warn('Error fetching appointments from Firestore:', error)
            ),
        ]);
      } finally {
        if (isMounted) setIsInitialDataLoading(false);
      }
    };

    void hydrate();

    return () => {
      isMounted = false;
    };
  }, [
    setBlogPosts,
    setCategoryConfigs,
    setProducts,
    setSettingsState,
  ]);

  useEffect(() => {
    const oldDefaultIds = new Set([
      'post-face-shape-guide',
      'post-contact-lenses-care',
      'post-vip-home-exam',
    ]);

    setBlogPosts((previous) => {
      if (!Array.isArray(previous) || previous.length === 0) {
        return INITIAL_BLOG_POSTS;
      }
      if (!previous.some((post) => oldDefaultIds.has(post.id))) {
        return previous;
      }

      const currentDefaultIds = new Set(INITIAL_BLOG_POSTS.map((post) => post.id));
      const customPosts = previous.filter(
        (post) =>
          !oldDefaultIds.has(post.id) && !currentDefaultIds.has(post.id)
      );
      return [...INITIAL_BLOG_POSTS, ...customPosts];
    });
  }, [setBlogPosts]);

  useEffect(() => {
    setCategoryConfigs((previous) => {
      let changed = false;
      const updated = [...previous];

      const addIfMissing = (config: CategoryConfig) => {
        const slug = config.slug?.toLowerCase().trim();
        const id = config.id?.toLowerCase().trim();
        const exists = updated.some(
          (item) =>
            item.slug?.toLowerCase().trim() === slug ||
            item.id?.toLowerCase().trim() === id
        );

        if (!exists) {
          updated.push(config);
          changed = true;
        }
      };

      products.forEach((product) => {
        const slug = product.category?.toLowerCase().trim();
        if (!slug || slug === 'yuva') return;

        const nameAr = product.categoryAr || product.category;
        const nameEn = product.categoryEn || product.category;
        addIfMissing({
          id: `category-${slug}`,
          itemType: 'category',
          nameAr,
          nameEn,
          slug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
          heroTitleAr: nameAr,
          heroTitleEn: nameEn,
          heroSubTitleAr: `تصفح تشكيلة ${nameAr} المتميزة`,
          heroSubTitleEn: `Browse our premium ${nameEn} collection`,
        });
      });

      products.forEach((product) => {
        const slug = (product.brand || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-');
        if (!slug) return;

        const nameAr = product.brandAr || product.brand;
        const nameEn = product.brandEn || product.brand;
        addIfMissing({
          id: `brand-${slug}`,
          itemType: 'brand',
          nameAr,
          nameEn,
          slug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
          heroTitleAr: nameAr,
          heroTitleEn: nameEn,
          heroSubTitleAr: `تصفح ماركة ${nameAr}`,
          heroSubTitleEn: `Shop ${nameEn} brand`,
        });
      });

      products.forEach((product) => {
        if (product.category !== 'contact-lenses') return;

        const slug = (product.subCategoryEn || product.subCategory || '')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '-');
        if (!slug) return;

        const nameAr =
          product.subCategoryAr || product.subCategory || 'تصنيف فرعي';
        const nameEn =
          product.subCategoryEn || product.subCategory || 'Subcategory';
        addIfMissing({
          id: `subcategory-${slug}`,
          itemType: 'subcategory',
          nameAr,
          nameEn,
          slug,
          showInHeaderNav: false,
          showInHome: false,
          showInExplore: false,
          heroTitleAr: nameAr,
          heroTitleEn: nameEn,
          heroSubTitleAr: `عدسات لاصقة: ${nameAr}`,
          heroSubTitleEn: `Contact Lenses: ${nameEn}`,
        });
      });

      if (changed) {
        categoryConfigsRef.current = updated;
        return updated;
      }
      return previous;
    });
  }, [products, setCategoryConfigs]);

  const updateCategoryConfig = useCallback(
    (idOrSlug: string, updatedFields: Partial<CategoryConfig>) => {
      const cleanKey = idOrSlug.toLowerCase().trim();
      let changedCategory: CategoryConfig | undefined;

      const updatedCategories = categoryConfigsRef.current.map((item) => {
        if (
          item.id?.toLowerCase().trim() === cleanKey ||
          item.slug?.toLowerCase().trim() === cleanKey ||
          item.nameEn?.toLowerCase().trim() === cleanKey
        ) {
          changedCategory = { ...item, ...updatedFields };
          return changedCategory;
        }
        return item;
      });

      if (!changedCategory) return;
      categoryConfigsRef.current = updatedCategories;
      setCategoryConfigs(updatedCategories);
      void saveCategoryToFirestore(changedCategory).catch((error) =>
        console.warn('Firestore update category notice:', getErrorMessage(error))
      );
    },
    [setCategoryConfigs]
  );

  const addCategoryConfig = useCallback(
    (config: CategoryConfig) => {
      const updated = [config, ...categoryConfigsRef.current];
      categoryConfigsRef.current = updated;
      setCategoryConfigs(updated);
      void saveCategoryToFirestore(config).catch((error) =>
        console.warn('Firestore add category notice:', getErrorMessage(error))
      );
    },
    [setCategoryConfigs]
  );

  const deleteCategoryConfig = useCallback(
    (id: string) => {
      const updated = categoryConfigsRef.current.filter(
        (category) => category.id !== id && category.slug !== id
      );
      categoryConfigsRef.current = updated;
      setCategoryConfigs(updated);
      void deleteCategoryFromFirestore(id).catch((error) =>
        console.warn('Firestore delete category notice:', getErrorMessage(error))
      );
    },
    [setCategoryConfigs]
  );

  const getCategoryConfig = useCallback(
    (slugOrId: string) => {
      if (!slugOrId) return undefined;

      const cleanKey = decodeURIComponent(slugOrId).toLowerCase().trim();
      const rawTrimmed = decodeURIComponent(slugOrId).trim();

      // First priority: A config that matches slug, id, nameAr, or nameEn AND has hero/custom attributes
      const customConfig = categoryConfigs.find(
        (category) =>
          (category.slug?.toLowerCase().trim() === cleanKey ||
            category.id?.toLowerCase().trim() === cleanKey ||
            category.nameAr?.trim() === rawTrimmed ||
            category.nameEn?.toLowerCase().trim() === cleanKey) &&
          Boolean(
            category.heroBannerImage ||
              category.heroTitleAr ||
              category.heroTitleEn ||
              category.bottomDescriptionAr ||
              category.sectionDescAr
          )
      );
      if (customConfig) return customConfig;

      // Second priority: Exact match by slug, id, nameAr, or nameEn
      const exactConfig = categoryConfigs.find(
        (category) =>
          category.slug?.toLowerCase().trim() === cleanKey ||
          category.id?.toLowerCase().trim() === cleanKey ||
          category.nameAr?.trim() === rawTrimmed ||
          category.nameEn?.toLowerCase().trim() === cleanKey
      );
      if (exactConfig) return exactConfig;

      // Third priority: Slug without hyphens or matching aliases
      const normalizedKey = cleanKey.replace(/[-_\s]+/g, '');
      const aliasConfig = categoryConfigs.find((category) => {
        const cSlug = (category.slug || '').toLowerCase().replace(/[-_\s]+/g, '');
        const cId = (category.id || '').toLowerCase().replace(/[-_\s]+/g, '');
        const cEn = (category.nameEn || '').toLowerCase().replace(/[-_\s]+/g, '');
        return cSlug === normalizedKey || cId === normalizedKey || cEn === normalizedKey;
      });
      if (aliasConfig) return aliasConfig;

      return getCategoryConfigBySlug(categoryConfigs, slugOrId);
    },
    [categoryConfigs]
  );

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isLensWizardOpen, setIsLensWizardOpen] = useState(false);
  const [lensWizardProduct, setLensWizardProduct] = useState<Product | null>(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpenState] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState('all');

  const isAdmin = useMemo(() => {
    const userEmail = (currentUser?.email || userProfile?.email || '')
      .trim()
      .toLowerCase();
    if (!userEmail) return false;
    if (userProfile?.role === 'admin' || userProfile?.role === 'superadmin') {
      return true;
    }

    const rawEnv = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
    const envAdminEmails = rawEnv
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);
    return envAdminEmails.includes(userEmail);
  }, [currentUser?.email, userProfile?.email, userProfile?.role]);

  const setIsAdminOpen = useCallback(
    (open: boolean) => {
      setIsAdminOpenState(open && isAdmin);
    },
    [isAdmin]
  );

  useEffect(() => {
    if (!isAdmin) setIsAdminOpenState(false);
  }, [isAdmin]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
      document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

      try {
        localStorage.setItem('lenscode_lang', language);
        document.cookie = `NEXT_LOCALE=${language}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Storage and cookies can be unavailable in privacy-restricted browsers.
      }
    }
  }, [language]);

  const setCountry = useCallback(
    (code: CountryCode) => {
      setCountryState(code);
      try {
        localStorage.setItem('lenscode_country', code);
        document.cookie = `NEXT_COUNTRY=${code}; path=/; max-age=31536000; SameSite=Lax`;
      } catch {
        // Storage and cookies can be unavailable in privacy-restricted browsers.
      }
    },
    [setCountryState]
  );

  const setLanguage = useCallback(
    (nextLanguage: Language) => {
      setLanguageState(nextLanguage);
    },
    [setLanguageState]
  );

  const isRtl = language === 'ar';
  const currentCountryInfo = GCC_COUNTRIES[country] || GCC_COUNTRIES.SA;
  const t = useCallback(
    (keyAr: string, keyEn: string) => (language === 'ar' ? keyAr : keyEn),
    [language]
  );
  const convertPrice = useCallback(
    (amountSAR: number): number => amountSAR * currentCountryInfo.rateToSAR,
    [currentCountryInfo]
  );
  const formatPrice = useCallback(
    (amountSAR: number, withSymbol = true): string => {
      const converted = convertPrice(amountSAR);
      const isHighPrecisionCurrency = ['KWD', 'BHD', 'OMR'].includes(
        currentCountryInfo.currencyEn
      );
      const formattedNumber = isHighPrecisionCurrency
        ? converted.toFixed(3)
        : converted % 1 === 0
          ? converted.toFixed(0)
          : converted.toFixed(1);

      if (!withSymbol) return formattedNumber;
      const symbol =
        language === 'ar'
          ? currentCountryInfo.currencyAr
          : currentCountryInfo.currencyEn;
      return language === 'ar'
        ? `${formattedNumber} ${symbol}`
        : `${symbol} ${formattedNumber}`;
    },
    [convertPrice, currentCountryInfo, language]
  );

  const addProduct = useCallback(
    (newProduct: Product) => {
      const updated = [newProduct, ...productsRef.current];
      productsRef.current = updated;
      setProducts(updated);
      void saveProductToFirestore(newProduct).catch((error) =>
        console.warn('Firestore write notice:', getErrorMessage(error))
      );
    },
    [setProducts]
  );

  const updateProduct = useCallback(
    (id: string, updatedFields: Partial<Product>) => {
      const target = productsRef.current.find((product) => product.id === id);
      if (!target) return;

      const targetSku = updatedFields.sku || target.sku;
      const productsToSave: Product[] = [];
      const updated = productsRef.current.map((product) => {
        if (product.id === id) {
          const merged = { ...product, ...updatedFields };
          productsToSave.push(merged);
          return merged;
        }
        if (product.sku === targetSku && updatedFields.colors) {
          const merged = { ...product, colors: updatedFields.colors };
          productsToSave.push(merged);
          return merged;
        }
        return product;
      });

      productsRef.current = updated;
      setProducts(updated);
      productsToSave.forEach((product) => {
        void saveProductToFirestore(product).catch((error) =>
          console.warn('Firestore update notice:', getErrorMessage(error))
        );
      });
    },
    [setProducts]
  );

  const deleteProduct = useCallback(
    (id: string) => {
      const updated = productsRef.current.filter((product) => product.id !== id);
      productsRef.current = updated;
      setProducts(updated);
      void deleteProductFromFirestore(id).catch((error) =>
        console.warn('Firestore delete notice:', getErrorMessage(error))
      );
    },
    [setProducts]
  );

  const duplicateProduct = useCallback(
    (id: string): Product | null => {
      const original = productsRef.current.find((product) => product.id === id);
      if (!original) return null;

      const timestamp = Date.now();
      const clonedProduct: Product = {
        ...original,
        id: `prod-clone-${timestamp}`,
        nameAr: `${original.nameAr} (نسخة مكررة)`,
        nameEn: `${original.nameEn} (Copy)`,
        slug: `${original.slug}-copy-${timestamp}`,
        sku: original.sku,
        colors: original.colors.map((color) => ({
          ...color,
          id: `clr-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        })),
        reviewsCount: 0,
        rating: 5,
      };

      const updated = [clonedProduct, ...productsRef.current];
      productsRef.current = updated;
      setProducts(updated);
      void saveProductToFirestore(clonedProduct).catch((error) =>
        console.warn('Firestore duplicate notice:', getErrorMessage(error))
      );
      return clonedProduct;
    },
    [setProducts]
  );

  const reorderProductColors = useCallback(
    (productId: string, fromIndex: number, toIndex: number) => {
      let changedProduct: Product | undefined;
      const updated = productsRef.current.map((product) => {
        if (product.id !== productId) return product;
        if (
          fromIndex < 0 ||
          fromIndex >= product.colors.length ||
          toIndex < 0 ||
          toIndex >= product.colors.length ||
          fromIndex === toIndex
        ) {
          return product;
        }

        const colors = [...product.colors];
        const [moved] = colors.splice(fromIndex, 1);
        colors.splice(toIndex, 0, moved);
        changedProduct = { ...product, colors };
        return changedProduct;
      });

      if (!changedProduct) return;
      productsRef.current = updated;
      setProducts(updated);
      void saveProductToFirestore(changedProduct).catch((error) =>
        console.warn('Firestore reorder notice:', getErrorMessage(error))
      );
    },
    [setProducts]
  );

  const addToCart = useCallback(
    (
      product: Product,
      selectedColor: ProductColorVariant,
      lensConfig?: CustomLensConfig,
      quantity = 1,
      selectedPackSize?: PackSizeOption,
      contactLensPowerRight?: string,
      contactLensPowerLeft?: string,
      contactLensCylinderRight?: string,
      contactLensCylinderLeft?: string,
      contactLensAxisRight?: string,
      contactLensAxisLeft?: string,
      isSeparatePower?: boolean
    ) => {
      const safeQuantity = Math.max(1, Math.floor(quantity));

      setCart((previous) => {
        let lensHash = 'plano';
        if (lensConfig) {
          lensHash = `${lensConfig.usage}-${lensConfig.lensIndex}-${lensConfig.coatings.join(',')}`;
        } else if (product.category === 'contact-lenses') {
          const packSize = selectedPackSize?.id || 'default';
          const powerRight = contactLensPowerRight || '0.00';
          const powerLeft = contactLensPowerLeft || '0.00';
          const cylinderRight = contactLensCylinderRight || '';
          const cylinderLeft = contactLensCylinderLeft || '';
          const axisRight = contactLensAxisRight || '';
          const axisLeft = contactLensAxisLeft || '';
          const separate = isSeparatePower ? 'sep' : 'same';
          lensHash = `cl-${packSize}-${powerRight}-${powerLeft}-${cylinderRight}-${cylinderLeft}-${axisRight}-${axisLeft}-${separate}`;
        }

        const itemId = `${product.id}_${selectedColor.id}_${lensHash}`;
        let unitPriceSAR = product.basePriceSAR;

        if (lensConfig) {
          unitPriceSAR += lensConfig.lensPriceSAR;
        } else if (product.category === 'contact-lenses') {
          if (selectedPackSize) unitPriceSAR += selectedPackSize.priceSAR;

          const hasPowerRight =
            Boolean(contactLensPowerRight) && contactLensPowerRight !== '0.00';
          const hasPowerLeft = isSeparatePower
            ? Boolean(contactLensPowerLeft) && contactLensPowerLeft !== '0.00'
            : hasPowerRight;
          if (
            (hasPowerRight || hasPowerLeft) &&
            product.powerPriceAddonSAR
          ) {
            unitPriceSAR += product.powerPriceAddonSAR;
          }

          const hasAstigmatismRight = Boolean(
            contactLensCylinderRight || contactLensAxisRight
          );
          const hasAstigmatismLeft = isSeparatePower
            ? Boolean(contactLensCylinderLeft || contactLensAxisLeft)
            : hasAstigmatismRight;
          if (
            (hasAstigmatismRight || hasAstigmatismLeft) &&
            product.astigmatismPriceAddonSAR
          ) {
            unitPriceSAR += product.astigmatismPriceAddonSAR;
          }

          if (isSeparatePower) unitPriceSAR *= 2;
        }

        const existingIndex = previous.findIndex((item) => item.id === itemId);
        if (existingIndex >= 0) {
          return previous.map((item, index) =>
            index === existingIndex
              ? { ...item, quantity: item.quantity + safeQuantity }
              : item
          );
        }

        const newItem: CartItem = {
          id: itemId,
          product,
          selectedColor,
          lensConfig,
          quantity: safeQuantity,
          unitPriceSAR,
          selectedPackSize,
          contactLensPowerRight,
          contactLensPowerLeft,
          contactLensCylinderRight,
          contactLensCylinderLeft,
          contactLensAxisRight,
          contactLensAxisLeft,
          isSeparatePower,
        };
        return [newItem, ...previous];
      });

      setIsCartOpen(true);
    },
    [setCart]
  );

  const updateCartQuantity = useCallback(
    (itemId: string, quantity: number) => {
      setCart((previous) => {
        if (quantity <= 0) {
          return previous.filter((item) => item.id !== itemId);
        }
        const safeQuantity = Math.max(1, Math.floor(quantity));
        return previous.map((item) =>
          item.id === itemId ? { ...item, quantity: safeQuantity } : item
        );
      });
    },
    [setCart]
  );

  const removeFromCart = useCallback(
    (itemId: string) => updateCartQuantity(itemId, 0),
    [updateCartQuantity]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, [setCart]);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );
  const cartSubtotalSAR = useMemo(
    () =>
      cart.reduce(
        (total, item) => total + item.unitPriceSAR * item.quantity,
        0
      ),
    [cart]
  );

  const getCartItemLocalPrice = useCallback(
    (item: CartItem, targetCountry: CountryCode): number => {
      const rate = GCC_COUNTRIES[targetCountry]?.rateToSAR || 1;
      let baseLocal = item.product.basePriceSAR;

      if (
        targetCountry !== 'SA' &&
        item.product.customGccPrices?.[targetCountry] !== undefined
      ) {
        baseLocal = item.product.customGccPrices[targetCountry]!;
      } else if (targetCountry !== 'SA') {
        baseLocal *= rate;
      }

      let priceLocal = baseLocal;
      if (item.product.category === 'contact-lenses') {
        if (item.selectedPackSize) {
          let packLocal = item.selectedPackSize.priceSAR;
          if (
            targetCountry !== 'SA' &&
            item.selectedPackSize.customGccPrices?.[targetCountry] !== undefined
          ) {
            packLocal = item.selectedPackSize.customGccPrices[targetCountry]!;
          } else if (targetCountry !== 'SA') {
            packLocal *= rate;
          }
          priceLocal += packLocal;
        }

        const hasPowerRight =
          Boolean(item.contactLensPowerRight) &&
          item.contactLensPowerRight !== '0.00';
        const hasPowerLeft = item.isSeparatePower
          ? Boolean(item.contactLensPowerLeft) &&
            item.contactLensPowerLeft !== '0.00'
          : hasPowerRight;
        if (
          (hasPowerRight || hasPowerLeft) &&
          item.product.powerPriceAddonSAR
        ) {
          let powerAddonLocal = item.product.powerPriceAddonSAR;
          if (
            targetCountry !== 'SA' &&
            item.product.customPowerPriceAddonGccPrices?.[targetCountry] !==
              undefined
          ) {
            powerAddonLocal =
              item.product.customPowerPriceAddonGccPrices[targetCountry]!;
          } else if (targetCountry !== 'SA') {
            powerAddonLocal *= rate;
          }
          priceLocal += powerAddonLocal;
        }

        const hasAstigmatismRight = Boolean(
          item.contactLensCylinderRight || item.contactLensAxisRight
        );
        const hasAstigmatismLeft = item.isSeparatePower
          ? Boolean(item.contactLensCylinderLeft || item.contactLensAxisLeft)
          : hasAstigmatismRight;
        if (
          (hasAstigmatismRight || hasAstigmatismLeft) &&
          item.product.astigmatismPriceAddonSAR
        ) {
          let astigmatismAddonLocal = item.product.astigmatismPriceAddonSAR;
          if (
            targetCountry !== 'SA' &&
            item.product.customAstigmatismPriceAddonGccPrices?.[targetCountry] !==
              undefined
          ) {
            astigmatismAddonLocal =
              item.product.customAstigmatismPriceAddonGccPrices[targetCountry]!;
          } else if (targetCountry !== 'SA') {
            astigmatismAddonLocal *= rate;
          }
          priceLocal += astigmatismAddonLocal;
        }

        if (item.isSeparatePower) priceLocal *= 2;
      } else if (item.lensConfig) {
        priceLocal +=
          item.lensConfig.lensPriceSAR * (targetCountry === 'SA' ? 1 : rate);
      }

      return priceLocal;
    },
    []
  );

  const cartSubtotalLocal = useMemo(
    () =>
      cart.reduce(
        (sum, item) =>
          sum + getCartItemLocalPrice(item, country) * item.quantity,
        0
      ),
    [cart, country, getCartItemLocalPrice]
  );
  const cartDiscountLocal = useMemo(() => {
    if (!appliedCoupon || cartSubtotalSAR < appliedCoupon.minSpendSAR) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (cartSubtotalLocal * appliedCoupon.discountValue) / 100;
    }
    const rate = country === 'SA' ? 1 : GCC_COUNTRIES[country]?.rateToSAR || 1;
    return Math.min(
      cartSubtotalLocal,
      appliedCoupon.discountValue * rate
    );
  }, [appliedCoupon, cartSubtotalLocal, cartSubtotalSAR, country]);
  const cartTotalLocal = useMemo(
    () => Math.max(0, cartSubtotalLocal - cartDiscountLocal),
    [cartDiscountLocal, cartSubtotalLocal]
  );

  const freeShippingThresholdSAR = currentCountryInfo.freeShippingThresholdSAR;
  const freeShippingRemainingSAR = Math.max(
    0,
    freeShippingThresholdSAR - cartSubtotalSAR
  );
  const freeShippingProgress =
    freeShippingThresholdSAR > 0
      ? Math.min(
          100,
          Math.round((cartSubtotalSAR / freeShippingThresholdSAR) * 100)
        )
      : 100;

  const cartDiscountSAR = useMemo(() => {
    if (!appliedCoupon || cartSubtotalSAR < appliedCoupon.minSpendSAR) return 0;
    if (appliedCoupon.discountType === 'percentage') {
      return (cartSubtotalSAR * appliedCoupon.discountValue) / 100;
    }
    return Math.min(cartSubtotalSAR, appliedCoupon.discountValue);
  }, [appliedCoupon, cartSubtotalSAR]);
  const cartShippingSAR = 0;
  const cartTaxSAR = 0;
  const cartTotalSAR = useMemo(
    () => Math.max(0, cartSubtotalSAR - cartDiscountSAR),
    [cartDiscountSAR, cartSubtotalSAR]
  );

  const applyCoupon = useCallback(
    (code: string) => {
      const cleanCode = code.trim().toUpperCase();
      const found = coupons.find(
        (coupon) => coupon.code.toUpperCase() === cleanCode && coupon.isActive
      );

      if (!found) {
        return {
          success: false,
          message:
            language === 'ar'
              ? 'كوبون الخصم غير صحيح أو منتهي الصلاحية'
              : 'Invalid or expired coupon code',
        };
      }
      if (cartSubtotalSAR < found.minSpendSAR) {
        return {
          success: false,
          message:
            language === 'ar'
              ? `الحد الأدنى للاستخدام هو ${formatPrice(found.minSpendSAR)}`
              : `Minimum spend is ${formatPrice(found.minSpendSAR)}`,
        };
      }

      setAppliedCoupon(found);
      return {
        success: true,
        message:
          language === 'ar'
            ? 'تم تفعيل الكوبون بنجاح!'
            : 'Coupon applied successfully!',
      };
    },
    [cartSubtotalSAR, coupons, formatPrice, language]
  );

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  const addCoupon = useCallback((coupon: Coupon) => {
    setCoupons((previous) => [coupon, ...previous]);
    void saveCouponToFirestore(coupon).catch((error) =>
      console.warn('Firestore coupon notice:', getErrorMessage(error))
    );
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      setWishlistIds((previous) =>
        previous.includes(productId)
          ? previous.filter((id) => id !== productId)
          : [...previous, productId]
      );
    },
    [setWishlistIds]
  );
  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  const placeOrder = useCallback(
    (
      customer: CustomerDetails,
      paymentMethod: Order['paymentMethod'],
      shippingMethod: Order['shippingMethod'],
      loyaltyDiscountSAR = 0
    ): Order => {
      const safeLoyaltyDiscount = Math.max(0, loyaltyDiscountSAR);
      const finalTotalSAR = Math.max(0, cartTotalSAR - safeLoyaltyDiscount);
      const convertedTotal =
        country === 'SA'
          ? finalTotalSAR
          : Math.max(
              0,
              cartTotalLocal -
                safeLoyaltyDiscount * currentCountryInfo.rateToSAR
            );
      const timestamp = Date.now();
      const newOrder: Order = {
        id: `ord-${timestamp}`,
        orderNumber: `LC-${Math.floor(1000 + Math.random() * 9000)}`,
        createdAt: new Date(timestamp).toISOString(),
        status: 'processing',
        items: [...cart],
        customer,
        paymentMethod,
        shippingMethod,
        shippingCostSAR: cartShippingSAR,
        discountSAR: cartDiscountSAR,
        loyaltyDiscountSAR: safeLoyaltyDiscount,
        subtotalSAR: cartSubtotalSAR,
        taxSAR: cartTaxSAR,
        totalSAR: finalTotalSAR,
        currency:
          language === 'ar'
            ? currentCountryInfo.currencyAr
            : currentCountryInfo.currencyEn,
        totalInSelectedCurrency: convertedTotal,
      };

      const changedProducts: Product[] = [];
      const updatedProducts = productsRef.current.map((product) => {
        let productChanged = false;
        const colors = product.colors.map((color) => {
          const purchasedQuantity = cart
            .filter(
              (item) =>
                item.product.sku === product.sku &&
                item.selectedColor.hex === color.hex
            )
            .reduce((sum, item) => sum + item.quantity, 0);
          if (purchasedQuantity <= 0) return color;

          productChanged = true;
          return {
            ...color,
            stock: Math.max(0, color.stock - purchasedQuantity),
          };
        });

        if (!productChanged) return product;
        const changed = { ...product, colors };
        changedProducts.push(changed);
        return changed;
      });

      productsRef.current = updatedProducts;
      setProducts(updatedProducts);
      changedProducts.forEach((product) => {
        void saveProductToFirestore(product).catch((error) =>
          console.warn('Firestore stock update notice:', getErrorMessage(error))
        );
      });

      const updatedOrders = [newOrder, ...ordersRef.current];
      ordersRef.current = updatedOrders;
      setOrders(updatedOrders);
      clearCart();
      setAppliedCoupon(null);
      void saveOrderToFirestore(newOrder).catch((error) =>
        console.warn('Firestore order notice:', getErrorMessage(error))
      );
      return newOrder;
    },
    [
      cart,
      cartDiscountSAR,
      cartSubtotalSAR,
      cartTaxSAR,
      cartTotalLocal,
      cartTotalSAR,
      clearCart,
      country,
      currentCountryInfo,
      language,
      setProducts,
    ]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, status: Order['status']) => {
      let changedOrder: Order | undefined;
      const updated = ordersRef.current.map((order) => {
        if (order.id !== orderId) return order;
        changedOrder = { ...order, status };
        return changedOrder;
      });
      if (!changedOrder) return;

      ordersRef.current = updated;
      setOrders(updated);
      void saveOrderToFirestore(changedOrder).catch((error) =>
        console.warn('Firestore order update notice:', getErrorMessage(error))
      );
    },
    []
  );

  const bookAppointment = useCallback(
    (
      data: Omit<Appointment, 'id' | 'createdAt' | 'status'>
    ): Appointment => {
      const timestamp = Date.now();
      const newAppointment: Appointment = {
        ...data,
        id: `apt-${timestamp}`,
        createdAt: new Date(timestamp).toISOString(),
        status: 'confirmed',
      };
      const updated = [newAppointment, ...appointmentsRef.current];
      appointmentsRef.current = updated;
      setAppointments(updated);
      void saveAppointmentToFirestore(newAppointment).catch((error) =>
        console.warn('Firestore appointment notice:', getErrorMessage(error))
      );
      return newAppointment;
    },
    []
  );

  const updateAppointmentStatus = useCallback(
    (id: string, status: Appointment['status']) => {
      let changedAppointment: Appointment | undefined;
      const updated = appointmentsRef.current.map((appointment) => {
        if (appointment.id !== id) return appointment;
        changedAppointment = { ...appointment, status };
        return changedAppointment;
      });
      if (!changedAppointment) return;

      appointmentsRef.current = updated;
      setAppointments(updated);
      void saveAppointmentToFirestore(changedAppointment).catch((error) =>
        console.warn(
          'Firestore appointment update notice:',
          getErrorMessage(error)
        )
      );
    },
    []
  );

  const addBlogPost = useCallback(
    (post: BlogPost) => {
      setBlogPosts((previous) => [post, ...previous]);
      void saveBlogPostToFirestore(post).catch((error) =>
        console.warn('Firestore blog post notice:', getErrorMessage(error))
      );
    },
    [setBlogPosts]
  );

  const updateBlogPost = useCallback(
    (id: string, post: BlogPost) => {
      const updatedPost = post.id === id ? post : { ...post, id };
      setBlogPosts((previous) =>
        previous.map((item) => (item.id === id ? updatedPost : item))
      );
      void saveBlogPostToFirestore(updatedPost).catch((error) =>
        console.warn('Firestore blog update notice:', getErrorMessage(error))
      );
    },
    [setBlogPosts]
  );

  const deleteBlogPost = useCallback(
    (id: string) => {
      setBlogPosts((previous) => previous.filter((item) => item.id !== id));
      void deleteBlogPostFromFirestore(id).catch((error) =>
        console.warn('Firestore blog delete notice:', getErrorMessage(error))
      );
    },
    [setBlogPosts]
  );

  const openLensWizard = useCallback(
    (product: Product, _preselectedColor?: ProductColorVariant) => {
      setLensWizardProduct(product);
      setIsLensWizardOpen(true);
    },
    []
  );
  const openProductModal = useCallback(
    (product: Product) => setSelectedProduct(product),
    []
  );
  const closeProductModal = useCallback(() => setSelectedProduct(null), []);

  return (
    <AppContext.Provider
      value={{
        country,
        setCountry,
        language,
        setLanguage,
        isRtl,
        t,
        isFirestoreSyncing,
        isInitialDataLoading,
        syncDatabaseToFirestore,
        settings,
        updateSettings,
        categoryConfigs,
        updateCategoryConfig,
        addCategoryConfig,
        deleteCategoryConfig,
        getCategoryConfig,
        currentCountryInfo,
        formatPrice,
        convertPrice,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        duplicateProduct,
        reorderProductColors,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotalSAR,
        cartDiscountSAR,
        cartTaxSAR,
        cartShippingSAR,
        cartTotalSAR,
        getCartItemLocalPrice,
        cartSubtotalLocal,
        cartDiscountLocal,
        cartTotalLocal,
        freeShippingThresholdSAR,
        freeShippingProgress,
        freeShippingRemainingSAR,
        coupons,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        addCoupon,
        wishlistIds,
        toggleWishlist,
        isInWishlist,
        orders,
        setOrders,
        placeOrder,
        updateOrderStatus,
        appointments,
        bookAppointment,
        updateAppointmentStatus,
        blogPosts,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        isVipModalOpen,
        setIsVipModalOpen,
        isLensWizardOpen,
        setIsLensWizardOpen,
        lensWizardProduct,
        openLensWizard,
        isWishlistOpen,
        setIsWishlistOpen,
        isAdmin,
        isAdminOpen,
        setIsAdminOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        selectedProduct,
        openProductModal,
        closeProductModal,
        activeCategory,
        setActiveCategory,
        currentUser,
        userProfile,
        isAuthLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
