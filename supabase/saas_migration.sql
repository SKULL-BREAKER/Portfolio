-- SaaS Multi-Tenant Migration
-- 1. Add unique username column
ALTER TABLE profiles ADD COLUMN username TEXT UNIQUE;

-- 2. Give existing users a default username based on a part of their ID
UPDATE profiles 
SET username = 'user_' || substr(id::text, 1, 8) 
WHERE username IS NULL;

-- 3. Make username required going forward
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- 4. Update the trigger to automatically create a random username for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, headline, username)
  VALUES (
    NEW.id, 
    'Professional Portfolio', 
    'user_' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
