import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function generateQuoteNumber(lastNumber?: string) {
  if (!lastNumber) return "QT-1001";
  const num = parseInt(lastNumber.replace("QT-", ""), 10);
  return `QT-${num + 1}`;
}
