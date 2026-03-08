import { useState, useRef, useEffect } from "react";
import { Send, Mic, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QUICK_COMMANDS } from "@/lib/chat-service";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
}

export function ChatInput({ onSend, disabled, showSuggestions }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [value]);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      {showSuggestions && (
        <div className="flex flex-wrap gap-1.5 px-1">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => onSend(cmd.prompt)}
              disabled={disabled}
              className="rounded-full border border-border bg-secondary/50 px-3 py-1 text-xs text-foreground transition-colors hover:bg-secondary hover:border-primary/30 disabled:opacity-50"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-xl border border-border bg-card p-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          disabled
          title="Atașament (coming soon)"
        >
          <Paperclip className="h-4 w-4" />
        </Button>

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Scrie o comandă..."
          disabled={disabled}
          rows={1}
          className={cn(
            "flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground",
            "focus:outline-none disabled:opacity-50",
            "max-h-[150px] min-h-[36px] py-2"
          )}
        />

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          disabled
          title="Voce (coming soon)"
        >
          <Mic className="h-4 w-4" />
        </Button>

        <Button
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={handleSubmit}
          disabled={disabled || !value.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
