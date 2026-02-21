import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    // 1. MUST match the name in your setAuthCookie exactly
    const token = req.cookies.get("biztrack_token")?.value;

    if (!token) {
      console.log("Auth Failure: biztrack_token not found in cookies");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify JWT using your secret
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
    }

    // 3. Optimized Database Fetch for Profile & Hardware
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        businessName: true,
        devices: {
          select: {
            id: true,
            name: true,
            serialNumber: true,
            fonepayMerchantCode: true,
            fonepaySecretKey: true,
            // CHANGE THIS: Ensure it matches your schema (likely 'subscriptions' plural)
            // and returns an array so the frontend .[0] works.
            subscriptions: { 
              select: {
                status: true,
                endDate: true,
              },
              take: 1,
              orderBy: { endDate: 'desc' }
            }
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error("JWT Verification Error:", error);
    return NextResponse.json({ error: "Session Expired" }, { status: 401 });
  }
}