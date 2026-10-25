-- ResumeLoops — Phase 3K: Uploaded Resumes Storage & Analysis Persistence
-- Idempotent additive migration for private storage bucket, storage policies,
-- and enhanced schema for uploaded_resume_analyses.

-- 1. Additive columns and constraints on public.uploaded_resume_analyses
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'uploaded_resume_analyses' 
      AND column_name = 'job_description'
  ) THEN
    ALTER TABLE public.uploaded_resume_analyses ADD COLUMN job_description TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'uploaded_resume_analyses' 
      AND column_name = 'mime_type'
  ) THEN
    ALTER TABLE public.uploaded_resume_analyses ADD COLUMN mime_type TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'uploaded_resume_analyses' 
      AND column_name = 'status'
  ) THEN
    ALTER TABLE public.uploaded_resume_analyses ADD COLUMN status TEXT NOT NULL DEFAULT 'completed';
  END IF;
END $$;

-- 2. Indexes on uploaded_resume_analyses
CREATE INDEX IF NOT EXISTS uploaded_analyses_updated_at_idx 
  ON public.uploaded_resume_analyses(updated_at DESC);

-- 3. Automatic updated_at trigger for uploaded_resume_analyses
DROP TRIGGER IF EXISTS set_uploaded_resume_analyses_updated_at ON public.uploaded_resume_analyses;
CREATE TRIGGER set_uploaded_resume_analyses_updated_at
  BEFORE UPDATE ON public.uploaded_resume_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. Complete RLS Policies on public.uploaded_resume_analyses
-- Ensure SELECT, INSERT, UPDATE, and DELETE policies exist
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

DROP POLICY IF EXISTS "Users can update their own uploaded analyses" ON public.uploaded_resume_analyses;
CREATE POLICY "Users can update their own uploaded analyses"
  ON public.uploaded_resume_analyses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own uploaded analyses" ON public.uploaded_resume_analyses;
CREATE POLICY "Users can delete their own uploaded analyses"
  ON public.uploaded_resume_analyses
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 5. Supabase Storage Bucket Setup
-- Create private 'uploaded-resumes' bucket with 10MB file limit and restricted MIME types
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploaded-resumes',
  'uploaded-resumes',
  false,
  10485760, -- 10 MB in bytes
  ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]::text[];

-- 6. Storage RLS Policies for 'uploaded-resumes'
-- Files are stored under {user_id}/{random_uuid}.{ext}
-- RLS strictly enforces that auth.uid() matches the first path component.

-- Policy: Authenticated users can upload to their own user directory
DROP POLICY IF EXISTS "Authenticated users can upload resumes to their own folder" ON storage.objects;
CREATE POLICY "Authenticated users can upload resumes to their own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'uploaded-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can view/download their own uploaded resumes
DROP POLICY IF EXISTS "Authenticated users can read their own uploaded resumes" ON storage.objects;
CREATE POLICY "Authenticated users can read their own uploaded resumes"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'uploaded-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can update their own uploaded resumes
DROP POLICY IF EXISTS "Authenticated users can update their own uploaded resumes" ON storage.objects;
CREATE POLICY "Authenticated users can update their own uploaded resumes"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'uploaded-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'uploaded-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Policy: Authenticated users can delete their own uploaded resumes
DROP POLICY IF EXISTS "Authenticated users can delete their own uploaded resumes" ON storage.objects;
CREATE POLICY "Authenticated users can delete their own uploaded resumes"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'uploaded-resumes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
