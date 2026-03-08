import { useState } from "react";
import { format } from "date-fns";
import {
  Play,
  Trash2,
  Copy,
  Download,
  Upload,
  ToggleLeft,
  ToggleRight,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  type Workflow,
  type WorkflowLog,
  getStepMeta,
  fetchWorkflowLogs,
} from "@/lib/workflow-service";

interface WorkflowCardProps {
  workflow: Workflow;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
  onDuplicate: (workflow: Workflow) => void;
  onTest: (workflow: Workflow) => void;
  onExport: (workflow: Workflow) => void;
  isTesting: string | null;
}

export function WorkflowCard({
  workflow,
  onToggle,
  onDelete,
  onDuplicate,
  onTest,
  onExport,
  isTesting,
}: WorkflowCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [logs, setLogs] = useState<WorkflowLog[]>([]);
  const [logsLoaded, setLogsLoaded] = useState(false);

  const handleExpand = async () => {
    if (!expanded && !logsLoaded) {
      try {
        const data = await fetchWorkflowLogs(workflow.id);
        setLogs(data);
        setLogsLoaded(true);
      } catch {}
    }
    setExpanded(!expanded);
  };

  const stepColor = (type: string) => {
    switch (type) {
      case "trigger": return "border-primary/40 bg-primary/10";
      case "action": return "border-accent/40 bg-accent/30";
      case "condition": return "border-ring/40 bg-ring/10";
      case "delay": return "border-muted-foreground/20 bg-muted/50";
      default: return "border-border";
    }
  };

  const isRunning = isTesting === workflow.id;
  const highImpact = workflow.run_count > 5 && workflow.fail_count < 2;

  return (
    <Card className={cn("border-border transition-all animate-fade-in", workflow.is_active && "border-primary/30")}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-5 w-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-foreground truncate">{workflow.name}</h4>
              {highImpact && (
                <Badge className="bg-primary/20 text-primary text-[9px] h-4 px-1.5">
                  High Impact
                </Badge>
              )}
              {workflow.fail_count >= 3 && (
                <Tooltip>
                  <TooltipTrigger>
                    <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Eșecuri repetate ({workflow.fail_count}). Verifică configurarea.</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            {workflow.description && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{workflow.description}</p>
            )}
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
              <span>{workflow.steps.length} pași</span>
              <span>·</span>
              <span>{workflow.run_count} rulări</span>
              {workflow.last_run_at && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {format(new Date(workflow.last_run_at), "dd MMM HH:mm")}
                  </span>
                  {workflow.last_run_status === "success" ? (
                    <CheckCircle2 className="h-3 w-3 text-primary" />
                  ) : workflow.last_run_status === "fail" ? (
                    <XCircle className="h-3 w-3 text-destructive" />
                  ) : null}
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <Switch
              checked={workflow.is_active}
              onCheckedChange={(checked) => onToggle(workflow.id, checked)}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-xs h-7"
              onClick={() => onTest(workflow)}
              disabled={isRunning}
            >
              {isRunning ? (
                <span className="animate-pulse">Rulează...</span>
              ) : (
                <><Play className="h-3 w-3" /> Test</>
              )}
            </Button>
          </div>
        </div>

        {/* Steps visualization */}
        <div className="mt-3 flex flex-wrap items-center gap-1">
          {workflow.steps.map((step, i) => {
            const meta = getStepMeta(step.type, step.key);
            return (
              <div key={step.id} className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className={cn("rounded-md border px-2 py-1 text-[10px] font-medium", stepColor(step.type))}>
                      {meta.icon} {meta.label}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{meta.description}</p>
                  </TooltipContent>
                </Tooltip>
                {i < workflow.steps.length - 1 && (
                  <span className="text-muted-foreground/40">→</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Actions bar */}
        <div className="mt-3 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="gap-1 text-xs h-6" onClick={handleExpand}>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            Logs
          </Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onDuplicate(workflow)}>
              <Copy className="h-3 w-3" />
            </Button>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onExport(workflow)}>
              <Download className="h-3 w-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Șterge Workflow</AlertDialogTitle>
                  <AlertDialogDescription>
                    Sigur vrei să ștergi "{workflow.name}"? Această acțiune nu poate fi anulată.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDelete(workflow.id)}>Șterge</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        {/* Logs */}
        {expanded && (
          <div className="mt-3 space-y-1 rounded-lg border border-border bg-secondary/20 p-2 animate-fade-in">
            {logs.length === 0 ? (
              <p className="text-[10px] text-muted-foreground text-center py-2">Niciun log încă.</p>
            ) : (
              logs.slice(0, 10).map((log) => (
                <div key={log.id} className="flex items-center gap-2 text-[10px]">
                  {log.status === "success" ? (
                    <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />
                  ) : (
                    <XCircle className="h-3 w-3 text-destructive shrink-0" />
                  )}
                  <span className="flex-1 text-muted-foreground truncate">{log.message}</span>
                  <span className="text-muted-foreground/60 shrink-0">
                    {format(new Date(log.created_at), "HH:mm:ss")}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
