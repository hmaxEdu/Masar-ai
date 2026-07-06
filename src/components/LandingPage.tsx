// src/components/LandingPage.tsx
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Github,
  KanbanSquare,
  LayoutDashboard,
  Network,
  Shield,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { Suspense, lazy } from "react";
import { Footer } from "./Footer";
import { IntegrationGraph } from "./IntegrationGraph";
import { LandingHeader } from "./LandingHeader";
import { MarqueeTicker } from "./MarqueeTicker";
const WebGLBackground = lazy(() => import("./WebGLBackground"));

interface LandingPageProps {
  onLoginClick: () => void;
}

// ----------------------------------------------------------------------
// MAIN LANDING PAGE (Sleek & Minimal)
// ----------------------------------------------------------------------
export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const words = "Operationalize your workflow".split(" ");

  return (
    <div
      className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/20 font-sans relative"
      dir="ltr"
    >
      {/* Subtle Animated Background */}
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      {/* Navigation */}
      <LandingHeader
        onLoginClick={onLoginClick}
        onSignUpClick={onLoginClick}
      />

      <main className="pt-24 sm:pt-28 pb-16 relative z-10">
        
        {/* --- HERO SECTION --- */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8">
          <div className="max-w-3xl mx-auto flex flex-col items-center">
            
            {/* Elegant Header with Smooth Scale & Blur */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.15] mb-4 text-foreground">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: "blur(8px)", y: 15 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.5 }}
                  className="inline-block mr-[0.25em]"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: words.length * 0.08, duration: 0.5 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary to-cyan-400 bg-[length:200%_auto] pb-1 mt-1 font-semibold"
              >
                with multi-agent AI.
              </motion.span>
            </h1>

            {/* Quiet, Low-Contrast Paragraph */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-sm sm:text-base text-muted-foreground/80 max-w-xl mx-auto leading-relaxed mb-8 px-2 font-normal"
            >
              Masar introduces targeted task automation to your workspace. Plan sprints,
              check critical paths, and execute actions with minimal friction.
            </motion.p>

            {/* Sleek, Tight CTA row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto px-4"
            >
              <Button
                size="default"
                className="h-10 px-5 text-xs shadow-none w-full sm:w-auto group relative overflow-hidden font-semibold rounded-md"
                onClick={onLoginClick}
              >
                <span className="relative z-10 flex items-center">
                  Start Building Free{" "}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Button>
              <Button
                size="default"
                variant="outline"
                className="h-10 px-5 text-xs bg-card/20 text-foreground border-border/60 backdrop-blur-xs w-full sm:w-auto hover:bg-muted transition-colors font-medium rounded-md"
                onClick={() =>
                  window.open("https://github.com/hmaxEdu/Masar-ai", "_blank")
                }
              >
                <Github className="mr-1.5 h-3.5 w-3.5" /> View on GitHub
              </Button>
            </motion.div>
          </div>

          {/* Symmetrical Orchestration Engine Canvas */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6, ease: "easeOut" }}
            className="mt-12 sm:mt-16 relative mx-auto w-full px-2 sm:px-0"
          >
            <IntegrationGraph />
          </motion.div>
        </section>

        {/* Dynamic Partner Marquee Ticker */}
        <MarqueeTicker />

        {/* --- HIGH-DENSITY FEATURE MATRIX --- */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-20 sm:mt-24 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-12"
          >
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2.5 text-foreground">
              Built at the frontier of applied AI.
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
              Everything you need to operationalize team workflows, wrapped in a
              blazing-fast, modern interface.
            </p>
          </motion.div>

          {/* Clean 3-Column Grid without unnecessary colors/glows */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              delay={0}
              icon={<Bot className="h-4 w-4" />}
              title="Streaming AI Agents"
              description="Interact with context-aware AI that autonomously creates tasks, analyzes bottlenecks, and executes actions in real-time."
            />
            <FeatureCard
              delay={0.05}
              icon={<Network className="h-4 w-4" />}
              title="Dependency Trees"
              description="Visualize complex project plans with clean layouts. See how every task interconnects instantly."
            />
            <FeatureCard
              delay={0.1}
              icon={<Zap className="h-4 w-4" />}
              title="Optimistic UI Updates"
              description="Experience zero-latency interactions. Our drag-and-drop architecture pre-renders transitions locally."
            />
            <FeatureCard
              delay={0.15}
              icon={<KanbanSquare className="h-4 w-4" />}
              title="Complex Sprints"
              description="Manage deeply nested subtasks and enforce strict task dependencies ensuring work is done in order."
            />
            <FeatureCard
              delay={0.2}
              icon={<LayoutDashboard className="h-4 w-4" />}
              title="Real-time Postgres Sync"
              description="Powered by WebSockets, collaborate seamlessly with your team. See changes instantly across devices."
            />
            <FeatureCard
              delay={0.25}
              icon={<Shield className="h-4 w-4" />}
              title="Secure at Rest"
              description="Built with TypeScript, React 19, and rigorous security patterns designed to protect your repository data."
            />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

// ----------------------------------------------------------------------
// COMPACT MINIMAL FEATURE CARD
// ----------------------------------------------------------------------
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}
function FeatureCard({ icon, title, description, delay }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay }}
      className="flex flex-col gap-3 p-5 rounded-lg border border-border/40 bg-card/15 backdrop-blur-md transition-colors hover:border-primary/25 group cursor-default"
    >
      {/* Discrete, flat icon wrapper */}
      <div className="text-primary h-5 w-5 shrink-0 transition-transform group-hover:scale-105">
        {icon}
      </div>

      <div className="space-y-1">
        <h3 className="text-xs sm:text-sm font-semibold tracking-tight text-foreground/95">
          {title}
        </h3>
        <p className="text-xs text-muted-foreground/80 leading-normal">
          {description}
        </p>
      </div>
    </motion.div>
  );
}