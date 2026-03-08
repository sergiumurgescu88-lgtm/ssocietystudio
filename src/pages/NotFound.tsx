import { useLocation, Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="max-w-md text-center animate-fade-in">
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
          <span className="text-5xl font-bold text-primary">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-foreground">Pagină negăsită</h1>
        <p className="mb-2 text-muted-foreground">
          Ne pare rău, pagina <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">{location.pathname}</code> nu există.
        </p>
        <p className="mb-8 text-sm text-muted-foreground">
          Poate a fost mutată sau link-ul este incorect.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button asChild>
            <Link to="/dashboard"><Home className="mr-2 h-4 w-4" /> Mergi la Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Înapoi
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
