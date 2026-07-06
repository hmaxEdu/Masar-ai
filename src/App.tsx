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
const FeaturesPage = lazy(() => import("@/components/FeaturesPage"));
const IntegrationsPage = lazy(() => import("@/components/IntegrationsPage"));
const SecurityPage = lazy(() => import("@/components/SecurityPage"));
const EnterprisePage = lazy(() => import("@/components/EnterprisePage"));
const MarketingTeamsPage = lazy(() => import("@/components/MarketingTeamsPage"));
const EngineeringPage = lazy(() => import("@/components/EngineeringPage"));

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
    if (showLogin)
      return (
        <Suspense fallback={null}>
          <Login onBack={() => setShowLogin(false)} />
        </Suspense>
      );

    return (
      <Routes>
        <Route
          path="/"
          element={<LandingPage onLoginClick={() => setShowLogin(true)} />}
        />
        <Route
          path="/pricing"
          element={
            <Suspense fallback={null}>
              <PricingPage />
            </Suspense>
          }
        />
        <Route
          path="/features"
          element={
            <Suspense fallback={null}>
              <FeaturesPage />
            </Suspense>
          }
        />
        <Route
          path="/integrations"
          element={
            <Suspense fallback={null}>
              <IntegrationsPage />
            </Suspense>
          }
        />
        <Route
          path="/security"
          element={
            <Suspense fallback={null}>
              <SecurityPage />
            </Suspense>
          }
        />
        <Route
          path="/marketing-teams"
          element={
            <Suspense fallback={null}>
              <MarketingTeamsPage />
            </Suspense>
          }
        />
        <Route
          path="/engineering"
          element={
            <Suspense fallback={null}>
              <EngineeringPage />
            </Suspense>
          }
        />
        <Route
          path="/enterprise"
          element={
            <Suspense fallback={null}>
              <EnterprisePage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // Map B: Authorized application path (Dynamic loading of main workspace)
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/projects/all" replace />} />
      <Route
        path="/pricing"
        element={
          <Suspense fallback={null}>
            <PricingPage />
          </Suspense>
        }
      />
      <Route
        path="/features"
        element={
          <Suspense fallback={null}>
            <FeaturesPage />
          </Suspense>
        }
      />
      <Route
        path="/enterprise"
        element={
          <Suspense fallback={null}>
            <EnterprisePage />
          </Suspense>
        }
      />
      <Route
        path="/integrations"
        element={
          <Suspense fallback={null}>
            <IntegrationsPage />
          </Suspense>
        }
      />
      <Route
        path="/marketing-teams"
        element={
          <Suspense fallback={null}>
            <MarketingTeamsPage />
          </Suspense>
        }
      />

      <Route
        path="/security"
        element={
          <Suspense fallback={null}>
            <SecurityPage />
          </Suspense>
        }
      />
      <Route
          path="/engineering"
          element={
            <Suspense fallback={null}>
              <EngineeringPage />
            </Suspense>
          }
        />
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
