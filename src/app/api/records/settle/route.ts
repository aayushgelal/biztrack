import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Find the record to get the amount and creditId
      const record = await tx.earningRecord.findUnique({
        where: { id, userId: session.userId },
      });

      if (!record || record.status === "SETTLED") {
        throw new Error("Record not found or already settled");
      }

      // 2. Mark record as settled
      const updatedRecord = await tx.earningRecord.update({
        where: { id },
        data: { status: "SETTLED" },
      });

      // 3. Deduct from the company's total outstanding balance
      if (record.creditId) {
        await tx.credit.update({
          where: { id: record.creditId },
          data: {
            totalAmount: { decrement: record.amount },
          },
        });
      }

      return updatedRecord;
    });

    return NextResponse.json({ success: true, record: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Settlement failed" }, { status: 500 });
  }
}