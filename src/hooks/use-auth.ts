'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import type { User } from '@/lib/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
          if (firebaseUser) {
            // Fetch user data from API route
            fetch(`/api/user?uid=${firebaseUser.uid}`)
              .then(res => res.json())
              .then(({ user: userData }) => {
                if (userData) {
                  setUser({
                    id: firebaseUser.uid,
                    name: userData.name || firebaseUser.displayName || 'User',
                    email: userData.email || firebaseUser.email,
                    avatarUrl: userData.avatarUrl || `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
                    hasChangedUsername: userData.hasChangedUsername || false,
                    bio: userData.bio || '',
                    isAdmin: userData.isAdmin || false,
                  });
                } else {
                  setUser({
                    id: firebaseUser.uid,
                    name: firebaseUser.displayName || 'User',
                    email: firebaseUser.email,
                    avatarUrl: `https://picsum.photos/seed/${firebaseUser.uid}/100/100`,
                    hasChangedUsername: false,
                    bio: '',
                  });
                }
              });
          } else {
            setUser(null);
          }
          setLoading(false);
        });
        return () => unsubscribe();
      })
      .catch((error) => {
        setLoading(false);
      });
  }, []);

  return { user, loading };
}
