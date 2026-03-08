import { PageHeader } from "@/components/PageHeader";
import { Bot } from "lucide-react";

export default function AgentArmy() {
  return (
    <>
      <PageHeader title="Agent Army" description="Manage your fleet of AI agents." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Bot className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Agent Army module coming soon.</p>
      </div>
    </>
  );
}
