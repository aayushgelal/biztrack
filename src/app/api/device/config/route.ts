import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request) {
  try {
    const { deviceId, fonepayMerchantCode, fonepaySecretKey } = await req.json();

    const updatedDevice = await prisma.device.update({
      where: { id: deviceId },
      data: {
        fonepayMerchantCode,
        fonepaySecretKey, // Tip: Encrypt this before saving!
      },
    });

    return NextResponse.json({ success: true, message: "Hardware updated" });
  } catch (error) {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}