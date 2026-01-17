-- Add prompt and summary fields to builds table
ALTER TABLE public.builds
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Add index for searching builds by prompt
CREATE INDEX IF NOT EXISTS idx_builds_prompt ON public.builds USING gin(to_tsvector('english', prompt));
