-- Enable pg_cron and pg_net extensions for scheduling
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the cancel-expired-rides edge function every 5 minutes
SELECT cron.schedule(
  'cancel-expired-rides',
  '*/5 * * * *',
  $$
    SELECT net.http_post(
      url := 'https://cuzaaaukotasokgxqtpk.supabase.co/functions/v1/cancel-expired-rides',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1emFhYXVrb3Rhc29rZ3hxdHBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2OTA0NDMsImV4cCI6MjA5MTI2NjQ0M30.2sN6pUCEEDxk_ULSSrqgWRVsPHmrAdJ2r8DTgzsZBhI'
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);
