/*
  Warnings:

  - You are about to drop the `DoctorSpecialities` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Specialities` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "DoctorSpecialities" DROP CONSTRAINT "DoctorSpecialities_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "DoctorSpecialities" DROP CONSTRAINT "DoctorSpecialities_specialitiesId_fkey";

-- DropTable
DROP TABLE "DoctorSpecialities";

-- DropTable
DROP TABLE "Specialities";

-- CreateTable
CREATE TABLE "Specialties" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,

    CONSTRAINT "Specialties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorSpecialties" (
    "specialitiesId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,

    CONSTRAINT "DoctorSpecialties_pkey" PRIMARY KEY ("specialitiesId","doctorId")
);

-- AddForeignKey
ALTER TABLE "DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_specialitiesId_fkey" FOREIGN KEY ("specialitiesId") REFERENCES "Specialties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorSpecialties" ADD CONSTRAINT "DoctorSpecialties_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
