import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  redirect(`/${resolvedParams?.slug || 'eyeglasses'}`);
}
