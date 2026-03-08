
-- Create contacts table
CREATE TABLE public.contacts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  position TEXT,
  ai_score INTEGER NOT NULL DEFAULT 50 CHECK (ai_score >= 0 AND ai_score <= 100),
  status TEXT NOT NULL DEFAULT 'lead' CHECK (status IN ('lead', 'prospect', 'customer', 'churned', 'inactive')),
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'social', 'import', 'referral', 'manual')),
  notes TEXT,
  is_new BOOLEAN NOT NULL DEFAULT true,
  last_contact_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contacts" ON public.contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own contacts" ON public.contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own contacts" ON public.contacts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own contacts" ON public.contacts FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_contacts_user_id ON public.contacts(user_id);
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_ai_score ON public.contacts(ai_score);

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create contact_interactions table
CREATE TABLE public.contact_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID NOT NULL REFERENCES public.contacts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('email', 'call', 'note', 'meeting', 'ai_insight')),
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own interactions" ON public.contact_interactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own interactions" ON public.contact_interactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own interactions" ON public.contact_interactions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own interactions" ON public.contact_interactions FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_interactions_contact_id ON public.contact_interactions(contact_id);

-- Enable realtime for contacts
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
