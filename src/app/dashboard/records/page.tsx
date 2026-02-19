"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ClipboardList, Plus, Search, Filter, Cpu, 
  ChevronLeft, ChevronRight, Calendar,
  ArrowUpRight, SlidersHorizontal, RotateCcw
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import AddRecordModal from "@/components/ui/AddRecordModal";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function RecordsPage() {
  const [records, setRecords] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Single date filter
  const [filters, setFilters] = useState({
    category: "", 
    date: "", // The specific day selected
    search: "",
  });

  const LIMIT = 15;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        ...(filters.search && { search: filters.search }),
        ...(filters.category && { category: filters.category }),
      });

      // Logic: If a single date is picked, send 'from' and 'to' as start/end of that day
      if (filters.date) {
        params.append("from", new Date(filters.date + "T00:00:00").toISOString());
        params.append("to", new Date(filters.date + "T23:59:59").toISOString());
      }
      
      const res = await fetch(`/api/records?${params}`);
      const data = await res.json();
      setRecords(data.records || []);
      setTotal(data.total || 0);
    } catch (err) {
      toast.error("Sync failed");
    } finally {
      setLoading(false);
    }
  }, [page, filters.search, filters.category, filters.date]);

  useEffect(() => { fetchRecords(); }, [fetchRecords]);

  const resetFilters = () => {
    setFilters({ category: "", date: "", search: "" });
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      {/* 1. Glassmorphism Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 pt-14 pb-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Accounting</p>
            <h1 className="text-3xl font-black text-black tracking-tighter">Records</h1>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-12 h-12 bg-[#007AFF] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 active:scale-90 transition-transform"
          >
            <Plus size={24} />
          </button>
        </div>

        <div className="flex gap-2 mt-6">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#007AFF] transition-colors" />
            <input
              type="text"
              placeholder="Search description..."
              value={filters.search}
              onChange={(e) => { setFilters(f => ({ ...f, search: e.target.value })); setPage(1); }}
              className="w-full bg-[#F2F2F7] border-none rounded-2xl py-3.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-[#007AFF]/20 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-3.5 rounded-2xl border transition-all active:scale-90",
              showFilters ? "bg-black text-white border-black" : "bg-white border-gray-100 text-gray-400 shadow-sm"
            )}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 mt-6 space-y-4">
        {/* 2. Simplified Single Date Filter Drawer */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden bg-white rounded-[32px] border border-gray-100 shadow-sm"
            >
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Filter by Day</span>
                    <button onClick={resetFilters} className="text-[10px] font-black text-[#007AFF] uppercase flex items-center gap-1">
                      <RotateCcw size={12} /> Reset
                    </button>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                      type="date" 
                      className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 pl-12 pr-4 text-sm font-bold"
                      value={filters.date}
                      onChange={(e) => { setFilters({...filters, date: e.target.value}); setPage(1); }}
                    />
                  </div>

                  <select 
                    className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-5 text-sm font-bold appearance-none"
                    value={filters.category}
                    onChange={(e) => { setFilters({...filters, category: e.target.value}); setPage(1); }}
                  >
                    <option value="">All Categories</option>
                    <option value="Sales">Sales</option>
                    <option value="Service">Services</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 3. Daily Summary Banner (Dynamic) */}
        {filters.date && records.length > 0 && (
          <div className="bg-[#007AFF] p-6 rounded-[32px] text-white shadow-xl shadow-blue-100">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Revenue for {formatDate(filters.date, "MMMM d, yyyy")}</p>
            <p className="text-3xl font-black tracking-tighter mt-1">
              {formatCurrency(records.reduce((acc, curr) => acc + curr.amount, 0))}
            </p>
          </div>
        )}

        {/* 4. List of Records */}
        <div className="space-y-3">
          {loading ? (
             [1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-[32px] animate-pulse" />)
          ) : records.length === 0 ? (
            <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mx-auto text-gray-300">
                <ClipboardList size={32} />
              </div>
              <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">No Sales Recorded</p>
            </div>
          ) : (
            records.map((record, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={record.id}
                className="bg-white p-5 rounded-[32px] shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.98] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center",
                    record.source === "device" ? "bg-purple-50 text-purple-500" : "bg-blue-50 text-blue-500"
                  )}>
                    {record.source === "device" ? <Cpu size={22} /> : <ArrowUpRight size={22} />}
                  </div>
                  <div>
                    <p className="font-black text-black text-sm tracking-tight">{record.description || "POS Payment"}</p>
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest mt-0.5">{formatDate(record.recordedAt, "h:mm a")} • {record.category}</p>
                  </div>
                </div>
                <p className="text-lg font-black text-emerald-500 tracking-tighter">+{formatCurrency(record.amount)}</p>
              </motion.div>
            ))
          )}
        </div>
      </main>

      {/* Modal Integration */}
      <AnimatePresence>
        {showModal && (
          <AddRecordModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchRecords(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}