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
      // Filter out credit from this view or keep it as read-only
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
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 pt-12 pb-5">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h1 className="text-xl font-black text-black tracking-tighter">History</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cash & Digital Logs</p>
          </div>
          <button 
            onClick={() => refetch()} 
            className="p-2.5 rounded-full bg-white shadow-sm border border-gray-100 active:scale-90"
          >
            <RefreshCcw size={18} className={cn(isFetching && "animate-spin")} />
          </button>
        </div>
        
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-gray-100/50 rounded-2xl">
          {["all", "online", "cash"].map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={cn(
                "py-2.5 rounded-xl text-[10px] font-black transition-all uppercase tracking-tighter",
                filter === t ? "bg-[#007AFF] text-white shadow-md" : "text-gray-400"
              )}
            >
              {t === "online" ? "Digital" : t}
            </button>
          ))}
        </div>
      </header>

      <main className="px-5 mt-6 space-y-2.5">
        {status === "pending" ? (
          <div className="py-20 flex flex-col items-center">
             <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : allRecords.length === 0 ? (
            <div className="py-24 text-center opacity-20">
                <SearchX size={48} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">No Records</p>
            </div>
        ) : (
          allRecords.map((record) => (
            <motion.div
              layout
              key={record.id}
              className="bg-white p-4 rounded-[28px] shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={cn(
                  "w-11 h-11 rounded-[18px] flex items-center justify-center",
                  record.paymentMethod === "HARDWARE" ? "bg-blue-50 text-blue-500" : "bg-emerald-50 text-emerald-500"
                )}>
                  {record.paymentMethod === "HARDWARE" ? <Globe size={20} /> : <Wallet size={20} />}
                </div>
                <div>
                  <p className="font-bold text-black text-[14px] leading-tight">{record.description || "Order Entry"}</p>
                  <p className="text-[9px] font-black text-gray-300 uppercase mt-1 flex items-center gap-1">
                    <Clock size={10} /> {formatDate(record.recordedAt, "MMM d • h:mm a")}
                  </p>
                </div>
              </div>
              <p className="text-[15px] font-black text-emerald-500 tracking-tighter">
                + रू {record.amount?.toLocaleString()}
              </p>
            </motion.div>
          ))
        )}
        <div ref={observerElem} className="h-10" />
      </main>
    </div>
  );
}