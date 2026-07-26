"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/shared/GoogleSignInModal";
import { InteractiveSandbox } from "./InteractiveSandbox";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onOpenCreateModal: () => void;
  onOpenGoogleModal: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onOpenCreateModal,
  onOpenGoogleModal,
}) => {
  return (
    <section className="relative overflow-hidden bg-[var(--background)]">
      <div className="mx-auto max-w-[1400px] px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center pt-20 pb-16 lg:pt-28 lg:pb-24">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold leading-[1.08] tracking-[-0.02em] text-[var(--text-primary)]">
                Forms that feel
                <br />
                like a conversation
              </h1>
              <p className="text-base sm:text-lg text-[var(--text-muted)] leading-relaxed max-w-[500px]">
                Build beautiful, conversational forms with one question at a
                time. Publish via shareable links, collect responses through
                smooth flows, and analyze results in real time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-start gap-3 pt-2">
              <Button
                onClick={onOpenCreateModal}
                size="lg"
                className="gap-2 text-sm font-semibold h-12 px-7"
              >
                Create a free form
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={onOpenGoogleModal}
                variant="outline"
                size="lg"
                className="gap-2 text-sm font-semibold h-12 px-7"
              >
                <GoogleIcon className="h-4 w-4" />
                Sign in
              </Button>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              No credit card required. Free to get started.
            </p>
          </motion.div>

          {/* Right interactive sandbox */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            <InteractiveSandbox onCompleteAction={onOpenCreateModal} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
