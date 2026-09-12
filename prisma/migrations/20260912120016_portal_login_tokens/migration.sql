-- CreateEnum
CREATE TYPE "PortalPersonType" AS ENUM ('RENTER', 'BUYER');

-- CreateTable
CREATE TABLE "PortalLoginToken" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "personType" "PortalPersonType" NOT NULL,
    "personId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PortalLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PortalLoginToken_tokenHash_key" ON "PortalLoginToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PortalLoginToken_tenantId_idx" ON "PortalLoginToken"("tenantId");

-- AddForeignKey
ALTER TABLE "PortalLoginToken" ADD CONSTRAINT "PortalLoginToken_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
