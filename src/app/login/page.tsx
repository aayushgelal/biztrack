"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, Lock, User, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", businessName: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, ...form }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // SAVE WORKFLOW: Store user profile for dashboard personalization
      localStorage.setItem("biztrack_user", JSON.stringify(data.user));

      toast.success(mode === "login" ? "Welcome back!" : "Welcome to BizTrack!");
      
      // REDIRECT: Works for both Login and Registration
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] flex flex-col items-center p-6 pt-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="inline-flex w-16 h-16 bg-white rounded-3xl items-center justify-center mb-6 shadow-xl shadow-blue-100">
            <Zap className="w-8 h-8 text-[#007AFF]" fill="#007AFF" />
          </motion.div>
          <h1 className="text-3xl font-black text-black tracking-tighter">BizTrack</h1>
          <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mt-1">Earnings Simplified</p>
        </div>

        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-gray-100">
          <div className="flex p-1 bg-[#F2F2F7] rounded-2xl mb-8">
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${mode === m ? "bg-white text-black shadow-sm" : "text-gray-400"}`}>
                {m === "login" ? "Sign In" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <AnimatePresence>
              {mode === "register" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Business Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                    <input type="text" placeholder="Haadi Bistro" className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 pl-11 text-sm font-bold" onChange={(e) => setForm({ ...form, businessName: e.target.value })} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type="text" placeholder="ravi_pandey" className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 pl-11 text-sm font-bold" onChange={(e) => setForm({ ...form, username: e.target.value })} />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" className="w-full bg-[#F2F2F7] border-none rounded-2xl py-4 pl-11 pr-11 text-sm font-bold" onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-[#007AFF] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-blue-100">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{mode === "login" ? "Sign In" : "Get Started"} <ArrowRight size={18} /></>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}