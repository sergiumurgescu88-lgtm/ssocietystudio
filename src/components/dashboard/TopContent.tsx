import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { topContent } from "@/lib/dashboard-data";
import { formatNumber } from "@/lib/dashboard-data";
import { FileText, Eye, BarChart3 } from "lucide-react";

export function TopContent() {
  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "350ms" }}>
      <CardHeader>
        <CardTitle className="text-base">Top Performing Content</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topContent.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{formatNumber(item.views)}</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-3 w-3" />{item.engagement}</span>
              </div>
            </div>
            <span className="text-lg font-bold font-mono text-muted-foreground/50">#{i + 1}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
