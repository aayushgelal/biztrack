import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from "@/lib/auth";

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { deviceId, name, fonepayMerchantCode, fonepaySecretKey, action } = await req.json();

    // ACTION: RENEW SUBSCRIPTION
    if (action === "renew") {
      const currentSub = await prisma.subscription.findFirst({
        where: { deviceId, userId: session.userId }
      });

      // Extend from current endDate if it hasn't expired, otherwise from now
      const baseDate = currentSub && new Date(currentSub.endDate) > new Date() 
        ? new Date(currentSub.endDate) 
        : new Date();

      const newEndDate = new Date(baseDate.setFullYear(baseDate.getFullYear() + 1));

      await prisma.subscription.updateMany({
        where: { deviceId, userId: session.userId },
        data: { endDate: newEndDate, status: "active" }
      });

      return NextResponse.json({ success: true, message: "Licence extended by 1 year" });
    }

    // ACTION: EDIT DEVICE CONFIG
    const updatedDevice = await prisma.device.update({
      where: { id: deviceId, userId: session.userId },
      data: {
        name,
        fonepayMerchantCode,
        ...(fonepaySecretKey && { fonepaySecretKey }), // Only update hash if a new one is provided
      },
    });

    return NextResponse.json({ success: true, message: "Hardware updated" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

// POST: Register New Hardware
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { name, serialNumber, fonepayMerchantCode, fonepaySecretKey } = await req.json();

    // 1. Check if serial is already in use
    const existing = await prisma.device.findUnique({ where: { serialNumber } });
    if (existing) return NextResponse.json({ error: "Serial already registered" }, { status: 400 });

    // 2. Create Device
    const device = await prisma.device.create({
      data: {
        name,
        serialNumber,
        fonepayMerchantCode,
        fonepaySecretKey,
        type: "Soundbox",
        userId: session.userId,
      },
    });

    // 3. Create Initial Subscription (30 days)
    await prisma.subscription.create({
      data: {
        userId: session.userId,
        deviceId: device.id,
        amount: 1000,
        plan: "Annual",
        status: "active",
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)), // 1 Year
      },
    });

    return NextResponse.json({ success: true, device });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE: Remove Hardware
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID Required" }, { status: 400 });

  try {
    // Delete device (Prisma Cascade will handle subscriptions if configured)
    await prisma.device.delete({
      where: { id, userId: session.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}