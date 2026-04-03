"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Wallet, Users, Globe, Building2, ChevronDown,RefreshCcw } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AddRecordModal({ isOpen, userId, onClose, onSuccess }: any) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [method, setMethod] = useState("CASH"); // CASH | CREDIT | HARDWARE
  const [selectedCreditId, setSelectedCreditId] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch Company Directory for the Credit Dropdown
  const { data: companies } = useQuery({
    queryKey: ["credit-companies", userId],
    queryFn: () => fetch(`/api/credits?userId=${userId}`).then(res => res.json()),
    enabled: isOpen && method === "CREDIT",
  });

  if (!isOpen) return null;

  async function save() {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter amount");
    
    // Validation: If Credit is selected, a company must be chosen
    if (method === "CREDIT" && !selectedCreditId) {
      return toast.error("Select a company for credit");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          amount: parseFloat(amount), 
          description: desc || `${method} Entry`, 
          paymentMethod: method,
          creditId: method === "CREDIT" ? selectedCreditId : null,
          recordedAt: new Date().toISOString()
        }),
      });

      if (res.ok) {
        toast.success("Transaction Saved");
        setAmount("");
        setDesc("");
        setSelectedCreditId("");
        onSuccess();
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to save entry");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-black tracking-tighter">Add Record</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full text-gray-400 hover:text-black transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">
          {/* 3-way Method Toggle */}
          <div className="flex gap-2 p-1.5 bg-gray-100 rounded-[24px]">
            {[
              { id: "CASH", label: "Cash", icon: Wallet, color: "text-emerald-500" },
              { id: "HARDWARE", label: "Online", icon: Globe, color: "text-blue-500" },
              { id: "CREDIT", label: "Credit", icon: Users, color: "text-red-500" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex-1 py-3 rounded-[18px] flex flex-col items-center gap-1 transition-all duration-300",
                  method === m.id ? "bg-white shadow-md scale-100" : "opacity-40 scale-95 hover:opacity-60"
                )}
              >
                <m.icon size={18} className={m.color} />
                <span className="text-[10px] font-black uppercase tracking-widest text-black">{m.label}</span>
              </button>
            ))}
          </div>

          {/* Amount Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Amount (NPR)</label>
            <div className="relative flex items-center">
                <span className="absolute left-6 text-xl font-black text-gray-300">रू</span>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full bg-[#F2F2F7] rounded-[24px] py-5 pl-14 pr-6 text-3xl font-black text-black outline-none border-2 border-transparent focus:border-blue-500/20 transition-all" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                />
            </div>
          </div>

          {/* Dynamic Credit Selector: Only shows if method is CREDIT */}
          <AnimatePresence>
            {method === "CREDIT" && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1.5 overflow-hidden"
              >
                <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Select Company / Person</label>
                <div className="relative">
                    <select 
                      value={selectedCreditId}
                      onChange={(e) => setSelectedCreditId(e.target.value)}
                      className="w-full bg-[#F2F2F7] appearance-none rounded-[18px] py-4 px-6 text-sm font-bold text-black outline-none border-2 border-transparent focus:border-red-500/10"
                    >
                      <option value="">Choose from directory...</option>
                      {companies?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.customerName}</option>
                      ))}
                    </select>
                    <ChevronDown size={16} className="absolute right-5 top-4.5 text-gray-400 pointer-events-none" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Remarks Input */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-3 tracking-widest">Remarks</label>
            <input 
              type="text" 
              placeholder="What was this for?" 
              className="w-full bg-[#F2F2F7] rounded-[18px] py-4 px-6 text-sm font-bold outline-none border-2 border-transparent focus:border-blue-500/10" 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
            />
          </div>

          {/* Submit Button */}
          <button 
            onClick={save} 
            disabled={loading} 
            className={cn(
                "w-full py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all flex items-center justify-center gap-3 mt-2",
                loading ? "bg-gray-100 text-gray-400" : "bg-black text-white active:scale-95 shadow-black/20"
            )}
          >
            {loading ? (
                <RefreshCcw size={18} className="animate-spin" />
            ) : (
                <><CheckCircle2 size={18} className="text-emerald-400" /> Save Entry</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}