import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, hashPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "MERCHANT") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { username, password } = await req.json();
    
    // Check if username is taken globally
    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return NextResponse.json({ error: "Username already exists" }, { status: 409 });

    // Important: We hash the staff password just like a merchant
    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        businessName: "Staff Account", // Placeholder, login route will handle branding
        role: "STAFF",
        parentId: session.userId,
      }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  
  // Use deleteMany to ensure the merchant owns this staff member
  await prisma.user.deleteMany({
    where: { id, parentId: session.userId }
  });

  return NextResponse.json({ success: true });
}