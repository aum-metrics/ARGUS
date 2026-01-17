-- MIGRATION: V1.0 Phase 5 - Advanced Infrastructure
-- AUTHOR: Argus V1.0 Agent
-- DATE: 2026-01-17

-- -----------------------------------------------------------------------------
-- 1. ASYNC JOB QUEUE
-- Goal: Handle long-running tasks (Thesis Destroyer) properly.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS job_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, -- 'THESIS_AUDIT', 'OCR_PROCESS', etc.
    payload JSONB NOT NULL, -- Input parameters
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    result JSONB, -- Final output
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_queue_user ON job_queue(user_id);
CREATE INDEX idx_job_queue_status ON job_queue(status);

-- RLS
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own jobs"
ON job_queue FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own jobs"
ON job_queue FOR SELECT TO authenticated
USING (auth.uid() = user_id);


-- -----------------------------------------------------------------------------
-- 2. RAG VECTOR STORE
-- Goal: Semantic Search for Long Contexts.
-- Note: Requires 'vector' extension. Run "CREATE EXTENSION IF NOT EXISTS vector;" manually if needed.
-- -----------------------------------------------------------------------------

-- Attempt to enable extension (May require superuser)
-- CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT REFERENCES audit_sessions(session_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    -- embedding vector(768), -- Gemini Embedding Dimensions. Uncomment if vector extension is active.
    metadata JSONB,
    chunk_index INTEGER
);

-- Note: We comment out the 'embedding' column for safety in this migration script 
-- because we cannot verify if 'vector' extension is installed on the user's Supabase instance via migration alone without potentially causing an error.
-- To enable RAG, the user must run:
-- 1. CREATE EXTENSION vector;
-- 2. ALTER TABLE document_chunks ADD COLUMN embedding vector(768);
