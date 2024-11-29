import { Copy, Link, Star, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClipboardEntryProps {
  content: string;
  type: "text" | "link" | "image";
  timestamp: string;
  tags?: string[];
  isFavorite?: boolean;
  onCopy?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
}

export function ClipboardEntry({
  content,
  type,
  timestamp,
  tags = [],
  isFavorite = false,
  onCopy,
  onDelete,
  onToggleFavorite,
}: ClipboardEntryProps) {
  return (
    <div className="group relative rounded-lg border bg-card p-4 transition-all hover:shadow-md animate-fade-up">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {type === "link" && <Link className="h-4 w-4 text-muted-foreground" />}
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <div className="flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={onCopy}
            className="rounded-full p-1 hover:bg-secondary"
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={onToggleFavorite}
            className={cn(
              "rounded-full p-1 hover:bg-secondary",
              isFavorite && "text-yellow-400"
            )}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full p-1 hover:bg-secondary"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
      <div className="mb-3 line-clamp-3 text-sm">{content}</div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}