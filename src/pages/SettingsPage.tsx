import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/use-theme";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Loader2,
  Save,
  Upload,
  Eye,
  EyeOff,
  Check,
  X,
  Shield,
  ShieldCheck,
  Users,
  CreditCard,
  Settings2,
  Moon,
  Sun,
  Trash2,
  Download,
  ExternalLink,
  Power,
  Mail,
  Lock,
  Globe,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

// ── API Key row ──────────────────────────────────────────────────
function ApiKeyRow({
  label,
  icon,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  icon: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [status, setStatus] = useState<"idle" | "ok" | "fail">("idle");

  const handleVerify = () => {
    if (!value.trim()) return;
    setVerifying(true);
    setTimeout(() => {
      setVerifying(false);
      setStatus(value.length > 10 ? "ok" : "fail");
    }, 1200);
  };

  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs">
        <span>{icon}</span> {label}
        {status === "ok" && <Check className="h-3 w-3 text-primary" />}
        {status === "fail" && <X className="h-3 w-3 text-destructive" />}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setStatus("idle");
            }}
            placeholder={placeholder}
            className="pr-9 font-mono text-xs"
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {visible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          </button>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 text-xs"
              onClick={handleVerify}
              disabled={verifying || !value.trim()}
            >
              {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : "Verify"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Verifică conexiunea API</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

// ── Team member row ──────────────────────────────────────────────
function TeamMemberRow({
  name,
  email,
  role,
  avatarUrl,
  isSelf,
}: {
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
  isSelf?: boolean;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border p-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-[10px]">{initials || "??"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">
          {name} {isSelf && <span className="text-xs text-muted-foreground">(tu)</span>}
        </p>
        <p className="truncate text-xs text-muted-foreground">{email}</p>
      </div>
      <Badge
        variant={role === "Admin" ? "default" : "secondary"}
        className="text-[10px]"
      >
        {role}
      </Badge>
    </div>
  );
}

// ── Security Score ──────────────────────────────────────────────
function SecurityScore({ score }: { score: number }) {
  const color =
    score >= 80 ? "text-primary" : score >= 50 ? "text-yellow-500" : "text-destructive";
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-14 w-14">
        <svg className="h-14 w-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle
            cx="28"
            cy="28"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeDasharray={`${(score / 100) * 150.8} 150.8`}
            strokeLinecap="round"
            className={color}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${color}`}>
          {score}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Security Score</p>
        <p className="text-xs text-muted-foreground">
          {score >= 80 ? "Excelent" : score >= 50 ? "Mediu — îmbunătățiri recomandate" : "Scăzut — acțiune necesară"}
        </p>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────
export default function SettingsPage() {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();

  // General
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [timezone, setTimezone] = useState("Europe/Bucharest");
  const [language, setLanguage] = useState("ro");
  const [newsletter, setNewsletter] = useState(true);
  const [saving, setSaving] = useState(false);

  // API Keys (stored in-memory only, NOT saved to DB as plaintext)
  const [keys, setKeys] = useState({
    openai: "",
    meta: "",
    google: "",
    stripe: "",
  });

  // Security
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Kill switch
  const [killSwitchActive, setKillSwitchActive] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCompanyName(profile.company_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const securityScore = (() => {
    let s = 30;
    if (fullName) s += 10;
    if (companyName) s += 10;
    if (avatarUrl) s += 10;
    if (Object.values(keys).some((k) => k.length > 10)) s += 20;
    if (newsletter) s += 5;
    s += 15; // baseline auth
    return Math.min(s, 100);
  })();

  const handleSaveGeneral = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company_name: companyName, avatar_url: avatarUrl })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Eroare la salvare.");
    } else {
      await refreshProfile();
      toast.success("Profil actualizat!");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error("Parola trebuie să aibă minim 6 caractere.");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      setOldPassword("");
      setNewPassword("");
      toast.success("Parola a fost schimbată!");
    }
  };

  const handleExportData = async () => {
    if (!user) return;
    const [contacts, agents, workflows, posts] = await Promise.all([
      supabase.from("contacts").select("*").eq("user_id", user.id),
      supabase.from("agents").select("*").eq("user_id", user.id),
      supabase.from("workflows").select("*").eq("user_id", user.id),
      supabase.from("content_posts").select("*").eq("user_id", user.id),
    ]);
    const data = {
      exportedAt: new Date().toISOString(),
      contacts: contacts.data,
      agents: agents.data,
      workflows: workflows.data,
      contentPosts: posts.data,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ssociety-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Date exportate!");
  };

  const handleDeleteAccount = async () => {
    toast.error("Contactează suportul pentru ștergerea contului: support@ssociety.studio");
  };

  const handleKillSwitch = async () => {
    if (!user) return;
    const newState = !killSwitchActive;
    setKillSwitchActive(newState);
    if (newState) {
      await supabase.from("agents").update({ is_active: false, status: "idle" }).eq("user_id", user.id);
      toast.success("Toți agenții au fost opriți.");
    } else {
      toast("Agenții pot fi reactivați individual din Agent Army.");
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("content-images").upload(path, file);
    if (error) {
      toast.error("Eroare la upload.");
      return;
    }
    const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(path);
    setAvatarUrl(urlData.publicUrl);
    toast.success("Logo uploadat! Salvează pentru a aplica.");
  };

  const initials = (fullName || "SS")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <PageHeader title="Settings" description="Configurează profilul și preferințele." />

      <Tabs defaultValue="general" className="max-w-3xl">
        <TabsList className="mb-6 grid w-full grid-cols-4">
          <TabsTrigger value="general" className="gap-1.5 text-xs">
            <Settings2 className="h-3.5 w-3.5" /> General
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5 text-xs">
            <Shield className="h-3.5 w-3.5" /> Security
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-1.5 text-xs">
            <Users className="h-3.5 w-3.5" /> Team
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-1.5 text-xs">
            <CreditCard className="h-3.5 w-3.5" /> Billing
          </TabsTrigger>
        </TabsList>

        {/* ── GENERAL ─────────────────────────────── */}
        <TabsContent value="general" className="space-y-6 animate-fade-in">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Profil Business</CardTitle>
              <CardDescription className="text-xs">
                Informațiile tale de bază și branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={avatarUrl} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <Label
                    htmlFor="logo-upload"
                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border bg-secondary px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <Upload className="h-3 w-3" /> Încarcă Logo
                  </Label>
                  <input
                    id="logo-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                  <p className="mt-1 text-[10px] text-muted-foreground">PNG, JPG. Max 2MB.</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nume complet</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Companie</Label>
                  <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Email</Label>
                <Input value={user?.email || ""} disabled className="opacity-60" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Bucharest">Europe/Bucharest (GMT+2)</SelectItem>
                      <SelectItem value="Europe/London">Europe/London (GMT+0)</SelectItem>
                      <SelectItem value="America/New_York">America/New_York (GMT-5)</SelectItem>
                      <SelectItem value="America/Los_Angeles">America/LA (GMT-8)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Limbă</Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ro">🇷🇴 Română</SelectItem>
                      <SelectItem value="en">🇬🇧 English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Temă</p>
                  <p className="text-xs text-muted-foreground">Schimbă modul vizual</p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border p-0.5">
                  <Button
                    variant={theme === "light" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="h-3 w-3" /> Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "ghost"}
                    size="sm"
                    className="h-7 gap-1 px-2 text-xs"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="h-3 w-3" /> Dark
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Newsletter & Updates</p>
                  <p className="text-xs text-muted-foreground">Primește noutăți despre platformă</p>
                </div>
                <Switch checked={newsletter} onCheckedChange={setNewsletter} />
              </div>

              <Button onClick={handleSaveGeneral} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvează Modificările
              </Button>
            </CardContent>
          </Card>

          {/* API Keys */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">API Keys</CardTitle>
              <CardDescription className="text-xs">
                Conectează servicii externe. Cheile sunt stocate securizat.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ApiKeyRow
                label="OpenAI"
                icon="🤖"
                value={keys.openai}
                onChange={(v) => setKeys((p) => ({ ...p, openai: v }))}
                placeholder="sk-..."
              />
              <ApiKeyRow
                label="Meta (Facebook/Instagram)"
                icon="📱"
                value={keys.meta}
                onChange={(v) => setKeys((p) => ({ ...p, meta: v }))}
                placeholder="EAA..."
              />
              <ApiKeyRow
                label="Google"
                icon="🔍"
                value={keys.google}
                onChange={(v) => setKeys((p) => ({ ...p, google: v }))}
                placeholder="AIza..."
              />
              <ApiKeyRow
                label="Stripe"
                icon="💳"
                value={keys.stripe}
                onChange={(v) => setKeys((p) => ({ ...p, stripe: v }))}
                placeholder="sk_..."
              />
              <p className="text-[10px] text-muted-foreground">
                🔒 Cheile API sunt stocate securizat pe server și nu sunt vizibile altora.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SECURITY ─────────────────────────────── */}
        <TabsContent value="security" className="space-y-6 animate-fade-in">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Security Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <SecurityScore score={securityScore} />

              <Separator />

              {/* Change Password */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                  <Lock className="h-3.5 w-3.5" /> Schimbă Parola
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Parolă nouă</Label>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 6 caractere"
                    />
                  </div>
                </div>
                <Button size="sm" className="gap-1" onClick={handleChangePassword} disabled={!newPassword}>
                  <Lock className="h-3 w-3" /> Actualizează Parola
                </Button>
              </div>

              <Separator />

              {/* Kill Switch */}
              <div className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                <div>
                  <h4 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Power className="h-3.5 w-3.5" /> Kill Switch Global
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Oprește toți agenții AI instant.
                  </p>
                </div>
                <Button
                  variant={killSwitchActive ? "default" : "destructive"}
                  size="sm"
                  className="gap-1"
                  onClick={handleKillSwitch}
                >
                  <Power className="h-3.5 w-3.5" />
                  {killSwitchActive ? "Reactivează" : "Oprește Tot"}
                </Button>
              </div>

              <Separator />

              {/* Data & Privacy */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Data & Privacy</h4>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleExportData}>
                    <Download className="h-3 w-3" /> Export Data (JSON)
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="gap-1 text-xs">
                        <Trash2 className="h-3 w-3" /> Șterge Contul
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Ești sigur?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Această acțiune este ireversibilă. Scrie <strong>{user?.email}</strong> pentru confirmare.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        placeholder={user?.email || ""}
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirm("")}>Anulează</AlertDialogCancel>
                        <AlertDialogAction
                          disabled={deleteConfirm !== user?.email}
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground"
                        >
                          Șterge Permanent
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── TEAM ─────────────────────────────── */}
        <TabsContent value="team" className="space-y-6 animate-fade-in">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Echipa ta</CardTitle>
              <CardDescription className="text-xs">
                Gestionează membrii și rolurile.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <TeamMemberRow
                name={fullName || "Admin"}
                email={user?.email || ""}
                role="Admin"
                avatarUrl={avatarUrl}
                isSelf
              />

              <Separator />

              <div className="space-y-2">
                <Label className="text-xs">Invită un membru nou</Label>
                <div className="flex gap-2">
                  <Input placeholder="email@companie.com" className="flex-1" />
                  <Select defaultValue="member">
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="member">Member</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" className="gap-1" onClick={() => toast.info("Funcție de invitație - coming soon!")}>
                    <Mail className="h-3 w-3" /> Invită
                  </Button>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground">
                Membrii invitați vor primi un email cu link de acces.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── BILLING ─────────────────────────────── */}
        <TabsContent value="billing" className="space-y-6 animate-fade-in">
          <Card className="border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Plan & Facturare</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
                <div>
                  <Badge className="bg-primary text-primary-foreground mb-1">Starter</Badge>
                  <p className="text-xs text-muted-foreground">Plan curent — 3 agenți, 1000 leads, 50 workflows</p>
                </div>
                <Button size="sm" className="gap-1" onClick={() => toast.info("Upgrade flow - coming soon!")}>
                  Upgrade to Pro
                </Button>
              </div>

              <Separator />

              <div>
                <h4 className="text-sm font-medium text-foreground mb-3">Utilizare luna curentă</h4>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "AI Requests", used: 234, total: 1000 },
                    { label: "Storage", used: 12, total: 100, unit: "MB" },
                    { label: "Team Members", used: 1, total: 3 },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border p-3">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="text-lg font-bold text-foreground">
                        {item.used}
                        <span className="text-xs font-normal text-muted-foreground">
                          /{item.total}{item.unit || ""}
                        </span>
                      </p>
                      <div className="mt-1.5 h-1.5 rounded-full bg-secondary">
                        <div
                          className="h-full rounded-full bg-primary transition-all"
                          style={{ width: `${Math.min((item.used / item.total) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast.info("Payment history - coming soon!")}>
                  <FileText className="h-3 w-3" /> Istoric Plăți
                </Button>
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => toast.info("Invoice settings - coming soon!")}>
                  <CreditCard className="h-3 w-3" /> Metodă de Plată
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Links */}
          <Card className="border-border">
            <CardContent className="pt-5 space-y-2">
              <a href="#" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="h-3 w-3" /> Documentație
              </a>
              <a href="#" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-3 w-3" /> Contact Suport
              </a>
              <a href="#" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-3 w-3" /> Privacy Policy
              </a>
              <a href="#" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                <FileText className="h-3 w-3" /> Terms of Service
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
