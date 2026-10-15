CREATE TABLE public.saved_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL DEFAULT auth.uid(),
  tool TEXT NOT NULL CHECK (tool IN ('email','meeting','research')),
  title TEXT NOT NULL,
  input JSONB NOT NULL DEFAULT '{}'::jsonb,
  output TEXT NOT NULL,
  is_saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.saved_results TO authenticated;
GRANT ALL ON public.saved_results TO service_role;
ALTER TABLE public.saved_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own select" ON public.saved_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own insert" ON public.saved_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own update" ON public.saved_results FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own delete" ON public.saved_results FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX saved_results_user_idx ON public.saved_results(user_id, created_at DESC);