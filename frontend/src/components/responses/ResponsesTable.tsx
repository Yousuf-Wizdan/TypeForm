"use client";

import React, { useState } from "react";
import { ResponseDetail, AnswerDetail } from "@/lib/types";
import { getCSVExportUrl } from "@/lib/api";
import { formatDate, formatTimeSeconds } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Download, FileText } from "lucide-react";

interface ResponsesTableProps {
  formId: string;
  responses: ResponseDetail[];
}

function ensureString(v: unknown): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v);
}

export const ResponsesTable: React.FC<ResponsesTableProps> = ({
  formId,
  responses,
}) => {
  const [selectedResponse, setSelectedResponse] =
    useState<ResponseDetail | null>(null);

  const csvUrl = getCSVExportUrl(formId);

  // Derive column layout from first response (all share same schema)
  const columnMeta =
    responses.length > 0
      ? responses[0].answers.map((a) => ({
          id: a.question_id,
          title: a.question_title,
        }))
      : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[13px] font-semibold text-[var(--text-primary)]">
            Responses
          </h2>
          <span className="text-[11px] font-medium text-[var(--text-muted)] bg-[var(--surface-muted)] rounded-md px-1.5 py-0.5 tabular-nums">
            {responses.length}
          </span>
        </div>
        {responses.length > 0 && (
          <a href={csvUrl} download target="_blank" rel="noreferrer">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-lg h-8 text-[11px] font-semibold"
            >
              <Download className="h-3 w-3" /> Export CSV
            </Button>
          </a>
        )}
      </div>

      {responses.length === 0 ? (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] px-6 py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--surface-muted)] mb-4">
            <FileText className="h-6 w-6 text-[var(--text-subtle)]" strokeWidth={1.5} />
          </div>
          <p className="text-[13px] font-semibold text-[var(--text-muted)]">
            No responses yet
          </p>
          <p className="text-[12px] text-[var(--text-muted)] mt-1 max-w-xs mx-auto leading-relaxed">
            Share your form link to start collecting responses. They will appear here.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--border-strong)] bg-[var(--surface-muted)]">
                  <th className="sticky left-0 z-10 bg-[var(--surface-muted)] border-r border-[var(--border-strong)] px-4 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap w-10">
                    #
                  </th>
                  {columnMeta.map((col) => (
                    <th
                      key={col.id}
                      className="px-4 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap border-r border-[var(--border-strong)] last:border-r-0"
                    >
                      {col.title}
                    </th>
                  ))}
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap border-r border-[var(--border-strong)] w-28">
                    Submitted
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap border-r border-[var(--border-strong)] w-20">
                    Duration
                  </th>
                  <th className="px-4 py-2.5 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap w-20">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {responses.map((r, rowIdx) => {
                  const answerMap = new Map<string, AnswerDetail>();
                  r.answers.forEach((a) => answerMap.set(a.question_id, a));

                  return (
                    <tr
                      key={r.id}
                      onClick={() => setSelectedResponse(r)}
                      className={`group cursor-pointer transition-colors duration-100 hover:bg-[var(--brand-surface)] ${
                        rowIdx % 2 === 0 ? "bg-[var(--surface)]" : "bg-[var(--surface-muted)]"
                      }`}
                    >
                      <td className="sticky left-0 z-10 bg-inherit group-hover:bg-[var(--brand-surface)] border-r border-[var(--border-strong)] px-4 py-2.5 text-[11px] font-medium text-[var(--text-muted)] tabular-nums whitespace-nowrap">
                        {rowIdx + 1}
                      </td>
                      {columnMeta.map((col) => {
                        const ans = answerMap.get(col.id);
                        const raw = ans ? ans.answer_value : null;
                        const text = ensureString(raw);
                        return (
                          <td
                            key={col.id}
                            className="px-4 py-2.5 text-[12px] text-[var(--text-secondary)] max-w-[240px] truncate border-r border-[var(--border-strong)] last:border-r-0"
                            title={text || undefined}
                          >
                            {text || (
                              <span className="text-[var(--text-subtle)]">-</span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-2.5 text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap border-r border-[var(--border-strong)]">
                        {formatDate(r.submitted_at)}
                      </td>
                      <td className="px-4 py-2.5 text-[11px] text-[var(--text-muted)] tabular-nums whitespace-nowrap border-r border-[var(--border-strong)]">
                        {formatTimeSeconds(r.completion_time_seconds)}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <Badge
                          variant={
                            r.status === "completed" ? "published" : "partial"
                          }
                        >
                          {r.status === "completed" ? "Complete" : "Partial"}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedResponse && (
        <Dialog open={true} onOpenChange={() => setSelectedResponse(null)}>
          <DialogTitle>Response Detail</DialogTitle>
          <DialogDescription>
            Submitted {formatDate(selectedResponse.submitted_at)}, took{" "}
            {formatTimeSeconds(selectedResponse.completion_time_seconds)}
          </DialogDescription>

          <div className="mt-5 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {selectedResponse.answers.map((a, idx) => (
              <div
                key={a.id || idx}
                className="rounded-lg border border-[var(--border-default)] bg-[var(--surface-muted)] px-4 py-3"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] font-semibold text-[var(--brand-primary)] bg-[var(--brand-surface)] rounded px-1.5 py-0.5">
                    Q{idx + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                    {a.question_title}
                  </span>
                </div>
                <div className="text-[13px] font-medium text-[var(--text-primary)] leading-relaxed">
                  {Array.isArray(a.answer_value)
                    ? a.answer_value.join(", ")
                    : a.answer_value != null
                    ? String(a.answer_value)
                    : (
                      <span className="text-[var(--text-muted)] italic">No answer</span>
                    )}
                </div>
              </div>
            ))}
          </div>
        </Dialog>
      )}
    </div>
  );
}
