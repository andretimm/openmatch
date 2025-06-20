-- CreateTable
CREATE TABLE "crawler_state" (
    "id" INTEGER NOT NULL,
    "last_run_timestamp" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "crawler_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" BIGINT NOT NULL,
    "node_id" TEXT NOT NULL,
    "url" TEXT,
    "repository_url" TEXT,
    "title" TEXT,
    "user_login" TEXT,
    "state" TEXT,
    "project_name" TEXT,
    "language" TEXT,
    "labels" JSONB,
    "created_at" TIMESTAMPTZ(6),
    "updated_at" TIMESTAMPTZ(6),
    "body" TEXT,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_issue" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "issueId" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_issue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "issues_node_id_key" ON "issues"("node_id");

-- AddForeignKey
ALTER TABLE "saved_issue" ADD CONSTRAINT "saved_issue_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
