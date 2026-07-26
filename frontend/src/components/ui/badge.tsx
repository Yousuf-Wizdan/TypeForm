import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-muted)] text-[var(--text-secondary)]",
        secondary:
          "bg-[var(--surface-muted)] text-[var(--text-muted)]",
        destructive:
          "bg-red-50 text-red-600",
        outline:
          "border border-[var(--border-strong)] text-[var(--text-muted)] bg-transparent",
        published:
          "bg-emerald-50 text-emerald-600",
        draft:
          "bg-amber-50 text-amber-600",
        accent:
          "bg-[var(--brand-surface)] text-[var(--brand-primary)]",
        partial:
          "bg-[var(--surface-muted)] text-[var(--text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

function StatusDot({ variant }: { variant: string }) {
  const colorMap: Record<string, string> = {
    published: "bg-emerald-400",
    draft: "bg-amber-400",
    accent: "bg-[var(--brand-primary)]",
    destructive: "bg-red-400",
    partial: "bg-[var(--text-muted)]",
    default: "bg-[var(--text-muted)]",
  };
  return <span className={`inline-block h-1.5 w-1.5 rounded-full ${colorMap[variant] || colorMap.default}`} />;
}

export { Badge, badgeVariants, StatusDot };
