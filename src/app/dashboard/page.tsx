"use client";
import { useEffect, useState, useCallback } from "react";
import { Cpu, Plus, Bell, ChevronRight, Zap, Target, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getTodayDashboardData } from "@/lib/actions";
import AddRecordModal from "@/components/ui/AddRecordModal";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState({ username: "", businessName: "", id: "" });

  // fetch function to update the UI on mount or after a new sale
  const refreshUI = useCallback(async (userId: string) => {
    try {
      const res = await getTodayDashboardData(userId);
      setData(res);
    } catch (err) {
      toast.error("Failed to sync data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      refreshUI(parsed.id);
    } else {
      window.location.href = "/login";
    }
  }, [refreshUI]);

  if (loading) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
        <RefreshCw size={32} className="text-[#007AFF]" />
      </motion.div>
    </div>
  );

  return (
    <div className="px-6 pt-12 pb-32 space-y-8 min-h-screen bg-[#F2F2F7]">
      {/* 1. BRAND HEADER */}
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-black">BizTrack</h1>
          <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-[0.15em] mt-0.5">
            {user.businessName || "Haadi Bistro"} • Today
          </p>
        </div>
        <button className="w-11 h-11 rounded-full bg-white shadow-sm flex items-center justify-center relative active:scale-90 transition-transform">
          <Bell size={22} className="text-black" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </header>

      {/* 2. REVENUE CARD */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="ios-card p-7 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] border-none"
      >
        <div className="flex justify-between items-start mb-1">
          <p className="text-[#8E8E93] text-[11px] font-bold uppercase tracking-widest">Revenue Today</p>
          <div className="px-2 py-0.5 rounded-full bg-blue-50 text-[#007AFF] text-[9px] font-black">STABLE</div>
        </div>
        <h2 className="text-5xl font-black text-black">रू {data?.totalToday?.toLocaleString() ?? "0"}</h2>
        <div className="flex items-center gap-3 mt-6 pt-5 border-t border-gray-50">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 text-emerald-600 text-[10px] font-black">
             {data?.todayRecords?.length ?? 0} SALES
          </div>
          <p className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-tighter">
            AVG: रू {data?.todayRecords?.length > 0 ? (data.totalToday / data.todayRecords.length).toFixed(0) : "0"}
          </p>
        </div>
      </motion.div>

      {/* 3. HARDWARE MONITOR */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] ml-1">Terminal Status</h3>
        {data?.devices?.map((device: any) => (
          <div key={device.id} className="ios-card p-4 flex items-center justify-between border-none shadow-sm active:bg-gray-50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F2F2F7] flex items-center justify-center text-[#007AFF]">
                <Cpu size={24} />
              </div>
              <div>
                <p className="text-[15px] font-black text-black">{device.name}</p>
                <p className="text-[10px] text-green-500 font-black uppercase tracking-tight">Active • {device.type}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[9px] font-bold text-gray-400 uppercase">Sub</p>
                <p className={`text-sm font-black ${device.daysLeft < 7 ? 'text-red-500' : 'text-black'}`}>{device.daysLeft}d</p>
              </div>
              <ChevronRight size={18} className="text-gray-200" />
            </div>
          </div>
        ))}
      </div>

      {/* 4. ACTIVITY FEED (TODAY ONLY) */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-2">
            <Target size={20} className="text-[#007AFF]" />
            <h3 className="text-xl font-black text-black tracking-tight">Activity</h3>
          </div>
        </div>

        <div className="space-y-3">
          {data?.todayRecords?.length > 0 ? (
            data.todayRecords.map((record: any) => (
              <div key={record.id} className="bg-white p-5 rounded-[28px] flex items-center justify-between active:scale-[0.98] transition-transform shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#F2F2F7] flex items-center justify-center">
                    <Zap size={18} className="text-[#007AFF]" fill="#007AFF" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-black">{record.description || "Counter Order"}</p>
                    <p className="text-[11px] text-[#8E8E93] font-black uppercase tracking-tighter">
                      {new Date(record.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {record.source}
                    </p>
                  </div>
                </div>
                <p className="text-xl font-black text-black">रू {record.amount.toLocaleString()}</p>
              </div>
            ))
          ) : (
            <div className="py-20 text-center ios-card border-dashed bg-transparent shadow-none border-gray-200">
              <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Waiting for orders...</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. FLOATING ADD BUTTON (THUMB-READY) */}
      <motion.button 
        whileTap={{ scale: 0.8 }}
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-7 w-16 h-16 bg-[#007AFF] rounded-full shadow-[0_15px_45px_rgba(0,122,255,0.4)] flex items-center justify-center text-white z-40 border-4 border-white"
      >
        <Plus size={40} strokeWidth={3} />
      </motion.button>

      {/* MODAL OVERLAY */}
      <AnimatePresence>
        {isModalOpen && (
          <AddRecordModal 
            isOpen={isModalOpen}
            userId={user.id} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => {
              setIsModalOpen(false);
              refreshUI(user.id);
            }} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}