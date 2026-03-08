import { useState, useCallback } from "react";
import {
  Save,
  Calendar,
  Send,
  RefreshCw,
  Upload,
  Clock,
  TrendingUp,
  Hash,
  Monitor,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { ContentVariation } from "@/lib/content-service";
import { toast } from "sonner";

interface ContentPreviewProps {
  variations: ContentVariation[];
  selectedIndex: number;
  onSelectVariation: (index: number) => void;
  onContentChange: (content: string) => void;
  onSave: () => void;
  onSchedule: () => void;
  onPublish: () => void;
  onRegenerate: () => void;
  onImageUpload: (file: File) => void;
  imageUrl: string | null;
  isSaving: boolean;
  isGenerating: boolean;
}

export function ContentPreview({
  variations,
  selectedIndex,
  onSelectVariation,
  onContentChange,
  onSave,
  onSchedule,
  onPublish,
  onRegenerate,
  onImageUpload,
  imageUrl,
  isSaving,
  isGenerating,
}: ContentPreviewProps) {
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const current = variations[selectedIndex];

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        onImageUpload(file);
      } else {
        toast.error("Doar fișiere imagine sunt acceptate.");
      }
    },
    [onImageUpload]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onImageUpload(file);
  };

  if (!current) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
        <Send className="mb-4 h-12 w-12 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">
          Configurează și generează conținut din formularul din stânga.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Variation selector */}
      {variations.length > 1 && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Variații:</span>
          {variations.map((_, i) => (
            <Button
              key={i}
              variant={i === selectedIndex ? "default" : "outline"}
              size="sm"
              className="h-7 w-7 p-0 text-xs"
              onClick={() => onSelectVariation(i)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Preview mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5">
          <Button
            variant={previewMode === "desktop" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setPreviewMode("desktop")}
          >
            <Monitor className="h-3 w-3" /> Desktop
          </Button>
          <Button
            variant={previewMode === "mobile" ? "default" : "ghost"}
            size="sm"
            className="h-7 gap-1 px-2 text-xs"
            onClick={() => setPreviewMode("mobile")}
          >
            <Smartphone className="h-3 w-3" /> Mobile
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs"
          onClick={onRegenerate}
          disabled={isGenerating}
        >
          <RefreshCw className={cn("h-3 w-3", isGenerating && "animate-spin")} /> Regenerează
        </Button>
      </div>

      {/* Content preview */}
      <div
        className={cn(
          "mx-auto rounded-xl border border-border bg-card p-4 transition-all",
          previewMode === "mobile" ? "max-w-[375px]" : "w-full"
        )}
      >
        {/* Image area */}
        <div
          className="mb-4 flex min-h-[120px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 transition-colors hover:border-primary/30"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => document.getElementById("content-image-input")?.click()}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Content" className="max-h-[200px] rounded-lg object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-1 py-4 text-muted-foreground">
              <Upload className="h-6 w-6" />
              <span className="text-xs">Drag & Drop sau click pentru imagine</span>
            </div>
          )}
          <input
            id="content-image-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {/* Editable content */}
        <Textarea
          value={current.content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[200px] resize-none border-none bg-transparent p-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Hashtags */}
        {current.hashtags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {current.hashtags.map((tag, i) => (
              <Badge key={i} variant="secondary" className="gap-1 text-[10px]">
                <Hash className="h-2.5 w-2.5" />
                {tag.replace(/^#/, "")}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border">
          <CardContent className="flex items-center gap-2 p-3">
            <Clock className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Best Time</p>
              <p className="text-xs font-medium">{current.bestTimeToPost}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border">
          <CardContent className="flex items-center gap-2 p-3">
            <TrendingUp className="h-4 w-4 text-primary" />
            <div>
              <p className="text-[10px] text-muted-foreground">Est. Reach</p>
              <p className="text-xs font-medium">{current.estimatedReach}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1" onClick={onSave} disabled={isSaving}>
          <Save className="h-3.5 w-3.5" /> Salvează Draft
        </Button>
        <Button variant="outline" size="sm" className="gap-1" onClick={onSchedule}>
          <Calendar className="h-3.5 w-3.5" /> Programează
        </Button>
        <Button size="sm" className="gap-1" onClick={onPublish}>
          <Send className="h-3.5 w-3.5" /> Publică
        </Button>
      </div>
    </div>
  );
}
