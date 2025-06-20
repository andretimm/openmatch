"use client";
import { removeSavedIssue } from "@/app/_actions/issues/remove-saved-issue";
import ClerkAuthArea from "@/app/_components/login-area";
import { Badge } from "@/app/_components/ui/badge";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog";
import { Input } from "@/app/_components/ui/input";
import { languages } from "@/app/_constants/languages";
import {
  getCountSavedIssues,
  getSavedIssues,
  SavedIssue,
} from "@/app/_data/issues/get-saved-issues-by-user";
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  Eye,
  Filter,
  GitBranch,
  Search,
  Trash2,
  User,
} from "lucide-react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const SavedIssues = () => {
  const [countSavedIssues, setCountSavedIssues] = useState<number>(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterLanguage, setFilterLanguage] = useState("");
  const [savedIssues, setSavedIssues] = useState<SavedIssue[]>([]);

  const [issueToRemove, setIssueToRemove] = useState<SavedIssue | null>(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const fetchCountAndIssues = async () => {
      const count = await getCountSavedIssues();
      const issues = await getSavedIssues();
      setSavedIssues(issues);
      setCountSavedIssues(count);
    };
    fetchCountAndIssues();
  }, []);

  const handleBackToIssues = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      redirect("/");
    }
  };

  const formatDateBR = (date: Date) => {
    const dia = date.getDate().toString().padStart(2, "0");
    const mes = (date.getMonth() + 1).toString().padStart(2, "0");
    const ano = date.getFullYear();
    return `${dia}/${mes}/${ano}`;
  };

  const handleRemoveFromSaved = async (issueId: bigint) => {
    setRemoving(true);
    try {
      // Chame sua função server para remover a issue salva
      await removeSavedIssue(issueId);
      setSavedIssues((prev) => prev.filter((i) => i.id !== issueId));
      setCountSavedIssues((prev) => prev - 1);
      toast(
        "Issue removida dos salvos. Ela continuará disponível na lista geral."
      );
    } catch {
      toast("Erro ao remover issue dos salvos.");
    }
    setRemoving(false);
    setIssueToRemove(null);
  };

  const filteredSavedIssues = savedIssues.filter((issue: SavedIssue) => {
    const matchesSearch =
      (issue.title ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.body ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (issue.project_name ?? "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesLanguage =
      filterLanguage === "" || issue.language === filterLanguage;

    return matchesSearch && matchesLanguage;
  });

  return (
    <div className="relative ">
      <div className="w-full px-6 py-4 border-b border-slate-700/50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="text-gray-400 hover:text-white hover:bg-slate-700"
              onClick={handleBackToIssues}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Voltar
            </Button>

            <div className="text-center">
              <h2 className="text-xl font-semibold  flex gap-2"></h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-400">
              <BookmarkCheck className="h-5 w-5" />
              <span className="text-sm">{countSavedIssues} salvas</span>
            </div>

            <ClerkAuthArea />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Filtros e Busca */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar issues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-700 text-white placeholder-gray-400"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterLanguage}
              onChange={(e) => setFilterLanguage(e.target.value)}
              className="bg-gray-900/50 border border-gray-700 rounded-md px-3 py-2 text-white text-sm"
            >
              <option value="">Todas as linguagens</option>
              {languages.map((lang) => (
                <option key={lang.key} value={lang.key}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Issues */}
        {filteredSavedIssues.length === 0 ? (
          <div className="text-center py-16">
            <Bookmark className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm || filterLanguage
                ? "Nenhuma issue encontrada"
                : "Nenhuma issue salva"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm || filterLanguage
                ? "Tente ajustar os filtros de busca"
                : "Comece explorando issues e salve as que interessam"}
            </p>
            {!searchTerm && !filterLanguage && (
              <Button
                onClick={handleBackToIssues}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full font-semibold transition border border-white/20"
              >
                Explorar Issues
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredSavedIssues.map((issue) => (
              <Card
                key={issue.id}
                className="bg-gray-900/50 border-gray-700 backdrop-blur-sm hover:bg-gray-900/70 transition-all duration-200"
              >
                <CardContent>
                  <div className="flex items-start justify-between mb-2 mt-2">
                    <div className="flex items-center">
                      <Badge
                        variant="outline"
                        className="border-gray-600 text-gray-300 text-xs"
                      >
                        {issue.language}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Visualizar detalhes"
                        className="text-gray-400 hover:text-blue-400"
                        // onClick={() => handleViewIssueDetail(issue)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Remover dos salvos"
                        className="text-gray-400 hover:text-red-400"
                        onClick={() => setIssueToRemove(issue)}
                        disabled={removing && issueToRemove?.id === issue.id}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-3 leading-tight">
                    {issue.title}
                  </h3>

                  <p className="text-gray-300 mb-4 line-clamp-2">
                    {issue.body}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4" />
                      {issue.project_name}
                    </div>

                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {issue.user_login}
                    </div>
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-4 h-4" />
                      Salva em {formatDateBR(issue.savedAt)}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(issue.labels)
                      ? issue.labels
                          .slice(0, 3)
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          .map((label: any, index: number) => (
                            <Badge
                              key={index}
                              className={` text-white text-xs`}
                              style={{
                                backgroundColor: `#${label.color}20`,
                                color: `#${label.color}`,
                              }}
                            >
                              {label.name}
                            </Badge>
                          ))
                      : null}
                    {Array.isArray(issue.labels) && issue.labels.length > 3 && (
                      <Badge
                        variant="secondary"
                        className="border-gray-600 text-gray-400 text-xs"
                      >
                        +{issue.labels.length - 3} mais
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog
          open={!!issueToRemove}
          onOpenChange={(open) => !open && setIssueToRemove(null)}
        >
          <DialogContent className="bg-gray-900 border border-gray-700 text-gray-100">
            <DialogHeader>
              <DialogTitle>Remover issue salva?</DialogTitle>
            </DialogHeader>
            <div className="text-gray-300 text-sm mb-4">
              Ao remover, a issue não ficará mais salva, mas continuará
              aparecendo na lista geral de issues.
            </div>
            <DialogFooter>
              <Button
                variant="ghost"
                onClick={() => setIssueToRemove(null)}
                disabled={removing}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() =>
                  issueToRemove && handleRemoveFromSaved(issueToRemove.id)
                }
                disabled={removing}
              >
                {removing ? "Removendo..." : "Remover"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default SavedIssues;
