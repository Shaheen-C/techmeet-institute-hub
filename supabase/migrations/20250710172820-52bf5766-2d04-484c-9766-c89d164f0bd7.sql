-- Create the user_role enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;