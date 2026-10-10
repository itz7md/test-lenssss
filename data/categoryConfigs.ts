import { CategoryConfig } from '@/types';

export const DEFAULT_CATEGORY_CONFIGS: CategoryConfig[] = [];


export function getCategoryConfigBySlug(configs: CategoryConfig[], slug: string): CategoryConfig | undefined {
  if (!slug || !Array.isArray(configs)) return undefined;
  const cleanSlug = slug.toLowerCase().trim();
  return configs.find(
    c =>
      c.slug?.toLowerCase().trim() === cleanSlug ||
      c.id === cleanSlug ||
      c.nameEn?.toLowerCase() === cleanSlug ||
      c.nameAr === cleanSlug
  );
}
