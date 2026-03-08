import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { APP_NAME } from "@/lib/constants";

const signupSchema = z.object({
  fullName: z.string().trim().min(2, "Numele trebuie să aibă minim 2 caractere").max(100),
  companyName: z.string().trim().min(1, "Numele companiei este obligatoriu").max(100),
  email: z.string().trim().email("Email invalid"),
  password: z.string().min(6, "Parola trebuie să aibă minim 6 caractere").max(72),
});

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = signupSchema.safeParse({ fullName, companyName, email, password });
    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: fullName, company_name: companyName },
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Cont creat! Verifică email-ul pentru confirmare.");
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary glow-sm">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">{APP_NAME}</CardTitle>
          <CardDescription>Creează-ți contul și alege planul Starter gratuit</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Nume complet</Label>
              <Input id="fullName" placeholder="Ion Popescu" value={fullName} onChange={(e) => setFullName(e.target.value)} required aria-label="Nume complet" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Nume companie</Label>
              <Input id="companyName" placeholder="Compania mea SRL" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required aria-label="Nume companie" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signupEmail">Email</Label>
              <Input id="signupEmail" type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="Email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="signupPassword">Parolă</Label>
              <Input id="signupPassword" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="Parolă" />
            </div>
            <Button type="submit" className="w-full" disabled={loading} aria-label="Creează cont">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Creează cont — Plan Starter"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-center text-xs text-muted-foreground">
          <p>Ai deja cont? <Link to="/login" className="text-primary hover:underline">Autentifică-te</Link></p>
        </CardFooter>
      </Card>
    </div>
  );
}
