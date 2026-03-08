
CREATE TABLE public.content_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL DEFAULT 'linkedin',
  tone text NOT NULL DEFAULT 'professional',
  subject text NOT NULL DEFAULT '',
  reference_url text,
  content text NOT NULL DEFAULT '',
  hashtags text[] DEFAULT '{}',
  image_url text,
  status text NOT NULL DEFAULT 'draft',
  scheduled_at timestamptz,
  published_at timestamptz,
  variation_group uuid,
  is_template boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own posts" ON public.content_posts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own posts" ON public.content_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON public.content_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.content_posts FOR DELETE USING (auth.uid() = user_id);

-- Storage bucket for content images
INSERT INTO storage.buckets (id, name, public) VALUES ('content-images', 'content-images', true);

CREATE POLICY "Users can upload content images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'content-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can view content images" ON storage.objects FOR SELECT USING (bucket_id = 'content-images');
CREATE POLICY "Users can delete their content images" ON storage.objects FOR DELETE USING (bucket_id = 'content-images' AND auth.role() = 'authenticated');
