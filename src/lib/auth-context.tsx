
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfile, isUsernameUnique } from "./data";

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
    console.log("AuthProvider: useEffect initiated.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AuthProvider: onAuthStateChanged event fired.");
      setLoading(true);
      if (firebaseUser) {
        console.log(`AuthProvider: User found with UID: ${firebaseUser.uid}. Fetching token and profile.`);
        const tokenResult = await firebaseUser.getIdTokenResult();
        
        let userProfile = await getUserProfile(firebaseUser.uid);
        
        if (!userProfile) {
          console.log(`AuthProvider: No profile found for UID: ${firebaseUser.uid}. Creating new profile.`);
          const baseUsername = firebaseUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
          let finalUsername = baseUsername;

          let isUnique = await isUsernameUnique(finalUsername);
          let attempts = 0;
          while(!isUnique && attempts < 5) {
              console.log(`AuthProvider: Username ${finalUsername} is not unique. Trying again.`);
              finalUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
              isUnique = await isUsernameUnique(finalUsername);
              attempts++;
          }
          if (!isUnique) finalUsername = `user_${firebaseUser.uid.substring(0, 5)}`

          const profileData = {
              email: firebaseUser.email!,
              username: finalUsername,
              displayName: firebaseUser.displayName || finalUsername,
          };
          
          await createUserProfile(firebaseUser.uid, profileData);
          console.log("AuthProvider: New user profile created in DB:", profileData);
          
          setUsername(finalUsername);
          userProfile = { uid: firebaseUser.uid, createdAt: new Date(), ...profileData };
        } else {
            console.log(`AuthProvider: Profile found for user: ${userProfile.username}`);
            setUsername(userProfile.username);
        }

        console.log("AuthProvider: Setting user state.");
        setUser(firebaseUser);
        setIdToken(tokenResult.token);
        
      } else {
        console.log("AuthProvider: No user found. Clearing user state.");
        setUser(null);
        setIdToken(null);
        setUsername(null);
      }
      console.log("AuthProvider: Setting loading to false.");
      setLoading(false);
    });

    return () => {
        console.log("AuthProvider: useEffect cleanup. Unsubscribing from onAuthStateChanged.");
        unsubscribe();
    }
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
