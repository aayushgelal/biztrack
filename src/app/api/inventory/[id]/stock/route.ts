// app/api/inventory/[id]/stock/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ownerId = session.parentId || session.userId;
    const { type, quantity, note, reference } = await req.json();

    if (!["IN", "OUT", "ADJUSTMENT"].includes(type)) {
      return NextResponse.json({ error: "Invalid movement type" }, { status: 400 });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return NextResponse.json({ error: "Invalid quantity" }, { status: 400 });
    }

    const item = await prisma.inventoryItem.findFirst({
      where: { id: params.id, userId: ownerId },
    });
    if (!item) return NextResponse.json({ error: "Item not found" }, { status: 404 });

    // Calculate new stock
    let newStock = item.currentStock;
    if (type === "IN") newStock += qty;
    else if (type === "OUT") newStock -= qty;
    else if (type === "ADJUSTMENT") newStock = qty; // Set directly

    if (newStock < 0) {
      return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
    }

    // Transaction: update stock + create movement log
    const [updatedItem, movement] = await prisma.$transaction([
      prisma.inventoryItem.update({
        where: { id: params.id },
        data: { currentStock: newStock },
      }),
      prisma.stockMovement.create({
        data: {
          type,
          quantity: qty,
          note: note || null,
          reference: reference || null,
          itemId: params.id,
          userId: ownerId,
        },
      }),
    ]);

    return NextResponse.json({ item: updatedItem, movement });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update stock" }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ownerId = session.parentId || session.userId;

  const movements = await prisma.stockMovement.findMany({
    where: { itemId: params.id, userId: ownerId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(movements);
}