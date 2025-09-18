
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
    console.log("[AUTH_PROVIDER] Mounting: Setting up onAuthStateChanged listener.");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(`[AUTH_PROVIDER] onAuthStateChanged Fired. User: ${firebaseUser?.uid || 'null'}`);
      
      if (firebaseUser) {
        // User is signed in.
        if (user?.uid === firebaseUser.uid) {
            console.log(`[AUTH_PROVIDER] User is already set. Skipping profile logic. UID: ${firebaseUser.uid}`);
            setLoading(false);
            return;
        }

        console.log(`[AUTH_PROVIDER] New user detected. UID: ${firebaseUser.uid}. Starting profile check.`);
        const tokenResult = await firebaseUser.getIdTokenResult();
        
        console.log(`[AUTH_PROVIDER] Attempting to get user profile for UID: ${firebaseUser.uid}`);
        let userProfile = await getUserProfile(firebaseUser.uid);
        
        if (!userProfile) {
          console.log(`[AUTH_PROVIDER] No profile found for UID: ${firebaseUser.uid}. Proceeding to create one.`);
          const baseUsername = firebaseUser.email?.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '') || `user_${Date.now()}`;
          let finalUsername = baseUsername;

          console.log(`[AUTH_PROVIDER] Checking username uniqueness for: ${finalUsername}`);
          let isUnique = await isUsernameUnique(finalUsername);
          let attempts = 0;
          while(!isUnique && attempts < 5) {
              attempts++;
              console.log(`[AUTH_PROVIDER] Username ${finalUsername} is not unique. Attempt #${attempts}.`);
              finalUsername = `${baseUsername}_${Math.random().toString(36).substring(2, 6)}`;
              isUnique = await isUsernameUnique(finalUsername);
          }
          if (!isUnique) {
            finalUsername = `user_${firebaseUser.uid.substring(0, 5)}`;
            console.log(`[AUTH_PROVIDER] Could not find unique username after 5 attempts. Defaulting to: ${finalUsername}`);
          }

          const profileData = {
              email: firebaseUser.email!,
              username: finalUsername,
              displayName: firebaseUser.displayName || finalUsername,
          };
          
          console.log(`[AUTH_PROVIDER] Calling createUserProfile for UID: ${firebaseUser.uid}`);
          await createUserProfile(firebaseUser.uid, profileData);
          console.log("[AUTH_PROVIDER] New user profile created in DB:", profileData);
          
          setUsername(finalUsername);
        } else {
            console.log(`[AUTH_PROVIDER] Profile found for user: ${userProfile.username}`);
            setUsername(userProfile.username);
        }

        console.log("[AUTH_PROVIDER] Setting user state in context.");
        setUser(firebaseUser);
        setIdToken(tokenResult.token);
        
      } else {
        // User is signed out.
        console.log("[AUTH_PROVIDER] No user found (signed out). Clearing user state.");
        setUser(null);
        setIdToken(null);
        setUsername(null);
      }
      console.log("[AUTH_PROVIDER] All tasks finished. Setting loading to false.");
      setLoading(false);
    });

    return () => {
        console.log("[AUTH_PROVIDER] Unmounting: Cleaning up onAuthStateChanged listener.");
        unsubscribe();
    }
  }, [user]);

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
