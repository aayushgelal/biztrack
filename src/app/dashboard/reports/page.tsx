"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, Wallet, Globe, Users, Calendar, RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine } from "recharts";
import { getAnalyticsData } from "@/lib/actions";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function AnalyticsPage() {
  const [user, setUser] = useState({ id: "" });

  useEffect(() => {
    const stored = localStorage.getItem("biztrack_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const { data, status, refetch, isFetching } = useQuery({
    queryKey: ["analytics", user.id],
    queryFn: () => getAnalyticsData(user.id),
    enabled: !!user.id,
    staleTime: Infinity,
  });

  // Transform data: Credit to negative for "Below the Line"
  const transformedChartData = useMemo(() => {
    return data?.chartData?.map((item: any) => ({
      ...item,
      credit: item.credit * -1, 
    })) || [];
  }, [data?.chartData]);

  if (status === "pending" && !data) return (
    <div className="min-h-screen bg-[#F2F2F7] flex items-center justify-center">
       <RefreshCcw size={32} className="text-[#34C759] animate-spin" />
    </div>
  );

  const cashTotal = data?.totals?.cash ?? 0;
  const onlineTotal = data?.totals?.online ?? 0;
  const creditTotal = data?.totals?.credit ?? 0;

  return (
    <div className="px-6 pt-12 pb-32 min-h-screen bg-[#F2F2F7] space-y-6">
      <header className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 bg-white rounded-full shadow-sm active:scale-90 transition-transform">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-black tracking-tighter">Insights</h1>
        </div>
        <button 
          onClick={() => refetch()}
          className={cn("p-2 rounded-full transition-all", isFetching && "animate-spin text-[#34C759]")}
        >
          <RefreshCcw size={20} className="text-gray-400" />
        </button>
      </header>

      {/* 1. STATS GRID */}
      <div className="grid grid-cols-2 gap-4">
        <div className="ios-card bg-white p-5 border-none shadow-sm">
          <Wallet className="text-[#34C759] mb-2" size={22} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Total Cash</p>
          <p className="text-xl font-black text-black">रू {cashTotal.toLocaleString()}</p>
        </div>
        <div className="ios-card bg-white p-5 border-none shadow-sm">
          <Globe className="text-[#34C759] mb-2" size={22} />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Online</p>
          <p className="text-xl font-black text-black">रू {onlineTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* 2. GROWTH TREND */}
      <div className="ios-card bg-white p-6 shadow-sm border-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-[#34C759]">
            <TrendingUp size={16} />
            <h3 className="text-xs font-black uppercase tracking-widest text-black">Monthly Revenue</h3>
          </div>
        </div>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.monthlyTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F2F7" />
              <XAxis dataKey="month" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#34C759" 
                strokeWidth={4} 
                dot={{ r: 4, fill: '#34C759', strokeWidth: 2, stroke: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. DAILY BREAKDOWN (UNIFIED GREEN) */}
      <div className="ios-card bg-white p-6 shadow-sm border-none">
        <h3 className="text-xs font-black uppercase tracking-widest mb-6 text-black">Daily Breakdown</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedChartData} stackOffset="sign">
              <XAxis dataKey="name" fontSize={9} fontWeight="bold" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ borderRadius: '15px', border: 'none' }} 
                cursor={{fill: '#F2F2F7'}} 
                formatter={(value: number) => Math.abs(value).toLocaleString()} 
              />
              <ReferenceLine y={0} stroke="#E5E5EA" /> 
              
              {/* UNIFIED GREEN INCOME STACK */}
              <Bar dataKey="online" name="Online" stackId="a" fill="#34C759" />
              <Bar dataKey="cash" name="Cash" stackId="a" fill="#34C759" radius={[4, 4, 0, 0]} />
              
              {/* RED DEBT BELOW LINE */}
              <Bar dataKey="credit" name="Credit" stackId="a" fill="#FF3B30" radius={[0, 0, 4, 4]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#34C759]"/> 
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Income (Cash/Online)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-[#FF3B30]"/> 
              <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Pending Credit</span>
            </div>
        </div>
      </div>

      {/* 4. CREDIT SUMMARY CARD */}
      <div className="ios-card bg-white p-6 border-none shadow-sm flex justify-between items-center">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total Credit (Udharo)</p>
          <p className="text-3xl font-black mt-1 text-[#FF3B30]">रू {creditTotal.toLocaleString()}</p>
        </div>
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-[#FF3B30]">
           <Users size={24} />
        </div>
      </div>
    </div>
  );
}