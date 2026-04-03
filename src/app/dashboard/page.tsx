"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cpu, Plus, RefreshCw, Zap, Target, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTodayDashboardData } from "@/lib/actions";
import AddRecordModal from "@/components/ui/AddRecordModal";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({ username: "", businessName: "", id: "" });

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      window.location.href = "/login";
    }
  }, []);

  const { data, status, refetch, isFetching } = useQuery({
    queryKey: ["today-dashboard", user.id],
    queryFn: () => getTodayDashboardData(user.id),
    enabled: !!user.id,
    staleTime: Infinity,
  });

  const totalCollectedToday = data?.todayRecords
    ?.filter((r: any) => r.paymentMethod !== "CREDIT" || r.status === "SETTLED")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

  if (status === "pending" && !user.id) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
       <RefreshCw size={28} className="text-emerald-500 animate-spin" />
    </div>
  );

  return (
    <div className="px-5 pt-10 pb-32 space-y-6 min-h-screen bg-[#F2F2F7]">
      {/* 1. BRAND HEADER */}
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-emerald-600 leading-none">Pasalee QR</h1>
          <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-[0.12em] mt-1.5">
            {user.businessName || "Your Business"} • Today
          </p>
        </div>
        <button 
          onClick={() => window.location.reload()} 
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
        >
          <RefreshCw size={18} className={cn("text-black", isFetching && "animate-spin")} />
        </button>
      </header>

      {/* 2. REVENUE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="p-6 bg-white rounded-[24px] shadow-sm border-none"
      >
        <div className="flex justify-between items-start mb-0.5">
          <p className="text-[#8E8E93] text-[10px] font-bold uppercase tracking-wider">Revenue Today</p>
          <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase">Collected</div>
        </div>
        <h2 className="text-4xl font-black text-emerald-500 tracking-tight">रू {totalCollectedToday.toLocaleString()}</h2>
        <div className="mt-4 pt-4 border-t border-gray-50">
          <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 text-[9px] font-bold uppercase">
             {data?.todayRecords?.filter((r:any)=> r.paymentMethod !== "CREDIT").length ?? 0} Transactions
          </div>
        </div>
      </motion.div>

      {/* 3. TERMINAL MONITOR - Extra Compact */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] ml-1">Terminal Status</h3>
        {data?.devices?.map((device: any) => (
          <div key={device.id} className="p-3 bg-white rounded-2xl shadow-sm active:scale-[0.98] transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center text-black">
                  <Cpu size={18} />
                </div>
                <div>
                  <p className="text-[13px] font-bold text-black leading-none">{device.name}</p>
                  <p className="text-[8px] text-gray-400 font-bold uppercase mt-1 tracking-tight">{device.type}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                   <p className={cn("text-[9px] font-black", device.daysLeft <= 5 ? "text-red-500" : "text-emerald-500")}>
                    {device.daysLeft}d left
                   </p>
                   <div className="w-10 h-1 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        style={{ width: `${Math.min((device.daysLeft / 30) * 100, 100)}%` }}
                        className={cn("h-full", device.daysLeft <= 5 ? "bg-red-500" : "bg-emerald-500")}
                      />
                   </div>
                </div>
                <button className="px-2.5 py-1 bg-emerald-500 text-white text-[8px] font-black rounded-lg uppercase shadow-sm">
                  Pay
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ACTIVITY FEED - Compact App Look */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1 text-emerald-500">
          <Target size={16} />
          <h3 className="text-[11px] font-black text-black uppercase tracking-widest">Activity</h3>
        </div>

        <div className="space-y-2">
          {data?.todayRecords?.map((record: any) => {
            const isCredit = record.paymentMethod === "CREDIT";
            return (
              <div key={record.id} className="bg-white p-3.5 rounded-[22px] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                  <div className={cn("w-9 h-9 rounded-full flex items-center justify-center", isCredit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500")}>
                    {isCredit ? <Users size={14} /> : <Zap size={14} fill="currentColor" />}
                  </div>
                  <div>
                    {/* Description is now Title */}
                    <p className="text-[13px] font-semibold text-black leading-tight">
                      {record.description || (isCredit ? "Credit Record" : "QR Payment Received")}
                    </p>
                    {/* Device ID and Time as subtitle */}
                    <p className="text-[10px] text-gray-400 font-medium mt-0.5 tracking-tight">
                      {new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Device: {record.deviceId?.slice(-6) || "N/A"}
                    </p>
                  </div>
                </div>
                {/* No +/- symbols, just color */}
                <p className={cn("text-[15px] font-bold tracking-tight", isCredit ? "text-red-500" : "text-emerald-500")}>
                  रू {record.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FLOATING ADD BUTTON */}
      <motion.button 
        whileTap={{ scale: 0.85 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-white z-40 border-[3px] border-white"
      >
        <Plus size={32} strokeWidth={3} />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <AddRecordModal 
            isOpen={isModalOpen}
            userId={user.id} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => { setIsModalOpen(false); refetch(); }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}