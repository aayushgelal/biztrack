import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("biztrack_token")?.value;

    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid Session" }, { status: 401 });
    }

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
            // FIXED: Changed from subscriptions to subscription (singular)
            subscription: { 
              select: {
                status: true,
                endDate: true,
              }
            }
          }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json({ success: true, user });

  } catch (error) {
    console.error("JWT Verification Error:", error);
    // Be careful here: if the DB fails, it's not always a session issue.
    return NextResponse.json({ error: "Authentication Failed" }, { status: 401 });
  }
}