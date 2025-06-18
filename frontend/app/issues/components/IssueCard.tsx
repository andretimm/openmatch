import { Badge } from "@/app/_components/ui/badge";
import { Card, CardHeader } from "@/app/_components/ui/card";
import { issues } from "@prisma/client";
import { Clock, ExternalLink, GitBranch, Star, User } from "lucide-react";

interface IssueCardProps {
  issue: issues;
  onSave: () => void;
  onSkip: () => void;
}

const IssueCard = ({ issue, onSave, onSkip }: IssueCardProps) => {
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return "Sem data disponível";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "há 1 dia";
    if (diffDays < 7) return `há ${diffDays} dias`;
    if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} semanas`;
    return `há ${Math.floor(diffDays / 30)} meses`;
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };
  return (
    <Card className="w-full max-w-md mx-auto card-shadow gradient-border animate-scale-in h-[420px] flex flex-col bg-gray-900 border-gray-800">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-2 leading-tight">
              {truncateText(issue.title || "Sem título disponível", 50)}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
              <User className="h-4 w-4" />
              <span>{issue.user_login}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatDate(issue.created_at)}</span>
            </div>
          </div>
          <a
            href={issue.url || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-blue-400 transition-colors"
          >
            <ExternalLink className="h-5 w-5" />
          </a>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-300">
          <div className="flex items-center gap-1">
            <GitBranch className="h-4 w-4" />
            <span>{issue.project_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
          </div>
        </div>
      </CardHeader>

      {/* Descrição ocupa o espaço disponível */}
      <div className="flex-1 px-6 pb-2 overflow-auto">
        <p className="text-gray-300 text-sm leading-relaxed">
          {truncateText(issue.body || "Sem descrição disponível", 200)}
        </p>
      </div>

      {/* Footer fixo com tags e botões */}
      <div className="px-6 pt-2">
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(issue.labels)
            ? issue.labels.slice(0, 3).map((label: any) => (
                <Badge
                  key={label.name}
                  variant="secondary"
                  className="text-xs"
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
              className="text-xs  bg-zinc-800 text-gray-200 border border-zinc-700"
            >
              +{issue.labels.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg py-3 px-4 font-medium transition-all duration-200 hover:scale-105"
          >
            Pular
          </button>
          <button
            onClick={onSave}
            className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 rounded-lg py-3 px-4 font-medium transition-all duration-200 hover:scale-105"
          >
            Salvar
          </button>
        </div>
      </div>
    </Card>
  );
};

export default IssueCard;
