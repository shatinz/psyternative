// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "studio-5538372037-e3fbe",
  appId: "1:667170721742:web:37556b5a117376f886259f",
  apiKey: "AIzaSyC3fdTDVOMYhDu0NNmf4KOmBp1wtL2b1xs",
  authDomain: "studio-5538372037-e3fbe.firebaseapp.com",
  measurementId: "",
  messagingSenderId: "667170721742"
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export const auth = getAuth(app);
