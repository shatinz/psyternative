
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
      if (firebaseUser) {
        setUser(firebaseUser);
        const token = await firebaseUser.getIdToken();
        const tokenResult = await firebaseUser.getIdTokenResult();
        const claimsUsername = tokenResult.claims.username as string | undefined;

        setIdToken(token);
        
        if (claimsUsername) {
            setUsername(claimsUsername);
        } else {
            // This case handles users signing in for the first time,
            // especially with Google where the profile might not exist yet.
            let userProfile = await getUserProfile(firebaseUser.uid);
            if (userProfile?.username) {
                setUsername(userProfile.username);
                 // TODO: We should ideally set the custom claim on the server here
                 // if it's missing, but that requires a server endpoint.
            } else {
                // If profile doesn't exist (e.g., first Google Sign-In), create it.
                const baseUsername = firebaseUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
                let finalUsername = baseUsername;

                // Ensure username is unique
                let isUnique = await isUsernameUnique(finalUsername);
                while(!isUnique) {
                    finalUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
                    isUnique = await isUsernameUnique(finalUsername);
                }

                const profileData = {
                    email: firebaseUser.email!,
                    username: finalUsername,
                    displayName: firebaseUser.displayName || finalUsername,
                    createdAt: new Date(),
                };
                await createUserProfile(firebaseUser.uid, profileData);
                // We can't set custom claims from the client.
                // The claim will be set on the next server-side action or re-login.
                // For now, we set it locally for the current session.
                setUsername(finalUsername);
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
