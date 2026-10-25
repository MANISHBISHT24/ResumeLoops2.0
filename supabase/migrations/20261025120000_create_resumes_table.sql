-- ResumeLoops — Phase 3J: Cloud Database Migration
-- Creates the versioned 'resumes' table with Row Level Security (RLS)
-- and prepares architecture for Phase 3K uploaded_resume_analyses.

-- 1. Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create resumes table
CREATE TABLE IF NOT EXISTS public.resumes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_role TEXT,
  target_company TEXT,
  template_id TEXT NOT NULL DEFAULT 'swiss-chronicle',
  document_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  ats_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Constraints
  CONSTRAINT title_not_empty CHECK (char_length(trim(title)) > 0),
  CONSTRAINT valid_ats_score CHECK (ats_score IS NULL OR (ats_score >= 0 AND ats_score <= 100))
);

-- 3. Automatic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_resumes_updated_at ON public.resumes;
CREATE TRIGGER set_resumes_updated_at
  BEFORE UPDATE ON public.resumes
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Performance & Query Indexes
CREATE INDEX IF NOT EXISTS resumes_user_id_idx ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS resumes_updated_at_idx ON public.resumes(updated_at DESC);
CREATE INDEX IF NOT EXISTS resumes_template_id_idx ON public.resumes(template_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies: strict user isolation based on auth.uid()
-- SELECT: Users can only view their own resume records
DROP POLICY IF EXISTS "Users can view their own resumes" ON public.resumes;
CREATE POLICY "Users can view their own resumes"
  ON public.resumes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- INSERT: Users can only insert records where user_id matches their authenticated id
DROP POLICY IF EXISTS "Users can insert their own resumes" ON public.resumes;
CREATE POLICY "Users can insert their own resumes"
  ON public.resumes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Users can only update their own records, and cannot change user_id ownership
DROP POLICY IF EXISTS "Users can update their own resumes" ON public.resumes;
CREATE POLICY "Users can update their own resumes"
  ON public.resumes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- DELETE: Users can only delete their own records
DROP POLICY IF EXISTS "Users can delete their own resumes" ON public.resumes;
CREATE POLICY "Users can delete their own resumes"
  ON public.resumes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 7. Phase 3K Architecture Forward-Compatibility
-- Future table for uploaded document file analyses (PDF/DOCX)
-- Preserves clean boundary between structured builder resumes and uploaded binary analyses.
CREATE TABLE IF NOT EXISTS public.uploaded_resume_analyses (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT,
  extracted_text TEXT,
  ats_score INTEGER,
  analysis_results JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.uploaded_resume_analyses ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS uploaded_analyses_user_id_idx ON public.uploaded_resume_analyses(user_id);

DROP POLICY IF EXISTS "Users can view their own uploaded analyses" ON public.uploaded_resume_analyses;
CREATE POLICY "Users can view their own uploaded analyses"
  ON public.uploaded_resume_analyses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own uploaded analyses" ON public.uploaded_resume_analyses;
CREATE POLICY "Users can insert their own uploaded analyses"
  ON public.uploaded_resume_analyses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own uploaded analyses" ON public.uploaded_resume_analyses;
CREATE POLICY "Users can delete their own uploaded analyses"
  ON public.uploaded_resume_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
