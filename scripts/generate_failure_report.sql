-- "The Pulse of Science" Report Query
SELECT 
    field,
    failure_mode,
    COUNT(*) as frequency,
    ROUND(AVG(score), 2) as avg_score
FROM metadata_logs
GROUP BY field, failure_mode
ORDER BY frequency DESC;
