import _ from 'lodash';

const getInfo = (data) => {
	try {
		const id = _.uniqueId();
		const title = data.querySelector('title').textContent;
		const description = data.querySelector('description').textContent;
		const link = data.querySelector('link').textContent;
		return { title, description, link, id };
	} catch (e) {
		throw new Error('Invalid RSS resurs');
	}
};

const parseRss = (rss) => {
	const parse = new DOMParser();
	const parsedData = parse.parseFromString(rss.data.contents, 'text/xml');
	const feed = getInfo(parsedData);
	const postElems = [...parsedData.querySelectorAll('item')];
	const posts = postElems.map((post) => {
		return getInfo(post);
	});

	return { feed, posts };
};

export default parseRss;
