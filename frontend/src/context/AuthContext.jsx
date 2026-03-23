import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from 'firebase/auth';
import { supabase } from '../config/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const googleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return result.user;
  };

  const logout = () => {
    return signOut(auth);
  };

  const toggleWishlist = async (productId) => {
    if (!currentUser || !dbUser) {
      alert("Please login to manage your wishlist.");
      return;
    }
    try {
      const currentWishlist = dbUser.wishlist || [];
      const isAdded = currentWishlist.includes(productId);

      const newWishlist = isAdded
        ? currentWishlist.filter(id => id !== productId)
        : [...currentWishlist, productId];

      // Optimistic UI update
      setDbUser(prev => ({ ...prev, wishlist: newWishlist }));

      // Sync with Supabase
      const { error } = await supabase
        .from('users')
        .update({ wishlist: newWishlist })
        .eq('id', dbUser.id);

      if (error) {
        console.error('Error updating wishlist:', error);
        // Revert on failure
        setDbUser(prev => ({ ...prev, wishlist: currentWishlist }));
      }
    } catch (error) {
      console.error("Error toggling wishlist", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          // Upsert user in Supabase (sync Firebase user with Supabase DB)
          const { data: existingUser, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('email', user.email)
            .single();

          if (existingUser) {
            // Update firebase_uid if changed
            if (existingUser.firebase_uid !== user.uid) {
              await supabase
                .from('users')
                .update({ firebase_uid: user.uid })
                .eq('id', existingUser.id);
            }

            // Auto-promote admin
            if (user.email === 'malviyadixit92@gmail.com' && existingUser.role !== 'admin') {
              await supabase
                .from('users')
                .update({ role: 'admin' })
                .eq('id', existingUser.id);
              existingUser.role = 'admin';
            }

            console.log('[AUTH_SYNC] User synced from Supabase:', existingUser);
            setDbUser(existingUser);
          } else {
            // Create new user
            const newUser = {
              firebase_uid: user.uid,
              email: user.email,
              name: user.displayName || user.email.split('@')[0],
              role: user.email === 'malviyadixit92@gmail.com' ? 'admin' : 'user',
            };

            const { data: createdUser, error: insertError } = await supabase
              .from('users')
              .insert(newUser)
              .select()
              .single();

            if (insertError) {
              console.error('Error creating user in Supabase:', insertError);
            } else {
              console.log('[AUTH_SYNC] New user created in Supabase:', createdUser);
              setDbUser(createdUser);
            }
          }
        } catch (error) {
          console.error("Error syncing user with Supabase", error);
        }
      } else {
        setDbUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    dbUser,
    setDbUser,
    googleSignIn,
    logout,
    toggleWishlist,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
