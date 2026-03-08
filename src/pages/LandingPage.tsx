import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Bot,
  Brain,
  Zap,
  BarChart3,
  MessageSquare,
  FileText,
  GitBranch,
  Shield,
  ArrowRight,
  Check,
  Star,
  Sparkles,
  ChevronRight,
  Menu,
  X,
  Users,
  TrendingUp,
  Clock,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Navbar ───────────────────────────────────────────────
function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/landing" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <span className="text-lg font-bold text-foreground">SSociety Studio</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Features</a>
          <a href="#pricing" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Pricing</a>
          <a href="#testimonials" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Testimoniale</a>
          <a href="#faq" className="text-sm text-muted-foreground transition-colors hover:text-foreground">FAQ</a>
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Login</Link>
          </Button>
          <Button size="sm" className="gap-1" asChild>
            <Link to="/signup"><Sparkles className="h-3.5 w-3.5" /> Start Free</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-border bg-background p-4 md:hidden animate-fade-in">
          <div className="flex flex-col gap-3">
            <a href="#features" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Features</a>
            <a href="#pricing" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Pricing</a>
            <a href="#testimonials" onClick={() => setOpen(false)} className="text-sm text-muted-foreground">Testimoniale</a>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" asChild className="flex-1"><Link to="/login">Login</Link></Button>
              <Button size="sm" asChild className="flex-1"><Link to="/signup">Start Free</Link></Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ── Hero ─────────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[300px] w-[400px] rounded-full bg-primary/5 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-4 text-center sm:px-6">
        <Badge variant="secondary" className="mb-6 gap-1 px-4 py-1.5 text-xs animate-fade-in">
          <Sparkles className="h-3 w-3 text-primary" /> Powered by 6 AI Agents
        </Badge>

        <h1 className="mx-auto max-w-4xl text-4xl font-extrabold leading-[1.1] tracking-tight text-foreground sm:text-5xl md:text-6xl lg:text-7xl animate-fade-in-up">
          Armata ta digitală de{" "}
          <span className="bg-gradient-to-r from-primary to-emerald-400 bg-clip-text text-transparent">
            agenți AI
          </span>{" "}
          care crește business-ul
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg opacity-0 animate-fade-in" style={{ animationDelay: "200ms" }}>
          6 agenți AI specializați — CEO, CMO, CRO, CTO, CSO, CFO — care lucrează 24/7 pe marketing,
          vânzări, CRM și conținut. Tu decizi strategia, ei execută.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row opacity-0 animate-fade-in" style={{ animationDelay: "400ms" }}>
          <Button size="lg" className="gap-2 px-8 text-base glow-active" asChild>
            <Link to="/signup">
              <Sparkles className="h-4 w-4" /> Începe Gratuit
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="gap-2 px-8 text-base" asChild>
            <a href="#features">
              Explorează Features <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
        </div>

        {/* Social proof */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground opacity-0 animate-fade-in" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4 text-primary" />
            <span><strong className="text-foreground">500+</strong> utilizatori activi</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-primary" />
            <span><strong className="text-foreground">3x</strong> creștere medie ROI</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-primary" />
            <span><strong className="text-foreground">20h</strong> economisite/săptămână</span>
          </div>
        </div>

        {/* Mock dashboard preview */}
        <div className="relative mx-auto mt-16 max-w-4xl opacity-0 animate-fade-in-up" style={{ animationDelay: "700ms" }}>
          <div className="rounded-xl border border-border bg-card p-2 shadow-2xl shadow-primary/10">
            <div className="flex gap-1.5 px-3 py-2">
              <div className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
              <div className="h-2.5 w-2.5 rounded-full bg-primary/60" />
            </div>
            <div className="rounded-lg bg-background p-4 sm:p-6">
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { label: "Revenue", value: "€24.5K", trend: "+18%" },
                  { label: "Lead-uri", value: "342", trend: "+24%" },
                  { label: "Agenți Activi", value: "6/6", trend: "100%" },
                  { label: "Tasks Done", value: "1,847", trend: "+31%" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-border bg-card p-3">
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    <p className="text-lg font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] font-medium text-primary">{s.trend}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <div className="col-span-2 h-32 rounded-lg border border-border bg-gradient-to-r from-primary/5 to-transparent p-3">
                  <p className="text-xs text-muted-foreground mb-2">Revenue Trend</p>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 55, 45, 60, 52, 70, 65, 80, 75, 90, 85, 95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-sm bg-primary/40" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>
                <div className="h-32 rounded-lg border border-border p-3">
                  <p className="text-xs text-muted-foreground mb-2">Agenți</p>
                  <div className="space-y-1.5">
                    {["CEO", "CMO", "CRO"].map((a) => (
                      <div key={a} className="flex items-center justify-between">
                        <span className="text-[10px] text-foreground">{a}</span>
                        <div className="h-1.5 w-16 rounded-full bg-secondary">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${70 + Math.random() * 30}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Gradient fade at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background to-transparent" />
        </div>
      </div>
    </section>
  );
}

// ── Features ─────────────────────────────────────────────
const FEATURES = [
  {
    icon: Bot,
    title: "6 Agenți AI Specializați",
    description: "CEO, CMO, CRO, CTO, CSO, CFO — fiecare cu rol și autonomie configurabilă. Lucrează ca o echipă coordonată.",
  },
  {
    icon: Brain,
    title: "CRM Neural",
    description: "Scorizare lead-uri cu AI, pipeline vizual, interacțiuni automate. Contactele tale devin inteligente.",
  },
  {
    icon: MessageSquare,
    title: "Command Chat",
    description: "Chat centralizat cu toți agenții. Dă comenzi în limbaj natural și primești acțiuni concrete.",
  },
  {
    icon: FileText,
    title: "Content Factory",
    description: "Generare conținut multi-platformă cu AI: LinkedIn, Instagram, Blog. Variații, hashtag-uri automate.",
  },
  {
    icon: GitBranch,
    title: "Workflow Engine",
    description: "Automatizări vizuale: trigger → condiție → acțiune. Template-uri predefinite și execuție monitorizată.",
  },
  {
    icon: BarChart3,
    title: "Dashboard Real-time",
    description: "KPI-uri live, revenue charts, health score, activitate agenți — totul într-o singură privire.",
  },
];

function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-xs">Features</Badge>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Tot ce ai nevoie. <span className="text-primary">Într-un singur loc.</span>
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
            O platformă completă care înlocuiește 10+ unelte separate. Marketing, Sales, CRM, Content — toate automatizate cu AI.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className="group border-border bg-card/50 transition-all hover:border-primary/30 hover:bg-card hover:shadow-lg hover:shadow-primary/5 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mb-2 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Pricing ──────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    price: "99",
    period: "lună",
    badge: null,
    description: "Perfect pentru freelanceri și soloprenori.",
    features: [
      "2 Agenți AI activi",
      "1,000 task-uri/lună",
      "500 contacte CRM",
      "Content generation (50/lună)",
      "Email support",
      "1 utilizator",
    ],
    cta: "Începe cu Starter",
    variant: "outline" as const,
  },
  {
    name: "Pro",
    price: "299",
    period: "lună",
    badge: "Cel mai popular",
    description: "Ideal pentru agenții și SMB-uri în creștere.",
    features: [
      "5 Agenți AI activi",
      "10,000 task-uri/lună",
      "5,000 contacte CRM",
      "Content generation (unlimited)",
      "Workflow automation",
      "Priority support",
      "5 utilizatori",
      "API access",
    ],
    cta: "Începe cu Pro",
    variant: "default" as const,
  },
  {
    name: "Enterprise",
    price: "999",
    period: "lună",
    badge: null,
    description: "Pentru companii care vor scalare maximă.",
    features: [
      "Toți 6 Agenți AI",
      "Task-uri unlimited",
      "Contacte unlimited",
      "Content & Workflows unlimited",
      "Dedicated Account Manager",
      "Custom integrations",
      "Utilizatori unlimited",
      "SLA & Uptime guarantee",
      "White-label options",
    ],
    cta: "Contactează Sales",
    variant: "outline" as const,
  },
];

function PricingSection() {
  return (
    <section id="pricing" className="py-20 sm:py-28 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-xs">Pricing</Badge>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Planuri simple. <span className="text-primary">Rezultate reale.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            Toate planurile includ 14 zile gratuit. Fără obligații.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <Card
              key={plan.name}
              className={cn(
                "relative border-border bg-card transition-all hover:shadow-xl opacity-0 animate-fade-in-up",
                plan.badge && "border-primary/50 shadow-lg shadow-primary/10 scale-[1.02] lg:scale-105"
              )}
              style={{ animationDelay: `${i * 150}ms` }}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 text-xs glow-sm">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              <CardContent className="p-6 sm:p-8">
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{plan.description}</p>

                <div className="my-6">
                  <span className="text-4xl font-extrabold text-foreground">€{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/{plan.period}</span>
                </div>

                <Button
                  variant={plan.variant}
                  className={cn("w-full gap-1", plan.badge && "glow-active")}
                  asChild
                >
                  <Link to="/signup">
                    {plan.cta} <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>

                <ul className="mt-6 space-y-2.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Testimonials ─────────────────────────────────────────
const TESTIMONIALS = [
  {
    name: "Ana Popescu",
    role: "CEO, Digital Craft Agency",
    text: "SSociety Studio ne-a redus cu 70% timpul pe marketing. Agentul CMO generează conținut mai bun decât echipa noastră anterioară.",
    avatar: "AP",
    rating: 5,
  },
  {
    name: "Mihai Ionescu",
    role: "Founder, TechStart SRL",
    text: "Ca solopreneur, este ca și cum aș avea o echipă de 6 persoane. ROI-ul s-a triplat în prima lună de utilizare.",
    avatar: "MI",
    rating: 5,
  },
  {
    name: "Elena Dumitrescu",
    role: "Marketing Director, RetailPro",
    text: "Workflow engine-ul a automatizat tot ce făceam manual. Acum avem timp să ne concentrăm pe strategie.",
    avatar: "ED",
    rating: 5,
  },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-xs">Testimoniale</Badge>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Ce spun <span className="text-primary">clienții noștri</span>
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <Card
              key={t.name}
              className="border-border bg-card/50 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <CardContent className="p-6">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{t.text}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ ──────────────────────────────────────────────────
const FAQS = [
  {
    q: "Ce este SSociety Studio?",
    a: "SSociety Studio este o platformă AI-powered care pune la dispoziția ta 6 agenți digitali specializați (CEO, CMO, CRO, CTO, CSO, CFO) care automatizează marketing-ul, vânzările, CRM-ul și conținutul business-ului tău.",
  },
  {
    q: "Cât durează setup-ul?",
    a: "Onboarding-ul durează sub 5 minute. Alegi un template (Starter, Growth sau Enterprise), configurezi agenții și ești gata. Poți importa și contacte din CSV.",
  },
  {
    q: "Este nevoie de cunoștințe tehnice?",
    a: "Nu. Totul funcționează prin interfață vizuală și limbaj natural. Dai comenzi în română sau engleză, agenții execută.",
  },
  {
    q: "Pot anula oricând?",
    a: "Da, toate planurile sunt fără contract. Poți anula, face downgrade sau upgrade oricând din Settings.",
  },
  {
    q: "Datele mele sunt securizate?",
    a: "Absolut. Folosim criptare end-to-end, Row Level Security pe baza de date, și toate datele sunt izolate per utilizator. GDPR compliant.",
  },
];

function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 sm:py-28 bg-card/30">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 text-xs">FAQ</Badge>
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
            Întrebări frecvente
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <button
              key={i}
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full rounded-xl border border-border bg-card p-5 text-left transition-all hover:border-primary/30"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground pr-4">{faq.q}</h3>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                    openIdx === i && "rotate-90"
                  )}
                />
              </div>
              {openIdx === i && (
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground animate-fade-in">
                  {faq.a}
                </p>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Waitlist / CTA ───────────────────────────────────────
function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes("@")) {
      toast.error("Introdu un email valid.");
      return;
    }
    setSubmitting(true);
    // Store in contacts table as a lead
    await supabase.from("contacts").insert({
      name: email.split("@")[0],
      email,
      source: "web",
      status: "lead",
      user_id: "00000000-0000-0000-0000-000000000000", // system placeholder
    });
    setSubmitting(false);
    setSubmitted(true);
    toast.success("Te-ai înscris pe waitlist! 🎉");
  };

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 bottom-0 h-[400px] w-[600px] -translate-x-1/2 translate-y-1/2 rounded-full bg-primary/8 blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
          Gata să-ți construiești <span className="text-primary">armata digitală</span>?
        </h2>
        <p className="mt-4 text-muted-foreground">
          Înscrie-te pe waitlist pentru acces prioritar sau începe direct cu 14 zile gratuit.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@compania-ta.com"
              className="h-12 flex-1 text-sm"
            />
            <Button type="submit" size="lg" className="gap-2 px-8 glow-active" disabled={submitting}>
              {submitting ? (
                <span className="animate-spin">⏳</span>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Înscrie-te Gratuit
                </>
              )}
            </Button>
          </form>
        ) : (
          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-6 animate-fade-in">
            <Check className="mx-auto mb-2 h-8 w-8 text-primary" />
            <p className="text-lg font-bold text-foreground">Ești pe listă! 🚀</p>
            <p className="text-sm text-muted-foreground">Vei primi un email cu acces în curând.</p>
          </div>
        )}

        <p className="mt-4 text-xs text-muted-foreground">
          Fără spam. Poți te dezabona oricând. 🔒
        </p>
      </div>
    </section>
  );
}

// ── Footer ───────────────────────────────────────────────
function LandingFooter() {
  return (
    <footer className="border-t border-border bg-card/50 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Zap className="h-3.5 w-3.5" />
              </div>
              <span className="font-bold text-foreground">SSociety Studio</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed mb-3">
              Platforma AI care transformă business-ul tău cu 6 agenți digitali specializați.
            </p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p className="font-semibold text-foreground/80">MURSE ADVERTISING S.R.L.</p>
              <p>CUI: 44923890</p>
              <p>Nr. Înmatriculare: J40/16148/2021</p>
              <p>EUID: ROONRC.J40/16148/2021</p>
              <p>Înființată: 17.09.2021</p>
            </div>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Produs</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a></li>
              <li><a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="text-muted-foreground hover:text-foreground transition-colors">Testimoniale</a></li>
              <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">GDPR</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:sergiusociety@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">sergiusociety@gmail.com</a></li>
              <li><a href="tel:+40768676141" className="text-muted-foreground hover:text-foreground transition-colors">+40 768 676 141</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Discord Community</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">YouTube Tutorials</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} MURSE ADVERTISING S.R.L. Toate drepturile rezervate.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Globe className="h-3 w-3" /> Made in România 🇷🇴
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Main Landing Page ────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background scroll-smooth">
      <LandingNav />
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TestimonialsSection />
      <FAQSection />
      <WaitlistSection />
      <LandingFooter />
    </div>
  );
}
