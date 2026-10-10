'use client';

import { useSyncExternalStore, useCallback } from 'react';

// In-memory store cache & listener registry for cross-component and local updates
const memoryCache = new Map<string, any>();
const listeners = new Map<string, Set<() => void>>();

function getListeners(key: string): Set<() => void> {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }
  return listeners.get(key)!;
}

function notifyListeners(key: string) {
  const set = listeners.get(key);
  if (set) {
    set.forEach((listener) => listener());
  }
}

export function usePersistentStore<T>(
  key: string,
  defaultValue: T
): [T, (valueOrUpdater: T | ((prev: T) => T)) => void] {
  // Subscribe to storage and in-app changes
  const subscribe = useCallback(
    (callback: () => void) => {
      const set = getListeners(key);
      set.add(callback);

      const handleStorage = (e: StorageEvent) => {
        if (e.key === key) {
          memoryCache.delete(key);
          callback();
        }
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('storage', handleStorage);
      }

      return () => {
        set.delete(callback);
        if (typeof window !== 'undefined') {
          window.removeEventListener('storage', handleStorage);
        }
      };
    },
    [key]
  );

  const getSnapshot = useCallback((): T => {
    if (typeof window === 'undefined') {
      return defaultValue;
    }

    if (memoryCache.has(key)) {
      return memoryCache.get(key);
    }

    try {
      let raw = localStorage.getItem(key);
      if (raw === null) {
        if (key.includes('category_configs')) {
          raw = localStorage.getItem('lenscode_category_configs_v7') ||
                localStorage.getItem('lenscode_category_configs_v6') ||
                localStorage.getItem('lenscode_category_configs');
        } else if (key.includes('products')) {
          raw = localStorage.getItem('lenscode_products_v3') ||
                localStorage.getItem('lenscode_products');
        } else if (key.includes('settings')) {
          raw = localStorage.getItem('lenscode_settings_v5') ||
                localStorage.getItem('lenscode_settings');
        }
      }
      if (raw !== null) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(defaultValue) && defaultValue.length > 0 && Array.isArray(parsed) && parsed.length === 0) {
          memoryCache.set(key, defaultValue);
          return defaultValue;
        }
        memoryCache.set(key, parsed);
        return parsed;
      }
    } catch {
      // If parsing fails, use raw value if string or fallback to defaultValue
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          memoryCache.set(key, raw);
          return raw as unknown as T;
        }
      } catch {}
    }

    memoryCache.set(key, defaultValue);
    return defaultValue;
  }, [key, defaultValue]);

  const getServerSnapshot = useCallback((): T => {
    return defaultValue;
  }, [defaultValue]);

  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setState = useCallback(
    (valueOrUpdater: T | ((prev: T) => T)) => {
      const current = getSnapshot();
      const nextValue =
        typeof valueOrUpdater === 'function'
          ? (valueOrUpdater as (prev: T) => T)(current)
          : valueOrUpdater;

      memoryCache.set(key, nextValue);
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, JSON.stringify(nextValue));
        }
      } catch {}

      notifyListeners(key);
    },
    [key, getSnapshot]
  );

  return [state, setState];
}
