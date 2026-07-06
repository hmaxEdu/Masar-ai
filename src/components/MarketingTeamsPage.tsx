// src/components/MarketingTeamsPage.tsx
import {
    ArrowRight,
    Calendar,
    CheckCircle2,
    Compass,
    FileText,
    Image,
    Layers,
    Megaphone,
    Target,
    Video
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
// HELPER COMPONENT 1: TIMELINE BAR
// ============================================================================
interface TimelineBarProps {
  label: string;
  start: number;
  width: number;
  progress: number;
  color: string;
}

const TimelineBar = ({ label, start, width, progress, color }: TimelineBarProps) => (
  <div className="relative w-full h-8 flex items-center">
    <div 
      className="absolute h-7 rounded-md border border-border/40 bg-card/65 shadow-2xs flex items-center justify-between px-2.5 overflow-hidden"
      style={{ left: `${start}%`, width: `${width}%` }}
    >
      <div 
        className={`absolute left-0 top-0 bottom-0 opacity-10 transition-all duration-300 ${color}`}
        style={{ width: `${progress}%` }}
      />
      
      <div className="flex items-center gap-1.5 relative z-10 truncate">
        <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
        <span className="text-[10px] font-bold text-foreground/90 truncate">{label}</span>
      </div>
      <span className="text-[8px] text-muted-foreground/80 font-mono relative z-10 hidden sm:inline-block">{progress}%</span>
    </div>
  </div>
);

// ============================================================================
// DYNAMIC VISUAL 1: CAMPAIGN GANTT TIMELINE (High-Density)
// ============================================================================
function CampaignTimelineVisual() {
  const [playhead, setPlayhead] = useState(10);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlayhead((p) => (p >= 90 ? 10 : p + 1));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex flex-col p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden justify-center">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />
      
      {/* Dates Header */}
      <div className="flex justify-between text-[8px] font-mono text-muted-foreground/50 px-1 border-b border-border/20 pb-1.5 mb-3 relative z-10">
        <span>WEEK 1</span>
        <span>WEEK 2</span>
        <span>WEEK 3</span>
        <span>WEEK 4</span>
      </div>

      <div className="space-y-2.5 relative z-10 flex-1 flex flex-col justify-center">
        <TimelineBar label="Strategy" start={5} width={45} progress={100} color="bg-rose-500" />
        <TimelineBar label="Creative Assets" start={30} width={40} progress={65} color="bg-pink-500" />
        <TimelineBar label="Deployment" start={60} width={35} progress={15} color="bg-amber-500" />
      </div>

      {/* Moving Playhead Indicator */}
      <div 
        className="absolute top-0 bottom-0 w-px bg-rose-500/35 pointer-events-none z-20"
        style={{ left: `${playhead}%` }}
      >
        <div className="absolute top-0 -translate-x-1/2 bg-rose-500 text-white font-mono text-[7px] px-1 py-0.5 rounded-sm shadow-sm">
          TODAY
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENT 2: ASSET CARD
// ============================================================================
interface AssetCardProps {
  label: string;
  format: string;
  icon: React.ComponentType<{ className?: string }>;
  cardStep: number;
  activeStep: number;
}

const AssetCard = ({ label, format, icon: Icon, cardStep, activeStep }: AssetCardProps) => {
  const getStatusText = (stepNum: number) => {
    if (activeStep >= stepNum + 1) return { text: "Approved", class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" };
    if (activeStep === stepNum) return { text: "Reviewing", class: "bg-pink-500/10 text-pink-500 border-pink-500/20 animate-pulse" };
    return { text: "Drafting", class: "bg-muted/50 text-muted-foreground" };
  };

  const status = getStatusText(cardStep);
  return (
    <motion.div 
      layout
      className="bg-card border border-border/40 rounded-lg p-2.5 shadow-sm flex items-center justify-between gap-3 w-full max-w-xs"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-7 h-7 rounded bg-muted/60 flex items-center justify-center text-muted-foreground/80 shrink-0">
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-[11px] font-bold text-foreground/90 leading-tight truncate">{label}</span>
          <span className="text-[8px] text-muted-foreground uppercase tracking-wider font-semibold">{format}</span>
        </div>
      </div>

      <Badge variant="outline" className={`text-[8px] px-1 py-0 rounded-xs uppercase tracking-wider font-bold transition-all duration-300 shrink-0 ${status.class}`}>
        {status.text}
      </Badge>
    </motion.div>
  );
};

// ============================================================================
// DYNAMIC VISUAL 2: CREATIVE ASSET PIPELINE (High-Density)
// ============================================================================
function AssetPipelineVisual() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 4);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex flex-col p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden justify-center items-center">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="w-full flex flex-col gap-2 relative z-10 items-center">
        <AssetCard label="YouTube Pre-Roll Video" format="Video" icon={Video} cardStep={0} activeStep={step} />
        <AssetCard label="Hero Landing Banner" format="Graphic" icon={Image} cardStep={1} activeStep={step} />
        <AssetCard label="Campaign Ad Copy" format="Copy" icon={FileText} cardStep={2} activeStep={step} />
      </div>

      <AnimatePresence mode="wait">
        {step === 3 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-[9px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md backdrop-blur-md"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> All assets ready for launch
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
const pillars = [
  { title: "Campaign Calendars", description: "Map out monthly content schedules, marketing drops, and product launch sequences.", icon: Calendar },
  { title: "Targeted Analytics", description: "Keep track of asset execution velocities, delivery schedules, and campaign statuses.", icon: Target },
  { title: "Resource Balancing", description: "Understand the bandwidth of your designers, copywriters, and video producers at a glance.", icon: Layers },
];

export default function MarketingTeamsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-rose-500/20 font-sans relative" dir="ltr">
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
            <Badge variant="outline" className="px-3 py-1 mb-4 text-[10px] tracking-widest uppercase bg-rose-500/5 text-rose-500 border-rose-500/20 backdrop-blur-md rounded-md">
              <Megaphone className="w-3.5 h-3.5 mr-1.5" /> For Marketing & Growth
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Coordinate creative campaigns <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500">
                with total precision.
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Sync copywriters, designers, and growth managers. From brand ideation to omni-channel deployment, run beautiful campaigns with automation.
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
          {/* BENTO 1: Campaign Timeline */}
          <motion.div variants={item} className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-rose-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="p-5 pb-0">
              {/* Inline Icon and Title */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner border border-rose-500/20 shrink-0">
                  <Calendar className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Campaign Timelines</h3>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
                Plan overlapping promotional flights, PR announcements, and newsletter drops on a single dynamic roadmap with cross-task dependency checking.
              </p>
            </div>
            <CampaignTimelineVisual />
          </motion.div>

          {/* BENTO 2: Asset Tracker */}
          <motion.div variants={item} className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-pink-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="p-5 pb-0">
              {/* Inline Icon and Title */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-500 shadow-inner border border-pink-500/20 shrink-0">
                  <Compass className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Creative Asset Pipeline</h3>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
                Streamline review processes. Move visual templates, copy, and videos through rigorous review pipelines with built-in status badges.
              </p>
            </div>
            <AssetPipelineVisual />
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
          className="rounded-lg border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-background to-background p-8 sm:p-12 text-center relative overflow-hidden shadow-2xs"
        >
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Ready to execute your creative vision?
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Launch elegant marketing workflows with automated status tracking. No more lost designs or delayed assets.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold w-full sm:w-auto rounded-md shadow-sm" onClick={() => navigate("/login")}>
                Launch Campaigns <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </motion.section>

      </main>

      <Footer />
    </div>
  );
}