
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile } from "./data";
import { getAuth } from "firebase-admin/auth";
import { adminApp } from "./firebase-admin";

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
        const tokenResult = await user.getIdTokenResult();
        const claimsUsername = tokenResult.claims.username as string | undefined;

        setIdToken(token);
        
        if (claimsUsername) {
            setUsername(claimsUsername);
        } else {
            // This might be a new user, let's check their profile
            let userProfile = await getUserProfile(user.uid);
            if (userProfile) {
                setUsername(userProfile.username);
            } else {
                // If profile doesn't exist (e.g., first Google Sign-In), create it.
                const newUsername = user.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
                const profileData = {
                    email: user.email!,
                    username: newUsername,
                    displayName: user.displayName || newUsername,
                    createdAt: new Date(),
                };
                await createUserProfile(user.uid, profileData);
                // We can't set custom claims from the client, 
                // so we just set the username locally for this session.
                // The claim will be set on the next server-side action or re-login.
                setUsername(newUsername);
            }
        }
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
