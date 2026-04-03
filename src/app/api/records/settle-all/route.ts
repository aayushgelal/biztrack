import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const creditId = searchParams.get("id"); // This is the Company/Credit Profile ID

  if (!creditId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Mark all pending records for this company as settled
      await tx.earningRecord.updateMany({
        where: { 
          creditId, 
          userId: session.userId,
          status: "PENDING" 
        },
        data: { status: "SETTLED" },
      });

      // 2. Reset the company's total outstanding amount to 0
      await tx.credit.update({
        where: { id: creditId },
        data: { 
          totalAmount: 0,
          status: "SETTLED" 
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Bulk settlement failed" }, { status: 500 });
  }
}