export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "prod_123",
    name: "Dodo Starter Kit",
    description: "Everything you need to build a polished checkout flow fast.",
    price: 49,
    currency: "USD",
  },
  {
    id: "prod_456",
    name: "Dodo Pro Bundle",
    description: "A premium bundle for teams that need smooth payment experiences.",
    price: 129,
    currency: "USD",
  },
  {
    id: "prod_789",
    name: "Dodo Enterprise",
    description: "An enterprise-ready package with advanced flexibility and support.",
    price: 249,
    currency: "USD",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function formatCurrency(value: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}
