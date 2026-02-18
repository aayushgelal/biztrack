"use client";
import { motion } from "framer-motion";
import { LayoutDashboard, ClipboardList, CreditCard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/dashboard/records", icon: ClipboardList, label: "History" },
  { href: "/dashboard/subscription", icon: CreditCard, label: "Billing" },
  { href: "/dashboard/settings", icon: Settings, label: "Setup" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bottom-nav-blur pb-8 pt-2 z-50">
      <div className="flex justify-around items-center">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link key={tab.href} href={tab.href} className="relative flex flex-col items-center gap-1">
              <motion.div whileTap={{ scale: 0.7 }} className={isActive ? "text-[#007AFF]" : "text-[#8E8E93]"}>
                <tab.icon size={26} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-semibold ${isActive ? "text-[#007AFF]" : "text-[#8E8E93]"}`}>
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