import { Wrench } from "lucide-react";

interface MaintenanceModeProps {
  enabled?: boolean;
}

export function MaintenanceMode({ enabled = false }: MaintenanceModeProps) {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background">
      <div className="max-w-md text-center animate-fade-in p-6">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <Wrench className="h-10 w-10 text-primary" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Mentenanță în curs</h1>
        <p className="text-muted-foreground">
          Lucrăm la îmbunătățiri. Revenim în câteva minute. Mulțumim pentru răbdare!
        </p>
      </div>
    </div>
  );
}
