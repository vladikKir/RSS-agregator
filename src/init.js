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

const newInstance = i18next.createInstance();
const watchedState = watchState(state, newInstance);

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
  const modal = document.getElementById('modal');
  modal.addEventListener('show.bs.modal', modalEventListener);
  const form = document.querySelector('form');
  const input = form.querySelector('#url-input');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = input.value;
    newInstance.init({
      lng: 'ru',
      debug: true,
      resources,
    })
    .then(() => validateUrl({ url }))
      .then(() => {
        watchedState.form = { validationStatus: 'checking', statusMessage: 'adding' }
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => parseRss(response.data.contents))
      .then(({ feed, posts }) => {
        watchedState.form = { validationStatus: 'valid', statusMessage: 'added' }
        watchedState.rssList.push(url);
        watchedState.rss.feeds.push(feed);
        watchedState.rss.posts.push(...posts);
      })
      .catch((e) => {
        let statusMessage;
        if (e.name === 'AxiosError') {
          statusMessage = 'networkError';
        } else if (e.message === 'parsing error') {
          statusMessage = 'noAvailableRSS';
        } else {
          statusMessage = e.type;
        }
        watchedState.form = { validationStatus: 'invalid', statusMessage }
      });
  });
  
  checkForUpdates();
};
