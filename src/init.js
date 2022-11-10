import { string } from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import resources from './locales/index.js';
import watchState from './view.js';
import parseRss from './parser.js';

export default () => {
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

  const elements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    statusMessage: document.querySelector('.feedback'),
    posts: document.querySelector('.posts'),
    feeds: document.querySelector('.feeds'),
    modal: document.getElementById('modal'),
  };

  const newInstance = i18next.createInstance();
  const watchedState = watchState(state, newInstance, elements);

  const modalEventListener = (e) => {
    const button = e.relatedTarget;
    const buttonId = button.dataset.id;
    const currentPost = watchedState.rss.posts.find((post) => post.id === buttonId);
    const {
      title, description, link, id,
    } = currentPost;
    watchedState.modal = {
      title, description, link, id,
    };
  };

  const validateUrl = (url) => {
    const urlSchema = string().url().notOneOf(watchedState.rssList);
    return urlSchema.validate(url);
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
        const fullfiled = results.reduce((acc, result) => {
          if (result.status === 'fulfilled') {
            return [...acc, ...result.value.posts];
          }
          return acc;
        }, []);
        updatePosts(fullfiled);
      })
      .then(() => {
        setTimeout(checkForUpdates, TIME_STEP);
      });
  };

  const { modal } = elements;
  modal.addEventListener('show.bs.modal', modalEventListener);
  const { form } = elements;
  const { input } = elements;

  newInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const url = input.value;
      validateUrl(url)
        .then(() => {
          watchedState.form = { validationStatus: 'checking', statusMessage: 'adding' };
          return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
        })
        .then((response) => parseRss(response.data.contents, newInstance.t('parseError')))
        .then(({ feed, posts }) => {
          watchedState.form = { validationStatus: 'valid', statusMessage: 'added' };
          watchedState.rssList.push(url);
          watchedState.rss.feeds.push(feed);
          watchedState.rss.posts.push(...posts);
        })
        .catch((e) => {
          let statusMessage;
          if (e.name === 'AxiosError') {
            statusMessage = 'networkError';
          } else if (e.message === newInstance.t('parseError')) {
            statusMessage = 'noAvailableRSS';
          } else {
            statusMessage = e.type;
          }
          watchedState.form = { validationStatus: 'invalid', statusMessage };
        });
    });
  });
  checkForUpdates();
};
