import { Badge } from "@/app/_components/ui/badge";
import { Card, CardHeader } from "@/app/_components/ui/card";
import { languages } from "@/app/_constants/languages";
import { Issue } from "@prisma/client";
import { motion, useAnimation } from "framer-motion";
import { Clock, ExternalLink, GitBranch, User } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";
interface IssueCardProps {
  issue: Issue;
  onSave: () => void;
  onSkip: () => void;
  swipeDirection?: "left" | "right" | null;
  isAuthenticated: boolean;
}

const SWIPE_THRESHOLD = 120;

const IssueCard = ({
  issue,
  onSave,
  onSkip,
  swipeDirection,
  isAuthenticated = false,
}: IssueCardProps) => {
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

  const controls = useAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const lang = languages.find(
    (l) => l.key.toLowerCase() === issue.language?.toLowerCase()
  );

  const handleDragEnd = (
    _: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number } }
  ) => {
    if (info.offset.x > SWIPE_THRESHOLD) {
      controls.start({
        x: 400,
        y: 100,
        rotate: 20,
        opacity: 0,
        transition: { duration: 0.4 },
      });
      if (isAuthenticated) {
        onSave();
        return;
      }
      onSkip();
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      controls.start({
        x: -400,
        y: 100,
        rotate: -20,
        opacity: 0,
        transition: { duration: 0.4 },
      });
      onSkip();
    } else {
      controls.start({ x: 0, y: 0, rotate: 0, opacity: 1 });
    }
  };

  useEffect(() => {
    if (swipeDirection === "left") {
      controls.start({
        x: -400,
        y: 100,
        rotate: -20,
        opacity: 0,
        transition: { duration: 0.3 },
      });
    } else if (swipeDirection === "right") {
      controls.start({
        x: 400,
        y: 100,
        rotate: 20,
        opacity: 0,
        transition: { duration: 0.3 },
      });
    } else {
      controls.start({
        x: 0,
        y: 0,
        rotate: 0,
        opacity: 1,
        transition: { duration: 0 },
      });
    }
  }, [swipeDirection, controls]);

  const changeIssueButtons = () => {
    if (!isAuthenticated) {
      return (
        <button
          onClick={onSkip}
          className="flex-1 cursor-pointer text-white flex items-center justify-center bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg py-3 px-4 "
          aria-label="Proxima"
        >
          {/* Ícone X */}
          Proxima
        </button>
      );
    } else {
      return (
        <>
          <button
            onClick={onSkip}
            className="flex-1 cursor-pointer flex items-center justify-center bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg py-3 px-4 transition-all duration-200 hover:scale-105 group"
            aria-label="Pular"
          >
            {/* Ícone X */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 stroke-red-400 group-hover:fill-red-400 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <button
            onClick={onSave}
            className="flex-1 cursor-pointer flex items-center justify-center bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg py-3 px-4 transition-all duration-200 hover:scale-105 group"
            aria-label="Salvar"
          >
            {/* Ícone Coração */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 stroke-green-400 group-hover:fill-green-400 transition-all"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 21C12 21 4 13.5 4 8.75C4 6.12665 6.12665 4 8.75 4C10.2056 4 11.5912 4.80964 12.3431 6.01562C13.0949 4.80964 14.4805 4 15.9361 4C18.5595 4 20.6861 6.12665 20.6861 8.75C20.6861 13.5 12 21 12 21Z"
              />
            </svg>
          </button>
        </>
      );
    }
  };

  return (
    <motion.div
      ref={cardRef}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{ touchAction: "pan-y", willChange: "transform, opacity" }}
    >
      <Card className="w-full max-w-xl mx-auto card-shadow gradient-border animate-scale-in h-[480px] flex flex-col bg-gray-900 border-gray-800">
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
                {lang && (
                  <>
                    <Image
                      src={`/${lang.icon}`}
                      alt={lang.name}
                      className="w-4 h-4 ml-2"
                      width={16}
                      height={16}
                    />

                    <span> {lang.name}</span>
                  </>
                )}
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
          </div>
        </CardHeader>

        <div className="flex-1 px-6 pb-2 overflow-auto">
          <p className="text-gray-300 text-sm leading-relaxed">
            {truncateText(issue.body || "Sem descrição disponível", 400)}
          </p>
        </div>

        <div className="px-6 pt-2">
          <div className="flex flex-wrap gap-2 mb-4">
            {Array.isArray(issue.labels)
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                issue.labels.slice(0, 3).map((label: any) => (
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

          <div className="flex gap-3">{changeIssueButtons()}</div>
        </div>
      </Card>
    </motion.div>
  );
};

export default IssueCard;
