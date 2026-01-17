-- Token Accounting View
CREATE OR REPLACE VIEW usage_analytics AS
SELECT 
    user_id,
    org_id,
    -- Input Cost: Approx $0.0001 per 1k chars (Flash)
    SUM((metadata->>'input_chars')::int) as total_input_chars,
    -- Output Cost: Approx $0.0004 per 1k chars
    SUM((metadata->>'output_chars')::int) as total_output_chars,
    COUNT(*) as total_calls,
    MAX(created_at) as last_active
FROM audit_logs
GROUP BY user_id, org_id;
