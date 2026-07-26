"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { createForm } from "@/lib/api";
import { useCurrentUserId } from "@/lib/auth";
import { Header } from "@/components/shared/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesGrid } from "@/components/home/FeaturesGrid";
import { TemplateGallery } from "@/components/home/TemplateGallery";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { PricingSection } from "@/components/home/PricingSection";
import { FooterSection } from "@/components/home/FooterSection";
import { CreateFormModal } from "@/components/dashboard/CreateFormModal";
import { GoogleSignInModal } from "@/components/shared/GoogleSignInModal";

export default function HomePage() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useUser();
  const currentUserId = useCurrentUserId();
  const [modalOpen, setModalOpen] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    email: string;
    avatar?: string;
  } | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    const stored = localStorage.getItem("tf_google_user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch {}
    }
  }, []);

  if (!isLoaded || isSignedIn) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--brand-primary)]" />
      </div>
    );
  }

  const handleCreateForm = async (title: string, description: string) => {
    if (!isSignedIn && !currentUser) {
      setModalOpen(false);
      setGoogleModalOpen(true);
      return;
    }
    const newForm = await createForm(
      title,
      description,
      currentUserId ?? "default_creator"
    );
    setModalOpen(false);
    router.push(`/builder/${newForm.id}`);
  };

  const handleOpenCreateModal = () => {
    if (!isSignedIn && !currentUser) {
      setGoogleModalOpen(true);
      return;
    }
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <Header
        onCreateNew={handleOpenCreateModal}
        user={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
      />

      <main>
        <HeroSection
          onOpenCreateModal={handleOpenCreateModal}
          onOpenGoogleModal={() => setGoogleModalOpen(true)}
        />
        <FeaturesGrid />
        <TemplateGallery />
        <TestimonialsSection />
        <PricingSection onSelectPlan={handleOpenCreateModal} />
        <FooterSection />
      </main>

      <CreateFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSubmit={handleCreateForm}
      />

      <GoogleSignInModal
        open={googleModalOpen}
        onOpenChange={setGoogleModalOpen}
        onSuccess={(user) => setCurrentUser(user)}
      />
    </div>
  );
};
