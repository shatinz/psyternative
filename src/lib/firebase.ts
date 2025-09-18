// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-2320350643-3700f",
  appId: "1:257421938728:web:f9ab42e4c28e306eb8251d",
  storageBucket: "studio-2320350643-3700f.firebasestorage.app",
  apiKey: "AIzaSyC74NOufeSwr8l-_AtuKr23yowuCHOEn8w",
  authDomain: "studio-2320350643-3700f.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "257421938728"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, db, auth, googleProvider };
