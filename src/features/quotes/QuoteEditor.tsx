import { useState, useEffect } from "react";
import { useStore } from "../../hooks/useStore";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import { X, Plus, Trash2, ArrowLeft, Save } from "lucide-react";
import { v4 as uuidv4 } from "uuid";
import { Quote, QuoteItem, QuoteStatus, Customer } from "../../types";
import { formatCurrency, generateQuoteNumber } from "../../lib/utils";

interface QuoteEditorProps {
  quote: Quote | null;
  onClose: () => void;
}

export function QuoteEditor({ quote, onClose }: QuoteEditorProps) {
  const { customers, quotes, profile, addQuote, updateQuote, removeQuote, addCustomer } = useStore();
  
  const [customerId, setCustomerId] = useState(quote?.customerId || "");
  const [title, setTitle] = useState(quote?.title || "");
  const [status, setStatus] = useState<QuoteStatus>(quote?.status || "Draft");
  const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
  const [notes, setNotes] = useState(quote?.notes || "");
  const [terms, setTerms] = useState(quote?.terms || profile.defaultTerms);
  const [taxRate, setTaxRate] = useState(quote?.taxRate ?? profile.defaultTaxRate);

  const [isQuickAddingCustomer, setIsQuickAddingCustomer] = useState(false);
  const [quickCustomerName, setQuickCustomerName] = useState("");

  // Recalculate totals
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const taxAmount = (subtotal * taxRate) / 100;
  const total = subtotal + taxAmount;

  const handleQuickAddCustomer = async () => {
    if (!quickCustomerName.trim()) return;
    const now = Date.now();
    const newCustomer: Customer = {
      id: uuidv4(),
      name: quickCustomerName.trim(),
      email: "",
      phone: "",
      address: "",
      notes: "",
      createdAt: now,
      updatedAt: now,
    };
    await addCustomer(newCustomer);
    setCustomerId(newCustomer.id);
    setIsQuickAddingCustomer(false);
    setQuickCustomerName("");
  };

  const handleAddItem = () => {
    setItems([...items, { id: uuidv4(), description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleUpdateItem = (id: string, field: keyof QuoteItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === "quantity" || field === "unitPrice") {
          updatedItem.total = Number(updatedItem.quantity) * Number(updatedItem.unitPrice);
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleSave = async () => {
    if (!customerId) {
      alert("Please select a customer");
      return;
    }
    
    if (items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    const now = Date.now();
    const quoteData: Quote = {
      id: quote?.id || uuidv4(),
      customerId,
      quoteNumber: quote?.quoteNumber || generateQuoteNumber(quotes[0]?.quoteNumber),
      title,
      items,
      subtotal,
      taxRate,
      taxAmount,
      total,
      status,
      notes,
      terms,
      createdAt: quote?.createdAt || now,
      updatedAt: now,
    };

    if (quote) {
      await updateQuote(quoteData);
    } else {
      await addQuote(quoteData);
    }
    onClose();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-4 py-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors md:hidden">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {quote ? `Edit ${quote.quoteNumber}` : "New Quote"}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {quote && (
            <button 
              onClick={async () => {
                if(confirm("Delete this quote?")) {
                  await removeQuote(quote.id);
                  onClose();
                }
              }}
              className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button onClick={onClose} className="hidden md:block p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors">
            <X className="h-5 w-5" />
          </button>
          <Button onClick={handleSave} className="h-10 px-4 sm:px-6 shadow-sm">
            <Save className="h-4 w-4 mr-2 hidden sm:block" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-32">
        <div className="mx-auto max-w-3xl space-y-8">
          
          {/* Quote Details */}
          <div className="space-y-6">
            <Input 
              label="Quote Title (Optional)"
              placeholder="e.g. Bathroom Renovation, Summer Landscaping..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">Customer</label>
              {customers.length === 0 || isQuickAddingCustomer ? (
                <div className="flex gap-2">
                  <Input 
                    placeholder="Customer Name"
                    value={quickCustomerName}
                    onChange={(e) => setQuickCustomerName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleQuickAddCustomer();
                      if (e.key === 'Escape') setIsQuickAddingCustomer(false);
                    }}
                  />
                  <Button onClick={handleQuickAddCustomer} className="shrink-0">Add</Button>
                  {customers.length > 0 && (
                    <Button variant="ghost" onClick={() => setIsQuickAddingCustomer(false)} className="shrink-0 px-2">Cancel</Button>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    className="flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all cursor-pointer"
                  >
                    <option value="" disabled>Select a customer...</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <Button variant="outline" onClick={() => setIsQuickAddingCustomer(true)} className="shrink-0 shadow-sm px-3" title="New Customer">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-900">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as QuoteStatus)}
                className="flex h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition-all cursor-pointer"
              >
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">Line Items</h3>
              <Button variant="secondary" size="sm" onClick={handleAddItem}>
                <Plus className="h-4 w-4 mr-1" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 border border-gray-200 border-dashed rounded-2xl text-gray-500 text-sm">
                  No items added yet.
                </div>
              ) : (
                items.map((item, index) => (
                  <div key={item.id} className="p-4 sm:p-5 bg-white border border-gray-200 rounded-2xl shadow-sm relative group">
                    <button 
                      onClick={() => handleRemoveItem(item.id)}
                      className="absolute -top-3 -right-3 sm:top-4 sm:right-4 bg-red-100 text-red-600 p-2 rounded-full shadow-sm sm:opacity-0 sm:group-hover:opacity-100 transition-opacity focus:opacity-100"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    
                    <div className="grid gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-12">
                        <Input 
                          label="Description" 
                          placeholder="e.g. Labor, Materials..."
                          value={item.description}
                          onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4 sm:col-span-12 sm:grid-cols-3">
                        <Input 
                          label="Qty" 
                          type="number"
                          min="1"
                          value={item.quantity || ""}
                          onChange={(e) => handleUpdateItem(item.id, "quantity", Number(e.target.value))}
                        />
                        <Input 
                          label="Price" 
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice || ""}
                          onChange={(e) => handleUpdateItem(item.id, "unitPrice", Number(e.target.value))}
                        />
                        <div className="col-span-2 sm:col-span-1 flex flex-col justify-end">
                          <span className="text-xs text-gray-500 font-medium mb-1">Item Total</span>
                          <div className="h-12 flex items-center justify-end px-4 bg-gray-50 rounded-xl border border-gray-100 font-bold text-gray-900">
                            {formatCurrency(item.total)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Totals Summary */}
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <div className="space-y-3">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <span>Tax Rate (%)</span>
                  <input 
                    type="number" 
                    className="w-16 h-8 rounded bg-white border border-gray-300 text-center text-sm"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                  />
                </div>
                <span className="font-medium">{formatCurrency(taxAmount)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200 flex justify-between items-center text-xl font-bold text-gray-900">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Terms */}
          <div className="space-y-4 pb-8">
            <Textarea 
              label="Notes to Customer (Optional)" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Thank you for your business..."
            />
            <Textarea 
              label="Terms & Conditions" 
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
            />
          </div>

        </div>
      </div>
    </div>
  );
}
