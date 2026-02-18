import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  verifyPassword,
  generateToken,
  setAuthCookie,
  hashPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, username, password, businessName } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    if (action === "register") {
      if (!businessName) return NextResponse.json({ error: "Business name required" }, { status: 400 });

      const existing = await prisma.user.findUnique({ where: { username } });
      if (existing) return NextResponse.json({ error: "Username taken" }, { status: 409 });

      const hashedPassword = await hashPassword(password);
      const user = await prisma.user.create({
        data: { username, password: hashedPassword, businessName },
      });

      // Automatically create a default ET389 Device for the merchant
      const device = await prisma.device.create({
        data: {
          name: "Main Soundbox",
          serialNumber: `ET-${Date.now()}`, // Unique serial for the soundbox
          userId: user.id,
          type: "ET389",
        },
      });

      // Set up a 30-day trial subscription in NPR
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      await prisma.subscription.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          amount: 0, // Free trial
          plan: "trial",
          status: "active",
          currency: "NPR",
          endDate,
        },
      });

      const token = generateToken({ userId: user.id, username, businessName });
      await setAuthCookie(token);

      return NextResponse.json({ success: true, user: { id: user.id, username, businessName } });
    } else {
      // Login Logic
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || !(await verifyPassword(password, user.password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      const token = generateToken({ userId: user.id, username, businessName: user.businessName });
      await setAuthCookie(token);

      return NextResponse.json({ success: true, user: { id: user.id, username, businessName: user.businessName } });
    }
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const { clearAuthCookie } = await import("@/lib/auth");
  clearAuthCookie();
  return NextResponse.json({ success: true });
}