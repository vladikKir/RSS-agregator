import { object, string } from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index.js';
import watchState from './view.js';
import parseRss from './parser.js';

const state = {
  form: {
    validationStatus: '',
    statusMessage: '',
  },
  rss: {
    feeds: [],
    posts: [],
  },
  rssList: [],
  modal: {},
};

const watchedState = watchState(state);

const modalEventListener = (e) => {
  const button = e.relatedTarget;
  const buttonId = button.dataset.id;
  const [currentPost] = [...watchedState.rss.posts.filter((post) => post.id === buttonId)];
  const { title } = currentPost;
  const { description } = currentPost;
  const { link } = currentPost;
  const { id } = currentPost;
  watchedState.modal = {
    title, description, link, id,
  };
};

const validateUrl = (urlObj) => {
  const urlSchema = object({
    url: string().url().notOneOf(watchedState.rssList),
  });
  return urlSchema.validate(urlObj);
};

const getUpdatedRss = () => {
  const list = watchedState.rssList;
  return list.map((rss) => axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`)
    .then((response) => parseRss(response.data.contents)));
};

const updatePosts = (posts) => {
  const titles = watchedState.rss.posts.map((post) => post.title);
  posts.forEach((post) => {
    const { title } = post;
    if (!titles.includes(title)) {
      watchedState.rss.posts.push(post);
    }
  });
};

const checkForUpdates = () => {
  const TIME_STEP = 5000;
  const promises = getUpdatedRss();
  Promise.allSettled(promises)
    .then((results) => {
      results.forEach((result) => {
        if (result.status !== 'fulfilled') {
          return;
        }
        updatePosts(result.value.posts);
      });
    })
    .then(() => {
      setTimeout(checkForUpdates, TIME_STEP);
    });
};

export default () => {
  const newInstance = i18next.createInstance();
  newInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  const modal = document.getElementById('modal');
  modal.addEventListener('show.bs.modal', modalEventListener);
  const form = document.querySelector('form');
  const input = form.querySelector('#url-input');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = input.value;
    validateUrl({ url })
      .then(() => {
        watchedState.form.statusMessage = 'adding';
        watchedState.form.validationStatus = 'checking';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => parseRss(response.data.contents))
      .then(({ feed, posts }) => {
        watchedState.form.validationStatus = 'valid';
        watchedState.form.statusMessage = 'added';
        watchedState.rssList.push(url);
        watchedState.rss.feeds.push(feed);
        watchedState.rss.posts.push(...posts);
      })
      .catch((e) => {
        watchedState.form.validationStatus = 'invalid';
        if (e.name === 'AxiosError') {
          watchedState.form.statusMessage = 'networkError';
          return;
        }
        if (e.message === 'parsing error') {
          watchedState.form.statusMessage = 'noAvailableRSS';
          return;
        }
        watchedState.form.statusMessage = e.type;
      });
  });
  checkForUpdates();
};
