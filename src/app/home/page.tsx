"use client";
import { motion } from "framer-motion";
import { 
  Smartphone, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  CreditCard, 
  Zap,
  LayoutDashboard
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F2F2F7] text-black font-sans selection:bg-blue-100">
      
      {/* 1. BLURRED GLASS NAVBAR */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/70 border-b border-gray-100 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#007AFF] rounded-lg flex items-center justify-center text-white">
              <Zap size={18} fill="white" />
            </div>
            <span className="text-xl font-black tracking-tighter">BizTrack</span>
          </div>
          <Link href="/login" className="bg-black text-white px-5 py-2 rounded-full text-sm font-bold active:scale-95 transition-all">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <section className="pt-32 pb-20 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <span className="bg-blue-50 text-[#007AFF] text-[10px] font-black tracking-widest uppercase px-4 py-1.5 rounded-full mb-6 inline-block">
            Next-Gen Payment Ecosystem
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 leading-[0.9]">
            Your all-in-one <br />
            <span className="text-[#007AFF]">POS System.</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            Manage your restaurant revenue, monitor hardware, and accept digital payments with the fastest system in Nepal.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="w-full md:w-auto bg-[#007AFF] text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-blue-200 flex items-center justify-center gap-2 group">
              Get Started <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="w-full md:w-auto bg-white border border-gray-100 px-8 py-4 rounded-2xl font-black text-lg shadow-sm active:scale-95 transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* 3. PAYMENT SUPPORT SECTION */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-gray-300 uppercase tracking-[0.3em] mb-10">
            Powered by Nepal's Leading Networks
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-black tracking-tighter text-[#ce2027]">fone<span className="text-black">pay</span></div>
              <span className="text-[9px] font-black text-gray-400">SUPPORTS FONEPAY</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-black tracking-tighter text-[#1b4b99]">NEPAL<span className="text-red-500">PAY</span></div>
              <span className="text-[9px] font-black text-gray-400">SUPPORTS NEPALPAY</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="text-2xl font-black tracking-tighter text-black">eSewa</div>
              <span className="text-[9px] font-black text-gray-400">DIRECT INTEGRATION</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HARDWARE TEASER (COMING SOON) */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-black rounded-[40px] p-10 md:p-20 overflow-hidden relative border border-white/10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
          
          <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6">
                <Cpu size={14} className="text-blue-400" /> Hardware
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-6">
                BizTrack X1 <br />
                <span className="text-blue-500 underline decoration-blue-500/30 underline-offset-8">Coming Soon</span>
              </h2>
              <p className="text-gray-400 font-medium text-lg leading-relaxed mb-8">
                The first POS device in Nepal with a built-in printer, QR display, and a dedicated soundbox. Plug and play for every merchant.
              </p>
              <ul className="space-y-4">
                {[
                  "Dual-Screen QR Display",
                  "80mm High-Speed Thermal Printer",
                  "4G LTE & Wi-Fi Enabled",
                  "Voice Confirmation for Payments"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-white font-bold text-sm">
                    <ShieldCheck className="text-blue-500" size={18} /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <motion.div 
              whileHover={{ scale: 1.05, rotate: -2 }}
              className="bg-gradient-to-br from-gray-800 to-black rounded-3xl p-8 border border-white/10 shadow-2xl relative"
            >
              <div className="aspect-[4/5] bg-[#111] rounded-2xl overflow-hidden flex flex-col p-6 border border-white/5">
                <div className="h-8 w-1/3 bg-blue-600 rounded-full mb-8 animate-pulse" />
                <div className="space-y-4">
                  <div className="h-24 w-full bg-white/5 rounded-2xl" />
                  <div className="h-24 w-full bg-white/5 rounded-2xl" />
                  <div className="h-24 w-full bg-white/5 rounded-2xl" />
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#007AFF] text-white px-6 py-2 rounded-full font-black text-xs shadow-xl uppercase tracking-widest border-2 border-black">
                Pre-Order Soon
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 5. APP FEATURES */}
      <section className="py-24 max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8">
        <div className="ios-card bg-white p-8 space-y-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#007AFF]">
            <LayoutDashboard size={24} />
          </div>
          <h3 className="text-xl font-black">Live Analytics</h3>
          <p className="text-gray-500 text-sm font-medium">Track your revenue in real-time. See your peaks and slow hours instantly.</p>
        </div>
        <div className="ios-card bg-white p-8 space-y-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500">
            <Smartphone size={24} />
          </div>
          <h3 className="text-xl font-black">Mobile First</h3>
          <p className="text-gray-500 text-sm font-medium">Built for the modern merchant. Access your dashboard from any device.</p>
        </div>
        <div className="ios-card bg-white p-8 space-y-4">
          <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
            <ShieldCheck size={24} />
          </div>
          <h3 className="text-xl font-black">Secure Core</h3>
          <p className="text-gray-500 text-sm font-medium">Bank-grade encryption for all your Fonepay and NepalPay transactions.</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-20 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-black rounded-lg flex items-center justify-center text-white">
                <Zap size={14} fill="white" />
              </div>
              <span className="text-lg font-black tracking-tighter">BizTrack</span>
            </div>
            <p className="text-gray-400 text-sm font-medium">© 2026 BizTrack Technologies Nepal. <br /> Built for Haadi Bistro Ecosystem.</p>
          </div>
          <div className="flex gap-10 text-sm font-black uppercase tracking-widest text-gray-400">
            <a href="#" className="hover:text-black transition-colors">Privacy</a>
            <a href="#" className="hover:text-black transition-colors">Terms</a>
            <a href="#" className="hover:text-black transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}