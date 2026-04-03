import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ownerId = session.parentId || session.userId;

  const companies = await prisma.credit.findMany({
    where: { userId: ownerId },
    orderBy: { customerName: "asc" },
  });

  return NextResponse.json(companies);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { customerName, customerPhone } = await req.json();
    const ownerId = session.parentId || session.userId;

    const company = await prisma.credit.create({
      data: {
        customerName,
        customerPhone,
        userId: ownerId,
      },
    });

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create company" }, { status: 500 });
  }
}