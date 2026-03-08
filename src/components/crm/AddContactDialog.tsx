import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { insertContact, STATUS_OPTIONS, SOURCE_OPTIONS } from "@/lib/crm-service";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Minim 2 caractere").max(100),
  email: z.string().trim().email("Email invalid").or(z.literal("")).optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
  position: z.string().max(100).optional(),
  status: z.string(),
  source: z.string(),
  notes: z.string().max(1000).optional(),
});

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AddContactDialog({ open, onOpenChange, onSuccess }: AddContactDialogProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("lead");
  const [source, setSource] = useState("manual");
  const [notes, setNotes] = useState("");

  const reset = () => {
    setName(""); setEmail(""); setPhone(""); setCompany("");
    setPosition(""); setStatus("lead"); setSource("manual"); setNotes("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const result = contactSchema.safeParse({ name, email: email || undefined, phone, company, position, status, source, notes });
    if (!result.success) { toast.error(result.error.errors[0].message); return; }

    setLoading(true);
    try {
      await insertContact({
        user_id: user.id,
        name, email: email || null, phone: phone || null,
        company: company || null, position: position || null,
        status, source, notes: notes || null,
      });
      toast.success("Contact adăugat!");
      reset();
      onOpenChange(false);
      onSuccess();
    } catch {
      toast.error("Eroare la adăugarea contactului");
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adaugă Contact</DialogTitle>
          <DialogDescription>Completează detaliile noului contact.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cName">Nume *</Label>
              <Input id="cName" value={name} onChange={(e) => setName(e.target.value)} required aria-label="Nume contact" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cEmail">Email</Label>
              <Input id="cEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email contact" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cCompany">Companie</Label>
              <Input id="cCompany" value={company} onChange={(e) => setCompany(e.target.value)} aria-label="Companie" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cPosition">Poziție</Label>
              <Input id="cPosition" value={position} onChange={(e) => setPosition(e.target.value)} aria-label="Poziție" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cPhone">Telefon</Label>
              <Input id="cPhone" value={phone} onChange={(e) => setPhone(e.target.value)} aria-label="Telefon" />
            </div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger aria-label="Status"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Sursă</Label>
            <Select value={source} onValueChange={setSource}>
              <SelectTrigger aria-label="Sursă"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SOURCE_OPTIONS.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cNotes">Note</Label>
            <Textarea id="cNotes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} aria-label="Note" />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Anulează</Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Adaugă"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
