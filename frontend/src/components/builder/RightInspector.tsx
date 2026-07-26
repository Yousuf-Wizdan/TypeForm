"use client";

import React from "react";
import {
  Question,
  QuestionType,
  FormTheme,
  ThankYouScreen,
  LogicRule,
} from "@/lib/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QUESTION_TYPES } from "./QuestionList";
import {
  Settings,
  GitBranch,
  Palette,
  Plus,
  Trash2,
  Check,
} from "lucide-react";

const CONDITION_LABELS: Record<string, string> = {
  equals: "is",
  not_equals: "is not",
  contains: "contains",
  is_filled: "is answered",
  greater_than: "is greater than",
  less_than: "is less than",
};

function getAvailableConditions(q: Question): string[] {
  if (["short_text", "long_text", "email"].includes(q.type)) {
    return ["equals", "not_equals", "contains", "is_filled"];
  }
  if (["multiple_choice", "dropdown", "yes_no"].includes(q.type)) {
    return ["equals", "not_equals", "is_filled"];
  }
  if (["number", "rating"].includes(q.type)) {
    return ["equals", "not_equals", "greater_than", "less_than", "is_filled"];
  }
  return ["equals", "not_equals", "is_filled"];
}

function getChoiceOptions(q: Question): string[] {
  if (q.type === "yes_no") return ["Yes", "No"];
  return q.properties.options || [];
}

interface RightInspectorProps {
  question: Question | null;
  allQuestions: Question[];
  theme: FormTheme;
  thankYouScreen: ThankYouScreen;
  activeTab: "create" | "logic" | "theme" | "results";
  onUpdateQuestion: (payload: {
    title?: string;
    type?: QuestionType;
    required?: boolean;
    properties?: any;
    logic?: LogicRule[];
  }) => void;
  onUpdateTheme: (theme: FormTheme) => void;
  onUpdateThankYouScreen: (screen: ThankYouScreen) => void;
  onTabChange: (tab: "create" | "logic" | "theme" | "results") => void;
}

const THEME_PRESETS: {
  name: string;
  preset: FormTheme["preset"];
  bg: string;
  text: string;
  accent: string;
}[] = [
  {
    name: "Clean Light",
    preset: "light",
    bg: "#ffffff",
    text: "#1a1a1a",
    accent: "#0284c7",
  },
  {
    name: "Warm White",
    preset: "warm",
    bg: "#f7f7f6",
    text: "#1a1a1a",
    accent: "#7c5cfc",
  },
  {
    name: "Modern Dark",
    preset: "dark",
    bg: "#0f172a",
    text: "#f8fafc",
    accent: "#a855f7",
  },
  {
    name: "Warm Sunset",
    preset: "sunset",
    bg: "#fff7ed",
    text: "#431407",
    accent: "#ea580c",
  },
  {
    name: "Ocean Blue",
    preset: "ocean",
    bg: "#f0f9ff",
    text: "#0c4a6e",
    accent: "#0284c7",
  },
];

export const RightInspector: React.FC<RightInspectorProps> = ({
  question,
  allQuestions,
  theme,
  activeTab,
  onUpdateQuestion,
  onUpdateTheme,
  onTabChange,
}) => {
  const inspectionTabFromHeader: Record<string, string> = {
    create: "settings",
    logic: "logic",
    theme: "design",
    results: "settings",
  };

  const headerToInspector: Record<string, "create" | "logic" | "theme" | "results"> = {
    settings: "create",
    logic: "logic",
    design: "theme",
  };

  const currentInspectorTab = inspectionTabFromHeader[activeTab] || "settings";

  const handleTabChange = (inspectorTab: string) => {
    const headerTab = headerToInspector[inspectorTab];
    if (headerTab) {
      onTabChange(headerTab);
    }
  };

  const handleAddLogicRule = () => {
    if (!question) return;
    const currentRules = question.logic || [];
    const newRule: LogicRule = {
      condition: "equals",
      value: "",
      destination_question_id:
        allQuestions.find((q) => q.id !== question.id)?.id || "thank_you",
    };
    onUpdateQuestion({ logic: [...currentRules, newRule] });
  };

  const handleUpdateLogicRule = (idx: number, updated: Partial<LogicRule>) => {
    if (!question) return;
    const currentRules = [...(question.logic || [])];
    currentRules[idx] = { ...currentRules[idx], ...updated };
    onUpdateQuestion({ logic: currentRules });
  };

  const handleDeleteLogicRule = (idx: number) => {
    if (!question) return;
    const currentRules = (question.logic || []).filter((_, i) => i !== idx);
    onUpdateQuestion({ logic: currentRules });
  };

  return (
    <aside className="h-full w-72 shrink-0 border-l border-[var(--border-default)] bg-[var(--surface)] flex flex-col">
      <Tabs value={currentInspectorTab} onValueChange={handleTabChange} className="flex-1 flex flex-col">
        {/* Tab bar */}
        <div className="border-b border-[var(--border-default)] p-2.5">
          <TabsList className="grid grid-cols-3 w-full bg-[var(--surface-muted)] rounded-xl p-1">
            <TabsTrigger value="settings" className="text-xs gap-1.5 rounded-lg">
              <Settings className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
            <TabsTrigger value="logic" className="text-xs gap-1.5 rounded-lg">
              <GitBranch className="h-3.5 w-3.5" /> Logic
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs gap-1.5 rounded-lg">
              <Palette className="h-3.5 w-3.5" /> Design
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Settings */}
          <TabsContent value="settings">
            {question ? (
              <div className="space-y-5">
                <div className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Question Settings
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                    Question Type
                  </label>
                  <select
                    value={question.type}
                    onChange={(e) =>
                      onUpdateQuestion({
                        type: e.target.value as QuestionType,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 transition-all"
                  >
                    {QUESTION_TYPES.map((qt) => (
                      <option key={qt.type} value={qt.type}>
                        {qt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center justify-between border-t border-b border-[var(--border-subtle)] py-4">
                  <div>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">
                      Required Field
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                      Respondent must answer this
                    </div>
                  </div>
                  <Switch
                    checked={question.required}
                    onCheckedChange={(val) =>
                      onUpdateQuestion({ required: val })
                    }
                  />
                </div>

                {question.type === "rating" && (
                  <div>
                    <label className="block text-xs font-semibold text-[var(--text-secondary)] mb-1.5">
                      Rating Scale Max
                    </label>
                    <select
                      value={question.properties.rating_scale || 5}
                      onChange={(e) =>
                        onUpdateQuestion({
                          properties: {
                            ...question.properties,
                            rating_scale: Number(e.target.value),
                          },
                        })
                      }
                      className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 transition-all"
                    >
                      <option value={5}>1 to 5 Stars</option>
                      <option value={10}>1 to 10 Scale</option>
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-[var(--text-muted)] text-center py-12">
                Select a question to modify settings.
              </div>
            )}
          </TabsContent>

          {/* Logic */}
          <TabsContent value="logic">
            <div className="space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Logic Branching
                </h3>
                <p className="text-[11px] text-[var(--text-muted)] mt-1">
                  Route respondents based on their answers.
                </p>
              </div>

              {question ? (
                <div className="space-y-3 overflow-y-auto pr-1" style={{ maxHeight: "calc(100vh - 240px)" }}>
                  {(question.logic || []).map((rule, idx) => {
                    const conditions = getAvailableConditions(question);
                    const choiceOptions = getChoiceOptions(question);
                    const isChoiceType = ["multiple_choice", "dropdown", "yes_no"].includes(question.type);
                    const showValue = rule.condition !== "is_filled";

                    return (
                    <div
                      key={idx}
                      className="rounded-xl border border-[var(--border-strong)] bg-[var(--surface-muted)] p-3.5 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold text-[var(--text-secondary)]">
                        <span>Rule {idx + 1}</span>
                        <button
                          onClick={() => handleDeleteLogicRule(idx)}
                          className="text-red-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-400">
                          IF answer
                        </span>
                        <select
                          value={rule.condition}
                          onChange={(e) =>
                            handleUpdateLogicRule(idx, {
                              condition: e.target.value as LogicRule["condition"],
                              ...(e.target.value === "is_filled" ? { value: "" } : {}),
                            })
                          }
                          className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 transition-all"
                        >
                          {conditions.map((c) => (
                            <option key={c} value={c}>
                              {CONDITION_LABELS[c]}
                            </option>
                          ))}
                        </select>
                      </div>

                      {showValue && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-400">
                            Value
                          </span>
                          {isChoiceType ? (
                            <select
                              value={rule.value || ""}
                              onChange={(e) =>
                                handleUpdateLogicRule(idx, { value: e.target.value })
                              }
                              className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 transition-all"
                            >
                              <option value="">Select an option...</option>
                              {choiceOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <Input
                              value={rule.value || ""}
                              placeholder={question.type === "number" || question.type === "rating" ? "e.g. 5" : "e.g. value"}
                              onChange={(e) =>
                                handleUpdateLogicRule(idx, {
                                  value: e.target.value,
                                })
                              }
                              className="h-9 text-xs"
                            />
                          )}
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <span className="text-[10px] text-zinc-400">
                          THEN jump to
                        </span>
                        <select
                          value={rule.destination_question_id}
                          onChange={(e) =>
                            handleUpdateLogicRule(idx, {
                              destination_question_id: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2.5 text-xs font-medium text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1 transition-all"
                        >
                          <option value="thank_you">Thank You Screen</option>
                          {allQuestions
                            .filter((q) => q.id !== question.id)
                            .map((q) => (
                              <option key={q.id} value={q.id}>
                                {q.title}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                    );
                  })}

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddLogicRule}
                    className="w-full text-xs gap-1.5 rounded-xl h-9"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Logic Rule
                  </Button>
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)] text-center py-12">
                  Select a question to set up logic rules.
                </div>
              )}
            </div>
          </TabsContent>

          {/* Design */}
          <TabsContent value="design">
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Theme Presets
                </h3>
                <div className="grid grid-cols-1 gap-1.5 mt-2.5">
                  {THEME_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      onClick={() =>
                        onUpdateTheme({
                          ...theme,
                          preset: p.preset,
                          background_color: p.bg,
                          text_color: p.text,
                          accent_color: p.accent,
                          primary_color: p.accent,
                        })
                      }
                      className={`flex items-center justify-between rounded-xl p-2.5 text-xs font-semibold border transition-all duration-150 ${
                        theme.preset === p.preset
                          ? "border-[var(--brand-primary)] bg-[var(--brand-surface)]"
                          : "border-[var(--border-strong)] hover:border-[var(--border-strong)]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="h-5 w-5 rounded-lg border shadow-sm"
                          style={{ backgroundColor: p.bg }}
                        />
                        <span>{p.name}</span>
                      </div>
                      {theme.preset === p.preset && (
                        <Check className="h-4 w-4 text-[var(--brand-primary)]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[var(--border-subtle)] pt-5 space-y-4">
                <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Custom Colors
                </h3>
                {[
                  {
                    label: "Background",
                    key: "background_color" as const,
                  },
                  { label: "Text", key: "text_color" as const },
                  {
                    label: "Accent / Button",
                    key: "primary_color" as const,
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-[var(--text-secondary)]">{item.label}</span>
                    <input
                      type="color"
                      value={theme[item.key]}
                      onChange={(e) => {
                        const update = { ...theme, [item.key]: e.target.value };
                        if (item.key === "primary_color")
                          update.accent_color = e.target.value;
                        onUpdateTheme(update);
                      }}
                      className="h-7 w-10 cursor-pointer rounded-lg border border-[var(--border-strong)] p-0.5"
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};
