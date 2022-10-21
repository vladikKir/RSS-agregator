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

export default render;