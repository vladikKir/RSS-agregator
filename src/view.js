import onChange from 'on-change';

const makeInputStyle = (input, value) => {
  input.removeAttribute('readonly');
  switch (value) {
    case 'invalid':
      input.classList.add('is-invalid');
      break;
    case 'valid':
      input.classList.remove('is-invalid');
      input.value = '';
      break;
    case 'checking':
      input.setAttribute('readonly', 'true');
      input.classList.remove('is-invalid');
      break;
    default:
      throw new Error(`${value} is an unexpected input status`);
  }
};

const makeStatusMessageStyle = (statusMessage, i18nextInstanse, value) => {
  statusMessage.classList.remove('text-danger');
  switch (value) {
    case 'adding':
      statusMessage.textContent = '';
      break;
    case 'success':
      statusMessage.classList.add('text-success');
      statusMessage.textContent = i18nextInstanse.t(`rssStatusMessage.${value}`);
      break;
    default:
      statusMessage.classList.add('text-danger');
      statusMessage.textContent = i18nextInstanse.t(`rssStatusMessage.${value}`);
      break;
  }
};

const makeContainer = (type, i18nextInstanse) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  container.append(cardBody);
  cardBody.classList.add('card-body');
  const header = document.createElement('h2');
  cardBody.append(header);
  header.classList.add('card-title', 'h4');
  header.textContent = type === 'feeds' ? i18nextInstanse.t('feeds.title') : i18nextInstanse.t('posts.title');
  const list = document.createElement('ul');
  cardBody.append(list);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return container;
};

const makePosts = (postsEl, i18nextInstanse, postList) => {
  postsEl.innerHTML = '';
  if (postList.length === 0) {
    return;
  }
  const posts = makeContainer('posts', i18nextInstanse);
  const list = posts.querySelector('ul');
  postList.forEach((el) => {
    const post = document.createElement('li');
    post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const a = document.createElement('a');
    post.append(a);
    a.href = el.link;
    a.classList.add('fw-bold');
    a.setAttribute('target', '_blank');
    a.setAttribute('data-id', el.id);
    a.setAttribute('rel', 'noopener');
    a.setAttribute('rel', 'noreffer');
    a.textContent = el.title;
    const button = document.createElement('button');
    post.append(button);
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', el.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18nextInstanse.t('posts.button');
    list.append(post);
  });
  postsEl.append(posts);
};

const makeFeeds = (feedsEl, i18nextInstanse, feedList) => {
  feedsEl.innerHTML = '';
  if (feedList.length === 0) {
    return;
  }
  const feeds = makeContainer('feeds', i18nextInstanse);
  const list = feeds.querySelector('ul');
  feedList.forEach((el) => {
    const feed = document.createElement('li');
    feed.classList.add('list-group-item', 'border-0', 'border-end-0');
    const feedHeader = document.createElement('h3');
    feed.append(feedHeader);
    feedHeader.classList.add('h6', 'm-0');
    feedHeader.textContent = el.title;
    const description = document.createElement('p');
    feed.append(description);
    description.classList.add('m-0', 'small', 'text-black-50');
    description.textContent = el.description;
    list.append(feed);
  });
  feedsEl.append(feeds);
};

const makeSeenPosts = (id) => {
  const seenPost = document.querySelector(`a[data-id="${id}"]`);
  seenPost.classList.remove('fw-bold');
  seenPost.classList.add('fw-normal', 'link-secondary');
};

const makeModalWindow = (modalEl, modalState) => {
  const title = modalEl.querySelector('.modal-title');
  const body = modalEl.querySelector('.modal-body');
  const readFullArticle = modalEl.querySelector('.full-article');
  title.textContent = modalState.title;
  body.textContent = modalState.description;
  readFullArticle.href = modalState.link;
  makeSeenPosts(modalState.id);
};

export default (state, i18nextInstanse, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form':
      makeInputStyle(elements.input, value.validationStatus);
      makeStatusMessageStyle(elements.statusMessage, i18nextInstanse, value.statusMessage);
      break;
    case 'rss.feeds':
      makeFeeds(elements.feeds, i18nextInstanse, value);
      break;
    case 'rss.posts':
      makePosts(elements.posts, i18nextInstanse, value);
      break;
    case 'rss.seenPosts':
      makeSeenPosts(value);
      break;
    case 'modal':
      makeModalWindow(elements.modal, value);
      break;
    default:
      break;
  }
});
