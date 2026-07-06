// src/components/IntegrationGraph.tsx
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { Bot, Code2, Database, Network, Sparkles, Zap } from "lucide-react";
import { useRef, useMemo, useState, useEffect } from "react";
import type { ElementType, CSSProperties } from "react";

const endpoints = [160, 320, 480, 640] as const;

const bottomNodesData = [
  { icon: Bot, title: "AI Agents", description: "Autonomous task delegation", color: "#0284c7" },
  { icon: Code2, title: "Edge Functions", description: "Low-latency computation", color: "#6366f1" },
  { icon: Database, title: "Realtime DB", description: "Postgres synchronization", color: "#0f766e" },
  { icon: Zap, title: "Streamed Data", description: "NDJSON event payloads", color: "#f59e0b" },
] as const;

function generatePath(startX: number, startY: number, endX: number, endY: number) {
  const midY = startY + (endY - startY) * 0.5;
  return `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
}

interface BottomNodeProps {
  x: number;
  y: number;
  delay: number;
  node: typeof bottomNodesData[number];
}

function BottomNode({ x, y, delay, node }: BottomNodeProps) {
  const Icon = node.icon as ElementType;

  const nodeStyles = {
    "--node-color": node.color,
    "--node-color-fade": `${node.color}15`,
  } as CSSProperties;

  return (
    <foreignObject x={x - 75} y={y} width="150" height="130" className="overflow-visible">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, delay, type: "spring", stiffness: 180, damping: 20 }}
        style={nodeStyles}
        className="w-full flex flex-col items-center text-center group cursor-default"
      >
        <div 
          className="absolute top-6 w-12 h-12 rounded-full blur-[20px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: "var(--node-color)" }}
        />
        <div 
          className="relative w-12 h-12 rounded-2xl bg-card/60 border border-border/50 backdrop-blur-lg shadow-md flex items-center justify-center mb-3 transition-all duration-300 ease-out group-hover:-translate-y-1.5 z-10 overflow-hidden border-solid group-hover:border-[var(--node-color)] group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.15)] group-hover:bg-[var(--node-color-fade)]"
        >
          <Icon className="w-5 h-5 text-muted-foreground group-hover:text-[var(--node-color)] transition-colors duration-300" />
        </div>
        <div className="space-y-0.5 relative z-10 transition-transform duration-300 group-hover:-translate-y-0.5">
          <h4 className="text-[11px] font-bold text-foreground tracking-tight">{node.title}</h4>
          <p className="text-[9px] text-muted-foreground leading-normal px-2 font-medium">{node.description}</p>
        </div>
      </motion.div>
    </foreignObject>
  );
}

export function IntegrationGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(useSpring(mouseY, { stiffness: 120, damping: 25 }), [-0.5, 0.5], ["4deg", "-4deg"]);
  const rotateY = useTransform(useSpring(mouseX, { stiffness: 120, damping: 25 }), [-0.5, 0.5], ["-4deg", "4deg"]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const basePaths = useMemo(() => {
    return endpoints.map(endX => generatePath(400, 50, endX, 150));
  }, []);

  // Return absolutely nothing on mobile devices
  if (isMobile) return null;

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto py-6 sm:py-10 perspective-[1000px]"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div 
        ref={containerRef}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d", willChange: "transform" }}
        className="w-full select-none bg-card/30 dark:bg-black/30 backdrop-blur-md border border-border/40 dark:border-white/10 rounded-2xl shadow-xl p-4 sm:p-8 overflow-visible relative group"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_srgb,var(--border)_15%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_srgb,var(--border)_15%,transparent)_1px,transparent_1px)] bg-[size:24px_24px] rounded-2xl opacity-20 pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-[150px] bg-primary/5 blur-[80px] rounded-full pointer-events-none -z-10" />

        <svg viewBox="0 0 800 260" className="w-full h-auto overflow-visible relative z-10">
          <defs>
            <linearGradient id="line-base" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--color-border)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--color-border)" stopOpacity="0.05" />
            </linearGradient>

            {bottomNodesData.map((node, i) => (
              <linearGradient key={`tail-${i}`} id={`comet-tail-${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={node.color} stopOpacity="0" />
                <stop offset="100%" stopColor={node.color} stopOpacity="0.8" />
              </linearGradient>
            ))}
          </defs>

          {/* Central Pulsating Ring */}
          <g transform="translate(400, 35)">
            <circle cx="0" cy="0" r="24" fill="none" stroke="var(--color-primary)" strokeWidth="1" className="opacity-10" />
            <circle cx="0" cy="0" r="24" fill="none" stroke="var(--color-primary)" strokeWidth="1" opacity="0.3">
              <animate attributeName="r" values="24; 43" dur="3s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3; 0" dur="3s" repeatCount="indefinite" />
            </circle>
          </g>

          {basePaths.map((pathD, i) => {
            const color = bottomNodesData[i].color;
            const duration = 2.8 + i * 0.2; 

            return (
              <g key={`path-group-${i}`}>
                <path d={pathD} fill="none" stroke="rgba(120,120,120,0.15)" strokeWidth="1.5" />
                <g>
                  <path d="M -30 0 L 0 0" stroke={`url(#comet-tail-${i})`} strokeWidth="2.5" strokeLinecap="round" />
                  <circle cx="0" cy="0" r="6" fill={color} opacity="0.3" />
                  <circle cx="0" cy="0" r="2.5" fill={color} />
                  
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    path={pathD}
                    rotate="auto"
                    calcMode="spline"
                    keySplines="0.25 1 0.5 1"
                    keyTimes="0;1"
                  />
                  <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.1;0.9;1" dur={`${duration}s`} repeatCount="indefinite" />
                </g>
              </g>
            );
          })}

          <foreignObject x="250" y="5" width="300" height="70" className="overflow-visible">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 150 }}
              className="w-[220px] mx-auto h-11 bg-card border border-border/80 backdrop-blur-md rounded-full flex items-center justify-between px-3 cursor-default group/engine relative"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <Network className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[12px] font-bold tracking-tight text-foreground/90">
                Orchestration Pipeline
              </span>
              <div className="w-7 h-7 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-amber-500/80 group-hover/engine:scale-110 transition-transform duration-300" />
              </div>
            </motion.div>
          </foreignObject>

          {endpoints.map((x, i) => (
            <BottomNode key={`node-${i}`} x={x} y={150} delay={0.3 + i * 0.12} node={bottomNodesData[i]} />
          ))}
        </svg>
      </motion.div>
    </div>
  );
}