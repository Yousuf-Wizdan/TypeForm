"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import {
  FileEdit,
  BarChart3,
  Copy,
  Trash2,
  Globe,
  Lock,
  CheckCircle2,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react";

interface FormCardProps {
  form: Form;
  onDuplicate: (formId: string) => void;
  onTogglePublish: (formId: string) => void;
  onDelete: (formId: string) => void;
}

export const FormCard: React.FC<FormCardProps> = ({
  form,
  onDuplicate,
  onTogglePublish,
  onDelete,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const publicUrl = `${
    typeof window !== "undefined" ? window.location.origin : ""
  }/to/${form.share_id}`;
  const isPublished = form.status === "published";

  const handleCopyShareLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-6 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-md">
      {/* Top row: badge + menu */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
            isPublished
              ? "bg-emerald-50 text-emerald-700"
              : "bg-[var(--surface-muted)] text-[var(--text-muted)]"
          }`}
        >
          {isPublished ? (
            <>
              <Globe className="h-3 w-3" /> Published
            </>
          ) : (
            <>
              <Lock className="h-3 w-3" /> Draft
            </>
          )}
        </span>

        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-all duration-150"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-1.5 shadow-lg max-[400px]:left-0 max-[400px]:right-auto">
                {[
                  {
                    icon: FileEdit,
                    label: "Edit",
                    href: `/builder/${form.id}`,
                    action: undefined,
                  },
                  {
                    icon: BarChart3,
                    label: "Responses",
                    href: `/responses/${form.id}`,
                    action: undefined,
                  },
                  {
                    icon: Copy,
                    label: "Duplicate",
                    href: undefined,
                    action: () => {
                      onDuplicate(form.id);
                      setMenuOpen(false);
                    },
                  },
                  {
                    icon: Globe,
                    label: isPublished ? "Unpublish" : "Publish",
                    href: undefined,
                    action: () => {
                      onTogglePublish(form.id);
                      setMenuOpen(false);
                    },
                  },
                ].map((item, i) =>
                  item.href ? (
                    <Link
                      key={i}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      key={i}
                      onClick={item.action}
                      className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] transition-colors"
                    >
                      <item.icon className="h-3.5 w-3.5" />
                      {item.label}
                    </button>
                  )
                )}
                <div className="my-1 h-px bg-[var(--border-subtle)]" />
                <button
                  onClick={() => {
                    onDelete(form.id);
                    setMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Title + description */}
      <Link href={`/builder/${form.id}`} className="block flex-1">
        <h3 className="text-base font-semibold text-[var(--text-primary)] line-clamp-1 group-hover:text-[var(--brand-primary)] transition-colors duration-150">
          {form.title}
        </h3>
        <p className="mt-1.5 text-sm text-[var(--text-muted)] line-clamp-2 min-h-[2.5rem]">
          {form.description || "No description"}
        </p>
      </Link>

      {/* Stats footer */}
      <div className="mt-5 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">
            {form.response_count || 0}{" "}
            <span className="font-normal text-[var(--text-muted)]">
              {form.response_count === 1 ? "response" : "responses"}
            </span>
          </span>
          <span className="text-[var(--text-muted)] text-xs">
            {formatDate(form.updated_at)}
          </span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mt-4 flex items-center gap-2">
        <Link href={`/builder/${form.id}`} className="flex-1">
          <button className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all duration-150">
            Edit
          </button>
        </Link>
        <Link href={`/responses/${form.id}`} className="flex-1">
          <button className="w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all duration-150">
            Results
          </button>
        </Link>
        {isPublished && (
          <button
            onClick={handleCopyShareLink}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] transition-all duration-150"
            title="Copy public link"
          >
            {copied ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <ExternalLink className="h-4 w-4 text-[var(--text-muted)]" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
