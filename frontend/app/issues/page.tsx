"use client";

import { Button } from "@/app/_components/ui/button";
import { useUser } from "@clerk/nextjs";
import { Issue } from "@prisma/client";
import { motion } from "framer-motion";
import { ArrowLeft, BookmarkCheck, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { redirect, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { saveIssue } from "../_actions/issues/save-issue";
import ClerkAuthArea from "../_components/login-area";
import { Language, languages } from "../_constants/languages";
import { getIssuesByLanguage } from "../_data/issues/get-issues-by-language";
import { getCountSavedIssues } from "../_data/issues/get-saved-issues-by-user";
import IssueCard from "./components/IssueCard";
import Link from "next/link";
import { Skeleton } from "../_components/ui/skeleton";
import { useIsMobile } from "../_hooks/use-mobile";

function Repos() {
  const { isSignedIn } = useUser();
  const [reloadDisabled, setReloadDisabled] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<Issue>();
  const [langs, setLangs] = useState<Language[]>([]);

  const [issuesList, setIssuesList] = useState<Issue[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [countSavedIssues, setCountSavedIssues] = useState<number>(0);
  const [reloadCount, setReloadCount] = useState(0);
  const fetchIdRef = useRef(0);
  const searchParams = useSearchParams();
   const isMobile = useIsMobile();
  
  const tagsInArray = searchParams.getAll("tag");

  const handleReload = () => {
    if (reloadDisabled) return;
    setReloadDisabled(true);
    setCurrentIndex(0);
    setIssuesList([]);
    setHasMore(true);
    setCurrentPage(1);
    setReloadCount((prev) => prev + 1);
    setTimeout(() => setReloadDisabled(false), 5000);
  };

  useEffect(() => {
    let isActive = true;
    const fetchId = ++fetchIdRef.current;

    const fetchIssues = async (tags: string[], page: number) => {
      setIsLoading(true);
      const newIssues = await getIssuesByLanguage(tags, page);
      if (!isActive || fetchId !== fetchIdRef.current) return;
      if (newIssues.length === 0) {
        setHasMore(false);
      } else {
        setIssuesList((prev) => [...prev, ...newIssues]);
      }
      setIsLoading(false);
    };

    setLangs(
      tagsInArray
        .map((tag) => languages.find((lang) => lang.key === tag))
        .filter(Boolean) as Language[]
    );

    fetchIssues(tagsInArray, currentPage);

    return () => {
      isActive = false;
    };
  }, [tagsInArray.join(","), currentPage, reloadCount]);

  useEffect(() => {
    const fetchCount = async () => {
      setIsLoadingCount(true);
      const count = await getCountSavedIssues();
      setCountSavedIssues(count);
      setIsLoadingCount(false);
    };
    fetchCount();
  }, []);

  useEffect(() => {
    setCurrentIssue(issuesList[currentIndex]);
  }, [issuesList, currentIndex]);

  const handleNext = () => {
    if (currentIndex + 1 < issuesList.length) {
      setCurrentIndex(currentIndex + 1);
      if (
        hasMore &&
        issuesList.length - (currentIndex + 1) <= 5 &&
        !isLoading
      ) {
        setCurrentPage((prev) => prev + 1);
      }
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = () => {
    setSwipeDirection("left");
    setTimeout(() => {
      setSwipeDirection(null);
      handleNext();
    }, 400);
  };

  const handleSave = () => {
    if (!isSignedIn) return;
    if (!currentIssue) return;
    setSwipeDirection("right");
    setTimeout(async () => {
      setSwipeDirection(null);
      handleNext();
      await saveIssue(currentIssue?.id);
      toast(`Issues ${currentIssue?.title} salva!`);
      setCountSavedIssues((prev) => prev + 1);
    }, 400);
  };

  const handleBackToHome = () => {
    redirect("/");
  };

  const handleGoToSavedIssues = () => {
    window.location.href = "/issues/saved";
  };

  const noIssuesMessage = (
    <div className="text-center text-white flex flex-col items-center justify-center h-[420px]">
      <p className="mb-2">Não há mais issues no momento.</p>
      <span className="text-4xl mb-4">🎉</span>
      <Button
        onClick={handleReload}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-semibold transition border border-white/20"
      >
        <RefreshCcw className="h-5 w-5" />
        Refazer busca
      </Button>
    </div>
  );

  return (
    <div className="relative ">
      <div className="w-full px-6 py-4 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-slate-700"
              onClick={handleBackToHome}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>

            <div className="text-center">
              <h2 className="text-xl font-semibold flex gap-2">
                {!isMobile && langs.map((l) => (
                  <span key={l.key}>
                    <Image src={l.icon} alt={l.name} width={24} height={24} />
                  </span>
                ))}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {isLoadingCount ? (
              <Skeleton className="w-24 h-9 bg-slate-700/50 rounded-lg" />
            ) : (
              <div
                className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-blue-400"
                onClick={handleGoToSavedIssues}
              >
                <BookmarkCheck className="h-5 w-5" />
                <span className="text-sm">{countSavedIssues} salvas</span>
              </div>
            )}

            <ClerkAuthArea />
          </div>
        </div>
      </div>

      <div className="px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col justify-center">
              {isLoading ? (
                <div className="relative w-full max-w-2xl h-[420px] mx-auto flex flex-col gap-4">
                  <Skeleton className="w-full h-full rounded-xl bg-slate-700/50" />
                </div>
              ) : issuesList.length === 0 ? (
                noIssuesMessage
              ) : currentIndex < issuesList.length ? (
                <div className="relative w-full max-w-2xl h-[420px] mx-auto">
                  {issuesList[currentIndex + 1] && (
                    <motion.div
                      className="absolute inset-0 z-0 pointer-events-none"
                      initial={{ scale: 0.96, opacity: 0.7 }}
                      animate={{ scale: 0.96, opacity: 0.7 }}
                    >
                      <IssueCard
                        issue={issuesList[currentIndex + 1]}
                        onSave={() => {}}
                        onSkip={() => {}}
                        isAuthenticated={isSignedIn ?? false}
                      />
                    </motion.div>
                  )}

                  <div className="absolute inset-0 z-10">
                    <IssueCard
                      issue={issuesList[currentIndex]}
                      onSave={handleSave}
                      onSkip={handleSkip}
                      swipeDirection={swipeDirection}
                      isAuthenticated={isSignedIn ?? false}
                    />
                  </div>
                </div>
              ) : (
                noIssuesMessage
              )}

              <div className="max-w-6xl mx-auto px-6 py-8 ">
                <div className="flex justify-center mt-14">
                  <Link
                    href="/contribute"
                    target="_blank"
                    className="flex items-center gap-2 text-gray-400 cursor-pointer hover:text-blue-400 font-semibold text-base transition"
                  >
                    <span className="text-sm md:text-base">Clique aqui para descobrir como contribuir</span>
                    <svg
                      className="w-6 h-6 animate-bounce rotate-90"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">
                  💡 Dicas
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  {isSignedIn ? (
                    <>
                      <p>• Use &quot;Salvar&quot; para issues interessantes</p>
                      <p>• &quot;Pular&quot; para próxima issue</p>
                      <p>• Clique no link externo para ver no GitHub</p>
                    </>
                  ) : (
                    <>
                      <p>
                        Para salvar issues e acompanhar suas favoritas, faça
                        login com seu GitHub.
                      </p>
                      <div className="mt-4">
                        <ClerkAuthArea />
                      </div>
                      <p className="mt-4">
                        Você só pode salvar issues após fazer login. Use a seta
                        para pular para a próxima issue.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ReposPage = () => {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Repos></Repos>
    </Suspense>
  );
};

export default ReposPage;
