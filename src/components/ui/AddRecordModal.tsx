"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Wallet, Users, ChevronDown, RefreshCcw, Package, ArrowDownUp } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

// Top-level payment method: RECEIVED (पैसा लिएको) or CREDIT (उधारो)
// Within RECEIVED: Cash or Online — shown as a sub-toggle
// Within CREDIT: Lina Baaki (हामीले लिनु छ) or Dina Baaki (हामीले दिनु छ)

export default function AddRecordModal({ isOpen, userId, onClose, onSuccess }: any) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  // Top tab: RECEIVED | CREDIT
  const [tab, setTab] = useState<"RECEIVED" | "CREDIT">("RECEIVED");

  // Sub-tab for RECEIVED: CASH | HARDWARE
  const [receivedMethod, setReceivedMethod] = useState<"CASH" | "HARDWARE">("CASH");

  // Sub-tab for CREDIT: LINA (we will receive / customer owes us) | DINA (we owe customer)
  const [creditDirection, setCreditDirection] = useState<"LINA" | "DINA">("LINA");

  const [selectedCreditId, setSelectedCreditId] = useState("");

  // Optional stock item
  const [linkStock, setLinkStock] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");
  const [stockQty, setStockQty] = useState("");

  const [loading, setLoading] = useState(false);

  const { data: companies } = useQuery({
    queryKey: ["credit-companies", userId],
    queryFn: () => fetch(`/api/credits?userId=${userId}`).then(r => r.json()),
    enabled: isOpen && tab === "CREDIT",
  });

  const { data: inventoryItems } = useQuery({
    queryKey: ["inventory-items-modal", userId],
    queryFn: () => fetch("/api/inventory").then(r => r.json()),
    enabled: isOpen && linkStock,
  });

  if (!isOpen) return null;

  async function save() {
    if (!amount || parseFloat(amount) <= 0) return toast.error("रकम भर्नुहोस्");
    if (tab === "CREDIT" && !selectedCreditId) return toast.error("व्यक्ति/कम्पनी छान्नुहोस्");

    const paymentMethod = tab === "CREDIT" ? "CREDIT" : receivedMethod;

    setLoading(true);
    try {
      // 1. Save the financial record
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          amount: parseFloat(amount),
          description: desc || (tab === "CREDIT"
            ? (creditDirection === "LINA" ? "लिना बाँकी" : "दिना बाँकी")
            : receivedMethod === "CASH" ? "Cash" : "Online Payment"),
          paymentMethod,
          creditId: tab === "CREDIT" ? selectedCreditId : null,
          creditDirection: tab === "CREDIT" ? creditDirection : null,
          recordedAt: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error();

      // 2. Optional: deduct stock
      if (linkStock && selectedItemId && stockQty && parseFloat(stockQty) > 0) {
        await fetch(`/api/inventory/${selectedItemId}/stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "OUT",
            quantity: parseFloat(stockQty),
            note: desc || "Sale deduction",
          }),
        });
      }

      toast.success("Saved!");
      setAmount(""); setDesc(""); setSelectedCreditId(""); setStockQty(""); setSelectedItemId(""); setLinkStock(false);
      onSuccess();
    } catch {
      toast.error("Save failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />
      <motion.div
        initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#F2F2F7] rounded-t-[32px] pb-10 overflow-hidden"
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3">
          <h2 className="text-[17px] font-black text-black tracking-tight">नयाँ रेकर्ड</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="px-5 space-y-3 max-h-[80vh] overflow-y-auto pb-4">
          {/* TAB 1: RECEIVED vs CREDIT */}
          <div className="flex gap-2 p-1.5 bg-white rounded-2xl shadow-sm">
            <button
              onClick={() => setTab("RECEIVED")}
              className={cn(
                "flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                tab === "RECEIVED" ? "bg-emerald-500 shadow-md" : "opacity-50"
              )}
            >
              <Wallet size={18} className={tab === "RECEIVED" ? "text-white" : "text-emerald-500"} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest", tab === "RECEIVED" ? "text-white" : "text-black")}>
                पैसा लियो
              </span>
            </button>
            <button
              onClick={() => setTab("CREDIT")}
              className={cn(
                "flex-1 py-3 rounded-xl flex flex-col items-center gap-1 transition-all",
                tab === "CREDIT" ? "bg-gray-800 shadow-md" : "opacity-50"
              )}
            >
              <Users size={18} className={tab === "CREDIT" ? "text-white" : "text-gray-700"} />
              <span className={cn("text-[10px] font-black uppercase tracking-widest", tab === "CREDIT" ? "text-white" : "text-black")}>
                उधारो
              </span>
            </button>
          </div>

          {/* Sub-toggle for RECEIVED: Cash / Online */}
          <AnimatePresence>
            {tab === "RECEIVED" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
                  {[
                    { id: "CASH", label: "नगद (Cash)" },
                    { id: "HARDWARE", label: "Online / QR" },
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setReceivedMethod(m.id as any)}
                      className={cn(
                        "flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all",
                        receivedMethod === m.id ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "text-gray-400"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Sub-toggle for CREDIT: Lina Baaki / Dina Baaki */}
          <AnimatePresence>
            {tab === "CREDIT" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-3"
              >
                {/* Lina / Dina toggle */}
                <div className="flex gap-2 bg-white rounded-2xl p-1.5 shadow-sm">
                  <button
                    onClick={() => setCreditDirection("LINA")}
                    className={cn(
                      "flex-1 py-3 rounded-xl transition-all",
                      creditDirection === "LINA" ? "bg-emerald-500 shadow-md" : "opacity-50"
                    )}
                  >
                    <p className={cn("text-[12px] font-black", creditDirection === "LINA" ? "text-white" : "text-black")}>लिना बाँकी</p>
                    <p className={cn("text-[8px] font-bold uppercase tracking-wider", creditDirection === "LINA" ? "text-emerald-100" : "text-gray-400")}>
                      हामीले लिनु छ
                    </p>
                  </button>
                  <button
                    onClick={() => setCreditDirection("DINA")}
                    className={cn(
                      "flex-1 py-3 rounded-xl transition-all",
                      creditDirection === "DINA" ? "bg-red-500 shadow-md" : "opacity-50"
                    )}
                  >
                    <p className={cn("text-[12px] font-black", creditDirection === "DINA" ? "text-white" : "text-black")}>दिना बाँकी</p>
                    <p className={cn("text-[8px] font-bold uppercase tracking-wider", creditDirection === "DINA" ? "text-red-100" : "text-gray-400")}>
                      हामीले दिनु छ
                    </p>
                  </button>
                </div>

                {/* Company selector */}
                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                    {creditDirection === "LINA" ? "को संग लिनु छ?" : "कसलाई दिनु छ?"}
                  </label>
                  <div className="relative mt-1">
                    <select
                      value={selectedCreditId}
                      onChange={e => setSelectedCreditId(e.target.value)}
                      className="w-full appearance-none text-[15px] font-semibold text-black outline-none bg-transparent pr-6"
                    >
                      <option value="">व्यक्ति/कम्पनी छान्नुहोस्...</option>
                      {companies?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.customerName}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="absolute right-0 top-1 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Amount */}
          <div className="bg-white rounded-2xl px-4 py-4 shadow-sm">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">रकम (NPR)</label>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-gray-200">रू</span>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="flex-1 text-[32px] font-black text-black outline-none bg-transparent placeholder:text-gray-200"
              />
            </div>
          </div>

          {/* Remarks */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">विवरण (Remarks)</label>
            <input
              type="text"
              placeholder="के को लागि हो?"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
            />
          </div>

          {/* Optional stock deduction */}
          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
            <button
              onClick={() => setLinkStock(v => !v)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <Package size={16} className="text-gray-400" />
                <span className="text-[12px] font-black text-gray-600">Deduct from Stock</span>
                <span className="text-[9px] text-gray-300 font-semibold">(optional)</span>
              </div>
              <div className={cn(
                "w-9 h-5 rounded-full transition-colors relative",
                linkStock ? "bg-emerald-500" : "bg-gray-200"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
                  linkStock ? "translate-x-4" : "translate-x-0.5"
                )} />
              </div>
            </button>

            <AnimatePresence>
              {linkStock && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-3 space-y-3 pt-3 border-t border-gray-50"
                >
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Item</label>
                    <div className="relative mt-1">
                      <select
                        value={selectedItemId}
                        onChange={e => setSelectedItemId(e.target.value)}
                        className="w-full appearance-none text-[14px] font-semibold text-black outline-none bg-transparent pr-6"
                      >
                        <option value="">Select item...</option>
                        {inventoryItems?.map((item: any) => (
                          <option key={item.id} value={item.id}>
                            {item.name} ({item.currentStock} {item.unit} left)
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-0 top-1 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Qty to Deduct</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={stockQty}
                      onChange={e => setStockQty(e.target.value)}
                      className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Submit */}
          <button
            onClick={save}
            disabled={loading}
            className={cn(
              "w-full py-4 rounded-2xl text-[13px] font-black uppercase tracking-widest shadow-md transition-all flex items-center justify-center gap-2",
              loading ? "bg-gray-200 text-gray-400" : tab === "CREDIT" && creditDirection === "DINA"
                ? "bg-red-500 text-white active:scale-95"
                : "bg-emerald-500 text-white active:scale-95"
            )}
          >
            {loading
              ? <RefreshCcw size={18} className="animate-spin" />
              : <><CheckCircle2 size={18} /> Save</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}