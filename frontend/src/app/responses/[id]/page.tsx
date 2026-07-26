"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { Form, FormSummary, ResponseDetail } from "@/lib/types";
import {
  fetchFormDetails,
  fetchFormSummary,
  fetchFormResponses,
} from "@/lib/api";
import { SummaryCharts } from "@/components/responses/SummaryCharts";
import { ResponsesTable } from "@/components/responses/ResponsesTable";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  List,
  FileEdit,
} from "lucide-react";

export default function ResponsesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const formId = resolvedParams.id;

  const [form, setForm] = useState<Form | null>(null);
  const [summary, setSummary] = useState<FormSummary | null>(null);
  const [responses, setResponses] = useState<ResponseDetail[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [formData, summaryData, responsesData] = await Promise.all([
        fetchFormDetails(formId),
        fetchFormSummary(formId),
        fetchFormResponses(formId),
      ]);
      setForm(formData);
      setSummary(summaryData);
      setResponses(responsesData);
    } catch (err) {
      console.error("Failed to load responses data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [formId]);

  if (loading || !form || !summary) {
    return (
      <div className="min-h-screen bg-[var(--background)]">
        <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border-default)]">
          <div className="mx-auto max-w-[1400px] flex items-center h-[60px] px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[var(--border-strong)] animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-4 w-32 rounded-md bg-[var(--border-strong)] animate-pulse" />
                <div className="h-3 w-16 rounded-md bg-[var(--surface-muted)] animate-pulse" />
              </div>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-8 space-y-6">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-[var(--border-strong)] animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-12 rounded bg-[var(--border-strong)] animate-pulse" />
                  <div className="h-2.5 w-16 rounded bg-[var(--surface-muted)] animate-pulse" />
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-[var(--border-default)] bg-[var(--surface)] overflow-hidden">
            <div className="h-9 border-b border-[var(--border-default)] bg-[var(--surface-muted)] px-5 flex items-center gap-6">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="h-3 w-16 rounded bg-[var(--border-strong)] animate-pulse" />
              ))}
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-9 border-b border-[var(--border-subtle)] px-5 flex items-center gap-6">
                {[1,2,3,4,5].map(j => (
                  <div key={j} className="h-3 w-14 rounded bg-[var(--surface-muted)] animate-pulse" />
                ))}
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-40 bg-[var(--background)]/95 backdrop-blur-xl border-b border-[var(--border-default)]">
        <div className="mx-auto max-w-[1400px] flex items-center justify-between h-[60px] px-6 lg:px-10 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-secondary)] transition-all duration-150 shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0">
              <h1 className="text-sm font-bold text-[var(--text-primary)] truncate">
                {form.title}
              </h1>
              <p className="text-[11px] text-[var(--text-muted)] font-medium">
                Responses
              </p>
            </div>
          </div>

          <Link href={`/builder/${form.id}`}>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
            >
              <FileEdit className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] px-6 lg:px-10 py-6">
        <Tabs defaultValue="summary">
          <TabsList className="bg-[var(--surface)] border border-[var(--border-default)] p-1 rounded-lg shadow-sm mb-6">
            <TabsTrigger
              value="summary"
              className="gap-1.5 text-[12px] font-semibold rounded-md px-3 py-1"
            >
              <BarChart3 className="h-3.5 w-3.5" /> Insights
            </TabsTrigger>
            <TabsTrigger
              value="responses"
              className="gap-1.5 text-[12px] font-semibold rounded-md px-3 py-1"
            >
              <List className="h-3.5 w-3.5" /> Responses ({responses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <SummaryCharts summary={summary} />
          </TabsContent>

          <TabsContent value="responses">
            <ResponsesTable formId={form.id} responses={responses} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
