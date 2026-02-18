"use server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

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