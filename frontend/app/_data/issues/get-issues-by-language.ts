"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { Prisma, Issue } from "@prisma/client";

export const getIssuesByLanguage = async (
  languagesToFilter: string[],
  page: number = 1
) => {
  const { userId } = await auth();

  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const languageCondition =
    languagesToFilter.length > 0
      ? Prisma.sql`i.language IN (${Prisma.join(languagesToFilter)})`
      : Prisma.sql`TRUE`;

  const notSavedCondition = userId
    ? Prisma.sql`
        AND NOT EXISTS (
          SELECT 1 FROM "saved_issue" si
          WHERE si."issueId" = i.id AND si."userId" = ${userId}
        )
      `
    : Prisma.empty;

  try {
    const issues = await db.$queryRaw<Issue[]>(Prisma.sql`
      SELECT
        i.id,
        i.node_id,
        i.url,
        i.repository_url,
        i.title,
        i.user_login,
        i.state,
        i.project_name,
        i.language,
        i.labels,
        i.created_at,
        i.updated_at,
        i.body,
        i.stargazers_count,
        i.forks_count,
        i.open_issues_count
      FROM
        issues AS i
      WHERE
        ${languageCondition}
        AND i.state = 'open'
        ${notSavedCondition}
      ORDER BY
         i.created_at DESC
      LIMIT ${pageSize}
      OFFSET ${offset};
    `);

    return issues;
  } catch (error) {
    console.error("Erro ao filtrar issues por linguagem:", error);
    return [];
  }
};
