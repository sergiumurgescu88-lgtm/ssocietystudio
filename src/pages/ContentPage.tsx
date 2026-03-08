import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";

export default function ContentPage() {
  return (
    <>
      <PageHeader title="Content" description="Create and manage AI-generated content." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <FileText className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Content module coming soon.</p>
      </div>
    </>
  );
}
