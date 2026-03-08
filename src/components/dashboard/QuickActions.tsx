import { Button } from "@/components/ui/button";
import { FileDown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function QuickActions() {
  return (
    <div className="fixed bottom-6 right-6 z-50 opacity-0 animate-scale-in" style={{ animationDelay: "600ms" }}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="lg"
            className="h-12 w-12 rounded-full shadow-lg glow-sm hover:glow-active p-0"
            aria-label="Quick Actions"
          >
            <Sparkles className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="gap-2" onClick={() => toast.success("Raport generat!")}>
            <FileDown className="h-4 w-4" /> Generează Raport
          </DropdownMenuItem>
          <DropdownMenuItem className="gap-2" onClick={() => toast("Export PDF în pregătire...")}>
            <FileDown className="h-4 w-4" /> Export PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
