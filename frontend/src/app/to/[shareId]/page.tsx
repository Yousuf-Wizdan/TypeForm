"use client";

import React, { useEffect, useState, use } from "react";
import { PublicForm } from "@/lib/types";
import { fetchPublicForm } from "@/lib/api";
import { RespondentFlow } from "@/components/respondent/RespondentFlow";
import { Loader2, AlertCircle } from "lucide-react";

export default function PublicRespondentPage({ params }: { params: Promise<{ shareId: string }> }) {
  const resolvedParams = use(params);
  const shareId = resolvedParams.shareId;

  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPublicForm() {
      try {
        setLoading(true);
        const data = await fetchPublicForm(shareId);
        setForm(data);
      } catch (err: any) {
        setError(err?.response?.data?.detail || "This form is unavailable or has been removed.");
      } finally {
        setLoading(false);
      }
    }
    loadPublicForm();
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--text-subtle)]" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center p-6 text-center bg-[var(--background)]">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 mb-5">
          <AlertCircle className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-[var(--text-primary)]">Form Not Found</h1>
        <p className="text-sm text-[var(--text-muted)] mt-1.5 max-w-sm">{error}</p>
      </div>
    );
  }

  return <RespondentFlow form={form} />;
}
