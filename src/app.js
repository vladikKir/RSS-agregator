import { object, string } from 'yup';
import render from './view.js';
import onChange from 'on-change';
import i18next from 'i18next';
import resources from './locales/index.js'

i18next.init({
	lng: 'ru',
	debug: true,
	resources
})

const validateUrl = (urlObj) => {
	const urlSchema = object({
		inputUrl: string().url().notOneOf(state.feedList)
	});
	return urlSchema.validate(urlObj);
};

const state = {
	isValid: false,
	currentUrl: '',
	feedList: [],
	statusMessage: ''
};

const elements = {
	input: document.querySelector('#url-input'),
	statusMessage: document.querySelector('.feedback')
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
				state.currentUrl = inputUrl;
				state.feedList.push(inputUrl);
				state.isValid = true;
				watchedState.statusMessage = true;
			})
			.catch((e) => {
				const errorType = e.toString().split(': ')[1];
				console.log(errorType)
				state.currentUrl = inputUrl;
				state.isValid = false;
				watchedState.statusMessage = errorType;
			});
	});
};

export default app;
