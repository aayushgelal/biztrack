"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Package } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["General", "Food & Beverage", "Electronics", "Clothing", "Hardware", "Stationery", "Medicine", "Other"];
const UNITS = ["pcs", "kg", "g", "litre", "ml", "box", "dozen", "roll", "set", "pair"];

interface AddItemModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddItemModal({ isOpen, userId, onClose, onSuccess }: AddItemModalProps) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "General",
    unit: "pcs",
    costPrice: "",
    sellingPrice: "",
    currentStock: "",
    minStock: "",
    description: "",
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      onSuccess();
    } catch {
      alert("Failed to add item. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-[#F2F2F7] rounded-t-[32px] overflow-hidden pb-10"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <Package size={16} className="text-white" />
                </div>
                <h2 className="text-[17px] font-black text-black tracking-tight">New Item</h2>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="px-5 space-y-3 max-h-[70vh] overflow-y-auto pb-4">
              {/* Name */}
              <div className="bg-white rounded-2xl px-4 py-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Item Name *</label>
                <input
                  value={form.name}
                  onChange={set("name")}
                  placeholder="e.g. Coca Cola 500ml"
                  className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                />
              </div>

              {/* SKU + Category row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl px-4 py-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">SKU</label>
                  <input
                    value={form.sku}
                    onChange={set("sku")}
                    placeholder="Optional"
                    className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Unit</label>
                  <select value={form.unit} onChange={set("unit")} className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent">
                    {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div className="bg-white rounded-2xl px-4 py-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Category</label>
                <select value={form.category} onChange={set("category")} className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent">
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl px-4 py-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Cost Price (रू)</label>
                  <input
                    type="number"
                    value={form.costPrice}
                    onChange={set("costPrice")}
                    placeholder="0"
                    className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Sell Price (रू)</label>
                  <input
                    type="number"
                    value={form.sellingPrice}
                    onChange={set("sellingPrice")}
                    placeholder="0"
                    className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl px-4 py-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Opening Stock</label>
                  <input
                    type="number"
                    value={form.currentStock}
                    onChange={set("currentStock")}
                    placeholder="0"
                    className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
                <div className="bg-white rounded-2xl px-4 py-3">
                  <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Low Stock Alert</label>
                  <input
                    type="number"
                    value={form.minStock}
                    onChange={set("minStock")}
                    placeholder="5"
                    className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl px-4 py-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Notes (optional)</label>
                <textarea
                  value={form.description}
                  onChange={set("description")}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300 resize-none"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="px-5 pt-3">
              <button
                onClick={handleSubmit}
                disabled={loading || !form.name.trim()}
                className={cn(
                  "w-full py-4 rounded-2xl text-white text-[14px] font-black uppercase tracking-widest shadow-md transition-all",
                  loading || !form.name.trim() ? "bg-gray-300" : "bg-emerald-500 active:scale-95"
                )}
              >
                {loading ? "Adding..." : "Add Item"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}