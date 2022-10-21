import { object, string } from 'yup';
import state from './view.js';

const validateUrl = (urlObj) => {
	const urlSchema = object({
		inputUrl: string().url().notOneOf(state.feedList)
	});
	return urlSchema.validate(urlObj);
};

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
				state.isValid = true;
			})
			.catch((e) => {
				state.currentUrl = inputUrl;
				state.error = e;
				state.isValid = false;
			});
	});
};

export default app;
