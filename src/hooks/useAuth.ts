import { useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '@/lib/firebase';
import { User } from '@/types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async firebaseUser => {
      setFirebaseUser(firebaseUser);

      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));

        if (userDoc.exists()) {
          setUser({ id: firebaseUser.uid, ...userDoc.data() } as User);
        } else {
          // Create new user document
          const newUser: Omit<User, 'id'> = {
            email: firebaseUser.email!,
            name: firebaseUser.displayName || 'Usuário',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'parent', // Default to parent
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser({ id: firebaseUser.uid, ...newUser });
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates, updatedAt: new Date() };
      await setDoc(doc(db, 'users', user.id), updatedUser, { merge: true });
      setUser(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    signInWithGoogle,
    logout,
    updateUser,
  };
}
