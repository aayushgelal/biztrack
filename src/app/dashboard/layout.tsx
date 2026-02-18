import { ReactNode } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* Desktop Sidebar - Hidden on mobile webview */}

      {/* Main Content Area */}
      <main className="lg:pl-64 min-h-screen relative">
        {/* Dynamic content goes here */}
        <div className="max-w-2xl mx-auto min-h-screen pb-32">
          {children}
        </div>
        
        {/* Mobile Bottom Navigation - Visible on mobile/webview */}
        <BottomNav />
      </main>
    </div>
  );
}