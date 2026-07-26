import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--brand-primary)] text-white shadow-sm hover:bg-[var(--brand-primary-hover)] hover:shadow-md hover:scale-[1.01]",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600",
        outline:
          "border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-hover)] hover:border-[var(--border-strong)] hover:scale-[1.01]",
        secondary:
          "bg-[var(--surface-muted)] text-[var(--text-primary)] shadow-sm hover:bg-[var(--surface-hover)]",
        ghost:
          "text-[var(--text-secondary)] hover:bg-[var(--surface-muted)] hover:text-[var(--text-primary)]",
        link: "text-[var(--brand-primary)] underline-offset-4 hover:underline",
        typeform:
          "bg-[var(--brand-primary)] text-white font-semibold shadow-sm hover:bg-[var(--brand-primary-hover)] hover:shadow-md hover:scale-[1.01]",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-7 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
