import express from 'express';
import { fileURLToPath } from 'node:url';
import { MemoryPostStore } from './memoryPostStore.js';

const publicDirectory = fileURLToPath(new URL('../public/', import.meta.url));
const maximumNameLength = 80;
const maximumMessageLength = 2000;

export function createApp(postStore = new MemoryPostStore()) {
  const app = express();

  app.use(express.json({ limit: '16kb' }));
  app.use(express.static(publicDirectory));

  app.get('/api/posts', async (_request, response, next) => {
    try {
      response.json(await postStore.listPosts());
    } catch (error) {
      next(error);
    }
  });

  app.post('/api/posts', async (request, response, next) => {
    const name = typeof request.body?.name === 'string' ? request.body.name.trim() : '';
    const message = typeof request.body?.message === 'string' ? request.body.message.trim() : '';

    if (!name || !message) {
      return response.status(400).json({ error: 'Enter both your name and a message.' });
    }

    if (name.length > maximumNameLength || message.length > maximumMessageLength) {
      return response.status(400).json({ error: 'Name must be 80 characters or fewer and message must be 2,000 characters or fewer.' });
    }

    try {
      response.status(201).json(await postStore.createPost({ name, message }));
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _request, response, _next) => {
    if (error instanceof SyntaxError && 'body' in error) {
      return response.status(400).json({ error: 'Invalid JSON request.' });
    }

    if (error.type === 'entity.too.large') {
      return response.status(413).json({ error: 'Request is too large.' });
    }

    console.error(error);
    response.status(500).json({ error: 'An unexpected server error occurred.' });
  });

  return app;
}