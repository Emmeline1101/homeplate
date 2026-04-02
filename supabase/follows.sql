-- follows: peer-to-peer follow graph
-- friends = mutual follow (both sides exist)

CREATE TABLE IF NOT EXISTS follows (
  follower_id  uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS follows_following_id_idx ON follows(following_id);

-- Denormalized counts on users table
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS follower_count  int NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS following_count int NOT NULL DEFAULT 0;

-- ── RLS ──────────────────────────────────────────────────────────────────────

ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Anyone can read the social graph (public profiles)
CREATE POLICY "follows_select_public" ON follows
  FOR SELECT USING (true);

-- Users can only follow as themselves
CREATE POLICY "follows_insert_own" ON follows
  FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- Users can only unfollow their own follows
CREATE POLICY "follows_delete_own" ON follows
  FOR DELETE USING (auth.uid() = follower_id);

-- ── Trigger: keep follower_count / following_count in sync ────────────────────

CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE users SET following_count = following_count + 1 WHERE id = NEW.follower_id;
    UPDATE users SET follower_count  = follower_count  + 1 WHERE id = NEW.following_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = OLD.follower_id;
    UPDATE users SET follower_count  = GREATEST(follower_count  - 1, 0) WHERE id = OLD.following_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS on_follow_change ON follows;
CREATE TRIGGER on_follow_change
  AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();
