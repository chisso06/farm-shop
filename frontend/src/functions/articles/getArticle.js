import axios from 'axios';

const getArticle = async (articleId) => {
	return await axios.get(`/backend/articles/${articleId}`)
		.then((res) => {
			return res.data;
		});
};

export default getArticle;
