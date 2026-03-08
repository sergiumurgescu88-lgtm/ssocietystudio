import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Save, RotateCcw, Play, Upload, Info, Terminal, FileText, Zap, AlertTriangle, CheckCircle } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { toast } from "sonner";
import {
  type Agent, type AgentLog,
  updateAgent, fetchAgentLogs, insertAgentLog, resetAgentConfig, getAgentPerformance,
  AUTONOMY_LABELS, AUTONOMY_DESCRIPTIONS,
} from "@/lib/agent-service";
import { cn } from "@/lib/utils";

interface AgentConfigDialogProps {
  agent: Agent | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
}

const logTypeIcons: Record<string, React.ElementType> = {
  decision: Zap,
  action: CheckCircle,
  error: AlertTriangle,
  test: Terminal,
  config_change: FileText,
};

const logTypeColors: Record<string, string> = {
  decision: "text-primary",
  action: "text-trend-up",
  error: "text-trend-down",
  test: "text-amber-400",
  config_change: "text-muted-foreground",
};

export function AgentConfigDialog({ agent, open, onOpenChange, onUpdated }: AgentConfigDialogProps) {
  const { user } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [budget, setBudget] = useState("100");
  const [autonomy, setAutonomy] = useState(1);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testOutput, setTestOutput] = useState("");
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (agent && open) {
      setPrompt(agent.system_prompt || "");
      setBudget(String(agent.budget_limit ?? 100));
      setAutonomy(agent.autonomy);
      setTestOutput("");
      setShowAllLogs(false);
      setLogsLoading(true);
      fetchAgentLogs(agent.id).then(setLogs).finally(() => setLogsLoading(false));
    }
  }, [agent, open]);

  if (!agent) return null;

  const perfData = getAgentPerformance(agent.slug);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateAgent(agent.id, {
        system_prompt: prompt,
        budget_limit: parseFloat(budget) || 100,
        autonomy,
        recently_updated: true,
      });
      await insertAgentLog({
        agent_id: agent.id,
        user_id: user.id,
        type: "config_change",
        title: "Configurație actualizată",
        content: `Autonomie: ${AUTONOMY_LABELS[autonomy]}, Budget: $${budget}`,
      });
      toast.success("Configurație salvată!");
      onUpdated();
    } catch {
      toast.error("Eroare la salvare");
    }
    setSaving(false);
  };

  const handleReset = async () => {
    if (!user) return;
    const defaults = resetAgentConfig(agent);
    setSaving(true);
    try {
      await updateAgent(agent.id, defaults);
      setPrompt(defaults.system_prompt || "");
      setBudget(String(defaults.budget_limit ?? 100));
      setAutonomy(defaults.autonomy ?? 1);
      toast.success("Resetat la default!");
      onUpdated();
    } catch {
      toast.error("Eroare la resetare");
    }
    setSaving(false);
  };

  const handleTest = async () => {
    if (!user) return;
    setTesting(true);
    setTestOutput("⏳ Running test...\n");
    // Simulate test
    await new Promise((r) => setTimeout(r, 1500));
    const result = `✅ Agent ${agent.name} responded successfully.\n\n> Input: "Analizează performanța Q1"\n> Output: "Am analizat datele Q1. Revenue a crescut cu 18.3%, lead-urile au crescut cu 34%. Recomand focus pe canal social media."\n\n⏱ Response time: 1.2s\n💰 Cost: $0.003`;
    setTestOutput(result);
    await insertAgentLog({
      agent_id: agent.id,
      user_id: user.id,
      type: "test",
      title: "Test prompt executat",
      content: result,
    });
    setLogs((prev) => [{ id: crypto.randomUUID(), agent_id: agent.id, user_id: user.id, type: "test", title: "Test prompt executat", content: result, created_at: new Date().toISOString() }, ...prev]);
    setTesting(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const path = `${user.id}/${agent.id}/${file.name}`;
    const { error } = await supabase.storage.from("agent-knowledge").upload(path, file, { upsert: true });
    if (error) {
      toast.error("Eroare la upload: " + error.message);
    } else {
      toast.success(`Document "${file.name}" uploadat în Knowledge Base!`);
      await insertAgentLog({
        agent_id: agent.id,
        user_id: user.id,
        type: "action",
        title: "Document adăugat în Knowledge Base",
        content: file.name,
      });
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const displayedLogs = showAllLogs ? logs : logs.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {agent.name}
            <Badge variant="outline" className="text-[10px]">{agent.role}</Badge>
          </DialogTitle>
          <DialogDescription>{agent.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* System Prompt */}
          <div className="space-y-1.5">
            <Label htmlFor="agentPrompt">System Prompt</Label>
            <Textarea
              id="agentPrompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="font-mono text-xs"
              placeholder="Introdu system prompt-ul agentului (suportă markdown)..."
              aria-label="System prompt"
            />
          </div>

          {/* Budget & Autonomy */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="agentBudget">Budget Limit ($)</Label>
              <Input
                id="agentBudget"
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                min={0}
                step={10}
                className="font-mono"
                aria-label="Budget limit"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <Label>Autonomie: {AUTONOMY_LABELS[autonomy]}</Label>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="h-3 w-3 text-muted-foreground/50 cursor-help" /></TooltipTrigger>
                  <TooltipContent className="max-w-48"><p className="text-xs">{AUTONOMY_DESCRIPTIONS[autonomy]}</p></TooltipContent>
                </Tooltip>
              </div>
              <Slider
                value={[autonomy]}
                onValueChange={([v]) => setAutonomy(v)}
                min={0}
                max={2}
                step={1}
                className="mt-3"
                aria-label="Nivel autonomie"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Manual</span><span>Supervised</span><span>Autonomous</span>
              </div>
            </div>
          </div>

          {/* Knowledge Base Upload */}
          <div className="space-y-1.5">
            <Label>Knowledge Base</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileInputRef.current?.click()} aria-label="Upload document">
                <Upload className="h-3.5 w-3.5" /> Upload Document
              </Button>
              <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} accept=".pdf,.txt,.md,.csv,.json,.doc,.docx" />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-1.5" aria-label="Salvează configurația">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvează
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={saving} className="gap-1.5" aria-label="Resetează la default">
              <RotateCcw className="h-4 w-4" /> Reset Default
            </Button>
            <Button variant="secondary" onClick={handleTest} disabled={testing} className="gap-1.5 ml-auto" aria-label="Testează agentul">
              {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Test Agent
            </Button>
          </div>

          {/* Test Output Console */}
          {testOutput && (
            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center gap-1.5 mb-2 text-xs font-medium text-muted-foreground">
                <Terminal className="h-3.5 w-3.5" /> Test Output
              </div>
              <pre className="text-xs font-mono text-foreground whitespace-pre-wrap">{testOutput}</pre>
            </div>
          )}

          <Separator />

          {/* Performance Chart */}
          <div>
            <h3 className="mb-2 text-sm font-semibold text-foreground">Agent Performance</h3>
            <div className="h-36">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={perfData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 20%)" />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "hsl(215, 20%, 55%)" }} axisLine={false} tickLine={false} />
                  <RTooltip contentStyle={{ backgroundColor: "hsl(217, 33%, 12%)", border: "1px solid hsl(217, 33%, 20%)", borderRadius: "8px", fontSize: "11px", color: "hsl(210, 40%, 98%)" }} />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(160, 84%, 39%)" strokeWidth={2} dot={{ fill: "hsl(160, 84%, 39%)", r: 3 }} name="Tasks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <Separator />

          {/* Recent Logs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">Decizii Recente</h3>
              {logs.length > 5 && (
                <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setShowAllLogs(!showAllLogs)}>
                  {showAllLogs ? "Arată mai puțin" : `View All (${logs.length})`}
                </Button>
              )}
            </div>
            {logsLoading ? (
              <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
            ) : displayedLogs.length === 0 ? (
              <p className="py-4 text-center text-xs text-muted-foreground">Niciun log înregistrat.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {displayedLogs.map((log) => {
                  const LogIcon = logTypeIcons[log.type] || FileText;
                  return (
                    <div key={log.id} className="flex items-start gap-2 rounded-md p-2 hover:bg-muted/50 transition-colors">
                      <LogIcon className={cn("h-3.5 w-3.5 mt-0.5 shrink-0", logTypeColors[log.type])} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-foreground">{log.title}</p>
                        {log.content && <p className="text-[10px] text-muted-foreground truncate">{log.content}</p>}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground/60 shrink-0">
                        {new Date(log.created_at).toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
