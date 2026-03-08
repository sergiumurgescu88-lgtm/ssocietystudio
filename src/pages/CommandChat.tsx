import { PageHeader } from "@/components/PageHeader";
import { MessageSquare } from "lucide-react";

export default function CommandChat() {
  return (
    <>
      <PageHeader title="Command Chat" description="Direct AI command interface." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <MessageSquare className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Command Chat module coming soon.</p>
      </div>
    </>
  );
}
