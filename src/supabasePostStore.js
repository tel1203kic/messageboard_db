const postFields = 'id, name, message, created_at';

function toApiPost(post) {
  return {
    id: post.id,
    name: post.name,
    message: post.message,
    createdAt: post.created_at,
  };
}

export class SupabasePostStore {
  constructor(client) {
    this.client = client;
  }

  async listPosts() {
    const { data, error } = await this.client
      .from('posts')
      .select(postFields)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map(toApiPost);
  }

  async createPost({ name, message }) {
    const { data, error } = await this.client
      .from('posts')
      .insert({ name, message })
      .select(postFields)
      .single();

    if (error) throw error;
    return toApiPost(data);
  }
}