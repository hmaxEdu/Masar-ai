// src/components/FeaturesPage.tsx
import { lazy, Suspense, useEffect, useState } from "react";
import { motion, AnimatePresence, type Variants } from "motion/react";
import { useNavigate } from "react-router-dom";
import { LandingHeader } from "./LandingHeader";
import { Footer } from "./Footer";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  Bot, 
  Network, 
  Zap, 
  Shield, 
  LayoutDashboard, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  TerminalSquare,
  Database,
  Globe
} from "lucide-react";

const WebGLBackground = lazy(() => import("./WebGLBackground"));

// --- Animation Variants ---
const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

// ============================================================================
// DYNAMIC VISUAL 1: CASCADING DEPENDENCY PIPELINE 
// ============================================================================
const NodeCard = ({ title, status, icon: Icon }: { title: string; status: string; icon: any }) => {
  const isError = status === "error";
  const isDoing = status === "doing";

  return (
    <motion.div 
      layout
      className={`relative w-full sm:w-36 p-3.5 rounded-lg border shadow-2xs flex flex-col gap-2.5 transition-colors duration-500 z-10 bg-card ${
        isError ? "border-destructive/60 shadow-destructive/10" : 
        isDoing ? "border-primary/40 shadow-primary/5" : "border-border/60 shadow-black/5"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center transition-colors duration-500 ${
          isError ? "bg-destructive/10 text-destructive" : 
          isDoing ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
        </div>
      </div>
      <div>
        <h4 className="text-xs font-bold text-foreground truncate">{title}</h4>
        <div className="flex items-center gap-1 mt-1.5">
          {isError ? (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 rounded-sm font-bold tracking-wider uppercase">Blocked</Badge>
          ) : isDoing ? (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 rounded-sm font-bold tracking-wider uppercase border-primary/45 text-primary">Doing</Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-sm font-bold tracking-wider uppercase text-muted-foreground/85">Pending</Badge>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const PipelinePath = ({ status }: { status: string }) => {
  const isError = status === "error";
  return (
    <div className="relative flex-1 h-8 sm:h-1.5 sm:w-12 mx-auto sm:mx-0 bg-muted rounded-full overflow-hidden">
      <motion.div 
        className={`absolute inset-0 ${isError ? 'bg-destructive' : 'bg-primary/30'}`}
        initial={{ x: "-100%" }}
        animate={{ x: isError ? "0%" : "100%" }}
        transition={{ duration: 1, ease: "linear", repeat: isError ? 0 : Infinity }}
      />
    </div>
  );
};

function DependencyPipelineVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 7);
    }, 1200);
    return () => clearInterval(timer);
  }, []);

  const n1Status = step >= 1 && step < 6 ? "error" : "doing";
  const p1Status = step >= 2 && step < 6 ? "error" : "normal";
  const n2Status = step >= 3 && step < 6 ? "error" : "todo";
  const p2Status = step >= 4 && step < 6 ? "error" : "normal";
  const n3Status = step >= 5 && step < 6 ? "error" : "todo";

  return (
    <div className="relative w-full h-full min-h-[300px] flex flex-col sm:flex-row items-center justify-center p-4 bg-muted/20 border border-border/40 rounded-lg overflow-hidden">
      <div className="flex flex-col sm:flex-row items-center w-full max-w-xl relative z-10 gap-2.5 sm:gap-0">
        <NodeCard title="DB Migrations" status={n1Status} icon={Database} />
        <PipelinePath status={p1Status} />
        <NodeCard title="Auth APIs" status={n2Status} icon={TerminalSquare} />
        <PipelinePath status={p2Status} />
        <NodeCard title="Client Auth" status={n3Status} icon={Globe} />
      </div>

      <AnimatePresence mode="wait">
        {step >= 1 && step < 6 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-destructive/10 border border-destructive/30 text-destructive text-[11px] font-bold px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-md"
          >
            <AlertCircle className="w-4 h-4" /> Pipeline chain halted
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 
// ============================================================================
// DYNAMIC VISUAL 2: AI AGENT GENERATING TASKS 
// ============================================================================
function AIGeneratorVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 6);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[320px] flex flex-col p-4 bg-muted/20 border border-border/40 rounded-lg overflow-hidden justify-center">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />

      {/* Mock Chat Window */}
      <div className="w-full max-w-sm mx-auto flex flex-col justify-end gap-4 relative z-10">
        
        {/* User Prompt */}
        <motion.div 
          initial={{ opacity: 0, x: 10, scale: 0.95 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="self-end bg-primary text-primary-foreground text-sm font-medium px-3 py-2 rounded-lg rounded-br-sm shadow-sm max-w-[85%]"
        >
          Break down auth module into tasks.
        </motion.div>

        {/* AI Response Stream */}
        <AnimatePresence>
          {step >= 1 && (
            <motion.div 
              initial={{ opacity: 0, x: -10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              className="self-start bg-card border border-border/50 text-foreground text-sm font-medium p-4 rounded-lg rounded-bl-sm shadow-2xs w-[90%] flex flex-col gap-3"
            >
              <div className="flex items-center gap-1.5 text-primary font-bold text-xs uppercase tracking-wider">
                <Bot className="w-4 h-4" /> Masar Agent
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {step === 1 ? (
                  <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing requirements...</span>
                ) : (
                  "Generated authentication roadmap tasks directly on your board:"
                )}
              </p>

              {/* Generated Task Cards popping in */}
              {step >= 2 && (
                <div className="flex flex-col gap-2 border-t border-border/30 pt-3">
                  {[
                    { title: "Implement JWT Strategy" },
                    { title: "Create Login UI Component" },
                    { title: "Setup OAuth Providers" },
                  ].map((task, i) => (
                    <AnimatePresence key={i}>
                      {step >= 3 + i && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, scale: 0.9 }}
                          animate={{ opacity: 1, height: "auto", scale: 1 }}
                          transition={{ type: "spring", bounce: 0.2 }}
                          className="bg-background border border-border/40 rounded p-2 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                            <span className="text-xs font-bold truncate">{task.title}</span>
                          </div>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded-sm shrink-0">To Do</Badge>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
export default function FeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/20 font-sans relative" dir="ltr">
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      <LandingHeader
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate("/login")}
      />

      <main className="pt-24 sm:pt-28 pb-16 relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* --- HERO SECTION --- */}
        <section className="text-center space-y-4 mb-14 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center"
          >
            <Badge variant="outline" className="px-3 py-1 mb-4 text-xs tracking-widest uppercase bg-primary/5 text-primary border-primary/20 backdrop-blur-md rounded-md">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Platform Capabilities
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Features engineered for <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-blue-500">
                high-velocity teams.
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Masar breaks the boundaries of traditional task management, combining 
              local-first desktop speeds with multi-agent AI execution.
            </p>
          </motion.div>
        </section>

        {/* --- HIGH DENSITY BENTO GRID --- */}
        <motion.section 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[110px] sm:auto-rows-[140px] mb-20 sm:mb-24"
        >
          {/* BENTO 1: AI Agent */}
          <motion.div variants={item} className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-primary/30 transition-colors flex flex-col justify-between">
            <div className="p-5 pb-0">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-foreground/95">Streaming AI Agents</h3>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed max-w-xs">
                Interact with context-aware AI that autonomously plans tasks, checks bottlenecks, and modifies database entities inline.
              </p>
            </div>

            <div className="relative flex-1 w-[90%] mx-auto mt-3 bg-background/90 border border-border/40 shadow-xl rounded-t-md flex flex-col overflow-hidden">
              <div className="h-8 border-b border-border/40 bg-muted/30 flex items-center px-3 gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <div className="h-2 w-16 bg-muted-foreground/20 rounded-xs" />
              </div>
              <div className="p-4 space-y-3">
                 <div className="flex gap-2">
                   <div className="w-6 h-6 rounded bg-muted shrink-0" />
                   <div className="space-y-1.5 flex-1 pt-1">
                     <div className="h-2 w-2/3 bg-muted rounded-xs" />
                     <div className="h-2 w-1/3 bg-muted rounded-xs" />
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <div className="w-6 h-6 rounded bg-primary/15 text-primary flex items-center justify-center shrink-0">
                     <Bot className="w-3.5 h-3.5" />
                   </div>
                   <div className="space-y-1.5 flex-1 bg-muted/20 border border-border/40 p-3 rounded">
                     <div className="h-2 w-full bg-primary/30 rounded-xs" />
                     <div className="h-2 w-5/6 bg-primary/15 rounded-xs" />
                   </div>
                 </div>
              </div>
            </div>
          </motion.div>

          {/* BENTO 2: Kanban / Multi-View */}
          <motion.div variants={item} className="md:col-span-2 md:row-span-1 group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-blue-500/30 transition-colors flex flex-col sm:flex-row">
            <div className="w-full sm:w-1/2 p-5 flex flex-col justify-center">
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/20 shrink-0">
                  <LayoutDashboard className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold tracking-tight text-foreground/95">Multi-View Workspace</h3>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-normal">
                Toggle seamlessly between boards, nested tree-lists, and analytics without losing filter states.
              </p>
            </div>

            <div className="relative w-full sm:w-1/2 h-28 sm:h-full flex items-center justify-center overflow-hidden">
              <div className="absolute right-2 sm:right-3 flex gap-2 rotate-[6deg] group-hover:rotate-0 transition-transform duration-300 opacity-90">
                <div className="w-18 h-24 bg-muted/60 rounded-md border border-border/40 p-1.5 shadow space-y-1">
                  <div className="w-full h-1 bg-background rounded-xs" />
                  <div className="w-2/3 h-1 bg-background rounded-xs" />
                </div>
                <div className="w-18 h-28 bg-card rounded-md border border-blue-500/20 p-1.5 shadow-lg space-y-1 -translate-y-2">
                   <div className="w-full h-1 bg-blue-500/10 rounded-xs" />
                   <div className="w-3/4 h-1 bg-blue-500/10 rounded-xs" />
                   <div className="w-full h-8 bg-background border border-border/30 rounded mt-3" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* BENTO 3: Zero Latency */}
          <motion.div variants={item} className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 p-5 backdrop-blur-md hover:border-emerald-500/30 transition-colors flex flex-col justify-end">
            <div className="absolute top-5 right-5 h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-bold tracking-tight mb-1">Zero Latency</h3>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              Pre-rendered optimistic updates keep your interface synchronized instantly.
            </p>
          </motion.div>

          {/* BENTO 4: Security */}
          <motion.div variants={item} className="md:col-span-1 md:row-span-1 group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 p-5 backdrop-blur-md hover:border-orange-500/30 transition-colors flex flex-col justify-end">
            <div className="absolute top-5 right-5 h-8 w-8 rounded-md bg-orange-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-orange-500" />
            </div>
            <h3 className="text-sm font-bold tracking-tight mb-1">Row Level Security</h3>
            <p className="text-[11px] text-muted-foreground/80 leading-normal">
              Database layer isolation ensures workspace privacy.
            </p>
          </motion.div>
        </motion.section>

        {/* --- DEEP DIVE SECTION 1: CASCADING DEPENDENCY PIPELINE --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-14 items-center mb-20 sm:mb-24">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="space-y-4 order-2 lg:order-1"
          >
            <div className="inline-flex items-center justify-center p-2.5 bg-primary/10 rounded-md text-primary mb-1 border border-primary/20">
              <Network className="h-5 w-5" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Symmetric Dependency Protection
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/85 leading-relaxed font-normal">
              Stop guessing what is stalling deliveries. Masar enforces graph traversal limits to prevent cyclic dependency errors and automatically propagates blocker statuses.
            </p>
            <ul className="space-y-2 pt-1.5">
              {['Auto-flag downstream tasks', 'Block editing until prerequisites clear', 'Traverse pipelines dynamically'].map((feat, i) => (
                <li key={i} className="flex items-center gap-2 font-medium text-foreground/80 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {feat}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="order-1 lg:order-2"
          >
            <DependencyPipelineVisual />
          </motion.div>
        </section>

        {/* --- DEEP DIVE SECTION 2: CONTEXT-AWARE EXECUTION --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-14 items-center mb-20 sm:mb-24">
           <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
          >
             <AIGeneratorVisual />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Actionable AI Workspaces
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground/85 leading-relaxed font-normal">
              Masar's AI agent does not just chat; it executes. Streamed NDJSON parsers enable the model to make structured board updates—changing priorities, assigning members, and breaking down subtasks mid-generation.
            </p>
            <Button variant="outline" className="mt-2 text-sm font-semibold h-10 rounded-md" onClick={() => navigate("/pricing")}>
              View Technical Specs <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </section>

        {/* --- CTA SECTION --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-lg border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background p-8 sm:p-12 text-center relative overflow-hidden shadow-2xs"
        >
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Ready to upgrade your workflow?
            </h2>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
              Join engineers and product managers building the future with Masar. Setup takes less than 30 seconds.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" className="h-10 px-5 text-sm font-semibold w-full sm:w-auto rounded-md shadow-sm" onClick={() => navigate("/login")}>
                Start building for free
              </Button>
              <Button size="sm" variant="secondary" className="h-10 px-5 text-sm font-semibold w-full sm:w-auto rounded-md" onClick={() => navigate("/pricing")}>
                Compare plans
              </Button>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}