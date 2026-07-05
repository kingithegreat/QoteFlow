import { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Card, CardContent } from "../../components/ui/Card";
import { Plus, Search, FileText, FileDown, Send } from "lucide-react";
import { Quote, QuoteStatus } from "../../types";
import { formatCurrency, cn } from "../../lib/utils";
import { formatDate } from "../../lib/dateUtils";
import { QuoteEditor } from "./QuoteEditor";
import { generateQuotePDF, shareQuotePDF } from "../../lib/pdf";

export function Quotes() {
  const { quotes, customers, profile, updateQuote } = useStore();
  const [search, setSearch] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  
  // Status filter state
  const [statusFilter, setStatusFilter] = useState<QuoteStatus | "All">("All");

  const filteredQuotes = quotes.filter((q) => {
    const customer = customers.find(c => c.id === q.customerId);
    const matchesSearch = 
      q.quoteNumber.toLowerCase().includes(search.toLowerCase()) || 
      (q.title && q.title.toLowerCase().includes(search.toLowerCase())) ||
      (customer?.name.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === "All" || q.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const openNewQuote = () => {
    setEditingQuote(null);
    setIsEditorOpen(true);
  };

  const openEditQuote = (quote: Quote) => {
    setEditingQuote(quote);
    setIsEditorOpen(true);
  };

  const generatePDF = (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    generateQuotePDF(quote, customer, profile).catch((err) => {
      console.error("Failed to generate PDF", err);
      alert("Failed to generate PDF. Please try again.");
    });
  };

  const sendQuote = async (quote: Quote) => {
    const customer = customers.find(c => c.id === quote.customerId);
    try {
      await shareQuotePDF(quote, customer, profile);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return; // share sheet dismissed
      console.error("Failed to send quote", err);
      alert("Failed to send quote. Please try again.");
      return;
    }
    if (quote.status === "Draft") {
      await updateQuote({ ...quote, status: "Sent", updatedAt: Date.now() });
    }
  };

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "Accepted": return "bg-green-100 text-green-700 border-green-200";
      case "Sent": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Declined": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const statusOptions: (QuoteStatus | "All")[] = ["All", "Draft", "Sent", "Accepted", "Declined"];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quotes</h1>
        <Button onClick={openNewQuote} className="w-full sm:w-auto shadow-sm">
          <Plus className="mr-2 h-5 w-5" />
          Create Quote
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search quote number, title or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 shadow-sm border-gray-200"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar shrink-0">
          {statusOptions.map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap border",
                statusFilter === status 
                  ? "bg-gray-900 text-white border-gray-900" 
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {quotes.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-4">
              <FileText className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Create your first quote</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-2 mb-6 text-sm">
              Impress your clients with professional, branded quotes generated in seconds.
            </p>
            <Button onClick={openNewQuote} className="shadow-sm">
              <Plus className="mr-2 h-5 w-5" />
              Get Started
            </Button>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-3">
              <FileText className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No quotes found</p>
            <p className="text-sm mt-1">Try adjusting your filters.</p>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const customer = customers.find(c => c.id === quote.customerId);
            return (
              <Card key={quote.id} className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={() => openEditQuote(quote)}>
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row">
                    <div className="flex-1 p-5">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-sm font-medium text-gray-500">{quote.quoteNumber}</span>
                          <span className={cn("text-[11px] font-medium px-2.5 py-0.5 rounded-full border", getStatusColor(quote.status))}>
                            {quote.status}
                          </span>
                        </div>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-900">{quote.title || customer?.name || "Unknown Customer"}</h3>
                      {quote.title && <div className="text-sm font-medium text-gray-700 mt-1">{customer?.name || "Unknown Customer"}</div>}
                      <div className="text-sm text-gray-500 mt-1 flex gap-3">
                        <span>{formatDate(quote.createdAt)}</span>
                        <span>•</span>
                        <span>{quote.items.length} item(s)</span>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-5 sm:w-48 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-gray-100">
                      <div className="flex flex-col sm:items-end">
                        <span className="text-xs text-gray-500 font-medium">Total</span>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(quote.total)}</span>
                      </div>
                      
                      <div className="flex gap-2 sm:mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generatePDF(quote);
                          }}
                          className="p-2 text-blue-600 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors flex items-center gap-2 px-4"
                          title="Download PDF"
                        >
                          <FileDown className="h-4 w-4" />
                          <span className="text-xs font-semibold sm:hidden">PDF</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            sendQuote(quote);
                          }}
                          className="p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors flex items-center gap-2 px-4"
                          title="Send quote to customer"
                        >
                          <Send className="h-4 w-4" />
                          <span className="text-xs font-semibold sm:hidden">Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-white md:bg-gray-50/80 md:backdrop-blur-sm md:p-8 flex justify-center items-start overflow-y-auto">
          <div className="w-full max-w-4xl bg-white md:rounded-3xl md:shadow-2xl md:border border-gray-200 overflow-hidden flex flex-col min-h-full md:min-h-0">
            <QuoteEditor 
              quote={editingQuote} 
              onClose={() => setIsEditorOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
