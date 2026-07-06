// src/components/Footer.tsx
import { Github } from "lucide-react";
import { Logo } from "./Logo";
import { Separator } from "./ui/separator";

// Custom SVG replicas for X (Twitter) and Discord to match the reference exactly
const XIcon = () => (
  <svg className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const DiscordIcon = () => (
  <svg className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z"/>
  </svg>
);

export function Footer() {
  const productLinks = ["Features", "Integrations", "Pricing", "Changelog", "CLI"];
  const resourceLinks = ["Documentation", "Guides", "Blog", "Templates", "Community"];
  const companyLinks = ["About", "Careers", "Contact", "Partners", "Legal"];

  return (
    <footer className="border-t border-border/40 bg-muted/5 pt-12 pb-8 mt-12 relative z-10 text-left font-sans" dir="ltr">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Main Sleek Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-10">
          
          {/* Brand/Logo Section */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2">
              <Logo className="w-5 h-5 brightness-0 dark:invert" />
              <span className="font-bold text-sm text-foreground tracking-tight">Masar</span>
            </div>
            <p className="text-xs text-muted-foreground/80 font-normal max-w-xs leading-normal">
              The platform for autonomous task management. Plan, track, and secure a faster, more personalized workflow.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a href="#" aria-label="GitHub">
                <Github className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors" />
              </a>
              <a href="#" aria-label="X">
                <XIcon />
              </a>
              <a href="#" aria-label="Discord">
                <DiscordIcon />
              </a>
            </div>
          </div>

          {/* Links Column: Product */}
          <div className="md:col-span-2 col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Product</h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link}>
                  <a href="/pricing" className="text-xs text-muted-foreground/85 hover:text-foreground transition-colors font-medium">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Resources */}
          <div className="md:col-span-2 col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">Resources</h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-xs text-muted-foreground/85 hover:text-foreground transition-colors font-medium">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Company */}
          <div className="md:col-span-3 col-span-1">
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground/85 hover:text-foreground transition-colors font-medium">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Quiet Separator */}
        <Separator className="bg-border/30 mb-6" />

        {/* Bottom Metadata Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground/80 font-medium">
          <div>
            © 2026 Masar Inc. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}