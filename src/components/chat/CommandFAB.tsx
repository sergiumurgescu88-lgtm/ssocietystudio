import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandChatDrawer } from "./CommandChatDrawer";

export function CommandFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open && (
        <Button
          onClick={() => setOpen(true)}
          size="lg"
          className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full shadow-lg glow-sm hover:glow-active p-0 animate-scale-in"
          aria-label="Command Chat"
        >
          <MessageSquare className="h-6 w-6" />
        </Button>
      )}
      <CommandChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
