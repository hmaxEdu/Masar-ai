// src/components/SecurityPage.tsx
import {
    CheckCircle2,
    Database,
    EyeOff,
    FileDigit,
    HardDrive,
    Key,
    Lock,
    Server,
    ShieldCheck
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
// DYNAMIC VISUAL 1: ROW LEVEL SECURITY (RLS) (High-Density)
// ============================================================================
function RLSVisual() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAdmin((prev) => !prev);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[280px] flex flex-col sm:flex-row items-center justify-center p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden mt-3 gap-3">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-orange-500/5 via-background/0 to-background/0 pointer-events-none" />
      
      {/* Query Request Node */}
      <div className="w-full sm:w-40 bg-card border border-border/50 rounded p-2.5 shadow-sm z-10 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-border/30 pb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80">User Context</span>
          <Badge variant="outline" className={`text-[8px] px-1 py-0 rounded-xs transition-colors ${isAdmin ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
            {isAdmin ? "Admin" : "Viewer"}
          </Badge>
        </div>
        <div className="bg-[#1c1c1c] rounded p-1.5 font-mono text-[9px] text-muted-foreground/85 leading-normal">
          <span className="text-blue-400">SELECT</span> * <span className="text-blue-400">FROM</span> tasks;
        </div>
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2.5, ease: "linear", repeat: Infinity }}
            className={`h-full ${isAdmin ? 'bg-orange-500' : 'bg-primary'}`}
          />
        </div>
      </div>

      {/* RLS Filter Node */}
      <div className="relative flex flex-col items-center justify-center z-10">
        <div className="w-px h-3 sm:h-px sm:w-5 bg-border" />
        <div className="w-8 h-8 rounded-full bg-background border border-border/60 flex items-center justify-center shadow-sm z-10">
          <ShieldCheck className="w-4 h-4 text-orange-500" />
        </div>
        <div className="w-px h-3 sm:h-px sm:w-5 bg-border" />
      </div>

      {/* Database Results Node */}
      <div className="w-full sm:w-48 bg-card border border-border/50 rounded p-2.5 shadow-sm z-10 flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground/80 border-b border-border/30 pb-1.5">
          <Database className="w-3 h-3" /> Returned Rows
        </div>
        
        {/* Row 1: Always visible */}
        <div className="flex items-center justify-between bg-muted/30 border border-border/20 rounded px-1.5 py-1">
           <span className="text-[10px] font-medium truncate max-w-[80px]">Public Roadmap</span>
           <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
        </div>

        {/* Row 2: RLS Protected */}
        <motion.div 
          animate={{ opacity: isAdmin ? 1 : 0.4 }}
          className={`flex items-center justify-between border rounded px-1.5 py-1 transition-colors ${isAdmin ? 'bg-muted/30 border-border/20' : 'bg-destructive/5 border-destructive/10'}`}
        >
           <span className="text-[10px] font-medium truncate max-w-[80px]">Q3 Financials</span>
           {isAdmin ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <Lock className="w-3 h-3 text-destructive shrink-0" />}
        </motion.div>

        {/* Row 3: RLS Protected */}
        <motion.div 
          animate={{ opacity: isAdmin ? 1 : 0.4 }}
          className={`flex items-center justify-between border rounded px-1.5 py-1 transition-colors ${isAdmin ? 'bg-muted/30 border-border/20' : 'bg-destructive/5 border-destructive/10'}`}
        >
           <span className="text-[10px] font-medium truncate max-w-[80px]">API Secrets</span>
           {isAdmin ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" /> : <Lock className="w-3 h-3 text-destructive shrink-0" />}
        </motion.div>
      </div>

    </div>
  );
}

// ============================================================================
// DYNAMIC VISUAL 2: ENCRYPTION (High-Density)
// ============================================================================
function EncryptionVisual() {
  const [isEncrypted, setIsEncrypted] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsEncrypted((prev) => !prev);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const plainText = `"task": "Update Auth",\n"secret": "pk_live_123"`;
  const cipherText = `0x8F2A9B...4C1D\n9A12...B3F8\nE4C9...7D2A`;

  return (
    <div className="relative w-full h-full min-h-[250px] flex items-center justify-center p-4 bg-muted/20 border-t border-border/40 rounded-b-lg overflow-hidden mt-3">
      <div className="absolute inset-0 bg-grid-white/[0.01] bg-[size:16px_16px] pointer-events-none" />
      
      <div className="flex w-full items-center justify-center gap-3 sm:gap-5 relative z-10">
        
        {/* Payload Container */}
        <div className="w-44 sm:w-56 h-28 bg-[#1c1c1c] border border-border/40 rounded-md p-2.5 shadow-sm flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 pb-1.5 mb-1.5">
             <span className="text-[9px] font-bold text-emerald-400">Payload State</span>
             <Badge variant="outline" className={`text-[8px] px-1 py-0 rounded-sm font-mono ${isEncrypted ? 'text-destructive border-destructive/20 bg-destructive/10' : 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10'}`}>
               {isEncrypted ? "AES-256" : "PLAINTEXT"}
             </Badge>
          </div>
          
          <div className="flex-1 relative">
            <AnimatePresence mode="wait">
              {!isEncrypted ? (
                <motion.pre
                  key="plain"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-[9px] text-muted-foreground/80 whitespace-pre-wrap leading-tight"
                >
                  <span className="text-blue-400">{"{"}</span>
                  <br/>
                  <span className="ml-2 text-foreground/90">{plainText}</span>
                  <br/>
                  <span className="text-blue-400">{"}"}</span>
                </motion.pre>
              ) : (
                <motion.pre
                  key="cipher"
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.2 }}
                  className="font-mono text-[9px] text-destructive/80 break-all leading-normal"
                >
                  {cipherText}
                </motion.pre>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Cryptographic Key Pulse */}
        <div className="flex flex-col items-center">
          <motion.div 
            animate={{ 
              scale: [1, 1.15, 1],
              color: isEncrypted ? "var(--color-destructive)" : "var(--color-emerald-500)"
            }}
            transition={{ type: "tween", duration: 0.5 }}
            className="w-10 h-10 rounded-full bg-background border border-border/60 shadow-md flex items-center justify-center z-10"
          >
            {isEncrypted ? <Lock className="w-4 h-4" /> : <Key className="w-4 h-4" />}
          </motion.div>
        </div>

      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================
const pillars = [
  { title: "Audit Logging", description: "Comprehensive tracking of all workspace actions, task modifications, and permission changes.", icon: FileDigit },
  { title: "Automated Backups", description: "Continuous database backups with Point-in-Time Recovery (PITR) ensuring zero data loss.", icon: HardDrive },
  { title: "No AI Training", description: "Your proprietary project data and metadata are never used to train our public LLM models.", icon: EyeOff },
];

export default function SecurityPage() {
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
            <Badge variant="outline" className="px-3 py-1 mb-4 text-[10px] tracking-widest uppercase bg-orange-500/5 text-orange-500 border-orange-500/20 backdrop-blur-md rounded-md">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5" /> Trust & Compliance
            </Badge>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground mb-4 leading-tight">
              Enterprise-grade <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500">
                data protection.
              </span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              We treat your data with the highest level of security. Masar is built on robust PostgreSQL foundations with modern compliance standards out-of-the-box.
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
          {/* BENTO 1: RLS Visual */}
          <motion.div variants={item} className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-orange-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="p-5 pb-0">
              {/* Inline Icon and Title */}
              <div className="flex items-center gap-2.5 mb-2.5">
                <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-inner border border-orange-500/20 shrink-0">
                  <Server className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-sm sm:text-base font-bold tracking-tight text-foreground/95">Row Level Security (RLS)</h3>
              </div>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
                Database queries are strictly scoped at the edge. Users can only access projects and tasks they are explicitly invited to, enforced mathematically by Postgres.
              </p>
            </div>
            <RLSVisual />
          </motion.div>

          {/* BENTO 2: Encryption Visual */}
          <motion.div variants={item} className="group relative overflow-hidden rounded-lg border border-border/40 bg-gradient-to-br from-card/85 to-background/40 backdrop-blur-md hover:border-emerald-500/30 transition-colors flex flex-col justify-between">
            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            
            <div className="p-5 pb-0">
              <div className="h-8 w-8 rounded bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-3 shadow-inner border border-emerald-500/20">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <h3 className="text-sm sm:text-base font-bold tracking-tight mb-1.5">End-to-End Encryption</h3>
              <p className="text-xs text-muted-foreground/80 leading-relaxed max-w-sm">
                All workspace data is encrypted in transit using strict TLS 1.3 protocols, and heavily encrypted at rest using AES-256 military-grade standards.
              </p>
            </div>
            <EncryptionVisual />
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

        {/* --- COMPLIANCE SUMMARY ROW --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-lg border border-border/40 bg-muted/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 backdrop-blur-md mb-20"
        >
          <div className="space-y-2 max-w-md">
            <h2 className="text-sm sm:text-base font-bold tracking-tight">Committed to Compliance</h2>
            <p className="text-xs text-muted-foreground/85 leading-normal">
              Our infrastructure runs on SOC2 Type II, HIPAA, and ISO 27001 compliant data centers. We undergo regular automated audits.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {["SOC2 Type II", "GDPR Compliant", "CCPA Compliant"].map((label, idx) => (
              <Badge
                key={idx}
                className="gap-1.5 px-2.5 py-1 text-[10px] font-bold bg-background border border-border/30 rounded text-foreground/90"
                variant="outline"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {label}
              </Badge>
            ))}
          </div>
        </motion.section>

        {/* --- CTA SECTION (Clean, Minimalist Frame) --- */}
        <motion.section
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          className="rounded-lg border border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-background p-8 sm:p-12 text-center relative overflow-hidden shadow-2xs"
        >
          <div className="relative z-10 space-y-4 max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Deploy with confidence.
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Join enterprises that trust Masar to secure their product roadmaps and proprietary workflows.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="sm" className="h-9 px-4 text-xs font-semibold w-full sm:w-auto rounded-md shadow-sm" onClick={() => navigate("/login")}>
                Start building for free
              </Button>
              <Button size="sm" variant="secondary" className="h-9 px-4 text-xs font-semibold w-full sm:w-auto rounded-md" onClick={() => navigate("/pricing")}>
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