# messageboard_db

An open message board built with Node.js, Express, HTML, CSS, and JavaScript. The frontend and API are served by the same Express server. There is no login system.

## Requirements

- Node.js 20 or later
- npm

## Run the app

```sh
npm install
cp .env.example .env
# Edit .env and set your Supabase project URL and secret key.
npm start
```

Open http://localhost:3000 in your browser. Set the `PORT` environment variable to use a different port.

During development, run `npm run dev` to restart the server when files change.

## Set up the Supabase database

Link this repository to your Supabase project, inspect the migration status, and preview pending changes before applying them:

```sh
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

The migrations create `public.posts`, enable RLS, remove anonymous policies from an earlier version, and grant read/insert access only to the server's `service_role`, without deleting post rows. If `public.posts` already exists but its migration is not listed as applied, stop and check its schema and migration history before pushing.

## API and tests

- `GET /api/posts`: Returns posts in newest-first order.
- `POST /api/posts`: Accepts `{ "name": "Name", "message": "Your message" }` and returns the created post.

Names are limited to 80 characters and messages to 2,000 characters. Run the tests with `npm test`.

The API tests use in-memory and mocked stores. They do not connect to Supabase or write any database rows, so `npm test` is safe to run against a project that already has data. `GET /api/posts` is also read-only. A real `POST /api/posts` creates a persistent row; use a separate development project for live write testing.

Example:

```sh
curl http://localhost:3000/api/posts
curl -X POST http://localhost:3000/api/posts \
	-H 'Content-Type: application/json' \
	-d '{"name":"Guest","message":"Hello, board!"}'
```

## Storage

The app stores posts in the `public.posts` table using the server-side `@supabase/supabase-js` client. The server reads `SUPABASE_URL` and `SUPABASE_SECRET_KEY` from its environment. Copy `.env.example` to `.env` for local development; `.env` is ignored by Git. Never place the secret key in `public/` files or expose it to browsers.

Row-level security remains enabled, with no public policies. The server secret key bypasses RLS, so it must remain private. Avoid destructive database resets when testing with existing data. This sample does not include login or moderation; consider spam prevention before making it available on the public internet.
