"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserButton,
  useUser,
  SignedIn,
  SignedOut,
  SignInButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { GoogleSignInModal, GoogleIcon } from "./GoogleSignInModal";
import { ThemeToggle } from "./ThemeToggle";
import {
  Search,
  Plus,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";

interface HeaderProps {
  onSearchChange?: (term: string) => void;
  onCreateNew?: () => void;
  dashboardMode?: boolean;
  user?: { name: string; email: string; avatar?: string } | null;
  onLogin?: (user: { name: string; email: string; avatar?: string }) => void;
  onLogout?: () => void;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  formsCount?: number;
}

const isClerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const Header: React.FC<HeaderProps> = ({
  onSearchChange,
  onCreateNew,
  dashboardMode,
  user: userProp,
  onLogin,
  onLogout,
  activeTab = "home",
  onTabChange,
  formsCount = 0,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localUser, setLocalUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);
  const { isSignedIn: clerkSignedIn } = useUser();

  useEffect(() => {
    if (userProp !== undefined) {
      setLocalUser(userProp);
    } else {
      const stored = localStorage.getItem("tf_google_user");
      if (stored) {
        try {
          setLocalUser(JSON.parse(stored));
        } catch {}
      }
    }
  }, [userProp]);

  const handleGoogleSuccess = (userData: {
    name: string;
    email: string;
    avatar?: string;
  }) => {
    setLocalUser(userData);
    localStorage.setItem("tf_google_user", JSON.stringify(userData));
    onLogin?.(userData);
  };

  const handleLogout = () => {
    setLocalUser(null);
    localStorage.removeItem("tf_google_user");
    onLogout?.();
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearchChange?.(e.target.value);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (activeTab !== "home") {
      onTabChange?.("home");
      setTimeout(() => {
        const el = document.getElementById(id);
        el?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const activeUser = userProp !== undefined ? userProp : localUser;
  const isDashboardMode = dashboardMode ?? Boolean(onSearchChange);
  const isLoggedIn = isClerkEnabled ? clerkSignedIn : !!activeUser;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[var(--border-default)] bg-[var(--background)]/90 backdrop-blur-xl supports-[backdrop-filter]:bg-[var(--background)]/80">
      <div className="mx-auto flex h-[72px] max-w-[1400px] items-center justify-between px-6 lg:px-10">
        {/* Logo */}
        <div className="flex items-center gap-6 lg:gap-10">
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              className="shrink-0"
            >
              <rect width="32" height="32" rx="8" fill="#7c5cfc" />
              <path
                d="M10 12h5v8h-5zM17 10h5v10h-5z"
                fill="white"
                fillOpacity="0.9"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[var(--text-primary)]">
              typeform
            </span>
          </Link>

          {/* Center nav - landing mode */}
          {!isDashboardMode && !isLoggedIn && (
            <nav className="hidden lg:flex items-center gap-8">
              {[
                { label: "Features", id: "features" },
                { label: "Templates", id: "templates" },
                { label: "Testimonials", id: "testimonials" },
                { label: "Pricing", id: "pricing" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-150"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          )}

          {/* Center nav - dashboard mode */}
          {isDashboardMode && (
            <div className="hidden lg:flex items-center gap-1 ml-4">
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 ${
                  activeTab === "dashboard"
                    ? "bg-[var(--surface)] text-[var(--text-primary)] shadow-sm border border-[var(--border-default)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface)]/60"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                My forms
              </Link>
            </div>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search (dashboard only) */}
          {isDashboardMode && (
            <div className="hidden md:flex items-center gap-2.5 min-w-[280px] rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 shadow-sm transition-all duration-150 focus-within:border-[var(--brand-primary)]/40 focus-within:shadow-md">
              <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
              <input
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search your forms..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)] text-[var(--text-primary)]"
              />
              {formsCount > 0 && (
                <span className="text-xs text-[var(--text-muted)] shrink-0 tabular-nums">
                  {formsCount}
                </span>
              )}
            </div>
          )}

          {/* Theme toggle */}
          <ThemeToggle />

          {/* User area or CTA */}
          {isClerkEnabled ? (
            <>
              <SignedIn>
                <div className="hidden sm:flex items-center gap-2">
                  {onCreateNew && (
                    <Button
                      onClick={onCreateNew}
                      size="sm"
                      className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create form
                    </Button>
                  )}
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
              <SignedOut>
                <div className="hidden sm:flex items-center gap-2">
                  {onCreateNew && (
                    <Button
                      onClick={onCreateNew}
                      size="sm"
                      className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create form
                    </Button>
                  )}
                  <SignInButton mode="modal">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
                    >
                      <GoogleIcon className="h-3.5 w-3.5" />
                      Sign in
                    </Button>
                  </SignInButton>
                </div>
              </SignedOut>
            </>
          ) : activeUser ? (
            <div className="hidden sm:flex items-center gap-2">
              {onCreateNew && (
                <Button
                  onClick={onCreateNew}
                  size="sm"
                  className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create form
                </Button>
              )}
              <div className="flex items-center gap-2 bg-[var(--surface)]/80 py-1 pl-3 pr-1.5 rounded-full border border-[var(--border-strong)] shadow-sm">
                {activeUser.avatar ? (
                  <img
                    src={activeUser.avatar}
                    alt={activeUser.name}
                    className="h-6 w-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--brand-primary)] text-white text-[11px] font-semibold">
                    {activeUser.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="max-w-[100px] truncate text-xs font-medium text-[var(--text-secondary)]">
                  {activeUser.name}
                </span>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              {onCreateNew && (
                <Button
                  onClick={onCreateNew}
                  size="sm"
                  className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create form
                </Button>
              )}
              <Button
                onClick={() => setGoogleModalOpen(true)}
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-xl h-9 text-xs font-semibold"
              >
                <GoogleIcon className="h-3.5 w-3.5" />
                Sign in
              </Button>
            </div>
          )}

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center rounded-xl p-2 text-[var(--text-muted)] transition-colors hover:bg-[var(--surface-muted)] lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="space-y-4 border-b border-[var(--border-default)] bg-[var(--background)] px-6 py-5 lg:hidden"
          style={{ animation: "fade-in 0.2s ease-out" }}
        >
          {isDashboardMode ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] px-4 py-2.5 shadow-sm">
                <Search className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
                <input
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search your forms..."
                  className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--text-muted)]"
                />
              </div>
              <p className="text-xs text-[var(--text-muted)]">
                {formsCount} forms in workspace
              </p>
            </div>
          ) : !isLoggedIn ? (
            <div className="flex flex-col gap-0.5">
              {[
                { label: "Features", id: "features" },
                { label: "Templates", id: "templates" },
                { label: "Testimonials", id: "testimonials" },
                { label: "Pricing", id: "pricing" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center justify-between py-2.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
                </button>
              ))}
            </div>
          ) : (
            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2.5 text-sm font-medium text-[var(--text-primary)]"
            >
              <span className="flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </span>
              <ChevronRight className="h-4 w-4 text-[var(--text-muted)]" />
            </Link>
          )}

          <div className="flex items-center justify-between border-t border-[var(--border-default)] pt-4">

            {!activeUser && !isClerkEnabled && (
              <button
                onClick={() => {
                  setGoogleModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-primary)]"
              >
                <GoogleIcon className="h-3.5 w-3.5" />
                Sign In
              </button>
            )}

            {activeUser && (
              <button
                onClick={handleLogout}
                className="text-xs font-medium text-red-500"
              >
                Sign Out
              </button>
            )}
          </div>

          {/* Mobile create CTA */}
          {onCreateNew && (
            <Button
              onClick={() => {
                onCreateNew();
                setMobileMenuOpen(false);
              }}
              className="w-full gap-1.5 rounded-xl h-11 text-sm font-semibold"
            >
              <Plus className="h-4 w-4" />
              Create form
            </Button>
          )}
        </div>
      )}

      <GoogleSignInModal
        open={googleModalOpen}
        onOpenChange={setGoogleModalOpen}
        onSuccess={handleGoogleSuccess}
      />
    </header>
  );
};
