import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, type LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  trend?: "up" | "down";
  trendValue?: string;
  icon: LucideIcon;
}

export function StatCard({ title, value, trend, trendValue, icon: Icon }: StatCardProps) {
  return (
    <Card className="transition-shadow hover:glow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-foreground">{value}</span>
            {trend && (
              <span className={`flex items-center gap-0.5 text-xs font-medium ${trend === "up" ? "text-trend-up" : "text-trend-down"}`}>
                {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
