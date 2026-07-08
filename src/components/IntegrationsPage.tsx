// src/components/IntegrationsPage.tsx
import {
    Chrome,
    Database,
    Figma,
    Github,
    Plus,
    Slack,
    Terminal,
    Trello,
    Webhook,
    Zap
} from "lucide-react";
import { motion, type Variants } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { LandingHeader } from "./LandingHeader";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

const WebGLBackground = lazy(() => import("./WebGLBackground"));

const container: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

// ============================================================================
// DYNAMIC VISUAL 1: GIT -> MASAR -> SLACK PIPELINE
// ============================================================================
function GitToSlackVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setStep((s) => (s + 1) % 5), 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex flex-col p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden mt-3">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="flex-1 relative z-10 w-full flex flex-col justify-center items-center gap-4">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: step >= 1 ? 1 : 0.4, y: step >= 1 ? 0 : 5, scale: step >= 1 ? 1 : 0.98 }}
          className="w-[90%] max-w-[280px] bg-[#0d1117] rounded-md border border-border/30 shadow-sm overflow-hidden flex flex-col self-start"
        >
          <div className="h-6 bg-[#161b22] border-b border-border/30 flex items-center px-3 gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive/60" />
            <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
            <div className="w-2 h-2 rounded-full bg-green-500/60" />
          </div>
          <div className="p-3 font-mono text-[11px] text-muted-foreground/80 leading-normal">
            <span className="text-blue-400">~/masar</span>$ git commit -m "Fix redirect (fixes #412)"
            {step >= 1 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-emerald-400 mt-1">
                [main 8a9b2c3] Fix redirect (fixes #412)
              </motion.div>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: step >= 2 ? 1 : 0, scale: step >= 2 ? 1 : 0.95, y: step >= 2 ? 0 : 5 }}
          className={`w-[90%] max-w-[280px] bg-card rounded-md border shadow-sm p-3.5 flex flex-col gap-2 transition-colors duration-500 ${step >= 2 ? 'border-primary/40 shadow-primary/5' : 'border-border/60'}`}
        >
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 rounded-sm">TASK-412</Badge>
            <div className={`text-[10px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1 ${step >= 3 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-primary/10 text-primary'}`}>
              {step >= 3 ? "Done" : "In Progress"}
            </div>
          </div>
          <p className="text-xs font-bold text-foreground">Fix OAuth redirect loop</p>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden mt-1">
            <motion.div 
              initial={{ width: "40%" }}
              animate={{ width: step >= 3 ? "100%" : "40%" }}
              className={`h-full ${step >= 3 ? 'bg-emerald-500' : 'bg-primary'}`}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: step >= 4 ? 1 : 0, x: step >= 4 ? 0 : 10 }}
          className="absolute right-1 top-2 w-[220px] bg-card rounded-md border border-border/50 shadow-md p-3 flex gap-3 z-20"
        >
          <div className="w-8 h-8 rounded bg-[#4A154B] flex items-center justify-center shrink-0">
            <Slack className="w-4 h-4 text-white" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-xs font-bold text-foreground">Masar Bot</span>
            <p className="text-[10px] text-muted-foreground leading-normal truncate">
              Task <span className="text-primary font-bold">#412</span> marked as done.
            </p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ============================================================================
// DYNAMIC VISUAL 2: SUPABASE REAL-TIME DB SYNC
// ============================================================================
function SupabaseSyncVisual() {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setSynced((prev) => !prev), 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex items-center justify-center p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden mt-3">
      <div className="flex w-full items-center justify-center gap-4 relative z-10">
        
        <div className="w-40 sm:w-52 bg-[#1c1c1c] border border-border/40 rounded-md p-3 shadow-sm font-mono text-[10px] sm:text-[11px] text-muted-foreground flex flex-col gap-1">
          <div className="flex items-center gap-1.5 mb-1.5 text-emerald-400 font-bold border-b border-white/5 pb-2">
            <Database className="w-3.5 h-3.5" /> postgres_changes
          </div>
          <span className="text-blue-400">{"{"}</span>
          <span className="ml-2">"table": <span className="text-green-300">"tasks"</span>,</span>
          <span className="ml-2">"type": <span className="text-green-300">"UPDATE"</span>,</span>
          <span className="ml-2">"record": {"{"}</span>
          <span className="ml-4">"id": <span className="text-orange-300">89</span>,</span>
          <span className="ml-4">"status": <motion.span animate={{ color: synced ? "#4ade80" : "#fbbf24" }} className="font-bold">"{synced ? 'done' : 'doing'}"</motion.span></span>
          <span className="ml-2">{"}"}</span>
          <span className="text-blue-400">{"}"}</span>
        </div>

        <div className="relative h-px w-10 sm:w-16 bg-border/60">
          <motion.div 
            initial={{ left: "0%" }}
            animate={{ left: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500/25 rounded-full blur-[4px]"
          />
          <motion.div 
            initial={{ left: "0%" }}
            animate={{ left: ["0%", "100%", "0%"] }}
            transition={{ duration: 2, ease: "linear", repeat: Infinity }}
            className="absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-emerald-400 rounded-full"
          />
        </div>

        <motion.div 
          animate={{ scale: synced ? 1.03 : 1, borderColor: synced ? "var(--color-emerald-500)" : "var(--color-border)" }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-24 sm:w-28 bg-card border border-border/40 shadow-sm rounded-md p-3 flex flex-col items-center justify-center gap-2 text-center"
        >
          <div className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">Tasks Done</div>
          <motion.div 
            key={synced ? "sync" : "unsync"}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-black ${synced ? 'text-emerald-500' : 'text-foreground'}`}
          >
            {synced ? "89" : "88"}
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
const integrationsList = [
  { name: "Figma", category: "Design", description: "Embed live Figma designs directly into task descriptions.", icon: Figma },
  { name: "Trello", category: "Migration", description: "One-click import of your existing Trello boards and cards.", icon: Trello },
  { name: "Webhooks", category: "Automation", description: "Connect custom internal tools using outbound webhooks.", icon: Webhook },
  { name: "Chrome Extension", category: "Productivity", description: "Create tasks directly from your browser toolbar.", icon: Chrome },
  { name: "CLI Tool", category: "Development", description: "Manage your projects directly from your terminal interface.", icon: Terminal },
];

export default function IntegrationsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/20 font-sans relative" dir="ltr">
      <Suspense fallback={null}><WebGLBackground /></Suspense>
      <LandingHeader onLoginClick={() => navigate("/login")} onSignUpClick={() => navigate("/login")} />

      <main className="pt-24 sm:pt-28 pb-16 relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        <section className="text-center space-y-4 mb-14 sm:mb-20">
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="flex flex-col items-center">
            <Badge variant="outline" className="px-3 py-1 mb-4 text-xs tracking-widest uppercase bg-primary/5 text-primary border-primary/20 backdrop-blur-md rounded-md">
              <Zap className="w-3.5 h-3.5 mr-1.5" /> Unified Ecosystem
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Connect Masar with your <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary to-cyan-400">favorite tools.</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Integrate your entire stack. Push updates to Slack, link PRs from GitHub, and embed designs from Figma seamlessly.
            </p>
          </motion.div>
        </section>

        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="grid grid-cols-1 md:grid-cols-4 gap-4 sm:gap-5 mb-14 sm:mb-20">
          <motion.div variants={item} className="md:col-span-2 group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-primary/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="flex -space-x-1.5 shrink-0">
                  <div className="h-8 w-8 rounded-lg bg-foreground flex items-center justify-center text-background shadow-sm border border-background">
                    <Github className="h-4 w-4" />
                  </div>
                  <div className="h-8 w-8 rounded-lg bg-[#4A154B] flex items-center justify-center text-white shadow-sm border border-background">
                    <Slack className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Automated Workflows</h3>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
                Trigger Masar task completions directly from GitHub pull requests, and broadcast project updates to your Slack channels instantly.
              </p>
            </div>
            <GitToSlackVisual />
          </motion.div>

          <motion.div variants={item} className="md:col-span-2 group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-inner border border-emerald-500/20 shrink-0">
                  <Database className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Native Supabase Sync</h3>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-sm">
                Built on Postgres Realtime. Every change made in your workspace is synchronized globally in milliseconds via Supabase WebSockets.
              </p>
            </div>
            <SupabaseSyncVisual />
          </motion.div>
        </motion.section>

        <section className="mb-20 sm:mb-24">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">More Integrations</h2>
            <div className="h-px bg-border/40 flex-1 mt-0.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {integrationsList.map((integration, idx) => (
              <motion.div key={idx} initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: idx * 0.05 }} className="group flex flex-col justify-between rounded-lg border border-border/40 p-5 bg-card/45 backdrop-blur-md hover:bg-card hover:border-primary/25 transition-all cursor-pointer">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-105">
                      <integration.icon className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground bg-muted px-2 py-0.5 rounded-sm">
                      {integration.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-foreground mb-1.5">{integration.name}</h3>
                  <p className="text-xs text-muted-foreground leading-normal">{integration.description}</p>
                </div>
              </motion.div>
            ))}

            {/* FIX: Wired up dead button with functioning mailto trigger */}
            <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: integrationsList.length * 0.05 }} className="flex flex-col justify-center items-center text-center rounded-lg border border-dashed border-border p-5 bg-muted/5 hover:bg-muted/15 transition-all cursor-pointer min-h-[160px]">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground mb-3">
                <Plus className="h-4 w-4" />
              </div>
              <h3 className="text-xs font-bold text-foreground mb-1">Missing a tool?</h3>
              <p className="text-[11px] text-muted-foreground/80 mb-4">Let us know what we should build next.</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs font-semibold px-3 rounded-md"
                onClick={() => window.location.href = "mailto:support@masar.ai?subject=Integration Request"}
              >
                Request Integration
              </Button>
            </motion.div>
          </div>
        </section>

        <motion.section initial={{ opacity: 0, scale: 0.98, y: 10 }} whileInView={{ opacity: 1, scale: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8 sm:p-12 text-center relative overflow-hidden shadow-2xs">
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Ready to integrate your stack?</h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">Create a workspace, link your tools, and let Masar's AI orchestration handle the heavy lifting.</p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" className="h-10 px-5 text-sm font-semibold w-full sm:w-auto rounded-md shadow-sm" onClick={() => navigate("/login")}>
                Start building for free
              </Button>
            </div>
          </div>
        </motion.section>
      </main>
      <Footer />
    </div>
  );
}