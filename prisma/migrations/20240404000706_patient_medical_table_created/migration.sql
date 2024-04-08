-- AlterTable
ALTER TABLE "PatientHealthData" ALTER COLUMN "maritalStatus" DROP NOT NULL,
ALTER COLUMN "maritalStatus" SET DEFAULT 'UNMARRIED';
