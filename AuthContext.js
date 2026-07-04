import React, { createContext, useContext, useEffect, useState } from "react";
import Constants from "expo-constants";
import { supabase } from "../lib/supabase";
import { configureGoogleSignIn, signInWithGoogleNative, signOutGoogle, isUserCancelledError } from "../lib/googleAuth";

const AuthContext = createContext(null);

// Plain Expo Go can't load the native Google Sign-In module — only a dev
// build / standalone build can. Constants.appOwnership === "expo" reliably
// means "running inside Expo Go" across SDKs.
export const isExpoGo = Constants.appOwnership === "expo";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (!isExpoGo) {
      try {
        configureGoogleSignIn();
      } catch {
        // Native module missing even outside Expo Go (e.g. web) — ignore,
        // the real Google button will just fail gracefully if tapped.
      }
    }

    // Restores any persisted session on cold start (session persistence).
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      const idToken = await signInWithGoogleNative();
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: idToken,
      });
      if (error) throw error;
      return data;
    } catch (err) {
      if (isUserCancelledError(err)) return null; // user closed the picker — not an error
      throw err;
    }
  };

  // Preview-only: skips Google + Supabase entirely so you can see every
  // screen in plain Expo Go while iterating on UI. Never used in a real
  // build — nothing calls this unless the person taps the preview button,
  // which only renders when isExpoGo is true.
  const signInPreview = () => {
    setIsPreview(true);
    setSession({
      user: {
        id: "preview-user",
        email: "preview@example.com",
        user_metadata: { full_name: "Preview User", avatar_url: null },
      },
    });
  };

  const signOut = async () => {
    if (isPreview) {
      setIsPreview(false);
      setSession(null);
      return;
    }
    await supabase.auth.signOut(); // clears the persisted Supabase session
    await signOutGoogle(); // clears Google's own cached account so the picker shows again next time
  };

  const user = session?.user ?? null;
  // Google's ID token claims land in user_metadata automatically — this is
  // where name / email / profile picture are saved, no extra table needed.
  const profile = user
    ? {
        id: user.id,
        name: user.user_metadata?.full_name || user.user_metadata?.name || "",
        email: user.email || user.user_metadata?.email || "",
        avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      }
    : null;

  return (
    <AuthContext.Provider value={{ session, user, profile, loading, signIn, signInPreview, signOut, isPreview }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
