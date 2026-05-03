// app/api/inventory/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const ownerId = session.parentId || session.userId;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const items = await prisma.inventoryItem.findMany({
    where: {
      userId: ownerId,
      isActive: true,
      ...(category && category !== "All" ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { sku: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { stockMovements: true } },
    },
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ownerId = session.parentId || session.userId;
    const body = await req.json();

    const { name, sku, category, unit, costPrice, sellingPrice, currentStock, minStock, maxStock, description } = body;

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const item = await prisma.inventoryItem.create({
      data: {
        name,
        sku: sku || null,
        category: category || "General",
        unit: unit || "pcs",
        costPrice: parseFloat(costPrice) || 0,
        sellingPrice: parseFloat(sellingPrice) || 0,
        currentStock: parseFloat(currentStock) || 0,
        minStock: parseFloat(minStock) || 0,
        maxStock: maxStock ? parseFloat(maxStock) : null,
        description: description || null,
        userId: ownerId,
      },
    });

    // Log initial stock as a movement if stock > 0
    if (item.currentStock > 0) {
      await prisma.stockMovement.create({
        data: {
          type: "IN",
          quantity: item.currentStock,
          note: "Initial stock",
          itemId: item.id,
          userId: ownerId,
        },
      });
    }

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create item" }, { status: 500 });
  }
}