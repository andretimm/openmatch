-- AlterTable
ALTER TABLE "issues" ADD COLUMN     "description" TEXT,
ADD COLUMN     "forks_count" INTEGER,
ADD COLUMN     "open_issues_count" INTEGER,
ADD COLUMN     "stargazers_count" INTEGER;
