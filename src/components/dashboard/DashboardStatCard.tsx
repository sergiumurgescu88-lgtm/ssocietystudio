import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, type LucideIcon, Info } from "lucide-react";
import { formatNumber } from "@/lib/dashboard-data";

interface DashboardStatCardProps {
  title: string;
  value: number;
  trend: "up" | "down";
  trendValue: string;
  icon: LucideIcon;
  tooltip: string;
  delay?: number;
}

export function DashboardStatCard({ title, value, trend, trendValue, icon: Icon, tooltip, delay = 0 }: DashboardStatCardProps) {
  return (
    <Card
      className="opacity-0 animate-fade-in transition-shadow hover:glow-sm"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-1.5">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
            </TooltipTrigger>
            <TooltipContent><p className="text-xs">{tooltip}</p></TooltipContent>
          </Tooltip>
        </div>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold font-mono text-foreground">{formatNumber(value)}</div>
        <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${trend === "up" ? "text-trend-up" : "text-trend-down"}`}>
          {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {trendValue}
        </div>
      </CardContent>
    </Card>
  );
}
