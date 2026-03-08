import { useState, useEffect, useRef, useCallback } from "react";
import { X, Bot, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  fetchConversations,
  createConversation,
  deleteConversation,
  fetchMessages,
  saveMessage,
  streamAIResponse,
  type Conversation,
  type ChatMessage,
} from "@/lib/chat-service";
import { ChatMessageBubble } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ConversationSidebar } from "./ConversationSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface CommandChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CommandChatDrawer({ open, onClose }: CommandChatDrawerProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tokenCount = useRef(0);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 50);
  }, []);

  // Load conversations
  useEffect(() => {
    if (!user || !open) return;
    fetchConversations(user.id).then(setConversations).catch(console.error);
  }, [user, open]);

  // Load messages when conversation changes
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }
    fetchMessages(activeConvId).then((msgs) => {
      setMessages(msgs);
      scrollToBottom();
    }).catch(console.error);
  }, [activeConvId, scrollToBottom]);

  const handleNewConversation = async () => {
    if (!user) return;
    try {
      const conv = await createConversation(user.id);
      setConversations((prev) => [conv, ...prev]);
      setActiveConvId(conv.id);
      setMessages([]);
    } catch {
      toast.error("Eroare la crearea conversației");
    }
  };

  const handleDeleteConversation = async (id: string) => {
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvId === id) {
        setActiveConvId(null);
        setMessages([]);
      }
    } catch {
      toast.error("Eroare la ștergerea conversației");
    }
  };

  const handleSend = async (text: string) => {
    if (!user || isStreaming) return;

    // Handle /clear command
    if (text.trim() === "/clear") {
      if (activeConvId) {
        await handleDeleteConversation(activeConvId);
      }
      toast.success("Context șters.");
      return;
    }

    // Create conversation if none active
    let convId = activeConvId;
    if (!convId) {
      const conv = await createConversation(user.id, text.slice(0, 60));
      setConversations((prev) => [conv, ...prev]);
      convId = conv.id;
      setActiveConvId(convId);
    }

    // Save user message
    const userMsg = await saveMessage(convId, user.id, "user", text);
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    // Stream AI response
    setIsStreaming(true);
    setStreamingContent("");
    let fullContent = "";

    const historyForAI = [...messages, userMsg].map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamAIResponse(
      historyForAI,
      (chunk) => {
        fullContent += chunk;
        tokenCount.current += 1;
        setStreamingContent(fullContent);
        scrollToBottom();
      },
      async () => {
        setIsStreaming(false);
        setStreamingContent("");
        if (fullContent) {
          const aiMsg = await saveMessage(convId!, user.id, "assistant", fullContent);
          setMessages((prev) => [...prev, aiMsg]);
        }
        scrollToBottom();
      },
      (err) => {
        setIsStreaming(false);
        setStreamingContent("");
        toast.error(err);
      }
    );
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end sm:items-stretch sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Chat window */}
      <div className="relative z-10 flex h-[85vh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl animate-slide-in-bottom sm:h-[600px] sm:w-[800px] sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Command Chat</h3>
              <div className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-muted-foreground">
                  {isStreaming ? "Se gândește..." : "Online"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={() => setShowSidebar(!showSidebar)}
            >
              Istoric
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          {showSidebar && !isMobile && (
            <ConversationSidebar
              conversations={conversations}
              activeId={activeConvId}
              onSelect={setActiveConvId}
              onNew={handleNewConversation}
              onDelete={handleDeleteConversation}
            />
          )}

          {/* Chat area */}
          <div className="flex flex-1 flex-col overflow-hidden">
            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
              {messages.length === 0 && !streamingContent && (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                    <Zap className="h-7 w-7 text-primary" />
                  </div>
                  <h4 className="text-sm font-semibold text-foreground">Bun venit în Command Chat</h4>
                  <p className="max-w-xs text-xs text-muted-foreground">
                    Întreabă orice sau folosește comenzile rapide de mai jos.
                  </p>
                </div>
              )}

              <div className="space-y-4">
                {messages.map((msg) => (
                  <ChatMessageBubble
                    key={msg.id}
                    id={msg.id}
                    role={msg.role as "user" | "assistant"}
                    content={msg.content}
                    feedback={msg.feedback}
                  />
                ))}

                {isStreaming && streamingContent && (
                  <ChatMessageBubble
                    id="streaming"
                    role="assistant"
                    content={streamingContent}
                    feedback={null}
                    isStreaming
                  />
                )}

                {isStreaming && !streamingContent && (
                  <div className="flex items-center gap-2 text-muted-foreground animate-pulse">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-xs">Se gândește...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-border p-3">
              <ChatInput
                onSend={handleSend}
                disabled={isStreaming}
                showSuggestions={messages.length === 0}
              />
              <div className="mt-1.5 flex items-center justify-between px-1">
                <span className="text-[10px] text-muted-foreground">
                  Shift+Enter pentru linie nouă · /clear pentru reset
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  ~{tokenCount.current} tokens
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
