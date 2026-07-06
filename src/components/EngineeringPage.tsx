// src/components/EngineeringPage.tsx
import {
    Activity,
    ArrowRight,
    CheckCircle2,
    Code,
    GanttChartSquare,
    GitBranch,
    Laptop,
    Terminal,
    Workflow
} from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { LandingHeader } from "./LandingHeader";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

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
// DYNAMIC VISUAL 1: CI/CD GIT AUTOMATION (High-Density)
// ============================================================================
function GitWorkflowVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    // 0: Init, 1: Lint, 2: E2E, 3: Security, 4: Merged
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 5);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex flex-col p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden justify-center items-center">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="w-full max-w-xs relative z-10 flex flex-col gap-3">
        {/* Branch Header */}
        <div className="flex items-center justify-between bg-card border border-border/40 rounded-lg p-2.5 shadow-sm">
          <div className="flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-primary" />
            <span className="font-mono text-[10px] font-bold text-foreground">feature/db-auth</span>
          </div>
          <Badge variant="outline" className={`text-[8px] px-1.5 py-0 rounded-xs uppercase tracking-wider font-bold transition-all ${
            step >= 4 ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-primary/10 text-primary border-primary/20'
          }`}>
            {step >= 4 ? "merged" : "active"}
          </Badge>
        </div>

        {/* CI/CD Test Pipeline */}
        <div className="bg-card border border-border/40 rounded-lg p-3 shadow-md flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 pb-1.5 border-b border-border/30 text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80">
            <Terminal className="w-3 h-3" /> Automated Checks
          </div>

          {[
            { label: "Linting & Code Quality", runStep: 1 },
            { label: "E2E Integration Tests", runStep: 2 },
            { label: "Vulnerability Scan", runStep: 3 },
          ].map((check, i) => {
            const isRun = step >= check.runStep;
            return (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-foreground/90 font-medium text-[11px]">{check.label}</span>
                {isRun ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-primary/25 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Succeeded Banner */}
      <AnimatePresence>
        {step >= 4 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> PR #108 successfully deployed to main
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// DYNAMIC VISUAL 2: BURNDOWN & SPRINT VELOCITY (High-Density)
// ============================================================================
function SprintBurndownVisual() {
  const [percent, setPercent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPercent((p) => (p >= 100 ? 0 : p + 25));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex flex-col p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden justify-center items-center">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="w-full max-w-xs bg-card border border-border/40 rounded-lg p-3 shadow-md relative z-10 flex flex-col gap-3">
        <div className="flex justify-between items-center border-b border-border/30 pb-2">
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold tracking-wider text-muted-foreground/80">Sprint 24</span>
            <span className="text-xs font-bold text-foreground">Velocity Tracker</span>
          </div>
          <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">84 pts</Badge>
        </div>

        {/* Dynamic Burndown Chart */}
        <div className="h-20 w-full relative flex items-end">
          <svg className="w-full h-full absolute inset-0" viewBox="0 0 100 50" preserveAspectRatio="none">
            <line x1="0" y1="5" x2="100" y2="45" stroke="var(--color-border)" strokeWidth="1" strokeDasharray="2 2" />
            <motion.path 
              d="M 0 5 L 25 15 L 50 18 L 75 32 L 100 45" 
              stroke="var(--color-primary)" 
              strokeWidth="2" 
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.8, ease: "easeInOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex justify-between px-1 pointer-events-none text-[8px] font-mono text-muted-foreground/40 pt-1">
            <span>D1</span>
            <span>D4</span>
            <span>D7</span>
            <span>D10</span>
          </div>
        </div>

        {/* Point Tracker Bottom */}
        <div className="grid grid-cols-2 divide-x divide-border/30 border-t border-border/30 pt-2">
          <div className="flex flex-col px-1">
            <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Remaining</span>
            <span className="text-sm font-extrabold text-foreground">{100 - percent}%</span>
          </div>
          <div className="flex flex-col px-1 pl-3">
            <span className="text-[8px] uppercase font-bold text-muted-foreground/80">Velocity</span>
            <span className="text-sm font-extrabold text-emerald-500">On Track</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
const pillars = [
  { title: "Burndown Graphs", description: "Monitor sprint progress with real-time story point calculations and ideal guides.", icon: Activity },
  { title: "Developer Backlogs", description: "Prioritize features, groom technical debt, and assign story points effortlessly.", icon: Laptop },
  { title: "Interactive CI/CD", description: "Automate task movements on the board by linking tickets directly to Git commits.", icon: Workflow },
];

export default function EngineeringPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-cyan-500/20 font-sans relative" dir="ltr">
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
            <Badge variant="outline" className="px-3 py-1 mb-4 text-[10px] tracking-widest uppercase bg-cyan-500/5 text-cyan-500 border-cyan-500/20 backdrop-blur-md rounded-md">
              <Code className="w-3.5 h-3.5 mr-1.5" /> For Engineering & Agile
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Track code branches and <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-primary to-indigo-500">
                sprint velocity.
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Consolidate story planning, automated code reviews, and developer backlogs. Keep your CI/CD pipelines connected directly to task boards.
            </p>
          </motion.div>
        </section>

        {/* --- DENSE BENTO GRID --- */}
        <motion.section 
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 mb-14 sm:mb-20"
        >
          {/* BENTO 1: Git Branch / CI/CD Workflow */}
          <motion.div variants={item} className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-cyan-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="p-5 pb-0">
              {/* Inline Icon and Title */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-500 shadow-inner border border-cyan-500/20 shrink-0">
                  <GitBranch className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Automated CI/CD Workflows</h3>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
                Bridge developer code with planning. Run test pipelines directly inside issue trackers and move tickets automatically on active git pushes.
              </p>
            </div>
            <GitWorkflowVisual />
          </motion.div>

          {/* BENTO 2: Sprint Tracking / Burndown */}
          <motion.div variants={item} className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-primary/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            
            <div className="p-5 pb-0">
              {/* Inline Icon and Title */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 shrink-0">
                  <GanttChartSquare className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Sprint Backlogs & Metrics</h3>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
                Accelerate software delivery. Plan sprints, calculate team velocity scores, and trace backlog burndown statistics over the life of a cycle.
              </p>
            </div>
            <SprintBurndownVisual />
          </motion.div>
        </motion.section>

       {/* --- SECONDARY PILLARS GRID --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 mb-14 sm:mb-20">
          {pillars.map((pillar, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              className="group flex flex-col justify-between rounded-lg border border-border/40 p-5 bg-card/25 backdrop-blur-md hover:bg-card/45 hover:border-primary/25 transition-all cursor-default text-left"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                    <pillar.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold tracking-tight text-foreground">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-xs text-muted-foreground/80 leading-normal font-normal">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </section>

        {/* --- CTA SECTION (Clean, Minimalist Frame) --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-lg border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 via-background to-background p-8 sm:p-12 text-center relative overflow-hidden shadow-2xs"
        >
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Ready to ship your product roadmaps?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Groom backlogs, track code events, and improve sprint metrics automatically. Setup takes less than 30 seconds.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold w-full sm:w-auto rounded-md shadow-sm" onClick={() => navigate("/login")}>
                Start Sprints <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}