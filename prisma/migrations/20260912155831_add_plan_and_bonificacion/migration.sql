-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('BASICO', 'PRO', 'ENTERPRISE');

-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "bonificado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bonificadoMotivo" TEXT,
ADD COLUMN     "maxPropiedades" INTEGER DEFAULT 25,
ADD COLUMN     "maxUsuarios" INTEGER DEFAULT 3,
ADD COLUMN     "plan" "Plan" NOT NULL DEFAULT 'BASICO';
