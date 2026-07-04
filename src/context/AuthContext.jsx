// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider, appleProvider } from '../config/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';

const AuthContext = createContext();

const ADMIN_EMAIL = 'shababmuktadir@gmail.com';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribeAuth;
  }, []);

  // 2. Listen to Firestore document when user changes
  useEffect(() => {
    let unsubscribeFirestore = null;

    const listenToUserDoc = async () => {
      if (!user) {
        setUserData(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      const isAdmin = user.email === ADMIN_EMAIL;
      const collectionName = isAdmin ? 'admin' : 'students';
      const docRef = doc(db, collectionName, user.uid);

      unsubscribeFirestore = onSnapshot(
        docRef,
        (docSnap) => {
          if (docSnap.exists()) {
            setUserData({ id: docSnap.id, ...docSnap.data() });
          } else {
            // If document doesn't exist, userData stays null
            setUserData(null);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Firestore listener error:', error);
          setLoading(false);
        }
      );
    };

    listenToUserDoc();

    return () => {
      if (unsubscribeFirestore) {
        unsubscribeFirestore();
      }
    };
  }, [user]);

  // 3. Email/Password Signup
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: name });

      // Send verification email for non‑admin users
      if (email !== ADMIN_EMAIL) {
        try {
          await sendEmailVerification(newUser);
        } catch (err) {
          console.warn('Verification email send failed:', err);
        }
      }

      const isAdmin = email === ADMIN_EMAIL;
      const targetCollection = isAdmin ? 'admin' : 'students';

      const newDocData = isAdmin
        ? {
            uid: newUser.uid,
            email,
            role: 'admin',
            displayName: name,
            createdAt: new Date().toISOString(),
          }
        : {
            uid: newUser.uid,
            displayName: name,
            email,
            role: 'student',
            emailVerified: false,
            personalData: {
              phone: '',
              bio: '',
              institution: '',
              address: '',
            },
            enrolledFreeCourses: [],
            purchasedCourses: [],
            paymentHistory: [],
            joinedAt: new Date().toISOString(),
          };

      await setDoc(doc(db, targetCollection, newUser.uid), newDocData);
      setUserData(newDocData);
      setLoading(false);
      return newUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // 4. Email/Password Login (with verification check)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = result.user;

      if (email !== ADMIN_EMAIL && !loggedUser.emailVerified) {
        await signOut(auth);
        setLoading(false);
        const error = new Error(
          'আপনার ইমেইলটি এখনো ভেরিফাই করা হয়নি! দয়া করে আপনার ইনবক্স চেক করে ভেরিফিকেশন লিংকে ক্লিক করুন।'
        );
        error.code = 'auth/unverified-email';
        throw error;
      }

      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // 5. Social Login (Google / Apple)
  const socialLogin = async (providerName) => {
    setLoading(true);
    try {
      const provider = providerName === 'google' ? googleProvider : appleProvider;
      if (providerName === 'google') {
        provider.setCustomParameters({ prompt: 'select_account' });
      }

      const result = await signInWithPopup(auth, provider);
      const loggedUser = result.user;
      const isAdmin = loggedUser.email === ADMIN_EMAIL;
      const targetCollection = isAdmin ? 'admin' : 'students';
      const docRef = doc(db, targetCollection, loggedUser.uid);

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        // Create new document
        const initialData = isAdmin
          ? {
              uid: loggedUser.uid,
              email: ADMIN_EMAIL,
              role: 'admin',
              displayName: loggedUser.displayName || 'Admin Shabab',
              createdAt: new Date().toISOString(),
            }
          : {
              uid: loggedUser.uid,
              displayName: loggedUser.displayName || 'Student',
              email: loggedUser.email,
              photoURL:
                loggedUser.photoURL ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${loggedUser.uid}`,
              role: 'student',
              emailVerified: true,
              personalData: { phone: '', bio: '', institution: '', address: '' },
              enrolledFreeCourses: [],
              purchasedCourses: [],
              paymentHistory: [],
              joinedAt: new Date().toISOString(),
            };
        await setDoc(docRef, initialData);
        // userData will be updated by the Firestore listener
      } else {
        // Document exists – update only non‑sensitive fields with merge
        const updatePayload = {
          displayName: loggedUser.displayName || 'Student',
          photoURL:
            loggedUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${loggedUser.uid}`,
          email: loggedUser.email,
          // Do NOT include purchasedCourses, paymentHistory, personalData
        };
        await setDoc(docRef, updatePayload, { merge: true });
        // userData will be updated by the listener
      }

      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // 6. Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, userData, signup, login, socialLogin, logout, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);