-- Migration: 011_create_notification_preferences_and_push_tokens.sql
-- Description: Create notification_preferences and push_tokens tables for push notifications

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  push_enabled BOOLEAN DEFAULT true,
  ride_requests BOOLEAN DEFAULT true,
  ride_updates BOOLEAN DEFAULT true,
  messages BOOLEAN DEFAULT true,
  safety_alerts BOOLEAN DEFAULT true,
  promotional BOOLEAN DEFAULT false,
  ratings BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS push_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  UNIQUE(user_id, token)
);

-- Enable Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users manage own notification preferences" ON notification_preferences
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users manage own push tokens" ON push_tokens
  FOR ALL USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_user_id ON push_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_push_tokens_token ON push_tokens(token);

-- Add comments
COMMENT ON TABLE notification_preferences IS 'User notification preferences for push notifications';
COMMENT ON COLUMN notification_preferences.user_id IS 'Reference to the user';
COMMENT ON COLUMN notification_preferences.push_enabled IS 'Master toggle for all push notifications';
COMMENT ON COLUMN notification_preferences.ride_requests IS 'Notifications for ride requests';
COMMENT ON COLUMN notification_preferences.ride_updates IS 'Notifications for ride updates';
COMMENT ON COLUMN notification_preferences.messages IS 'Notifications for messages';
COMMENT ON COLUMN notification_preferences.safety_alerts IS 'Notifications for safety alerts';
COMMENT ON COLUMN notification_preferences.promotional IS 'Notifications for promotional content';
COMMENT ON COLUMN notification_preferences.ratings IS 'Notifications for ratings';
COMMENT ON COLUMN notification_preferences.updated_at IS 'Last update timestamp';

COMMENT ON TABLE push_tokens IS 'Push notification tokens for users';
COMMENT ON COLUMN push_tokens.user_id IS 'Reference to the user';
COMMENT ON COLUMN push_tokens.token IS 'Expo push token';

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
