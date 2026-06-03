// src/components/LandingHeader.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X, Globe, Laptop, HelpCircle, Code, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { ModeToggle } from "./mode-toggle";

export interface DropdownItem {
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  href: string;
}

export interface NavItem {
  label: string;
  href?: string;
  dropdownItems?: DropdownItem[];
}

interface LandingHeaderProps {
  onLoginClick: () => void;
  onSignUpClick: () => void;
  onDemoClick?: () => void;
  navItems?: NavItem[];
}

const defaultNavItems: NavItem[] = [
  {
    label: "Product",
    dropdownItems: [
      { label: "Features", description: "Explore task automation & tracking", icon: Laptop, href: "#" },
      { label: "Integrations", description: "Connect with Slack, Github, & more", icon: Code, href: "#" },
      { label: "Security", description: "Enterprise-grade data protection", icon: Shield, href: "#" },
    ],
  },
  {
    label: "Solutions",
    dropdownItems: [
      { label: "Marketing Teams", description: "Coordinate campaigns", icon: Globe, href: "#" },
      { label: "Engineering", description: "Sprint boards & backlog managers", icon: Code, href: "#" },
      { label: "Product Management", description: "Roadmaps & feature specs", icon: Laptop, href: "#" },
    ],
  },
  {
    label: "Learn",
    dropdownItems: [
      { label: "Documentation", description: "Guides & setup documentation", icon: HelpCircle, href: "#" },
      { label: "Community", description: "Join our active community", icon: Globe, href: "#" },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  { label: "Enterprise", href: "#" },
];

export function LandingHeader({
  onLoginClick,
  onSignUpClick,
  onDemoClick = () => alert("Demo Scheduled!"),
  navItems = defaultNavItems,
}: LandingHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* --- LEFT SECTION: Grouping Logo & Desktop Navigation closer together --- */}
          <div className="flex items-center gap-12">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 shrink-0">
              <Logo className="w-9 h-9 brightness-0 dark:invert" />
              <span className="font-bold text-xl tracking-tight text-foreground hidden sm:block">
                Masar
              </span>
            </Link>

            {/* Desktop Navigation Links (Grouped next to Logo) */}
            <div className="hidden lg:flex items-center gap-6">
              {navItems.map((item, idx) => {
                if (item.dropdownItems) {
                  return (
                    <div key={idx} className="relative group py-4">
                      {/* Trigger */}
                      <button className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                        {item.label}
                        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180" />
                      </button>

                      {/* Dropdown Panel */}
                      <div className="absolute top-full left-0 w-64 pt-2 z-50 invisible opacity-0 group-hover:visible group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 pointer-events-none group-hover:pointer-events-auto">
                        <div className="rounded-sm border border-border bg-card backdrop-blur-md p-3 shadow-lg flex flex-col gap-1">
                          {item.dropdownItems.map((subItem, subIdx) => {
                            const Icon = subItem.icon;
                            return (
                              <a
                                key={subIdx}
                                href={subItem.href}
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/80 transition-colors group/item"
                              >
                                {Icon && (
                                  <div className="mt-0.5 p-1 rounded bg-primary/10 text-primary group-hover/item:bg-primary group-hover/item:text-primary-foreground transition-colors">
                                    <Icon className="h-3.5 w-3.5" />
                                  </div>
                                )}
                                <div className="flex flex-col text-left">
                                  <span className="text-xs font-bold text-foreground">
                                    {subItem.label}
                                  </span>
                                  {subItem.description && (
                                    <span className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                                      {subItem.description}
                                    </span>
                                  )}
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                }

                // Normal link
                return (
                  <a
                    key={idx}
                    href={item.href || "#"}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-4"
                  >
                    {item.label}
                  </a>
                );
              })}
            </div>
          </div>

          {/* --- RIGHT SECTION: CTAs (Desktop) & Mobile Menu Toggle --- */}
          <div className="flex items-center gap-5">
            {/* Desktop Action Items */}
            <div className="hidden lg:flex items-center gap-5">
              <ModeToggle />
              <button
                onClick={onDemoClick}
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Get a Demo
              </button>
              <Button
                variant="secondary"
                className="h-9 px-4 font-semibold text-sm cursor-pointer"
                onClick={onLoginClick}
              >
                Login
              </Button>
              <Button
                className="h-9 px-4 font-bold text-sm shadow-md shadow-primary/20 cursor-pointer"
                onClick={onSignUpClick}
              >
                Sign Up
              </Button>
            </div>

            {/* Mobile Actions Menu Trigger */}
            <div className="lg:hidden flex items-center gap-3">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

        </div>
      </div>

      {/* --- MOBILE DRAWER --- */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border/40 bg-background/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-3">
          {navItems.map((item, idx) => (
            <div key={idx} className="space-y-1.5">
              <div className="text-sm font-bold text-foreground/80 px-2">
                {item.label}
              </div>
              {item.dropdownItems && (
                <div className="pl-4 space-y-1">
                  {item.dropdownItems.map((subItem, subIdx) => (
                    <a
                      key={subIdx}
                      href={subItem.href}
                      className="block text-xs font-semibold text-muted-foreground hover:text-foreground py-1 px-2 rounded-md hover:bg-muted/50"
                    >
                      {subItem.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 border-t border-border/40 flex flex-col gap-3">
            <Button variant="ghost" className="w-full text-left justify-start" onClick={onDemoClick}>
              Get a Demo
            </Button>
            <Button variant="outline" className="w-full" onClick={onLoginClick}>
              Login
            </Button>
            <Button className="w-full" onClick={onSignUpClick}>
              Sign Up
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}