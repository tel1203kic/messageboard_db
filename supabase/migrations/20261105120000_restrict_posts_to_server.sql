-- Keep post access on the server and remove policies from older versions.
alter table public.posts enable row level security;

drop policy if exists "Anyone can read posts" on public.posts;
drop policy if exists "Anyone can submit posts" on public.posts;

revoke all on table public.posts from public, anon, authenticated;

grant select, insert on table public.posts to service_role;