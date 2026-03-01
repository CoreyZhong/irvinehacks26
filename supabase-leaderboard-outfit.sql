-- Run once in Supabase: SQL Editor → New query → paste and run.
-- Adds equipped_outfit_id to leaderboard_view so the leaderboard can show avatar popups.

drop view if exists public.leaderboard_view;

create view public.leaderboard_view as
  select
    p.id,
    p.username,
    coalesce(g.coins, 0) as coins,
    coalesce(g.coins_earned_lifetime, 0) as coins_earned_lifetime,
    (select count(*) from public.completed_quests c where c.user_id = p.id) as completed_count,
    g.equipped_outfit_id
  from public.profiles p
  left join public.user_game_state g on g.user_id = p.id;

alter view public.leaderboard_view set (security_invoker = on);
