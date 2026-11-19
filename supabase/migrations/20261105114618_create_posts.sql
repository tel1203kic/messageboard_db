-- Store public message board posts.
create table public.posts (
	id uuid primary key default gen_random_uuid(),
	name text not null
		constraint posts_name_length_check
		check (name ~ '[^[:space:]]' and char_length(name) <= 80),
	message text not null
		constraint posts_message_length_check
		check (message ~ '[^[:space:]]' and char_length(message) <= 2000),
	created_at timestamptz not null default now()
);

-- Keep the newest posts first when loading the public board.
create index posts_created_at_idx on public.posts (created_at desc);

-- Keep row-level security enabled. The server uses a secret key and bypasses RLS.
alter table public.posts enable row level security;
