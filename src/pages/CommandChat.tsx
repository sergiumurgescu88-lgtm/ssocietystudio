import { PageHeader } from "@/components/PageHeader";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { CommandChatDrawer } from "@/components/chat/CommandChatDrawer";

export default function CommandChat() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <PageHeader title="Command Chat" description="Interfață directă de comandă AI." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="mb-4 text-sm text-muted-foreground">
          Folosește butonul din colțul dreapta-jos sau deschide chat-ul aici.
        </p>
        <Button onClick={() => setOpen(true)} className="gap-2">
          <MessageSquare className="h-4 w-4" /> Deschide Command Chat
        </Button>
      </div>
      <CommandChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
