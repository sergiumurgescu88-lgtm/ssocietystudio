import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Loader2, Mail, Phone, Building2, Sparkles, Send, MessageSquare, PhoneCall, Calendar, Brain } from "lucide-react";
import { toast } from "sonner";
import { type Contact, type Interaction, fetchInteractions, insertInteraction, getAIInsights, getScoreColor } from "@/lib/crm-service";
import { cn } from "@/lib/utils";

interface ContactDrawerProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons: Record<string, React.ElementType> = {
  email: Mail,
  call: PhoneCall,
  note: MessageSquare,
  meeting: Calendar,
  ai_insight: Brain,
};

const typeColors: Record<string, string> = {
  email: "bg-blue-500/10 text-blue-400",
  call: "bg-emerald-500/10 text-emerald-400",
  note: "bg-amber-500/10 text-amber-400",
  meeting: "bg-purple-500/10 text-purple-400",
  ai_insight: "bg-primary/10 text-primary",
};

export function ContactDrawer({ contact, open, onOpenChange }: ContactDrawerProps) {
  const { user } = useAuth();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (contact && open) {
      setLoading(true);
      fetchInteractions(contact.id)
        .then(setInteractions)
        .catch(() => toast.error("Eroare la încărcarea interacțiunilor"))
        .finally(() => setLoading(false));
    }
  }, [contact, open]);

  const aiInsights = contact ? getAIInsights(contact.id) : [];

  const handleAddNote = async () => {
    if (!contact || !user || !noteText.trim()) return;
    setSending(true);
    try {
      const newInteraction = await insertInteraction({
        contact_id: contact.id,
        user_id: user.id,
        type: "note",
        title: "Notă manuală",
        content: noteText.trim(),
      });
      setInteractions((prev) => [newInteraction, ...prev]);
      setNoteText("");
      toast.success("Notă adăugată!");
    } catch {
      toast.error("Eroare la adăugarea notei");
    }
    setSending(false);
  };

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg">{contact.name}</SheetTitle>
              {contact.position && <p className="text-sm text-muted-foreground">{contact.position}</p>}
            </div>
            <div className="text-right">
              <span className={cn("text-2xl font-bold font-mono", getScoreColor(contact.ai_score))}>{contact.ai_score}</span>
              <p className="text-[10px] text-muted-foreground">AI Score</p>
            </div>
          </div>
        </SheetHeader>

        {/* Contact Info */}
        <div className="space-y-2 text-sm">
          {contact.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-3.5 w-3.5" /> {contact.email}
            </div>
          )}
          {contact.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5" /> {contact.phone}
            </div>
          )}
          {contact.company && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="h-3.5 w-3.5" /> {contact.company}
            </div>
          )}
          <div className="flex gap-2 pt-1">
            <Badge variant="outline">{contact.status}</Badge>
            <Badge variant="secondary">{contact.source}</Badge>
            {contact.is_new && <Badge className="bg-primary/20 text-primary text-[10px]">Nou</Badge>}
          </div>
        </div>

        <Separator className="my-4" />

        {/* AI Insights */}
        <div className="mb-4">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Sparkles className="h-4 w-4 text-primary" /> AI Insights
          </h3>
          <div className="space-y-2">
            {aiInsights.map((insight, i) => (
              <div key={i} className="rounded-lg border border-primary/20 bg-primary/5 p-2.5 text-xs text-foreground">
                {insight}
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-4" />

        {/* Add Note */}
        <div className="mb-4">
          <h3 className="mb-2 text-sm font-semibold text-foreground">Adaugă notă</h3>
          <div className="flex gap-2">
            <Textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Scrie o notă..."
              rows={2}
              className="text-sm"
              aria-label="Notă nouă"
            />
            <Button size="icon" onClick={handleAddNote} disabled={sending || !noteText.trim()} aria-label="Trimite notă">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Timeline */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Istoric Interacțiuni</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
          ) : interactions.length === 0 ? (
            <p className="py-6 text-center text-xs text-muted-foreground">Nicio interacțiune înregistrată.</p>
          ) : (
            <div className="relative space-y-0">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 h-full w-px bg-border" />
              {interactions.map((item) => {
                const Icon = typeIcons[item.type] || MessageSquare;
                return (
                  <div key={item.id} className="relative flex gap-3 pb-4 pl-0">
                    <div className={cn("relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full", typeColors[item.type] || "bg-muted")}>
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      {item.content && <p className="mt-0.5 text-xs text-muted-foreground">{item.content}</p>}
                      <p className="mt-1 text-[10px] font-mono text-muted-foreground/60">
                        {new Date(item.created_at).toLocaleString("ro-RO")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
