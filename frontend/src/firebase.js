import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY || "AIzaSyDArKUJRozO-NEsq-SsrkCfQg0yWx7Uh4k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "suran-sewing.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "suran-sewing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "suran-sewing.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "682900204352",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:682900204352:web:1a29d9704bcbe47480a8a5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
