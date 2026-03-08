import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { feedItems, type FeedItem } from "@/lib/dashboard-data";
import { cn } from "@/lib/utils";

const filters = [
  { value: "all", label: "Toate" },
  { value: "sales", label: "Sales" },
  { value: "marketing", label: "Marketing" },
  { value: "system", label: "System" },
] as const;

const statusVariant: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  success: "default",
  warning: "secondary",
  error: "destructive",
  info: "outline",
};

export function ActivityFeed() {
  const [filter, setFilter] = useState<string>("all");

  const filtered = filter === "all" ? feedItems : feedItems.filter((f) => f.category === filter);

  return (
    <Card className="opacity-0 animate-fade-in" style={{ animationDelay: "250ms" }}>
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Live Activity Feed</CardTitle>
        <div className="flex gap-1">
          {filters.map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? "default" : "ghost"}
              size="sm"
              className="h-7 px-2.5 text-xs"
              onClick={() => setFilter(f.value)}
              aria-label={`Filtrează: ${f.label}`}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="max-h-80 space-y-1 overflow-y-auto p-0 pb-2">
        {filtered.map((item, i) => (
          <FeedItemRow key={item.id} item={item} delay={i * 40} />
        ))}
        {filtered.length === 0 && (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">Nicio activitate în această categorie.</p>
        )}
      </CardContent>
    </Card>
  );
}

function FeedItemRow({ item, delay }: { item: FeedItem; delay: number }) {
  return (
    <div
      className="flex items-start gap-3 rounded-lg px-4 py-2.5 transition-colors hover:bg-accent/50 opacity-0 animate-fade-in"
      style={{ animationDelay: `${300 + delay}ms` }}
    >
      <Avatar className="h-7 w-7 mt-0.5">
        <AvatarFallback className="bg-primary/10 text-[10px] font-medium text-primary">{item.avatar}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{item.text}</p>
        <p className="mt-0.5 text-xs font-mono text-muted-foreground">{item.timestamp}</p>
      </div>
      <Badge variant={statusVariant[item.status]} className="shrink-0 text-[10px]">{item.status}</Badge>
    </div>
  );
}
