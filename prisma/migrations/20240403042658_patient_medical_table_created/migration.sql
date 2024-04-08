-- CreateEnum
CREATE TYPE "BloodGroup" AS ENUM ('A_POSITIVE', 'B_POSITIVE', 'O_POSITIVE', 'AB_POSITIVE', 'A_NEGATIVE', 'B_NEGATIVE', 'O_NEGATIVE', 'AB_NEGATIVE');

-- CreateEnum
CREATE TYPE "MeritalStatus" AS ENUM ('MARRIED', 'UNMARRIED');

-- CreateTable
CREATE TABLE "PatientHealthData" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dateOfBirth" TEXT NOT NULL,
    "bloodGroup" "BloodGroup" NOT NULL,
    "hasAllergies" BOOLEAN NOT NULL,
    "hasDiabetes" BOOLEAN NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "smookingStatus" BOOLEAN NOT NULL,
    "dietaryPreferences" TEXT NOT NULL,
    "pregnancyStatus" BOOLEAN NOT NULL,
    "mentalHealthHistory" TEXT NOT NULL,
    "immunizationStatus" TEXT NOT NULL,
    "hadPastSurgeries" BOOLEAN NOT NULL,
    "recentAnxiety" BOOLEAN NOT NULL,
    "recentDepression" BOOLEAN NOT NULL,
    "maritalStatus" "MeritalStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientHealthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MedicalReport" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "reportLink" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MedicalReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PatientHealthData_patientId_key" ON "PatientHealthData"("patientId");

-- AddForeignKey
ALTER TABLE "PatientHealthData" ADD CONSTRAINT "PatientHealthData_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MedicalReport" ADD CONSTRAINT "MedicalReport_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
