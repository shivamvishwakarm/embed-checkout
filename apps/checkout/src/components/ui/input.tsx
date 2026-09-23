import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: React.ReactNode | undefined;
  error?: string | undefined;
  description?: React.ReactNode | undefined;
};

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", label, error, description, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const helperId = error ? `${inputId}-error` : description ? `${inputId}-description` : undefined;

    return (
      <div className="space-y-2">
        {label ? (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        ) : null}

        <input
          id={inputId}
          type={type}
          ref={ref}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={helperId}
          className={cn(
            "flex h-11 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors",
            "placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200",
            error && "border-red-300 focus:border-red-400 focus:ring-red-100",
            className,
          )}
          {...props}
        />

        {description && !error ? (
          <p id={helperId} className="text-xs text-slate-500">
            {description}
          </p>
        ) : null}

        {error ? (
          <p id={helperId} className="text-xs text-red-600">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = "Input";
