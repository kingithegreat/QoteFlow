export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Declined";

export const PAYMENT_METHODS = ["Bank Transfer", "Cash", "Credit/Debit Card", "PayPal", "Other"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface SavedItem {
  id: string;
  description: string;
  unitPrice: number;
  createdAt: number;
  updatedAt: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: number;
  updatedAt: number;
}

export interface QuoteItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Quote {
  id: string;
  customerId: string;
  quoteNumber: string;
  title?: string;
  items: QuoteItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: QuoteStatus;
  paymentMethod?: PaymentMethod | "";
  notes: string;
  terms: string;
  createdAt: number;
  updatedAt: number;
}

export interface CompanyProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  defaultTaxRate: number;
  defaultTerms: string;
  defaultPaymentMethod?: PaymentMethod | "";
  paymentDetails?: string;
  dashboardTitle?: string;
}
