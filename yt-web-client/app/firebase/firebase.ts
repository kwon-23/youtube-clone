// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, 
         signInWithPopup, 
         GoogleAuthProvider,
         onAuthStateChanged,
         User
        } from "firebase/auth"


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBkNV62cngs-GIzztDl6VmZ3PxjLm2VMGM",
  authDomain: "yt-clone-cbe74.firebaseapp.com",
  projectId: "yt-clone-cbe74",
  appId: "1:222088995898:web:b10964c22919ffe0140103"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const functions = getFunctions();


/**
 * Signs the user in with a Google popup
 * @returns A promise that resolves with the user's credentials.
 */
export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

/** 
 * @returns A promise that resolves when the user is signed out.
 */
export function signOut() {
  return auth.signOut();
}

/**
 * Trigger a callback when user auth state changes.
 * @returns A function to unsubscribe callback.
 */
export function onAuthStateChangedHelper(callback: (user: User | null) => void) {
  // This function also tells whether the user is currently signed in or not, which tells the client
  // which button to display between sign in and sign out
  return onAuthStateChanged(auth, callback);
}