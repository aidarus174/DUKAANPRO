import { initializeApp, getApps } from "firebase/app";
import {
  getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence
} from "firebase/auth";
import {
  getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager
} from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const firebaseConfigured = Object.values(firebaseConfig).every(Boolean);
export const firebaseProjectId = firebaseConfig.projectId;

let app = null;
export let auth = null;
export let db = null;
export let storage = null;
export let googleProvider = null;

if (firebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Persistence is intentionally best-effort; the app must still render if the browser blocks it.
  setPersistence(auth, browserLocalPersistence).catch(() => {});
  googleProvider = new GoogleAuthProvider();

  try {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
    });
  } catch (e) {
    // initializeFirestore can fail when another Firebase module already initialized Firestore.
    // Fall back to the normal Firestore instance instead of crashing the entire UI.
    db = getFirestore(app);
  }
  storage = getStorage(app);
}
