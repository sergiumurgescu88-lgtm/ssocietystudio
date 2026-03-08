import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { urgentTasks } from "@/lib/dashboard-data";
import { AlertTriangle, Check } from "lucide-react";
import { toast } from "sonner";

export function UrgentTasks() {
  const handleApprove = (title: string) => {
    toast.success(`Task aprobat: ${title}`);
  };

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          Urgent Tasks
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {urgentTasks.map((task) => (
          <div key={task.id} className="flex items-center gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{task.title}</p>
              <div className="mt-1 flex items-center gap-2">
                <Badge variant={task.priority === "critical" ? "destructive" : "secondary"} className="text-[10px]">
                  {task.priority}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground">Expiră în {task.dueIn}</span>
              </div>
            </div>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => handleApprove(task.title)} aria-label={`Aprobă: ${task.title}`}>
              <Check className="h-3 w-3" /> Aprobă
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
