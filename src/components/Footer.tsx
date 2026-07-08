// src/components/Footer.tsx
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { Logo } from "./Logo";
import { Separator } from "./ui/separator";

// Custom SVG replicas for X (Twitter) and LinkedIn
const XIcon = () => (
  <svg
    className="w-3.5 h-3.5 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors cursor-pointer"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

export function Footer() {
  function handleLinkClick() {
    window.scrollTo(0, 0);
  }

  // FIX: Helper to handle placeholder links without anchor jumping
  function handlePlaceholderClick(e: React.MouseEvent) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const productLinks = [
    { label: "Features", path: "/features" },
    { label: "Integrations", path: "/integrations" },
    { label: "Security", path: "/security" },
    { label: "Pricing", path: "/pricing" },
  ];

  const solutionsLinks = [
    { label: "Marketing Teams", path: "/marketing-teams" },
    { label: "Engineering", path: "/engineering" },
    { label: "Enterprise", path: "/enterprise" },
  ];

  const resourceLinks = [
    {
      label: "GitHub Codebase",
      path: "https://github.com/hmaxEdu/Masar-ai",
      isExternal: true,
    },
    {
      label: "Developer Profile",
      path: "https://github.com/hmaxEdu",
      isExternal: true,
    },
    {
      label: "Contact Developer",
      path: "https://www.linkedin.com/in/albaraa-qajjah-1b5030271",
      isExternal: true,
    },
  ];

  return (
    <footer
      className="border-t border-border/40 bg-muted/5 pt-12 pb-8 mt-12 relative z-10 text-left font-sans"
      dir="ltr"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 mb-10">
          {/* Brand/Logo Section */}
          <div className="md:col-span-5 space-y-4">
            <Link to="/" onClick={handleLinkClick} className="flex items-center gap-2 w-fit">
              <Logo className="w-5 h-5 brightness-0 dark:invert" />
              <span className="font-bold text-sm text-foreground tracking-tight">
                Masar
              </span>
            </Link>
            <p className="text-xs text-muted-foreground/80 font-normal max-w-xs leading-normal">
              The platform for autonomous task management. Plan, track, and
              secure a faster, more personalized workflow.
            </p>
            <div className="flex items-center gap-4 pt-1">
              <a
                href="https://github.com/hmaxEdu/Masar-ai"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4 text-muted-foreground/60 hover:text-foreground transition-colors" />
              </a>
              <button aria-label="X" onClick={handlePlaceholderClick}>
                <XIcon />
              </button>
              <a
                href="https://www.linkedin.com/in/albaraa-qajjah-1b5030271"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
            </div>
          </div>

          {/* Links Column: Product */}
          <div className="md:col-span-2 col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">
              Product
            </h4>
            <ul className="space-y-2">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    onClick={handleLinkClick}
                    className="text-xs text-muted-foreground/85 hover:text-foreground transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Solutions */}
          <div className="md:col-span-2 col-span-1">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-3">
              Solutions
            </h4>
            <ul className="space-y-2">
              {solutionsLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    onClick={handleLinkClick}
                    className="text-xs text-muted-foreground/85 hover:text-foreground transition-colors font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column: Resources */}
          <div className="md:col-span-3 col-span-1">
            <h4 className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground/60 mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground/85 hover:text-foreground transition-colors font-medium"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={handleLinkClick}
                      className="text-xs text-muted-foreground/85 hover:text-foreground transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Quiet Separator */}
        <Separator className="bg-border/30 mb-6" />

        {/* Bottom Metadata Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-muted-foreground/80 font-medium">
          <div>© 2026 Masar Inc. All rights reserved.</div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <button onClick={handlePlaceholderClick} className="hover:text-foreground transition-colors">
              Privacy Policy
            </button>
            <button onClick={handlePlaceholderClick} className="hover:text-foreground transition-colors">
              Terms of Service
            </button>
            <button onClick={handlePlaceholderClick} className="hover:text-foreground transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}