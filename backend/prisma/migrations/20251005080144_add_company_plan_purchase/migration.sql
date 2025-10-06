-- AlterTable
ALTER TABLE "JobPosting" ADD COLUMN     "planPurchaseId" TEXT;

-- CreateTable
CREATE TABLE "CompanyPlanPurchase" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "pricingPlanId" TEXT NOT NULL,
    "totalJobs" INTEGER NOT NULL,
    "usedJobs" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPlanPurchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobPosting" ADD CONSTRAINT "JobPosting_planPurchaseId_fkey" FOREIGN KEY ("planPurchaseId") REFERENCES "CompanyPlanPurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPlanPurchase" ADD CONSTRAINT "CompanyPlanPurchase_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPlanPurchase" ADD CONSTRAINT "CompanyPlanPurchase_pricingPlanId_fkey" FOREIGN KEY ("pricingPlanId") REFERENCES "PricingPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
