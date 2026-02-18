"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  ClipboardList, Plus, Search, Filter, Cpu, 
  Trash2, ChevronLeft, ChevronRight, X 
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import AddRecordModal from "@/components/ui/AddRecordModal";
import { formatCurrency, formatDate, cn } from "@/lib/utils";
import { EARNING_CATEGORIES } from "@/types";
import toast from "react-hot-toast";

interface Record {
  id: string;
  amount: number;
  category: string;
  description?: string | null;
  source: string;
  recordedAt: string;
  device?: { id: string; name: string } | null;
}

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [devices, setDevices] = useState<{id: string, name: string}[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: "",
    source: "",
    deviceId: "",
    from: "",
    to: "",
    search: "",
  });

  const LIMIT = 20;
  const totalPages = Math.ceil(total / LIMIT);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LIMIT.toString(),
        ...(filters.category && { category: filters.category }),
        ...(filters.source && { source: filters.source }),
        ...(filters.deviceId && { deviceId: filters.deviceId }),
        ...(filters.from && { from: new Date(filters.from).toISOString() }),
        ...(filters.to && { to: new Date(filters.to + "T23:59:59").toISOString() }),
      });

      const [recRes, subRes] = await Promise.all([
        fetch(`/api/records?${params}`),
        fetch("/api/subscription"),
      ]);

      const recData = await recRes.json();
      const subData = await subRes.json();

      setRecords(recData.records || []);
      setTotal(recData.total || 0);
      if (subData.subscriptions) {
        setDevices(subData.subscriptions.map((s: any) => s.device));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load records");
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this record?")) return;
    try {
      const res = await fetch(`/api/earnings?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Record deleted");
      fetchRecords();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const hasFilters = Object.values(filters).some(v => v !== "");

  return (
    <div className="space-y-5 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Records</h1>
          <p className="text-surface-500 text-sm">{total.toLocaleString()} total</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus size={18} />
          <span className="font-semibold text-sm">Add Record</span>
        </button>
      </div>

      {/* Search & Filter Trigger */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search records..."
            value={filters.search}
            onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
            className="w-full bg-surface-800 border border-surface-700 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "p-2.5 rounded-xl border transition-all flex items-center gap-2",
            hasFilters ? "bg-brand-500/10 border-brand-500 text-brand-500" : "bg-surface-800 border-surface-700 text-surface-400"
          )}
        >
          <Filter size={20} />
        </button>
      </div>

      {/* Table / List View */}
      <div className="bg-surface-900 border border-surface-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-surface-800 animate-pulse rounded-xl" />)}
          </div>
        ) : records.length === 0 ? (
          <div className="py-20 text-center">
            <ClipboardList className="mx-auto text-surface-700 mb-4" size={48} />
            <p className="text-surface-500">No records found</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-800">
            {records.map((record) => (
              <div key={record.id} className="p-4 flex items-center justify-between hover:bg-surface-800/50 transition-colors">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                      {record.category}
                    </span>
                    {record.source === "device" && <Cpu size={14} className="text-purple-400" />}
                  </div>
                  <p className="text-white font-medium">{record.description || "Manual Entry"}</p>
                  <p className="text-xs text-surface-500">{formatDate(record.recordedAt, "MMM d, h:mm a")}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-emerald-400">+{formatCurrency(record.amount)}</span>
                  <button onClick={() => handleDelete(record.id)} className="text-surface-600 hover:text-red-500 transition-colors p-1">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(p => p - 1)}
            className="p-2 bg-surface-800 rounded-lg disabled:opacity-30"
          >
            <ChevronLeft />
          </button>
          <span className="text-sm text-surface-500">Page {page} of {totalPages}</span>
          <button 
            disabled={page === totalPages} 
            onClick={() => setPage(p => p + 1)}
            className="p-2 bg-surface-800 rounded-lg disabled:opacity-30"
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* MODAL: Fixed with AnimatePresence and Conditional Rendering */}
      <AnimatePresence>
        {showModal && (
          <AddRecordModal
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onSuccess={() => {
              setShowModal(false);
              fetchRecords();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}