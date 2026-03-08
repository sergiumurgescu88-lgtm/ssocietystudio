import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setCompanyName(profile.company_name || "");
      setAvatarUrl(profile.avatar_url || "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, company_name: companyName, avatar_url: avatarUrl })
      .eq("user_id", user.id);
    setLoading(false);
    if (error) {
      toast.error("Eroare la salvarea profilului");
    } else {
      await refreshProfile();
      toast.success("Profil actualizat!");
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Configurează profilul și preferințele tale." />
      <div className="max-w-lg space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profil</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="settingsName">Nume complet</Label>
              <Input id="settingsName" value={fullName} onChange={(e) => setFullName(e.target.value)} aria-label="Nume complet" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingsCompany">Companie</Label>
              <Input id="settingsCompany" value={companyName} onChange={(e) => setCompanyName(e.target.value)} aria-label="Companie" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settingsAvatar">Avatar URL</Label>
              <Input id="settingsAvatar" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." aria-label="Avatar URL" />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email || ""} disabled className="opacity-60" aria-label="Email" />
            </div>
            <Button onClick={handleSave} disabled={loading} className="gap-2" aria-label="Salvează modificările">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Salvează
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
