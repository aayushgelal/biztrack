"use client";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Cpu, ChevronRight, Eye, EyeOff, X, Plus, Trash2, 
  LogOut, CreditCard, RefreshCcw, ShieldCheck, Sparkles, Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [showAddHardware, setShowAddHardware] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // 1. Fetch User Data (Make sure your API includes subscriptions)
  const { data: userData, status } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => fetch("/api/user/me").then(res => res.json()),
    staleTime: Infinity,
  });

  const hardwareMutation = useMutation({
    mutationFn: async ({ action, body }: any) => {
      const method = action === 'add' ? 'POST' : action === 'remove' ? 'DELETE' : 'PATCH';
      const url = action === 'remove' ? `/api/device/config?id=${body.id}` : "/api/device/config";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: action === 'remove' ? null : JSON.stringify(body),
      });
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["today-dashboard"] });
      toast.success(variables.action === 'renew' ? "Licence Extended" : "Sync Successful");
      setShowAddHardware(false);
      setActiveDevice(null);
      setIsEditing(false);
    }
  });

  if (status === "pending") return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
      <RefreshCcw className="animate-spin text-[#007AFF]" size={32} />
    </div>
  );

  const user = userData?.user;

  // SAFE CALCULATION: Ensure it looks at the correct property from your backend
  const mainDevice = user?.devices?.[0];
  const sub = mainDevice?.subscriptions?.[0] || mainDevice?.subscription; // Handle both plural/singular
  
  const daysLeft = sub?.endDate 
    ? Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) 
    : 0;
    
  const isExpiringSoon = daysLeft <= 10;

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      {/* 1. BRAND HEADER */}
      <div className="bg-[#007AFF] px-6 pt-16 pb-16 rounded-b-[50px] shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-16 h-16 bg-white rounded-[24px] flex items-center justify-center text-[#007AFF] shadow-xl">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">{user?.businessName}</h1>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mt-2">Merchant: {user?.username}</p>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-6 -mt-10 space-y-6 relative z-20">
        
        {/* 2. LICENCE STATUS CARD */}
        <section className="bg-white rounded-[32px] p-6 shadow-xl border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 text-[#007AFF] rounded-xl flex items-center justify-center">
                        <ShieldCheck size={16} />
                    </div>
                    <h3 className="text-xs font-black text-black uppercase tracking-tight">System Licence</h3>
                </div>
                <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter",
                    isExpiringSoon ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                )}>
                    {isExpiringSoon ? "Action Required" : "Active"}
                </span>
            </div>
            
            <div className="flex justify-between items-end relative z-10">
                <div>
                    <p className="text-3xl font-black text-black tracking-tighter leading-none">
                        {daysLeft > 0 ? daysLeft : 0} <span className="text-[10px] text-gray-400 uppercase">Days Left</span>
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">NPR 1,000 / Year</p>
                </div>
                <button 
                    onClick={() => hardwareMutation.mutate({ action: 'renew', body: { deviceId: mainDevice?.id } })}
                    className="bg-black text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase shadow-lg active:scale-95 transition-all flex items-center gap-2"
                >
                    <Sparkles size={12} className="text-yellow-400" /> Renew Now
                </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] pointer-events-none">
                <CreditCard size={100} />
            </div>
        </section>

        {/* 3. TERMINAL MONITOR (DEVICES) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xs font-black text-black uppercase tracking-[0.2em] ml-1">Terminal Status</h3>
            <button onClick={() => setShowAddHardware(true)} className="w-8 h-8 bg-[#007AFF] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform">
              <Plus size={18} />
            </button>
          </div>

          {user?.devices?.map((device: any) => {
            // Per-device logic
            const devSub = device.subscription;
            const devDaysLeft = devSub ? Math.ceil((new Date(devSub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0;
            
            return (
              <div key={device.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div 
                  onClick={() => { setActiveDevice(activeDevice === device.id ? null : device.id); setIsEditing(false); }}
                  className="p-4 flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-black shadow-inner">
                      <Cpu size={24} />
                    </div>
                    <div>
                      <p className="text-[15px] font-black text-black">{device.name}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{device.serialNumber}</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                        <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">Subscription</p>
                        <p className={cn("text-sm font-black leading-none", devDaysLeft <= 5 ? "text-red-500" : "text-emerald-500")}>
                            {devDaysLeft > 0 ? devDaysLeft : 0} Days
                        </p>
                    </div>
                    <ChevronRight size={18} className={cn("text-gray-300 transition-transform", activeDevice === device.id && "rotate-90")} />
                  </div>
                </div>

                <AnimatePresence>
                  {activeDevice === device.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="px-6 pb-6 space-y-4 overflow-hidden">
                      {isEditing ? (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const fd = new FormData(e.currentTarget);
                          hardwareMutation.mutate({
                            action: 'update',
                            body: {
                              deviceId: device.id,
                              name: fd.get('name'),
                              fonepayMerchantCode: fd.get('pid'),
                              fonepaySecretKey: fd.get('hash') || undefined
                            }
                          });
                        }} className="space-y-3 pt-2">
                          <input name="name" defaultValue={device.name} className="w-full bg-[#F2F2F7] p-4 rounded-2xl text-xs font-bold border-none" placeholder="Nickname" />
                          <input name="pid" defaultValue={device.fonepayMerchantCode} className="w-full bg-[#F2F2F7] p-4 rounded-2xl text-xs font-bold border-none" placeholder="Merchant PID" />
                          <input name="hash" type="password" className="w-full bg-[#F2F2F7] p-4 rounded-2xl text-xs font-bold border-none" placeholder="New Secret Hash (Optional)" />
                          <div className="flex gap-2">
                             <button type="submit" className="flex-[2] bg-[#007AFF] text-white py-3.5 rounded-2xl font-black text-[10px] uppercase">Save Changes</button>
                             <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-400 py-3.5 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-4 pt-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-gray-50 rounded-2xl">
                              <p className="text-[8px] font-black text-gray-400 uppercase">Gateway PID</p>
                              <p className="text-[11px] font-bold text-black truncate">{device.fonepayMerchantCode}</p>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-2xl">
                              <p className="text-[8px] font-black text-gray-400 uppercase">Security</p>
                              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-tighter">Encrypted</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => setIsEditing(true)} className="flex-1 py-3 bg-blue-50 text-[#007AFF] rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2"><Edit3 size={14}/> Config</button>
                            <button onClick={() => confirm("Delete Device?") && hardwareMutation.mutate({ action: 'remove', body: { id: device.id } })} className="p-3 bg-red-50 text-red-500 rounded-2xl"><Trash2 size={16}/></button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        {/* 4. LOGOUT */}
        <button 
            onClick={() => { fetch("/api/auth", { method: "DELETE" }); window.location.href = "/login"; }} 
            className="w-full bg-white rounded-[32px] p-5 flex items-center justify-between border border-gray-100 shadow-sm active:bg-red-50 group"
        >
            <div className="flex items-center gap-4 text-red-500">
                <div className="w-10 h-10 bg-red-50 rounded-2xl flex items-center justify-center group-active:scale-90 transition-transform">
                    <LogOut size={20} />
                </div>
                <span className="text-[12px] font-black uppercase tracking-widest">Logout</span>
            </div>
            <ChevronRight size={18} className="text-gray-200" />
        </button>
      </div>
      
      {/* 5. ADD HARDWARE MODAL */}
      <AnimatePresence>
        {showAddHardware && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl relative">
              <button onClick={() => setShowAddHardware(false)} className="absolute top-8 right-8 text-gray-300 hover:text-black">
                <X size={24}/>
              </button>
              
              <div className="mb-6">
                <h2 className="text-2xl font-black tracking-tighter text-black">Add Hardware</h2>
                <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-widest">Connect Soundbox</p>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  hardwareMutation.mutate({
                    action: 'add',
                    body: {
                      name: fd.get("name"),
                      serialNumber: fd.get("serial"),
                      fonepayMerchantCode: fd.get("pid"),
                      fonepaySecretKey: fd.get("hash"),
                    }
                  });
                }}
                className="space-y-4"
              >
                <input name="name" placeholder="Device Nickname" required className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold" />
                <input name="serial" placeholder="Serial ID (e.g. SN1234)" required className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold" />
                <input name="pid" placeholder="Merchant PID" required className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold" />
                <div className="relative">
                  <input name="hash" type={showSecret ? "text" : "password"} placeholder="Security Hash" required className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold pr-14" />
                  <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-5 top-4 text-gray-300">
                    {showSecret ? <EyeOff size={18}/> : <Eye size={18}/>}
                  </button>
                </div>

                <button type="submit" className="w-full bg-black text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest shadow-2xl active:scale-95 transition-all mt-2">
                  {hardwareMutation.isPending ? "Connecting..." : "Link Hardware"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}