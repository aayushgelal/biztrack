import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    
    // 1. Safety Check: If no session, return 401 instead of crashing with 500
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 15;

    const where: any = { userId: session.userId };

    // 2. Filter Logic
    if (type === "online") where.paymentMethod = "HARDWARE";
    else if (type === "cash") where.paymentMethod = "CASH";
    else if (type === "credit") where.paymentMethod = "CREDIT";

    // 3. Fetch Records
    const records = await prisma.earningRecord.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({ 
      records, 
      hasMore: records.length === limit,
      page // return current page for React Query to track
    });
  } catch (error) {
    console.error("Records API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
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
