import { format } from "date-fns";
import { Trash2, FileText, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { PLATFORMS, STATUS_OPTIONS, type ContentPost } from "@/lib/content-service";
import { toast } from "sonner";

interface ContentHistoryProps {
  posts: ContentPost[];
  filter: string;
  onFilterChange: (filter: string) => void;
  onDelete: (id: string) => void;
  onSelect: (post: ContentPost) => void;
  isLoading: boolean;
}

export function ContentHistory({
  posts,
  filter,
  onFilterChange,
  onDelete,
  onSelect,
  isLoading,
}: ContentHistoryProps) {
  const platformIcon = (p: string) => PLATFORMS.find((pl) => pl.value === p)?.icon || "📄";
  const statusInfo = (s: string) => STATUS_OPTIONS.find((st) => st.value === s) || STATUS_OPTIONS[0];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Istoric Generări</h3>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="h-8 w-[120px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toate</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[300px]">
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-lg bg-secondary/50" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <p className="py-8 text-center text-xs text-muted-foreground">
            Nicio generare încă.
          </p>
        ) : (
          <div className="space-y-1.5">
            {posts.map((post) => {
              const status = statusInfo(post.status);
              return (
                <div
                  key={post.id}
                  className="group flex items-center gap-3 rounded-lg border border-border bg-card/50 p-3 transition-colors hover:bg-secondary/50 cursor-pointer"
                  onClick={() => onSelect(post)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-base">
                    {platformIcon(post.platform)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-foreground">
                      {post.subject || post.content.slice(0, 50)}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {format(new Date(post.created_at), "dd MMM, HH:mm")}
                      </span>
                      <Badge className={cn("text-[9px] h-4 px-1.5", status.color)}>
                        {status.label}
                      </Badge>
                      {post.is_template && (
                        <Badge variant="outline" className="text-[9px] h-4 px-1.5">
                          Template
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1 opacity-0 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(post.content);
                        toast.success("Conținut copiat!");
                      }}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(post.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
