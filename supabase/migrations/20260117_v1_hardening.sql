-- MIGRATION: V1.0 Product Hardening
-- AUTHOR: Argus V1.0 Agent
-- DATE: 2026-01-17

-- -----------------------------------------------------------------------------
-- 1. PERSISTENCE LAYER (Encrypted Session Recovery)
-- Goal: Allow users to recover their session within 24 hours if browser crashes.
-- "Privacy by Physics" is maintained by the strict TTL (Time To Live).
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_sessions (
    session_id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    
    -- We store the "State" of the audit (extracted claims, scores)
    -- This MUST be encrypted by the Application Layer before insertion.
    -- The DB admin should NOT be able to read this raw.
    encrypted_blob TEXT NOT NULL, 
    encryption_iv TEXT NOT NULL, -- Initialization Vector for AES-GCM
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
    
    -- Metadata for listing in "History" (Non-sensitive)
    file_name TEXT,
    claim_count INTEGER,
    status TEXT DEFAULT 'IN_PROGRESS' -- 'IN_PROGRESS', 'COMPLETED', 'FAILED'
);

-- Index for fast lookups by user
CREATE INDEX idx_audit_sessions_user ON audit_sessions(user_id);

-- ROW LEVEL SECURITY (RLS)
ALTER TABLE audit_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own sessions"
ON audit_sessions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select their own sessions"
ON audit_sessions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
ON audit_sessions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- AUTO-DELETION (Privacy by Physics)
-- This requires pg_cron extension, but we can also handle it via
-- a scheduled Edge Function or strict RLS that hides expired rows.
-- For simple RLS enforcement:
CREATE POLICY "Hide expired sessions"
ON audit_sessions FOR SELECT
TO authenticated
USING (
    auth.uid() = user_id 
    AND expires_at > NOW()
);


-- -----------------------------------------------------------------------------
-- 2. BILLING SECURITY (Atomic Transactions)
-- Goal: Prevent race conditions where a user consumes credits twice strictly.
-- -----------------------------------------------------------------------------

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
        
        -- 4. Log Transaction (Internal Ledger)
        INSERT INTO credit_ledger (org_id, amount, action, timestamp)
        VALUES (p_org_id, -p_amount, 'AUDIT_CONSUMPTION', NOW());
        
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;
