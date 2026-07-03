import { Customer, Quote, CompanyProfile } from "../types";
import {
  getCustomers,
  getQuotes,
  getCompanyProfile,
  saveCustomer,
  saveQuote,
  saveCompanyProfile,
} from "./storage";

export interface BackupFile {
  app: "QuoteFlow";
  version: 1;
  exportedAt: string;
  profile: CompanyProfile;
  customers: Customer[];
  quotes: Quote[];
}

export async function downloadBackup(): Promise<void> {
  const [customers, quotes, profile] = await Promise.all([
    getCustomers(),
    getQuotes(),
    getCompanyProfile(),
  ]);

  const backup: BackupFile = {
    app: "QuoteFlow",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    customers,
    quotes,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `quoteflow-backup-${backup.exportedAt.slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function parseBackup(text: string): BackupFile {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That file is not valid JSON.");
  }

  const backup = data as Partial<BackupFile>;
  if (backup?.app !== "QuoteFlow" || !Array.isArray(backup.customers) || !Array.isArray(backup.quotes) || typeof backup.profile !== "object" || backup.profile === null) {
    throw new Error("That file does not look like a QuoteFlow backup.");
  }

  const hasIds = (records: { id?: unknown }[]) => records.every((r) => typeof r?.id === "string" && r.id);
  if (!hasIds(backup.customers) || !hasIds(backup.quotes)) {
    throw new Error("The backup file contains invalid records.");
  }

  return backup as BackupFile;
}

// Upserts records by id and replaces the company profile. Existing records
// not present in the backup are left untouched.
export async function restoreBackup(text: string): Promise<{ customers: number; quotes: number }> {
  const backup = parseBackup(text);

  await Promise.all([
    ...backup.customers.map((c) => saveCustomer(c)),
    ...backup.quotes.map((q) => saveQuote(q)),
    saveCompanyProfile(backup.profile),
  ]);

  return { customers: backup.customers.length, quotes: backup.quotes.length };
}
