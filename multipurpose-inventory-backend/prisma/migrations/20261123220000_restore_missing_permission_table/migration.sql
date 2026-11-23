CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT,
    "accountId" TEXT NOT NULL,
    "module" "SystemModule" NOT NULL,
    "actions" "SystemAction"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Permission_accountId_idx" ON "Permission"("accountId");

CREATE UNIQUE INDEX "Permission_userId_module_key" ON "Permission"("userId", "module");

ALTER TABLE "Permission"
ADD CONSTRAINT "Permission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Permission"
ADD CONSTRAINT "Permission_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;
