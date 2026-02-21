import { ReactNode } from "react";
import BottomNav from "@/components/layout/BottomNav";
import Providers from "@/components/Providers"; // Import your new provider

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-[#F2F2F7]">
        <main className="lg:pl-64 min-h-screen relative">
          <div className="max-w-2xl mx-auto min-h-screen pb-32">
            {children}
          </div>
          <BottomNav />
        </main>
      </div>
    </Providers>
  );
}