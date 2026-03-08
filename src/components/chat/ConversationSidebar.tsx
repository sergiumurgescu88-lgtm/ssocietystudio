import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/lib/chat-service";
import { format } from "date-fns";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
}: ConversationSidebarProps) {
  return (
    <div className="flex h-full w-56 flex-col border-r border-border bg-card/50">
      <div className="flex items-center justify-between border-b border-border p-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Istoric
        </span>
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNew}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-0.5 p-2">
          {conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-xs cursor-pointer transition-colors",
                activeId === c.id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-secondary"
              )}
              onClick={() => onSelect(c.id)}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{c.title}</p>
                <p className="text-[10px] text-muted-foreground">
                  {format(new Date(c.updated_at), "dd MMM, HH:mm")}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 shrink-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(c.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-muted-foreground">
              Nicio conversație încă.
            </p>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
