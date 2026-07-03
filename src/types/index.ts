export type QuoteStatus = "Draft" | "Sent" | "Accepted" | "Declined";

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
  dashboardTitle?: string;
}
