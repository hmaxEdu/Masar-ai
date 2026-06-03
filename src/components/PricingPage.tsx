// src/components/PricingPage.tsx
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, HelpCircle, Minus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, lazy, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Footer } from "./Footer";
import { LandingHeader } from "./LandingHeader";

const WebGLBackground = lazy(() => import("./WebGLBackground"));

interface Plan {
  name: string;
  priceMonthly: number;
  priceAnnually: number;
  description: string;
  badge?: string;
  ctaText: string;
  ctaVariant: "default" | "secondary" | "outline";
  features: string[];
}

const plans: Plan[] = [
  {
    name: "Hobby",
    priceMonthly: 0,
    priceAnnually: 0,
    description: "Perfect for individuals looking to organize tasks with lightweight AI assistance.",
    ctaText: "Get Started Free",
    ctaVariant: "outline",
    features: [
      "1 Workspace",
      "Up to 3 Active Projects",
      "100 AI Task breakdowns / month",
      "Standard Board & List views",
      "Symmetrical Dependency tracking",
      "Local IndexedDB database backup",
    ],
  },
  {
    name: "Pro",
    priceMonthly: 15,
    priceAnnually: 12,
    description: "For high-performing teams automating workflows with multi-agent orchestration.",
    badge: "Most Popular",
    ctaText: "Start 14-Day Free Trial",
    ctaVariant: "default",
    features: [
      "Infinite Workspaces & Projects",
      "Unlimited Multi-agent Chat access",
      "Automatic circular dependency prevention",
      "Real-time PostgreSQL sync (Supabase)",
      "Multi-dimensional project analytics",
      "Priority customer support",
    ],
  },
  {
    name: "Enterprise",
    priceMonthly: 49,
    priceAnnually: 39,
    description: "For secure, large-scale organizations demanding custom guardrails.",
    ctaText: "Contact Sales",
    ctaVariant: "secondary",
    features: [
      "Everything in Pro Plan",
      "Dedicated, isolated edge functions",
      "Bring-Your-Own-Key LLM configurations",
      "SSO / SAML & strict team roles",
      "Custom SLA & dedicated technical manager",
      "Custom on-prem database deployment",
    ],
  },
];

const faqs = [
  {
    question: "What is an AI Orchestration action?",
    answer: "An action is counted whenever our multi-agent assistant performs an automated update, breaks down high-level tasks into subtasks, or executes a tool call (such as assigning, rescheduling, or planning dependencies) on your behalf.",
  },
  {
    question: "Can I cancel or change plans at any time?",
    answer: "Absolutely. You can upgrade, downgrade, or cancel your plan at any time directly through your billing portal. If you cancel an annual plan, you will maintain access until the end of your billing cycle.",
  },
  {
    question: "Do you offer discounts for educational or non-profit organizations?",
    answer: "Yes, we offer up to 50% discount on our Pro plans for verified educational institutions, students, and registered non-profit organizations. Reach out to support to learn more.",
  },
  {
    question: "How secure is our project metadata?",
    answer: "Your security is our priority. Masar leverages Enterprise-grade Supabase configurations combined with row-level security (RLS) schemas. We do not use your proprietary project data or metadata to train public LLM models.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const navigate = useNavigate();

  const handleCta = (plan: Plan) => {
    if (plan.name === "Enterprise") {
      window.location.href = "mailto:sales@masar.ai?subject=Enterprise Inquiry";
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/30 font-sans relative" dir="ltr">
      
      {/* High-Fidelity Animated Background */}
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      {/* Reusable Landing Header */}
      <LandingHeader
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate("/login")}
      />

      <main className="pt-32 sm:pt-40 pb-24 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* --- HEADER SECTION --- */}
        <section className="text-center space-y-4 mb-16">
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tighter leading-none text-foreground">
            Simple, transparent pricing.
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto font-medium">
            Deploy Masar across your teams. No hidden overheads, no credit card required to start organizing with AI.
          </p>

          {/* Billing Switcher */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-12 h-6 bg-muted border border-border/80 rounded-full flex items-center p-1 transition-colors focus:outline-none"
              aria-label="Toggle Billing Interval"
            >
              <motion.div
                layout
                className="w-4 h-4 bg-primary rounded-full shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                animate={{ x: isAnnual ? 24 : 0 }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annually 
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold">
                Save 20%
              </span>
            </span>
          </div>
        </section>

        {/* --- PRICING CARDS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
            const isPro = plan.name === "Pro";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`relative flex flex-col justify-between rounded-lg border p-8 bg-card/40 backdrop-blur-xl transition-all duration-300 ${
                  isPro
                    ? "border-primary shadow-xl shadow-primary/5 md:scale-105 z-10"
                    : "border-border/60 hover:border-border hover:bg-card/60"
                }`}
              >
                {/* Most Popular Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest px-4 py-1 rounded-full shadow-lg shadow-primary/20">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan Name & Desc */}
                  <div>
                    <h3 className="text-xl font-bold tracking-tight text-foreground">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-foreground">
                      ${price}
                    </span>
                    <span className="text-sm font-semibold text-muted-foreground">
                      / month
                    </span>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleCta(plan)}
                    variant={plan.ctaVariant}
                    className={`w-full h-11 font-bold rounded-md transition-transform active:scale-[0.98] ${
                      isPro ? "shadow-lg shadow-primary/25" : ""
                    }`}
                  >
                    {plan.ctaText}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  {/* Feature Lists */}
                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                      What's Included
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-xs font-medium">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-foreground/80 leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </section>

        {/* --- PLAN COMPARISON MATRIX --- */}
        <section className="mb-24 hidden md:block">
          <h2 className="text-2xl font-bold text-center tracking-tight mb-12">Compare All Features</h2>
          <div className="border border-border/60 rounded-2xl overflow-hidden bg-card/30 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/40 bg-muted/20">
                  <th className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-bold">Feature</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-bold">Hobby</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-bold">Pro</th>
                  <th className="p-4 text-xs uppercase tracking-wider text-muted-foreground font-bold">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-sm font-medium">
                <tr>
                  <td className="p-4">Active Workspaces</td>
                  <td className="p-4 text-muted-foreground">1</td>
                  <td className="p-4 text-foreground">Unlimited</td>
                  <td className="p-4 text-foreground">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4">Collaborative Members</td>
                  <td className="p-4 text-muted-foreground">Solo</td>
                  <td className="p-4 text-foreground">Unlimited</td>
                  <td className="p-4 text-foreground">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4">AI Task Breakdown</td>
                  <td className="p-4 text-muted-foreground">100 / month</td>
                  <td className="p-4 text-foreground">Unlimited</td>
                  <td className="p-4 text-foreground">Unlimited</td>
                </tr>
                <tr>
                  <td className="p-4">Dependency Graphs</td>
                  <td className="p-4 text-muted-foreground">Standard</td>
                  <td className="p-4 text-foreground">Symmetrical Propagation</td>
                  <td className="p-4 text-foreground">Symmetrical Propagation</td>
                </tr>
                <tr>
                  <td className="p-4">Custom Model Integration</td>
                  <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                  <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                  <td className="p-4 text-primary font-bold">Bring-Your-Own-Key</td>
                </tr>
                <tr>
                  <td className="p-4">SSO / SAML Logins</td>
                  <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                  <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                  <td className="p-4 text-foreground">Yes</td>
                </tr>
                <tr>
                  <td className="p-4">Support SLA</td>
                  <td className="p-4 text-muted-foreground">Standard Support</td>
                  <td className="p-4 text-foreground">Priority (24h)</td>
                  <td className="p-4 text-primary font-bold">Dedicated Manager (4h)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-center mb-8 flex items-center justify-center gap-2">
            <HelpCircle className="h-6 w-6 text-primary" /> FAQ
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-border/60 rounded-xl overflow-hidden bg-card/25 backdrop-blur-md">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base focus:outline-none transition-colors hover:bg-muted/30"
                  >
                    <span>{faq.question}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-border/40"
                      >
                        <p className="p-5 text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}

// ----------------------------------------------------------------------
// SUB-ACCORDION CHEVRON HELPER
// ----------------------------------------------------------------------
function ChevronDown({ className, ...props }: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className={className}
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}