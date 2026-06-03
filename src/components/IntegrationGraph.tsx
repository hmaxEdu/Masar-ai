// src/components/IntegrationGraph.tsx
import { motion, AnimatePresence } from "motion/react";
import { Plus, Bot, Code2, Box } from "lucide-react";
import { useState } from "react";

// ----------------------------------------------------------------------
// CUSTOM ICONS
// ----------------------------------------------------------------------
const WavesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6c.6 0 1.2-.2 1.8-.6L5.4 4C6.5 3.3 7.8 3 9 3s2.5.3 3.6 1l1.6 1.4c.6.4 1.2.6 1.8.6s1.2-.2 1.8-.6L19.4 4c1.1-.7 2.4-1 3.6-1" />
    <path d="M2 12c.6 0 1.2-.2 1.8-.6L5.4 10c1.1-.7 2.4-1 3.6-1s2.5.3 3.6 1l1.6 1.4c.6.4 1.2.6 1.8.6s1.2-.2 1.8-.6L19.4 10c1.1-.7 2.4-1 3.6-1" />
    <path d="M2 18c.6 0 1.2-.2 1.8-.6L5.4 16c1.1-.7 2.4-1 3.6-1s2.5.3 3.6 1l1.6 1.4c.6.4 1.2.6 1.8.6s1.2-.2 1.8-.6L19.4 16c1.1-.7 2.4-1 3.6-1" />
  </svg>
);

const NetworkIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="10" y="3" width="4" height="4" rx="1" />
    <rect x="5" y="17" width="4" height="4" rx="1" />
    <rect x="15" y="17" width="4" height="4" rx="1" />
    <path d="M12 7v4" />
    <path d="M7 11h10" />
    <path d="M7 11v6" />
    <path d="M17 11v6" />
  </svg>
);

const SparkleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C12.5 7 17 11.5 24 12C17 12.5 12.5 17 12 24C11.5 17 7 12.5 0 12C7 11.5 11.5 7 12 0Z" />
  </svg>
);

// ----------------------------------------------------------------------
// DATA
// ----------------------------------------------------------------------
const endpoints = [150, 383.33, 616.66, 850];

const bottomNodesData = [
  {
    icon: Bot,
    title: "AI Agents",
    description: "Autonomous task delegation and execution."
  },
  {
    icon: Code2,
    title: "Edge Functions",
    description: "Low-latency serverless computation."
  },
  {
    icon: Box,
    title: "Realtime DB",
    description: "Instantaneous Postgres synchronization."
  },
  {
    icon: WavesIcon,
    title: "Streamed Data",
    description: "Lightning fast NDJSON payloads."
  }
];

// ----------------------------------------------------------------------
// SUB-COMPONENTS
// ----------------------------------------------------------------------
function BottomMorphNode({ x, delay, node }: { x: number; delay: number; node: typeof bottomNodesData[0] }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = node.icon;

  return (
    <foreignObject x={x - 100} y="250" width="200" height="160" className="overflow-visible">
      {/* Mount animation wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, type: "spring", stiffness: 200 }}
        className="w-full flex justify-center"
      >
        <motion.div
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
          layout
          initial={{ borderRadius: 32, width: 64, height: 64 }}
          animate={{
            borderRadius: isHovered ? 16 : 32,
            width: isHovered ? 172 : 64,
            height: isHovered ? 136 : 64, // Increased height to comfortably house text and preserve padding
          }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="flex flex-col items-center justify-start overflow-hidden border border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-xl hover:border-primary/50 dark:hover:border-primary/50 hover:bg-muted/50 dark:hover:bg-white/[0.08] hover:shadow-[0_0_24px_rgba(255,255,255,0.1)] transition-colors cursor-pointer group"
        >
          {/* Top fixed area containing the icon */}
          <motion.div layout className="flex items-center justify-center w-[64px] h-[64px] shrink-0">
            <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary dark:group-hover:text-white transition-colors duration-300" />
          </motion.div>
          
          {/* Expandable text area */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.15 } }}
                className="px-4 pb-5 text-center w-full"
              >
                <h4 className="text-sm font-bold text-foreground mb-1 whitespace-nowrap">{node.title}</h4>
                <p className="text-[10px] text-muted-foreground leading-tight">{node.description}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </foreignObject>
  );
}

// ----------------------------------------------------------------------
// MAIN COMPONENT
// ----------------------------------------------------------------------
export function IntegrationGraph() {
  const [isTopHovered, setIsTopHovered] = useState(false);

  return (
    <div className="relative w-full max-w-5xl mx-auto h-[320px] sm:h-[450px] select-none bg-card/30 dark:bg-black/40 backdrop-blur-xl border border-border/80 dark:border-white/5 rounded-lg shadow-xl p-4 sm:p-8">
      <svg viewBox="0 0 1000 400" className="w-full h-auto">
        
        {/* Main Central Trunk (Originates from bottom of top node container at Y=125) */}
        <line 
          x1="500" y1="125" 
          x2="500" y2="180" 
          stroke="currentColor" strokeWidth="1.5" 
          className="text-border dark:text-white/10"
        />
        
        {/* Horizontal Bus Line */}
        <line 
          x1={endpoints[0]} y1="180" 
          x2={endpoints[3]} y2="180" 
          stroke="currentColor" strokeWidth="1.5" 
          className="text-border dark:text-white/10"
        />

        {/* Vertical drops to Bottom Nodes */}
        {endpoints.map((x, i) => (
          <g key={`drop-${i}`}>
            {/* Connects with the top edge of bottom foreignObject circles at Y=250 */}
            <line 
              x1={x} 
              y1="180" 
              x2={x} 
              y2="250" 
              stroke="currentColor" strokeWidth="1.5" 
              className="text-border dark:text-white/10"
            />
          </g>
        ))}

       

        {/* --- TOP INTEGRATION NODE (MORPHING) --- */}
        <foreignObject x="300" y="0" width="400" height="125" className="overflow-visible">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative w-full h-full"
          >
            {/* Sits locked to the bottom boundary of the foreignObject container (Y=125) */}
            <motion.div
              onHoverStart={() => setIsTopHovered(true)}
              onHoverEnd={() => setIsTopHovered(false)}
              layout
              initial={{ borderRadius: 48, width: 260, height: 85 }}
              animate={{
                borderRadius: isTopHovered ? 24 : 48,
                width: isTopHovered ? 340 : 260,
                height: isTopHovered ? 135 : 85,
              }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 flex flex-col justify-start items-center overflow-hidden border border-border dark:border-white/10 bg-card/60 dark:bg-white/[0.03] backdrop-blur-xl shadow-2xl cursor-pointer group hover:border-primary/50 dark:hover:border-primary/50"
            >
              {/* Default Pill Header */}
              <motion.div layout className="flex items-center gap-4 sm:gap-5 px-3.5 h-[85px] w-[260px] shrink-0 justify-center">
                <div className="bg-[#F8F9FA] text-black w-12 h-12 rounded-md flex items-center justify-center shadow-[0_0_24px_rgba(255,255,255,0.25)] shrink-0">
                  <SparkleIcon />
                </div>
                
                <Plus className="text-muted-foreground/60 w-4.5 h-4.5 stroke-[3] shrink-0" />
                
                <div className="bg-muted dark:bg-[#111111]/90 border border-border dark:border-white/5 text-foreground/85 dark:text-white/90 w-12 h-12 rounded-md flex items-center justify-center shadow-inner shrink-0">
                  <NetworkIcon />
                </div>
              </motion.div>

              {/* Expanded Description */}
              <AnimatePresence>
                {isTopHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.15 } }}
                    className="px-6 pb-5 text-center w-full"
                  >
                    <h4 className="text-sm font-bold text-foreground mb-1">Orchestration Engine</h4>
                    
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        </foreignObject>

        {/* --- BOTTOM NODES (MOUNT & COHESIVE LAYOUT TRANSITIONS) --- */}
        {endpoints.map((x, i) => (
          <BottomMorphNode key={`node-${i}`} x={x} delay={1 + i * 0.1} node={bottomNodesData[i]} />
        ))}

      </svg>
    </div>
  );
}