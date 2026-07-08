CREATE TABLE IF NOT EXISTS sync_journal (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL DEFAULT 'running',
  fixture_count INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS oracle_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO oracle_config (key, value, updated_at)
VALUES ('consistency_threshold_bps', '0', NOW())
ON CONFLICT (key) DO NOTHING;

INSERT INTO oracle_config (key, value, updated_at)
VALUES ('ingestion_enabled', 'true', NOW())
ON CONFLICT (key) DO NOTHING;

INSERT INTO oracle_config (key, value, updated_at)
VALUES ('chain_submission_enabled', 'false', NOW())
ON CONFLICT (key) DO NOTHING;

ALTER TABLE odds_snapshots ADD COLUMN IF NOT EXISTS markets JSONB DEFAULT '[]'::jsonb;
ALTER TABLE odds_snapshots ADD COLUMN IF NOT EXISTS proof_ref TEXT;

ALTER TABLE consistency_checks ADD COLUMN IF NOT EXISTS margin_bps INTEGER DEFAULT 0;
ALTER TABLE consistency_checks ADD COLUMN IF NOT EXISTS odds_snapshot_hash TEXT NOT NULL DEFAULT '';
ALTER TABLE consistency_checks DROP CONSTRAINT IF EXISTS consistency_checks_fixture_id_fkey;

ALTER TABLE proof_log ADD COLUMN IF NOT EXISTS action TEXT NOT NULL DEFAULT 'CHECK';
ALTER TABLE proof_log ADD COLUMN IF NOT EXISTS slot BIGINT;
ALTER TABLE proof_log ADD COLUMN IF NOT EXISTS signature TEXT;
ALTER TABLE proof_log ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;
ALTER TABLE proof_log DROP CONSTRAINT IF EXISTS proof_log_check_id_fkey;
ALTER TABLE proof_log DROP CONSTRAINT IF EXISTS proof_log_fixture_id_fkey;
ALTER TABLE proof_log ALTER COLUMN margin DROP NOT NULL;
ALTER TABLE proof_log ALTER COLUMN summary DROP NOT NULL;
