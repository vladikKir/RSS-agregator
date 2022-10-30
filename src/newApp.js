import watchState from './view.js';

const state = watchState({
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
});

