const form = document.querySelector('#post-form');
const formStatus = document.querySelector('#form-status');
const feedStatus = document.querySelector('#feed-status');
const postList = document.querySelector('#post-list');
const refreshButton = document.querySelector('#refresh-button');

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function renderPosts(posts) {
  postList.replaceChildren();

  for (const post of posts) {
    const item = document.createElement('li');
    item.className = 'post';

    const meta = document.createElement('div');
    meta.className = 'post-meta';

    const name = document.createElement('strong');
    name.className = 'post-name';
    name.textContent = post.name;

    const date = document.createElement('time');
    date.dateTime = post.createdAt;
    date.textContent = formatDate(post.createdAt);

    const message = document.createElement('p');
    message.className = 'post-message';
    message.textContent = post.message;

    meta.append(name, date);
    item.append(meta, message);
    postList.append(item);
  }

  feedStatus.textContent = posts.length ? `${posts.length} ${posts.length === 1 ? 'message' : 'messages'}` : 'No messages yet. Start the conversation.';
}

async function loadPosts() {
  feedStatus.textContent = 'Loading posts...';

  try {
    const response = await fetch('/api/posts');
    if (!response.ok) throw new Error('Could not load messages.');
    renderPosts(await response.json());
  } catch (error) {
    feedStatus.textContent = error.message || 'Could not load messages.';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const submitButton = form.querySelector('button[type="submit"]');
  const formData = new FormData(form);
  submitButton.disabled = true;
  formStatus.textContent = 'Posting message...';

  try {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        message: formData.get('message'),
      }),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Could not post your message.');

    form.reset();
    formStatus.textContent = 'Message posted.';
    await loadPosts();
  } catch (error) {
    formStatus.textContent = error.message || 'Could not post your message.';
  } finally {
    submitButton.disabled = false;
  }
});

refreshButton.addEventListener('click', loadPosts);
loadPosts();