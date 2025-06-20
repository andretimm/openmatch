"use server";
import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function removeSavedIssue(issueId: bigint) {
  const { userId } = await auth();
  if (!userId) throw new Error("Não autenticado");

  await db.savedIssue.deleteMany({
    where: { issueId, userId },
  });
}
