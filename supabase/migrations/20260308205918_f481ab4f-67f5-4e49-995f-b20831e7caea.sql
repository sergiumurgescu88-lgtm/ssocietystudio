
-- Create agents table
CREATE TABLE public.agents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT 'bot',
  status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'working', 'error')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  system_prompt TEXT DEFAULT '',
  budget_limit NUMERIC(10,2) DEFAULT 100.00,
  autonomy INTEGER NOT NULL DEFAULT 1 CHECK (autonomy >= 0 AND autonomy <= 2),
  cost_today NUMERIC(10,2) DEFAULT 0.00,
  health INTEGER NOT NULL DEFAULT 100 CHECK (health >= 0 AND health <= 100),
  recently_updated BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, slug)
);

ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agents" ON public.agents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own agents" ON public.agents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own agents" ON public.agents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own agents" ON public.agents FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_agents_user_id ON public.agents(user_id);
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create agent_logs table
CREATE TABLE public.agent_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id UUID NOT NULL REFERENCES public.agents(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'decision' CHECK (type IN ('decision', 'action', 'error', 'test', 'config_change')),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own agent logs" ON public.agent_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own agent logs" ON public.agent_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_agent_logs_agent_id ON public.agent_logs(agent_id);

-- Seed default agents function (called per user on first visit)
-- We'll handle seeding in the app code instead

-- Create storage bucket for agent knowledge base
INSERT INTO storage.buckets (id, name, public) VALUES ('agent-knowledge', 'agent-knowledge', false);

CREATE POLICY "Users can upload agent knowledge" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'agent-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their agent knowledge" ON storage.objects FOR SELECT USING (bucket_id = 'agent-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their agent knowledge" ON storage.objects FOR DELETE USING (bucket_id = 'agent-knowledge' AND auth.uid()::text = (storage.foldername(name))[1]);
