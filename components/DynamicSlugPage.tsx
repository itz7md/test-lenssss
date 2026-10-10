'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { CategoryView } from '@/components/CategoryView';
import { ProductView } from '@/components/ProductView';
import { BlogListingView } from '@/components/BlogListingView';
import { BlogPostView } from '@/components/BlogPostView';

export const DynamicSlugPage: React.FC<{
  slug?: string;
  slugSegments?: string[];
}> = ({ slug, slugSegments }) => {
  const { products, blogPosts } = useApp();

  const rawSegments = slugSegments && slugSegments.length > 0
    ? slugSegments
    : slug
    ? [slug]
    : ['eyeglasses'];

  const cleanSegments = rawSegments.map((s) => decodeURIComponent(s).toLowerCase().trim());
  const firstSegment = cleanSegments[0];

  // 1. Check if this is the blog hub: /blog
  if (firstSegment === 'blog') {
    if (cleanSegments.length === 1) {
      return <BlogListingView />;
    }
    // Single blog post: /blog/[article-slug]
    const articleSlug = cleanSegments.slice(1).join('/');
    return <BlogPostView slug={articleSlug} />;
  }

  // 2. Check if the segment matches any blog post by slug or ID directly
  const matchedBlogPost = blogPosts.find(
    (b) =>
      cleanSegments.some(
        (seg) =>
          (b.slug && b.slug.toLowerCase().trim() === seg) ||
          (b.id && b.id.toLowerCase().trim() === seg)
      )
  );

  if (matchedBlogPost) {
    return <BlogPostView slug={matchedBlogPost.slug || matchedBlogPost.id} />;
  }

  // 3. Check if any segment matches a product by slug or ID
  const matchedProduct = products.find(
    (p) =>
      cleanSegments.some(
        (seg) =>
          (p.slug && p.slug.toLowerCase().trim() === seg) ||
          (p.id && p.id.toLowerCase().trim() === seg)
      )
  );

  if (matchedProduct) {
    return <ProductView slug={matchedProduct.slug || matchedProduct.id} />;
  }

  // 4. Fallback to CategoryView with all slug segments
  return <CategoryView slugSegments={cleanSegments} />;
};

