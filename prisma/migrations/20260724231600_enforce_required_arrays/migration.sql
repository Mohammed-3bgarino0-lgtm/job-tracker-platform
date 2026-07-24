-- Align required Prisma list fields with PostgreSQL NOT NULL constraints.
ALTER TABLE "Job"
    ALTER COLUMN "genderEvidence" SET NOT NULL;

ALTER TABLE "JobMatch"
    ALTER COLUMN "matchedSkills" SET NOT NULL,
    ALTER COLUMN "missingSkills" SET NOT NULL;
