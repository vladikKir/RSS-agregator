import _ from 'lodash';

const getDocumentInfo = (data) => {
	try {
		const id = _.uniqueId();
		const title = data.querySelector('title').textContent;
		const description = data.querySelector('description').textContent;
		const link = data.querySelector('link').textContent;
		const readed = 'fw-bold';
		return { title, description, link, id, readed };
	} catch (e) {
		throw new Error('Invalid RSS resurs');
	}
};

const parseRss = (rss) => {
	try {
		const parse = new DOMParser();
		const parsedData = parse.parseFromString(rss.data.contents, 'text/xml');
		const feed = getDocumentInfo(parsedData);
		const postElems = [...parsedData.querySelectorAll('item')];
		const posts = postElems.map((post) => {
			return getDocumentInfo(post);
		});

		return { feed, posts };
	} catch {
		throw new Error(`Error parsing ${rss}`);
	}
};

export default parseRss;
