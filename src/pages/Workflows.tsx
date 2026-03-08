import { PageHeader } from "@/components/PageHeader";
import { GitBranch } from "lucide-react";

export default function Workflows() {
  return (
    <>
      <PageHeader title="Workflows" description="Automate and orchestrate your processes." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <GitBranch className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Workflows module coming soon.</p>
      </div>
    </>
  );
}
