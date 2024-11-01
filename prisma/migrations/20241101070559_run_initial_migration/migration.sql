-- CreateTable
CREATE TABLE "PromptChain" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptChain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "parentId" TEXT,
    "type" TEXT NOT NULL,
    "position" JSONB NOT NULL,
    "text" TEXT NOT NULL,
    "analysis" TEXT,
    "changes" JSONB NOT NULL,
    "feedback" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Node_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Edge" (
    "id" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "target" TEXT NOT NULL,

    CONSTRAINT "Edge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Node" ADD CONSTRAINT "Node_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "PromptChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Edge" ADD CONSTRAINT "Edge_chainId_fkey" FOREIGN KEY ("chainId") REFERENCES "PromptChain"("id") ON DELETE CASCADE ON UPDATE CASCADE;
