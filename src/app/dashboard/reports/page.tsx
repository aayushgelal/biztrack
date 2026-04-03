"use client";
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { TrendingUp, Wallet, Globe, Users, RefreshCcw } from "lucide-react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, ReferenceLine, YAxis } from "recharts";
import { getAnalyticsData } from "@/lib/actions";
import { cn } from "@/lib/utils";

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

  const transformedChartData = useMemo(() => {
    return data?.chartData?.map((item: any) => ({
      ...item,
      credit: item.credit * -1, 
    })) || [];
  }, [data?.chartData]);

  // --- SKELETON LOADING UI ---
  if (status === "pending" && !data) return (
    <div className="px-5 pt-10 pb-32 min-h-screen bg-[#F2F2F7] space-y-6 animate-pulse">
      <header className="flex justify-between items-end px-1">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 rounded-lg" />
          <div className="h-3 w-40 bg-gray-200 rounded-md" />
        </div>
        <div className="w-10 h-10 rounded-full bg-white shadow-sm" />
      </header>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((i) => (
          <div key={i} className="p-4 bg-white rounded-[22px] shadow-sm space-y-3">
            <div className="w-8 h-8 rounded-lg bg-gray-100" />
            <div className="h-3 w-12 bg-gray-100 rounded" />
            <div className="h-6 w-20 bg-gray-200 rounded-md" />
          </div>
        ))}
      </div>

      <div className="p-5 bg-white rounded-[24px] shadow-sm h-56">
        <div className="h-4 w-32 bg-gray-100 rounded mb-8" />
        <div className="h-32 w-full bg-gray-50 rounded-xl" />
      </div>

      <div className="p-5 bg-white rounded-[24px] shadow-sm h-64">
        <div className="flex justify-between mb-8">
           <div className="h-4 w-32 bg-gray-100 rounded" />
           <div className="h-4 w-16 bg-gray-100 rounded" />
        </div>
        <div className="h-40 w-full bg-gray-50 rounded-xl" />
      </div>
    </div>
  );

  const cashTotal = data?.totals?.cash ?? 0;
  const onlineTotal = data?.totals?.online ?? 0;
  const creditTotal = data?.totals?.credit ?? 0;

  return (
    <div className="px-5 pt-10 pb-32 min-h-screen bg-[#F2F2F7] space-y-6">
      {/* 1. BRAND HEADER */}
      <header className="flex justify-between items-end px-1">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-emerald-600 leading-none">Insights</h1>
          <p className="text-[9px] font-bold text-[#8E8E93] uppercase tracking-[0.12em] mt-1.5">
            Performance • Statistics
          </p>
        </div>
        <button 
          onClick={() => refetch()} 
          className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"
        >
          <RefreshCcw size={18} className={cn("text-black", isFetching && "animate-spin text-emerald-500")} />
        </button>
      </header>

      {/* 2. STATS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-4 bg-white rounded-[22px] shadow-sm border-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <Wallet size={16} />
          </div>
          <p className="text-[#8E8E93] text-[9px] font-bold uppercase tracking-wider">Cash Total</p>
          <p className="text-lg font-black text-black leading-tight">रू {cashTotal.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white rounded-[22px] shadow-sm border-none">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 mb-3">
            <Globe size={16} />
          </div>
          <p className="text-[#8E8E93] text-[9px] font-bold uppercase tracking-wider">Online Total</p>
          <p className="text-lg font-black text-black leading-tight">रू {onlineTotal.toLocaleString()}</p>
        </div>
      </div>

      {/* 3. GROWTH TREND (Line Chart) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white rounded-[24px] shadow-sm border-none"
      >
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp size={14} className="text-emerald-500" />
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest">Revenue Growth</h3>
        </div>
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.monthlyTrend ?? []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9F9FB" />
              <XAxis 
                dataKey="month" 
                fontSize={9} 
                fontWeight="900" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#8E8E93'}}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 'bold', boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }} 
                itemStyle={{ color: '#10B981' }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#10B981" 
                strokeWidth={3} 
                dot={{ r: 3, fill: '#10B981', strokeWidth: 2, stroke: '#fff' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* 4. DAILY BREAKDOWN (Stack Bar Chart) */}
      <div className="p-5 bg-white rounded-[24px] shadow-sm border-none">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-[10px] font-black text-black uppercase tracking-widest">Daily Breakdown</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] font-bold text-gray-400 uppercase">Paid</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
              <span className="text-[8px] font-bold text-gray-400 uppercase">Credit</span>
            </div>
          </div>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={transformedChartData} stackOffset="sign" margin={{ left: -20 }}>
              <XAxis 
                dataKey="name" 
                fontSize={8} 
                fontWeight="900" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#8E8E93'}}
              />
              <YAxis hide />
              <Tooltip 
                cursor={{fill: '#F2F2F7', opacity: 0.4}} 
                contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px' }}
                formatter={(value: number) => Math.abs(value).toLocaleString()} 
              />
              <ReferenceLine y={0} stroke="#F2F2F7" /> 
              <Bar dataKey="online" stackId="a" fill="#10B981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="cash" stackId="a" fill="#10B981" />
              <Bar dataKey="credit" stackId="a" fill="#F87171" radius={[0, 0, 2, 2]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. CREDIT SUMMARY CARD */}
      <div className="p-5 bg-white rounded-[24px] border-none shadow-sm flex justify-between items-center">
        <div>
          <p className="text-[#8E8E93] text-[9px] font-bold text-gray-400 uppercase tracking-widest">Pending Credit (Udharo)</p>
          <p className="text-3xl font-black mt-0.5 text-red-500 tracking-tighter">रू {creditTotal.toLocaleString()}</p>
        </div>
        <div className="w-11 h-11 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
           <Users size={20} />
        </div>
      </div>
    </div>
  );
}