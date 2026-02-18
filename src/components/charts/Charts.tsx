"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

// Custom tooltip
const CustomTooltip = ({
  active,
  payload,
  label,
  isCurrency = true,
}: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-800 border border-surface-600 rounded-xl px-3 py-2.5 shadow-card-hover">
        <p className="text-xs text-surface-400 mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm font-semibold text-white">
            {isCurrency ? formatCurrency(entry.value) : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Area/Line chart for daily earnings
export function DailyEarningsChart({
  data,
}: {
  data: Array<{ date: string; amount: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Outfit" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Outfit" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          stroke="#0ea5e9"
          strokeWidth={2}
          fill="url(#earningsGrad)"
          dot={false}
          activeDot={{ r: 4, fill: "#0ea5e9", stroke: "#0f172a", strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Bar chart for monthly earnings
export function MonthlyBarChart({
  data,
}: {
  data: Array<{ month: string; amount: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Outfit" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11, fontFamily: "Outfit" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={50}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="amount"
          fill="#0ea5e9"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        >
          {data.map((_, index) => (
            <Cell
              key={index}
              fill={
                index === data.length - 1
                  ? "#0ea5e9"
                  : "rgba(14,165,233,0.4)"
              }
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// Donut / Pie chart for categories
export function CategoryPieChart({
  data,
}: {
  data: Array<{ name: string; value: number; color: string }>;
}) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-full text-surface-500 text-sm">
        No data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          paddingAngle={3}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [formatCurrency(value), ""]}
          contentStyle={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: "12px",
            color: "#f1f5f9",
            fontSize: "13px",
            fontFamily: "Outfit",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Mini sparkline for quick stats
export function SparklineChart({
  data,
  color = "#0ea5e9",
}: {
  data: number[];
  color?: string;
}) {
  const chartData = data.map((amount, i) => ({ i, amount }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="amount"
          stroke={color}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
