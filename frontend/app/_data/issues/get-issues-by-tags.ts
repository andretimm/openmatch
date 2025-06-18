"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma, issues } from "@prisma/client";

export const getIssuesByTags = async (
  languagesToFilter: string[],
  page: number = 1
) => {
  const pageSize = 50; 
  const offset = (page - 1) * pageSize;
  const languageCondition =
    languagesToFilter.length > 0
      ? Prisma.sql`i.language IN (${Prisma.join(languagesToFilter)})`
      : Prisma.sql`TRUE`;

  try {
    const issues = await db.$queryRaw<issues[]>(Prisma.sql`
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
        i.body
      FROM
        issues AS i
      WHERE
        ${languageCondition}
        AND i.state = 'open'
      ORDER BY
        i.id ASC
      LIMIT ${pageSize}
      OFFSET ${offset};
    `);

    return issues;
  } catch (error) {
    console.error("Erro ao filtrar issues por linguagem:", error);
    throw error;
  }
};
