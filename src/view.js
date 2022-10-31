import i18next from 'i18next';
import resources from './locales/index.js';
import onChange from 'on-change';

const elements = {
	input: document.querySelector('#url-input'),
	statusMessage: document.querySelector('.feedback'),
	posts: document.querySelector('.posts'),
	feeds: document.querySelector('.feeds')
};

i18next.init({
	lng: 'ru',
	debug: true,
	resources
});

const makeInputStyle = (input, value) => {
	input.removeAttribute('readonly');
	switch (value) {
		case false:
			input.classList.add('is-invalid');
			break;
		case true:
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

const makeStatusMessageStyle = (statusMessage, value) => {
	statusMessage.classList.remove('text-danger');
	switch (value) {
	case 'adding':
		statusMessage.textContent = '';
		break;
	case 'added':
		statusMessage.classList.add('text-success');
		statusMessage.textContent = i18next.t('rssStatusMessage.success');
		break;
	case 'url must be a valid URL':
		statusMessage.classList.add('text-danger');
		statusMessage.textContent = i18next.t('rssStatusMessage.notUrl');
		break;
	case 'url must not be one of the following values':
		statusMessage.classList.add('text-danger');
		statusMessage.textContent = i18next.t('rssStatusMessage.alreadyExists');
		break;
	case 'no available RSS':
		statusMessage.classList.add('text-danger');
		statusMessage.textContent = i18next.t('rssStatusMessage.noAvailableRss');
		break;
	case 'network error':
		statusMessage.classList.add('text-danger');
		statusMessage.textContent = i18next.t('rssStatusMessage.networkError');
		break;
	default:
		throw new Error('Unexpeted status message type');
	}
};

const makeContainer = (type) => {
	const container = document.createElement('div');
	container.classList.add('card', 'border-0');
	const cardBody = document.createElement('div');
	container.append(cardBody);
	cardBody.classList.add('card-body');
	const header = document.createElement('h2');
	cardBody.append(header);
	header.classList.add('card-title', 'h4');
	header.textContent = type === 'feed' ? i18next.t('feeds.title') : i18next.t('posts.title');
	const list = document.createElement('ul');
	cardBody.append(list);
	list.classList.add('list-group', 'border-0', 'rounded-0');
	return container;
};

const buttonClickListener = (a, el) => {
	const modalWindow = document.querySelector('.modal-content');
	const title = modalWindow.querySelector('.modal-title');
	const body = modalWindow.querySelector('.modal-body');
	const readFullArticle = modalWindow.querySelector('.full-article');
	title.textContent = el.title;
	body.textContent = el.description;
	readFullArticle.href = el.link;
	a.classList.remove('fw-bold');
	a.classList.add('fw-normal', 'link-secondary');
};

const makePosts = (postsEl, postList) => {
	postsEl.innerHTML = '';
	if(postList.length === 0) {
		return;
	}
	const posts = makeContainer('posts');
	const list = posts.querySelector('ul');
	postList.forEach((el) => {
		const post = document.createElement('li');
		post.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0',);
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
		button.addEventListener('click', () => buttonClickListener(a, el));
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

const makeFeeds = (feedsEl, feedList) => {
	feedsEl.innerHTML = '';
	if(feedList.length === 0) {
		return;
	}
	const feeds = makeContainer('feeds');
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

export default (state) => {
	return onChange(state, (path, value) => {
		switch (path) {
		case 'form.isValid':
			makeInputStyle(elements.input, value);
			break;
		case 'form.statusMessage':
			makeStatusMessageStyle(elements.statusMessage, value);
			break;
		case 'rss.feeds':
			makeFeeds(elements.feeds, value);
			break;
		case 'rss.posts':
			makePosts(elements.posts, value);
			break;
		}
	});
};
