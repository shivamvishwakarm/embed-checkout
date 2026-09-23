import { Input } from "@/components/ui/input";

export type CardFormProps = {
  cardNumber: string;
  expiry: string;
  cvv: string;
  onChange?: ((field: "cardNumber" | "expiry" | "cvv", value: string) => void) | undefined;
  errors?: Partial<Record<"cardNumber" | "expiry" | "cvv", string>> | undefined;
  disabled?: boolean | undefined;
};

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function CardForm({
  cardNumber,
  expiry,
  cvv,
  onChange,
  errors,
  disabled,
}: CardFormProps) {
  return (
    <div className="space-y-4">
      <Input
        label="Card number"
        type="text"
        inputMode="numeric"
        value={cardNumber}
        onChange={(event) => onChange?.("cardNumber", formatCardNumber(event.target.value))}
        placeholder="4242 4242 4242 4242"
        disabled={disabled}
        error={errors?.cardNumber}
        autoComplete="cc-number"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiry"
          type="text"
          inputMode="numeric"
          value={expiry}
          onChange={(event) => onChange?.("expiry", formatExpiry(event.target.value))}
          placeholder="MM/YY"
          disabled={disabled}
          error={errors?.expiry}
          autoComplete="cc-exp"
        />

        <Input
          label="CVV"
          type="password"
          inputMode="numeric"
          value={cvv}
          onChange={(event) => onChange?.("cvv", event.target.value.replace(/\D/g, "").slice(0, 4))}
          placeholder="123"
          disabled={disabled}
          error={errors?.cvv}
          autoComplete="cc-csc"
        />
      </div>
    </div>
  );
}
