import * as React from "react";
import { cn } from "@/lib/utils";

export type SpinnerProps = React.SVGProps<SVGSVGElement> & {
  size?: "sm" | "md" | "lg";
};

const sizeClasses: Record<NonNullable<SpinnerProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export function Spinner({ className, size = "md", ...props }: SpinnerProps) {
  return (
    <svg
      aria-label="Loading"
      role="status"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "animate-spin text-current",
        sizeClasses[size],
        className,
      )}
      {...props}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M12 2.5a9.5 9.5 0 0 1 9.5 9.5"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <style>{`@media (prefers-reduced-motion: reduce) { svg { animation: none !important; } }`}</style>
    </svg>
  );
}
