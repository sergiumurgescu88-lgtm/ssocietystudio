import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { type Agent, fetchAgents, seedDefaultAgents, updateAgent } from "@/lib/agent-service";
import { AgentCard } from "@/components/agents/AgentCard";
import { AgentConfigDialog } from "@/components/agents/AgentConfigDialog";
import { StatCardSkeleton } from "@/components/LoadingSkeletons";

export default function AgentArmy() {
  const { user } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [configAgent, setConfigAgent] = useState<Agent | null>(null);
  const [configOpen, setConfigOpen] = useState(false);

  const loadAgents = useCallback(async () => {
    if (!user) return;
    try {
      let data = await fetchAgents(user.id);
      // Seed defaults on first visit
      if (data.length === 0) {
        data = await seedDefaultAgents(user.id);
        toast.success("Agenții au fost inițializați! 🤖");
      }
      setAgents(data);
    } catch {
      toast.error("Eroare la încărcarea agenților");
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadAgents(); }, [loadAgents]);

  const handleToggleActive = async (agent: Agent) => {
    try {
      await updateAgent(agent.id, { is_active: !agent.is_active });
      toast.success(`${agent.name} ${agent.is_active ? "dezactivat" : "activat"}`);
      loadAgents();
    } catch {
      toast.error("Eroare la actualizare");
    }
  };

  const handleConfigure = (agent: Agent) => {
    setConfigAgent(agent);
    setConfigOpen(true);
  };

  const activeCount = agents.filter((a) => a.is_active).length;
  const workingCount = agents.filter((a) => a.status === "working").length;
  const errorCount = agents.filter((a) => a.status === "error").length;

  return (
    <>
      <PageHeader
        title="Agent Army"
        description={`${activeCount} activi · ${workingCount} lucrează · ${errorCount} erori`}
      >
        <Button variant="outline" size="sm" className="gap-1.5" onClick={loadAgents} aria-label="Refresh agenți">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </PageHeader>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onConfigure={handleConfigure}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Budget Alert */}
      {agents.some((a) => (a.cost_today || 0) >= (a.budget_limit || 100) * 0.9) && (
        <div className="mt-4 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-foreground opacity-0 animate-fade-in">
          ⚠️ Unul sau mai mulți agenți au atins 90% din bugetul zilnic!
        </div>
      )}

      <AgentConfigDialog
        agent={configAgent}
        open={configOpen}
        onOpenChange={setConfigOpen}
        onUpdated={loadAgents}
      />
    </>
  );
}
