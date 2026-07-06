// src/App.tsx
import LandingPage from "@/components/LandingPage";
import { migrateFromDexie } from "@/lib/migration";
import { supabase } from "@/lib/supabase";
import { type Session } from "@supabase/supabase-js";
import { Suspense, lazy, useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

// Lazily load heavier page chunks
const Login = lazy(() => import("@/components/Login"));
const MainContent = lazy(() => import("@/components/MainContent"));
const PricingPage = lazy(() => import("@/components/PricingPage"));
const FeaturesPage = lazy(() => import("@/components/FeaturesPage"));
const IntegrationsPage = lazy(() => import("@/components/IntegrationsPage"));
const SecurityPage = lazy(() => import("@/components/SecurityPage"));
const EnterprisePage = lazy(() => import("@/components/EnterprisePage"));
const MarketingTeamsPage = lazy(
  () => import("@/components/MarketingTeamsPage"),
);
const EngineeringPage = lazy(() => import("@/components/EngineeringPage"));

// Global Spinner for lazy-loaded code chunks
const PageLoader = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    return (
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/"
            element={<LandingPage onLoginClick={() => navigate("/login")} />}
          />
          <Route
            path="/login"
            element={<Login onBack={() => navigate("/")} />}
          />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/marketing-teams" element={<MarketingTeamsPage />} />
          <Route path="/engineering" element={<EngineeringPage />} />
          <Route path="/enterprise" element={<EnterprisePage />} />
          {/* Catch-all sends visitors back to landing page */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    );
  }

  // Map B: Authorized application path (Dynamic loading of main workspace)
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to="/projects/all" replace />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/enterprise" element={<EnterprisePage />} />
        <Route path="/integrations" element={<IntegrationsPage />} />
        <Route path="/marketing-teams" element={<MarketingTeamsPage />} />
        <Route path="/security" element={<SecurityPage />} />
        <Route path="/engineering" element={<EngineeringPage />} />
        <Route
          path="/projects/:projectId/*"
          element={<MainContent session={session} />}
        />
        {/* Catch-all redirects authenticated users straight to their dashboard */}
        <Route path="*" element={<Navigate to="/projects/all" replace />} />
      </Routes>
    </Suspense>
  );
}
