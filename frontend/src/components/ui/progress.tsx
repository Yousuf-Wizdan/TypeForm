import * as React from "react";
import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  indicatorColor?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, indicatorColor, ...props }, ref) => (
    <div
      ref={ref}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${value}% complete`}
      className={cn(
        "relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--border-strong)]",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 transition-all duration-500 ease-out rounded-full"
        style={{
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: indicatorColor || "var(--brand-primary)",
        }}
      />
    </div>
  )
);
Progress.displayName = "Progress";

export { Progress };
