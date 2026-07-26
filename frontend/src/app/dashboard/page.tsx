"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Form } from "@/lib/types";
import {
  fetchForms,
  createForm,
  duplicateForm,
  togglePublishForm,
  deleteForm,
  triggerReSeed,
} from "@/lib/api";
import { FormCard } from "@/components/dashboard/FormCard";
import { CreateFormModal } from "@/components/dashboard/CreateFormModal";
import { GoogleSignInModal } from "@/components/shared/GoogleSignInModal";
import { useToast } from "@/components/ui/toast";
import { useCurrentUserId } from "@/lib/auth";
import { useClerk, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  FileText,
  Globe,
  PenTool,
  Plus,
  Search,
  LayoutDashboard,
  LogOut,
  FolderOpen,
  MessageSquare,
  Briefcase,
  Calendar,
  Users,
  ArrowRight,
  Loader2,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { QuestionType } from "@/lib/types";
import { addQuestion } from "@/lib/api";

interface TemplateItem {
  id: string;
  category: "feedback" | "hiring" | "events" | "leads";
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  questionCount: number;
  questions: {
    type: QuestionType;
    title: string;
    properties?: any;
  }[];
}

const TEMPLATES: TemplateItem[] = [
  {
    id: "t1",
    category: "feedback",
    title: "Product Feedback & NPS",
    description: "Measure satisfaction, gather feature requests, and collect customer insights.",
    icon: MessageSquare,
    questionCount: 4,
    questions: [
      { type: "rating", title: "How likely are you to recommend us?", properties: { rating_scale: 10 } },
      { type: "multiple_choice", title: "Which feature do you use most?", properties: { options: ["Dashboard", "Builder", "Analytics", "Exports"] } },
      { type: "rating", title: "How would you rate ease of use?", properties: { rating_scale: 5 } },
      { type: "long_text", title: "What is the biggest improvement we could make?" },
    ],
  },
  {
    id: "t2",
    category: "hiring",
    title: "Job Application Intake",
    description: "Screen candidates with contact info, experience, and availability questions.",
    icon: Briefcase,
    questionCount: 4,
    questions: [
      { type: "short_text", title: "What is your full name?" },
      { type: "email", title: "What is your email address?" },
      { type: "short_text", title: "Link to your portfolio or GitHub" },
      { type: "multiple_choice", title: "Preferred work setup?", properties: { options: ["Remote", "Hybrid", "On-site"] } },
    ],
  },
  {
    id: "t3",
    category: "events",
    title: "Event Registration",
    description: "Collect RSVPs, dietary preferences, and session selections for your event.",
    icon: Calendar,
    questionCount: 4,
    questions: [
      { type: "short_text", title: "Attendee Name" },
      { type: "email", title: "Work Email Address" },
      { type: "multiple_choice", title: "Which track will you attend?", properties: { options: ["AI & Engineering", "Design & UX", "Product & Business"] } },
      { type: "yes_no", title: "Will you join the networking dinner?" },
    ],
  },
  {
    id: "t4",
    category: "leads",
    title: "Lead Qualification",
    description: "Qualify inbound leads by company size, budget, timeline, and pain points.",
    icon: Users,
    questionCount: 4,
    questions: [
      { type: "short_text", title: "Company Name" },
      { type: "multiple_choice", title: "Team size?", properties: { options: ["1-10", "11-50", "51-200", "201+"] } },
      { type: "multiple_choice", title: "Budget range?", properties: { options: ["Under $5k", "$5k-$15k", "$15k-$50k", "$50k+"] } },
      { type: "long_text", title: "Describe your main objective" },
    ],
  },
];

const TEMPLATE_CATEGORIES = [
  { id: "all", label: "All" },
  { id: "feedback", label: "Feedback" },
  { id: "hiring", label: "Hiring" },
  { id: "events", label: "Events" },
  { id: "leads", label: "Leads" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const clerk = useClerk();
  const { user: clerkUser } = useUser();
  const currentUserId = useCurrentUserId();

  const displayUser = useMemo(() => {
    if (clerkUser) {
      return {
        name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress || "User",
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        avatar: clerkUser.imageUrl || "",
      };
    }
    if (typeof window !== "undefined") {
      const googleUser = localStorage.getItem("tf_google_user");
      if (googleUser) {
        try {
          const parsed = JSON.parse(googleUser);
          return {
            name: parsed.name || parsed.email || "User",
            email: parsed.email || "",
            avatar: parsed.avatar || "",
          };
        } catch {}
      }
    }
    return null;
  }, [clerkUser]);
  const [forms, setForms] = useState<Form[]>([]);
  const [filteredForms, setFilteredForms] = useState<Form[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "draft" | "published"
  >("all");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [activeView, setActiveView] = useState<"forms" | "templates">("forms");
  const [templateCategory, setTemplateCategory] = useState<string>("all");
  const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const loadForms = async () => {
    try {
      setLoading(true);
      const data = await fetchForms(currentUserId ?? "default_creator");
      setForms(data);
      setFilteredForms(data);
    } catch (err) {
      console.error("Failed to load forms:", err);
      showToast("Failed to load forms", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId !== null) {
      loadForms();
    }
  }, [currentUserId]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();
    setFilteredForms(
      forms.filter((form) => {
        const matchesStatus =
          statusFilter === "all" || form.status === statusFilter;
        const matchesSearch =
          !query ||
          form.title.toLowerCase().includes(query) ||
          (form.description || "").toLowerCase().includes(query);
        return matchesStatus && matchesSearch;
      })
    );
  }, [forms, searchQuery, statusFilter]);

  const handleCreateForm = async (title: string, description: string) => {
    try {
      const newForm = await createForm(
        title,
        description,
        currentUserId ?? "default_creator"
      );
      setModalOpen(false);
      router.push(`/builder/${newForm.id}`);
    } catch {
      showToast("Failed to create new form", "error");
    }
  };

  const handleDuplicate = async (formId: string) => {
    try {
      await duplicateForm(formId);
      loadForms();
    } catch {
      showToast("Failed to duplicate form", "error");
    }
  };

  const handleTogglePublish = async (formId: string) => {
    try {
      await togglePublishForm(formId);
      loadForms();
    } catch {
      showToast("Failed to update publish state", "error");
    }
  };

  const handleDelete = async (formId: string) => {
    try {
      await deleteForm(formId);
      loadForms();
    } catch {
      showToast("Failed to delete form", "error");
    }
  };

  const stats = useMemo(() => {
    const totalForms = forms.length;
    const publishedForms = forms.filter(
      (f) => f.status === "published"
    ).length;
    const draftForms = totalForms - publishedForms;
    const totalResponses = forms.reduce(
      (sum, f) => sum + (f.response_count || 0),
      0
    );
    return [
      { label: "Total forms", value: totalForms, icon: FileText },
      { label: "Published", value: publishedForms, icon: Globe },
      { label: "Drafts", value: draftForms, icon: PenTool },
      { label: "Responses", value: totalResponses, icon: BarChart3 },
    ];
  }, [forms]);

  const handleSelectTemplate = async (template: TemplateItem) => {
    try {
      setLoadingTemplateId(template.id);
      const newForm = await createForm(
        template.title,
        template.description,
        currentUserId ?? "default_creator"
      );
      for (const q of template.questions) {
        await addQuestion(newForm.id, q.type, q.title, q.properties || {});
      }
      router.push(`/builder/${newForm.id}`);
    } catch {
      showToast("Failed to apply template", "error");
    } finally {
      setLoadingTemplateId(null);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("tf_google_user");
    try {
      await clerk.signOut();
    } catch {
      // Clerk not configured — fallback handled above
    }
    router.push("/");
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await triggerReSeed(currentUserId ?? "default_creator");
      showToast("Seeded sample forms successfully!", "success");
      await loadForms();
    } catch {
      showToast("Failed to seed sample data", "error");
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-[240px] shrink-0 border-r border-[var(--border-default)] bg-[var(--surface)] h-screen sticky top-0">
        <DashboardSidebar
          activeView={activeView}
          setActiveView={setActiveView}
          displayUser={displayUser}
          handleLogout={handleLogout}
          handleSeed={handleSeed}
          seeding={seeding}
        />
      </aside>

      {/* Mobile sidebar drawer */}
      {mobileSidebarOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-2xl animate-slide-in-left">
            <div className="flex h-full flex-col bg-[var(--surface)]">
              <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border-default)]">
                <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">typeform</span>
                <button onClick={() => setMobileSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-hover)]">
                  <X className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              </div>
              <DashboardSidebar
                activeView={activeView}
                setActiveView={(v) => { setActiveView(v); setMobileSidebarOpen(false); }}
                displayUser={displayUser}
                handleLogout={handleLogout}
                handleSeed={handleSeed}
                seeding={seeding}
              />
            </div>
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-[var(--background)]/90 backdrop-blur-xl border-b border-[var(--border-default)]">
          <div className="flex items-center justify-between h-[64px] px-4 lg:px-10 gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-secondary)] transition-all shrink-0"
              >
                <Menu className="h-5 w-5" />
              </button>
              <h1 className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight shrink-0">
                {activeView === "forms" ? "My forms" : "Templates"}
              </h1>
              {activeView === "forms" && (
                <div className="hidden sm:flex items-center gap-2.5 flex-1 max-w-[360px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2 shadow-sm transition-all duration-150 focus-within:border-[var(--brand-primary)]/40 focus-within:shadow-md">
                  <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or description..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {activeView === "forms" ? (
                ["all", "draft", "published"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() =>
                      setStatusFilter(filter as typeof statusFilter)
                    }
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                      statusFilter === filter
                        ? "bg-[var(--brand-primary)] text-white shadow-sm"
                        : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                    }`}
                  >
                    {filter === "all"
                      ? "All"
                      : filter === "draft"
                        ? "Drafts"
                        : "Published"}
                  </button>
                ))
              ) : (
                <div className="flex flex-wrap items-center gap-1.5">
                  {TEMPLATE_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setTemplateCategory(cat.id)}
                      className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-all duration-150 ${
                        templateCategory === cat.id
                          ? "bg-[var(--brand-primary)] text-white shadow-sm"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
              <div className="w-px h-5 bg-[var(--border-strong)] hidden sm:block" />
              <ThemeToggle />
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] text-white px-4 py-2.5 text-sm font-semibold hover:bg-[var(--brand-primary-hover)] hover:shadow-md hover:scale-[1.01] transition-all duration-200 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Create form</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="px-6 lg:px-10 py-8">
          {activeView === "forms" ? (
            <>
              {/* Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-5 transition-all duration-200 hover:border-[var(--border-strong)]"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-[var(--text-muted)]">
                          {stat.label}
                        </span>
                        <Icon
                          className="h-4 w-4 text-[var(--text-muted)]"
                          strokeWidth={1.5}
                        />
                      </div>
                      <div className="text-[28px] font-bold text-[var(--text-primary)] tracking-tight tabular-nums">
                        {stat.value}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile search */}
              <div className="sm:hidden mb-6">
                <div className="flex items-center gap-2.5 w-full rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-3.5 py-2.5 shadow-sm">
                  <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your forms..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                  />
                </div>
              </div>

              {/* Form grid */}
              {loading ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-6 animate-pulse"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="h-5 w-16 rounded-full bg-[var(--surface-muted)]" />
                        <div className="h-4 w-4 rounded bg-[var(--surface-muted)]" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-5 w-3/4 rounded bg-[var(--surface-muted)]" />
                        <div className="h-4 w-full rounded bg-[var(--surface-hover)]" />
                        <div className="h-4 w-2/3 rounded bg-[var(--surface-hover)]" />
                      </div>
                      <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                        <div className="h-4 w-20 rounded bg-[var(--surface-hover)]" />
                        <div className="h-4 w-16 rounded bg-[var(--surface-hover)]" />
                      </div>
                      <div className="mt-4 flex gap-2">
                        <div className="h-10 flex-1 rounded-xl bg-[var(--surface-hover)]" />
                        <div className="h-10 flex-1 rounded-xl bg-[var(--surface-hover)]" />
                        <div className="h-10 w-10 rounded-xl bg-[var(--surface-hover)]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredForms.length > 0 ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredForms.map((form) => (
                    <FormCard
                      key={form.id}
                      form={form}
                      onDuplicate={handleDuplicate}
                      onTogglePublish={handleTogglePublish}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/50 px-6 text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--surface-muted)]">
                    <FileText
                      className="h-7 w-7 text-[var(--text-subtle)]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    No forms found
                  </h3>
                  <p className="mt-2 text-sm text-[var(--text-muted)] max-w-sm">
                    {searchQuery
                      ? "No forms match your search. Try a different term or clear the filter."
                      : "Create your first form to start collecting responses. It takes less than a minute."}
                  </p>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="mt-6 flex items-center gap-1.5 rounded-xl bg-[var(--brand-primary)] text-white px-5 py-2.5 text-sm font-semibold hover:bg-[var(--brand-primary-hover)] transition-all duration-200 shadow-sm"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first form
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {TEMPLATES.filter(
                (t) => templateCategory === "all" || t.category === templateCategory
              ).map((tpl) => {
                const IconComponent = tpl.icon;
                const isLoading = loadingTemplateId === tpl.id;
                return (
                  <div
                    key={tpl.id}
                    className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface)] p-6 transition-all duration-200 hover:border-[var(--border-strong)] hover:shadow-md flex flex-col justify-between"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.03)" }}
                  >
                    <div className="space-y-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--surface-muted)] text-[var(--text-secondary)] group-hover:bg-[var(--brand-surface)] group-hover:text-[var(--brand-primary)] transition-colors duration-200">
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {tpl.title}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)] mt-1.5 leading-relaxed line-clamp-2">
                          {tpl.description}
                        </p>
                      </div>
                    </div>
                    <div className="pt-5 space-y-3">
                      <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)] border-t border-[var(--border-subtle)] pt-4">
                        <span>{tpl.questionCount} questions</span>
                      </div>
                      <Button
                        onClick={() => handleSelectTemplate(tpl)}
                        disabled={isLoading || loadingTemplateId !== null}
                        variant="outline"
                        className="w-full gap-2 rounded-xl border-[var(--border-strong)] hover:bg-[var(--brand-primary)] hover:text-white hover:border-[var(--brand-primary)] font-semibold text-xs transition-all duration-200 h-10"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            Use template
                            <ArrowRight className="h-3.5 w-3.5" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <CreateFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateForm}
      />
      <GoogleSignInModal
        open={googleModalOpen}
        onOpenChange={setGoogleModalOpen}
        onSuccess={() => {}}
      />
    </div>
  );
}

function DashboardSidebar({
  activeView,
  setActiveView,
  displayUser,
  handleLogout,
  handleSeed,
  seeding,
}: {
  activeView: "forms" | "templates";
  setActiveView: (v: "forms" | "templates") => void;
  displayUser: { name: string; email: string; avatar: string } | null;
  handleLogout: () => void;
  handleSeed: () => void;
  seeding: boolean;
}) {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="hidden lg:block px-5 py-6">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" className="shrink-0">
            <rect width="32" height="32" rx="8" fill="#7c5cfc" />
            <path d="M10 12h5v8h-5zM17 10h5v10h-5z" fill="white" fillOpacity="0.9" />
          </svg>
          <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">typeform</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        <button
          onClick={() => setActiveView("forms")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
            activeView === "forms"
              ? "bg-[var(--brand-surface)] text-[var(--brand-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <LayoutDashboard className="h-4 w-4" strokeWidth={1.5} />
          My forms
        </button>
        <button
          onClick={() => setActiveView("templates")}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full text-left ${
            activeView === "templates"
              ? "bg-[var(--brand-surface)] text-[var(--brand-primary)]"
              : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
          }`}
        >
          <FolderOpen className="h-4 w-4" strokeWidth={1.5} />
          Templates
        </button>
      </nav>

      <div className="px-3 pb-6 space-y-1">
        <div className="h-px bg-[var(--border-subtle)] mb-4 mx-3" />
        {displayUser && (
          <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
            {displayUser.avatar ? (
              <img src={displayUser.avatar} alt={displayUser.name} className="h-7 w-7 rounded-full object-cover shrink-0" />
            ) : (
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-xs font-semibold shrink-0">
                {displayUser.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--text-primary)] truncate">{displayUser.name}</p>
              {displayUser.email && <p className="text-[11px] text-[var(--text-muted)] truncate">{displayUser.email}</p>}
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-red-500 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
          Sign out
        </button>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] hover:text-[var(--brand-primary)] hover:bg-[var(--brand-surface)] transition-all duration-150 disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${seeding ? "animate-spin" : ""}`} strokeWidth={1.5} />
          {seeding ? "Seeding..." : "Seed data"}
        </button>
      </div>
    </div>
  );
}
