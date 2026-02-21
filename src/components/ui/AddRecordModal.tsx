"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2, Wallet, Users, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export default function AddRecordModal({ isOpen, userId, onClose, onSuccess }: any) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [method, setMethod] = useState("CASH"); // CASH | CREDIT | HARDWARE
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function save() {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter amount");
    setLoading(true);
    try {
      const res = await fetch("/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          amount: parseFloat(amount), 
          description: desc || `${method} Entry`, 
          source: "app",
          paymentMethod: method,
          recordedAt: new Date().toISOString()
        }),
      });
      if (res.ok) {
        toast.success("Saved");
        onSuccess();
      }
    } catch (err) {
      toast.error("Error");
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
        initial={{ scale: 0.9, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-black text-black tracking-tight">Add Record</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          {/* Smaller, 3-way Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
            {[
              { id: "CASH", label: "cash", icon: Wallet, color: "text-emerald-500" },
              { id: "HARDWARE", label: "online", icon: Globe, color: "text-blue-500" },
              { id: "CREDIT", label: "credit", icon: Users, color: "text-red-500" }
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex-1 py-2 rounded-xl flex flex-col items-center gap-1 transition-all",
                  method === m.id ? "bg-white shadow-sm scale-100" : "opacity-50 scale-95"
                )}
              >
                <m.icon size={16} className={m.color} />
                <span className="text-[10px] font-black uppercase tracking-tighter text-black">{m.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Amount</label>
            <input 
              type="number" 
              placeholder="0.00" 
              className="w-full bg-[#F2F2F7] rounded-2xl py-4 px-6 text-2xl font-black text-black outline-none focus:ring-2 focus:ring-blue-500/10" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-gray-400 uppercase ml-2">Remarks</label>
            <input 
              type="text" 
              placeholder="Optional note..." 
              className="w-full bg-[#F2F2F7] rounded-xl py-3 px-5 text-sm font-bold outline-none" 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
            />
          </div>

          <button 
            onClick={save} disabled={loading} 
            className="w-full bg-black text-white py-4 rounded-2xl font-black text-sm active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {loading ? "Saving..." : <><CheckCircle2 size={18} /> Confirm Entry</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}