-- Semaphores for Concurrency Control
CREATE TABLE IF NOT EXISTS system_semaphores (
    key TEXT PRIMARY KEY,
    current_count INTEGER DEFAULT 0,
    max_count INTEGER DEFAULT 50, -- Max Concurrent Heavy Audits
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Initialize
INSERT INTO system_semaphores (key, max_count) VALUES ('active_audits', 50) ON CONFLICT DO NOTHING;

-- Function to Acquire Lock
CREATE OR REPLACE FUNCTION acquire_semaphore(p_key TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    v_current INTEGER;
    v_max INTEGER;
BEGIN
    SELECT current_count, max_count INTO v_current, v_max 
    FROM system_semaphores WHERE key = p_key FOR UPDATE;

    IF v_current < v_max THEN
        UPDATE system_semaphores SET current_count = current_count + 1 WHERE key = p_key;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to Release Lock
CREATE OR REPLACE FUNCTION release_semaphore(p_key TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE system_semaphores 
    SET current_count = GREATEST(0, current_count - 1) 
    WHERE key = p_key;
END;
$$ LANGUAGE plpgsql;
