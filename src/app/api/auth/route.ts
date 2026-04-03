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
      
      // 1. Create Main MERCHANT Account
      const user = await prisma.user.create({
        data: { 
          username, 
          password: hashedPassword, 
          businessName,
          role: "MERCHANT" 
        },
      });

      // 2. Automatically create a default ET389 Device
      const device = await prisma.device.create({
        data: {
          name: "Main Soundbox",
          serialNumber: `ET-${Date.now()}`,
          userId: user.id,
          type: "ET389",
        },
      });

      // 3. Set up a 30-day trial subscription
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      await prisma.subscription.create({
        data: {
          userId: user.id,
          deviceId: device.id,
          amount: 0,
          plan: "trial",
          status: "active",
          currency: "NPR",
          endDate,
        },
      });

      // 4. Generate token with role and parentId (null for merchant)
      const token = generateToken({ 
        userId: user.id, 
        username, 
        businessName,
        role: "MERCHANT",
        parentId: undefined 
      });
      
      setAuthCookie(token);

      return NextResponse.json({ 
        success: true, 
        user: { id: user.id, username, businessName, role: "MERCHANT" } 
      });

    } else {
      // LOGIN LOGIC (Handles both MERCHANT and STAFF)
      const user = await prisma.user.findUnique({ 
        where: { username },
        include: { parent: true } // Fetch parent info if it's a staff account
      });

      if (!user || !(await verifyPassword(password, user.password))) {
        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      }

      // If user is STAFF, we use the parent's Business Name for the session UI
      const effectiveBusinessName = user.role === "STAFF" 
        ? user.parent?.businessName || "Staff Account" 
        : user.businessName;

      const token = generateToken({ 
        userId: user.id, 
        username: user.username, 
        businessName: effectiveBusinessName,
        role: user.role,
        parentId: user.parentId || undefined // Crucial for scoping staff data
      });

      setAuthCookie(token);

      return NextResponse.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username, 
          businessName: effectiveBusinessName,
          role: user.role 
        } 
      });
    }
  } catch (error) {
    console.error("Auth Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE() {
  const { clearAuthCookie } = await import("@/lib/auth");
  clearAuthCookie();
  return NextResponse.json({ success: true });
}