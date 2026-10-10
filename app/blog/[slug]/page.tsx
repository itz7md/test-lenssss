import React from 'react';
import { BlogPostView } from '@/components/BlogPostView';

export const dynamic = 'force-dynamic';

export default async function SingleBlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  return <BlogPostView slug={resolvedParams.slug} />;
}
