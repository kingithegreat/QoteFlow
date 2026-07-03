import { useState } from "react";
import { StoreProvider } from "./hooks/useStore";
import { LayoutDashboard, Users, FileText, Settings as SettingsIcon } from "lucide-react";
import { Dashboard } from "./features/dashboard/Dashboard";
import { Customers } from "./features/customers/Customers";
import { Quotes } from "./features/quotes/Quotes";
import { Settings } from "./features/settings/Settings";
import { OnboardingModal } from "./components/OnboardingModal";
import { cn } from "./lib/utils";

type Tab = "dashboard" | "quotes" | "customers" | "settings";

function AppContent() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "quotes":
        return <Quotes />;
      case "customers":
        return <Customers />;
      case "settings":
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quotes", label: "Quotes", icon: FileText },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: SettingsIcon },
  ] as const;

  return (
    <div className="flex h-screen w-full flex-col bg-gray-50 md:flex-row">
      {/* Mobile Header */}
      <header className="flex h-14 items-center justify-between bg-white px-4 shadow-sm md:hidden shrink-0 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            Q
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900">QuoteFlow</span>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-gray-200 bg-white md:flex">
        <div className="flex h-16 items-center gap-2 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            Q
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">QuoteFlow</span>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                activeTab === item.id
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative z-0">
        <div className="mx-auto max-w-4xl p-4 md:p-8">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white/80 backdrop-blur-md pb-safe md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
              activeTab === item.id ? "text-blue-600" : "text-gray-500"
            )}
          >
            <item.icon className={cn("h-5 w-5 transition-transform", activeTab === item.id && "scale-110")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <OnboardingModal />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
