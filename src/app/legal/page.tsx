"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, FileText, ChevronLeft, Scale, Lock, Eye } from "lucide-react";
import Link from "next/navigation";
import { useRouter } from "next/navigation";

export default function LegalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-6 pt-14 pb-6">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 active:scale-90 transition-transform"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black text-black tracking-tighter">Legal Center</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">KFX Digital Private Limited</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[#F2F2F7] rounded-2xl mt-6">
          <button 
            onClick={() => setActiveTab("privacy")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${activeTab === "privacy" ? "bg-white text-[#007AFF] shadow-sm" : "text-gray-400"}`}
          >
            Privacy Policy
          </button>
          <button 
            onClick={() => setActiveTab("terms")}
            className={`flex-1 py-2.5 rounded-xl text-xs font-black uppercase tracking-tighter transition-all ${activeTab === "terms" ? "bg-white text-[#007AFF] shadow-sm" : "text-gray-400"}`}
          >
            Terms of Service
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 mt-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 space-y-8"
        >
          {activeTab === "privacy" ? (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-[#007AFF] mb-4">
                  <Lock size={24} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter">Privacy Policy</h2>
                <p className="text-xs text-gray-400 font-bold uppercase">Last Updated: February 2026</p>
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">1. Data Collection</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  BizTrack collects business-related information including merchant codes, transaction amounts, and device serial numbers to facilitate real-time payment alerts through our KFX hardware.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">2. Transaction Security</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  We do not store your full bank credentials. Fonepay secret keys are used only for HMAC signature generation and are stored using AES-256 bank-grade encryption on our secure infrastructure.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">3. Third-Party Sharing</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Data is shared only with certified payment aggregators (Fonepay, NepalPay) required to process your sales. We never sell merchant data to third-party advertisers.
                </p>
              </section>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
                  <Scale size={24} />
                </div>
                <h2 className="text-2xl font-black tracking-tighter">Terms of Service</h2>
                <p className="text-xs text-gray-400 font-bold uppercase">Effective Date: Jan 2026</p>
              </div>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">1. Service Agreement</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  By using BizTrack, you agree to a subscription-based service model. KFX Digital provides the software interface and hardware communication; the financial settlement is handled by your respective bank.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">2. Subscription & Fees</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  Merchants agree to pay an annual platform fee of NPR 1,000. Failure to renew the subscription will result in the suspension of the Soundbox beeping service and dashboard access.
                </p>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">3. Hardware Liability</h3>
                <p className="text-sm text-gray-500 leading-relaxed font-medium">
                  KFX Digital is not liable for transaction failures caused by bank server downtimes or local internet connectivity issues affecting the Soundbox hardware.
                </p>
              </section>
            </>
          )}

          <div className="pt-8 border-t border-gray-100">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest text-center">
              Questions? Contact aayush@kfxdigital.com
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}