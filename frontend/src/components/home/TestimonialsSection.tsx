"use client";

import React from "react";
import { Star, TrendingUp, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";

const fadeIn = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
};

const TESTIMONIALS = [
  {
    quote:
      "Switching from Google Forms increased our survey completion rate by over 200% in the first week. The one-question-at-a-time experience makes a huge difference.",
    name: "Sarah Lin",
    role: "Head of Product, TechScale",
    initials: "SL",
  },
  {
    quote:
      "The conditional logic feature lets us route applicants to different paths without any developer help. It's been a game changer for our hiring pipeline.",
    name: "Marcus Rodriguez",
    role: "Talent Acquisition Lead",
    initials: "MR",
  },
  {
    quote:
      "Real-time charts and CSV export make post-event reporting effortless. Our team can see response data instantly without waiting for manual analysis.",
    name: "Elena Rostova",
    role: "Event Operations Director",
    initials: "EK",
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section
      id="testimonials"
      className="py-28 bg-[var(--background)] border-b border-[var(--border-subtle)]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-20">
        {/* Metrics */}
        <motion.div
          {...fadeIn}
          className="grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            {
              icon: TrendingUp,
              value: "3.5x",
              label: "Higher response completion",
            },
            { icon: Users, value: "10M+", label: "Responses collected" },
            { icon: Zap, value: "< 90s", label: "Average form setup time" },
          ].map((metric, i) => (
            <div
              key={i}
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-8 text-center transition-all duration-200 hover:border-[var(--border-strong)]"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
            >
              <div className="flex items-center justify-center gap-2 text-[40px] font-bold text-[var(--text-primary)] tracking-tight">
                <metric.icon className="h-7 w-7 text-[var(--text-muted)]" strokeWidth={1.5} />
                <span>{metric.value}</span>
              </div>
              <p className="text-sm font-medium text-[var(--text-muted)] mt-2">
                {metric.label}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="space-y-10">
          <motion.div {...fadeIn} className="space-y-4 max-w-[520px]">
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.15]">
              Loved by teams worldwide
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              See what product managers, recruiters, and event organizers say
              about building with Typeform Clone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                {...fadeIn}
                transition={{ ...fadeIn.transition, delay: i * 0.08 }}
                className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-7 flex flex-col justify-between space-y-5 transition-all duration-200 hover:border-[var(--border-strong)]"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star
                        key={j}
                        className="h-3.5 w-3.5 fill-[var(--brand-primary)] text-[var(--brand-primary)]"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <div className="h-9 w-9 rounded-full bg-[var(--surface-muted)] text-[var(--text-secondary)] flex items-center justify-center font-semibold text-xs">
                    {t.initials}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)]">
                      {t.name}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
