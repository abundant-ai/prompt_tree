/*
  Warnings:

  - Added the required column `orgId` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Edge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Node` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orgId` to the `PromptChain` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `PromptChain` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Edge" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Node" ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL,
ALTER COLUMN "createdAt" SET DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "PromptChain" ADD COLUMN     "orgId" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;
