import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verify } from "jsonwebtoken"; // or your custom token verifier

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("auth_token")?.value; // adjust to your cookie name
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Assuming you have a helper to get data from token
    const decoded: any = verify(token, process.env.JWT_SECRET!);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        devices: {
          include: { subscription: true }
        }
      }
    });

    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Don't send the hashed password back to the frontend
    const { password, ...safeUser } = user;

    return NextResponse.json({ user: safeUser });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}