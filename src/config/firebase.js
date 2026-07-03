import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCM7p8dZRvfgwLw0BQtjtMQUziJbC4h080",
  authDomain: "chitro-56553.firebaseapp.com",
  projectId: "chitro-56553",
  storageBucket: "chitro-56553.firebasestorage.app",
  messagingSenderId: "779206051742",
  appId: "1:779206051742:web:192172519224bbc3bc788f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
export const appleProvider = new OAuthProvider('apple.com'); // Apple Provider যোগ করা হলো