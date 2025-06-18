"use server";

import { db } from "@/app/_lib/prisma";
import { Prisma, issues } from "@prisma/client";

export const getIssuesByTags = async (
  namesToFilter: string[],
  page: number = 1
) => {
  const pageSize = 50; // Define o número de registros por página
  const offset = (page - 1) * pageSize; // Calcula o OFFSET
  const conditions = namesToFilter.map(
    (name) =>
      Prisma.sql`
      EXISTS (
        SELECT 1
        FROM jsonb_array_elements(i.labels) AS label_obj
        WHERE (label_obj->>'name') = ${name}
      )
    `
  );

  const whereClause =
    conditions.length > 0 ? Prisma.join(conditions, " OR ") : Prisma.sql`TRUE`;

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
        ${whereClause}
        AND i.state = 'open'
      ORDER BY
        i.id ASC -- É crucial ordenar para paginação consistente
      LIMIT ${pageSize}
      OFFSET ${offset};
    `);

    return issues;
  } catch (error) {
    console.error("Erro ao filtrar issues com query raw e paginação:", error);
    throw error;
  }
};
