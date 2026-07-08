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

function ChevronDownIcon({ className, ...props }: any) {
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
    <div className="min-h-screen text-foreground bg-background overflow-x-hidden selection:bg-primary/20 font-sans relative" dir="ltr">
      
      <Suspense fallback={null}>
        <WebGLBackground />
      </Suspense>

      <LandingHeader
        onLoginClick={() => navigate("/login")}
        onSignUpClick={() => navigate("/login")}
      />

      <main className="pt-24 sm:pt-28 pb-16 relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* --- HEADER SECTION --- */}
        <section className="text-center space-y-3 mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-foreground">
            Simple, transparent pricing.
          </h1>
          <p className="text-muted-foreground text-sm max-w-xl mx-auto leading-relaxed">
            Deploy Masar across your teams. No hidden overheads, no credit card required to start organizing with AI.
          </p>

          <div className="flex items-center justify-center gap-2.5 pt-4">
            <span className={`text-sm font-semibold transition-colors ${!isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative w-10 h-5 bg-muted border border-border/60 rounded-full flex items-center p-0.5 transition-colors focus:outline-none"
              aria-label="Toggle Billing Interval"
            >
              <motion.div
                layout
                className="w-3.5 h-3.5 bg-primary rounded-full shadow-2xs"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                animate={{ x: isAnnual ? 20 : 0 }}
              />
            </button>
            <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${isAnnual ? "text-foreground" : "text-muted-foreground"}`}>
              Annually 
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Save 20%
              </span>
            </span>
          </div>
        </section>

        {/* --- PRICING CARDS --- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.priceAnnually : plan.priceMonthly;
            const isPro = plan.name === "Pro";

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                className={`relative flex flex-col justify-between rounded-lg border p-6 bg-card/85 backdrop-blur-md transition-all duration-300 ${
                  isPro
                    ? "border-primary shadow-lg shadow-primary/5 md:scale-[1.03] z-10"
                    : "border-border/60 hover:border-border hover:bg-card/65"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-bold tracking-widest px-3 py-0.5 rounded-full shadow-md shadow-primary/20">
                    {plan.badge}
                  </div>
                )}

                <div className="space-y-5">
                  <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground/80 mt-1 leading-normal min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-foreground">
                      ${price}
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      / month
                    </span>
                  </div>

                  <Button
                    onClick={() => handleCta(plan)}
                    variant={plan.ctaVariant}
                    className={`w-full h-10 text-sm font-bold rounded-md transition-transform active:scale-[0.98] ${
                      isPro ? "shadow-md shadow-primary/20" : ""
                    }`}
                  >
                    {plan.ctaText}
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Button>

                  <div className="space-y-3 pt-4 border-t border-border/40">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/60">
                      What's Included
                    </span>
                    <ul className="space-y-2.5">
                      {plan.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5 text-sm font-medium">
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
        {/* FIX: Removed 'hidden md:block', added overflow-x-auto for mobile users */}
        <section className="mb-20">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 text-center mb-8">Compare All Features</h2>
          <div className="w-full overflow-x-auto pb-4">
            <div className="border border-border/40 rounded-xl overflow-hidden bg-card/25 backdrop-blur-md min-w-[700px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/30 bg-muted/15">
                    <th className="p-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold w-1/4">Feature</th>
                    <th className="p-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold w-1/4">Hobby</th>
                    <th className="p-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold w-1/4">Pro</th>
                    <th className="p-4 text-[11px] uppercase tracking-wider text-muted-foreground/60 font-bold w-1/4">Enterprise</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20 text-sm font-medium">
                  <tr>
                    <td className="p-4 text-foreground/90">Active Workspaces</td>
                    <td className="p-4 text-muted-foreground">1</td>
                    <td className="p-4 text-foreground">Unlimited</td>
                    <td className="p-4 text-foreground">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground/90">Collaborative Members</td>
                    <td className="p-4 text-muted-foreground">Solo</td>
                    <td className="p-4 text-foreground">Unlimited</td>
                    <td className="p-4 text-foreground">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground/90">AI Task Breakdown</td>
                    <td className="p-4 text-muted-foreground">100 / month</td>
                    <td className="p-4 text-foreground">Unlimited</td>
                    <td className="p-4 text-foreground">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground/90">Dependency Graphs</td>
                    <td className="p-4 text-muted-foreground">Standard</td>
                    <td className="p-4 text-foreground">Symmetrical</td>
                    <td className="p-4 text-foreground">Symmetrical</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground/90">Custom Model integration</td>
                    <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                    <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                    <td className="p-4 text-primary font-bold">Bring-Your-Own-Key</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground/90">SSO / SAML Logins</td>
                    <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                    <td className="p-4 text-muted-foreground"><Minus className="h-4 w-4 text-muted-foreground/30" /></td>
                    <td className="p-4 text-foreground/90">Yes</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-foreground/90">Support SLA</td>
                    <td className="p-4 text-muted-foreground">Standard</td>
                    <td className="p-4 text-foreground">Priority (24h)</td>
                    <td className="p-4 text-primary font-bold">Dedicated Manager (4h)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* --- FAQ SECTION --- */}
        <section className="max-w-2xl mx-auto mb-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground/60 text-center mb-6 flex items-center justify-center gap-1.5">
            <HelpCircle className="h-4 w-4 text-primary" /> FAQ
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="border border-border/40 rounded-lg overflow-hidden bg-card/15 backdrop-blur-md">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-sm focus:outline-none transition-colors hover:bg-muted/15"
                  >
                    <span>{faq.question}</span>
                    <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDownIcon className="h-4 w-4 text-muted-foreground/80" />
                    </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden border-t border-border/30"
                      >
                        <p className="p-4 text-sm text-muted-foreground/85 leading-relaxed font-normal">
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

      <Footer />
    </div>
  );
}