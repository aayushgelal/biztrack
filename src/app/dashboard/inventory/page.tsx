"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, RefreshCw, AlertTriangle, TrendingUp, ArrowDownCircle, ArrowUpCircle, Search, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getInventoryData } from "@/lib/actions";
import AddItemModal from "@/components/ui/AddItemModal";
import StockAdjustModal from "@/components/ui/StockAdjustModal";
import { cn } from "@/lib/utils";

type InventoryItem = {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  currentStock: number;
  minStock: number;
  maxStock: number | null;
  description: string | null;
};

export default function InventoryPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [user, setUser] = useState({ username: "", businessName: "", id: "" });
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) setUser(JSON.parse(stored));
    else window.location.href = "/login";
  }, []);

  const { data, status, refetch, isFetching } = useQuery({
    queryKey: ["inventory", user.id],
    queryFn: () => getInventoryData(user.id),
    enabled: !!user.id,
    staleTime: Infinity,
  });

  const categories = useMemo(() => ["All", ...(data?.categories ?? [])], [data?.categories]);

  const filteredItems = useMemo(() => {
    if (!data?.items) return [];
    return data.items.filter((item: InventoryItem) => {
      const matchCat = activeCategory === "All" || item.category === activeCategory;
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.sku && item.sku.toLowerCase().includes(search.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [data?.items, activeCategory, search]);

  const stockStatus = (item: InventoryItem) => {
    if (item.currentStock <= 0) return "out";
    if (item.currentStock <= item.minStock) return "low";
    return "ok";
  };

  return (
    <div className="px-5 pt-10 pb-32 space-y-6 min-h-screen bg-[#F2F2F7]">
      {/* HEADER */}
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-emerald-600 leading-none">Inventory</h1>
          <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-[0.12em] mt-1.5">
            {user.businessName || "Your Business"} • Stock
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
        >
          <RefreshCw size={18} className={cn("text-black", isFetching && "animate-spin")} />
        </button>
      </header>

      {/* STATS ROW */}
      <div className="grid grid-cols-3 gap-3">
        {/* Total Value */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="col-span-2 p-4 bg-white rounded-[22px] shadow-sm"
        >
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Inventory Value</p>
          <h2 className="text-2xl font-black text-emerald-500 tracking-tight mt-0.5">
            रू {(data?.totalInventoryValue ?? 0).toLocaleString()}
          </h2>
          <div className="flex gap-2 mt-3">
            <div className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">
              {data?.totalItems ?? 0} Items
            </div>
            {(data?.lowStockItems?.length ?? 0) > 0 && (
              <div className="px-2 py-0.5 rounded-lg bg-red-50 text-red-500 text-[8px] font-black uppercase flex items-center gap-1">
                <AlertTriangle size={8} />
                {data?.lowStockItems?.length} Low
              </div>
            )}
          </div>
        </motion.div>

        {/* Low stock count */}
        <motion.div
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
          className="p-4 bg-white rounded-[22px] shadow-sm flex flex-col justify-between"
        >
          <AlertTriangle size={18} className={data?.lowStockItems?.length ? "text-red-500" : "text-gray-300"} />
          <div>
            <p className="text-2xl font-black text-black">{data?.lowStockItems?.length ?? 0}</p>
            <p className="text-[8px] font-black text-gray-400 uppercase tracking-wider">Low Stock</p>
          </div>
        </motion.div>
      </div>

      {/* RECENT MOVEMENTS */}
      {(data?.recentMovements?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] ml-1">Recent Movements</h3>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {data?.recentMovements?.slice(0, 5).map((m: any) => (
              <div key={m.id} className="flex-shrink-0 bg-white rounded-2xl px-3 py-2.5 flex items-center gap-2 shadow-sm min-w-[140px]">
                {m.type === "IN" ? (
                  <ArrowDownCircle size={14} className="text-emerald-500 flex-shrink-0" />
                ) : m.type === "OUT" ? (
                  <ArrowUpCircle size={14} className="text-red-500 flex-shrink-0" />
                ) : (
                  <TrendingUp size={14} className="text-blue-500 flex-shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[11px] font-bold text-black truncate">{m.item?.name}</p>
                  <p className={cn("text-[10px] font-black", m.type === "IN" ? "text-emerald-500" : m.type === "OUT" ? "text-red-500" : "text-blue-500")}>
                    {m.type === "IN" ? "+" : m.type === "OUT" ? "-" : "="}{m.quantity} {m.item?.unit}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SEARCH & FILTER */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
          <Search size={16} className="text-gray-300 flex-shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items or SKU..."
            className="flex-1 text-[14px] font-semibold text-black outline-none bg-transparent placeholder:text-gray-300"
          />
        </div>

        {/* Category tabs */}
        {categories.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "flex-shrink-0 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all",
                  activeCategory === cat ? "bg-emerald-500 text-white shadow-sm" : "bg-white text-gray-400"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ITEM LIST */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em]">
            Items {filteredItems.length > 0 && `• ${filteredItems.length}`}
          </h3>
          <Filter size={14} className="text-gray-400" />
        </div>

        <AnimatePresence>
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-[22px] p-10 flex flex-col items-center gap-3 shadow-sm">
              <Package size={32} className="text-gray-200" />
              <p className="text-[12px] font-bold text-gray-300 uppercase tracking-widest text-center">
                {data?.items?.length === 0 ? "No items yet\nTap + to add your first item" : "No items match your search"}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredItems.map((item: InventoryItem, i: number) => {
                const status = stockStatus(item);
                const margin = item.sellingPrice > 0
                  ? Math.round(((item.sellingPrice - item.costPrice) / item.sellingPrice) * 100)
                  : 0;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }}
                    className="bg-white rounded-[22px] p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      {/* Left */}
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          status === "out" ? "bg-red-50" : status === "low" ? "bg-orange-50" : "bg-emerald-50"
                        )}>
                          <Package size={18} className={cn(
                            status === "out" ? "text-red-400" : status === "low" ? "text-orange-400" : "text-emerald-500"
                          )} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-[14px] font-bold text-black leading-tight truncate">{item.name}</p>
                            {status === "out" && (
                              <span className="px-1.5 py-0.5 rounded-md bg-red-100 text-red-500 text-[7px] font-black uppercase">Out</span>
                            )}
                            {status === "low" && (
                              <span className="px-1.5 py-0.5 rounded-md bg-orange-100 text-orange-500 text-[7px] font-black uppercase">Low</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <p className="text-[10px] text-gray-400 font-semibold">{item.category}</p>
                            {item.sku && <p className="text-[10px] text-gray-300 font-semibold">#{item.sku}</p>}
                          </div>

                          {/* Price row */}
                          <div className="flex items-center gap-3 mt-2">
                            <div>
                              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Cost</p>
                              <p className="text-[12px] font-bold text-black">रू {item.costPrice.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">Sell</p>
                              <p className="text-[12px] font-bold text-emerald-600">रू {item.sellingPrice.toLocaleString()}</p>
                            </div>
                            {margin > 0 && (
                              <div className="px-1.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[8px] font-black">
                                {margin}% margin
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right - Stock + Adjust */}
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className="text-right">
                          <p className={cn(
                            "text-[20px] font-black leading-none",
                            status === "out" ? "text-red-500" : status === "low" ? "text-orange-500" : "text-black"
                          )}>
                            {item.currentStock}
                          </p>
                          <p className="text-[9px] text-gray-400 font-bold">{item.unit}</p>
                        </div>

                        {/* Stock progress bar */}
                        {item.maxStock && (
                          <div className="w-14 h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min((item.currentStock / item.maxStock) * 100, 100)}%` }}
                              className={cn("h-full rounded-full", status === "out" ? "bg-red-400" : status === "low" ? "bg-orange-400" : "bg-emerald-500")}
                            />
                          </div>
                        )}

                        <button
                          onClick={() => setAdjustItem(item)}
                          className="px-3 py-1.5 bg-emerald-500 text-white text-[9px] font-black rounded-xl uppercase shadow-sm active:scale-90 transition-transform"
                        >
                          Adjust
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </AnimatePresence>
      </section>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 border-[3px] border-white"
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>

      {/* ADD ITEM MODAL */}
      <AddItemModal
        isOpen={isAddModalOpen}
        userId={user.id}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => { setIsAddModalOpen(false); refetch(); }}
      />

      {/* STOCK ADJUST MODAL */}
      <StockAdjustModal
        isOpen={!!adjustItem}
        item={adjustItem}
        onClose={() => setAdjustItem(null)}
        onSuccess={() => { setAdjustItem(null); refetch(); }}
      />
    </div>
  );
}