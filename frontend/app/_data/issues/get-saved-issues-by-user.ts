"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Issue } from "@prisma/client";

export interface SavedIssue extends Issue {
  savedId: string;
  savedAt: Date;
}

export async function getSavedIssues(): Promise<SavedIssue[]> {
  const { userId } = await auth();
  if (!userId) return [];

  const issuesSaved = await db.savedIssue.findMany({
    where: { userId },
    include: { issue: true },
    orderBy: { createdAt: "desc" },
  });

  const issues: SavedIssue[] = issuesSaved.map((issue) => {
    return { ...issue.issue, savedId: issue.id, savedAt: issue.createdAt };
  });

  return issues;
}

export async function getCountSavedIssues(): Promise<number> {
  const { userId } = await auth();
  if (!userId) return 0;

  const count = await db.savedIssue.count({
    where: { userId },
  });

  return count;
}
