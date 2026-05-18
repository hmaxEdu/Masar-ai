// src/components/LandingPage.tsx
import { Button } from "@/components/ui/button";
import { motion, useScroll, useTransform } from "motion/react";
import {
  ArrowRight,
  Sparkles,
  KanbanSquare,
  LineChart,
  Bot,
  Zap,
  Shield,
  LayoutDashboard,
  Github,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import Logo from "@/assets/masar.png";
import { useRef, useState, useEffect, Suspense, lazy } from "react";
const WebGLBackground = lazy(() => import("./WebGLBackground"));
import { ModeToggle } from "./mode-toggle";
import { Separator } from "./ui/separator";

interface LandingPageProps {
  onLoginClick: () => void;
}

// ----------------------------------------------------------------------
// SEAMLESS AI LOOP COMPONENT
// ----------------------------------------------------------------------
function SeamlessAILoop() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((s) => (s + 1) % 6);
    }, 1500); // Super snappy loop
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100%-2rem)] sm:w-80 max-w-sm bg-background/95 backdrop-blur-xl border border-border/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-20">
      <div className="p-2 sm:p-3 border-b border-border/50 bg-muted/50 flex items-center gap-2">
        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
          <Sparkles className="w-3 h-3" />
        </div>
        <span className="text-xs font-semibold text-foreground">
          Masar Agent
        </span>
      </div>
      <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
        {/* User Prompt */}
        <motion.div
          animate={{ opacity: step === 5 ? 0 : 1 }}
          className="flex gap-2"
        >
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-muted border border-border flex-shrink-0" />
          <div className="bg-muted p-2 rounded-lg rounded-tl-none text-[10px] sm:text-xs text-foreground font-medium w-full shadow-sm">
            Draft Q3 roadmap and assign the engineering team.
          </div>
        </motion.div>

        <div className="flex gap-2 justify-end">
          <div className="bg-primary/10 border border-primary/20 p-2 rounded-lg rounded-tr-none text-[10px] sm:text-xs w-[90%] sm:w-[85%] space-y-2 overflow-hidden shadow-sm">
            {/* Step 1: AI Acknowledgment */}
            <motion.div
              animate={{
                width: step >= 1 && step < 5 ? "100%" : "0%",
                opacity: step >= 1 && step < 5 ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <span className="text-primary font-bold">
                Executing workflow...
              </span>
            </motion.div>

            {/* Step 2: Tool 1 */}
            <motion.div
              animate={{
                opacity: step >= 2 && step < 5 ? 1 : 0,
                height: step >= 2 && step < 5 ? "auto" : 0,
                marginTop: step >= 2 && step < 5 ? 8 : 0,
              }}
              className="bg-background rounded p-1.5 flex items-center gap-2 border border-border/50 overflow-hidden"
            >
              {step === 2 ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <CircleDashed className="w-3 h-3 text-blue-500 shrink-0" />
                </motion.div>
              ) : (
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              )}
              <span className="truncate text-foreground font-medium">
                {step === 2 ? "Generating subtasks..." : "Created 12 tasks"}
              </span>
            </motion.div>

            {/* Step 3: Tool 2 */}
            <motion.div
              animate={{
                opacity: step >= 3 && step < 5 ? 1 : 0,
                height: step >= 3 && step < 5 ? "auto" : 0,
                marginTop: step >= 3 && step < 5 ? 8 : 0,
              }}
              className="bg-background rounded p-1.5 flex items-center gap-2 border border-border/50 overflow-hidden"
            >
              {step === 3 ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  <CircleDashed className="w-3 h-3 text-blue-500 shrink-0" />
                </motion.div>
              ) : (
                <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />
              )}
              <span className="truncate text-foreground font-medium">
                {step === 3
                  ? "Assigning team members..."
                  : "Team assigned successfully"}
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// MAIN LANDING PAGE
// ----------------------------------------------------------------------
export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const targetRef = useRef<HTMLDivElement>(null);

  // Clean Parallax effect (removed bouncing, scales properly based on scroll)
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <div
      className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/30 font-sans relative"
      dir="ltr"
    >
      {/* High-Fidelity WebGL Background */}
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-40 h-40  flex items-center justify-center">
              <img
                src={Logo}
                className="w-5 h-5 brightness-0 invert"
                alt="Masar"
              />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground hidden xs:block">
              Masar
            </span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <ModeToggle />
            <Separator orientation="vertical" />
            <Button
              variant="ghost"
              className="hidden sm:flex transition-colors hover:text-primary hover:bg-muted"
              onClick={onLoginClick}
            >
              Sign In
            </Button>
            <Separator orientation="vertical" />
            <Button
              className="shadow-lg shadow-primary/20 group overflow-hidden relative text-sm sm:text-base px-4 sm:px-6"
              onClick={onLoginClick}
            >
              <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
              Get Started{" "}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="pt-24 sm:pt-32 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-card/80 border border-border text-xs sm:text-sm font-semibold text-foreground shadow-sm mb-6 sm:mb-8 backdrop-blur-md"
            >
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-primary animate-pulse" />
              <span>Redefining Enterprise Task Automation</span>
            </motion.div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-foreground">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="block drop-shadow-sm"
              >
                Operationalize your workflow
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary to-blue-400 bg-[length:200%_auto] animate-gradient pb-2"
              >
                with multi-agent AI.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-8 sm:mb-10 px-2"
            >
              Masar brings real AI automation to the enterprise. Plan projects,
              predict bottlenecks, and execute tasks with speed, precision, and
              measurable impact.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4"
            >
              <Button
                size="lg"
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base shadow-2xl shadow-primary/25 w-full sm:w-auto group relative overflow-hidden"
                onClick={onLoginClick}
              >
                <span className="relative z-10 flex items-center">
                  Start Building Free{" "}
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-card/50 text-foreground border-border/80 backdrop-blur w-full sm:w-auto hover:bg-muted transition-colors"
                onClick={() =>
                  window.open("https://github.com/Tessera-Labs-Masar", "_blank")
                }
              >
                <Github className="mr-2 h-4 w-4 sm:h-5 sm:w-5" /> View on GitHub
              </Button>
            </motion.div>
          </div>

          {/* Responsive App Mockup */}
          <motion.div
            style={{ y: y1 }}
            ref={targetRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
            className="mt-16 sm:mt-24 relative mx-auto max-w-5xl px-2 sm:px-0"
          >
            <div className="rounded-xl sm:rounded-2xl border border-border/80 bg-card/70 backdrop-blur-2xl shadow-2xl overflow-hidden ring-1 ring-black/5 dark:ring-white/10">
              {/* Fake Mac Header */}
              <div className="h-8 sm:h-12 border-b border-border flex items-center px-3 sm:px-4 gap-1.5 sm:gap-2 bg-muted/60">
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-red-500/90 shadow-sm" />
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-yellow-500/90 shadow-sm" />
                <div className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 rounded-full bg-green-500/90 shadow-sm" />
                <div className="ml-2 sm:ml-4 flex-1 h-5 sm:h-6 bg-background/50 rounded-md border border-border/50 flex items-center justify-center max-w-xs mx-auto">
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium font-mono truncate px-2">
                    masar-workspace.local
                  </span>
                </div>
              </div>

              {/* Fake UI Area */}
              <div className="aspect-[4/5] sm:aspect-[16/9] bg-gradient-to-br from-background/90 via-background to-muted/20 relative overflow-hidden flex">
                {/* Fake Sidebar (Hidden on mobile) */}
                <div className="w-48 border-r border-border/50 p-4 space-y-4 hidden md:block bg-card/30">
                  <div className="h-6 w-24 bg-primary/20 rounded-md mb-8" />
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-4 w-full bg-muted rounded-sm" />
                  ))}
                </div>

                {/* Fake Kanban Board (Scales beautifully) */}
                <div className="flex-1 p-3 sm:p-6 flex gap-3 sm:gap-6 overflow-hidden">
                  {[
                    { name: "To Do", count: 4, hiddenOnMobile: false },
                    { name: "In Progress", count: 3, hiddenOnMobile: false },
                    { name: "Done", count: 4, hiddenOnMobile: true }, // Hide 3rd column on small screens to prevent squishing
                  ].map((col) => (
                    <div
                      key={col.name}
                      className={`flex-1 space-y-3 sm:space-y-4 ${col.hiddenOnMobile ? "hidden sm:block" : "block"}`}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-4">
                        <div className="h-4 sm:h-5 w-16 sm:w-20 bg-muted rounded" />
                        <div className="h-4 w-4 sm:h-5 sm:w-5 bg-muted rounded-full" />
                      </div>
                      {Array.from({ length: col.count }).map((_, taskIdx) => (
                        <div
                          key={taskIdx}
                          className="p-3 sm:p-4 bg-card border border-border rounded-lg sm:rounded-xl shadow-sm space-y-2 sm:space-y-3"
                        >
                          <div className="h-2.5 sm:h-3 w-3/4 bg-muted-foreground/30 rounded" />
                          <div className="h-2.5 sm:h-3 w-1/2 bg-muted-foreground/20 rounded" />
                          <div className="flex justify-between items-center pt-1 sm:pt-2">
                            <div className="h-4 sm:h-5 w-10 sm:w-12 bg-primary/20 rounded-full" />
                            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-muted rounded-full" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Integrated Seamless AI Loop */}
                <SeamlessAILoop />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-40 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-foreground">
              Built at the frontier of applied AI.
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-2">
              Everything you need to operationalize team workflows, wrapped in a
              blazing-fast, modern interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <FeatureCard
              delay={0}
              icon={<Bot />}
              title="Streaming AI Agents"
              description="Interact with context-aware AI that autonomously creates tasks, analyzes bottlenecks, and executes UI actions in real-time."
            />
            <FeatureCard
              delay={0.1}
              icon={<LineChart />}
              title="Interactive Dashboards"
              description="Visualize data instantly. Gain actionable insights into project health, team workload, and critical path dependencies."
            />
            <FeatureCard
              delay={0.2}
              icon={<Zap />}
              title="Optimistic UI Updates"
              description="Experience zero-latency interactions. Our drag-and-drop architecture preempts network requests for a fluid experience."
            />
            <FeatureCard
              delay={0.3}
              icon={<KanbanSquare />}
              title="Complex Workflows"
              description="Manage deeply nested subtasks and enforce strict task dependencies ensuring work is done in the right order."
            />
            <FeatureCard
              delay={0.4}
              icon={<LayoutDashboard />}
              title="Real-time Sync"
              description="Powered by WebSockets, collaborate seamlessly with your team. See changes instantly across all devices."
            />
            <FeatureCard
              delay={0.5}
              icon={<Shield />}
              title="Enterprise Grade"
              description="Built with TypeScript, React 19, and scalable UI design patterns designed to handle massive datasets securely."
            />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-muted/10 pt-12 pb-8 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-foreground/10 rounded-md flex items-center justify-center">
              <img
                src={Logo}
                className="w-4 h-4 brightness-0 invert opacity-90 dark:opacity-100"
                alt="Masar"
              />
            </div>
            <span className="font-bold text-lg text-foreground">Masar</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Designed & Engineered for the modern enterprise.
          </p>
        </div>
      </footer>

      {/* Custom CSS for gradient animation */}
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </div>
  );
}
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}
function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl border border-border/60 bg-card/50 p-6 backdrop-blur-md transition-all duration-300 hover:border-primary/30 hover:bg-card/80 hover:shadow-xl"
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 space-y-5">
        {/* Icon container with scaling + color transition */}
        <div className="inline-flex rounded-xl bg-primary/10 p-3 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
          {icon}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">{description}</p>
        </div>

        {/* Slide-in arrow indicator */}
        <div className="flex items-center text-sm font-medium text-primary opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
          Learn more <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}
