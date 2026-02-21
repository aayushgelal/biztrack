-- AlterTable
ALTER TABLE "EarningRecord" ADD COLUMN     "creditId" TEXT,
ADD COLUMN     "paymentMethod" TEXT NOT NULL DEFAULT 'HARDWARE',
ALTER COLUMN "prn" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT,
    "totalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EarningRecord" ADD CONSTRAINT "EarningRecord_creditId_fkey" FOREIGN KEY ("creditId") REFERENCES "Credit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
