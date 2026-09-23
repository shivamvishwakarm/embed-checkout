import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type PaymentSuccessProps = {
  sessionId: string;
};

export function PaymentSuccess({ sessionId }: PaymentSuccessProps) {
  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl text-emerald-600">
        ✓
      </div>

      <div>
        <h3 className="text-xl font-semibold text-slate-900">Payment successful</h3>
        <p className="mt-2 text-sm text-slate-600">Your checkout is complete and the session has been recorded.</p>
      </div>

      <Alert variant="success">
        <AlertTitle>Session ID</AlertTitle>
        <AlertDescription className="font-mono text-xs tracking-wide">{sessionId}</AlertDescription>
      </Alert>
    </div>
  );
}
