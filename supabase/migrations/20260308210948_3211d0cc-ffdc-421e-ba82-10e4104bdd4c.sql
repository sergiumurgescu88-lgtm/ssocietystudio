
CREATE TABLE public.workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Workflow nou',
  description text,
  steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_active boolean NOT NULL DEFAULT false,
  is_template boolean NOT NULL DEFAULT false,
  last_run_at timestamptz,
  last_run_status text,
  run_count integer NOT NULL DEFAULT 0,
  fail_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflows" ON public.workflows FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workflows" ON public.workflows FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own workflows" ON public.workflows FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own workflows" ON public.workflows FOR DELETE USING (auth.uid() = user_id);

CREATE TABLE public.workflow_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid NOT NULL REFERENCES public.workflows(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'success',
  message text,
  step_index integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own workflow logs" ON public.workflow_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own workflow logs" ON public.workflow_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
