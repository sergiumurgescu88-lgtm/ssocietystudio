import { PageHeader } from "@/components/PageHeader";
import { Brain } from "lucide-react";

export default function CrmNeural() {
  return (
    <>
      <PageHeader title="CRM Neural" description="AI-powered customer relationship management." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Brain className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">CRM Neural module coming soon.</p>
      </div>
    </>
  );
}
