"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BarChart3,
  Calendar,
  TrendingUp,
  TrendingDown,
  Download,
  DollarSign,
} from "lucide-react";
import {
  DailyEarningsChart,
  MonthlyBarChart,
  CategoryPieChart,
} from "@/components/charts/Charts";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { format, startOfMonth, endOfMonth, subMonths } from "date-fns";

interface ReportData {
  stats: {
    todayEarnings: number;
    monthlyEarnings: number;
    totalEarnings: number;
    todayTransactions: number;
    monthlyTransactions: number;
    percentChangeToday: number;
    percentChangeMonth: number;
  };
  dailyChart: Array<{ date: string; amount: number }>;
  monthlyChart: Array<{ month: string; amount: number }>;
  categoryData: Array<{ name: string; value: number; color: string }>;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "category">("daily");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/earnings?type=dashboard");
      const d = await res.json();
      setData(d);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const monthlyData = data?.monthlyChart ?? [];
  const bestMonth = monthlyData.reduce(
    (best, m) => (m.amount > best.amount ? m : best),
    { month: "—", amount: 0 }
  );
  const avgMonthly =
    monthlyData.length > 0
      ? monthlyData.reduce((s, m) => s + m.amount, 0) / monthlyData.length
      : 0;

  const tabs = [
    { id: "daily", label: "Daily (30d)" },
    { id: "monthly", label: "Monthly (12m)" },
    { id: "category", label: "Categories" },
  ] as const;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-800 rounded-xl w-32" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-28 bg-surface-800 rounded-2xl" />)}
        </div>
        <div className="h-80 bg-surface-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="page-header">Reports</h1>
          <p className="text-surface-500 text-sm mt-0.5">Earnings analytics & insights</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="stat-card animate-slide-up" style={{ animationDelay: "0ms" }}>
          <div className="w-9 h-9 bg-brand-500/10 rounded-xl flex items-center justify-center">
            <DollarSign size={18} className="text-brand-400" />
          </div>
          <div>
            <p className="text-xs text-surface-500">Total Earnings</p>
            <p className="font-display text-xl font-bold text-white">
              {formatCurrency(data?.stats.totalEarnings ?? 0)}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">All time</p>
          </div>
        </div>

        <div className="stat-card animate-slide-up" style={{ animationDelay: "80ms" }}>
          <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div>
            <p className="text-xs text-surface-500">Best Month</p>
            <p className="font-display text-xl font-bold text-white">
              {formatCurrency(bestMonth.amount)}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">{bestMonth.month}</p>
          </div>
        </div>

        <div className="stat-card col-span-2 lg:col-span-1 animate-slide-up" style={{ animationDelay: "160ms" }}>
          <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <BarChart3 size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-surface-500">Monthly Average</p>
            <p className="font-display text-xl font-bold text-white">
              {formatCurrency(avgMonthly)}
            </p>
            <p className="text-xs text-surface-500 mt-0.5">Last 12 months</p>
          </div>
        </div>
      </div>

      {/* Month-over-month comparison */}
      <div className="card p-5">
        <h2 className="section-title mb-4">Month Comparison</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-surface-900 rounded-xl p-4">
            <p className="text-xs text-surface-500 mb-2">This Month</p>
            <p className="font-display text-2xl font-bold text-white">
              {formatCurrency(data?.stats.monthlyEarnings ?? 0)}
            </p>
            <div className={cn(
              "flex items-center gap-1 text-xs font-semibold mt-2",
              (data?.stats.percentChangeMonth ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"
            )}>
              {(data?.stats.percentChangeMonth ?? 0) >= 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {Math.abs(data?.stats.percentChangeMonth ?? 0).toFixed(1)}% vs last month
            </div>
          </div>
          <div className="bg-surface-900 rounded-xl p-4">
            <p className="text-xs text-surface-500 mb-2">This Month's Orders</p>
            <p className="font-display text-2xl font-bold text-white">
              {data?.stats.monthlyTransactions ?? 0}
            </p>
            <p className="text-xs text-surface-500 mt-2">
              Avg {formatCurrency(
                (data?.stats.monthlyTransactions ?? 0) > 0
                  ? (data?.stats.monthlyEarnings ?? 0) / (data?.stats.monthlyTransactions ?? 1)
                  : 0
              )} per order
            </p>
          </div>
        </div>
      </div>

      {/* Chart section */}
      <div className="card p-5">
        {/* Tabs */}
        <div className="flex gap-1 bg-surface-900 p-1 rounded-xl mb-5 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-surface-700 text-white"
                  : "text-surface-400 hover:text-surface-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "daily" && (
          <div>
            <h2 className="section-title mb-1">Daily Earnings</h2>
            <p className="text-xs text-surface-500 mb-4">Last 30 days trend</p>
            <div className="h-64">
              <DailyEarningsChart data={data?.dailyChart ?? []} />
            </div>
          </div>
        )}

        {activeTab === "monthly" && (
          <div>
            <h2 className="section-title mb-1">Monthly Earnings</h2>
            <p className="text-xs text-surface-500 mb-4">Last 12 months</p>
            <div className="h-64">
              <MonthlyBarChart data={data?.monthlyChart ?? []} />
            </div>

            {/* Monthly table */}
            <div className="mt-5 border-t border-surface-700 pt-4">
              <h3 className="text-sm font-semibold text-surface-300 mb-3">Monthly Breakdown</h3>
              <div className="space-y-2">
                {[...monthlyData].reverse().slice(0, 6).map((m) => (
                  <div key={m.month} className="flex items-center justify-between">
                    <span className="text-sm text-surface-400">{m.month}</span>
                    <div className="flex items-center gap-3">
                      <div className="w-24 h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{
                            width: `${bestMonth.amount > 0 ? (m.amount / bestMonth.amount) * 100 : 0}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-surface-200 w-24 text-right">
                        {formatCurrency(m.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "category" && (
          <div>
            <h2 className="section-title mb-1">Category Breakdown</h2>
            <p className="text-xs text-surface-500 mb-4">This month by category</p>
            <div className="grid sm:grid-cols-2 gap-6 items-center">
              <div className="h-56">
                <CategoryPieChart data={data?.categoryData ?? []} />
              </div>
              <div className="space-y-3">
                {(data?.categoryData ?? []).map((cat) => {
                  const total = (data?.categoryData ?? []).reduce((s, c) => s + c.value, 0);
                  const pct = total > 0 ? (cat.value / total) * 100 : 0;
                  return (
                    <div key={cat.name}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ background: cat.color }}
                          />
                          <span className="text-sm text-surface-300">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-surface-500">{pct.toFixed(1)}%</span>
                          <span className="text-sm font-semibold text-surface-200">
                            {formatCurrency(cat.value)}
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: cat.color }}
                        />
                      </div>
                    </div>
                  );
                })}
                {!data?.categoryData?.length && (
                  <p className="text-surface-600 text-sm text-center py-8">No data this month</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
