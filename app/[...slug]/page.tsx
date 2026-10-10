import React from 'react';
import { DynamicSlugPage } from '@/components/DynamicSlugPage';

export const dynamic = 'force-dynamic';

export default async function CatchAllSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const resolvedParams = await params;
  const slugSegments = resolvedParams?.slug || [];
  return <DynamicSlugPage slugSegments={slugSegments} />;
}
