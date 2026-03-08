import { PageHeader } from "@/components/PageHeader";
import { Settings } from "lucide-react";

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Configure your workspace and preferences." />
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Settings className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">Settings module coming soon.</p>
      </div>
    </>
  );
}
