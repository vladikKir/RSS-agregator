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

const makeStatusMessageStyle = (statusMessage, i18next, value) => {
  statusMessage.classList.remove('text-danger');
  switch (value) {
    case 'adding':
      statusMessage.textContent = '';
      break;
    case 'added':
      statusMessage.classList.add('text-success');
      statusMessage.textContent = i18next.t('rssStatusMessage.success');
      break;
    case 'url':
      statusMessage.classList.add('text-danger');
      statusMessage.textContent = i18next.t('rssStatusMessage.notUrl');
      break;
    case 'notOneOf':
      statusMessage.classList.add('text-danger');
      statusMessage.textContent = i18next.t('rssStatusMessage.alreadyExists');
      break;
    case 'noAvailableRSS':
      statusMessage.classList.add('text-danger');
      statusMessage.textContent = i18next.t('rssStatusMessage.invalidRss');
      break;
    case 'networkError':
      statusMessage.classList.add('text-danger');
      statusMessage.textContent = i18next.t('rssStatusMessage.networkError');
      break;
    default:
      throw new Error('Unexpeted status message type');
  }
};

const makeContainer = (type, i18next) => {
  const container = document.createElement('div');
  container.classList.add('card', 'border-0');
  const cardBody = document.createElement('div');
  container.append(cardBody);
  cardBody.classList.add('card-body');
  const header = document.createElement('h2');
  cardBody.append(header);
  header.classList.add('card-title', 'h4');
  header.textContent = type === 'feeds' ? i18next.t('feeds.title') : i18next.t('posts.title');
  const list = document.createElement('ul');
  cardBody.append(list);
  list.classList.add('list-group', 'border-0', 'rounded-0');
  return container;
};

const makePosts = (postsEl, i18next, postList) => {
  postsEl.innerHTML = '';
  if (postList.length === 0) {
    return;
  }
  const posts = makeContainer('posts', i18next);
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
    a.addEventListener('click', () => {
      a.classList.remove('fw-bold');
      a.classList.add('fw-normal', 'link-secondary');
    });
    const button = document.createElement('button');
    post.append(button);
    button.setAttribute('type', 'button');
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('data-id', el.id);
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.textContent = i18next.t('posts.button');
    list.append(post);
  });
  postsEl.append(posts);
};

const makeFeeds = (feedsEl, i18next, feedList) => {
  feedsEl.innerHTML = '';
  if (feedList.length === 0) {
    return;
  }
  const feeds = makeContainer('feeds', i18next);
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

const makeModalWindow = (modalEl, modalState) => {
  const title = modalEl.querySelector('.modal-title');
  const body = modalEl.querySelector('.modal-body');
  const readFullArticle = modalEl.querySelector('.full-article');
  title.textContent = modalState.title;
  body.textContent = modalState.description;
  readFullArticle.href = modalState.link;
  const a = document.querySelector(`a[data-id="${modalState.id}"]`);
  a.classList.remove('fw-bold');
  a.classList.add('fw-normal', 'link-secondary');
};

export default (state, i18next, elements) => onChange(state, (path, value) => {
  switch (path) {
    case 'form':
      makeInputStyle(elements.input, value.validationStatus);
      makeStatusMessageStyle(elements.statusMessage, i18next, value.statusMessage);
      break;
    case 'rss.feeds':
      makeFeeds(elements.feeds, i18next, value);
      break;
    case 'rss.posts':
      makePosts(elements.posts, i18next, value);
      break;
    case 'modal':
      makeModalWindow(elements.modal, value);
      break;
    default:
      break;
  }
});
