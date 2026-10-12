INSERT INTO wpa_rate_limit_buckets(namespace, key, window_started_at, hits)
VALUES($1, $2, now(), 1)
ON CONFLICT(namespace, key) DO UPDATE SET
   window_started_at = CASE 
       WHEN wpa_rate_limit_buckets.window_started_at <= now() - ($3 || ' ms')::interval 
       THEN now() 
       ELSE wpa_rate_limit_buckets.window_started_at 
   END,
   hits = CASE 
       WHEN wpa_rate_limit_buckets.window_started_at <= now() - ($3 || ' ms')::interval 
       THEN 1 
       ELSE wpa_rate_limit_buckets.hits + 1 
   END,
   updated_at = now()
RETURNING hits, window_started_at;