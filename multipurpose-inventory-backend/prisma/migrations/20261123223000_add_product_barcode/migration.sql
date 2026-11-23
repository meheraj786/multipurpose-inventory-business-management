ALTER TABLE "Product" ADD COLUMN "barcode" TEXT;

CREATE INDEX "Product_accountId_barcode_idx" ON "Product"("accountId", "barcode");
