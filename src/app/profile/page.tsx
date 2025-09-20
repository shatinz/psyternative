// This page is now a redirector.
// The main profile logic is in /profile/[username]/page.tsx
'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/signin');
    } else {
      router.push(`/profile/${user.name}`);
    }
  }, [user, loading, router]);

  // Show a loading state while redirecting
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <Skeleton className="h-10 w-1/2" />
        <Skeleton className="mt-2 h-6 w-1/3" />
      </header>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="md:col-span-2">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  );
}
