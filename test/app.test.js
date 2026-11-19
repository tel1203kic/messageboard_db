import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import { createApp } from '../src/app.js';
import { MemoryPostStore } from '../src/memoryPostStore.js';

const server = createApp(new MemoryPostStore()).listen(0);
const address = await new Promise((resolve) => server.once('listening', () => resolve(server.address())));
const baseUrl = `http://127.0.0.1:${address.port}`;

after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));

test('serves the frontend from the API server', async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /Open Message Board/);
});

test('creates posts and lists newest first', async () => {
  for (const message of ['first', 'second']) {
    const response = await fetch(`${baseUrl}/api/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: ' Guest ', message }),
    });
    assert.equal(response.status, 201);
  }

  const response = await fetch(`${baseUrl}/api/posts`);
  const posts = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(posts.map((post) => post.message), ['second', 'first']);
  assert.equal(posts[0].name, 'Guest');
  assert.ok(posts[0].id);
  assert.ok(posts[0].createdAt);
});

test('rejects missing and overlong fields', async () => {
  const missing = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Guest', message: '  ' }),
  });
  const overlong = await fetch(`${baseUrl}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'G'.repeat(81), message: 'Hello' }),
  });

  assert.equal(missing.status, 400);
  assert.equal(overlong.status, 400);
});