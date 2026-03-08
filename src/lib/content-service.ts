import { supabase } from "@/integrations/supabase/client";

export interface ContentPost {
  id: string;
  user_id: string;
  platform: string;
  tone: string;
  subject: string;
  reference_url: string | null;
  content: string;
  hashtags: string[];
  image_url: string | null;
  status: string;
  scheduled_at: string | null;
  published_at: string | null;
  variation_group: string | null;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentVariation {
  content: string;
  hashtags: string[];
  bestTimeToPost: string;
  estimatedReach: string;
}

export const PLATFORMS = [
  { value: "linkedin", label: "LinkedIn", icon: "💼" },
  { value: "instagram", label: "Instagram", icon: "📸" },
  { value: "blog", label: "Blog", icon: "📝" },
  { value: "twitter", label: "Twitter/X", icon: "🐦" },
  { value: "facebook", label: "Facebook", icon: "👥" },
];

export const TONES = [
  { value: "professional", label: "Profesional" },
  { value: "casual", label: "Casual" },
  { value: "inspirational", label: "Inspirațional" },
  { value: "educational", label: "Educativ" },
  { value: "humorous", label: "Amuzant" },
  { value: "urgent", label: "Urgent/FOMO" },
];

export const STATUS_OPTIONS = [
  { value: "draft", label: "Draft", color: "bg-muted text-muted-foreground" },
  { value: "scheduled", label: "Scheduled", color: "bg-primary/20 text-primary" },
  { value: "published", label: "Published", color: "bg-primary text-primary-foreground" },
  { value: "failed", label: "Failed", color: "bg-destructive/20 text-destructive" },
];

export async function fetchPosts(userId: string, filter?: string) {
  let query = supabase
    .from("content_posts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (filter && filter !== "all") {
    query = query.eq("status", filter);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ContentPost[];
}

export async function savePost(post: Partial<ContentPost> & { user_id: string }) {
  const { data, error } = await supabase
    .from("content_posts")
    .insert(post)
    .select()
    .single();
  if (error) throw error;
  return data as ContentPost;
}

export async function updatePost(id: string, updates: Partial<ContentPost>) {
  const { data, error } = await supabase
    .from("content_posts")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as ContentPost;
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("content_posts").delete().eq("id", id);
  if (error) throw error;
}

export async function generateContent(
  platform: string,
  tone: string,
  subject: string,
  referenceUrl?: string,
  variations: number = 1
): Promise<{ variations: ContentVariation[] }> {
  const { data, error } = await supabase.functions.invoke("generate-content", {
    body: { platform, tone, subject, referenceUrl, variations },
  });

  if (error) throw new Error(error.message);
  if (data.error) throw new Error(data.error);
  return data;
}

export async function uploadContentImage(file: File, userId: string): Promise<string> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("content-images").upload(path, file);
  if (error) throw error;

  const { data: urlData } = supabase.storage.from("content-images").getPublicUrl(path);
  return urlData.publicUrl;
}
