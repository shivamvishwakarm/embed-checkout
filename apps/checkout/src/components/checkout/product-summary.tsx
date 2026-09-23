import type { Product } from "@/lib/products";
import { formatCurrency } from "@/lib/products";

export type ProductSummaryProps = {
  product: Product;
};

export function ProductSummary({ product }: ProductSummaryProps) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-4 transition-all">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Order summary
          </p>
          <h3 className="mt-1 text-base font-semibold text-slate-900">{product.name}</h3>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500">Total</p>
          <p className="text-lg font-bold text-slate-900 tracking-tight">
            {formatCurrency(product.price, product.currency)}
          </p>
        </div>
      </div>

      <p className="mt-2 text-xs leading-5 text-slate-600">{product.description}</p>
    </div>
  );
}
