-- Seed reserved usernames. Conservative list — captures all routes in app/
-- plus brand/admin/legal/common reserved tokens. Add to this list rather than
-- hardcoding in app code (spec §10: "enforced in DB constraint, not just app").

INSERT INTO "reserved_usernames" ("username") VALUES
  -- routes
  ('admin'), ('api'), ('app'), ('login'), ('signup'), ('logout'),
  ('dashboard'), ('settings'), ('account'), ('billing'), ('callback'),
  ('analytics'), ('audience'), ('appearance'), ('forgot-password'),
  ('pricing'), ('terms'), ('privacy'), ('blog'), ('help'), ('support'),
  ('docs'), ('contact'), ('about'), ('press'), ('legal'),
  -- internet conventions
  ('www'), ('mail'), ('email'), ('ftp'), ('smtp'), ('imap'), ('pop'),
  ('ssh'), ('ssl'), ('tls'), ('cdn'), ('static'), ('assets'),
  -- brand / squat protection
  ('linkintree'), ('linktree'), ('linktr'), ('lnk'),
  -- common platform names to prevent impersonation
  ('claude'), ('anthropic'), ('openai'), ('google'), ('apple'),
  ('meta'), ('facebook'), ('instagram'), ('twitter'), ('x'),
  ('tiktok'), ('youtube'), ('spotify'), ('stripe'), ('supabase'),
  -- short / generic
  ('null'), ('undefined'), ('true'), ('false'),
  ('test'), ('demo'), ('staging'), ('dev'), ('prod'),
  ('me'), ('you'), ('us')
ON CONFLICT DO NOTHING;
