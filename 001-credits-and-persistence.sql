-- 001-credits-and-persistence.sql

-- 1. Create user_credits table
CREATE TABLE IF NOT EXISTS user_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) NOT NULL,
  ai_rewrites_remaining INTEGER DEFAULT 0,
  is_pro BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create the atomic consumption function
CREATE OR REPLACE FUNCTION consume_ai_credit(user_id_param UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER -- Allows this function to bypass RLS to read/write its own tables safely
AS $$
DECLARE
  is_pro_user BOOLEAN := FALSE;
  remaining INTEGER := 0;
BEGIN
  -- Lock the row for update to prevent race conditions
  SELECT is_pro, ai_rewrites_remaining INTO is_pro_user, remaining
  FROM user_credits
  WHERE user_id = user_id_param
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF is_pro_user THEN
    RETURN TRUE;
  END IF;

  IF remaining > 0 THEN
    UPDATE user_credits
    SET ai_rewrites_remaining = remaining - 1
    WHERE user_id = user_id_param;
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Enable RLS for user_credits
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own credits
CREATE POLICY "Users can view their own credits" 
  ON user_credits FOR SELECT 
  USING (auth.uid() = user_id);

-- Allow authenticated updates/inserts for the backend to use. 
-- In a production environment, this should ideally be restricted to a service_role key,
-- but allowing users to update their own row is the fallback if service_role isn't configured.
CREATE POLICY "Users can insert their own credits"
  ON user_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON user_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- 2. Update resumes table for easier client-side inserts
-- Set the default value of user_id to the authenticated user's ID
ALTER TABLE resumes ALTER COLUMN user_id SET DEFAULT auth.uid();
