"use client";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cpu, Plus, Bell, ChevronRight, Zap, Target, RefreshCw, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTodayDashboardData } from "@/lib/actions";
import AddRecordModal from "@/components/ui/AddRecordModal";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({ username: "", businessName: "", id: "" });

  // 1. Initialize User from LocalStorage
  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      window.location.href = "/login";
    }
  }, []);

  // 2. REACT QUERY: Fetch Today's Data
  const { data, status, refetch, isFetching } = useQuery({
    queryKey: ["today-dashboard", user.id],
    queryFn: () => getTodayDashboardData(user.id),
    enabled: !!user.id, // Only run if we have a user ID
    staleTime: Infinity, // Keep cached data indefinitely until manually refreshed
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
  });

  // 3. Logic: Sum actual money (Cash & Online), ignore unpaid Credit
  const totalCollectedToday = data?.todayRecords
    ?.filter((r: any) => r.paymentMethod !== "CREDIT" || r.status === "SETTLED")
    .reduce((acc: number, curr: any) => acc + curr.amount, 0) || 0;

  if (status === "pending" && !user.id) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
       <RefreshCw size={32} className="text-[#007AFF] animate-spin" />
    </div>
  );

  return (
    <div className="px-6 pt-12 pb-32 space-y-8 min-h-screen bg-[#F2F2F7]">
      {/* 1. BRAND HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">BizTrack</h1>
          <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] mt-0.5">
            {user.businessName || "Your Bistro"} • Today
          </p>
        </div>
        <button 
          onClick={() => refetch()}
          className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center relative active:scale-90 transition-transform"
        >
          <Bell size={22} className={cn("text-black", isFetching && "animate-pulse")} />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </header>

      {/* 2. REVENUE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="ios-card p-7 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none"
      >
        <div className="flex justify-between items-start mb-1">
          <p className="text-black text-[11px] font-bold uppercase tracking-widest">Revenue Today</p>
          <div className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-tighter">Collected</div>
        </div>
        <h2 className="text-5xl font-black text-emerald-500">रू {totalCollectedToday.toLocaleString()}</h2>
        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-50">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 text-[#007AFF] text-[10px] font-black uppercase">
             {data?.todayRecords?.filter((r:any)=> r.paymentMethod !== "CREDIT").length ?? 0} Sales
          </div>
        </div>
      </motion.div>

      {/* 3. TERMINAL MONITOR */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] ml-1">Terminal Status</h3>
        {data?.devices?.map((device: any) => (
          <div key={device.id} className="ios-card p-4 flex items-center justify-between border-none shadow-sm bg-white active:scale-[0.98] transition-all">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black">
                <Cpu size={24} />
              </div>
              <div>
                <p className="text-[15px] font-black text-black">{device.name}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{device.type}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-gray-400 uppercase">Subscription</p>
              <p className={cn("text-sm font-black", device.daysLeft <= 5 ? "text-red-500" : "text-emerald-500")}>
                {device.daysLeft} Days
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. ACTIVITY FEED */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2 text-[#007AFF]">
            <Target size={20} />
            <h3 className="text-xl font-black text-black tracking-tight">Activity</h3>
          </div>
        </div>

        <div className="space-y-3">
          {data?.todayRecords?.map((record: any) => {
            const isCredit = record.paymentMethod === "CREDIT";
            return (
              <div key={record.id} className="bg-white p-5 rounded-[28px] flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-4">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", isCredit ? "bg-red-50 text-red-500" : "bg-emerald-50 text-emerald-500")}>
                    {isCredit ? <Users size={18} /> : <Zap size={18} fill="currentColor" />}
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-black leading-tight">{record.description || "Counter Order"}</p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-0.5">
                      {new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {record.paymentMethod.toLowerCase()}
                    </p>
                  </div>
                </div>
                <p className={cn("text-xl font-black tracking-tighter", isCredit ? "text-red-500" : "text-emerald-500")}>
                  {isCredit ? "— " : "+ "}रू {record.amount.toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. FLOATING ADD BUTTON */}
      <motion.button 
        whileTap={{ scale: 0.8 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-7 w-16 h-16 bg-[#007AFF] rounded-full shadow-[0_15px_45px_rgba(0,122,255,0.4)] flex items-center justify-center text-white z-40 border-4 border-white"
      >
        <Plus size={40} strokeWidth={3} />
      </motion.button>

      <AnimatePresence>
        {isModalOpen && (
          <AddRecordModal 
            isOpen={isModalOpen}
            userId={user.id} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              refetch(); // Only refetch today's dashboard data on success
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}