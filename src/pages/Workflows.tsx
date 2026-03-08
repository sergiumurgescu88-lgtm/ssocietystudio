import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Upload, Info } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  fetchWorkflows,
  saveWorkflow,
  updateWorkflow,
  deleteWorkflow,
  testWorkflow,
  type Workflow,
  type WorkflowStep,
} from "@/lib/workflow-service";
import { WorkflowCard } from "@/components/workflows/WorkflowCard";
import { CreateWorkflowDialog } from "@/components/workflows/CreateWorkflowDialog";

export default function Workflows() {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadWorkflows = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await fetchWorkflows(user.id);
      setWorkflows(data);
      if (data.length === 0) setShowTutorial(true);
    } catch {
      toast.error("Eroare la încărcarea workflow-urilor.");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleCreate = async (name: string, description: string, steps: WorkflowStep[]) => {
    if (!user) return;
    try {
      const wf = await saveWorkflow({ user_id: user.id, name, description, steps });
      setWorkflows((prev) => [{ ...wf, steps }, ...prev]);
      toast.success("Workflow creat!");
      setShowTutorial(false);
    } catch {
      toast.error("Eroare la crearea workflow-ului.");
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await updateWorkflow(id, { is_active: active });
      setWorkflows((prev) => prev.map((w) => (w.id === id ? { ...w, is_active: active } : w)));
      toast.success(active ? "Workflow activat!" : "Workflow dezactivat.");
    } catch {
      toast.error("Eroare la actualizare.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWorkflow(id);
      setWorkflows((prev) => prev.filter((w) => w.id !== id));
      toast.success("Workflow șters.");
    } catch {
      toast.error("Eroare la ștergere.");
    }
  };

  const handleDuplicate = async (wf: Workflow) => {
    if (!user) return;
    try {
      const dup = await saveWorkflow({
        user_id: user.id,
        name: `${wf.name} (copie)`,
        description: wf.description || undefined,
        steps: wf.steps,
      });
      setWorkflows((prev) => [{ ...dup, steps: wf.steps }, ...prev]);
      toast.success("Workflow duplicat!");
    } catch {
      toast.error("Eroare la duplicare.");
    }
  };

  const handleTest = async (wf: Workflow) => {
    if (!user) return;
    setTestingId(wf.id);
    try {
      const logs = await testWorkflow(wf, user.id);
      const allSuccess = logs.every((l) => l.status === "success");
      if (allSuccess) {
        toast.success(`"${wf.name}" executat cu succes!`);
      } else {
        toast.error(`"${wf.name}" a eșuat la un pas.`);
      }
      loadWorkflows();
    } catch {
      toast.error("Eroare la testare.");
    } finally {
      setTestingId(null);
    }
  };

  const handleExport = (wf: Workflow) => {
    const json = JSON.stringify({ name: wf.name, description: wf.description, steps: wf.steps }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${wf.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Workflow exportat!");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.name || !data.steps) throw new Error("Format invalid");
        await handleCreate(data.name, data.description || "", data.steps);
      } catch {
        toast.error("Fișierul JSON nu este valid.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const filtered = workflows.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      (w.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <PageHeader title="Workflows" description="Automatizează procesele de business." />

      {showTutorial && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 animate-fade-in">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Bun venit în Workflows!</p>
            <p className="text-xs text-muted-foreground mt-1">
              Creează automatizări vizuale: alege un trigger, adaugă condiții și acțiuni, apoi activează workflow-ul.
            </p>
            <Button variant="link" size="sm" className="h-6 px-0 text-xs" onClick={() => setShowTutorial(false)}>
              Am înțeles
            </Button>
          </div>
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Caută workflows..." className="pl-9" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-3.5 w-3.5" /> Import
          </Button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
          <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}>
            <Plus className="h-3.5 w-3.5" /> Workflow Nou
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-secondary/30" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 mb-4">⚡</div>
          <p className="text-sm text-muted-foreground mb-3">
            {search ? "Niciun workflow găsit." : "Niciun workflow creat încă."}
          </p>
          {!search && (
            <Button size="sm" className="gap-1" onClick={() => setShowCreate(true)}>
              <Plus className="h-3.5 w-3.5" /> Creează Primul Workflow
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((wf) => (
            <WorkflowCard
              key={wf.id}
              workflow={wf}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onDuplicate={handleDuplicate}
              onTest={handleTest}
              onExport={handleExport}
              isTesting={testingId}
            />
          ))}
        </div>
      )}

      <CreateWorkflowDialog open={showCreate} onClose={() => setShowCreate(false)} onSave={handleCreate} />
      </div>
    </>
  );
}
