"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  changeLabel?: string;
  icon: React.ElementType;
  iconColor?: string;
  iconBg?: string;
  isCurrency?: boolean;
  delay?: number;
  className?: string;
}

function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const start = 0;
    const step = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += step;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

export default function StatCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-brand-400",
  iconBg = "bg-brand-500/10",
  isCurrency = true,
  delay = 0,
  className,
}: StatCardProps) {
  const animatedValue = useCountUp(value);

  const isPositive = (change ?? 0) > 0;
  const isNeutral = change === 0 || change === undefined;

  return (
    <div
      className={cn(
        "stat-card animate-slide-up",
        className
      )}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "both" }}
    >
      <div className="flex items-start justify-between">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconBg)}>
          <Icon className={cn("w-5 h-5", iconColor)} />
        </div>
        {change !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg",
              isNeutral
                ? "text-surface-400 bg-surface-700"
                : isPositive
                ? "text-emerald-400 bg-emerald-500/10"
                : "text-red-400 bg-red-500/10"
            )}
          >
            {isNeutral ? (
              <Minus size={11} />
            ) : isPositive ? (
              <TrendingUp size={11} />
            ) : (
              <TrendingDown size={11} />
            )}
            {isNeutral ? "0%" : `${Math.abs(change).toFixed(1)}%`}
          </div>
        )}
      </div>

      <div>
        <p className="text-xs text-surface-500 font-medium mb-1">{title}</p>
        <p className="font-display text-2xl font-bold text-white tabular-nums">
          {isCurrency
            ? formatCurrency(animatedValue)
            : Math.round(animatedValue).toLocaleString()}
        </p>
        {changeLabel && (
          <p className="text-xs text-surface-500 mt-1">{changeLabel}</p>
        )}
      </div>
    </div>
  );
}
