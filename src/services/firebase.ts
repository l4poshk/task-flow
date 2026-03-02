import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// ⚠️ REPLACE with your own Firebase config from:
// https://console.firebase.google.com → Project Settings → Your apps
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let firebaseInitialized = false;
let firebaseError: string | null = null;

// Determine if we should use Mock/Demo mode (if keys are missing or placeholders)
const isDemoMode = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes('your_api_key');

// Initial stubs so imports don't crash
app = {} as FirebaseApp;
auth = {} as Auth;
db = {} as Firestore;

if (!isDemoMode) {
    try {
        const firebaseApp = initializeApp(firebaseConfig);
        app = firebaseApp;
        auth = getAuth(app);
        db = getFirestore(app);
        firebaseInitialized = true;
    } catch (error) {
        console.error('Firebase initialization failed:', error);
        firebaseError = error instanceof Error ? error.message : 'Firebase initialization failed';
    }
} else {
    console.warn('Running in Demo Mode: No valid Firebase keys found. Data will be saved to LocalStorage.');
}

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { app, auth, db, googleProvider, githubProvider, firebaseInitialized, firebaseError, isDemoMode };
export default app;
