import { Customer, Quote, CompanyProfile, SavedItem } from "../types";
import {
  getCustomers,
  getQuotes,
  getSavedItems,
  getCompanyProfile,
  saveCustomer,
  saveQuote,
  saveSavedItem,
  saveCompanyProfile,
} from "./storage";

export interface BackupFile {
  app: "QuoteFlow";
  version: 1;
  exportedAt: string;
  profile: CompanyProfile;
  customers: Customer[];
  quotes: Quote[];
  savedItems?: SavedItem[]; // absent in backups from older versions
}

export async function downloadBackup(): Promise<void> {
  const [customers, quotes, savedItems, profile] = await Promise.all([
    getCustomers(),
    getQuotes(),
    getSavedItems(),
    getCompanyProfile(),
  ]);

  const backup: BackupFile = {
    app: "QuoteFlow",
    version: 1,
    exportedAt: new Date().toISOString(),
    profile,
    customers,
    quotes,
    savedItems,
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
  if (backup.savedItems !== undefined && (!Array.isArray(backup.savedItems) || !hasIds(backup.savedItems))) {
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
    ...(backup.savedItems ?? []).map((s) => saveSavedItem(s)),
    saveCompanyProfile(backup.profile),
  ]);

  return { customers: backup.customers.length, quotes: backup.quotes.length };
}
