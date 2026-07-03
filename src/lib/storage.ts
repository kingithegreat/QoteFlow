import localforage from "localforage";
import { Customer, Quote, CompanyProfile } from "../types";

// Configure localforage
localforage.config({
  name: "QuoteFlow",
  storeName: "quoteflow_db",
});

const customersDB = localforage.createInstance({ name: "QuoteFlow", storeName: "customers" });
const quotesDB = localforage.createInstance({ name: "QuoteFlow", storeName: "quotes" });
const settingsDB = localforage.createInstance({ name: "QuoteFlow", storeName: "settings" });

const DEFAULT_COMPANY: CompanyProfile = {
  name: "My Company",
  email: "hello@mycompany.com",
  phone: "",
  address: "",
  defaultTaxRate: 10,
  defaultTerms: "Payment is due within 14 days of acceptance. Quotes are valid for 30 days.",
  dashboardTitle: "Overview",
};

// --- Customers ---
export async function getCustomers(): Promise<Customer[]> {
  const customers: Customer[] = [];
  await customersDB.iterate((value: Customer) => {
    customers.push(value);
  });
  return customers.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveCustomer(customer: Customer): Promise<void> {
  await customersDB.setItem(customer.id, customer);
}

export async function deleteCustomer(id: string): Promise<void> {
  await customersDB.removeItem(id);
}

// --- Quotes ---
export async function getQuotes(): Promise<Quote[]> {
  const quotes: Quote[] = [];
  await quotesDB.iterate((value: Quote) => {
    quotes.push(value);
  });
  return quotes.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function saveQuote(quote: Quote): Promise<void> {
  await quotesDB.setItem(quote.id, quote);
}

export async function deleteQuote(id: string): Promise<void> {
  await quotesDB.removeItem(id);
}

// --- Settings ---
export async function getCompanyProfile(): Promise<CompanyProfile> {
  const profile = await settingsDB.getItem<CompanyProfile>("profile");
  return profile || DEFAULT_COMPANY;
}

export async function saveCompanyProfile(profile: CompanyProfile): Promise<void> {
  await settingsDB.setItem("profile", profile);
}

// Export a clear all function for dev/testing
export async function clearAllData(): Promise<void> {
  await customersDB.clear();
  await quotesDB.clear();
  await settingsDB.clear();
}
