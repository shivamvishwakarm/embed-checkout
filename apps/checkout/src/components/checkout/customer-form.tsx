"use client";

import { Input } from "@/components/ui/input";

export type CustomerFormProps = {
  value: string;
  onChange?: ((value: string) => void) | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
  autoFocus?: boolean | undefined;
};

export function CustomerForm({ value, onChange, error, disabled, autoFocus }: CustomerFormProps) {
  return (
    <div className="space-y-1.5">
      <Input
        id="customer-email"
        label="Email address"
        type="email"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="eg. john.doe@example.com"
        disabled={disabled}
        error={error}
        autoComplete="email"
        autoFocus={autoFocus}
        required
      />
    </div>
  );
}
