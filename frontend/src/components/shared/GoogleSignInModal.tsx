"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SignInButton } from "@clerk/nextjs";
import { ShieldCheck, Loader2 } from "lucide-react";

interface GoogleSignInModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (user: { name: string; email: string; avatar?: string }) => void;
}

export function GoogleIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

const isClerkEnabled = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export const GoogleSignInModal: React.FC<GoogleSignInModalProps> = ({
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [selectedDemoUser, setSelectedDemoUser] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const demoAccounts = [
    {
      name: "Alex Rivera",
      email: "alex.rivera@example.com",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      role: "Lead Form Creator",
    },
    {
      name: "Sarah Chen",
      email: "sarah.chen@techsummit.io",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      role: "Product Manager",
    },
  ];

  const handleSimulatedGoogleLogin = (acc: (typeof demoAccounts)[0]) => {
    setIsLoggingIn(true);
    setSelectedDemoUser(acc.email);
    setTimeout(() => {
      setIsLoggingIn(false);
      onSuccess?.(acc);
      onOpenChange(false);
    }, 600);
  };

  const content = (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--brand-surface)] ring-1 ring-inset ring-[var(--brand-primary)]/10">
          <GoogleIcon className="h-8 w-8" />
        </div>
        <div className="mt-5">
          <DialogTitle>Sign in to continue</DialogTitle>
          <DialogDescription className="mt-2">
            Create forms, collect responses, and share with anyone.
          </DialogDescription>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="w-full mt-8 space-y-4"
      >
        {isClerkEnabled ? (
          <div className="flex justify-center">
            <SignInButton mode="modal">
              <Button className="w-full h-12 gap-3 font-semibold bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-hover)]">
                <GoogleIcon className="h-5 w-5" />
                <span>Continue with Google</span>
              </Button>
            </SignInButton>
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => handleSimulatedGoogleLogin(demoAccounts[0])}
              disabled={isLoggingIn}
              className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-[var(--brand-primary)] text-white font-semibold text-sm shadow-sm hover:bg-[var(--brand-primary-hover)] active:scale-[0.98] transition-all duration-200"
            >
              <GoogleIcon className="h-5 w-5" />
              <span>Continue with Google</span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border-strong)]" />
              <span className="text-xs font-medium text-[var(--text-muted)]">
                or pick a demo account
              </span>
              <div className="flex-1 h-px bg-[var(--border-strong)]" />
            </div>

            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                onClick={() => handleSimulatedGoogleLogin(acc)}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-[var(--border-strong)] bg-[var(--surface)] hover:border-[var(--brand-primary)]/30 hover:bg-[var(--brand-surface)] transition-all duration-200 text-left group"
              >
                <div className="flex items-center gap-3">
                  {selectedDemoUser === acc.email && isLoggingIn ? (
                    <div className="h-10 w-10 rounded-full bg-[var(--brand-surface)] flex items-center justify-center">
                    <Loader2 className="h-5 w-5 text-[var(--brand-primary)] animate-spin" />
                    </div>
                  ) : (
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="h-10 w-10 rounded-full object-cover ring-1 ring-[var(--border-strong)] group-hover:ring-[var(--brand-primary)]/20 transition-all"
                    />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-[var(--text-primary)] flex items-center gap-1.5">
                      {acc.name}
                      {selectedDemoUser === acc.email && isLoggingIn ? null : (
                        <ShieldCheck className="h-3.5 w-3.5 text-[var(--brand-primary)]/70" />
                      )}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">{acc.email}</div>
                  </div>
                </div>
                <GoogleIcon className="h-4 w-4 opacity-50 group-hover:opacity-100 transition-opacity shrink-0" />
              </button>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-[var(--brand-surface)] p-3.5 text-xs text-[var(--text-muted)] flex items-start gap-2.5 ring-1 ring-inset ring-[var(--brand-primary)]/8">
          <ShieldCheck className="h-4 w-4 text-[var(--brand-primary)] shrink-0 mt-px" />
          <span className="leading-relaxed">
            Signing in unlocks form publishing, live responses, logic rules, and
            custom themes.
          </span>
        </div>
      </motion.div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <AnimatePresence mode="wait">
        {open && (
          <motion.div
            key="modal-content"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
};
