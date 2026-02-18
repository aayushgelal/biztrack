import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import {
  getDayRange,
  getMonthRange,
  getLast30Days,
  getLast12Months,
  generateDailyChartData,
  generateMonthlyChartData,
  generateCategoryData,
} from "@/lib/utils";
import { subDays } from "date-fns";

// GET /api/earnings — fetch earnings data
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "dashboard";
  const deviceId = searchParams.get("deviceId");

  const where = {
    userId: session.userId,
    ...(deviceId ? { deviceId } : {}),
  };

  if (type === "dashboard") {
    const today = getDayRange();
    const month = getMonthRange();
    const yesterday = getDayRange(subDays(new Date(), 1));
    const lastMonth = getMonthRange(subDays(new Date(), 30));

    const [
      todayRecords,
      monthRecords,
      yesterdayRecords,
      lastMonthRecords,
      allRecords,
      recentRecords,
    ] = await Promise.all([
      prisma.earningRecord.findMany({
        where: { ...where, recordedAt: { gte: today.start, lte: today.end } },
      }),
      prisma.earningRecord.findMany({
        where: { ...where, recordedAt: { gte: month.start, lte: month.end } },
      }),
      prisma.earningRecord.findMany({
        where: {
          ...where,
          recordedAt: { gte: yesterday.start, lte: yesterday.end },
        },
      }),
      prisma.earningRecord.findMany({
        where: {
          ...where,
          recordedAt: { gte: lastMonth.start, lte: lastMonth.end },
        },
      }),
      prisma.earningRecord.findMany({
        where: { ...where, recordedAt: { gte: getLast30Days().start } },
        orderBy: { recordedAt: "asc" },
      }),
      prisma.earningRecord.findMany({
        where,
        orderBy: { recordedAt: "desc" },
        take: 10,
        include: { device: { select: { name: true } } },
      }),
    ]);

    const todayTotal = todayRecords.reduce((s, r) => s + r.amount, 0);
    const monthTotal = monthRecords.reduce((s, r) => s + r.amount, 0);
    const yesterdayTotal = yesterdayRecords.reduce((s, r) => s + r.amount, 0);
    const lastMonthTotal = lastMonthRecords.reduce((s, r) => s + r.amount, 0);

    const pctToday =
      yesterdayTotal === 0
        ? 100
        : ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
    const pctMonth =
      lastMonthTotal === 0
        ? 100
        : ((monthTotal - lastMonthTotal) / lastMonthTotal) * 100;

    // Monthly chart for last 12 months
    const last12 = await prisma.earningRecord.findMany({
      where: { ...where, recordedAt: { gte: getLast12Months().start } },
      orderBy: { recordedAt: "asc" },
    });

    return NextResponse.json({
      stats: {
        todayEarnings: todayTotal,
        monthlyEarnings: monthTotal,
        totalEarnings: allRecords.reduce((s, r) => s + r.amount, 0),
        todayTransactions: todayRecords.length,
        monthlyTransactions: monthRecords.length,
        percentChangeToday: Math.round(pctToday * 10) / 10,
        percentChangeMonth: Math.round(pctMonth * 10) / 10,
      },
      dailyChart: generateDailyChartData(allRecords),
      monthlyChart: generateMonthlyChartData(last12),
      categoryData: generateCategoryData(monthRecords),
      recentRecords,
    });
  }

  if (type === "records") {
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const dateFilter = from && to ? {
      recordedAt: { gte: new Date(from), lte: new Date(to) },
    } : {};

    const [records, total] = await Promise.all([
      prisma.earningRecord.findMany({
        where: { ...where, ...dateFilter },
        orderBy: { recordedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { device: { select: { name: true } } },
      }),
      prisma.earningRecord.count({
        where: { ...where, ...dateFilter },
      }),
    ]);

    return NextResponse.json({ records, total, page, limit });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

// POST /api/earnings — create a new earning record
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { amount, description, category, deviceId, recordedAt,prn} = body;

    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: "Valid amount is required" }, { status: 400 });
    }

    if (deviceId) {
      const device = await prisma.device.findFirst({
        where: { id: deviceId, userId: session.userId },
      });
      if (!device) {
        return NextResponse.json({ error: "Device not found" }, { status: 404 });
      }
    }

    const record = await prisma.earningRecord.create({
      data: {
        amount: parseFloat(amount),
        description: description || null,
        category: category || "Sales",
        source: "manual",
        recordedAt: recordedAt ? new Date(recordedAt) : new Date(),
        userId: session.userId,
        deviceId: deviceId || null,
        prn:prn
      },
      include: { device: { select: { name: true } } },
    });

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error("Create record error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/earnings — delete a record
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Record ID required" }, { status: 400 });
  }

  try {
    const record = await prisma.earningRecord.findFirst({
      where: { id, userId: session.userId },
    });
    if (!record) {
      return NextResponse.json({ error: "Record not found" }, { status: 404 });
    }

    await prisma.earningRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
