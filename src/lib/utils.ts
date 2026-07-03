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

export function generateQuoteNumber(existingNumbers: string[]) {
  const max = existingNumbers.reduce((acc, n) => {
    const num = parseInt(n.replace("QT-", ""), 10);
    return Number.isNaN(num) ? acc : Math.max(acc, num);
  }, 1000);
  return `QT-${max + 1}`;
}
