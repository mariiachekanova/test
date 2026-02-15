-- Set the user brocksmartin0@gmail.com as admin
-- This updates the profile role to 'admin' for the user with this email
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'brocksmartin0@gmail.com';

-- Also update the raw_user_meta_data on auth.users as backup
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'brocksmartin0@gmail.com';
