import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export type PaymentButtonProps = {
  processing?: boolean;
  disabled?: boolean;
  onClick?: () => void;
};

export function PaymentButton({ processing = false, disabled = false, onClick }: PaymentButtonProps) {
  return (
    <Button
      type="button"
      variant="default"
      size="lg"
      onClick={onClick}
      disabled={disabled || processing}
      loading={processing}
      className="w-full"
    >
      {processing ? "Processing..." : "Pay now"}
    </Button>
  );
}
