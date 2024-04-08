/*
  Warnings:

  - The primary key for the `DoctorSpecialties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `specialitiesId` on the `DoctorSpecialties` table. All the data in the column will be lost.
  - Added the required column `specialtiesId` to the `DoctorSpecialties` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "DoctorSpecialties" DROP CONSTRAINT "DoctorSpecialties_specialitiesId_fkey";

-- AlterTable
ALTER TABLE "DoctorSpecialties" DROP CONSTRAINT "DoctorSpecialties_pkey",
DROP COLUMN "specialitiesId",
ADD COLUMN     "specialtiesId" TEXT NOT NULL,
ADD CONSTRAINT "DoctorSpecialties_pkey" PRIMARY KEY ("specialtiesId", "doctorId");

-- AddForeignKey
ALTER TABLE "DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_specialtiesId_fkey" FOREIGN KEY ("specialtiesId") REFERENCES "Specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
