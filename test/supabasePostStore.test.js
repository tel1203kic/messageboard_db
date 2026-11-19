import assert from 'node:assert/strict';
import { test } from 'node:test';
import { SupabasePostStore } from '../src/supabasePostStore.js';

test('reads posts in newest-first order and maps database fields', async () => {
  const calls = [];
  const rows = [{
    id: 'post-id',
    name: 'Guest',
    message: 'Hello',
    created_at: '2026-11-05T12:00:00.000Z',
  }];
  const client = {
    from(table) {
      calls.push(['from', table]);
      return {
        select(fields) {
          calls.push(['select', fields]);
          return this;
        },
        order(column, options) {
          calls.push(['order', column, options]);
          return Promise.resolve({ data: rows, error: null });
        },
      };
    },
  };

  const posts = await new SupabasePostStore(client).listPosts();

  assert.deepEqual(posts, [{
    id: 'post-id',
    name: 'Guest',
    message: 'Hello',
    createdAt: '2026-11-05T12:00:00.000Z',
  }]);
  assert.deepEqual(calls.at(-1), ['order', 'created_at', { ascending: false }]);
});

test('inserts a post and returns its database-generated fields', async () => {
  const calls = [];
  const row = {
    id: 'post-id',
    name: 'Guest',
    message: 'Hello',
    created_at: '2026-11-05T12:00:00.000Z',
  };
  const client = {
    from(table) {
      calls.push(['from', table]);
      return {
        insert(values) {
          calls.push(['insert', values]);
          return this;
        },
        select(fields) {
          calls.push(['select', fields]);
          return this;
        },
        single() {
          return Promise.resolve({ data: row, error: null });
        },
      };
    },
  };

  const post = await new SupabasePostStore(client).createPost({ name: 'Guest', message: 'Hello' });

  assert.deepEqual(post, {
    id: 'post-id',
    name: 'Guest',
    message: 'Hello',
    createdAt: '2026-11-05T12:00:00.000Z',
  });
  assert.deepEqual(calls[1], ['insert', { name: 'Guest', message: 'Hello' }]);
});