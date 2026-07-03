import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Customer, Quote, CompanyProfile } from "../types";
import { getCustomers, saveCustomer, deleteCustomer, getQuotes, saveQuote, deleteQuote, getCompanyProfile, saveCompanyProfile } from "../lib/storage";

interface StoreState {
  customers: Customer[];
  quotes: Quote[];
  profile: CompanyProfile;
  isLoading: boolean;
  addCustomer: (c: Customer) => Promise<void>;
  updateCustomer: (c: Customer) => Promise<void>;
  removeCustomer: (id: string) => Promise<void>;
  addQuote: (q: Quote) => Promise<void>;
  updateQuote: (q: Quote) => Promise<void>;
  removeQuote: (id: string) => Promise<void>;
  updateProfile: (p: CompanyProfile) => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [profile, setProfile] = useState<CompanyProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedCustomers, loadedQuotes, loadedProfile] = await Promise.all([
          getCustomers(),
          getQuotes(),
          getCompanyProfile(),
        ]);
        setCustomers(loadedCustomers);
        setQuotes(loadedQuotes);
        setProfile(loadedProfile);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

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
        profile,
        isLoading,
        addCustomer,
        updateCustomer,
        removeCustomer,
        addQuote,
        updateQuote,
        removeQuote,
        updateProfile,
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
