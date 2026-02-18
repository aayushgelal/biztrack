import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from "date-fns";

/**
 * Standard Tailwind class merger
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats currency to NPR (Nepalese Rupees)
 * Uses en-NP locale for the proper Lakh/Crore comma placement
 */
export function formatCurrency(
  amount: number,
  currency = "रू",
  locale = "en-NP"
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 0, // NPR usually doesn't show paisa in UI
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Compact number formatting
 * Updated to handle large values in a readable way
 */
export function formatNumber(num: number): string {
  if (num >= 1_00_00_000) return `${(num / 1_00_00_000).toFixed(1)}Cr`; // Crore
  if (num >= 1_00_000) return `${(num / 1_00_000).toFixed(1)}L`;      // Lakh
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;           // Thousand
  return num.toString();
}

/**
 * Formats dates into readable strings
 */
export function formatDate(date: Date | string, fmt = "MMM d, yyyy"): string {
  return format(new Date(date), fmt);
}

/* --- Range Helpers --- */

export function getDayRange(date = new Date()) {
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function getMonthRange(date = new Date()) {
  return { start: startOfMonth(date), end: endOfMonth(date) };
}

export function getLast30Days() {
  return {
    start: startOfDay(subDays(new Date(), 29)),
    end: endOfDay(new Date()),
  };
}

export function getLast12Months() {
  return {
    start: startOfMonth(subMonths(new Date(), 11)),
    end: endOfMonth(new Date()),
  };
}

/**
 * Subscription & Expiry Logic
 */
export function getDaysRemaining(endDate: Date | string): number {
  const end = new Date(endDate);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function getSubscriptionStatus(endDate: Date | string): {
  label: string;
  color: string;
  urgent: boolean;
} {
  const days = getDaysRemaining(endDate);
  if (days === 0) return { label: "Expired", color: "red", urgent: true };
  if (days <= 3) return { label: `${days}d left`, color: "red", urgent: true };
  if (days <= 7) return { label: `${days}d left`, color: "yellow", urgent: true };
  if (days <= 14) return { label: `${days}d left`, color: "yellow", urgent: false };
  return { label: `${days}d left`, color: "green", urgent: false };
}

/* --- Data Generation for Recharts --- */

export function generateDailyChartData(
  records: Array<{ amount: number; recordedAt: Date | string }>,
  days = 30
) {
  const data: Array<{ date: string; amount: number; shortDate: string }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    const dayTotal = records
      .filter((r) => {
        const d = new Date(r.recordedAt);
        return d >= dayStart && d <= dayEnd;
      })
      .reduce((sum, r) => sum + r.amount, 0);
    
    data.push({
      date: format(date, "MMM d"),
      shortDate: format(date, "d"),
      amount: dayTotal,
    });
  }
  return data;
}

export function generateMonthlyChartData(
  records: Array<{ amount: number; recordedAt: Date | string }>,
  months = 12
) {
  const data: Array<{ month: string; amount: number }> = [];
  for (let i = months - 1; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const monthTotal = records
      .filter((r) => {
        const d = new Date(r.recordedAt);
        return d >= monthStart && d <= monthEnd;
      })
      .reduce((sum, r) => sum + r.amount, 0);

    data.push({
      month: format(date, "MMM yy"),
      amount: monthTotal,
    });
  }
  return data;
}

export function generateCategoryData(
  records: Array<{ amount: number; category: string }>
) {
  const categoryMap: Record<string, number> = {};
  records.forEach((r) => {
    categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount;
  });
  
  const COLORS = ["#0ea5e9", "#10b981", "#f59e0b", "#8b5cf6", "#f97316", "#ef4444"];
  
  return Object.entries(categoryMap)
    .map(([name, value], i) => ({
      name,
      value,
      color: COLORS[i % COLORS.length],
    }))
    .sort((a, b) => b.value - a.value);
}