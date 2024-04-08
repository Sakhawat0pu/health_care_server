/*
  Warnings:

  - Made the column `maritalStatus` on table `PatientHealthData` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PatientHealthData" ALTER COLUMN "maritalStatus" SET NOT NULL;
