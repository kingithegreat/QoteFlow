import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { Customer, Quote, CompanyProfile, SavedItem } from "../types";
import { getCustomers, saveCustomer, deleteCustomer, getQuotes, saveQuote, deleteQuote, getCompanyProfile, saveCompanyProfile, getSavedItems, saveSavedItem, deleteSavedItem } from "../lib/storage";

interface StoreState {
  customers: Customer[];
  quotes: Quote[];
  savedItems: SavedItem[];
  profile: CompanyProfile;
  isLoading: boolean;
  addCustomer: (c: Customer) => Promise<void>;
  updateCustomer: (c: Customer) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  addQuote: (q: Quote) => Promise<void>;
  updateQuote: (q: Quote) => Promise<void>;
  removeQuote: (id: string) => Promise<void>;
  upsertSavedItem: (item: SavedItem) => Promise<void>;
  removeSavedItem: (id: string) => Promise<void>;
  updateProfile: (p: CompanyProfile) => Promise<void>;
  reloadData: () => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadData = useCallback(async () => {
    const [loadedCustomers, loadedQuotes, loadedSavedItems, loadedProfile] = await Promise.all([
      getCustomers(),
      getQuotes(),
      getSavedItems(),
      getCompanyProfile(),
    ]);
    setCustomers(loadedCustomers);
    setQuotes(loadedQuotes);
    setSavedItems(loadedSavedItems);
    setProfile(loadedProfile);
  }, []);

  useEffect(() => {
    reloadData()
      .catch((err) => console.error("Failed to load data", err))
      .finally(() => setIsLoading(false));
  }, [reloadData]);

  const addCustomer = async (c: Customer) => {
    await saveCustomer(c);
    setCustomers((prev) => [c, ...prev]);
  };

  const updateCustomer = async (c: Customer) => {
    await saveCustomer(c);
    setCustomers((prev) => prev.map((item) => (item.id === c.id ? c : item)));
  };

  const removeCustomer = async (id: string) => {
    await deleteCustomer(id);
    setCustomers((prev) => prev.filter((item) => item.id !== id));
  };

  const addQuote = async (q: Quote) => {
    await saveQuote(q);
    setQuotes((prev) => [q, ...prev]);
  };

  const updateQuote = async (q: Quote) => {
    await saveQuote(q);
    setQuotes((prev) => prev.map((item) => (item.id === q.id ? q : item)));
  };

  const removeQuote = async (id: string) => {
    await deleteQuote(id);
    setQuotes((prev) => prev.filter((item) => item.id !== id));
  };

  const upsertSavedItem = async (item: SavedItem) => {
    await saveSavedItem(item);
    setSavedItems((prev) => {
      const next = prev.some((s) => s.id === item.id)
        ? prev.map((s) => (s.id === item.id ? item : s))
        : [...prev, item];
      return next.sort((a, b) => a.description.localeCompare(b.description));
    });
  };

  const removeSavedItem = async (id: string) => {
    await deleteSavedItem(id);
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
  };

  const updateProfile = async (p: CompanyProfile) => {
    await saveCompanyProfile(p);
    setProfile(p);
  };

  if (isLoading || !profile) {
    return <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading QuoteFlow...</div>;
  }

  return (
    <StoreContext.Provider
      value={{
        customers,
        quotes,
        savedItems,
        profile,
        isLoading,
        addCustomer,
        updateCustomer,
        removeCustomer,
        addQuote,
        updateQuote,
        removeQuote,
        upsertSavedItem,
        removeSavedItem,
        updateProfile,
        reloadData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return context;
}
