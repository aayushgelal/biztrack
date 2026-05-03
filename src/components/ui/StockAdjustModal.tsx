"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowDownCircle, ArrowUpCircle, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface StockAdjustModalProps {
  isOpen: boolean;
  item: { id: string; name: string; currentStock: number; unit: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const MOVEMENT_TYPES = [
  { type: "IN", label: "Stock In", icon: ArrowDownCircle, color: "text-emerald-500", bg: "bg-emerald-50" },
  { type: "OUT", label: "Stock Out", icon: ArrowUpCircle, color: "text-red-500", bg: "bg-red-50" },
  { type: "ADJUSTMENT", label: "Adjust", icon: SlidersHorizontal, color: "text-blue-500", bg: "bg-blue-50" },
];

export default function StockAdjustModal({ isOpen, item, onClose, onSuccess }: StockAdjustModalProps) {
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!item || !quantity) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/inventory/${item.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantity: parseFloat(quantity), note }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed");
      }
      setQuantity("");
      setNote("");
      onSuccess();
    } catch (e: any) {
      alert(e.message || "Failed to update stock.");
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  const newStock = () => {
    const q = parseFloat(quantity) || 0;
    if (type === "IN") return item.currentStock + q;
    if (type === "OUT") return item.currentStock - q;
    return q;
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
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 py-3">
              <div>
                <h2 className="text-[17px] font-black text-black tracking-tight">Adjust Stock</h2>
                <p className="text-[11px] text-gray-400 font-semibold">{item.name} • {item.currentStock} {item.unit} current</p>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            <div className="px-5 space-y-3">
              {/* Type selector */}
              <div className="grid grid-cols-3 gap-2">
                {MOVEMENT_TYPES.map(({ type: t, label, icon: Icon, color, bg }) => (
                  <button
                    key={t}
                    onClick={() => setType(t as any)}
                    className={cn(
                      "py-3 rounded-2xl flex flex-col items-center gap-1.5 transition-all border-2",
                      type === t ? `${bg} border-current ${color}` : "bg-white border-transparent text-gray-400"
                    )}
                  >
                    <Icon size={18} />
                    <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
                  </button>
                ))}
              </div>

              {/* Quantity */}
              <div className="bg-white rounded-2xl px-4 py-4">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                  {type === "ADJUSTMENT" ? "Set Stock To" : "Quantity"} ({item.unit})
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  className="w-full text-[28px] font-black text-black mt-1 outline-none bg-transparent placeholder:text-gray-200"
                />
                {quantity && (
                  <p className={cn("text-[11px] font-bold mt-1", newStock() < 0 ? "text-red-500" : "text-emerald-500")}>
                    → New stock: {newStock()} {item.unit}
                  </p>
                )}
              </div>

              {/* Note */}
              <div className="bg-white rounded-2xl px-4 py-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-400">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. Purchase from supplier"
                  className="w-full text-[15px] font-semibold text-black mt-1 outline-none bg-transparent placeholder:text-gray-300"
                />
              </div>
            </div>

            <div className="px-5 pt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !quantity}
                className={cn(
                  "w-full py-4 rounded-2xl text-white text-[14px] font-black uppercase tracking-widest shadow-md transition-all",
                  loading || !quantity ? "bg-gray-300" : "bg-emerald-500 active:scale-95"
                )}
              >
                {loading ? "Saving..." : "Confirm"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}