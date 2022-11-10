import _ from 'lodash';

const getDocumentInfo = (data) => {
  const id = _.uniqueId();
  const title = data.querySelector('title').textContent;
  const description = data.querySelector('description').textContent;
  const link = data.querySelector('link').textContent;
  return {
    title, description, link, id,
  };
};

const parseRss = (content, parseError) => {
  try {
    const parse = new DOMParser();
    const parsedData = parse.parseFromString(content, 'text/xml');
    const feed = getDocumentInfo(parsedData);
    const postElems = [...parsedData.querySelectorAll('item')];
    const posts = postElems.map((post) => getDocumentInfo(post));
    return { feed, posts };
  } catch {
    throw new Error(parseError);
  }
};

export default parseRss;
