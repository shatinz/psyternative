'use client';

import ProfileForm from '@/components/profile-form';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/signin');
    }
  }, [user, loading, router]);

  if (loading || !user) {
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

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">پروفایل کاربری</h1>
        <p className="text-muted-foreground">
          اطلاعات حساب کاربری خود را مدیریت کنید.
        </p>
      </header>
      <ProfileForm user={user} />
    </div>
  );
}
