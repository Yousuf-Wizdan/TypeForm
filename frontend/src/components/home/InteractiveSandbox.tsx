"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface InteractiveSandboxProps {
  onCompleteAction?: () => void;
}

const QUESTIONS = [
  { id: "q1", text: "What brings you here today?" },
  { id: "q2", text: "What's your email address?" },
  { id: "q3", text: "How did you hear about us?" },
];

const OPTIONS = [
  [
    "I need better surveys",
    "Collecting customer feedback",
    "Building a registration form",
  ],
  ["you@company.com"],
  ["Google search", "Social media", "Friend referral", "Other"],
];

export const InteractiveSandbox: React.FC<InteractiveSandboxProps> = ({
  onCompleteAction,
}) => {
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<string[]>([]);

  const handleSelect = (option: string) => {
    const newSelections = [...selections, option];
    setSelections(newSelections);
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setSelections([]);
  };

  const currentQuestion = QUESTIONS[step];
  const currentOptions = OPTIONS[step];

  return (
    <div className="w-full max-w-[480px] mx-auto">
      <motion.div
        layout
        className="rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] shadow-md overflow-hidden"
        style={{ boxShadow: "0 2px 24px rgba(0,0,0,0.04)" }}
      >
        {/* Progress bar */}
        <div className="h-1 w-full bg-[var(--surface-muted)]">
          <motion.div
            className="h-full bg-[var(--brand-primary)]"
            initial={{ width: 0 }}
            animate={{
              width: `${((step + 1) / QUESTIONS.length) * 100}%`,
            }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>

        {/* Question area */}
        <div className="p-8 space-y-6">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
            <span className="flex h-5 w-5 items-center justify-center rounded bg-[var(--surface-muted)] text-[10px] font-semibold text-[var(--text-muted)]">
              {step + 1}
            </span>
            Question {step + 1} of {QUESTIONS.length}
          </div>

          <motion.h3
            key={currentQuestion.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl font-bold text-[var(--text-primary)] leading-tight"
          >
            {currentQuestion.text}
          </motion.h3>

          <div className="space-y-3">
            {currentOptions.map((option, i) => (
              <motion.button
                key={`${step}-${i}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.25,
                  delay: i * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-5 py-4 rounded-xl border-2 text-[15px] font-medium transition-all duration-200 ${
                  selections[step] === option
                    ? "border-[var(--brand-primary)] bg-[var(--brand-surface)] text-[var(--text-primary)]"
                    : "border-[var(--border-strong)] hover:border-[var(--border-strong)] hover:bg-[var(--surface-muted)] text-[var(--text-secondary)]"
                }`}
              >
                <span className="flex items-center gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                      selections[step] === option
                        ? "bg-[var(--brand-primary)] text-white"
                        : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  {selections[step] === option && step < QUESTIONS.length - 1
                    ? `${option}`
                    : option}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-[var(--surface-muted)] px-8 py-4">
          <div className="flex items-center gap-1.5">
            {QUESTIONS.map((q, i) => (
              <span
                key={q.id}
                className={`h-2 w-2 rounded-full transition-colors duration-200 ${
                  i <= step ? "bg-[var(--brand-primary)]" : "bg-[var(--border-strong)]"
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={handleReset}
                className="text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors px-3 py-1.5"
              >
                Reset
              </button>
            )}
            {onCompleteAction && (
              <Button
                onClick={onCompleteAction}
                size="sm"
                className="gap-1.5 text-xs font-semibold rounded-xl h-9"
              >
                Try it free
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
