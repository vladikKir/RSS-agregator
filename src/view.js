import onChange from 'on-change';

const state = {
	isValid: null,
	currentUrl: '',
	feedList: [],
	error: ''
};

const elements = {
	input: document.querySelector('#url-input'),
};

const render = (state, elements) => {
	const input = elements.input;
	input.classList.remove('is-invalid');
	if (state.isValid === false) {
		input.classList.add('is-invalid');
		return;
	}
	input.value = '';
	alert('rss загружен');
};

const watchedState = onChange(state, (path) => {
	if(path === 'isValid') {
		render(state, elements);
	}
});

export default watchedState;