"use client";
import { useEffect, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Globe, Wallet, Clock, RefreshCcw, SearchX } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export default function RecordsPage() {
  const [filter, setFilter] = useState("all");

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
    refetchOnWindowFocus: false,
  });

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

  const allRecords = data?.pages?.flatMap((page) => page?.records ?? []) ?? [];

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      {/* 1. HEADER - Synced with Home Dashboard */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-5 pt-10 pb-5">
        <div className="flex justify-between items-end px-1 mb-5">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-emerald-600 leading-none">History</h1>
            <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-[0.12em] mt-1.5">
              Cash & Digital Logs
            </p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
          >
            <RefreshCcw size={18} className={cn("text-black", isFetching && "animate-spin text-emerald-500")} />
          </button>
        </div>
        
        {/* 2. FILTER SEGMENT - Emerald Theme */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-gray-100/50 rounded-[18px]">
          {["all", "online", "cash"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "py-2 rounded-[14px] text-[10px] font-bold transition-all uppercase tracking-tight",
                filter === t ? "bg-emerald-500 text-white shadow-sm" : "text-gray-400"
              )}
            >
              {t === "online" ? "Digital" : t}
            </button>
          ))}
        </div>
      </header>

      {/* 3. MAIN CONTENT */}
      <main className="px-5 mt-6 space-y-2">
        {status === "pending" ? (
          <div className="py-20 flex justify-center">
             <RefreshCcw size={24} className="text-emerald-500 animate-spin" />
          </div>
        ) : allRecords.length === 0 ? (
            <div className="py-24 text-center opacity-20 flex flex-col items-center">
                <SearchX size={40} className="mb-2" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Records Found</p>
            </div>
        ) : (
          allRecords.map((record) => (
            <motion.div
              layout
              key={record.id}
              className="bg-white p-3.5 rounded-[22px] shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-9 h-9 rounded-full flex items-center justify-center",
                  "bg-emerald-50 text-emerald-600"
                )}>
                  {record.paymentMethod === "online" || record.paymentMethod === "HARDWARE" 
                    ? <Globe size={16} /> 
                    : <Wallet size={16} />
                  }
                </div>
                <div>
                  {/* Title font size and weight matched to activity feed */}
                  <p className="text-[13px] font-semibold text-black leading-tight">
                    {record.description || "Order Entry"}
                  </p>
                  <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-tight flex items-center gap-1">
                    <Clock size={10} /> {formatDate(record.recordedAt, "MMM d • h:mm a")}
                  </p>
                </div>
              </div>
              {/* Removed + symbol, kept color and font weight as requested */}
              <p className="text-[15px] font-bold text-emerald-500 tracking-tight">
                रू {record.amount?.toLocaleString()}
              </p>
            </motion.div>
          ))
        )}
        <div ref={observerElem} className="h-10" />
      </main>
    </div>
  );
}