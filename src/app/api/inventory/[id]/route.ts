// app/api/inventory/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ownerId = session.parentId || session.userId;
    const body = await req.json();

    const item = await prisma.inventoryItem.findFirst({
      where: { id: params.id, userId: ownerId },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.inventoryItem.update({
      where: { id: params.id },
      data: {
        name: body.name ?? item.name,
        sku: body.sku ?? item.sku,
        category: body.category ?? item.category,
        unit: body.unit ?? item.unit,
        costPrice: body.costPrice !== undefined ? parseFloat(body.costPrice) : item.costPrice,
        sellingPrice: body.sellingPrice !== undefined ? parseFloat(body.sellingPrice) : item.sellingPrice,
        minStock: body.minStock !== undefined ? parseFloat(body.minStock) : item.minStock,
        maxStock: body.maxStock !== undefined ? parseFloat(body.maxStock) : item.maxStock,
        description: body.description ?? item.description,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update item" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const ownerId = session.parentId || session.userId;

    const item = await prisma.inventoryItem.findFirst({
      where: { id: params.id, userId: ownerId },
    });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Soft delete
    await prisma.inventoryItem.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete item" }, { status: 500 });
  }
}