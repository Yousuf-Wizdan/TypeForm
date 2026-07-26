"use client";

import React, { useState } from "react";
import {
  MousePointerClick,
  Split,
  BarChart3,
  ArrowRight,
  Globe,
  Download,
  Palette,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

export const FeaturesGrid: React.FC = () => {
  const [activeLogicStep, setActiveLogicStep] = useState<"yes" | "no">("yes");

  return (
    <section
      id="features"
      className="py-28 bg-[var(--background)] border-b border-[var(--border-subtle)]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-20">
        {/* Header */}
        <motion.div {...fadeIn} className="max-w-[640px] space-y-4">
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.15]">
            Everything you need
            <br />
            to build better forms
          </h2>
          <p className="text-base text-[var(--text-muted)] leading-relaxed max-w-[480px]">
            A conversational form engine with focused builder, smart logic, and
            real-time analytics. All in one platform.
          </p>
        </motion.div>

        {/* Major feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.05 }}
            className="group rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-8 transition-all duration-200 hover:border-[var(--border-strong)] flex flex-col"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
          >
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                <MousePointerClick className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  One question at a time
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Respondents get one focused question per screen with smooth
                  animations and a progress indicator that boosts completion
                  rates.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-muted)] p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)]">
                <span>Question 2 of 4</span>
                <span className="text-[var(--text-primary)] font-semibold">50%</span>
              </div>
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                &ldquo;What feature matters most?&rdquo;
              </div>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg border-2 border-[var(--brand-primary)]/30 bg-[var(--brand-surface)] font-medium">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--brand-primary)] text-white text-[10px] font-bold">
                    A
                  </span>
                  <span>Conditional Logic</span>
                </div>
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg text-[var(--text-muted)]">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--surface-muted)] text-[10px] font-bold text-[var(--text-muted)]">
                    B
                  </span>
                  <span>Visual Analytics</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Card 2 */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.1 }}
            className="group rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-8 transition-all duration-200 hover:border-[var(--border-strong)] flex flex-col"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
          >
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                <Split className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Smart conditional logic
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  Branch form flows based on answers. Skip questions, jump to
                  sections, or end early. Every respondent gets a personalized
                  journey.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-muted)] p-4 space-y-3">
              <div className="text-[11px] font-medium text-[var(--text-muted)]">
                Logic preview
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  onClick={() => setActiveLogicStep("yes")}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-150 ${
                    activeLogicStep === "yes"
                      ? "bg-[var(--brand-primary)] text-white"
                      : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border-strong)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  IF &ldquo;Yes&rdquo;
                </button>
                <button
                  onClick={() => setActiveLogicStep("no")}
                  className={`flex-1 py-2 px-3 rounded-lg font-semibold transition-all duration-150 ${
                    activeLogicStep === "no"
                      ? "bg-[var(--brand-primary)] text-white"
                      : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border-strong)] hover:border-[var(--border-strong)]"
                  }`}
                >
                  IF &ldquo;No&rdquo;
                </button>
              </div>
              <div className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border-strong)] text-xs font-medium text-[var(--text-secondary)] flex items-center justify-between">
                <span>
                  {activeLogicStep === "yes"
                    ? "Jump to Q4: Enterprise Details"
                    : "Jump to Q5: General Feedback"}
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
            </div>
          </motion.div>

          {/* Card 3 */}
          <motion.div
            {...fadeIn}
            transition={{ ...fadeIn.transition, delay: 0.15 }}
            className="group rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-8 transition-all duration-200 hover:border-[var(--border-strong)] flex flex-col"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
          >
            <div className="space-y-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                <BarChart3 className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                  Real-time analytics
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  View response rates live, analyze choice distributions,
                  inspect individual submissions, and export data to CSV
                  anytime.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-xl border border-[var(--border-strong)] bg-[var(--surface-muted)] p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[var(--text-muted)]">Completion Rate</span>
                <span className="text-[var(--text-primary)]">94%</span>
              </div>
              <div className="space-y-3 text-xs font-medium">
                <div>
                  <div className="flex justify-between mb-1.5 text-[var(--text-muted)]">
                    <span>Product</span>
                    <span>68%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand-primary)] rounded-full"
                      style={{ width: "68%" }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1.5 text-[var(--text-muted)]">
                    <span>Services</span>
                    <span>32%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--border-strong)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--border-strong)] rounded-full"
                      style={{ width: "32%" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Secondary highlights */}
        <motion.div
          {...fadeIn}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Globe,
              title: "Instant shareable links",
              desc: "Publish forms to a public URL with one click. No authentication required to respond.",
            },
            {
              icon: Download,
              title: "CSV export",
              desc: "Export all responses to CSV with complete metadata and timestamps included.",
            },
            {
              icon: Palette,
              title: "Custom themes",
              desc: "Match your brand with custom colors, fonts, and theme support.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 p-6 rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] transition-all duration-200 hover:border-[var(--border-strong)]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)]">
                <item.icon className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                  {item.title}
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
