import React, { useState } from "react";
import { useStore } from "../../hooks/useStore";
import { Card, CardContent } from "../../components/ui/Card";
import { formatCurrency } from "../../lib/utils";
import { formatDistanceToNow } from "date-fns";
import { FileText, CheckCircle, TrendingUp, Users, Edit2, Check } from "lucide-react";
import { QuoteStatus } from "../../types";

export function Dashboard() {
  const { quotes, customers, profile, updateProfile } = useStore();
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(profile.dashboardTitle || "Overview");

  const handleTitleSubmit = async () => {
    setIsEditingTitle(false);
    const newTitle = titleInput.trim() || "Overview";
    if (newTitle !== profile.dashboardTitle) {
      await updateProfile({ ...profile, dashboardTitle: newTitle });
    }
    setTitleInput(newTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleSubmit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
      setTitleInput(profile.dashboardTitle || "Overview");
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const thisMonthQuotes = quotes.filter((q) => {
    const d = new Date(q.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const totalQuotesValue = thisMonthQuotes.reduce((acc, q) => acc + q.total, 0);
  const acceptedQuotes = thisMonthQuotes.filter((q) => q.status === "Accepted");
  const acceptedValue = acceptedQuotes.reduce((acc, q) => acc + q.total, 0);
  
  const conversionRate = thisMonthQuotes.length > 0 
    ? Math.round((acceptedQuotes.length / thisMonthQuotes.length) * 100) 
    : 0;

  const recentQuotes = quotes.slice(0, 5);

  const getStatusColor = (status: QuoteStatus) => {
    switch (status) {
      case "Accepted": return "bg-green-100 text-green-700 border-green-200";
      case "Sent": return "bg-blue-100 text-blue-700 border-blue-200";
      case "Declined": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <div className="group flex items-center gap-2">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input 
                autoFocus
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleTitleSubmit}
                className="text-2xl font-bold text-gray-900 tracking-tight bg-gray-50 border border-gray-300 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button onClick={handleTitleSubmit} className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200">
                <Check className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{profile.dashboardTitle || "Overview"}</h1>
              <button 
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                title="Edit Dashboard Title"
              >
                <Edit2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
        <p className="text-gray-500 mt-1">Welcome back, {profile.name || "User"}. Here's your summary for this month.</p>
      </div>

      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <StatCard
          title="Monthly Quotes"
          value={thisMonthQuotes.length.toString()}
          icon={FileText}
          trend={`${formatCurrency(totalQuotesValue)} total value`}
        />
        <StatCard
          title="Accepted Value"
          value={formatCurrency(acceptedValue)}
          icon={CheckCircle}
          iconColor="text-green-600"
          iconBg="bg-green-100"
        />
        <StatCard
          title="Conversion"
          value={`${conversionRate}%`}
          icon={TrendingUp}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          trend={`${acceptedQuotes.length} won quotes`}
        />
        <StatCard
          title="Customers"
          value={customers.length.toString()}
          icon={Users}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Recent Activity</h2>
        </div>
        
        {recentQuotes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 border-dashed">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 mb-3">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="font-medium text-gray-900">No quotes yet</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first quote to see activity here.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {recentQuotes.map(quote => {
                const customer = customers.find(c => c.id === quote.customerId);
                return (
                  <li key={quote.id} className="p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-gray-900">{customer?.name || "Unknown Customer"}</span>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span className="font-mono text-xs">{quote.quoteNumber}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(quote.createdAt, { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="font-semibold text-gray-900">{formatCurrency(quote.total)}</span>
                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusColor(quote.status)}`}>
                          {quote.status}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend,
  iconColor = "text-gray-600",
  iconBg = "bg-gray-100"
}: { 
  title: string, 
  value: string, 
  icon: any, 
  trend?: string,
  iconColor?: string,
  iconBg?: string
}) {
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`p-1.5 rounded-lg ${iconBg}`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xl sm:text-2xl font-bold text-gray-900">{value}</span>
          {trend && (
            <span className="text-xs text-gray-500">{trend}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
