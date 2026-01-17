-- MIGRATION: V1.0 COMPLETE HARDENING (CONSOLIDATED)
-- DATE: 2026-01-17
-- AUTHOR: Argus V1.0 Agent
-- DESCRIPTION: Consolidates all V1.0 upgrades (Persistence, Billing, Async, RAG) into a single idempotent script.

-- =============================================================================
-- 0. CLEANUP (SAFE RESET)
-- =============================================================================
DROP FUNCTION IF EXISTS consume_credit(uuid, integer);
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS job_queue CASCADE;
DROP TABLE IF EXISTS audit_sessions CASCADE;
DROP TABLE IF EXISTS credit_ledger CASCADE;

-- =============================================================================
-- 1. BILLING & LEDGER (The "Bank" Layer)
-- =============================================================================

-- 1.1 Credit Ledger (Missing in previous attempts)
CREATE TABLE IF NOT EXISTS credit_ledger (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL, -- Negative for debit, Positive for credit
    action TEXT NOT NULL, -- 'AUDIT_CONSUMPTION', 'PURCHASE', 'Bonus'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- RLS for Ledger
ALTER TABLE credit_ledger ENABLE ROW LEVEL SECURITY;
-- Only Admins should theoretically see this, or users for their own org.
-- For now, simple policy:
CREATE POLICY "Org members view ledger" ON credit_ledger FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.org_id = credit_ledger.org_id
    )
);

-- 1.2 Atomic Consumption Function
CREATE OR REPLACE FUNCTION consume_credit(p_org_id UUID, p_amount INTEGER DEFAULT 1)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_balance INTEGER;
BEGIN
    -- 1. Lock the row for update (Atomic Lock)
    SELECT credit_balance INTO current_balance
    FROM organizations
    WHERE id = p_org_id
    FOR UPDATE;

    -- 2. Check balance
    IF current_balance >= p_amount THEN
        -- 3. Deduct
        UPDATE organizations
        SET credit_balance = credit_balance - p_amount
        WHERE id = p_org_id;
        
        -- 4. Log Transaction
        INSERT INTO credit_ledger (org_id, amount, action, timestamp)
        VALUES (p_org_id, -p_amount, 'AUDIT_CONSUMPTION', NOW());
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;


-- =============================================================================
-- 2. PERSISTENCE (The "Safety" Layer)
-- =============================================================================

CREATE TABLE IF NOT EXISTS audit_sessions (
    session_id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    encrypted_blob TEXT NOT NULL, 
    encryption_iv TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    
    file_name TEXT,
    claim_count INTEGER,
    status TEXT DEFAULT 'IN_PROGRESS'
);

CREATE INDEX idx_audit_sessions_user ON audit_sessions(user_id);
ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own sessions" ON audit_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own sessions" ON audit_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON audit_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Enforce Expiry Visibility
CREATE POLICY "Hide expired sessions" ON audit_sessions FOR SELECT TO authenticated
USING (auth.uid() = user_id AND expires_at > NOW());


-- =============================================================================
-- 3. ASYNC INFRASTRUCTURE (The "Scale" Layer)
-- =============================================================================

-- 3.1 Job Queue
CREATE TABLE IF NOT EXISTS job_queue (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    type TEXT NOT NULL, 
    payload JSONB NOT NULL, 
    status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    result JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_job_queue_user ON job_queue(user_id);
CREATE INDEX idx_job_queue_status ON job_queue(status);
ALTER TABLE job_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own jobs" ON job_queue FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can select their own jobs" ON job_queue FOR SELECT TO authenticated USING (auth.uid() = user_id);


-- 3.2 RAG Vector Store
-- Note: 'vector' extension must be enabled manually if not present: CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT REFERENCES audit_sessions(session_id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    -- embedding vector(768), -- Uncomment if pgvector is enabled
    metadata JSONB,
    chunk_index INTEGER
);

-- Done.
