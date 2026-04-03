-- AlterTable
ALTER TABLE "User" ADD COLUMN     "parentId" TEXT;

-- CreateIndex
CREATE INDEX "Credit_customerName_idx" ON "Credit"("customerName");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
