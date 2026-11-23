-- Show the leaderboard at the end of each round instead of every N
-- questions. Mark the last question of each round; when any question in a
-- session is marked, the every-N rule is ignored for that session.
alter table public.questions
  add column if not exists leaderboard_after boolean not null default false;

notify pgrst, 'reload schema';
