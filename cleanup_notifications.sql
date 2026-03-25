-- 1. Enable the pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 2. Create the cleanup function
CREATE OR REPLACE FUNCTION public.delete_old_notifications()
RETURNS void AS $$
BEGIN
    DELETE FROM public.notifications
    WHERE created_at < NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Schedule the function to run every day at midnight
-- Note: You can also use '0 * * * *' for hourly if 24h is too long to wait for the first run
SELECT cron.schedule('cleanup-notifications', '0 0 * * *', 'SELECT public.delete_old_notifications()');

-- 4. (Optional) Run once immediately
SELECT public.delete_old_notifications();
