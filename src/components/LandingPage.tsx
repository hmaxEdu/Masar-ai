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
  Zap
} from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";
import { Suspense, lazy, useRef } from "react";
import { Footer } from "./Footer";
import { IntegrationGraph } from "./IntegrationGraph";
import { Logo } from "./Logo";
import { MarqueeTicker } from "./MarqueeTicker"; // <-- IMPORT NEW TICKER COMPONENT
import { ModeToggle } from "./mode-toggle";
import { Separator } from "./ui/separator";
const WebGLBackground = lazy(() => import("./WebGLBackground"));

interface LandingPageProps {
  onLoginClick: () => void;
}



// ----------------------------------------------------------------------
// MAIN LANDING PAGE
// ----------------------------------------------------------------------
export default function LandingPage({ onLoginClick }: LandingPageProps) {
  const targetRef = useRef<HTMLDivElement>(null);
  const words = "Operationalize your workflow".split(" ");

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const y1 = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <div
      className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/30 font-sans relative"
      dir="ltr"
    >
      {/* High-Fidelity WebGL Background*/}
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12   flex items-center ">
              <Logo className="w-10 h-10 brightness-0  dark:invert" />
            </div>
            <span className="font-bold text-xl tracking-tight text-foreground hidden xs:block">
              Masar
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-5">
            <ModeToggle />
            <Separator orientation="vertical" className="h-6" />
            <Button
              variant="ghost"
              className="hidden sm:flex transition-colors hover:text-primary hover:bg-muted font-semibold"
              onClick={onLoginClick}
            >
              Sign In
            </Button>
            <Button
              className="shadow-xl shadow-primary/20 group overflow-hidden relative text-sm sm:text-base px-5 sm:px-6 font-bold "
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

      <main className="pt-32 sm:pt-40 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-10">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            

            <h1 className="text-5xl sm:text-6xl md:text-[5rem] font-black tracking-tighter leading-[1.1] mb-6 text-foreground">
              {words.map((word, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
                  animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="inline-block mr-[0.3em] drop-shadow-sm"
                >
                  {word}
                </motion.span>
              ))}
              <br />
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: words.length * 0.1, duration: 0.6 }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-primary to-cyan-400 bg-[length:200%_auto] animate-gradient pb-2 mt-2"
              >
                with multi-agent AI.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10 px-2 font-medium"
            >
              Masar brings real AI automation to the enterprise. Plan projects,
              predict bottlenecks, and execute tasks with speed, precision, and
              measurable impact.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto px-4"
            >
              <Button
                size="lg"
                className="h-14 px-8 text-base shadow-2xl shadow-primary/30 w-full sm:w-auto group relative overflow-hidden font-bold"
                onClick={onLoginClick}
              >
                <span className="relative z-10 flex items-center">
                  Start Building Free{" "}
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-8 text-base bg-card/50 text-foreground border-border/80 backdrop-blur w-full sm:w-auto hover:bg-muted transition-colors  font-bold"
                onClick={() =>
                  window.open("https://github.com/hmaxEdu/Masar-ai", "_blank")
                }
              >
                <Github className="mr-2 h-5 w-5" /> View on GitHub
              </Button>
            </motion.div>
          </div>

          {/* Integration Graph Demonstration Section */}
          <motion.div
            style={{ y: y1 }}
            ref={targetRef}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: "easeOut" }}
            className="mt-16 sm:mt-24 relative mx-auto w-full px-2 sm:px-0"
          >
            <IntegrationGraph />
          </motion.div>
        </section>

        {/* Dynamic Infinite Marquee */}
        <MarqueeTicker />

        {/* Features Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-24 sm:mt-32 relative z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-6 text-foreground">
              Built at the frontier of applied AI.
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              Everything you need to operationalize team workflows, wrapped in a
              blazing-fast, modern interface.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              delay={0}
              icon={<Bot />}
              title="Streaming AI Agents"
              description="Interact with context-aware AI that autonomously creates tasks, analyzes bottlenecks, and executes UI actions in real-time."
            />
            <FeatureCard
              delay={0.1}
              icon={<Network />}
              title="Animated Dependency Trees"
              description="Visualize complex project plans with bespoke animations. See how every task interconnects instantly."
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

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

// ----------------------------------------------------------------------
// FEATURE CARD COMPONENT
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
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      className="group relative rounded-lg border border-border/60 bg-card/50 p-8 backdrop-blur-xl transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:shadow-2xl hover:shadow-primary/5"
    >
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/0 via-primary/5 to-primary/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="relative z-10 space-y-6">
        <div className="inline-flex rounded-2xl bg-primary/10 p-4 text-primary transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20 shadow-inner">
          {icon}
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h3>
          <p className="text-muted-foreground leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <div className="flex items-center text-sm font-bold text-primary opacity-0 transition-all duration-300 group-hover:translate-x-2 group-hover:opacity-100">
          Learn more <ArrowRight className="ml-1 h-4 w-4" />
        </div>
      </div>
    </motion.div>
  );
}