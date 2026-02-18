import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { subDays, subMonths, startOfMonth } from "date-fns";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.subscriptionPayment.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.earningRecord.deleteMany();
  await prisma.device.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 12);
  const user = await prisma.user.create({
    data: {
      username: "demo",
      password: hashedPassword,
      businessName: "Demo Store",
      email: "demo@biztrack.app",
      phone: "+1 555-0123",
    },
  });

  console.log("✅ Created user:", user.username);

  // Create 2 devices
  const device1 = await prisma.device.create({
    data: {
      name: "Main POS",
      serialNumber: "POS-001-2024",
      location: "Front Counter",
      type: "POS",
      userId: user.id,
    },
  });

  const device2 = await prisma.device.create({
    data: {
      name: "Online Store",
      serialNumber: "WEB-001-2024",
      location: "Online",
      type: "ONLINE",
      userId: user.id,
    },
  });

  console.log("✅ Created devices");

  // Create subscriptions
  const endDate1 = new Date();
  endDate1.setDate(endDate1.getDate() + 15); // Expires in 15 days
  const sub1 = await prisma.subscription.create({
    data: {
      userId: user.id,
      deviceId: device1.id,
      plan: "monthly",
      amount: 29.99,
      status: "active",
      endDate: endDate1,
      lastPaidAt: subDays(new Date(), 15),
    },
  });

  const endDate2 = new Date();
  endDate2.setDate(endDate2.getDate() + 60);
  const sub2 = await prisma.subscription.create({
    data: {
      userId: user.id,
      deviceId: device2.id,
      plan: "quarterly",
      amount: 79.99,
      status: "active",
      endDate: endDate2,
      lastPaidAt: subDays(new Date(), 30),
    },
  });

  // Create payment history
  await prisma.subscriptionPayment.createMany({
    data: [
      {
        subscriptionId: sub1.id,
        amount: 29.99,
        status: "completed",
        paymentMethod: "card",
        transactionRef: `TXN-${Date.now() - 1000}`,
        paidAt: subDays(new Date(), 15),
      },
      {
        subscriptionId: sub1.id,
        amount: 29.99,
        status: "completed",
        paymentMethod: "card",
        transactionRef: `TXN-${Date.now() - 2000}`,
        paidAt: subDays(new Date(), 45),
      },
      {
        subscriptionId: sub2.id,
        amount: 79.99,
        status: "completed",
        paymentMethod: "card",
        transactionRef: `TXN-${Date.now() - 3000}`,
        paidAt: subDays(new Date(), 30),
      },
    ],
  });

  console.log("✅ Created subscriptions");

  // Generate realistic earning records for past 3 months
  const categories = ["Sales", "Services", "Products", "Delivery", "Online"];
  const records = [];

  for (let monthsAgo = 2; monthsAgo >= 0; monthsAgo--) {
    for (let day = 0; day < 28; day++) {
      const date = subDays(subMonths(new Date(), monthsAgo), day);
      const dayOfWeek = date.getDay();
      
      // Fewer sales on Sunday (0)
      const transactionCount =
        dayOfWeek === 0
          ? Math.floor(Math.random() * 5) + 2
          : Math.floor(Math.random() * 15) + 5;

      for (let t = 0; t < transactionCount; t++) {
        const isOnline = Math.random() < 0.3;
        const amount = isOnline
          ? Math.round((Math.random() * 200 + 20) * 100) / 100
          : Math.round((Math.random() * 150 + 10) * 100) / 100;

        const recordDate = new Date(date);
        recordDate.setHours(
          Math.floor(Math.random() * 12) + 8,
          Math.floor(Math.random() * 60)
        );

        records.push({
          amount,
          category: categories[Math.floor(Math.random() * categories.length)],
          source: isOnline ? "device" : Math.random() > 0.5 ? "device" : "manual",
          recordedAt: recordDate,
          userId: user.id,
          deviceId: isOnline ? device2.id : device1.id,
        });
      }
    }
  }

  await prisma.earningRecord.createMany({ data: records });

  console.log(`✅ Created ${records.length} earning records`);
  console.log("\n🎉 Seed complete!");
  console.log("📧 Login: demo / demo123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
