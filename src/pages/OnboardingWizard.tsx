import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, Store, Target, Link2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NICHES = [
  { value: "retail", label: "Retail & E-commerce", icon: Store },
  { value: "service", label: "Servicii & Consultanță", icon: Target },
  { value: "tech", label: "Tech & Software", icon: Link2 },
];

const OBJECTIVES = [
  { value: "leads", label: "Generare Lead-uri" },
  { value: "content", label: "Content Marketing" },
  { value: "sales", label: "Automatizare Vânzări" },
];

const ACCOUNTS = [
  { value: "google", label: "Google Ads" },
  { value: "meta", label: "Meta Ads" },
];

export default function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [niche, setNiche] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);
  const [accounts, setAccounts] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleObjective = (v: string) =>
    setObjectives((prev) => prev.includes(v) ? prev.filter((o) => o !== v) : [...prev, v]);
  const toggleAccount = (v: string) =>
    setAccounts((prev) => prev.includes(v) ? prev.filter((a) => a !== v) : [...prev, v]);

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("user_settings")
      .update({
        business_niche: niche,
        objectives,
        connected_accounts: accounts,
        onboarding_completed: true,
      })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Eroare la salvarea preferințelor");
    } else {
      toast.success("Bine ai venit în SSociety Studio! 🚀");
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mb-2 flex justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "h-2 w-12 rounded-full transition-colors",
                  s <= step ? "bg-primary glow-sm" : "bg-muted"
                )}
              />
            ))}
          </div>
          <CardTitle className="text-lg">
            {step === 1 && "Selectează Nișa Business"}
            {step === 2 && "Alege Obiectivele"}
            {step === 3 && "Conectează Conturi"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Ce tip de business ai?"}
            {step === 2 && "Ce vrei să automatizezi?"}
            {step === 3 && "Conectează platformele externe (opțional)"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <div className="grid gap-3">
              {NICHES.map((n) => (
                <button
                  key={n.value}
                  onClick={() => setNiche(n.value)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-4 text-left transition-all hover:bg-accent/50",
                    niche === n.value && "border-primary bg-primary/10 glow-sm"
                  )}
                  aria-label={n.label}
                >
                  <n.icon className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium text-foreground">{n.label}</span>
                  {niche === n.value && <Check className="ml-auto h-4 w-4 text-primary" />}
                </button>
              ))}
              <Button onClick={() => setStep(2)} disabled={!niche} className="mt-2">
                Continuă
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {OBJECTIVES.map((o) => (
                  <Badge
                    key={o.value}
                    variant={objectives.includes(o.value) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer px-4 py-2 text-sm transition-all",
                      objectives.includes(o.value) && "glow-sm"
                    )}
                    onClick={() => toggleObjective(o.value)}
                  >
                    {o.label}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)}>Înapoi</Button>
                <Button onClick={() => setStep(3)} disabled={objectives.length === 0} className="flex-1">Continuă</Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => toggleAccount(a.value)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg border p-4 transition-all hover:bg-accent/50",
                    accounts.includes(a.value) && "border-primary bg-primary/10 glow-sm"
                  )}
                  aria-label={`Conectează ${a.label}`}
                >
                  <span className="text-sm font-medium text-foreground">{a.label}</span>
                  <Badge variant={accounts.includes(a.value) ? "default" : "secondary"}>
                    {accounts.includes(a.value) ? "Conectat" : "Conectează"}
                  </Badge>
                </button>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)}>Înapoi</Button>
                <Button onClick={handleFinish} disabled={loading} className="flex-1">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Finalizează"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
