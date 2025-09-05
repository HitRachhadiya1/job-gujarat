-- Create SavedJob table
CREATE TABLE IF NOT EXISTS "SavedJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "jobSeekerId" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SavedJob_jobSeekerId_fkey" FOREIGN KEY ("jobSeekerId") REFERENCES "JobSeeker" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SavedJob_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "JobPosting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create unique index to prevent duplicate saves
CREATE UNIQUE INDEX IF NOT EXISTS "SavedJob_jobSeekerId_jobId_key" ON "SavedJob"("jobSeekerId", "jobId");
