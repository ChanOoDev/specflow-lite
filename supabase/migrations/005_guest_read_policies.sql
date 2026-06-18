-- Allow public read access to all data for guest mode (MVP)
-- Run this in Supabase Dashboard → SQL Editor (https://supabase.com/dashboard/project/avgtvtpjiswrgndvirvu/sql/new)
-- Safe to re-run — drops old policy if exists, then recreates

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read projects" ON projects;
  CREATE POLICY "Anyone can read projects" ON projects FOR SELECT USING (true);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read requirements" ON requirements;
  CREATE POLICY "Anyone can read requirements" ON requirements FOR SELECT USING (true);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read specifications" ON specifications;
  CREATE POLICY "Anyone can read specifications" ON specifications FOR SELECT USING (true);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read tasks" ON tasks;
  CREATE POLICY "Anyone can read tasks" ON tasks FOR SELECT USING (true);
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can read spec requirements" ON specification_requirements;
  CREATE POLICY "Anyone can read spec requirements" ON specification_requirements FOR SELECT USING (true);
END $$;
