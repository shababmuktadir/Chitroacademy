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
  sendEmailVerification 
} from "firebase/auth";
import { doc, setDoc, getDoc, onSnapshot } from "firebase/firestore";

const AuthContext = createContext();

// 🔥 আপনার নির্ধারিত অ্যাডমিন ইমেইল
const ADMIN_EMAIL = "shababmuktadir@gmail.com";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ১. রিয়েল-টাইম সেশন ও ডেটাবেস ট্র্যাকার
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // যদি অ্যাডমিন হয়
        if (currentUser.email === ADMIN_EMAIL) {
          const adminRef = doc(db, "admin", currentUser.uid);
          const unsubscribeAdmin = onSnapshot(adminRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData({ id: docSnap.id, ...docSnap.data() });
            } else {
              // ডেটাবেসে না থাকলে অটো বানিয়ে নেবে
              const adminInitialData = {
                uid: currentUser.uid,
                email: ADMIN_EMAIL,
                role: 'admin',
                displayName: currentUser.displayName || 'Admin Shabab',
                permissions: ['all'],
                updatedAt: new Date().toISOString()
              };
              setDoc(adminRef, adminInitialData);
              setUserData(adminInitialData);
            }
            setLoading(false);
          });
          return () => unsubscribeAdmin();
        } 
        // যদি সাধারণ স্টুডেন্ট হয়
        else {
          const studentRef = doc(db, "students", currentUser.uid);
          const unsubscribeStudent = onSnapshot(studentRef, (docSnap) => {
            if (docSnap.exists()) {
              setUserData({ id: docSnap.id, ...docSnap.data() });
            } else {
              setUserData(null);
            }
            setLoading(false);
          });
          return () => unsubscribeStudent();
        }
      } else {
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // ২. ইমেইল ও পাসওয়ার্ড দিয়ে সাইনআপ (ইমেইল ভেরিফিকেশনসহ)
  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      await updateProfile(newUser, { displayName: name });

      // ইমেইল ভেরিফিকেশন লিংক পাঠানো (অ্যাডমিন ছাড়া সাধারণ ইউজারদের জন্য)
      if (email !== ADMIN_EMAIL) {
        try {
          await sendEmailVerification(newUser);
        } catch (err) {
          console.warn("Verification email send failed:", err);
        }
      }

      const isAdmin = email === ADMIN_EMAIL;
      const targetCollection = isAdmin ? "admin" : "students";

      // ফায়ারস্টোর ডেটাবেসের জন্য সাজানো স্কিমা
      const newDocData = isAdmin ? {
        uid: newUser.uid,
        email: email,
        role: 'admin',
        displayName: name,
        createdAt: new Date().toISOString()
      } : {
        uid: newUser.uid,
        displayName: name,
        email: email,
        role: 'student',
        emailVerified: false,
        personalData: {
          phone: '',
          bio: '',
          institution: '',
          address: ''
        },
        enrolledFreeCourses: [],
        purchasedCourses: [],
        paymentHistory: [],
        joinedAt: new Date().toISOString()
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

  // ৩. ইমেইল লগইন (ভেরিফিকেশন চেকসহ)
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const loggedUser = result.user;

      // স্টুডেন্টদের ক্ষেত্রে ইমেইল ভেরিফাই না করা থাকলে লগইন ব্লক করা
      if (email !== ADMIN_EMAIL && !loggedUser.emailVerified) {
        await signOut(auth);
        setLoading(false);
        const unverifiedError = new Error("আপনার ইমেইলটি এখনো ভেরিফাই করা হয়নি! দয়া করে আপনার ইনবক্স চেক করে ভেরিফিকেশন লিংকে ক্লিক করুন।");
        unverifiedError.code = "auth/unverified-email";
        throw unverifiedError;
      }

      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // ৪. সোশ্যাল লগইন (Google / Apple)
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
      const targetCollection = isAdmin ? "admin" : "students";

      const docRef = doc(db, targetCollection, loggedUser.uid);
      const docSnap = await getDoc(docRef);

      // যদি ডেটাবেসে আগে থেকে না থাকে, নতুন করে স্কিমা তৈরি করবে
      if (!docSnap.exists()) {
        const initialData = isAdmin ? {
          uid: loggedUser.uid,
          email: ADMIN_EMAIL,
          role: 'admin',
          displayName: loggedUser.displayName || 'Admin Shabab',
          createdAt: new Date().toISOString()
        } : {
          uid: loggedUser.uid,
          displayName: loggedUser.displayName || 'Student',
          email: loggedUser.email,
          photoURL: loggedUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${loggedUser.uid}`,
          role: 'student',
          emailVerified: true,
          personalData: { phone: '', bio: '', institution: '', address: '' },
          enrolledFreeCourses: [],
          purchasedCourses: [],
          paymentHistory: [],
          joinedAt: new Date().toISOString()
        };

        await setDoc(docRef, initialData);
        setUserData(initialData);
      }

      setLoading(false);
      return loggedUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // ৫. লগআউট
  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
  };

  return (
    <AuthContext.Provider value={{ user, userData, signup, login, socialLogin, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);