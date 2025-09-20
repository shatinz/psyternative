'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function MyProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return; // Wait until loading is complete
    }

    if (!user) {
      // If not logged in, redirect to sign-in page
      router.push('/signin');
    } else if (user.name) {
      // If logged in and user object has a name, redirect to their profile
      router.push(`/profile/${user.name}`);
    }
    // If user exists but name doesn't, we'll just show the loading skeleton until the user object is fully populated.
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
