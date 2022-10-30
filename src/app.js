import { object, string } from 'yup';
import watchState from './view.js';
import axios from 'axios';
import parseRss from './parser.js';

const state = watchState({
	form: {
		isValid: false,
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

const checkForUpdates = () => {
	const TIME_STEP = 5000;
	const promises = updateRss();
	Promise.allSettled(promises)
		.then((results) => {
			const newPosts = [];
			results.forEach((result) => {
				if (result.status !== 'fulfilled') {
					return;
				}
				newPosts.push(...result.value.posts);
			})
			state.rss.posts = newPosts;
		})
		.then(() => {
			setTimeout(checkForUpdates, TIME_STEP)
		})
};

const updateRss = () => {
	const list = state.rssList;
	return list.map((rss) => {
		return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(rss)}`)
			.then((response) => {
				return parseRss(response);
			});
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
				return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
			})
			.then((response) => {
				return parseRss(response);
			})
			.then(({ feed, posts }) => {
				state.form.isValid = true;
				state.form.statusMessage = true;
				state.rssList.push(url);
				state.rss.feeds.push(feed);
				state.rss.posts.push(...posts);
			})
			.catch((e) => {
				const errorType = e.toString().split(': ')[1];
				state.form.isValid = false;
				state.form.statusMessage = errorType;
			})
			.catch(() => {
				state.form.isValid = false;
				state.form.statusMessage = 'no available RSS';
			})
	});
	checkForUpdates();
};

export default app;
