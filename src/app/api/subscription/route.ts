import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

// GET /api/subscription — get all subscriptions
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const subscriptions = await prisma.subscription.findMany({
    where: { userId: session.userId },
    include: {
      device: true,
      payments: {
        orderBy: { paidAt: "desc" },
        take: 5,
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ subscriptions });
}

// POST /api/subscription — renew or pay subscription
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subscriptionId, paymentMethod, plan } = body;

    const subscription = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId: session.userId },
    });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    const planDays: Record<string, number> = {
      monthly: 30,
      quarterly: 90,
      yearly: 365,
    };

    const planAmounts: Record<string, number> = {
      monthly: 29.99,
      quarterly: 79.99,
      yearly: 299.99,
    };

    const selectedPlan = plan || subscription.plan;
    const days = planDays[selectedPlan] || 30;
    const amount = planAmounts[selectedPlan] || subscription.amount;

    const now = new Date();
    const currentEnd = new Date(subscription.endDate);
    const newStart = currentEnd > now ? currentEnd : now;
    const newEnd = new Date(newStart);
    newEnd.setDate(newEnd.getDate() + days);

    const [updatedSub, payment] = await prisma.$transaction([
      prisma.subscription.update({
        where: { id: subscriptionId },
        data: {
          status: "active",
          plan: selectedPlan,
          amount,
          endDate: newEnd,
          lastPaidAt: now,
        },
        include: {
          device: true,
          payments: { orderBy: { paidAt: "desc" }, take: 5 },
        },
      }),
      prisma.subscriptionPayment.create({
        data: {
          subscriptionId,
          amount,
          currency: subscription.currency,
          status: "completed",
          paymentMethod: paymentMethod || "card",
          transactionRef: `TXN-${Date.now()}`,
          paidAt: now,
        },
      }),
    ]);

    return NextResponse.json({ subscription: updatedSub, payment });
  } catch (error) {
    console.error("Subscription payment error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/subscription — update subscription settings
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { subscriptionId, autoRenew } = body;

    const subscription = await prisma.subscription.update({
      where: { id: subscriptionId, userId: session.userId } as any,
      data: { autoRenew },
    });

    return NextResponse.json({ subscription });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
