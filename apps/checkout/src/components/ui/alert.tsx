import * as React from "react";
import { cn } from "@/lib/utils";

export type AlertVariant = "default" | "destructive" | "success";

export type AlertProps = React.HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
};

const variantClasses: Record<AlertVariant, string> = {
  default: "border-slate-200 bg-slate-50 text-slate-700",
  destructive: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4 text-sm",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("mb-1 font-semibold", className)} {...props} />;
}

export function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm leading-6 opacity-90", className)} {...props} />;
}
