// src/App.tsx
import LandingPage from "@/components/LandingPage";
import { migrateFromDexie } from "@/lib/migration";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazily load heavier page chunks
const Login = lazy(() => import("@/components/Login"));
const MainContent = lazy(() => import("@/components/MainContent"));
const PricingPage = lazy(() => import("@/components/PricingPage"));

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) migrateFromDexie();
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) migrateFromDexie();
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null;

  // Map A: Guests / Public Visitor path (Lightweight)
  if (!session) {
    if (showLogin) return <Login onBack={() => setShowLogin(false)} />;
    
    return (
      <Routes>
        <Route path="/" element={<LandingPage onLoginClick={() => setShowLogin(true)} />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Map B: Authorized application path (Dynamic loading of main workspace)
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects/all" replace />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route
        path="/projects/:projectId/*"
        element={
          <Suspense
            fallback={
              <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <MainContent session={session} />
          </Suspense>
        }
      />
      <Route path="*" element={<Navigate to="/projects/all" replace />} />
    </Routes>
  );
}