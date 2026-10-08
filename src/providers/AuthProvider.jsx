"use client";

import { createContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/hooks/useLanguage";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const { t } = useLanguage();
  // Auth listener is subscribed once; read the latest translator through a ref.
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null); // { message, type }
  const toastTimerRef = useRef(null);
  const initialChecked = useRef(false);
  const prevUser = useRef(null);

  const showToast = (message, type = "success") => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const initialUser = session?.user ?? null;
      setUser(initialUser);
      prevUser.current = initialUser;
      setLoading(false);
      initialChecked.current = true;
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      setLoading(false);

      if (event === "SIGNED_IN") {
        const isLoggingIn = localStorage.getItem("supabase_login_intent") === "true";
        if (isLoggingIn && currentUser) {
          showToast(tRef.current("Welcome back, {name}!", { name: currentUser.user_metadata?.full_name || currentUser.email }), "success");
          localStorage.removeItem("supabase_login_intent");
        }
      } else if (event === "SIGNED_OUT") {
        // Only trigger toast if there was a previous user logged in on this page session
        if (prevUser.current) {
          showToast(tRef.current("You have successfully logged out."), "info");
        }
      }

      prevUser.current = currentUser;
      initialChecked.current = true;
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    localStorage.setItem("supabase_login_intent", "true");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) {
      console.error("Error signing in with Google:", error.message);
      localStorage.removeItem("supabase_login_intent");
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error("Error signing out:", error.message);
  };

  // Determine if user is admin:
  // 1. Hardcoded check for the portfolio owner's email 'satriaeza221@gmail.com'
  // 2. Custom metadata check (e.g. role: 'admin')
  const isAdmin = user ? (user.email === "satriaeza221@gmail.com" || user.user_metadata?.role === "admin") : false;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, signInWithGoogle, signOut, showToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className="fixed top-6 right-6 z-[9999] flex items-center gap-3 bg-neutral-900/90 border border-neutral-800 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] max-w-sm"
          >
            {toast.type === "success" ? (
              <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <svg className="size-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : (
              <div className="size-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <svg className="size-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                {toast.type === "success" ? t("Success") : t("Notification")}
              </span>
              <p className="text-sm font-medium text-neutral-200 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="text-neutral-500 hover:text-neutral-300 ml-2 cursor-pointer shrink-0"
            >
              <svg className="size-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
};
