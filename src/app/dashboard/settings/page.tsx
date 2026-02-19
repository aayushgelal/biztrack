"use client";

import { useEffect, useState } from "react";
import { 
  User, Lock, Key, Cpu, ChevronRight, Eye, EyeOff, Save, 
  LogOut, CreditCard, ShieldCheck, Download, Bell, HelpCircle, 
  X, Activity, ShieldAlert
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDevice, setActiveDevice] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  // Modals & Forms
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passData, setPassData] = useState({ old: "", new: "", confirm: "" });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/user/me");
        if (res.status === 401) { router.push("/auth"); return; }
        const data = await res.json();
        setUser(data.user);
      } catch (err) { toast.error("Connection lost"); }
      finally { setLoading(false); }
    }
    loadData();
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return toast.error("Passwords do not match");
    
    setUpdating(true);
    try {
      const res = await fetch("/api/auth/password", { // You'll need to create this API
        method: "PATCH",
        body: JSON.stringify(passData),
      });
      if (!res.ok) throw new Error();
      toast.success("Security keys rotated successfully");
      setShowPasswordModal(false);
    } catch (err) {
      toast.error("Failed to update password");
    } finally {
      setUpdating(false);
    }
  };

  const updateKeys = async (deviceId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const body = {
      deviceId,
      fonepayMerchantCode: formData.get("fonepayMerchantCode"),
      fonepaySecretKey: formData.get("fonepaySecretKey"),
    };

    setUpdating(true);
    try {
      const res = await fetch("/api/device/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success("Hardware configuration updated");
        setActiveDevice(null);
        // Update local state so UI reflects change
        setUser((prev: any) => ({
          ...prev,
          devices: prev.devices.map((d: any) => d.id === deviceId ? { ...d, ...body } : d)
        }));
      } else {
        throw new Error();
      }
    } catch (err) {
      toast.error("Failed to sync with hardware");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center justify-center gap-4">
      <div className="w-8 h-8 border-4 border-[#007AFF]/20 border-t-[#007AFF] rounded-full animate-spin" />
      <span className="font-black text-[10px] text-gray-400 uppercase tracking-widest">Initialising Core...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-24 font-sans select-none">
      {/* 1. Header Area */}
      <div className="bg-white px-6 pt-16 pb-10 rounded-b-[40px] shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#007AFF]/10 rounded-3xl flex items-center justify-center text-[#007AFF] shadow-inner">
            <User size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tighter leading-none">{user?.businessName}</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Merchant Profile • {user?.username}</p>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-6 -mt-6 space-y-4">
        
        {/* 2. Command Tiles */}
        <section className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100 flex justify-between px-4">
          <button onClick={() => setShowPasswordModal(true)} className="flex flex-col items-center p-3 space-y-1 active:scale-90 transition-transform">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center"><ShieldCheck size={18} /></div>
            <span className="text-[9px] font-black uppercase text-gray-400">Security</span>
          </button>
          <button onClick={() => toast.success("History synced to cloud")} className="flex flex-col items-center p-3 space-y-1 active:scale-90 transition-transform">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center"><Download size={18} /></div>
            <span className="text-[9px] font-black uppercase text-gray-400">Export</span>
          </button>
          <button className="flex flex-col items-center p-3 space-y-1 active:scale-90 transition-transform">
            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center"><Bell size={18} /></div>
            <span className="text-[9px] font-black uppercase text-gray-400">Alerts</span>
          </button>
        </section>

        {/* 3. Subscription Status */}
        <section className="bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5"><CreditCard size={60} /></div>
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert size={16} className="text-[#007AFF]" />
              <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Annual Licence</h2>
            </div>
            <span className="bg-green-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">Active</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-xl font-black text-black tracking-tighter leading-none">NPR 1,000 / Year</p>
              <p className="text-[10px] font-bold text-gray-400 mt-1">Renew on: Jan 12, 2027</p>
            </div>
            <button className="bg-[#F2F2F7] text-black px-4 py-2 rounded-xl text-[10px] font-black uppercase">Renew</button>
          </div>
        </section>

        {/* 4. Hardware Gateway Management */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Connected Soundboxes</h2>
            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-gray-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[9px] font-black text-gray-400 uppercase">Broker Online</span>
            </div>
          </div>
          
          {user?.devices?.map((dev: any) => (
            <div key={dev.id} className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
              <button 
                onClick={() => setActiveDevice(activeDevice === dev.id ? null : dev.id)}
                className="w-full p-6 flex items-center justify-between active:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#007AFF]/5 rounded-2xl flex items-center justify-center text-[#007AFF]"><Cpu size={20} /></div>
                  <div className="text-left">
                    <p className="font-bold text-black text-sm">{dev.name}</p>
                    <p className="text-[9px] font-black text-gray-400 font-mono tracking-widest">{dev.serialNumber}</p>
                  </div>
                </div>
                <ChevronRight className={`text-gray-300 transition-transform duration-300 ${activeDevice === dev.id ? 'rotate-90' : ''}`} />
              </button>

              {activeDevice === dev.id && (
                <form onSubmit={(e) => updateKeys(dev.id, e)} className="p-6 pt-0 space-y-4 animate-in slide-in-from-top-4 duration-300">
                  <div className="h-[1px] bg-gray-50 mb-2" />
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Merchant Code (PID)</label>
                      <input name="fonepayMerchantCode" defaultValue={dev.fonepayMerchantCode} className="w-full bg-[#F2F2F7] border-none rounded-2xl py-3 px-5 text-sm font-bold placeholder:text-gray-300" placeholder="Required" required />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secret Key (Hash)</label>
                      <div className="relative">
                        <input name="fonepaySecretKey" type={showSecret ? "text" : "password"} defaultValue={dev.fonepaySecretKey} className="w-full bg-[#F2F2F7] border-none rounded-2xl py-3 px-5 text-sm font-bold pr-12" required />
                        <button type="button" onClick={() => setShowSecret(!showSecret)} className="absolute right-4 bottom-3 text-gray-300">
                          {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                    <button type="submit" disabled={updating} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-100 disabled:opacity-50">
                      {updating ? "Syncing..." : <><Save size={16} /> Sync Hardware Keys</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>

        {/* 5. Utility List */}
        <section className="bg-white rounded-[32px] p-2 shadow-sm border border-gray-100 overflow-hidden">
            <button className="w-full flex items-center justify-between p-4 active:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400"><HelpCircle size={16} /></div>
                    <span className="text-xs font-black uppercase text-gray-500 tracking-tighter">Support & FAQ</span>
                </div>
                <ChevronRight size={14} className="text-gray-200" />
            </button>
            <div className="h-[1px] bg-gray-50 mx-4" />
            <button onClick={() => { fetch("/api/auth", { method: "DELETE" }); router.push("/auth"); }} className="w-full flex items-center justify-between p-4 active:bg-red-50 transition-colors">
                <div className="flex items-center gap-3 text-red-500">
                    <div className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center"><LogOut size={16} /></div>
                    <span className="text-xs font-black uppercase tracking-tighter">Terminate Session</span>
                </div>
            </button>
        </section>

        <footer className="text-center space-y-1 py-4">
          <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">BizTrack Infrastructure • v1.0.4</p>
          <p className="text-[8px] font-bold text-gray-200 uppercase tracking-widest">Built for Haadi Bistro POS</p>
        </footer>
      </div>

      {/* Modern Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8 space-y-6 animate-in slide-in-from-bottom-20 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black tracking-tighter">Rotate Security Keys</h2>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">BizTrack Authentication</p>
              </div>
              <button onClick={() => setShowPasswordModal(false)} className="bg-gray-100 p-2 rounded-full text-gray-400 active:scale-90"><X size={20} /></button>
            </div>
            
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-3">
                <input 
                  type="password" placeholder="Current Password" required
                  className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300"
                  onChange={(e) => setPassData({...passData, old: e.target.value})}
                />
                <div className="h-[1px] bg-gray-100 mx-4" />
                <input 
                  type="password" placeholder="New Password" required
                  className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300"
                  onChange={(e) => setPassData({...passData, new: e.target.value})}
                />
                <input 
                  type="password" placeholder="Confirm New Password" required
                  className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 px-6 text-sm font-bold placeholder:text-gray-300"
                  onChange={(e) => setPassData({...passData, confirm: e.target.value})}
                />
              </div>
              
              <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck size={16} className="text-[#007AFF] mt-0.5" />
                <p className="text-[9px] font-bold text-blue-600 leading-relaxed uppercase">Updating your password will refresh your session across all mobile devices.</p>
              </div>

              <button type="submit" disabled={updating} className="w-full bg-black text-white py-5 rounded-3xl font-black text-sm shadow-2xl active:scale-95 transition-all">
                {updating ? "Processing..." : "Confirm Rotation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}