import { useState } from "react";
import { Plus, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  TRIGGERS,
  ACTIONS,
  CONDITIONS,
  DELAYS,
  WORKFLOW_TEMPLATES,
  type WorkflowStep,
} from "@/lib/workflow-service";

interface CreateWorkflowDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, steps: WorkflowStep[]) => void;
}

type WizardPhase = "info" | "trigger" | "steps" | "review";

export function CreateWorkflowDialog({ open, onClose, onSave }: CreateWorkflowDialogProps) {
  const [phase, setPhase] = useState<WizardPhase>("info");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const [addingType, setAddingType] = useState<"action" | "condition" | "delay" | null>(null);

  const reset = () => {
    setPhase("info");
    setName("");
    setDescription("");
    setSteps([]);
    setAddingType(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleTemplate = (tpl: typeof WORKFLOW_TEMPLATES[0]) => {
    setName(tpl.name);
    setDescription(tpl.description);
    setSteps(tpl.steps);
    setPhase("review");
  };

  const addStep = (type: WorkflowStep["type"], key: string, label: string) => {
    setSteps((prev) => [
      ...prev,
      { id: crypto.randomUUID(), type, key, label, config: {} },
    ]);
    setAddingType(null);
  };

  const removeStep = (id: string) => setSteps((prev) => prev.filter((s) => s.id !== id));

  const stepColor = (type: string) => {
    switch (type) {
      case "trigger": return "border-primary bg-primary/10 text-primary";
      case "action": return "border-accent bg-accent/50 text-accent-foreground";
      case "condition": return "border-ring bg-ring/10 text-foreground";
      case "delay": return "border-muted-foreground/30 bg-muted text-muted-foreground";
      default: return "border-border";
    }
  };

  const renderStepOption = (
    item: { key: string; label: string; icon: string; description: string },
    type: WorkflowStep["type"]
  ) => (
    <Tooltip key={item.key}>
      <TooltipTrigger asChild>
        <button
          onClick={() => addStep(type, item.key, item.label)}
          className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary/50"
        >
          <span className="text-xl">{item.icon}</span>
          <div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-[10px] text-muted-foreground">{item.description}</p>
          </div>
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p className="text-xs">{item.description}</p>
      </TooltipContent>
    </Tooltip>
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {phase === "info" && "Workflow Nou"}
            {phase === "trigger" && "Alege Trigger"}
            {phase === "steps" && "Adaugă Pași"}
            {phase === "review" && "Revizuire Workflow"}
          </DialogTitle>
          <DialogDescription>
            {phase === "info" && "Dă un nume și alege un template sau începe de la zero."}
            {phase === "trigger" && "Ce declanșează acest workflow?"}
            {phase === "steps" && "Adaugă acțiuni, condiții și pauze."}
            {phase === "review" && "Verifică workflow-ul înainte de salvare."}
          </DialogDescription>
        </DialogHeader>

        {/* Phase: Info */}
        {phase === "info" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nume</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Lead Nurturing" />
            </div>
            <div className="space-y-2">
              <Label>Descriere</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ce face acest workflow?"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Sau alege un template:</Label>
              <div className="grid gap-2">
                {WORKFLOW_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.name}
                    onClick={() => handleTemplate(tpl)}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm">⚡</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tpl.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tpl.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Phase: Trigger */}
        {phase === "trigger" && (
          <div className="grid gap-2">
            {TRIGGERS.map((t) => renderStepOption(t, "trigger"))}
          </div>
        )}

        {/* Phase: Steps */}
        {phase === "steps" && (
          <div className="space-y-4">
            {/* Current steps */}
            <div className="space-y-2">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2">
                  <div className={cn("flex-1 rounded-lg border p-2.5 text-xs font-medium flex items-center gap-2", stepColor(step.type))}>
                    <span className="uppercase text-[9px] opacity-60">{step.type}</span>
                    <span>{step.label}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => removeStep(step.id)}>
                    ×
                  </Button>
                  {i < steps.length - 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2">
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add step buttons */}
            {!addingType ? (
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setAddingType("action")}>
                  <Plus className="h-3 w-3" /> Acțiune
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setAddingType("condition")}>
                  <Plus className="h-3 w-3" /> Condiție
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setAddingType("delay")}>
                  <Clock className="h-3 w-3" /> Pauză
                </Button>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-foreground capitalize">{addingType === "delay" ? "Pauze" : addingType === "condition" ? "Condiții" : "Acțiuni"}</span>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setAddingType(null)}>Anulează</Button>
                </div>
                <div className="grid gap-1.5">
                  {addingType === "action" && ACTIONS.map((a) => renderStepOption(a, "action"))}
                  {addingType === "condition" && CONDITIONS.map((c) => renderStepOption(c, "condition"))}
                  {addingType === "delay" && DELAYS.map((d) => renderStepOption(d, "delay"))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase: Review */}
        {phase === "review" && (
          <div className="space-y-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-sm font-semibold text-foreground">{name || "Fără nume"}</p>
              {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
            </div>
            <div className="space-y-1.5">
              {steps.map((step, i) => (
                <div key={step.id}>
                  <div className={cn("rounded-lg border p-2.5 text-xs font-medium flex items-center gap-2", stepColor(step.type))}>
                    <span className="uppercase text-[9px] opacity-60">{step.type}</span>
                    <span>{step.label}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="flex justify-center py-0.5">
                      <div className="h-4 w-px bg-border" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            {steps.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Niciun pas adăugat.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex gap-2">
          {phase === "info" && (
            <Button onClick={() => setPhase("trigger")} disabled={!name.trim()}>
              Continuă <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
          {phase === "trigger" && (
            <Button variant="outline" onClick={() => setPhase("info")}>Înapoi</Button>
          )}
          {phase === "steps" && (
            <>
              <Button variant="outline" onClick={() => setPhase("trigger")}>Înapoi</Button>
              <Button onClick={() => setPhase("review")}>Revizuire</Button>
            </>
          )}
          {phase === "review" && (
            <>
              <Button variant="outline" onClick={() => setPhase("steps")}>Editează</Button>
              <Button
                onClick={() => {
                  onSave(name, description, steps);
                  handleClose();
                }}
                disabled={steps.length === 0}
              >
                Salvează Workflow
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
