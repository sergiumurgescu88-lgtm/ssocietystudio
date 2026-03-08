import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface ActivityItemProps {
  avatar: string;
  text: string;
  timestamp: string;
  status?: "success" | "warning" | "error" | "info";
}

const statusVariant: Record<string, "default" | "destructive" | "outline" | "secondary"> = {
  success: "default",
  warning: "secondary",
  error: "destructive",
  info: "outline",
};

export function ActivityItem({ avatar, text, timestamp, status = "info" }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-accent/50">
      <Avatar className="h-8 w-8">
        <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
          {avatar}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">{text}</p>
        <p className="mt-0.5 text-xs font-mono text-muted-foreground">{timestamp}</p>
      </div>
      <Badge variant={statusVariant[status]} className="shrink-0 text-[10px]">
        {status}
      </Badge>
    </div>
  );
}
