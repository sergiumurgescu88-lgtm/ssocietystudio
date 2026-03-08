import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { seedDefaultAgents, DEFAULT_AGENTS } from "@/lib/agent-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Check,
  Store,
  Target,
  Link2,
  Briefcase,
  Heart,
  Utensils,
  Rocket,
  TrendingUp,
  Building2,
  Upload,
  FileSpreadsheet,
  Users,
  Bot,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ── Constants ────────────────────────────────────────────
const NICHES = [
  { value: "retail", label: "Retail & E-commerce", icon: Store },
  { value: "service", label: "Servicii & Consultanță", icon: Briefcase },
  { value: "tech", label: "Tech & Software", icon: Link2 },
  { value: "health", label: "Health & Wellness", icon: Heart },
  { value: "food", label: "Food & Hospitality", icon: Utensils },
  { value: "other", label: "Altceva", icon: Target },
];

const OBJECTIVES = [
  { value: "leads", label: "🎯 Generare Lead-uri", description: "Atrage clienți noi automat" },
  { value: "content", label: "📝 Content Marketing", description: "Creează conținut pe autopilot" },
  { value: "sales", label: "💰 Automatizare Vânzări", description: "Optimizează funnel-ul de vânzări" },
  { value: "support", label: "🤝 Customer Support", description: "Răspunde clienților instant" },
  { value: "analytics", label: "📊 Analytics & Insights", description: "Monitorizează performanța" },
];

const ACCOUNTS = [
  { value: "google", label: "Google", icon: "🔍", description: "Calendar, Gmail, Ads" },
  { value: "meta", label: "Meta", icon: "📱", description: "Facebook, Instagram" },
  { value: "linkedin", label: "LinkedIn", icon: "💼", description: "Networking, Ads" },
  { value: "stripe", label: "Stripe", icon: "💳", description: "Plăți, Facturare" },
];

interface BusinessTemplate {
  key: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  agents: string[];
  autonomy: number;
  color: string;
  ideal: string;
}

const TEMPLATES: BusinessTemplate[] = [
  {
    key: "starter",
    name: "Starter",
    icon: <Rocket className="h-6 w-6" />,
    description: "Marketing + Support cu autonomie supervizată",
    agents: ["cmo", "cso"],
    autonomy: 1,
    color: "border-blue-500/50 bg-blue-500/5",
    ideal: "Freelanceri, Soloprenori",
  },
  {
    key: "growth",
    name: "Growth",
    icon: <TrendingUp className="h-6 w-6" />,
    description: "Marketing + Sales + Support cu autonomie mixtă",
    agents: ["ceo", "cmo", "cro", "cso"],
    autonomy: 1,
    color: "border-primary/50 bg-primary/5",
    ideal: "SMB, Agenții Mici",
  },
  {
    key: "enterprise",
    name: "Enterprise",
    icon: <Building2 className="h-6 w-6" />,
    description: "Toți 6 agenți cu autonomie maximă",
    agents: ["ceo", "cmo", "cro", "cto", "cso", "cfo"],
    autonomy: 2,
    color: "border-yellow-500/50 bg-yellow-500/5",
    ideal: "Companii, Scale-up",
  },
];

const TOTAL_STEPS = 4;

// ── CSV Parser ────────────────────────────────────────────
interface CSVContact {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  source?: string;
}

function parseCSV(text: string): CSVContact[] {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/['"]/g, ""));
  
  const nameIdx = headers.findIndex((h) => ["name", "nume", "full_name", "fullname", "contact"].includes(h));
  const emailIdx = headers.findIndex((h) => ["email", "e-mail", "mail"].includes(h));
  const phoneIdx = headers.findIndex((h) => ["phone", "telefon", "tel", "mobile"].includes(h));
  const companyIdx = headers.findIndex((h) => ["company", "companie", "firma", "organization"].includes(h));
  const positionIdx = headers.findIndex((h) => ["position", "pozitie", "role", "title", "job"].includes(h));

  if (nameIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^['"]+|['"]+$/g, ""));
    return {
      name: cols[nameIdx] || "",
      email: emailIdx >= 0 ? cols[emailIdx] : undefined,
      phone: phoneIdx >= 0 ? cols[phoneIdx] : undefined,
      company: companyIdx >= 0 ? cols[companyIdx] : undefined,
      position: positionIdx >= 0 ? cols[positionIdx] : undefined,
      source: "import",
    };
  }).filter((c) => c.name.length > 0);
}

// ── Main Component ────────────────────────────────────────
export default function OnboardingWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Step state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1: Business info
  const [companyName, setCompanyName] = useState("");
  const [niche, setNiche] = useState("");
  const [website, setWebsite] = useState("");
  const [objectives, setObjectives] = useState<string[]>([]);

  // Step 2: Accounts
  const [accounts, setAccounts] = useState<string[]>([]);

  // Step 3: Template & Agent config
  const [selectedTemplate, setSelectedTemplate] = useState<string>("growth");
  const [agentSlugs, setAgentSlugs] = useState<string[]>(["ceo", "cmo", "cro", "cso"]);
  const [globalAutonomy, setGlobalAutonomy] = useState(1);
  const [monthlyBudget, setMonthlyBudget] = useState("500");

  // Step 4: CSV import
  const [csvContacts, setCsvContacts] = useState<CSVContact[]>([]);
  const [csvFileName, setCsvFileName] = useState("");
  const [csvError, setCsvError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // ── Helpers ─────────────────────────────────────────────
  const toggleObjective = (v: string) =>
    setObjectives((prev) => (prev.includes(v) ? prev.filter((o) => o !== v) : [...prev, v]));
  const toggleAccount = (v: string) =>
    setAccounts((prev) => (prev.includes(v) ? prev.filter((a) => a !== v) : [...prev, v]));
  const toggleAgent = (slug: string) =>
    setAgentSlugs((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));

  const applyTemplate = (tpl: BusinessTemplate) => {
    setSelectedTemplate(tpl.key);
    setAgentSlugs(tpl.agents);
    setGlobalAutonomy(tpl.autonomy);
  };

  // ── CSV handling ────────────────────────────────────────
  const processCSVFile = useCallback((file: File) => {
    setCsvError("");
    if (!file.name.endsWith(".csv")) {
      setCsvError("Doar fișiere .csv sunt acceptate.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setCsvError("Fișierul este prea mare (max 5MB).");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const contacts = parseCSV(text);
      if (contacts.length === 0) {
        setCsvError("Nu am găsit contacte valide. Asigură-te că CSV-ul are o coloană 'name' sau 'nume'.");
        return;
      }
      setCsvContacts(contacts);
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processCSVFile(file);
    },
    [processCSVFile]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processCSVFile(file);
  };

  // ── Finish ──────────────────────────────────────────────
  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // 1. Update user_settings
      await supabase.from("user_settings").update({
        business_niche: niche,
        objectives,
        connected_accounts: accounts,
        onboarding_completed: true,
      }).eq("user_id", user.id);

      // 2. Update profile with company name
      if (companyName) {
        await supabase.from("profiles").update({ company_name: companyName }).eq("user_id", user.id);
      }

      // 3. Seed agents with template settings
      const existingAgents = await supabase.from("agents").select("id").eq("user_id", user.id);
      if (!existingAgents.data?.length) {
        const agentInserts = DEFAULT_AGENTS.filter((a) => agentSlugs.includes(a.slug)).map((a) => ({
          user_id: user.id,
          slug: a.slug,
          name: a.name,
          role: a.role,
          description: a.description,
          icon: a.icon,
          system_prompt: a.system_prompt,
          budget_limit: Math.round(Number(monthlyBudget) / agentSlugs.length),
          autonomy: globalAutonomy,
          sort_order: a.sort_order,
          is_active: true,
        }));
        await supabase.from("agents").insert(agentInserts);
      }

      // 4. Import CSV contacts
      if (csvContacts.length > 0) {
        const contactInserts = csvContacts.map((c) => ({
          user_id: user.id,
          name: c.name,
          email: c.email || null,
          phone: c.phone || null,
          company: c.company || null,
          position: c.position || null,
          source: "import",
          status: "lead" as const,
          ai_score: Math.floor(Math.random() * 40) + 30,
        }));
        // Insert in batches of 100
        for (let i = 0; i < contactInserts.length; i += 100) {
          await supabase.from("contacts").insert(contactInserts.slice(i, i + 100));
        }
      }

      toast.success(`Bine ai venit în SSociety Studio! 🚀${csvContacts.length > 0 ? ` ${csvContacts.length} contacte importate.` : ""}`);
      navigate("/");
    } catch (err) {
      toast.error("Eroare la salvarea preferințelor.");
    } finally {
      setLoading(false);
    }
  };

  // ── Step validation ─────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return niche && objectives.length > 0;
    if (step === 2) return true; // optional
    if (step === 3) return agentSlugs.length > 0;
    return true;
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl animate-fade-in">
        <CardHeader className="text-center pb-4">
          {/* Progress bar */}
          <div className="mb-4 flex justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all",
                    s < step
                      ? "bg-primary text-primary-foreground"
                      : s === step
                      ? "bg-primary text-primary-foreground glow-sm"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {s < step ? <Check className="h-4 w-4" /> : s}
                </div>
                {s < TOTAL_STEPS && (
                  <div className={cn("h-0.5 w-8 rounded-full transition-colors", s < step ? "bg-primary" : "bg-muted")} />
                )}
              </div>
            ))}
          </div>

          <CardTitle className="text-lg">
            {step === 1 && "📋 Despre Business-ul Tău"}
            {step === 2 && "🔗 Conectează Conturi Externe"}
            {step === 3 && "🤖 Configurează Agenții AI"}
            {step === 4 && "📂 Importă Date Existente"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Spune-ne despre business-ul tău pentru a personaliza experiența."}
            {step === 2 && "Conectează platformele externe. Poți sări peste acest pas."}
            {step === 3 && "Alege un template sau configurează manual agenții."}
            {step === 4 && "Importă contacte din CSV sau începe de la zero."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* ── STEP 1: Business Info ─────────────────── */}
          {step === 1 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nume Companie</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Digital Agency SRL"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Website (opțional)</Label>
                  <Input
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Nișă Business *</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {NICHES.map((n) => (
                    <button
                      key={n.value}
                      onClick={() => setNiche(n.value)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent/50",
                        niche === n.value && "border-primary bg-primary/10 glow-sm"
                      )}
                    >
                      <n.icon className="h-4 w-4 shrink-0 text-primary" />
                      <span className="text-foreground">{n.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Obiective Principale * (selectează minim 1)</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {OBJECTIVES.map((o) => (
                    <button
                      key={o.value}
                      onClick={() => toggleObjective(o.value)}
                      className={cn(
                        "flex flex-col rounded-lg border p-3 text-left transition-all hover:bg-accent/50",
                        objectives.includes(o.value) && "border-primary bg-primary/10 glow-sm"
                      )}
                    >
                      <span className="text-sm font-medium text-foreground">{o.label}</span>
                      <span className="text-[11px] text-muted-foreground">{o.description}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 2: Connect Accounts ─────────────── */}
          {step === 2 && (
            <div className="space-y-3 animate-fade-in">
              {ACCOUNTS.map((a) => (
                <button
                  key={a.value}
                  onClick={() => toggleAccount(a.value)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-4 transition-all hover:bg-accent/50",
                    accounts.includes(a.value) && "border-primary bg-primary/10 glow-sm"
                  )}
                >
                  <span className="text-2xl">{a.icon}</span>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-medium text-foreground">{a.label}</span>
                    <p className="text-[11px] text-muted-foreground">{a.description}</p>
                  </div>
                  <Badge variant={accounts.includes(a.value) ? "default" : "secondary"} className="text-[10px]">
                    {accounts.includes(a.value) ? "✓ Conectat" : "Conectează"}
                  </Badge>
                </button>
              ))}
              <p className="text-center text-xs text-muted-foreground">
                Poți configura aceste conturi mai târziu din Settings.
              </p>
            </div>
          )}

          {/* ── STEP 3: Agent Templates ──────────────── */}
          {step === 3 && (
            <div className="space-y-5 animate-fade-in">
              {/* Quick templates */}
              <div className="space-y-2">
                <Label className="text-xs">Template Rapid</Label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.key}
                      onClick={() => applyTemplate(tpl)}
                      className={cn(
                        "flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all hover:scale-[1.02]",
                        selectedTemplate === tpl.key ? tpl.color + " glow-sm" : "border-border hover:bg-accent/50"
                      )}
                    >
                      <div className={cn("text-primary", selectedTemplate === tpl.key && "animate-pulse")}>
                        {tpl.icon}
                      </div>
                      <span className="text-sm font-bold text-foreground">{tpl.name}</span>
                      <span className="text-[10px] text-muted-foreground leading-tight">{tpl.description}</span>
                      <Badge variant="outline" className="text-[9px] mt-1">{tpl.ideal}</Badge>
                    </button>
                  ))}
                </div>
              </div>

              {/* Agent selection */}
              <div className="space-y-2">
                <Label className="text-xs flex items-center gap-1">
                  <Bot className="h-3 w-3" /> Agenți Selectați ({agentSlugs.length}/6)
                </Label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_AGENTS.map((a) => (
                    <Badge
                      key={a.slug}
                      variant={agentSlugs.includes(a.slug) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer px-3 py-1.5 text-xs transition-all",
                        agentSlugs.includes(a.slug) && "glow-sm"
                      )}
                      onClick={() => toggleAgent(a.slug)}
                    >
                      {agentSlugs.includes(a.slug) && <Check className="mr-1 h-3 w-3" />}
                      {a.name}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Autonomy slider */}
              <div className="space-y-2">
                <Label className="text-xs">
                  Nivel Autonomie: <span className="font-bold text-primary">{["Manual", "Supervised", "Autonomous"][globalAutonomy]}</span>
                </Label>
                <Slider
                  value={[globalAutonomy]}
                  onValueChange={([v]) => setGlobalAutonomy(v)}
                  min={0}
                  max={2}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>🔒 Manual</span>
                  <span>👁 Supervised</span>
                  <span>🚀 Autonomous</span>
                </div>
              </div>

              {/* Monthly budget */}
              <div className="space-y-1.5">
                <Label className="text-xs">Buget Lunar Total (€)</Label>
                <Input
                  type="number"
                  value={monthlyBudget}
                  onChange={(e) => setMonthlyBudget(e.target.value)}
                  placeholder="500"
                  min={0}
                />
                <p className="text-[10px] text-muted-foreground">
                  Bugetul va fi distribuit egal între cei {agentSlugs.length} agenți selectați (~€{Math.round(Number(monthlyBudget) / Math.max(agentSlugs.length, 1))}/agent).
                </p>
              </div>
            </div>
          )}

          {/* ── STEP 4: Import Data ──────────────────── */}
          {step === 4 && (
            <div className="space-y-5 animate-fade-in">
              {/* CSV Upload zone */}
              <div
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 transition-all",
                  isDragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50",
                  csvContacts.length > 0 && "border-primary/30 bg-primary/5"
                )}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                {csvContacts.length === 0 ? (
                  <>
                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground" />
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">Trage un fișier CSV aici</p>
                      <p className="text-xs text-muted-foreground">sau click pentru a selecta</p>
                    </div>
                    <label className="cursor-pointer">
                      <Button variant="outline" size="sm" className="gap-1" asChild>
                        <span><Upload className="h-3 w-3" /> Selectează CSV</span>
                      </Button>
                      <input type="file" accept=".csv" className="hidden" onChange={handleFileInput} />
                    </label>
                    <p className="text-[10px] text-muted-foreground">
                      Coloane acceptate: name/nume, email, phone/telefon, company/companie, position/pozitie
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium text-foreground">{csvFileName}</span>
                      <button onClick={() => { setCsvContacts([]); setCsvFileName(""); }} className="text-muted-foreground hover:text-foreground">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <Badge variant="default" className="text-sm gap-1">
                      <Users className="h-3.5 w-3.5" /> {csvContacts.length} contacte găsite
                    </Badge>
                    {/* Preview first 5 */}
                    <div className="mt-2 w-full max-h-32 overflow-y-auto rounded-lg border border-border bg-background p-2">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left p-1">Nume</th>
                            <th className="text-left p-1">Email</th>
                            <th className="text-left p-1">Companie</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvContacts.slice(0, 5).map((c, i) => (
                            <tr key={i} className="border-t border-border/50">
                              <td className="p-1 text-foreground">{c.name}</td>
                              <td className="p-1 text-muted-foreground">{c.email || "—"}</td>
                              <td className="p-1 text-muted-foreground">{c.company || "—"}</td>
                            </tr>
                          ))}
                          {csvContacts.length > 5 && (
                            <tr>
                              <td colSpan={3} className="p-1 text-center text-muted-foreground">
                                ... și încă {csvContacts.length - 5} contacte
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>

              {csvError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {csvError}
                </div>
              )}

              {/* CRM connect placeholder */}
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-sm font-medium text-foreground">Conectează CRM Existent</p>
                <p className="text-xs text-muted-foreground mb-3">HubSpot, Salesforce — coming soon</p>
                <div className="flex justify-center gap-2">
                  <Button variant="outline" size="sm" disabled className="text-xs opacity-50">HubSpot</Button>
                  <Button variant="outline" size="sm" disabled className="text-xs opacity-50">Salesforce</Button>
                </div>
              </div>

              <p className="text-center text-xs text-muted-foreground">
                Nu ai date? Nicio problemă! Poți adăuga contacte oricând din CRM Neural.
              </p>
            </div>
          )}

          {/* ── Navigation ─────────────────────────────── */}
          <div className="flex gap-2 pt-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)} className="gap-1">
                <ArrowLeft className="h-3.5 w-3.5" /> Înapoi
              </Button>
            )}
            {step < TOTAL_STEPS ? (
              <Button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canProceed()}
                className="flex-1 gap-1"
              >
                Continuă <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button onClick={handleFinish} disabled={loading} className="flex-1 gap-1">
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" /> Lansează SSociety Studio
                  </>
                )}
              </Button>
            )}
            {step === 2 && (
              <Button variant="ghost" onClick={() => setStep(3)} className="text-xs text-muted-foreground">
                Sari peste →
              </Button>
            )}
            {step === 4 && csvContacts.length === 0 && (
              <Button variant="ghost" onClick={handleFinish} disabled={loading} className="text-xs text-muted-foreground">
                Începe de la zero →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
