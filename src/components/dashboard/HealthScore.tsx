import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface HealthScoreProps {
  score: number;
}

export function HealthScore({ score }: HealthScoreProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;
  const color = clampedScore >= 70 ? "hsl(160, 84%, 39%)" : clampedScore >= 40 ? "hsl(45, 93%, 47%)" : "hsl(0, 84%, 60%)";

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "150ms" }}>
      <CardHeader className="flex flex-row items-center gap-1.5">
        <CardTitle className="text-base">Business Health</CardTitle>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-muted-foreground/50 cursor-help" />
          </TooltipTrigger>
          <TooltipContent><p className="text-xs max-w-48">Score calculat din lead-uri, revenue trend și task completion rate.</p></TooltipContent>
        </Tooltip>
      </CardHeader>
      <CardContent className="flex flex-col items-center pb-4">
        <div className="relative h-28 w-28">
          <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(217, 33%, 20%)" strokeWidth="8" />
            <circle
              cx="50" cy="50" r="45"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: `drop-shadow(0 0 6px ${color})` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold font-mono text-foreground">{clampedScore}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {clampedScore >= 70 ? "Sănătate excelentă 🔥" : clampedScore >= 40 ? "Necesită atenție ⚠️" : "Critic — acțiune necesară 🚨"}
        </p>
      </CardContent>
    </Card>
  );
}
