CREATE TABLE "Role" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "accountId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "module" "SystemModule" NOT NULL,
    "actions" "SystemAction"[] NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "User" ADD COLUMN "customRoleId" TEXT;

UPDATE "PricingPlan" AS plan
SET "allowedModules" = ARRAY(
    SELECT DISTINCT CASE
        WHEN module = 'STOCK' THEN 'PRODUCT'::"SystemModule"
        ELSE module
    END
    FROM unnest(plan."allowedModules") AS modules(module)
)
WHERE plan."allowedModules" @> ARRAY['STOCK']::"SystemModule"[];

INSERT INTO "Role" ("id", "name", "accountId", "createdAt", "updatedAt")
SELECT
    gen_random_uuid()::text,
    'Legacy - ' || LEFT(u."email", 24) || ' - ' || u."id",
    u."accountId",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "User" AS u
WHERE u."role" = 'STAFF';

UPDATE "User" AS u
SET "customRoleId" = r."id"
FROM "Role" AS r
WHERE u."role" = 'STAFF'
  AND r."accountId" = u."accountId"
  AND r."name" = 'Legacy - ' || LEFT(u."email", 24) || ' - ' || u."id";

WITH legacy_actions AS (
    SELECT
        u."customRoleId" AS "roleId",
        CASE WHEN p."module" = 'STOCK' THEN 'PRODUCT'::"SystemModule" ELSE p."module" END AS "module",
        action
    FROM "Permission" AS p
    JOIN "User" AS u ON u."id" = p."userId"
    CROSS JOIN LATERAL unnest(COALESCE(p."actions", ARRAY[]::"SystemAction"[])) AS expanded(action)
    WHERE u."role" = 'STAFF'
      AND u."customRoleId" IS NOT NULL
      AND p."module" IN (
          'CATEGORY', 'SUBCATEGORY', 'SUPPLIER', 'PRODUCT', 'RAW_PRODUCT',
          'PREPARED_PRODUCT', 'PURCHASE', 'SERVICE', 'CUSTOMER', 'SALE',
          'WASTAGE', 'INVOICE', 'TRASH', 'ACTIVITY_LOG', 'STOCK'
      )
),
valid_actions AS (
    SELECT "roleId", "module", action
    FROM legacy_actions
    WHERE action::text = ANY(
        CASE
            WHEN "module" = 'ACTIVITY_LOG' THEN ARRAY['READ']::text[]
            WHEN "module" = 'TRASH' THEN ARRAY['READ', 'DELETE', 'RESTORE']::text[]
            WHEN "module" = 'PURCHASE' THEN ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE', 'RESTORE']::text[]
            WHEN "module" IN ('PRODUCT', 'RAW_PRODUCT', 'PREPARED_PRODUCT') THEN
                ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE', 'STOCK_IN', 'STOCK_OUT']::text[]
            WHEN "module" = 'WASTAGE' THEN
                ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE', 'STOCK_OUT']::text[]
            ELSE ARRAY['CREATE', 'READ', 'UPDATE', 'DELETE']::text[]
        END
    )
),
role_permissions AS (
    SELECT "roleId", "module", array_agg(DISTINCT action) AS "actions"
    FROM valid_actions
    GROUP BY "roleId", "module"
)
INSERT INTO "RolePermission" ("id", "roleId", "module", "actions", "createdAt", "updatedAt")
SELECT gen_random_uuid()::text, "roleId", "module", "actions",
       CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM role_permissions;

DROP TABLE "Permission";

CREATE UNIQUE INDEX "Role_accountId_name_key" ON "Role"("accountId", "name");
CREATE INDEX "Role_accountId_idx" ON "Role"("accountId");
CREATE UNIQUE INDEX "RolePermission_roleId_module_key" ON "RolePermission"("roleId", "module");
CREATE INDEX "RolePermission_roleId_idx" ON "RolePermission"("roleId");
CREATE INDEX "User_customRoleId_idx" ON "User"("customRoleId");

ALTER TABLE "Role"
ADD CONSTRAINT "Role_accountId_fkey"
FOREIGN KEY ("accountId") REFERENCES "Account"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RolePermission"
ADD CONSTRAINT "RolePermission_roleId_fkey"
FOREIGN KEY ("roleId") REFERENCES "Role"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "User"
ADD CONSTRAINT "User_customRoleId_fkey"
FOREIGN KEY ("customRoleId") REFERENCES "Role"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
