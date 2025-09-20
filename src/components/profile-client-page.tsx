// This is a new file
'use client';

import { useAuth } from '@/hooks/use-auth';
import type { User } from '@/lib/types';
import ProfileForm from '@/components/profile-form';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react';

export default function ProfileClientPage({
  profileUser,
}: {
  profileUser: User;
}) {
  const { user: currentUser, loading: authLoading } = useAuth();

  if (authLoading) {
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

  const isOwnProfile = currentUser?.id === profileUser?.id;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <header className="mb-8">
        <h1 className="font-headline text-4xl font-bold">
          {isOwnProfile ? 'پروفایل شما' : `پروفایل ${profileUser?.name}`}
        </h1>
        <p className="text-muted-foreground">
          {isOwnProfile
            ? 'اطلاعات حساب کاربری خود را مدیریت کنید.'
            : `اطلاعات عمومی کاربر ${profileUser?.name}.`}
        </p>
      </header>

      {isOwnProfile ? (
        <ProfileForm user={profileUser} />
      ) : (
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="items-center text-center">
                <Avatar className="h-24 w-24 border-4 border-primary/50">
                  <AvatarImage
                    src={profileUser.avatarUrl}
                    alt={profileUser.name}
                    data-ai-hint="profile portrait"
                  />
                  <AvatarFallback className="text-4xl">
                    {profileUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <CardTitle className="pt-4 font-headline text-2xl">
                  {profileUser.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full" disabled>
                  <Mail className="ml-2 h-4 w-4" />
                  ارسال پیام خصوصی
                </Button>
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  قابلیت ارسال پیام به زودی اضافه می‌شود.
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">بیوگرافی</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {profileUser.bio || 'این کاربر هنوز بیوگرافی ننوشته است.'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
