import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, inMemoryPersistence, browserLocalPersistence, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

let authInstance;
try {
  // Try default auth
  authInstance = getAuth(app);
} catch (e) {
  // Fallback if indexedDB/localStorage is blocked
  authInstance = initializeAuth(app, {
    persistence: inMemoryPersistence
  });
}
export const auth = authInstance;

const firestoreDbId = (firebaseConfig as any).firestoreDatabaseId || (firebaseConfig as any).databaseId || 'ai-studio-53e6bc08-2f74-4f5e-816d-59b2e44f3829';
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firestoreDbId);



const provider = new GoogleAuthProvider();

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // If not using Google Sign-In with tokens, we just trigger success if we only care about email/pwd
        if (user.providerData.some(p => p.providerId === 'password')) {
           // It's email/pwd user
           if (onAuthSuccess) onAuthSuccess(user, '');
        } else {
           cachedAccessToken = null;
           if (onAuthFailure) onAuthFailure();
        }
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Failed to get access token from Firebase Auth');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/user-cancelled' && error.code !== 'auth/cancelled-popup-request') {
      console.error('Sign in error:', error);
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await auth.signOut();
  cachedAccessToken = null;
};
