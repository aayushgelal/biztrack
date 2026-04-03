"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Cpu, ChevronRight, Eye, EyeOff, X, Plus, Trash2, 
  LogOut, RefreshCw, ShieldCheck, Sparkles, Edit3,
  Users, Key, ShieldAlert, ChevronLeft, Building2, Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type ViewState = "main" | "staff" | "hardware";

export default function SettingsPage() {
  const [view, setView] = useState<ViewState>("main");
  const queryClient = useQueryClient();

  const { data: userData, status } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => fetch("/api/user/me").then(res => res.json()),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (status === "pending") return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
      <RefreshCw className="animate-spin text-[#007AFF]" size={32} />
    </div>
  );

  const user = userData?.user;

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-32">
      <AnimatePresence mode="wait">
        {view === "main" && (
          <MainMenuView key="main" user={user} onNavigate={setView} />
        )}
        {view === "staff" && (
          <StaffView key="staff" staff={user?.staffMembers} onBack={() => setView("main")} />
        )}
        {view === "hardware" && (
          <HardwareView key="hardware" devices={user?.devices} onBack={() => setView("main")} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- SUB-PAGE: MAIN MENU ---
// Inside SettingsPage component, update the MainMenuView function:

function MainMenuView({ user, onNavigate }: { user: any; onNavigate: (v: ViewState) => void }) {
  const isOwner = user?.role === "MERCHANT";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
      <div className="bg-[#007AFF] px-8 pt-20 pb-16 rounded-b-[60px] shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-white rounded-[30px] flex items-center justify-center text-[#007AFF] shadow-2xl">
            <User size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tighter leading-none">{user?.businessName}</h1>
            <p className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em] mt-3">
               {isOwner ? "Owner" : "Staff"}: {user?.username}
            </p>
          </div>
        </div>
        <Zap className="absolute -right-10 -bottom-10 text-white opacity-10 w-40 h-40" />
      </div>

      <div className="max-w-md mx-auto px-6 -mt-10 space-y-4">
        {/* ONLY SHOW TO MERCHANT */}
        {isOwner ? (
          <>
            <MenuButton 
              icon={<Users size={22} />} 
              title="Staff Management" 
              desc={`${user?.staffMembers?.length || 0} Worker accounts`} 
              onClick={() => onNavigate("staff")} 
            />
            <MenuButton 
              icon={<Cpu size={22} />} 
              title="Terminal Status" 
              desc={`${user?.devices?.length || 0} Connected hardware`} 
              onClick={() => onNavigate("hardware")} 
            />
          </>
        ) : (
          <div className="bg-white/50 border-2 border-dashed border-gray-200 rounded-[35px] p-8 text-center">
            <ShieldCheck size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-relaxed">
              Account restricted.<br/>Management tools only available to owner.
            </p>
          </div>
        )}
        
        <button 
          onClick={() => { fetch("/api/auth", { method: "DELETE" }); window.location.href = "/login"; }}
          className="w-full bg-white rounded-[35px] p-6 flex items-center justify-between shadow-sm mt-10 active:bg-red-50 transition-colors border border-transparent active:border-red-100"
        >
          <div className="flex items-center gap-4 text-red-500">
            <LogOut size={20} />
            <span className="text-xs font-black uppercase tracking-widest">Sign Out Account</span>
          </div>
          <ChevronRight size={18} className="text-gray-200" />
        </button>
      </div>
    </motion.div>
  );
}
// --- SUB-PAGE: STAFF MANAGEMENT ---
function StaffView({ staff, onBack }: { staff: any[]; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [visiblePassId, setVisiblePassId] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (body: any) => {
      const res = await fetch("/api/user/staff", {
        method: body.action === 'delete' ? 'DELETE' : 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error();
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setShowAdd(false);
      toast.success("Staff updated");
    }
  });

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-6 pt-16 space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-[#007AFF] font-black text-[10px] uppercase tracking-widest bg-white py-2.5 px-4 rounded-full shadow-sm">
        <ChevronLeft size={16} strokeWidth={3} /> Settings
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Staff</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Worker Directory</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-transform">
          <Plus size={28} />
        </button>
      </div>

      <div className="space-y-3">
        {staff?.map((member) => (
          <div key={member.id} className="bg-white p-5 rounded-[35px] flex items-center justify-between shadow-sm border border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-[#007AFF] rounded-2xl flex items-center justify-center font-black">
                {member.username[0].toUpperCase()}
              </div>
              <div>
                <p className="font-black text-black">{member.username}</p>
                <button 
                    onClick={() => setVisiblePassId(visiblePassId === member.id ? null : member.id)}
                    className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter flex items-center gap-1"
                >
                    {visiblePassId === member.id ? <><EyeOff size={10}/> {member.password}</> : <><Eye size={10}/> Show Password</>}
                </button>
              </div>
            </div>
            <button onClick={() => confirm("Delete this staff?") && mutation.mutate({ action: 'delete', id: member.id })} className="p-3 text-red-400"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <Modal title="New Staff" onClose={() => setShowAdd(false)}>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              mutation.mutate({ action: 'create', username: e.target.u.value, password: e.target.p.value });
            }} className="space-y-4">
              <input name="u" placeholder="Username" required className="w-full bg-[#F2F2F7] rounded-2xl p-5 text-sm font-bold border-none" />
              <input name="p" placeholder="Password" required className="w-full bg-[#F2F2F7] rounded-2xl p-5 text-sm font-bold border-none" />
              <div className="p-4 bg-amber-50 rounded-2xl flex gap-3">
                <ShieldAlert size={18} className="text-amber-600 shrink-0" />
                <p className="text-[9px] font-bold text-amber-800 uppercase leading-tight">Staff cannot see revenue. They only have access to "Add Record" and "Ledger".</p>
              </div>
              <button type="submit" disabled={mutation.isPending} className="w-full bg-black text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-2xl">
                {mutation.isPending ? "Creating..." : "Save Worker Profile"}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- SUB-PAGE: HARDWARE MANAGEMENT ---
function HardwareView({ devices, onBack }: { devices: any[]; onBack: () => void }) {
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);

  const mutation = useMutation({
    mutationFn: async (body: any) => {
      const method = body.action === 'add' ? 'POST' : 'DELETE';
      const url = body.action === 'add' ? "/api/device/config" : `/api/device/config?id=${body.id}`;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body.action === 'add' ? JSON.stringify(body) : null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      setShowAdd(false);
      toast.success("Hardware Sync Successful");
    }
  });

  return (
    <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} className="p-6 pt-16 space-y-8">
      <button onClick={onBack} className="flex items-center gap-2 text-[#007AFF] font-black text-[10px] uppercase tracking-widest bg-white py-2.5 px-4 rounded-full shadow-sm">
        <ChevronLeft size={16} strokeWidth={3} /> Settings
      </button>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black tracking-tighter">Terminals</h2>
          <p className="text-[10px] font-black text-gray-400 uppercase mt-1 tracking-widest">Active Soundboxes</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="w-14 h-14 bg-[#007AFF] text-white rounded-2xl flex items-center justify-center shadow-xl active:scale-90 transition-transform">
          <Plus size={28} />
        </button>
      </div>

      <div className="space-y-3">
        {devices?.map((dev) => (
          <div key={dev.id} className="bg-white p-6 rounded-[35px] shadow-sm border border-gray-50">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-black shadow-inner"><Cpu size={24}/></div>
                    <div>
                        <p className="font-black text-black">{dev.name}</p>
                        <p className="text-[10px] font-bold text-gray-300 uppercase">{dev.serialNumber}</p>
                    </div>
                </div>
                <button onClick={() => confirm("Delete Soundbox?") && mutation.mutate({ action: 'delete', id: dev.id })} className="p-2 text-gray-300 hover:text-red-500"><Trash2 size={18}/></button>
            </div>
            <div className="flex gap-2 pt-4 border-t border-gray-50">
                <div className="flex-1 bg-emerald-50 p-3 rounded-2xl">
                    <p className="text-[8px] font-black text-emerald-600 uppercase">Gateway</p>
                    <p className="text-[11px] font-bold text-emerald-800">Fonepay Live</p>
                </div>
                <div className="flex-1 bg-blue-50 p-3 rounded-2xl">
                    <p className="text-[8px] font-black text-blue-600 uppercase">Merchant Code</p>
                    <p className="text-[11px] font-bold text-blue-800 truncate">{dev.fonepayMerchantCode}</p>
                </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showAdd && (
          <Modal title="Add Soundbox" onClose={() => setShowAdd(false)}>
            <form onSubmit={(e: any) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              mutation.mutate({ 
                action: 'add', 
                name: fd.get("n"), 
                serialNumber: fd.get("s"), 
                fonepayMerchantCode: fd.get("m"), 
                fonepaySecretKey: fd.get("k") 
              });
            }} className="space-y-4">
              <input name="n" placeholder="Nickname (e.g. Counter 1)" required className="w-full bg-[#F2F2F7] rounded-2xl p-5 text-sm font-bold border-none" />
              <input name="s" placeholder="Serial Number" required className="w-full bg-[#F2F2F7] rounded-2xl p-5 text-sm font-bold border-none" />
              <input name="m" placeholder="Fonepay Merchant Code" required className="w-full bg-[#F2F2F7] rounded-2xl p-5 text-sm font-bold border-none" />
              <input name="k" placeholder="Gateway Secret Key" type="password" required className="w-full bg-[#F2F2F7] rounded-2xl p-5 text-sm font-bold border-none" />
              <button type="submit" disabled={mutation.isPending} className="w-full bg-[#007AFF] text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl">
                {mutation.isPending ? "Connecting..." : "Link Hardware"}
              </button>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- SHARED COMPONENTS ---
function MenuButton({ icon, title, desc, onClick }: { icon: any; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full bg-white p-6 rounded-[35px] flex items-center justify-between shadow-sm active:scale-[0.98] transition-all border border-transparent active:border-blue-100">
      <div className="flex items-center gap-5">
        <div className="w-14 h-14 bg-gray-50 text-[#007AFF] rounded-[22px] flex items-center justify-center shadow-inner">{icon}</div>
        <div className="text-left">
          <p className="text-md font-black text-black leading-tight tracking-tight">{title}</p>
          <p className="text-[10px] font-bold text-gray-400 uppercase mt-1 tracking-tighter">{desc}</p>
        </div>
      </div>
      <ChevronRight size={20} className="text-gray-200" />
    </button>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
      <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white w-full max-w-sm rounded-[45px] p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-300 hover:text-black"><X size={24}/></button>
        <div className="mb-8">
            <h3 className="text-2xl font-black tracking-tighter">{title}</h3>
            <p className="text-[10px] font-black text-[#007AFF] uppercase tracking-widest mt-1">Configure System</p>
        </div>
        {children}
      </motion.div>
    </div>
  );
}