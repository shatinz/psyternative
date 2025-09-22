"use client";
import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ProfileClientPage from '@/components/profile-client-page';

export default function ProfileUserLoader({ username }: { username: string }) {
  const [profileUser, setProfileUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('name', '==', username));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const userDoc = querySnapshot.docs[0];
        setProfileUser({ id: userDoc.id, ...userDoc.data() });
      } else {
        setProfileUser(null);
      }
      setLoading(false);
    }
    fetchUser();
  }, [username]);

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!profileUser) return <div>کاربر پیدا نشد.</div>;
  return <ProfileClientPage profileUser={profileUser} />;
}
