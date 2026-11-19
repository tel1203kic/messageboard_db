-- Allow the server-only service role to read and create posts.
grant select, insert on table public.posts to service_role;