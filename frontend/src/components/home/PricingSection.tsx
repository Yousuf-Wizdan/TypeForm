"use client";

import React from "react";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface PricingSectionProps {
  onSelectPlan: () => void;
}

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export const PricingSection: React.FC<PricingSectionProps> = ({
  onSelectPlan,
}) => {
  return (
    <section
      id="pricing"
      className="py-28 bg-[var(--background)] border-b border-[var(--border-default)]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-16">
        <motion.div {...fadeIn} className="space-y-4 max-w-[520px]">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.15]">
            Start for free,
            <br />
            scale as you grow
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed">
            No credit card required. All features included in the free tier.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-[960px]">
          {/* Free */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.05 }}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-8 flex flex-col justify-between space-y-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Free</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  For personal forms and quick surveys
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
                  $0
                </span>
                <span className="text-sm text-[var(--text-muted)]">/ month</span>
              </div>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                {[
                  "Unlimited forms & responses",
                  "All question types",
                  "Shareable public links",
                  "CSV data export",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check
                      className={`h-4 w-4 shrink-0 ${i < 3 ? "text-[var(--brand-primary)]" : "text-[var(--text-subtle)]"}`}
                      strokeWidth={2}
                    />
                    <span className={i >= 3 ? "text-[var(--text-muted)]" : ""}>
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={onSelectPlan}
              variant="outline"
              className="w-full rounded-xl font-semibold text-sm h-11"
            >
              Get started
            </Button>
          </motion.div>

          {/* Pro (highlighted) */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.1 }}
            className="relative rounded-2xl border-2 border-[var(--brand-primary)] bg-[var(--surface)] p-8 flex flex-col justify-between space-y-6 shadow-lg scale-[1.02] z-10"
            style={{
              boxShadow: "0 4px 32px rgba(124,92,252,0.1)",
            }}
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--brand-primary)] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white">
              Most popular
            </div>
            <div className="space-y-5 pt-2">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">Pro</h3>
                <p className="text-sm text-[var(--text-muted)]">
                  For teams and power users
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
                  $0
                </span>
                <span className="text-sm text-[var(--text-muted)]">/ demo</span>
              </div>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)] font-medium">
                {[
                  "Everything in Free",
                  "Conditional logic jumps",
                  "Real-time analytics & charts",
                  "Template library",
                  "Custom themes",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                      strokeWidth={2}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={onSelectPlan}
              className="w-full gap-2 rounded-xl font-semibold text-sm h-11"
            >
              Start building
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* Enterprise */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.15 }}
            className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-8 flex flex-col justify-between space-y-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
          >
            <div className="space-y-5">
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Enterprise
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  For large-scale deployments
                </p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
                  Custom
                </span>
              </div>
              <ul className="space-y-3 text-sm text-[var(--text-secondary)]">
                {[
                  "Custom API integrations",
                  "Dedicated backend",
                  "Custom domain support",
                  "Priority support",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <Check
                      className="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                      strokeWidth={2}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Button
              onClick={onSelectPlan}
              variant="outline"
              className="w-full rounded-xl font-semibold text-sm h-11"
            >
              Contact sales
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
