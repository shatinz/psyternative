
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile, isUsernameUnique } from "./data";
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        // User is signed in.
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claimsUsername = tokenResult.claims.username as string | undefined;

        let userProfile = await getUserProfile(firebaseUser.uid);
        
        // This is the core logic fix:
        // If the user exists in Auth but not in our database, it means it's their first login.
        // We must create their profile document now.
        if (!userProfile) {
          console.log("User profile not found, creating a new one...");
          const baseUsername = firebaseUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
          let finalUsername = baseUsername;

          // Ensure username is unique before creating
          let isUnique = await isUsernameUnique(finalUsername);
          let attempts = 0;
          while(!isUnique && attempts < 5) {
              finalUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
              isUnique = await isUsernameUnique(finalUsername);
              attempts++;
          }
          if (!isUnique) finalUsername = `user_${firebaseUser.uid.substring(0, 5)}` // Fallback

          const profileData = {
              email: firebaseUser.email!,
              username: finalUsername,
              displayName: firebaseUser.displayName || finalUsername,
              createdAt: new Date(),
          };
          await createUserProfile(firebaseUser.uid, profileData);
          console.log("New user profile created:", profileData);
          
          // We can't set custom claims from the client.
          // The claim will be set on the next server-side action or after a re-login.
          // For now, we use the username we just created for the current session.
          setUsername(finalUsername);
          userProfile = { uid: firebaseUser.uid, ...profileData };
        } else {
            setUsername(userProfile.username);
        }

        // Set the user and token state
        setUser(firebaseUser);
        setIdToken(tokenResult.token);
        
      } else {
        // User is signed out.
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
