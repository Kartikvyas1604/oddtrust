CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE fixtures (
  id TEXT PRIMARY KEY,
  sport_id INTEGER NOT NULL DEFAULT 0,
  competition_id TEXT NOT NULL DEFAULT '',
  season_id TEXT NOT NULL DEFAULT '',
  home_team TEXT NOT NULL,
  away_team TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled',
  home_score INTEGER,
  away_score INTEGER,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE odds_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id TEXT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  market_type TEXT NOT NULL,
  raw_odds JSONB NOT NULL,
  implied_probabilities JSONB NOT NULL,
  bookmaker_margin NUMERIC(10,6),
  snapshot_hash TEXT NOT NULL,
  txline_proof_ref TEXT,
  txline_timestamp TIMESTAMPTZ,
  ingested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fixture_id, market_type, snapshot_hash)
);

CREATE TABLE consistency_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixture_id TEXT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  market_set TEXT[] NOT NULL,
  summed_implied_probability NUMERIC(10,6) NOT NULL,
  is_consistent BOOLEAN NOT NULL,
  margin NUMERIC(10,6),
  optimal_stakes JSONB,
  odds_snapshot_hash TEXT NOT NULL,
  txline_proof_ref TEXT,
  on_chain_tx TEXT,
  on_chain_status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE proof_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_id UUID NOT NULL REFERENCES consistency_checks(id) ON DELETE CASCADE,
  fixture_id TEXT NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  consensus BOOLEAN NOT NULL,
  margin NUMERIC(10,6) NOT NULL,
  on_chain_slot BIGINT,
  on_chain_tx TEXT,
  summary TEXT NOT NULL,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_odds_snapshots_fixture ON odds_snapshots(fixture_id);
CREATE INDEX idx_odds_snapshots_hash ON odds_snapshots(snapshot_hash);
CREATE INDEX idx_consistency_checks_fixture ON consistency_checks(fixture_id);
CREATE INDEX idx_consistency_checks_status ON consistency_checks(on_chain_status);
CREATE INDEX idx_consistency_checks_created ON consistency_checks(created_at DESC);
CREATE INDEX idx_proof_log_fixture ON proof_log(fixture_id);
CREATE INDEX idx_proof_log_created ON proof_log(logged_at DESC);
