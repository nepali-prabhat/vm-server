/*
  Warnings:

  - Added the required column `stock` to the `Drink` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "FundStock" (
    "fundType" TEXT NOT NULL PRIMARY KEY,
    "stock" REAL NOT NULL
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Drink" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "stock" INTEGER NOT NULL,
    "imageUrl" TEXT
);
INSERT INTO "new_Drink" ("id", "name", "price") SELECT "id", "name", "price" FROM "Drink";
DROP TABLE "Drink";
ALTER TABLE "new_Drink" RENAME TO "Drink";
CREATE UNIQUE INDEX "Drink_name_key" ON "Drink"("name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
