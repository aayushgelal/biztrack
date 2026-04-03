"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, Wallet, CreditCard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const [role, setRole] = useState("STAFF"); // Default to restricted for safety

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) {
      const userData = JSON.parse(stored);
      setRole(userData.role);
    }
  }, []);

  // Filter tabs: STAFF cannot see "Reports/Analytics"
  const allTabs = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
    { href: "/dashboard/records", icon: ClipboardList, label: "History" },
    { href: "/dashboard/credits", icon: Wallet, label: "Ledger" },
    { href: "/dashboard/reports", icon: CreditCard, label: "Analytics", ownerOnly: true },
    { href: "/dashboard/settings", icon: Settings, label: "Setup" },
  ];

  const filteredTabs = allTabs.filter(tab => !tab.ownerOnly || role === "MERCHANT");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bottom-nav-blur pb-2 pt-2 z-50 bg-white/80 backdrop-blur-lg border-t border-gray-100">
      <div className="flex justify-around items-center">
        {filteredTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-1 flex-1">
              <motion.div whileTap={{ scale: 0.7 }} className={isActive ? "text-[#007AFF]" : "text-[#8E8E93]"}>
                <tab.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[9px] font-black uppercase tracking-tighter ${isActive ? "text-[#007AFF]" : "text-[#8E8E93]"}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div layoutId="navDot" className="absolute -top-1 w-1 h-1 bg-[#007AFF] rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}