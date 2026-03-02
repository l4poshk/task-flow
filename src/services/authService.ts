import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
    onAuthStateChanged,
    deleteUser,
    type User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, githubProvider, firebaseInitialized, isDemoMode } from './firebase';
import type { UserProfile } from '../types';

// Create or update user document in Firestore
async function upsertUserDoc(user: User): Promise<void> {
    if (!firebaseInitialized) return;
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email?.split('@')[0] || 'User',
            photoURL: user.photoURL || '',
            createdAt: serverTimestamp(),
        });
    }
}

// Register with email & password
export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
    if (isDemoMode) {
        const mockUser = {
            uid: 'demo-user-' + Math.random().toString(36).substr(2, 9),
            email,
            displayName,
            photoURL: '',
        } as User;
        localStorage.setItem('taskflow_demo_user', JSON.stringify(mockUser));
        return mockUser;
    }
    if (!firebaseInitialized) throw new Error('Firebase is not configured. Please add your Firebase config.');
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await upsertUserDoc(cred.user);
    return cred.user;
}

// Login with email & password
export async function loginWithEmail(email: string, _password: string): Promise<User> {
    if (isDemoMode) {
        const saved = localStorage.getItem('taskflow_demo_user');
        if (saved) return JSON.parse(saved);
        const mockUser = { uid: 'demo-user', email, displayName: email.split('@')[0] } as User;
        localStorage.setItem('taskflow_demo_user', JSON.stringify(mockUser));
        return mockUser;
    }
    if (!firebaseInitialized) throw new Error('Firebase is not configured. Please add your Firebase config.');
    const cred = await signInWithEmailAndPassword(auth, email, _password);
    return cred.user;
}

// Login with Google
export async function loginWithGoogle(): Promise<User> {
    if (isDemoMode) {
        const mockUser = { uid: 'demo-user', email: 'google-demo@example.com', displayName: 'Google Guest' } as User;
        localStorage.setItem('taskflow_demo_user', JSON.stringify(mockUser));
        return mockUser;
    }
    if (!firebaseInitialized) throw new Error('Firebase is not configured. Please add your Firebase config.');
    const cred = await signInWithPopup(auth, googleProvider);
    await upsertUserDoc(cred.user);
    return cred.user;
}

// Login with GitHub
export async function loginWithGithub(): Promise<User> {
    if (isDemoMode) {
        const mockUser = { uid: 'demo-user', email: 'github-demo@example.com', displayName: 'GitHub Guest' } as User;
        localStorage.setItem('taskflow_demo_user', JSON.stringify(mockUser));
        return mockUser;
    }
    if (!firebaseInitialized) throw new Error('Firebase is not configured. Please add your Firebase config.');
    const cred = await signInWithPopup(auth, githubProvider);
    await upsertUserDoc(cred.user);
    return cred.user;
}

// Logout
export async function logout(): Promise<void> {
    if (isDemoMode) {
        localStorage.removeItem('taskflow_demo_user');
        window.location.reload();
        return;
    }
    if (!firebaseInitialized) return;
    await signOut(auth);
}

// Delete Account
export async function deleteAccount(): Promise<void> {
    if (isDemoMode) {
        localStorage.removeItem('taskflow_demo_user');
        window.location.reload();
        return;
    }
    if (!firebaseInitialized) return;
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    // 1. Delete Firestore user profile
    try {
        const userRef = doc(db, 'users', user.uid);
        await deleteDoc(userRef);
    } catch (e) {
        console.warn('Failed to delete Firestore user doc, proceeding with auth deletion');
    }

    // 2. Delete Auth user
    await deleteUser(user);
}

// Update user profile
export async function updateUserProfile(displayName: string, photoURL: string): Promise<void> {
    if (!firebaseInitialized) throw new Error('Firebase is not configured.');
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    await updateProfile(user, { displayName, photoURL });

    const userRef = doc(db, 'users', user.uid);
    await setDoc(userRef, { displayName, photoURL }, { merge: true });
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    if (!firebaseInitialized) return null;
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) return null;
    return { ...snap.data(), uid } as UserProfile;
}

// Subscribe to auth state
export function subscribeToAuth(callback: (user: User | null) => void) {
    if (isDemoMode) {
        const saved = localStorage.getItem('taskflow_demo_user');
        setTimeout(() => callback(saved ? JSON.parse(saved) : null), 100);
        return () => { };
    }
    if (!firebaseInitialized) {
        // If Firebase isn't configured, immediately call back with null user
        setTimeout(() => callback(null), 0);
        return () => { };
    }
    return onAuthStateChanged(auth, callback);
}
