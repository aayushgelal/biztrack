"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId?: string;
}

export default function AddRecordModal({ isOpen, userId, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  // Safety guard: If not open, render nothing
  if (!isOpen) return null;

  async function save() {
    if (!amount || parseFloat(amount) <= 0) return toast.error("Enter a valid amount");
    setLoading(true);

    const now = new Date();
    const timestamp = now.toISOString().replace(/[-:T]/g, "").split(".")[0]; 
    const generatedPrn = `MAN-${timestamp}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
    
    try {
      const res = await fetch("/api/earnings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          userId, 
          amount: parseFloat(amount), 
          description: desc || "Manual Entry", 
          source: "manual",
          prn: generatedPrn,
          recordedAt: now.toISOString()
        }),
      });

      if (res.ok) {
        toast.success("Record Saved");
        onSuccess();
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Save failed");
      }
    } catch (err) {
      toast.error("Connection error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
      />

      {/* Sheet */}
      <motion.div 
        initial={{ y: "100%" }} 
        animate={{ y: 0 }} 
        exit={{ y: "100%" }} 
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="relative w-full max-w-lg bg-white rounded-t-[40px] sm:rounded-[32px] p-8 pb-12 shadow-2xl"
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-8 sm:hidden" />
        
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black text-black tracking-tight">New Sale</h2>
          <button 
            onClick={onClose} 
            className="bg-gray-100 p-2 rounded-full text-gray-500 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-4">Amount</label>
            <input 
              type="number" 
              autoFocus 
              placeholder="0.00 रू" 
              className="w-full bg-[#F2F2F7] rounded-[24px] py-6 px-8 text-4xl font-black text-black border-none focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase ml-4">Note (Optional)</label>
            <input 
              type="text" 
              placeholder="What was this for?" 
              className="w-full bg-[#F2F2F7] rounded-[20px] py-4 px-8 text-lg font-bold text-black border-none outline-none focus:ring-4 focus:ring-blue-500/10" 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
            />
          </div>

          <button 
            onClick={save} 
            disabled={loading} 
            className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black text-xl shadow-lg shadow-blue-500/30 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all flex items-center justify-center gap-3 mt-4"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              <><CheckCircle2 size={24} /> Record Sale</>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}