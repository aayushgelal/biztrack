import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/records — get records with filters
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const category = searchParams.get("category");
  const source = searchParams.get("source");
  const deviceId = searchParams.get("deviceId");

  const where: any = { userId: session.userId };
  if (from && to) {
    where.recordedAt = { gte: new Date(from), lte: new Date(to) };
  }
  if (category) where.category = category;
  if (source) where.source = source;
  if (deviceId) where.deviceId = deviceId;

  const [records, total] = await Promise.all([
    prisma.earningRecord.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { device: { select: { id: true, name: true } } },
    }),
    prisma.earningRecord.count({ where }),
  ]);

  return NextResponse.json({
    records,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}

// GET /api/records/devices — list user devices
export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, serialNumber, location, type } = body;

    if (!name || !serialNumber) {
      return NextResponse.json(
        { error: "Name and serial number are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.device.findUnique({
      where: { serialNumber },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Device with this serial number already exists" },
        { status: 409 }
      );
    }

    const device = await prisma.device.create({
      data: {
        name,
        serialNumber,
        location: location || null,
        type: type || "POS",
        userId: session.userId,
      },
    });

    // Create subscription for new device
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);
    const subscription = await prisma.subscription.create({
      data: {
        userId: session.userId,
        deviceId: device.id,
        amount: 29.99,
        plan: "monthly",
        status: "active",
        endDate,
      },
    });

    return NextResponse.json({ device, subscription }, { status: 201 });
  } catch (error) {
    console.error("Create device error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
