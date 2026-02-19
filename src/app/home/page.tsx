"use client";

import { motion } from "framer-motion";
import { 
  Smartphone, 
  Cpu, 
  ShieldCheck, 
  ChevronRight, 
  Zap,
  LayoutDashboard,
  Users,
  Globe,
  Star
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const stats = [
    { label: "Active Merchants", value: "200+", icon: <Users size={16} /> },
    { label: "Daily Transactions", value: "5K+", icon: <Zap size={16} /> },
    { label: "Uptime", value: "99.9%", icon: <Globe size={16} /> },
  ];

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
      <section className="pt-40 pb-20 px-6 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto"
        >
          <motion.span 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-blue-50 text-[#007AFF] text-[10px] font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full mb-6 inline-block"
          >
            By KFX Digital Private Limited
          </motion.span>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6 leading-[0.85] text-slate-900">
            Smart POS for <br />
            <span className="text-[#007AFF]">Smart Business.</span>
          </h1>
          <p className="text-gray-500 text-lg md:text-xl font-medium max-w-xl mx-auto mb-10 leading-relaxed">
            The fastest digital payment and revenue monitoring system for Nepal's modern merchants.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-16">
            <Link href="/login" className="w-full md:w-auto bg-[#007AFF] text-white px-10 py-5 rounded-3xl font-black text-lg shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 group transition-all hover:bg-blue-600">
              Get Started Now <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* SOCIAL PROOF ANIMATION */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-8 md:gap-16 border-t border-gray-200 pt-10"
          >
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="flex items-center justify-center gap-2 text-[#007AFF] mb-1">
                  {stat.icon}
                  <span className="text-2xl font-black tracking-tighter text-black">{stat.value}</span>
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 3. HARDWARE SECTION */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-slate-950 rounded-[50px] p-10 md:p-20 overflow-hidden relative border border-white/5">
          <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/10 blur-[100px] rounded-full" />
          
          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div className="order-2 md:order-1">
               <motion.div 
                whileHover={{ scale: 1.02, rotate: 1 }}
                className="bg-white/5 backdrop-blur-md rounded-[40px] p-2 border border-white/10 shadow-2xl"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-900 to-black rounded-[36px] flex flex-col items-center justify-center p-8 text-center border border-white/5">
                   <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 animate-pulse">
                      <Cpu size={48} className="text-blue-500" />
                   </div>
                   <h4 className="text-white text-2xl font-black tracking-tighter mb-2">BizTrack X1</h4>
                   <p className="text-blue-500 font-bold text-sm uppercase tracking-widest">Master Controller</p>
                </div>
              </motion.div>
            </div>

            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full mb-6">
                Hardware Engineering
              </div>
              <h2 className="text-5xl font-black text-white tracking-tighter mb-6">
                Nepal's First <br /> Integrated POS.
              </h2>
              <p className="text-gray-400 font-medium text-lg mb-8 leading-relaxed">
                Designed by KFX Digital to bridge the gap between offline sales and online tracking. Built-in thermal printer and MQTT-enabled soundbox.
              </p>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { title: "Connectivity", desc: "4G + Wi-Fi 6" },
                  { title: "Output", desc: "Thermal Print" },
                  { title: "Alerts", desc: "Instant Voice" },
                  { title: "Security", desc: "AES-256 Enc" },
                ].map((item, i) => (
                  <div key={i} className="border-l-2 border-blue-600/30 pl-4">
                    <h5 className="text-white font-black text-sm">{item.title}</h5>
                    <p className="text-gray-500 text-xs font-bold">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TRUSTED NETWORKS */}
      <section className="py-20 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em] mb-12">Universal Gateway Support</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-32 grayscale opacity-40 hover:opacity-100 transition-opacity">
            <span className="text-2xl font-black italic tracking-tighter">fone<span className="text-red-600">pay</span></span>
            <span className="text-2xl font-black tracking-tighter">eSewa</span>
            <span className="text-2xl font-black italic tracking-tighter text-blue-800">Khalti</span>
            <span className="text-2xl font-black tracking-tighter">NEPAL<span className="text-red-500">PAY</span></span>
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-white pt-24 pb-12 px-6 border-t border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white">
                  <Zap size={22} fill="white" />
                </div>
                <span className="text-2xl font-black tracking-tighter">BizTrack</span>
              </div>
              <p className="text-gray-400 font-medium max-w-sm mb-6">
                A flagship product of **KFX Digital Private Limited**, building the digital infrastructure for Nepal's retail future.
              </p>
            </div>
            
            <div>
              <h5 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-6">Legal</h5>
              <ul className="space-y-4 text-sm font-bold text-gray-600">
                <li><Link href="/legal" className="hover:text-[#007AFF] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/legal" className="hover:text-[#007AFF] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>

          
          </div>

          <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-400 text-xs font-bold uppercase tracking-tighter">
              © 2026 KFX Digital Private Limited • BizTrack v1.0.4
            </p>
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400"><Star size={14} /></div>
               <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400"><Star size={14} /></div>
               <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400"><Star size={14} /></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}