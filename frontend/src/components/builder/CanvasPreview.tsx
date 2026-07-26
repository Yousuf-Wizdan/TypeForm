"use client";

import React from "react";
import { Question, FormTheme, ThankYouScreen } from "@/lib/types";
import { Plus, X, Upload, ChevronDown, Smile } from "lucide-react";

interface CanvasPreviewProps {
  question: Question | null;
  isThankYouScreen?: boolean;
  thankYouScreen?: ThankYouScreen;
  theme: FormTheme;
  questionIndex: number;
  onUpdateQuestion: (payload: {
    title?: string;
    description?: string;
    properties?: any;
  }) => void;
  onUpdateThankYouScreen?: (payload: Partial<ThankYouScreen>) => void;
}

export const CanvasPreview: React.FC<CanvasPreviewProps> = ({
  question,
  isThankYouScreen = false,
  thankYouScreen,
  theme,
  questionIndex,
  onUpdateQuestion,
  onUpdateThankYouScreen,
}) => {
  const bg = theme?.background_color || "#f7f7f6";
  const text = theme?.text_color || "#1a1a1a";
  const accent = theme?.primary_color || "#7c5cfc";
  const muted = theme?.text_color
    ? `${theme.text_color}99`
    : "#a1a1aa";

  const accentBg = accentHexToRgba(accent, 0.1);

  const handleAddChoice = () => {
    if (!question) return;
    const currentOptions = question.properties.options || [];
    const newOptions = [
      ...currentOptions,
      `Option ${currentOptions.length + 1}`,
    ];
    onUpdateQuestion({
      properties: { ...question.properties, options: newOptions },
    });
  };

  const handleEditChoice = (idx: number, newText: string) => {
    if (!question) return;
    const currentOptions = [...(question.properties.options || [])];
    currentOptions[idx] = newText;
    onUpdateQuestion({
      properties: { ...question.properties, options: currentOptions },
    });
  };

  const handleDeleteChoice = (idx: number) => {
    if (!question) return;
    const currentOptions = (question.properties.options || []).filter(
      (_, i) => i !== idx
    );
    onUpdateQuestion({
      properties: { ...question.properties, options: currentOptions },
    });
  };

  if (isThankYouScreen && thankYouScreen) {
    return (
      <main
        className="flex-1 flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: bg, color: text }}
      >
        <div className="max-w-lg w-full text-center space-y-5">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ backgroundColor: accentBg }}
          >
            <Smile
              className="h-8 w-8"
              style={{ color: accent }}
              strokeWidth={1.5}
            />
          </div>

          <input
            type="text"
            value={thankYouScreen.title}
            onChange={(e) =>
              onUpdateThankYouScreen?.({ title: e.target.value })
            }
            className="w-full text-center text-2xl font-bold bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:outline-none py-1.5 transition-colors"
            style={{ color: text, caretColor: accent }}
            placeholder="Thank you message..."
          />

          <textarea
            value={thankYouScreen.description}
            onChange={(e) =>
              onUpdateThankYouScreen?.({ description: e.target.value })
            }
            rows={2}
            className="w-full text-center text-sm bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:outline-none py-1 resize-none transition-colors"
            style={{ color: muted, caretColor: accent }}
            placeholder="Add a description..."
          />

          <div className="pt-4">
            <input
              type="text"
              value={thankYouScreen.button_text}
              onChange={(e) =>
                onUpdateThankYouScreen?.({ button_text: e.target.value })
              }
              className="px-8 py-3 rounded-xl text-white font-semibold shadow-sm text-sm text-center focus:outline-none focus:ring-2 focus:ring-offset-2 cursor-pointer transition-colors"
              style={{
                backgroundColor: accent,
                filter: "brightness(0.95)",
              }}
            />
          </div>
        </div>
      </main>
    );
  }

  if (!question) {
    return (
      <main
        className="flex-1 flex items-center justify-center p-8"
        style={{ backgroundColor: bg }}
      >
        <div className="text-center space-y-2">
          <div className="text-sm" style={{ color: muted }}>
            Select or add a question from the left sidebar
          </div>
          <div className="text-xs" style={{ color: muted, opacity: 0.6 }}>
            to start editing
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="flex-1 flex flex-col justify-center p-8 lg:p-16 overflow-y-auto"
      style={{ backgroundColor: bg }}
    >
      <div className="max-w-xl w-full mx-auto space-y-8">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <span style={{ color: accent }}>
            {questionIndex + 1} &rarr;
          </span>
          {question.required && (
            <span className="text-red-400 font-bold">*</span>
          )}
        </div>

        <input
          type="text"
          value={question.title}
          placeholder="Type your question here..."
          onChange={(e) => onUpdateQuestion({ title: e.target.value })}
          className="w-full text-2xl lg:text-3xl font-bold bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:outline-none py-2 transition-colors"
          style={{ color: text, caretColor: accent }}
        />

        <input
          type="text"
          value={question.description || ""}
          placeholder="Add a description or help text (optional)..."
          onChange={(e) => onUpdateQuestion({ description: e.target.value })}
          className="w-full text-sm bg-transparent border-b-2 border-transparent hover:border-zinc-200 focus:outline-none py-1 transition-colors"
          style={{ color: muted, caretColor: accent }}
        />

        <div className="pt-4">
          {["short_text", "email", "number"].includes(question.type) && (
            <div className="w-full">
              <input
                disabled
                placeholder="Type your answer here..."
                className="w-full border-b-2 bg-transparent py-3 text-lg opacity-40 focus:outline-none"
                style={{ borderColor: `${text}30`, color: text }}
              />
              <div className="mt-3 text-xs flex items-center gap-1.5" style={{ color: muted }}>
                <span>Press</span>
                <span
                  className="rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                  style={{ backgroundColor: accentBg, color: accent }}
                >
                  Enter ↵
                </span>
              </div>
            </div>
          )}

          {question.type === "long_text" && (
            <div className="w-full">
              <textarea
                disabled
                rows={3}
                placeholder="Type your answer here..."
                className="w-full border-b-2 bg-transparent py-3 text-base opacity-40 focus:outline-none resize-none"
                style={{ borderColor: `${text}30`, color: text }}
              />
              <div className="mt-2 text-xs" style={{ color: muted }}>
                Shift + Enter for new line
              </div>
            </div>
          )}

          {question.type === "multiple_choice" && (
            <div className="space-y-2.5">
              {(question.properties.options || []).map(
                (opt: string, idx: number) => {
                  const letter = String.fromCharCode(65 + idx);
                  return (
                    <div
                      key={idx}
                      className="group relative flex items-center gap-3"
                    >
                      <div
                        className="flex flex-1 items-center gap-3 rounded-xl border p-3.5 shadow-sm"
                        style={{
                          borderColor: `${text}15`,
                          backgroundColor: `${text}05`,
                        }}
                      >
                        <span
                          className="flex h-6 w-6 items-center justify-center rounded-lg text-xs font-bold"
                          style={{
                            backgroundColor: accentBg,
                            color: accent,
                          }}
                        >
                          {letter}
                        </span>
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleEditChoice(idx, e.target.value)}
                          className="flex-1 bg-transparent text-sm font-medium focus:outline-none"
                          style={{ color: text, caretColor: accent }}
                        />
                      </div>
                      <button
                        onClick={() => handleDeleteChoice(idx)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-zinc-400 hover:text-red-500 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                }
              )}
              <button
                onClick={handleAddChoice}
                className="flex items-center gap-2 rounded-xl border-2 border-dashed px-4 py-2.5 text-xs font-semibold transition-colors"
                style={{
                  borderColor: `${text}20`,
                  color: muted,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = accent;
                  e.currentTarget.style.color = accent;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = `${text}20`;
                  e.currentTarget.style.color = muted;
                }}
              >
                <Plus className="h-4 w-4" /> Add choice
              </button>
            </div>
          )}

          {question.type === "dropdown" && (
            <div className="space-y-2.5">
              <div
                className="flex items-center justify-between rounded-xl border p-3.5 text-sm shadow-sm"
                style={{
                  borderColor: `${text}15`,
                  backgroundColor: `${text}05`,
                  color: muted,
                }}
              >
                <span>Select an option...</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <div className="text-xs mt-3" style={{ color: muted }}>
                Options:
              </div>
              {(question.properties.options || []).map(
                (opt: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt}
                      onChange={(e) => handleEditChoice(idx, e.target.value)}
                      className="flex-1 rounded-xl border px-3 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-1"
                      style={{
                        borderColor: `${text}15`,
                        backgroundColor: `${text}05`,
                        color: text,
                        caretColor: accent,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = accent;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = `${text}15`;
                      }}
                    />
                    <button
                      onClick={() => handleDeleteChoice(idx)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              )}
              <button
                onClick={handleAddChoice}
                className="text-xs font-semibold flex items-center gap-1 transition-colors"
                style={{ color: accent }}
              >
                <Plus className="h-3.5 w-3.5" /> Add option
              </button>
            </div>
          )}

          {question.type === "yes_no" && (
            <div className="flex items-center gap-4">
              {["Yes", "No"].map((choice) => (
                <div
                  key={choice}
                  className="flex-1 flex items-center gap-3 rounded-xl border p-4 shadow-sm"
                  style={{
                    borderColor: `${text}15`,
                    backgroundColor: `${text}05`,
                  }}
                >
                  <span
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold"
                    style={{
                      backgroundColor: accentBg,
                      color: accent,
                    }}
                  >
                    {choice === "Yes" ? "Y" : "N"}
                  </span>
                  <span
                    className="font-semibold text-sm"
                    style={{ color: text }}
                  >
                    {choice}
                  </span>
                </div>
              ))}
            </div>
          )}

          {question.type === "rating" && (
            <div className="flex items-center gap-2">
              {Array.from({
                length: question.properties.rating_scale || 5,
              }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-12 w-12 items-center justify-center rounded-xl border shadow-sm font-semibold text-base"
                  style={{
                    borderColor: `${text}15`,
                    backgroundColor: `${text}05`,
                    color: text,
                    opacity: 0.8,
                  }}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {question.type === "file_upload" && (
            <div
              className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center"
              style={{
                borderColor: `${text}20`,
                backgroundColor: `${text}05`,
              }}
            >
              <Upload
                className="h-8 w-8 mb-3"
                style={{ color: muted }}
                strokeWidth={1.5}
              />
              <div className="text-sm font-semibold" style={{ color: muted }}>
                Choose file or drag here
              </div>
              <div className="text-xs mt-1" style={{ color: muted, opacity: 0.7 }}>
                Size limit 10MB
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

function accentHexToRgba(hex: string, alpha: number): string {
  const cleaned = hex.replace("#", "");
  const r = parseInt(cleaned.substring(0, 2), 16);
  const g = parseInt(cleaned.substring(2, 4), 16);
  const b = parseInt(cleaned.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
