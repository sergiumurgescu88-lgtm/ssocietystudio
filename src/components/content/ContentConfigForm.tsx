import { useState } from "react";
import { Sparkles, Link, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PLATFORMS, TONES } from "@/lib/content-service";

interface ContentConfigFormProps {
  onGenerate: (config: {
    platform: string;
    tone: string;
    subject: string;
    referenceUrl: string;
    variations: number;
  }) => void;
  isGenerating: boolean;
}

export function ContentConfigForm({ onGenerate, isGenerating }: ContentConfigFormProps) {
  const [platform, setPlatform] = useState("linkedin");
  const [tone, setTone] = useState("professional");
  const [subject, setSubject] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [variations, setVariations] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;
    onGenerate({ platform, tone, subject, referenceUrl, variations });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Platformă</Label>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PLATFORMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.icon} {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Ton</Label>
        <Select value={tone} onValueChange={setTone}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TONES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Subiect *</Label>
        <Textarea
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Despre ce vrei să generezi conținut?"
          rows={3}
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="flex items-center gap-1 cursor-help">
              <Link className="h-3 w-3" /> URL Referință
            </Label>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Link către un articol sau post ca inspirație</p>
          </TooltipContent>
        </Tooltip>
        <Input
          value={referenceUrl}
          onChange={(e) => setReferenceUrl(e.target.value)}
          placeholder="https://..."
          type="url"
        />
      </div>

      <div className="space-y-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Label className="cursor-help">Variații</Label>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs">Generează mai multe variante pentru comparare</p>
          </TooltipContent>
        </Tooltip>
        <Select value={String(variations)} onValueChange={(v) => setVariations(Number(v))}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">1 variație</SelectItem>
            <SelectItem value="2">2 variații</SelectItem>
            <SelectItem value="3">3 variații</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isGenerating || !subject.trim()}>
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Se generează...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" /> Generează Conținut
          </>
        )}
      </Button>
    </form>
  );
}
