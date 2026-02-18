/*
  Warnings:

  - A unique constraint covering the columns `[prn]` on the table `EarningRecord` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[transactionRef]` on the table `SubscriptionPayment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `prn` to the `EarningRecord` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "fonepayMerchantCode" TEXT,
ADD COLUMN     "fonepayPassword" TEXT,
ADD COLUMN     "fonepaySecretKey" TEXT,
ADD COLUMN     "fonepayUsername" TEXT,
ALTER COLUMN "type" SET DEFAULT 'ET389';

-- AlterTable
ALTER TABLE "EarningRecord" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'NPR',
ADD COLUMN     "prn" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'SUCCESS';

-- AlterTable
ALTER TABLE "Subscription" ALTER COLUMN "currency" SET DEFAULT 'NPR';

-- AlterTable
ALTER TABLE "SubscriptionPayment" ALTER COLUMN "currency" SET DEFAULT 'NPR',
ALTER COLUMN "paymentMethod" SET DEFAULT 'fonepay';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'MERCHANT';

-- CreateIndex
CREATE UNIQUE INDEX "EarningRecord_prn_key" ON "EarningRecord"("prn");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPayment_transactionRef_key" ON "SubscriptionPayment"("transactionRef");
