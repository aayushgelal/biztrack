export interface User {
  id: string;
  username: string;
  businessName: string;
  email?: string | null;
  phone?: string | null;
  createdAt: Date;
}

export interface Device {
  id: string;
  name: string;
  serialNumber: string;
  location?: string | null;
  type: string;
  isActive: boolean;
  createdAt: Date;
  userId: string;
  subscription?: Subscription | null;
}

export interface EarningRecord {
  id: string;
  amount: number;
  description?: string | null;
  category: string;
  source: "device" | "manual";
  recordedAt: Date;
  createdAt: Date;
  userId: string;
  deviceId?: string | null;
  device?: Device | null;
}

export interface Subscription {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: "active" | "expired" | "pending";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  lastPaidAt?: Date | null;
  userId: string;
  deviceId: string;
  device?: Device;
  payments?: SubscriptionPayment[];
}

export interface SubscriptionPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionRef?: string | null;
  paidAt: Date;
  subscriptionId: string;
}

export interface DashboardStats {
  todayEarnings: number;
  monthlyEarnings: number;
  totalEarnings: number;
  todayTransactions: number;
  monthlyTransactions: number;
  percentChangeToday: number;
  percentChangeMonth: number;
}

export interface ChartDataPoint {
  date: string;
  amount: number;
  shortDate?: string;
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export const EARNING_CATEGORIES = [
  "Sales",
  "Services",
  "Products",
  "Delivery",
  "Online",
  "Cash",
  "Other",
] as const;

export const SUBSCRIPTION_PLANS = {
  monthly: { label: "Monthly", duration: 30 },
  quarterly: { label: "Quarterly", duration: 90 },
  yearly: { label: "Yearly", duration: 365 },
} as const;
