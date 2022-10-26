import { object, string } from 'yup';
import render from './view.js';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js';
import axios from 'axios';
import parseRss from './parser.js';

i18next.init({
	lng: 'ru',
	debug: true,
	resources
});

const validateUrl = (urlObj) => {
	const urlSchema = object({
		inputUrl: string().url().notOneOf(state.previosRssList)
	});
	return urlSchema.validate(urlObj);
};

const state = {
	form: {
		isValid: false,
		currentUrl: '',
		statusMessage: ''
	},
	rss: {
		feeds: [],
		posts: []
	},
	previosRssList: []
};

const elements = {
	input: document.querySelector('#url-input'),
	statusMessage: document.querySelector('.feedback'),
	posts: document.querySelector('.posts'),
	feeds: document.querySelector('.feeds')
};

const watchedState = onChange(state, () => {
	render(state, elements, i18next);
});

const app = async () => {
	const form = document.querySelector('form');
	const input = form.querySelector('#url-input');
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const inputUrl = input.value;
		validateUrl({ inputUrl })
			.then(() => {
				axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(inputUrl)}`)
					.then((response) => {
						state.form.currentUrl = inputUrl;
						const { feed, posts } = parseRss(response);
						state.form.isValid = true;
						state.form.statusMessage = true;
						state.previosRssList.push(inputUrl);
						watchedState.rss.feeds.push(feed);
						watchedState.rss.posts.push(...posts);
					})
					.catch(() => {
						state.form.isValid = true;
						watchedState.form.statusMessage = 'No available RSS';
					});
			})
			.catch((e) => {
				const errorType = e.toString().split(': ')[1];
				state.form.isValid = false;
				watchedState.form.statusMessage = errorType;
			});
	});
};

export default app;
