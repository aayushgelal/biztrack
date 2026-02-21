"use client";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Wallet, Users, Clock, CheckCircle2, AlertCircle, RefreshCcw, SearchX } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { settleCreditRecord } from "@/lib/actions";
import toast from "react-hot-toast";

export default function RecordsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [confirmId, setConfirmId] = useState<string | null>(null);

  // 1. REACT QUERY: Infinite Scroll with Robust Safety
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isFetching
  } = useInfiniteQuery({
    queryKey: ["ledger-records", filter],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/records?type=${filter}&page=${pageParam}`);
      if (!res.ok) throw new Error("Failed to fetch ledger");
      return res.json();
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => (lastPage?.hasMore ? lastPage.page + 1 : undefined),
    staleTime: Infinity, 
    gcTime: 1000 * 60 * 60,
    refetchOnWindowFocus: false,
  });

  // 2. SETTLEMENT MUTATION
  const mutation = useMutation({
    mutationFn: settleCreditRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ledger-records"] });
      // Also update dashboard totals if they share the cache
      queryClient.invalidateQueries({ queryKey: ["today-dashboard"] }); 
      toast.success("Settled Successfully");
      setConfirmId(null);
    },
    onError: () => toast.error("Settlement failed")
  });

  // 3. INFINITE SCROLL OBSERVER
  const observerElem = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchNextPage();
      },
      { threshold: 0.1 }
    );
    if (observerElem.current) observer.observe(observerElem.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage, isFetchingNextPage]);

  // SAFE DATA EXTRACTION: Prevents "Cannot read properties of undefined"
  const allRecords = data?.pages?.flatMap((page) => page?.records ?? []) ?? [];

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      {/* 1. STICKY GLASS HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 pt-12 pb-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-black text-black tracking-tighter">Business Ledger</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transaction History</p>
          </div>
          <button 
            onClick={() => refetch()} 
            disabled={isFetching}
            className={cn(
                "p-2.5 rounded-full bg-white shadow-sm border border-gray-100 transition-all active:scale-90",
                isFetching ? "text-blue-500" : "text-gray-400"
            )}
          >
            <RefreshCcw size={18} className={cn(isFetching && "animate-spin")} />
          </button>
        </div>
        
        {/* COMPACT PILL FILTERS */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100/50 rounded-2xl border border-gray-100/50">
          {["all", "online", "cash", "credit"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter",
                filter === t 
                    ? "bg-[#007AFF] text-white shadow-lg shadow-blue-200 scale-100" 
                    : "text-gray-400 hover:text-gray-600 scale-95"
              )}
            >
              {t === "online" ? "Digital" : t}
            </button>
          ))}
        </div>
      </header>

      {/* 2. ACTIVITY LIST */}
      <main className="px-5 mt-6 space-y-2.5">
        {status === "pending" ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Syncing Records...</p>
          </div>
        ) : allRecords.length === 0 ? (
            <div className="py-24 text-center space-y-3 opacity-20">
                <SearchX size={48} className="mx-auto text-gray-400" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No Transactions Found</p>
            </div>
        ) : (
          allRecords.map((record) => {
            // INNER SAFETY CHECK
            if (!record?.id) return null;

            const isCredit = record.paymentMethod === "CREDIT";
            const isHardware = record.paymentMethod === "HARDWARE";
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={record.id}
                className="bg-white p-4 rounded-[28px] shadow-sm border border-gray-50 flex items-center justify-between active:scale-[0.99] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-11 h-11 rounded-[18px] flex items-center justify-center shadow-inner",
                    isHardware ? "bg-blue-50 text-blue-500" : 
                    isCredit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500"
                  )}>
                    {isHardware ? <Globe size={20} /> : 
                     isCredit ? <Users size={20} /> : <Wallet size={20} />}
                  </div>
                  <div>
                    <p className="font-bold text-black text-[14px] leading-tight tracking-tight">{record.description || "Order Entry"}</p>
                    <p className="text-[9px] font-black text-gray-300 uppercase tracking-tighter mt-1 flex items-center gap-1">
                      <Clock size={10} /> {formatDate(record.recordedAt, "MMM d • h:mm a")}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className={cn(
                    "text-[15px] font-black tracking-tighter",
                    isCredit ? "text-red-500" : "text-emerald-500"
                  )}>
                    {isCredit ? "— " : "+ "}रू {record.amount?.toLocaleString() ?? "0"}
                  </p>
                  
                  {isCredit && (
                    <div className="mt-1 flex justify-end">
                      {record.status === "SETTLED" ? (
                        <div className="flex items-center gap-1 text-[#34C759]">
                          <span className="text-[8px] font-black uppercase tracking-tighter">Settled</span>
                          <CheckCircle2 size={12} strokeWidth={3} />
                        </div>
                      ) : (
                        <button 
                          onClick={() => setConfirmId(record.id)}
                          className="bg-red-500 text-white text-[8px] font-black px-3 py-1 rounded-full uppercase active:scale-90 transition-all shadow-md shadow-red-100"
                        >
                          Settle Now
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })
        )}

        {/* 3. INFINITE SCROLL TARGET */}
        <div ref={observerElem} className="h-16 flex items-center justify-center">
            {isFetchingNextPage && (
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
            )}
        </div>
      </main>

      {/* 4. SETTLEMENT MODAL */}
      <AnimatePresence>
        {confirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-[280px] bg-white rounded-[35px] p-8 text-center shadow-2xl border border-gray-100">
              <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-black text-black tracking-tight">Confirm Payment?</h3>
              <p className="text-[10px] font-bold text-gray-400 mt-2 leading-relaxed px-2 uppercase tracking-widest">
                This will mark the credit as paid and sync with Haadi Bistro cloud.
              </p>
              <div className="flex flex-col gap-2 mt-8">
                <button 
                    disabled={mutation.isPending}
                    onClick={() => mutation.mutate(confirmId)} 
                    className="w-full py-4 bg-[#007AFF] text-white rounded-[20px] text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-100 active:scale-95 transition-all"
                >
                  {mutation.isPending ? "Syncing..." : "Confirm Settlement"}
                </button>
                <button onClick={() => setConfirmId(null)} className="w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}