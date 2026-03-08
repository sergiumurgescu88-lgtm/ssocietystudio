import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  fetchPosts,
  savePost,
  updatePost,
  deletePost,
  generateContent,
  uploadContentImage,
  type ContentPost,
  type ContentVariation,
} from "@/lib/content-service";
import { ContentConfigForm } from "@/components/content/ContentConfigForm";
import { ContentPreview } from "@/components/content/ContentPreview";
import { ContentHistory } from "@/components/content/ContentHistory";

export default function ContentPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [variations, setVariations] = useState<ContentVariation[]>([]);
  const [selectedVariation, setSelectedVariation] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [currentConfig, setCurrentConfig] = useState<{
    platform: string;
    tone: string;
    subject: string;
    referenceUrl: string;
    variations: number;
  } | null>(null);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const data = await fetchPosts(user.id, filter);
      setPosts(data);
    } catch {
      toast.error("Eroare la încărcarea postărilor.");
    } finally {
      setIsLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleGenerate = async (config: typeof currentConfig) => {
    if (!config) return;
    setCurrentConfig(config);
    setIsGenerating(true);
    setVariations([]);
    setSelectedVariation(0);
    setImageUrl(null);

    try {
      const result = await generateContent(
        config.platform,
        config.tone,
        config.subject,
        config.referenceUrl || undefined,
        config.variations
      );
      setVariations(result.variations || []);
      toast.success(`${result.variations?.length || 0} variație(i) generate!`);
    } catch (err: any) {
      toast.error(err.message || "Eroare la generare.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleContentChange = (content: string) => {
    setVariations((prev) =>
      prev.map((v, i) => (i === selectedVariation ? { ...v, content } : v))
    );
  };

  const handleSave = async () => {
    if (!user || !currentConfig || !variations[selectedVariation]) return;
    setIsSaving(true);
    try {
      const v = variations[selectedVariation];
      await savePost({
        user_id: user.id,
        platform: currentConfig.platform,
        tone: currentConfig.tone,
        subject: currentConfig.subject,
        reference_url: currentConfig.referenceUrl || null,
        content: v.content,
        hashtags: v.hashtags,
        image_url: imageUrl,
        status: "draft",
      });
      toast.success("Post salvat ca draft!");
      loadPosts();
    } catch {
      toast.error("Eroare la salvare.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchedule = () => {
    toast.info("Calendar de programare - coming soon!");
  };

  const handlePublish = async () => {
    if (!user || !currentConfig || !variations[selectedVariation]) return;
    try {
      const v = variations[selectedVariation];
      await savePost({
        user_id: user.id,
        platform: currentConfig.platform,
        tone: currentConfig.tone,
        subject: currentConfig.subject,
        reference_url: currentConfig.referenceUrl || null,
        content: v.content,
        hashtags: v.hashtags,
        image_url: imageUrl,
        status: "published",
        published_at: new Date().toISOString(),
      });
      toast.success("Post publicat!");
      loadPosts();
    } catch {
      toast.error("Eroare la publicare.");
    }
  };

  const handleRegenerate = () => {
    if (currentConfig) handleGenerate(currentConfig);
  };

  const handleImageUpload = async (file: File) => {
    if (!user) return;
    try {
      const url = await uploadContentImage(file, user.id);
      setImageUrl(url);
      toast.success("Imagine încărcată!");
    } catch {
      toast.error("Eroare la upload imagine.");
    }
  };

  const handleDeletePost = async (id: string) => {
    try {
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
      toast.success("Post șters.");
    } catch {
      toast.error("Eroare la ștergere.");
    }
  };

  const handleSelectPost = (post: ContentPost) => {
    setVariations([
      {
        content: post.content,
        hashtags: post.hashtags || [],
        bestTimeToPost: "N/A",
        estimatedReach: "N/A",
      },
    ]);
    setSelectedVariation(0);
    setImageUrl(post.image_url);
    setCurrentConfig({
      platform: post.platform,
      tone: post.tone,
      subject: post.subject,
      referenceUrl: post.reference_url || "",
      variations: 1,
    });
  };

  return (
    <>
      <PageHeader
        title="Content Factory"
        description="Generează și gestionează conținut AI pentru toate platformele."
      />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Left: Config + History */}
        <div className="space-y-6">
          <Card className="animate-fade-in border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Configurare</CardTitle>
            </CardHeader>
            <CardContent>
              <ContentConfigForm onGenerate={handleGenerate} isGenerating={isGenerating} />
            </CardContent>
          </Card>

          <Card className="animate-fade-in border-border" style={{ animationDelay: "100ms" }}>
            <CardContent className="pt-5">
              <ContentHistory
                posts={posts}
                filter={filter}
                onFilterChange={setFilter}
                onDelete={handleDeletePost}
                onSelect={handleSelectPost}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview */}
        <Card className="animate-fade-in border-border" style={{ animationDelay: "200ms" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <ContentPreview
              variations={variations}
              selectedIndex={selectedVariation}
              onSelectVariation={setSelectedVariation}
              onContentChange={handleContentChange}
              onSave={handleSave}
              onSchedule={handleSchedule}
              onPublish={handlePublish}
              onRegenerate={handleRegenerate}
              onImageUpload={handleImageUpload}
              imageUrl={imageUrl}
              isSaving={isSaving}
              isGenerating={isGenerating}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
