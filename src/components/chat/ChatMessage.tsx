import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { ThumbsUp, ThumbsDown, Copy, Check, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { updateMessageFeedback } from "@/lib/chat-service";
import { toast } from "sonner";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant";
  content: string;
  feedback: string | null;
  isStreaming?: boolean;
}

export function ChatMessageBubble({ id, role, content, feedback, isStreaming }: ChatMessageProps) {
  const [currentFeedback, setCurrentFeedback] = useState(feedback);
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleFeedback = async (type: "like" | "dislike") => {
    const newFeedback = currentFeedback === type ? null : type;
    setCurrentFeedback(newFeedback);
    try {
      await updateMessageFeedback(id, newFeedback || "");
    } catch {
      toast.error("Eroare la salvarea feedback-ului");
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("flex gap-3 animate-fade-in", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      <div className={cn("flex max-w-[80%] flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-secondary text-foreground rounded-bl-md"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm prose-invert max-w-none [&_pre]:bg-background/50 [&_pre]:rounded-lg [&_pre]:p-3 [&_code]:text-xs [&_code]:font-mono">
              <ReactMarkdown>{content}</ReactMarkdown>
              {isStreaming && (
                <span className="inline-block h-4 w-1.5 animate-pulse bg-foreground/70 ml-0.5 align-middle" />
              )}
            </div>
          )}
        </div>

        {!isUser && !isStreaming && content && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFeedback("like")}
            >
              <ThumbsUp
                className={cn("h-3 w-3", currentFeedback === "like" && "fill-primary text-primary")}
              />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => handleFeedback("dislike")}
            >
              <ThumbsDown
                className={cn("h-3 w-3", currentFeedback === "dislike" && "fill-destructive text-destructive")}
              />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCopy}>
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
