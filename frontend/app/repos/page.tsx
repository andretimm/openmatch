"use client";

import { Button } from "@/app/_components/ui/button";
import { ArrowLeft, BookmarkCheck, Settings, User } from "lucide-react";
import Image from "next/image";
import IssueCard from "./components/IssueCard";
import { useEffect, useState } from "react";
import { issues } from "@prisma/client";
import { getIssuesByTags } from "../_data/issues/get-issues-by-tags";
import { Language, languages } from "../_constants/languages";
import React from "react";
import { toast } from "sonner";

interface ReposPageProps {
  params: { tag?: string | string[] };
}

const ReposPage = ({ params }: ReposPageProps) => {
  // const [loading, setLoading] = useState(true);
  const [currentIssue, setCurrentIssue] = useState<issues>();
  // const [issues, setIssues] = useState<issues[]>([]);
  const [langs, setLangs] = useState<Language[]>([]);

  const [issuesList, setIssuesList] = useState<issues[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { tag } = params;

  useEffect(() => {
    const fetchIssues = async (tags: string[], page: number) => {
      setIsLoading(true);
      const newIssues = await getIssuesByTags(tags, page);
      if (newIssues.length === 0) {
        setHasMore(false);
      } else {
        setIssuesList((prev) => [...prev, ...newIssues]);
      }
      setIsLoading(false);
    };

    const tagsInArray = Array.isArray(tag) ? tag : tag ? [tag] : [];
    setLangs(
      tagsInArray
        .map((tag) => languages.find((lang) => lang.key === tag))
        .filter(Boolean) as Language[]
    );
    fetchIssues(tagsInArray, currentPage);
    // const lang: Language[] = tagsInArray.map((tag) => {
    //   const currentLang = languages.find((lang) => lang.key === tag);
    //   return currentLang;
    // });
  }, [tag, currentPage]);

  useEffect(() => {
    setCurrentIssue(issuesList[currentIndex]);
  }, [issuesList, currentIndex]);

  const handleNext = () => {
    if (currentIndex + 1 < issuesList.length) {
      setCurrentIndex(currentIndex + 1);
      // Se estiver perto do fim, busca mais
      if (
        hasMore &&
        issuesList.length - (currentIndex + 1) <= 5 &&
        !isLoading
      ) {
        setCurrentPage((prev) => prev + 1);
      }
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  const handleSave = () => {
    // const currentIssue = issues[currentIndex];
    // setSavedIssues(prev => [...prev, currentIssue]);

    toast("Issue salva!");

    handleNext();
  };

  // const tags = tag;
  // const tagsArray = Array.isArray(tags) ? tags : tags ? [tags] : [];

  // const currentIssue = {
  //   id: 1,
  //   title: `Bug: Memory leak in javascript application when processing large datasets`,
  //   body: `We've identified a memory leak that occurs when processing datasets larger than 10MB. The application gradually consumes more memory and eventually crashes. This issue affects performance significantly and needs immediate attention. Steps to reproduce: 1. Load a dataset > 10MB, 2. Process the data multiple times, 3. Monitor memory usage`,
  //   html_url: "https://github.com/example/repo1/issues/1",
  //   labels: [
  //     { name: "bug", color: "d73a49" },
  //     { name: "high priority", color: "ff6b6b" },
  //     { name: "help wanted", color: "008672" },
  //   ],
  //   repository: {
  //     name: "awesome-project",
  //     full_name: "company/awesome-project",
  //     stargazers_count: 2847,
  //     language: "JavaScript",
  //   },
  //   user: {
  //     login: "developer123",
  //     avatar_url: "https://github.com/github.png",
  //   },
  //   created_at: "2024-06-10T10:30:00Z",
  // };

  //pegar as tags e converter em um array com o svg do icone
  // const lang: Language[] = tagsArray.map((tag) => {
  //   const currentLang = languages.find((lang) => lang.key === tag);
  //   return currentLang;
  // });

  return (
    <div className="relative">
      {/* Header otimizado */}
      <div className="w-full px-6 py-4 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>

            <div className="text-center">
              <h2 className="text-xl font-semibold  flex gap-2">
                {/* show all lang icons */}
                {/* TODO: interface */}
                {langs.map((l) => (
                  <span key={l.key}>
                    <Image src={l.icon} alt={l.name} width={24} height={24} />
                  </span>
                ))}
              </h2>
              <p className="text-sm text-gray-400">
                {/* Issue {currentIndex + 1} de {issues.length} */}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <BookmarkCheck className="h-5 w-5" />
              <span className="text-sm">savedIssues.length salvas</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white"
            >
              <User className="h-4 w-4 mr-2" />
              Login
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-white"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Layout principal otimizado para telas grandes */}
      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Coluna principal - Issue Card */}
            <div className="lg:col-span-2 flex justify-center">
              {currentIssue ? (
                <div className="w-full max-w-2xl">
                  <IssueCard
                    issue={currentIssue}
                    onSave={handleSave}
                    onSkip={handleSkip}
                  />
                </div>
              ) : (
                <div className="text-center text-white">
                  <p>Carregando próxima issue...</p>
                </div>
              )}
            </div>

            {/* Sidebar com informações extras */}
            <div className="space-y-6">
              {/* Issues salvas recentes */}
              {/* {savedIssues.length > 0 && (
                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Salvas Recentemente
                  </h3>
                  <div className="space-y-2">
                    {savedIssues
                      .slice(-3)
                      .reverse()
                      .map((issue) => (
                        <div key={issue.id} className="text-sm">
                          <p className="text-gray-300 truncate">
                            {issue.title}
                          </p>
                          <p className="text-gray-500 text-xs">
                            {issue.repository.name}
                          </p>
                        </div>
                      ))}
                  </div>
                  {savedIssues.length > 3 && (
                    <p className="text-xs text-gray-500 mt-2">
                      +{savedIssues.length - 3} outras issues
                    </p>
                  )}
                </div>
              )} */}

              {/* Dicas */}
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💡 Dicas
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Use &quot;Salvar&quot; para issues interessantes</p>
                  <p>• &quot;Pular&quot; para próxima issue</p>
                  <p>• Clique no link externo para ver no GitHub</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReposPage;
