import { object, string } from 'yup';
import render from './view.js';
import onChange from 'on-change';

const validateUrl = (urlObj) => {
	const urlSchema = object({
		inputUrl: string().url().notOneOf(state.feedList)
	});
	return urlSchema.validate(urlObj);
};

const state = {
	isValid: null,
	currentUrl: '',
	feedList: [],
	error: ''
};

const elements = {
	input: document.querySelector('#url-input'),
};

const watchedState = onChange(state, (path) => {
	if(path === 'isValid') {
		render(state, elements);
	}
});

const app = () => {
	const form = document.querySelector('form');
	const input = form.querySelector('#url-input');
	form.addEventListener('submit', (event) => {
		event.preventDefault();
		const inputUrl = input.value;
		validateUrl({ inputUrl })
			.then(() => {
				state.currentUrl = inputUrl;
				state.feedList.push(inputUrl);
				watchedState.isValid = true;
			})
			.catch((e) => {
				state.currentUrl = inputUrl;
				state.error = e;
				watchedState.isValid = false;
			});
	});
};

export default app;
