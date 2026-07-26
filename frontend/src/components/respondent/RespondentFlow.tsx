"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { PublicForm, Question } from "@/lib/types";
import { submitPublicResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { TypewriterText } from "@/components/respondent/TypewriterText";
import {
  ChevronUp,
  ChevronDown,
  Check,
  Smile,
  AlertCircle,
  Upload,
  ArrowRight,
  CornerDownLeft
} from "lucide-react";

interface RespondentFlowProps {
  form: PublicForm;
}

export const RespondentFlow: React.FC<RespondentFlowProps> = ({ form }) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<"down" | "up">("down");
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const answersRef = useRef<Record<string, any>>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [startTime] = useState<number>(Date.now());

  const questions = form.questions || [];
  const totalSteps = questions.length;
  const currentStep = showWelcome ? 0 : currentIndex + 1;
  const currentQuestion: Question | undefined = questions[currentIndex];
  const theme = form.theme || {
    primary_color: "#0284c7",
    background_color: "#ffffff",
    text_color: "#18181b",
    accent_color: "#0284c7"
  };

  const inputRef = useRef<any>(null);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    setErrorMsg(null);
    if (inputRef.current && !showWelcome) {
      setTimeout(() => inputRef.current?.focus?.(), 150);
    }
  }, [currentIndex, showWelcome]);

  const getNextIndex = useCallback((overrideAnswer?: any): number => {
    if (!currentQuestion) return currentIndex + 1;
    const currentVal = overrideAnswer !== undefined
      ? overrideAnswer
      : answersRef.current[currentQuestion.id];

    if (currentQuestion.logic && currentQuestion.logic.length > 0) {
      for (const rule of currentQuestion.logic) {
        let matched = false;
        const valStr = String(currentVal ?? "").trim();
        const ruleVal = String(rule.value ?? "").trim();

        switch (rule.condition) {
          case "equals":
            matched = valStr.toLowerCase() === ruleVal.toLowerCase();
            break;
          case "not_equals":
            matched = valStr.toLowerCase() !== ruleVal.toLowerCase();
            break;
          case "contains":
            matched = valStr.toLowerCase().includes(ruleVal.toLowerCase());
            break;
          case "greater_than": {
            const num = parseFloat(valStr);
            const threshold = parseFloat(ruleVal);
            matched = !isNaN(num) && !isNaN(threshold) && num > threshold;
            break;
          }
          case "less_than": {
            const num = parseFloat(valStr);
            const threshold = parseFloat(ruleVal);
            matched = !isNaN(num) && !isNaN(threshold) && num < threshold;
            break;
          }
          case "is_filled":
            matched = Boolean(currentVal) && valStr.length > 0;
            break;
        }

        if (matched) {
          if (rule.destination_question_id === "thank_you") {
            return totalSteps;
          }
          const targetIdx = questions.findIndex((q) => q.id === rule.destination_question_id);
          if (targetIdx !== -1) return targetIdx;
        }
      }
    }

    return currentIndex + 1;
  }, [currentQuestion, currentIndex, totalSteps, questions]);

  const validateCurrentQuestion = (): boolean => {
    if (!currentQuestion) return true;
    const val = answers[currentQuestion.id];

    if (currentQuestion.required) {
      if (val === undefined || val === null || val === "" || (Array.isArray(val) && val.length === 0)) {
        setErrorMsg("Please fill out this field to continue.");
        return false;
      }
    }

    if (val && currentQuestion.type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(val))) {
        setErrorMsg("Please enter a valid email address.");
        return false;
      }
    }

    setErrorMsg(null);
    return true;
  };

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const completionTimeSeconds = Math.round((Date.now() - startTime) / 1000);
      const payloadAnswers = Object.entries(answersRef.current).map(([qId, val]) => ({
        question_id: qId,
        answer_value: val
      }));

      await submitPublicResponse(form.share_id, {
        completion_time_seconds: completionTimeSeconds,
        answers: payloadAnswers
      });

      setIsCompleted(true);
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (err: any) {
      setSubmitError(err?.response?.data?.detail || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, startTime, form.share_id]);

  const handleNext = useCallback((overrideAnswer?: any) => {
    if (overrideAnswer === undefined) {
      if (!validateCurrentQuestion()) return;
    } else if (currentQuestion) {
      answersRef.current = { ...answersRef.current, [currentQuestion.id]: overrideAnswer };
    }

    const nextIdx = getNextIndex(overrideAnswer);
    if (nextIdx >= totalSteps) {
      handleSubmit();
    } else {
      setDirection("down");
      setCurrentIndex(nextIdx);
    }
  }, [validateCurrentQuestion, getNextIndex, totalSteps, currentQuestion, handleSubmit]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setDirection("up");
      setCurrentIndex(currentIndex - 1);
    }
  }, [currentIndex]);

  const navRef = useRef<{ handleNext: (oa?: any) => void; handlePrev: () => void }>({
    handleNext,
    handlePrev
  });
  const currentQuestionRef = useRef<Question | undefined>(undefined);

  useEffect(() => {
    navRef.current = { handleNext, handlePrev };
    currentQuestionRef.current = currentQuestion;
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showWelcome || isCompleted || isSubmitting) return;

      const q = currentQuestionRef.current;

      if (e.key === "Enter" && !e.shiftKey && q?.type !== "long_text") {
        e.preventDefault();
        navRef.current.handleNext();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        navRef.current.handleNext();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        navRef.current.handlePrev();
      }

      if (q?.type === "multiple_choice") {
        const charCode = e.key.toUpperCase().charCodeAt(0);
        if (e.key.length === 1 && charCode >= 65 && charCode <= 90) {
          const optIdx = charCode - 65;
          const options = q.properties.options || [];
          if (optIdx >= 0 && optIdx < options.length) {
            e.preventDefault();
            setAnswers((prev) => ({ ...prev, [q.id]: options[optIdx] }));
          }
        }
      }

      if (q?.type === "rating") {
        const num = parseInt(e.key, 10);
        const maxScale = q.properties.rating_scale || 5;
        if (!isNaN(num) && num >= 1 && num <= maxScale) {
          e.preventDefault();
          setAnswers((prev) => ({ ...prev, [q.id]: num }));
        }
      }

      if (q?.type === "yes_no") {
        if (e.key.toUpperCase() === "Y") {
          e.preventDefault();
          setAnswers((prev) => ({ ...prev, [q.id]: "Yes" }));
        } else if (e.key.toUpperCase() === "N") {
          e.preventDefault();
          setAnswers((prev) => ({ ...prev, [q.id]: "No" }));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showWelcome, isCompleted, isSubmitting]);

  // Welcome Screen
  if (showWelcome) {
    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 sm:p-12 text-center"
        style={{ backgroundColor: theme.background_color, color: theme.text_color }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${theme.primary_color}15` }}
          >
            <Smile className="h-10 w-10" style={{ color: theme.primary_color }} strokeWidth={1.5} />
          </motion.div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight leading-[1.15]">
              {form.title}
            </h1>
            {form.description && (
              <p className="text-base sm:text-lg leading-relaxed max-w-md mx-auto" style={{ opacity: 0.7 }}>
                {form.description}
              </p>
            )}
          </div>

          {questions.length > 0 && (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              onClick={() => setShowWelcome(false)}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-semibold shadow-lg text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ backgroundColor: theme.primary_color }}
            >
              Start <ArrowRight className="h-5 w-5" />
            </motion.button>
          )}

          <p className="text-xs" style={{ opacity: 0.4 }}>
            Press Enter ↵ to start
          </p>
        </motion.div>
      </div>
    );
  }

  // Thank You Screen
  if (isCompleted) {
    const ty = form.thank_you_screen || {
      title: "Thank you for filling out this form!",
      description: "Your response has been recorded.",
      button_text: "Done"
    };

    return (
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center p-6 text-center"
        style={{ backgroundColor: theme.background_color, color: theme.text_color }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-xl w-full space-y-8"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
            className="mx-auto flex h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: `${theme.primary_color}20` }}
          >
            <Smile className="h-10 w-10" style={{ color: theme.primary_color }} />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">{ty.title}</h1>
          <p className="text-base leading-relaxed max-w-md mx-auto" style={{ opacity: 0.7 }}>{ty.description}</p>

          <div className="pt-4">
            {ty.redirect_url ? (
              <a
                href={ty.redirect_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold shadow-lg text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: theme.primary_color }}
              >
                {ty.button_text || "Continue"} <ArrowRight className="h-5 w-5" />
              </a>
            ) : (
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold shadow-lg text-base hover:opacity-90 transition-all hover:scale-[1.02] active:scale-[0.98]"
                style={{ backgroundColor: theme.primary_color }}
              >
                {ty.button_text || "Submit another response"}
              </button>
            )}
          </div>

          <Link href="/" className="text-xs hover:underline" style={{ opacity: 0.3 }}>
            Powered by Typeform Clone
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: theme.background_color, color: theme.text_color }}
    >
      {/* Progress dots */}
      <header className="px-6 py-5 flex items-center justify-center gap-1.5" role="progressbar" aria-valuenow={currentStep} aria-valuemin={0} aria-valuemax={totalSteps + 1} aria-label={`Question ${currentStep} of ${totalSteps + 1}`}>
        {Array.from({ length: totalSteps + 1 }).map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === currentStep ? "2rem" : "0.5rem",
              height: "0.5rem",
              backgroundColor: i <= currentStep ? theme.primary_color : `${theme.text_color}20`,
            }}
          />
        ))}
      </header>

      {/* Center content */}
      <main className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 max-w-3xl mx-auto w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ opacity: 0, y: direction === "down" ? 30 : -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: direction === "down" ? -20 : 20 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 py-8"
          >
            {currentQuestion && (
              <>
                <div className="flex items-center gap-2 text-sm font-semibold" style={{ opacity: 0.6 }}>
                  <span style={{ color: theme.accent_color }}>
                    {currentIndex + 1} &rarr;
                  </span>
                  {currentQuestion.required && <span className="text-red-400 font-bold" aria-label="required">*</span>}
                </div>

                <TypewriterText
                  text={currentQuestion.title}
                  speed={25}
                  tag="h2"
                  className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight leading-snug"
                />

                {currentQuestion.description && (
                  <p className="text-base sm:text-lg leading-relaxed" style={{ opacity: 0.65 }}>
                    {currentQuestion.description}
                  </p>
                )}

                <div className="pt-6">

                  {/* SHORT TEXT / EMAIL / NUMBER */}
                  {["short_text", "email", "number"].includes(currentQuestion.type) && (
                    <div className="space-y-4">
                      <input
                        ref={inputRef}
                        type={currentQuestion.type === "number" ? "number" : currentQuestion.type === "email" ? "email" : "text"}
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        placeholder={currentQuestion.properties.placeholder || "Type your answer here..."}
                        aria-label={currentQuestion.title}
                        className="w-full rounded-xl border-2 bg-transparent px-4 py-3.5 text-lg sm:text-xl font-medium transition-all outline-none"
                        style={{
                          borderColor: answers[currentQuestion.id]
                            ? theme.primary_color
                            : `${theme.text_color}30`,
                        }}
                        onFocus={(e) => {
                          if (!answers[currentQuestion.id]) e.target.style.borderColor = theme.primary_color;
                        }}
                        onBlur={(e) => {
                          if (!answers[currentQuestion.id]) e.target.style.borderColor = `${theme.text_color}30`;
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleNext()}
                          className="px-8 py-3 rounded-2xl text-white font-semibold shadow-md text-sm flex items-center gap-2 transition-all hover:shadow-lg active:scale-[0.97]"
                          style={{ backgroundColor: theme.primary_color }}
                          aria-label="Continue to next question"
                        >
                          OK <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="text-xs flex items-center gap-1" style={{ opacity: 0.5 }}>
                          <CornerDownLeft className="h-3 w-3" /> Enter
                        </span>
                      </div>
                    </div>
                  )}

                  {/* LONG TEXT */}
                  {currentQuestion.type === "long_text" && (
                    <div className="space-y-4">
                      <textarea
                        ref={inputRef}
                        rows={4}
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        placeholder={currentQuestion.properties.placeholder || "Type your answer here..."}
                        aria-label={currentQuestion.title}
                        className="w-full rounded-xl border-2 bg-transparent px-4 py-3.5 text-lg font-medium transition-all outline-none resize-none"
                        style={{
                          borderColor: answers[currentQuestion.id]
                            ? theme.primary_color
                            : `${theme.text_color}30`,
                        }}
                        onFocus={(e) => {
                          if (!answers[currentQuestion.id]) e.target.style.borderColor = theme.primary_color;
                        }}
                        onBlur={(e) => {
                          if (!answers[currentQuestion.id]) e.target.style.borderColor = `${theme.text_color}30`;
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleNext()}
                          className="px-8 py-3 rounded-2xl text-white font-semibold shadow-md text-sm flex items-center gap-2 transition-all hover:shadow-lg active:scale-[0.97]"
                          style={{ backgroundColor: theme.primary_color }}
                          aria-label="Continue to next question"
                        >
                          OK <Check className="h-4 w-4" aria-hidden="true" />
                        </button>
                        <span className="text-xs" style={{ opacity: 0.5 }}>
                          Ctrl + Enter to continue
                        </span>
                      </div>
                    </div>
                  )}

                  {/* MULTIPLE CHOICE */}
                  {currentQuestion.type === "multiple_choice" && (
                    <div className="space-y-2.5 max-w-xl" role="radiogroup" aria-label={currentQuestion.title}>
                      {(currentQuestion.properties.options || []).map((opt: string, idx: number) => {
                        const letterBadge = String.fromCharCode(65 + idx);
                        const isSelected = answers[currentQuestion.id] === opt;
                        return (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => {
                              setAnswers({ ...answers, [currentQuestion.id]: opt });
                              handleNext(opt);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setAnswers({ ...answers, [currentQuestion.id]: opt });
                                handleNext(opt);
                              }
                            }}
                            className={`flex items-center gap-3.5 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                              isSelected ? "shadow-md" : "hover:shadow-sm"
                            }`}
                            style={{
                              borderColor: isSelected ? theme.primary_color : `${theme.text_color}20`,
                              backgroundColor: isSelected ? `${theme.primary_color}12` : "transparent",
                            }}
                          >
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs transition-all ${
                                isSelected ? "text-white" : ""
                              }`}
                              style={{
                                backgroundColor: isSelected ? theme.primary_color : "transparent",
                                border: `1px solid ${theme.text_color}40`,
                                opacity: isSelected ? 1 : 0.3,
                              }}
                              aria-hidden="true"
                            >
                              {letterBadge}
                            </span>
                            <span className="text-base font-medium flex-1">{opt}</span>
                            {isSelected && <Check className="h-5 w-5" style={{ color: theme.primary_color }} aria-hidden="true" />}
                          </motion.div>
                        );
                      })}
                      <p className="text-xs mt-2" style={{ opacity: 0.4 }}>
                        Press A, B, C... to select
                      </p>
                    </div>
                  )}

                  {/* DROPDOWN */}
                  {currentQuestion.type === "dropdown" && (
                    <div className="max-w-xl space-y-4">
                      <select
                        value={answers[currentQuestion.id] || ""}
                        onChange={(e) => setAnswers({ ...answers, [currentQuestion.id]: e.target.value })}
                        aria-label={currentQuestion.title}
                        className="w-full rounded-xl border-2 bg-transparent p-3.5 text-base font-medium outline-none transition-all"
                        style={{
                          borderColor: answers[currentQuestion.id]
                            ? theme.primary_color
                            : `${theme.text_color}30`,
                        }}
                      >
                        <option value="">-- Select an option --</option>
                        {(currentQuestion.properties.options || []).map((opt: string, idx: number) => (
                          <option key={idx} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleNext()}
                        className="px-8 py-3 rounded-2xl text-white font-semibold shadow-md text-sm flex items-center gap-2 transition-all hover:shadow-lg active:scale-[0.97]"
                        style={{ backgroundColor: theme.primary_color }}
                        aria-label="Continue to next question"
                      >
                        OK <Check className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                  {/* YES / NO */}
                  {currentQuestion.type === "yes_no" && (
                    <div className="flex items-center gap-4 max-w-md" role="radiogroup" aria-label={currentQuestion.title}>
                      {["Yes", "No"].map((choice) => {
                        const isSelected = answers[currentQuestion.id] === choice;
                        const keyLetter = choice === "Yes" ? "Y" : "N";
                        return (
                          <motion.div
                            key={choice}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onClick={() => {
                              setAnswers({ ...answers, [currentQuestion.id]: choice });
                              handleNext(choice);
                            }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setAnswers({ ...answers, [currentQuestion.id]: choice });
                                handleNext(choice);
                              }
                            }}
                            className={`flex-1 flex items-center gap-3 rounded-xl border-2 p-4 cursor-pointer transition-all ${
                              isSelected ? "shadow-md" : ""
                            }`}
                            style={{
                              borderColor: isSelected ? theme.primary_color : `${theme.text_color}20`,
                              backgroundColor: isSelected ? `${theme.primary_color}12` : "transparent",
                            }}
                          >
                            <span
                              className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs transition-all ${
                                isSelected ? "text-white" : ""
                              }`}
                              style={{
                                backgroundColor: isSelected ? theme.primary_color : "transparent",
                                border: `1px solid ${theme.text_color}40`,
                                opacity: isSelected ? 1 : 0.3,
                              }}
                              aria-hidden="true"
                            >
                              {keyLetter}
                            </span>
                            <span className="text-base font-semibold">{choice}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                  {/* RATING */}
                  {currentQuestion.type === "rating" && (
                    <div className="space-y-4" role="radiogroup" aria-label={currentQuestion.title}>
                      <div className="flex items-center gap-2 flex-wrap">
                        {Array.from({ length: currentQuestion.properties.rating_scale || 5 }).map((_, i) => {
                          const val = i + 1;
                          const isSelected = answers[currentQuestion.id] === val;
                          return (
                            <motion.button
                              key={val}
                              whileHover={{ scale: 1.08 }}
                              whileTap={{ scale: 0.95 }}
                              role="radio"
                              aria-checked={isSelected}
                              aria-label={`Rate ${val}`}
                              onClick={() => {
                                setAnswers({ ...answers, [currentQuestion.id]: val });
                                handleNext(val);
                              }}
                              className={`flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl border-2 font-bold text-lg transition-all cursor-pointer ${
                                isSelected ? "text-white shadow-md" : ""
                              }`}
                              style={{
                                backgroundColor: isSelected
                                  ? theme.primary_color
                                  : "transparent",
                                borderColor: isSelected
                                  ? theme.primary_color
                                  : `${theme.text_color}30`,
                              }}
                            >
                              {val}
                            </motion.button>
                          );
                        })}
                      </div>
                      <p className="text-xs" style={{ opacity: 0.5 }}>
                        Press 1-{currentQuestion.properties.rating_scale || 5} to select
                      </p>
                    </div>
                  )}

                  {/* FILE UPLOAD */}
                  {currentQuestion.type === "file_upload" && (
                    <div className="max-w-xl space-y-4">
                      <div
                        className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center"
                        style={{ borderColor: `${theme.text_color}30`, opacity: 0.6 }}
                      >
                        <Upload className="h-8 w-8 mb-2" />
                        <span className="text-sm font-semibold">File uploads are available in the full version.</span>
                        <span className="text-xs mt-1" style={{ opacity: 0.7 }}>
                          This demo stores a placeholder value instead.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setAnswers({ ...answers, [currentQuestion.id]: "file_placeholder.txt" });
                          handleNext("file_placeholder.txt");
                        }}
                        className="px-8 py-3 rounded-2xl text-white font-semibold shadow-md text-sm flex items-center gap-2 transition-all hover:shadow-lg active:scale-[0.97]"
                        style={{ backgroundColor: theme.primary_color }}
                        aria-label="Continue to next question"
                      >
                        Continue <Check className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Validation Error */}
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    role="alert"
                    className="flex items-center gap-2 text-xs font-semibold p-3 rounded-xl"
                    style={{
                      backgroundColor: `${theme.primary_color}10`,
                      color: theme.primary_color,
                    }}
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{errorMsg}</span>
                  </motion.div>
                )}

                {/* Submission Error */}
                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                    className="flex items-center gap-2 text-xs font-semibold p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-400"
                  >
                    <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{submitError}</span>
                  </motion.div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav */}
      <footer
        className="px-6 py-4 flex items-center justify-between text-xs font-medium"
        style={{ borderTop: `1px solid ${theme.text_color}10` }}
      >
        <span className="font-semibold" style={{ opacity: 0.5 }}>
          {currentStep} / {totalSteps + 1}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all disabled:opacity-20 hover:opacity-80"
            style={{ backgroundColor: `${theme.text_color}10` }}
            aria-label="Previous question"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleNext()}
            className="flex h-9 w-9 items-center justify-center rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: theme.primary_color, color: "#fff" }}
            aria-label="Next question"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <span className="hidden md:inline text-[11px]" style={{ opacity: 0.3 }}>
          Powered by <strong>Typeform Clone</strong>
        </span>
      </footer>
    </div>
  );
};