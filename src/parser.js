import _ from 'lodash';

const getDocumentInfo = (data) => {
	const id = _.uniqueId();
	const title = data.querySelector('title').textContent;
	const description = data.querySelector('description').textContent;
	const link = data.querySelector('link').textContent;
	const readed = 'fw-bold';
	return { title, description, link, id, readed };
	
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
		throw new Error(`parsing error`);
	}
};

export default parseRss;
