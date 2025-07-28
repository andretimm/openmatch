"use server";

import { db } from "@/app/_lib/prisma";
import { auth } from "@clerk/nextjs/server";

export const getIssuesByLanguage = async (
  languagesToFilter: string[],
  page: number = 1,
  orderBy: "created_at" | "stargazers_count" | "forks_count" = "created_at"
) => {
  const { userId } = await auth();
  const pageSize = 50;
  const offset = (page - 1) * pageSize;
  const allowedFields = ["created_at", "stargazers_count", "forks_count"];
  const orderField = allowedFields.includes(orderBy) ? orderBy : "created_at";

  const languageFilter =
    languagesToFilter.length > 0 ? { language: { in: languagesToFilter } } : {};

  let notSavedFilter = {};
  if (userId) {
    notSavedFilter = {
      NOT: {
        SavedIssue: {
          some: {
            userId: userId,
          },
        },
      },
    };
  }

  console.log("getIssuesByLanguage", {
    languagesToFilter,
    page,
    orderBy,
    userId,
  });

  try {
    const issues = await db.issue.findMany({
      where: {
        state: "open",
        ...languageFilter,
        ...notSavedFilter,
      },
      orderBy: {
        [orderField]: "desc",
      },
      skip: offset,
      take: pageSize,
    });

    return issues;
  } catch (error) {
    console.error("Erro ao filtrar issues por linguagem:", error);
    return [];
  }
};
