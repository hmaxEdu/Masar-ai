// src/components/EnterprisePage.tsx
import {
    ArrowUpRight,
    Building2,
    Check,
    Cpu,
    FileText,
    Headset,
    Lock,
    Server,
    ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { LandingHeader } from "./LandingHeader";
import { Button } from "./ui/button";

const WebGLBackground = lazy(() => import("./WebGLBackground"));

// ============================================================================
// ARCHITECTURAL VISUAL 1: VPC INFRASTRUCTURE BLUEPRINT
// ============================================================================
function VpcBlueprintVisual() {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted/20 border border-border/50 rounded-lg p-8 relative overflow-hidden flex flex-col items-center justify-center font-mono">
      {/* Blueprint Grid using CSS color-mix to scale dynamically with light/dark borders */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--border)_20%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_20%,transparent)_1px,transparent_1px)] bg-[size:20px_20px]" 
      />
      
      <div className="relative z-10 w-full max-w-lg border border-indigo-500/30 bg-indigo-500/5 p-6 backdrop-blur-sm rounded-lg">
        <div className="absolute top-0 left-0 -translate-y-full pb-2 text-[10px] text-indigo-400 tracking-widest uppercase">
          Single-Tenant VPC Boundary
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          <div className="flex-1 border border-border/50 bg-background/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Server className="w-4 h-4" /> Dedicated DB Instance
            </div>
            <div className="h-1 w-full bg-border" />
            <div className="h-1 w-2/3 bg-border mt-2" />
          </div>
          <div className="flex-1 border border-border/50 bg-background/50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <Cpu className="w-4 h-4" /> Compute Cluster
            </div>
            <div className="h-1 w-full bg-border" />
            <div className="h-1 w-3/4 bg-border mt-2" />
          </div>
        </div>

        <div className="w-full border border-emerald-500/30 bg-emerald-500/5 p-4 flex items-center justify-between rounded-lg">
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <Lock className="w-4 h-4" /> Custom LLM (BYOK)
          </div>
          <div className="text-[10px] text-emerald-500/50">ENCRYPTED AT REST</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ARCHITECTURAL VISUAL 2: IDENTITY & ACCESS GRAPH
// ============================================================================
function IdentityGraphVisual() {
  return (
    <div className="w-full h-full min-h-[400px] bg-muted/10 border-y md:border border-border/50 rounded-lg p-8 relative flex items-center justify-center">
      <div className="relative z-10 flex items-center w-full max-w-lg justify-between">
        
        {/* Okta / Azure AD Node */}
        <div className="w-32 h-32 border border-border bg-background rounded-lg flex flex-col items-center justify-center gap-3 shadow-2xl">
          <ShieldCheck className="w-6 h-6 text-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center px-2">Identity Provider</span>
        </div>

        {/* Connection Line */}
        <div className="flex-1 h-px bg-border relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-background border border-border px-3 py-1 text-[9px] uppercase tracking-widest text-foreground font-mono rounded-md">
            SAML 2.0
          </div>
        </div>

        {/* Masar Node (Dynamic primary color theme) */}
        <div className="w-32 h-32 border border-primary bg-primary rounded-lg flex flex-col items-center justify-center gap-3 shadow-2xl">
          <Building2 className="w-6 h-6 text-primary-foreground" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70 text-center px-2">Masar Workspace</span>
        </div>
        
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function EnterprisePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary selection:text-primary-foreground font-sans relative" dir="ltr">
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      <LandingHeader
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate("/login")}
      />

      <main className="pt-32 sm:pt-40 relative z-10">
        
        {/* --- STARK HERO SECTION --- */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-foreground mb-8">
              Scale without <br /> compromise.
            </h1>
            <p className="text-muted-foreground text-xl sm:text-2xl font-medium leading-relaxed max-w-2xl mb-12">
              Masar Enterprise provides the isolated infrastructure, rigorous compliance, and dedicated support required by the world's most demanding organizations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="h-14 px-8 text-sm font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90" onClick={() => window.location.href = "mailto:sales@masar.ai"}>
                Contact Sales
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-sm font-bold rounded-md border-border" onClick={() => navigate("/security")}>
                Read Security Whitepaper
              </Button>
            </div>
          </motion.div>
        </section>

        {/* --- METRICS BAR --- */}
        <div className="border-y border-border/40 bg-muted/5 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border/40">
              {[
                { label: "Uptime SLA", value: "99.99%" },
                { label: "Support Response", value: "15 min" },
                { label: "Compliance", value: "SOC 2 Type II" },
                { label: "Deployment", value: "VPC / On-Prem" },
              ].map((metric, i) => (
                <div key={i} className="py-8 px-4 sm:px-8 flex flex-col gap-2">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight">{metric.value}</span>
                  <span className="text-xs uppercase tracking-widest text-muted-foreground font-bold">{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- FEATURE SPLIT 1: INFRASTRUCTURE --- */}
        <section className="py-24 sm:py-32 border-b border-border/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Isolated Compute & Custom Models</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed font-normal">
                    Deploy Masar into a dedicated, single-tenant Virtual Private Cloud. Maintain total data sovereignty and ensure your proprietary workflows never share resources with public tenants.
                  </p>
                </div>
                <div className="space-y-3.5 pt-4 border-t border-border/40">
                  {[
                    "Bring Your Own Key (BYOK) for LLMs",
                    "Dedicated Postgres instances",
                    "Custom data retention policies",
                    "Geographic data region selection"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-foreground text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
              >
                <VpcBlueprintVisual />
              </motion.div>
            </div>
          </div>
        </section>

        {/* --- FEATURE SPLIT 2: IDENTITY --- */}
        <section className="py-24 sm:py-32 border-b border-border/40 bg-muted/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="order-2 lg:order-1"
              >
                <IdentityGraphVisual />
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="space-y-8 order-1 lg:order-2"
              >
                <div className="space-y-4">
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">Identity & Access Management</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed font-normal">
                    Enforce organizational security policies natively. Masar integrates directly with your existing Identity Provider (IdP) for frictionless, secure access.
                  </p>
                </div>
                <div className="space-y-3.5 pt-4 border-t border-border/40">
                  {[
                    "SAML 2.0 and OIDC Support",
                    "Okta, Azure AD, and Google Workspace",
                    "SCIM/Directory Sync for automated provisioning",
                    "Enforced Two-Factor Authentication (2FA)"
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <span className="text-foreground text-sm font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
              
            </div>
          </div>
        </section>

        {/* --- SERVICES GRID --- */}
        <section className="py-24 sm:py-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-12 text-center md:text-left">
              Dedicated Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              {/* Migration Engineering */}
              <div className="group flex flex-col justify-between rounded-lg border border-border/40 p-5 bg-card/15 backdrop-blur-md hover:bg-card/35 hover:border-primary/25 transition-all text-left">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                      <Server className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground/95">
                      Migration Engineering
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal">
                    Our solutions architects work directly with your IT team to script, map, and execute data migrations from legacy systems like Jira, Asana, or customized internal tooling with zero downtime.
                  </p>
                </div>
              </div>

              {/* Technical Account Manager */}
              <div className="group flex flex-col justify-between rounded-lg border border-border/40 p-5 bg-card/15 backdrop-blur-md hover:bg-card/35 hover:border-primary/25 transition-all text-left">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                      <Headset className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground/95">
                      Technical Account Manager
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal">
                    You are assigned a dedicated TAM who understands your specific architecture, custom deployment, and business goals to ensure continuous operational success.
                  </p>
                </div>
              </div>

              {/* Advanced Audit Logging */}
              <div className="group flex flex-col justify-between rounded-lg border border-border/40 p-5 bg-card/15 backdrop-blur-md hover:bg-card/35 hover:border-primary/25 transition-all text-left">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                      <FileText className="h-4.5 w-4.5" />
                    </div>
                    <h3 className="text-sm sm:text-base font-semibold tracking-tight text-foreground/95">
                      Advanced Audit Logging
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground/80 leading-relaxed font-normal">
                    Access immutable logs of every workspace action. Export streams directly to your internal SIEM (Splunk, Datadog) for real-time compliance monitoring.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* --- BOTTOM CTA --- */}
        <section className="py-24 sm:py-32 relative overflow-hidden border-t border-border">
          {/* Ambient Glowing Backdrops (Adapting dynamically via alpha opacity) */}
          <div className="absolute top-0 right-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-cyan-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 translate-y-1/2 w-96 h-96 bg-purple-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute top-0 right-1/3 -translate-y-1/2 w-196 h-196 bg-purple-500/10 dark:bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8 relative z-10">
            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter leading-[1.1] text-foreground">
              Ready to modernize <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-500">
                your operations?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              Discuss custom deployment options, pricing, and migration strategies with our architecture team.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                className="h-14 px-10 text-base font-bold rounded-md bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/10 hover:shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]" 
                onClick={() => window.location.href = "mailto:sales@masar.ai?subject=Enterprise Inquiry"}
              >
                Contact Sales <ArrowUpRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
}