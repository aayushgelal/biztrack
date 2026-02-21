
"use server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, startOfMonth, endOfMonth, eachDayOfInterval, format, subMonths } from "date-fns";

export async function getAnalyticsData(userId: string) {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const records = await prisma.earningRecord.findMany({
    where: {
      userId,
      recordedAt: { gte: monthStart, lte: monthEnd },
    },
    orderBy: { recordedAt: 'asc' }
  });

  // Calculate Totals - Using the logic that Settled Credit doesn't count as debt
  // Inside getAnalyticsData
const totals = records.reduce((acc, rec) => {
  const method = rec.paymentMethod.toUpperCase();
  if (method === "HARDWARE") acc.online += rec.amount; // Use 'online'
  else if (method === "CASH") acc.cash += rec.amount;
  else if (method === "CREDIT" && rec.status !== "SETTLED") acc.credit += rec.amount;
  return acc;
}, { online: 0, cash: 0, credit: 0 }); // Match these keys!
  // Daily Chart Data
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const chartData = days.map(day => {
    const dateStr = format(day, 'MMM dd');
    const dayRecords = records.filter(r => format(r.recordedAt, 'MMM dd') === dateStr);
    return {
      name: dateStr,
      online: dayRecords.filter(r => r.paymentMethod === "HARDWARE").reduce((s, r) => s + r.amount, 0),
      cash: dayRecords.filter(r => r.paymentMethod === "CASH").reduce((s, r) => s + r.amount, 0),
      credit: dayRecords.filter(r => r.paymentMethod === "CREDIT").reduce((s, r) => s + r.amount, 0),
    };
  });

  // 6-Month Trend
  const monthlyTrend = await Promise.all(
    Array.from({ length: 6 }).map(async (_, i) => {
      const d = subMonths(now, i);
      const mStart = startOfMonth(d);
      const mEnd = endOfMonth(d);
      const sum = await prisma.earningRecord.aggregate({
        where: { userId, recordedAt: { gte: mStart, lte: mEnd } },
        _sum: { amount: true }
      });
      return { month: format(d, 'MMM'), total: sum._sum.amount || 0 };
    })
  ).then(res => res.reverse());

  return { totals, chartData, monthlyTrend };
}

export async function settleCreditRecord(recordId: string) {
  return await prisma.earningRecord.update({
    where: { id: recordId },
    data: { status: "SETTLED" }
  });
}

export async function getTodayDashboardData(userId: string) {
  const now = new Date();
  const start = startOfDay(now);
  const end = endOfDay(now);

  // 1. Fetch Today's Earnings & Records
  const todayRecords = await prisma.earningRecord.findMany({
    where: {
      userId,
      recordedAt: { gte: start, lte: end },
    },
    include: { device: true },
    orderBy: { recordedAt: "desc" },
  });

  // 2. Calculate Sum
  const totalToday = todayRecords.reduce((acc, curr) => acc + curr.amount, 0);

  // 3. Get Hardware Status
  const devices = await prisma.device.findMany({
    where: { userId },
    include: { subscription: true },
  });

  return {
    todayRecords,
    totalToday,
    devices: devices.map(d => ({
      id: d.id,
      name: d.name,
      type: d.type,
      daysLeft: d.subscription ? Math.max(0, Math.ceil((d.subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0,
    }))
  };
}