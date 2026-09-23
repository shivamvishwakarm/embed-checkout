import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export type PaymentErrorProps = {
  title?: string | undefined;
  message?: string | undefined;
  onRetry?: (() => void) | undefined;
};

export function PaymentError({
  title = "Payment could not be completed",
  message = "Please review your details and try again.",
  onRetry,
}: PaymentErrorProps) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{message}</AlertDescription>
      </Alert>

      {onRetry ? (
        <Button type="button" variant="outline" onClick={onRetry} className="w-full">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
