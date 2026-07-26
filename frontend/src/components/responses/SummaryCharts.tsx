"use client";

import React from "react";
import { FormSummary } from "@/lib/types";
import { formatTimeSeconds } from "@/lib/utils";
import { Users, Clock, Star, TrendingUp } from "lucide-react";

interface SummaryChartsProps {
  summary: FormSummary;
}

export const SummaryCharts: React.FC<SummaryChartsProps> = ({ summary }) => {
  return (
    <div className="space-y-6">
      {/* Metrics inline strip */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-surface)] text-[var(--brand-primary)]">
            <Users className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight tabular-nums leading-none">
              {summary.total_responses}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              Total responses
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-500">
            <TrendingUp className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight tabular-nums leading-none">
              {summary.completion_rate}%
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              Completion rate
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-500">
            <Clock className="h-3.5 w-3.5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <div className="text-lg font-bold text-[var(--text-primary)] tracking-tight tabular-nums leading-none">
              {formatTimeSeconds(summary.average_time_seconds)}
            </div>
            <div className="text-[11px] font-medium text-[var(--text-muted)] mt-0.5">
              Avg. time
            </div>
          </div>
        </div>
      </div>

      {/* Question breakdown */}
      <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden shadow-sm">
        <div className="border-b border-[var(--border-strong)] bg-[var(--surface-muted)] px-5 py-2.5 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wide">
            Question Breakdown
          </span>
          <span className="text-[10px] font-medium text-[var(--text-muted)] tabular-nums">
            {summary.question_summaries.length}{" "}
            {summary.question_summaries.length === 1 ? "question" : "questions"}
          </span>
        </div>

        {summary.question_summaries.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-[12px] text-[var(--text-muted)]">
              No questions added yet. Add questions in the builder to see breakdowns.
            </p>
          </div>
        ) : (
          <div>
            {summary.question_summaries.map((qs, qIdx) => (
              <QuestionRow key={qs.question_id} summary={qs} index={qIdx} isLast={qIdx === summary.question_summaries.length - 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/* ---- Question Row ---- */

function QuestionRow({
  summary,
  index,
  isLast,
}: {
  summary: FormSummary["question_summaries"][0];
  index: number;
  isLast: boolean;
}) {
  const chartData = Object.entries(summary.breakdown || {}).map(
    ([name, count]) => ({
      name,
      count,
      pct:
        summary.total_answers > 0
          ? Math.round((count / summary.total_answers) * 100)
          : 0,
    })
  );

  const isChoiceType = [
    "multiple_choice",
    "dropdown",
    "yes_no",
    "rating",
  ].includes(summary.question_type);

  const hasChart = isChoiceType && chartData.length > 0;
  const hasTextAnswers =
    summary.recent_text_answers && summary.recent_text_answers.length > 0;

  return (
    <div className={`${!isLast ? "border-b border-[var(--border-subtle)]" : ""}`}>
      <div className="px-5 py-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-[var(--brand-primary)] bg-[var(--brand-surface)] rounded px-1.5 py-0.5">
                Q{index + 1}
              </span>
              <span className="text-[10px] font-medium text-[var(--text-muted)]">
                {summary.question_type.replace(/_/g, " ")}
              </span>
            </div>
            <h3 className="text-[13px] font-semibold text-[var(--text-primary)] mt-1 leading-snug">
              {summary.question_title}
            </h3>
          </div>
          <span className="text-[10px] font-medium text-[var(--text-muted)] shrink-0 tabular-nums mt-0.5">
            {summary.total_answers}{" "}
            {summary.total_answers === 1 ? "resp." : "resp."}
          </span>
        </div>

        {/* Horizontal bars */}
        {hasChart ? (
          <div className="space-y-1.5">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-[11px] font-medium text-[var(--text-secondary)] truncate text-right">
                  {item.name}
                </span>
                <div className="flex-1 h-5 bg-[var(--surface-muted)] rounded overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500 ease-out"
                    style={{
                      width: `${Math.max(item.pct, 2)}%`,
                      backgroundColor: "var(--brand-primary)",
                    }}
                  />
                </div>
                <span className="w-14 shrink-0 text-[11px] font-semibold text-[var(--text-muted)] tabular-nums text-right">
                  {item.pct}%
                </span>
              </div>
            ))}
          </div>
        ) : hasTextAnswers ? (
          <div className="space-y-1.5">
            {summary.recent_text_answers.map((ans, aIdx) => (
              <div
                key={aIdx}
                className="text-[12px] text-[var(--text-secondary)] px-3 py-1.5 bg-[var(--surface-muted)] rounded border border-[var(--border-subtle)] italic"
              >
                {ans}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--text-muted)] py-2">
            No responses recorded yet.
          </p>
        )}

        {/* Rating */}
        {summary.average_rating !== null &&
          summary.average_rating !== undefined && (
            <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded border border-amber-100 w-fit">
              <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
              {summary.average_rating.toFixed(1)} / 5 average rating
            </div>
          )}
      </div>
    </div>
  );
}
