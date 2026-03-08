import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { agents } from "@/lib/dashboard-data";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const statusConfig = {
  online: { label: "Online", color: "bg-emerald-500", badgeVariant: "default" as const },
  working: { label: "Working", color: "bg-amber-400", badgeVariant: "secondary" as const },
  offline: { label: "Offline", color: "bg-muted-foreground/40", badgeVariant: "outline" as const },
};

export function AgentStatusGrid() {
  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "300ms" }}>
      <CardHeader>
        <CardTitle className="text-base">Agent Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {agents.map((agent, i) => {
            const cfg = statusConfig[agent.status];
            return (
              <div
                key={agent.name}
                className={cn(
                  "flex flex-col gap-2 rounded-lg border border-border p-3 transition-all hover:bg-accent/50",
                  agent.status === "online" && "hover:glow-sm"
                )}
                style={{ animationDelay: `${350 + i * 50}ms` }}
              >
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium text-foreground truncate">{agent.name}</span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{agent.role}</p>
                <div className="flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", cfg.color)} />
                  <Badge variant={cfg.badgeVariant} className="text-[10px] px-1.5 py-0">
                    {cfg.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
