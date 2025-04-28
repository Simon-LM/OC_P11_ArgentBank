-- CreateTable
CREATE TABLE "CsrfToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CsrfToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CsrfToken_userId_key" ON "CsrfToken"("userId");

-- CreateIndex
CREATE INDEX "CsrfToken_userId_idx" ON "CsrfToken"("userId");
