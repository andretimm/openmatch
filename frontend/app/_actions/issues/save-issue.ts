"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function saveIssue(issueId: bigint) {
  const { userId } = await auth();
  if (!userId) return null;

  const alreadySaved = await db.savedIssue.findFirst({
    where: { userId, issueId },
  });
  if (alreadySaved) return alreadySaved;

  return db.savedIssue.create({
    data: {
      userId,
      issueId,
    },
  });
}
