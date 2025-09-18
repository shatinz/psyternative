
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile } from "./data";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  idToken: string | null;
  username: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  idToken: null,
  username: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [idToken, setIdToken] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const token = await user.getIdToken();
        setIdToken(token);

        let userProfile = await getUserProfile(user.uid);
        if (!userProfile) {
          // If profile doesn't exist, create it (e.g., for Google Sign-In)
          const newUsername = user.email?.split('@')[0] || `user_${Date.now()}`;
          const profileData = {
            email: user.email!,
            username: newUsername,
            displayName: user.displayName || newUsername,
            createdAt: new Date(),
          };
          await createUserProfile(user.uid, profileData);
          userProfile = { uid: user.uid, ...profileData };
        }
        setUsername(userProfile.username);

      } else {
        setUser(null);
        setIdToken(null);
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, idToken, username }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
