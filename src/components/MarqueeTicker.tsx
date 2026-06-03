// src/components/MarqueeTicker.tsx
import { motion } from "motion/react";

// Static PNG asset imports
import nokiaLogo from "@/assets/logos/nokia-com-wordmark.png";
import reactLogo from "@/assets/logos/react-dev-logo.png";
import samsungLogo from "@/assets/logos/samsung-com-wordmark.png";
import supabaseLogo from "@/assets/logos/supabase-com-wordmark.png";
import vercelLogo from "@/assets/logos/vercel-com-wordmark.png";
import githubLogo from "@/assets/logos/github-com-wordmark.png";
import hpLogo from "@/assets/logos/hp-com-wordmark.png";

export function MarqueeTicker() {
  const items = [
    { src: reactLogo, alt: "React" },
    { src: supabaseLogo, alt: "Supabase" },
    { src: vercelLogo, alt: "Vercel" },
    { src: samsungLogo, alt: "Samsung" },
    { src: nokiaLogo, alt: "Nokia" },
    { src: githubLogo, alt: "Github" },
    { src: hpLogo, alt: "HP" },

  ];

  return (
    <div className="w-full overflow-hidden flex py-8 relative z-10 border-y border-border/40 bg-muted/10 backdrop-blur-md mt-24">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        className="flex whitespace-nowrap gap-16 px-6"
      >
        {/* Tripled list ensures seamless looping on ultra-wide screens */}
        {[...items, ...items, ...items].map((item, i) => (
          <div 
            key={i} 
            className="flex items-center gap-3 shrink-0"
          >
            <img
              src={item.src}
              alt={item.alt}
              className="h-6 sm:h-7 w-auto object-contain brightness-0 dark:invert opacity-60 hover:opacity-100 transition-opacity duration-300"
              draggable="false"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}