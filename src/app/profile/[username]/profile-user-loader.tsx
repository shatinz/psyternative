"use client";
import { useEffect, useState } from 'react';
//
import ProfileClientPage from '@/components/profile-client-page';

export default function ProfileUserLoader({ username }: { username: string }) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Lookup user by username via API route
    fetch(`/api/user?username=${encodeURIComponent(username)}`)
      .then(res => res.json())
      .then(({ user }) => {
        setProfileUser(user || null);
        setLoading(false);
      });
  }, [username]);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!profileUser) return <div>کاربر پیدا نشد.</div>;
  return <ProfileClientPage profileUser={profileUser} />;
}
