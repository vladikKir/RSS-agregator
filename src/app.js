import { object, string } from 'yup';
import watchState from './view.js';
import axios from 'axios';
import parseRss from './parser.js';

const state = watchState({
  form: {
    isValid: '',
    statusMessage: '',
  },
  rss: {
    feeds: [],
    posts: []
  },
  rssList: [],
});

const validateUrl = (urlObj) => {
  const urlSchema = object({
    url: string().url().notOneOf(state.rssList)
  });
  return urlSchema.validate(urlObj);
};

const getUpdatedRss = () => {
  const list = state.rssList;
  return list.map((rss) => {
    return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`)
      .then((response) => {
        return parseRss(response);
      });
  });
};

const updatePosts = (posts) => {
  const titles = state.rss.posts.map((post) => {
    return post.title;
  });
  posts.forEach((post) => {
    const title = post.title;
    if (!titles.includes(title)) {
      state.rss.posts.unshift(post);
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

const app = () => {
  const form = document.querySelector('form');
  const input = form.querySelector('#url-input');
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = input.value;
    validateUrl({ url })
      .then(() => {
        state.form.statusMessage = 'adding';
        state.form.isValid = 'checking';
        return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
      })
      .then((response) => {
        return parseRss(response);
      })
      .then(({ feed, posts }) => {
        state.form.isValid = true;
        state.form.statusMessage = 'added';
        state.rssList.push(url);
        state.rss.feeds.push(feed);
        state.rss.posts.push(...posts);
      })
      .catch((e) => {
        state.form.isValid = false;
        if (e.name === 'AxiosError') {
          state.form.statusMessage = 'network error';
          return;
        }
        if (e.message === 'parsing error') {
          state.form.statusMessage = 'no available RSS';
          return;
        }
        state.form.statusMessage = e.toString().split(': ')[1];
      });
  });
  checkForUpdates();
};

export default app;
