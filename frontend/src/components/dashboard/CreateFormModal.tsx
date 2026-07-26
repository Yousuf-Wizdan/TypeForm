"use client";

import React, { useState } from "react";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (title: string, description: string) => void;
}

export const CreateFormModal: React.FC<CreateFormModalProps> = ({ open, onOpenChange, onSubmit }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    onSubmit(title.trim(), description.trim());
    setTitle("");
    setDescription("");
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTitle>Create new form</DialogTitle>
      <DialogDescription>Give your form a title and optional description to get started building.</DialogDescription>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Form Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="e.g. Customer Satisfaction Survey"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
            Description <span className="text-zinc-400 font-normal">(optional)</span>
          </label>
          <Textarea
            placeholder="Brief description of what this form collects..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !title.trim()}>
            {loading ? "Creating..." : "Create form"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
