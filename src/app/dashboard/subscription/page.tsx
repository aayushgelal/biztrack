"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Cpu,
  Calendar,
  Shield,
  RefreshCw,
  ChevronRight,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { formatCurrency, formatDate, getDaysRemaining, cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface Payment {
  id: string;
  amount: number;
  status: string;
  paymentMethod: string;
  transactionRef?: string;
  paidAt: string;
}

interface Subscription {
  id: string;
  plan: string;
  amount: number;
  currency: string;
  status: string;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  lastPaidAt?: string | null;
  device: {
    id: string;
    name: string;
    serialNumber: string;
    type: string;
  };
  payments: Payment[];
}

const PLANS = [
  { id: "monthly", label: "Monthly", price: 29.99, period: "/ month", days: 30, popular: false },
  { id: "quarterly", label: "Quarterly", price: 79.99, period: "/ 3 months", days: 90, popular: true, save: "11%" },
  { id: "yearly", label: "Yearly", price: 299.99, period: "/ year", days: 365, save: "17%" },
];

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Record<string, string>>({});
  const [showPayModal, setShowPayModal] = useState<string | null>(null);

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/subscription");
      const data = await res.json();
      setSubscriptions(data.subscriptions || []);
    } catch {
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  async function handleRenew(subscriptionId: string, plan?: string) {
    setPayingId(subscriptionId);
    try {
      const res = await fetch("/api/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId,
          paymentMethod: "card",
          plan: plan || selectedPlan[subscriptionId] || "monthly",
        }),
      });

      if (!res.ok) throw new Error("Payment failed");

      toast.success("Subscription renewed successfully! 🎉");
      setShowPayModal(null);
      fetchSubscriptions();
    } catch {
      toast.error("Payment failed. Please try again.");
    } finally {
      setPayingId(null);
    }
  }

  async function toggleAutoRenew(subscriptionId: string, current: boolean) {
    try {
      await fetch("/api/subscription", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscriptionId, autoRenew: !current }),
      });
      toast.success(`Auto-renew ${!current ? "enabled" : "disabled"}`);
      fetchSubscriptions();
    } catch {
      toast.error("Failed to update settings");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-surface-800 rounded-xl w-40" />
        {[1, 2].map((i) => (
          <div key={i} className="h-64 bg-surface-800 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div>
        <h1 className="page-header">Subscription</h1>
        <p className="text-surface-500 text-sm mt-0.5">Manage your device subscriptions</p>
      </div>

      {subscriptions.map((sub) => {
        const daysLeft = getDaysRemaining(sub.endDate);
        const isExpired = daysLeft === 0 || sub.status === "expired";
        const isUrgent = daysLeft <= 7 && !isExpired;

        return (
          <div key={sub.id} className="space-y-4 animate-slide-up">
            {/* Main subscription card */}
            <div className={cn(
              "card p-5",
              isExpired && "border-red-500/30",
              isUrgent && "border-yellow-500/30"
            )}>
              {/* Device info */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-11 h-11 rounded-xl flex items-center justify-center",
                    isExpired ? "bg-red-500/15" : isUrgent ? "bg-yellow-500/15" : "bg-brand-500/10"
                  )}>
                    <Cpu className={cn(
                      "w-5 h-5",
                      isExpired ? "text-red-400" : isUrgent ? "text-yellow-400" : "text-brand-400"
                    )} />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">{sub.device.name}</h2>
                    <p className="text-xs text-surface-500 font-mono">{sub.device.serialNumber}</p>
                  </div>
                </div>
                <div className={cn(
                  "badge",
                  isExpired ? "badge-red" : isUrgent ? "badge-yellow" : "badge-green"
                )}>
                  {isExpired ? (
                    <><XCircle size={12} /> Expired</>
                  ) : isUrgent ? (
                    <><AlertTriangle size={12} /> {daysLeft}d left</>
                  ) : (
                    <><CheckCircle size={12} /> Active</>
                  )}
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                <div className="bg-surface-900 rounded-xl p-3">
                  <p className="text-xs text-surface-500 mb-1">Plan</p>
                  <p className="text-sm font-semibold text-surface-200 capitalize">{sub.plan}</p>
                </div>
                <div className="bg-surface-900 rounded-xl p-3">
                  <p className="text-xs text-surface-500 mb-1">Amount</p>
                  <p className="text-sm font-semibold text-surface-200">{formatCurrency(sub.amount)}</p>
                </div>
                <div className="bg-surface-900 rounded-xl p-3">
                  <p className="text-xs text-surface-500 mb-1">Expires</p>
                  <p className="text-sm font-semibold text-surface-200">{formatDate(sub.endDate, "MMM d, yyyy")}</p>
                </div>
                <div className={cn(
                  "rounded-xl p-3",
                  isExpired ? "bg-red-500/10" : isUrgent ? "bg-yellow-500/10" : "bg-surface-900"
                )}>
                  <p className="text-xs text-surface-500 mb-1">Days Left</p>
                  <p className={cn(
                    "text-sm font-bold",
                    isExpired ? "text-red-400" : isUrgent ? "text-yellow-400" : "text-surface-200"
                  )}>
                    {isExpired ? "Expired" : `${daysLeft} days`}
                  </p>
                </div>
              </div>

              {/* Countdown bar */}
              {!isExpired && (
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-surface-500 mb-1.5">
                    <span>Subscription period</span>
                    <span>{daysLeft} days remaining</span>
                  </div>
                  <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all",
                        isUrgent ? "bg-yellow-400" : "bg-brand-500"
                      )}
                      style={{
                        width: `${Math.min(100, (daysLeft / (sub.plan === "yearly" ? 365 : sub.plan === "quarterly" ? 90 : 30)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => setShowPayModal(sub.id)}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all",
                    isExpired || isUrgent
                      ? "btn-primary"
                      : "btn-secondary"
                  )}
                >
                  <RefreshCw size={15} />
                  {isExpired ? "Renew Now" : "Extend Subscription"}
                </button>
                <button
                  onClick={() => toggleAutoRenew(sub.id, sub.autoRenew)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all",
                    sub.autoRenew
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-surface-700 text-surface-400 border-surface-600"
                  )}
                >
                  <Shield size={14} />
                  Auto-renew {sub.autoRenew ? "ON" : "OFF"}
                </button>
              </div>
            </div>

            {/* Payment History */}
            {sub.payments.length > 0 && (
              <div className="card p-5">
                <h3 className="section-title mb-4">Payment History</h3>
                <div className="space-y-2">
                  {sub.payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-surface-900">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                          <CheckCircle size={14} className="text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-surface-200 font-medium capitalize">{payment.paymentMethod}</p>
                          <p className="text-xs text-surface-500">
                            {formatDate(payment.paidAt, "MMM d, yyyy")}
                            {payment.transactionRef && ` · ${payment.transactionRef}`}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(payment.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!loading && subscriptions.length === 0 && (
        <div className="card p-10 text-center">
          <CreditCard className="w-12 h-12 text-surface-600 mx-auto mb-3" />
          <p className="text-surface-400 font-medium">No subscriptions found</p>
          <p className="text-surface-600 text-sm mt-1">Add a device to get started</p>
        </div>
      )}

      {/* Payment Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowPayModal(null)}
          />
          <div className="relative w-full sm:max-w-md bg-surface-800 border border-surface-600 rounded-t-2xl sm:rounded-2xl p-6 animate-slide-up shadow-2xl">
            <h2 className="font-display font-bold text-white text-lg mb-1">Choose Plan</h2>
            <p className="text-surface-400 text-sm mb-5">Select a subscription plan to renew</p>

            <div className="space-y-3 mb-5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan((p) => ({ ...p, [showPayModal]: plan.id }))}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                    (selectedPlan[showPayModal] || "monthly") === plan.id
                      ? "border-brand-500 bg-brand-500/10"
                      : "border-surface-600 bg-surface-900 hover:border-surface-500"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{plan.label}</span>
                      {plan.popular && (
                        <span className="badge-blue text-xs py-0.5">Popular</span>
                      )}
                      {plan.save && (
                        <span className="badge-green text-xs py-0.5">Save {plan.save}</span>
                      )}
                    </div>
                    <p className="text-xs text-surface-500 mt-0.5">{plan.days} days access</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-white">{formatCurrency(plan.price)}</p>
                    <p className="text-xs text-surface-500">{plan.period}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPayModal(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={() => handleRenew(showPayModal, selectedPlan[showPayModal] || "monthly")}
                disabled={!!payingId}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                {payingId ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Zap size={15} />
                    Pay Now
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
