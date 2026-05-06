import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const creditId = searchParams.get("creditId"); // Get the specific customer ID
    const page = parseInt(searchParams.get("page") || "1");
    const limit = 15;

    const targetUserId = session.parentId || session.userId;
    const where: any = { userId: targetUserId };

    // STRICT filter by creditId if provided
    if (creditId) {
      where.creditId = creditId;
      where.paymentMethod = "CREDIT"; 
    } else {
      // Normal filtering for the general History page
      if (type === "online") where.paymentMethod = "HARDWARE";
      else if (type === "cash") where.paymentMethod = "CASH";
      else if (type === "credit") where.paymentMethod = "CREDIT";
    }

    const records = await prisma.earningRecord.findMany({
      where,
      orderBy: { recordedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        credit: { select: { customerName: true } }
      }
    });

    return NextResponse.json({ 
      records, 
      hasMore: records.length === limit,
      page 
    });
  } catch (error) {
    console.error("Fetch Records Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { amount, description, paymentMethod, creditId, creditDirection, deviceId } = await req.json();
    const ownerId = session.parentId || session.userId;

    const record = await prisma.$transaction(async (tx) => {
      // 1. Create the new ledger entry
      const newRecord = await tx.earningRecord.create({
        data: {
          amount,
          description,
          paymentMethod,
          creditDirection: paymentMethod === "CREDIT" ? (creditDirection ?? "LINA") : null,
          userId: ownerId,
          deviceId: deviceId ?? null,
          creditId: paymentMethod === "CREDIT" ? creditId : null,
        },
      });

      // 2. Update the total balance on the Credit profile
      if (paymentMethod === "CREDIT" && creditId) {
        await tx.credit.update({
          where: { id: creditId },
          data: {
            // Since the account's direction (Lina/Dina) is fixed, adding a new record 
            // simply increments the total outstanding balance of that account.
            totalAmount: { increment: amount },
            status: "PENDING",
          },
        });
      }

      return newRecord;
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Transaction failed" }, { status: 500 });
  }
}

// PROTECTIVE DELETE: Only the Merchant (Owner) can delete records
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role === "STAFF") {
    return NextResponse.json({ error: "Forbidden: Staff cannot delete records" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || undefined;

  await prisma.earningRecord.delete({ where: { id } });
  return NextResponse.json({ success: true });
}