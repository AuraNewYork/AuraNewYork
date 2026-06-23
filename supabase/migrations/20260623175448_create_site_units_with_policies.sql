CREATE TABLE IF NOT EXISTS site_units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building text NOT NULL,
  unit text NOT NULL,
  bed text,
  bath text,
  sqft text,
  status text,
  gross text,
  concession text,
  term text,
  net numeric,
  exposure text,
  balcony text,
  expiry text,
  video text,
  floor_plan text,
  matterport text,
  pics text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT site_units_building_unit_unique UNIQUE(building, unit)
);

ALTER TABLE site_units ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_units' AND policyname = 'public_read_site_units') THEN
    EXECUTE 'CREATE POLICY public_read_site_units ON site_units FOR SELECT TO anon, authenticated USING (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_units' AND policyname = 'admin_insert_site_units') THEN
    EXECUTE 'CREATE POLICY admin_insert_site_units ON site_units FOR INSERT TO authenticated WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_units' AND policyname = 'admin_update_site_units') THEN
    EXECUTE 'CREATE POLICY admin_update_site_units ON site_units FOR UPDATE TO authenticated USING (true) WITH CHECK (true)';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'site_units' AND policyname = 'admin_delete_site_units') THEN
    EXECUTE 'CREATE POLICY admin_delete_site_units ON site_units FOR DELETE TO authenticated USING (true)';
  END IF;
END $$;