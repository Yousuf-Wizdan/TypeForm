"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUserId } from "@/lib/auth";
import { createForm, addQuestion } from "@/lib/api";
import { QuestionType } from "@/lib/types";
import {
  MessageSquare,
  Briefcase,
  Calendar,
  Users,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface TemplateItem {
  id: string;
  category: "feedback" | "hiring" | "events" | "leads";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  questionCount: number;
  questions: {
    type: QuestionType;
    title: string;
    properties?: any;
  }[];
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "t1",
    category: "feedback",
    title: "Product Feedback & NPS",
    description:
      "Measure satisfaction, gather feature requests, and collect customer insights.",
    icon: MessageSquare,
    questionCount: 4,
    questions: [
      {
        type: "rating",
        title: "How likely are you to recommend us?",
        properties: { rating_scale: 10 },
      },
      {
        type: "multiple_choice",
        title: "Which feature do you use most?",
        properties: {
          options: ["Dashboard", "Builder", "Analytics", "Exports"],
        },
      },
      {
        type: "rating",
        title: "How would you rate ease of use?",
        properties: { rating_scale: 5 },
      },
      {
        type: "long_text",
        title: "What is the biggest improvement we could make?",
      },
    ],
  },
  {
    id: "t2",
    category: "hiring",
    title: "Job Application Intake",
    description:
      "Screen candidates with contact info, experience, and availability questions.",
    icon: Briefcase,
    questionCount: 4,
    questions: [
      { type: "short_text", title: "What is your full name?" },
      { type: "email", title: "What is your email address?" },
      { type: "short_text", title: "Link to your portfolio or GitHub" },
      {
        type: "multiple_choice",
        title: "Preferred work setup?",
        properties: { options: ["Remote", "Hybrid", "On-site"] },
      },
    ],
  },
  {
    id: "t3",
    category: "events",
    title: "Event Registration",
    description:
      "Collect RSVPs, dietary preferences, and session selections for your event.",
    icon: Calendar,
    questionCount: 4,
    questions: [
      { type: "short_text", title: "Attendee Name" },
      { type: "email", title: "Work Email Address" },
      {
        type: "multiple_choice",
        title: "Which track will you attend?",
        properties: {
          options: ["AI & Engineering", "Design & UX", "Product & Business"],
        },
      },
      { type: "yes_no", title: "Will you join the networking dinner?" },
    ],
  },
  {
    id: "t4",
    category: "leads",
    title: "Lead Qualification",
    description:
      "Qualify inbound leads by company size, budget, timeline, and pain points.",
    icon: Users,
    questionCount: 4,
    questions: [
      { type: "short_text", title: "Company Name" },
      {
        type: "multiple_choice",
        title: "Team size?",
        properties: { options: ["1-10", "11-50", "51-200", "201+"] },
      },
      {
        type: "multiple_choice",
        title: "Budget range?",
        properties: {
          options: ["Under $5k", "$5k-$15k", "$15k-$50k", "$50k+"],
        },
      },
      { type: "long_text", title: "Describe your main objective" },
    ],
  },
];

const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "feedback", label: "Feedback" },
  { id: "hiring", label: "Hiring" },
  { id: "events", label: "Events" },
  { id: "leads", label: "Leads" },
];

export const TemplateGallery: React.FC = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(
    null
  );
  const currentUserId = useCurrentUserId();

  const filteredTemplates =
    activeCategory === "all"
      ? TEMPLATES
      : TEMPLATES.filter((t) => t.category === activeCategory);

  const handleSelectTemplate = async (template: TemplateItem) => {
    try {
      setLoadingTemplateId(template.id);
      const newForm = await createForm(
        template.title,
        template.description,
        currentUserId ?? "default_creator"
      );
      for (const q of template.questions) {
        await addQuestion(newForm.id, q.type, q.title, q.properties || {});
      }
      router.push(`/builder/${newForm.id}`);
    } catch (err) {
      console.error("Failed to apply template:", err);
    } finally {
      setLoadingTemplateId(null);
    }
  };

  return (
    <section
      id="templates"
      className="py-28 bg-[var(--background)] border-b border-[var(--border-default)]"
    >
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10 space-y-14">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4 max-w-[520px]"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[var(--text-primary)] tracking-[-0.02em] leading-[1.15]">
              Start with a template
            </h2>
            <p className="text-base text-[var(--text-muted)] leading-relaxed">
              Pre-built forms with questions and logic ready to use. Pick one
              and start collecting responses immediately.
            </p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border-default)] shadow-sm">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all duration-150 ${
                  activeCategory === cat.id
                    ? "bg-[#7c5cfc] text-white shadow-sm"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredTemplates.map((tpl, i) => {
            const IconComponent = tpl.icon;
            const isLoading = loadingTemplateId === tpl.id;

            return (
              <motion.div
                key={tpl.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="group rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-6 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-md flex flex-col justify-between"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
              >
                <div className="space-y-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)] group-hover:bg-[var(--brand-surface)] group-hover:text-[var(--brand-primary)] transition-colors duration-200">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                      {tpl.title}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-2">
                      {tpl.description}
                    </p>
                  </div>
                </div>

                <div className="pt-5 space-y-3">
                  <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
                    <span>{tpl.questionCount} questions</span>
                  </div>
                  <Button
                    onClick={() => handleSelectTemplate(tpl)}
                    disabled={isLoading || loadingTemplateId !== null}
                    variant="outline"
                    className="w-full gap-2 rounded-xl border-[var(--border-strong)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] font-semibold text-xs transition-all duration-200 h-10"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Use template
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
