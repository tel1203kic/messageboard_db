import { randomUUID } from 'node:crypto';

export class MemoryPostStore {
  #posts = [];

  async listPosts() {
    return [...this.#posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createPost({ name, message }) {
    const post = {
      id: randomUUID(),
      name,
      message,
      createdAt: new Date().toISOString(),
    };

    this.#posts.unshift(post);
    return post;
  }
}