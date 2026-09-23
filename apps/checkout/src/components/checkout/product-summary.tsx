import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/products";

export type ProductSummaryProps = {
  product: Product;
};

export function ProductSummary({ product }: ProductSummaryProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
            Order summary
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{product.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500">Total</p>
          <p className="text-lg font-semibold text-slate-900">
            {formatCurrency(product.price, product.currency)}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-600">{product.description}</p>
    </div>
  );
}
