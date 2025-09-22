"use client";
// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3fdTDVOMYhDu0NNmf4KOmBp1wtL2b1xs",
  authDomain: "studio-5538372037-e3fbe.firebaseapp.com",
  projectId: "studio-5538372037-e3fbe",
  storageBucket: "studio-5538372037-e3fbe.appspot.com",
  messagingSenderId: "667170721742",
  appId: "1:667170721742:web:37556b5a117376f886259f",
  measurementId: ""
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}


export const auth = getAuth(app);
export const db = getFirestore(app);
