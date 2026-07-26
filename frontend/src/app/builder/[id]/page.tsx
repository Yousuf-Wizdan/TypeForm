"use client";

import React, { useEffect, useState, useRef, use } from "react";
import { Form, Question, QuestionType, FormTheme, ThankYouScreen, LogicRule } from "@/lib/types";
import {
  fetchFormDetails,
  updateFormDetails,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  togglePublishForm
} from "@/lib/api";
import { BuilderHeader } from "@/components/builder/BuilderHeader";
import { QuestionList } from "@/components/builder/QuestionList";
import { CanvasPreview } from "@/components/builder/CanvasPreview";
import { RightInspector } from "@/components/builder/RightInspector";
import { RespondentFlow } from "@/components/respondent/RespondentFlow";
import { Loader2, X, List, Settings } from "lucide-react";

export default function BuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const [form, setForm] = useState<Form | null>(null);
  const formRef = useRef<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | "thank_you" | null>(null);
  const [activeHeaderTab, setActiveHeaderTab] = useState<"create" | "logic" | "theme" | "results">("create");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const data = await fetchFormDetails(formId);
      setForm(data);
      if (data.questions.length > 0 && !selectedQuestionId) {
        setSelectedQuestionId(data.questions[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch form details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForm();
  }, [formId]);

  if (loading || !form) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  const selectedQuestion = form.questions.find((q) => q.id === selectedQuestionId) || null;
  const isThankYouSelected = selectedQuestionId === "thank_you";
  const currentQuestionIndex = selectedQuestion
    ? form.questions.findIndex((q) => q.id === selectedQuestion.id)
    : 0;

  // --- Handlers with rollback on failure ---

  const handleTitleChange = async (newTitle: string) => {
    const prevForm = formRef.current;
    setForm((prev) => (prev ? { ...prev, title: newTitle } : null));
    try {
      await updateFormDetails(formId, { title: newTitle });
    } catch {
      setForm(prevForm);
    }
  };

  const handleTogglePublish = async () => {
    const prevForm = formRef.current;
    try {
      const updated = await togglePublishForm(formId);
      setForm(updated);
    } catch {
      setForm(prevForm);
    }
  };

  const handleAddQuestion = async (type: QuestionType) => {
    try {
      const defaultTitle = `Untitled ${type.replace("_", " ")}`;
      const newQ = await addQuestion(formId, type, defaultTitle);
      setForm((prev) => (prev ? { ...prev, questions: [...prev.questions, newQ] } : null));
      setSelectedQuestionId(newQ.id);
    } catch {
      console.error("Failed to add question");
    }
  };

  const handleDeleteQuestion = async (id: string) => {
    const prevForm = formRef.current;
    try {
      await deleteQuestion(id);
      const updatedQuestions = form.questions.filter((q) => q.id !== id);
      setForm((prev) => (prev ? { ...prev, questions: updatedQuestions } : null));
      if (selectedQuestionId === id) {
        setSelectedQuestionId(updatedQuestions.length > 0 ? updatedQuestions[0].id : null);
      }
    } catch {
      setForm(prevForm);
    }
  };

  const handleReorderQuestions = async (newQuestions: Question[]) => {
    const prevForm = formRef.current;
    setForm((prev) => (prev ? { ...prev, questions: newQuestions } : null));
    try {
      await reorderQuestions(formId, newQuestions.map((q) => q.id));
    } catch {
      setForm(prevForm);
    }
  };

  const handleUpdateQuestion = async (payload: {
    title?: string;
    description?: string;
    type?: QuestionType;
    required?: boolean;
    properties?: any;
    logic?: LogicRule[];
  }) => {
    if (!selectedQuestion) return;
    const prevForm = formRef.current;

    setForm((prev) => {
      if (!prev) return null;
      const updated = prev.questions.map((q) =>
        q.id === selectedQuestion.id ? { ...q, ...payload } : q
      );
      return { ...prev, questions: updated };
    });

    try {
      await updateQuestion(selectedQuestion.id, payload);
    } catch {
      setForm(prevForm);
    }
  };

  const handleUpdateTheme = async (newTheme: FormTheme) => {
    const prevForm = formRef.current;
    setForm((prev) => (prev ? { ...prev, theme: newTheme } : null));
    try {
      await updateFormDetails(formId, { theme: newTheme });
    } catch {
      setForm(prevForm);
    }
  };

  const handleUpdateThankYouScreen = async (newScreen: Partial<ThankYouScreen>) => {
    const prevForm = formRef.current;
    const merged = { ...form.thank_you_screen, ...newScreen };
    setForm((prev) => (prev ? { ...prev, thank_you_screen: merged } : null));
    try {
      await updateFormDetails(formId, { thank_you_screen: merged });
    } catch {
      setForm(prevForm);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[#f7f7f6]">

      <BuilderHeader
        form={form}
        activeTab={activeHeaderTab}
        onTabChange={setActiveHeaderTab}
        onTitleChange={handleTitleChange}
        onTogglePublish={handleTogglePublish}
        onOpenPreview={() => setPreviewOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden relative">

        {/* Desktop left sidebar */}
        <div className="hidden lg:block h-full">
          <QuestionList
            questions={form.questions}
            selectedQuestionId={selectedQuestionId}
            onSelectQuestion={setSelectedQuestionId}
            onAddQuestion={handleAddQuestion}
            onDeleteQuestion={handleDeleteQuestion}
            onReorder={handleReorderQuestions}
          />
        </div>

        {/* Mobile left drawer */}
        {mobileLeftOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileLeftOpen(false)} />
            <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-2xl animate-slide-in-left">
              <QuestionList
                questions={form.questions}
                selectedQuestionId={selectedQuestionId}
                onSelectQuestion={(id) => { setSelectedQuestionId(id); setMobileLeftOpen(false); }}
                onAddQuestion={handleAddQuestion}
                onDeleteQuestion={handleDeleteQuestion}
                onReorder={handleReorderQuestions}
              />
            </div>
          </>
        )}

        <CanvasPreview
          question={selectedQuestion}
          isThankYouScreen={isThankYouSelected}
          thankYouScreen={form.thank_you_screen}
          theme={form.theme}
          questionIndex={currentQuestionIndex}
          onUpdateQuestion={handleUpdateQuestion}
          onUpdateThankYouScreen={handleUpdateThankYouScreen}
        />

        {/* Desktop right sidebar */}
        <div className="hidden lg:block h-full">
          <RightInspector
            question={selectedQuestion}
            allQuestions={form.questions}
            theme={form.theme}
            thankYouScreen={form.thank_you_screen}
            activeTab={activeHeaderTab}
            onUpdateQuestion={handleUpdateQuestion}
            onUpdateTheme={handleUpdateTheme}
            onUpdateThankYouScreen={handleUpdateThankYouScreen}
            onTabChange={setActiveHeaderTab}
          />
        </div>

        {/* Mobile right drawer */}
        {mobileRightOpen && (
          <>
            <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileRightOpen(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-80 lg:hidden shadow-2xl animate-slide-in-right">
              <RightInspector
                question={selectedQuestion}
                allQuestions={form.questions}
                theme={form.theme}
                thankYouScreen={form.thank_you_screen}
                activeTab={activeHeaderTab}
                onUpdateQuestion={handleUpdateQuestion}
                onUpdateTheme={handleUpdateTheme}
                onUpdateThankYouScreen={handleUpdateThankYouScreen}
                onTabChange={setActiveHeaderTab}
              />
            </div>
          </>
        )}

        {/* Mobile floating toggle buttons */}
        <div className="lg:hidden fixed bottom-5 left-4 z-30 flex gap-2">
          <button
            onClick={() => setMobileLeftOpen(!mobileLeftOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-lg hover:bg-[var(--brand-primary-hover)] transition-all active:scale-95"
            title="Questions"
          >
            <List className="h-5 w-5" />
          </button>
        </div>
        <div className="lg:hidden fixed bottom-5 right-4 z-30 flex gap-2">
          <button
            onClick={() => setMobileRightOpen(!mobileRightOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white shadow-lg hover:bg-[var(--brand-primary-hover)] transition-all active:scale-95"
            title="Settings & Design"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

      </div>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <button
            onClick={() => setPreviewOpen(false)}
            className="absolute top-5 right-5 z-50 flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm border border-white/10"
            title="Close Preview"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="h-[90vh] w-[95vw] max-w-5xl overflow-hidden rounded-2xl shadow-2xl bg-white">
            <RespondentFlow form={form} />
          </div>
        </div>
      )}

    </div>
  );
}