"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Form } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Eye,
  Share2,
  Globe,
  CheckCircle2,
  BarChart3,
  ChevronDown,
} from "lucide-react";

interface BuilderHeaderProps {
  form: Form;
  activeTab: "create" | "logic" | "theme" | "results";
  onTabChange: (tab: "create" | "logic" | "theme" | "results") => void;
  onTitleChange: (newTitle: string) => void;
  onTogglePublish: () => void;
  onOpenPreview: () => void;
}

export const BuilderHeader: React.FC<BuilderHeaderProps> = ({
  form,
  activeTab,
  onTabChange,
  onTitleChange,
  onTogglePublish,
  onOpenPreview,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleText, setTitleText] = useState(form.title);
  const [copied, setCopied] = useState(false);
  const [mobileTabOpen, setMobileTabOpen] = useState(false);

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleText.trim() && titleText !== form.title) {
      onTitleChange(titleText.trim());
    }
  };

  const handleCopyShare = () => {
    const publicUrl = `${window.location.origin}/to/${form.share_id}`;
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPublished = form.status === "published";

  return (
    <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between border-b border-[var(--border-default)] bg-[var(--background)]/90 backdrop-blur-xl px-3 lg:px-6 gap-2">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0 shrink-0">
        <Link
          href="/dashboard"
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-secondary)] transition-all duration-150"
          title="Back to My Forms"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="flex items-center gap-1.5 min-w-0">
          {isEditingTitle ? (
            <input
              type="text"
              value={titleText}
              onChange={(e) => setTitleText(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleTitleSubmit()}
              autoFocus
              className="w-full max-w-[160px] sm:max-w-none rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-1.5 text-sm font-semibold text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:ring-offset-1"
            />
          ) : (
            <h1
              onClick={() => setIsEditingTitle(true)}
              className="cursor-pointer truncate text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--text-muted)] transition-colors max-w-[140px] sm:max-w-[280px]"
              title="Click to rename"
            >
              {form.title}
            </h1>
          )}

          <Badge
            variant={isPublished ? "published" : "draft"}
            className="shrink-0 text-[10px] font-medium"
          >
            {isPublished ? "Published" : "Draft"}
          </Badge>
        </div>
      </div>

      {/* Center tabs - desktop */}
      <div className="hidden md:flex items-center gap-0.5 p-1 bg-[var(--surface)] rounded-xl border border-[var(--border-default)] shadow-sm">
        {[
          { key: "create" as const, label: "Create" },
          { key: "logic" as const, label: "Logic" },
          { key: "theme" as const, label: "Design" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
              activeTab === tab.key
                ? "bg-[var(--brand-primary)] text-white shadow-sm"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <Link
          href={`/responses/${form.id}`}
          className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-lg text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all duration-150"
        >
          <BarChart3 className="h-3 w-3" /> Results
        </Link>
      </div>

      {/* Mobile tab dropdown */}
      <div className="md:hidden relative">
        <button
          onClick={() => setMobileTabOpen(!mobileTabOpen)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-[var(--surface)] border border-[var(--border-default)] text-[var(--text-secondary)]"
        >
          {activeTab === "create" ? "Create" : activeTab === "logic" ? "Logic" : activeTab === "theme" ? "Design" : "Results"}
          <ChevronDown className="h-3 w-3" />
        </button>
        {mobileTabOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMobileTabOpen(false)} />
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 z-50 w-36 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] p-1 shadow-xl">
              {[
                { key: "create" as const, label: "Create" },
                { key: "logic" as const, label: "Logic" },
                { key: "theme" as const, label: "Design" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { onTabChange(tab.key); setMobileTabOpen(false); }}
                  className={`w-full px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all duration-150 ${
                    activeTab === tab.key
                      ? "bg-[var(--brand-surface)] text-[var(--brand-primary)]"
                      : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="my-0.5 h-px bg-[var(--border-subtle)]" />
              <Link
                href={`/responses/${form.id}`}
                onClick={() => setMobileTabOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-all duration-150"
              >
                <BarChart3 className="h-3.5 w-3.5" /> Results
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenPreview}
          className="gap-1 rounded-xl h-8 px-2.5 sm:px-3 sm:h-9 text-xs font-semibold"
        >
          <Eye className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Preview</span>
        </Button>

        {isPublished && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyShare}
            className="gap-1 rounded-xl h-8 px-2.5 sm:px-3 sm:h-9 text-xs font-semibold"
          >
            {copied ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Share2 className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Share"}
            </span>
          </Button>
        )}

        <Button
          variant={isPublished ? "secondary" : "default"}
          size="sm"
          onClick={onTogglePublish}
          className="gap-1 rounded-xl h-8 px-2.5 sm:px-3 sm:h-9 text-xs font-semibold"
        >
          <Globe className="h-3.5 w-3.5" />
          <span>{isPublished ? "Unpublish" : "Publish"}</span>
        </Button>
      </div>
    </header>
  );
};
