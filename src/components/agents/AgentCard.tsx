import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Settings, Crown, Megaphone, TrendingUp, Cpu, Compass, Wallet, Activity } from "lucide-react";
import { type Agent, AUTONOMY_LABELS } from "@/lib/agent-service";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, React.ElementType> = {
  crown: Crown,
  megaphone: Megaphone,
  "trending-up": TrendingUp,
  cpu: Cpu,
  compass: Compass,
  wallet: Wallet,
};

const statusConfig = {
  idle: { label: "Idle", color: "bg-muted-foreground/40", dot: "bg-muted-foreground" },
  working: { label: "Working", color: "bg-amber-400/20", dot: "bg-amber-400" },
  error: { label: "Error", color: "bg-red-500/20", dot: "bg-red-500" },
};

interface AgentCardProps {
  agent: Agent;
  onConfigure: (agent: Agent) => void;
  onToggleActive: (agent: Agent) => void;
}

export function AgentCard({ agent, onConfigure, onToggleActive }: AgentCardProps) {
  const Icon = ICON_MAP[agent.icon] || Cpu;
  const sCfg = statusConfig[agent.status as keyof typeof statusConfig] || statusConfig.idle;

  return (
    <Card
      className={cn(
        "relative transition-all hover:glow-sm opacity-0 animate-fade-in",
        !agent.is_active && "opacity-60"
      )}
      style={{ animationDelay: `${agent.sort_order * 80}ms` }}
    >
      {agent.recently_updated && (
        <Badge className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] px-1.5 z-10">NEW</Badge>
      )}
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", agent.is_active ? "bg-primary/10" : "bg-muted")}>
              <Icon className={cn("h-5 w-5", agent.is_active ? "text-primary" : "text-muted-foreground")} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">{agent.name}</h3>
              <p className="text-xs text-muted-foreground">{agent.role}</p>
            </div>
          </div>
          <Switch
            checked={agent.is_active}
            onCheckedChange={() => onToggleActive(agent)}
            aria-label={`${agent.is_active ? "Dezactivează" : "Activează"} ${agent.name}`}
          />
        </div>

        {/* Description */}
        <p className="mb-3 text-xs text-muted-foreground leading-relaxed line-clamp-2">{agent.description}</p>

        {/* Status & Health */}
        <div className="mb-3 flex items-center gap-3">
          <div className={cn("flex items-center gap-1.5 rounded-full px-2.5 py-1", sCfg.color)}>
            <span className={cn("h-1.5 w-1.5 rounded-full", sCfg.dot)} />
            <span className="text-[10px] font-medium text-foreground">{sCfg.label}</span>
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                <span className="font-mono">{agent.health}%</span>
              </div>
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">Health: Starea API-ului agentului</p></TooltipContent>
          </Tooltip>
        </div>

        {/* Stats row */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2.5">
          <div>
            <p className="text-[10px] text-muted-foreground">Cost Today</p>
            <p className="text-sm font-bold font-mono text-foreground">${Number(agent.cost_today || 0).toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Autonomie</p>
            <p className="text-sm font-medium text-foreground">{AUTONOMY_LABELS[agent.autonomy]}</p>
          </div>
        </div>

        {/* Configure button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full gap-1.5"
          onClick={() => onConfigure(agent)}
          aria-label={`Configurează ${agent.name}`}
        >
          <Settings className="h-3.5 w-3.5" /> Configure
        </Button>
      </CardContent>
    </Card>
  );
}
