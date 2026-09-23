import { Input } from "@/components/ui/input";

export type CustomerFormProps = {
  value: string;
  onChange?: ((value: string) => void) | undefined;
  error?: string | undefined;
  disabled?: boolean | undefined;
};

export function CustomerForm({ value, onChange, error, disabled }: CustomerFormProps) {
  return (
    <div className="space-y-2">
      <Input
        label="Email"
        type="email"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="name@example.com"
        disabled={disabled}
        error={error}
        autoComplete="email"
      />
    </div>
  );
}
