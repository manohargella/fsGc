import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCZpkOkR7VEIgzNVye9oKxGVMsukkjfIUc",
  authDomain: "gradecal-e1609.firebaseapp.com",
  projectId: "gradecal-e1609",
  storageBucket: "gradecal-e1609.firebasestorage.app",
  messagingSenderId: "922746991500",
  appId: "1:922746991500:web:3822dd2518502ade419ca9",
  measurementId: "G-L18TK8DP9K"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

const isFirebaseConfigured = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

if (isFirebaseConfigured && firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);
} else {
  if (typeof window !== 'undefined') {
    console.warn("Firebase config is not set. Please update .env.local. App will run in local-only mode.");
  }
}

export { app, auth, db };
