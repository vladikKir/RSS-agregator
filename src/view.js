const render = (state, elements, i18next) => {
	const input = elements.input;
	const statusMessage = elements.statusMessage;
	input.classList.remove('is-invalid');
	statusMessage.classList.remove('text-danger');
	if (state.isValid === false) {
		input.classList.add('is-invalid');
	} else {
		input.value = '';
	}
	switch (state.statusMessage) {
		case true:
			statusMessage.classList.add('text-success');
			statusMessage.textContent = i18next.t('rssStatusMessage.success');
			break;
		case 'inputUrl must be a valid URL':
			statusMessage.classList.add('text-danger');
			statusMessage.textContent = i18next.t('rssStatusMessage.notUrl');
			break;
		case 'inputUrl must not be one of the following values':
			statusMessage.classList.add('text-danger');
			statusMessage.textContent = i18next.t('rssStatusMessage.alreadyExists');
			break;
		default:
			throw new Error('Unexpeted status message type');
	}
};

export default render;