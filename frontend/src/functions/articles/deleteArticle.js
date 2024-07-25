import axios from 'axios';

const deleteArticle = async (articleId) => {
	return await axios.delete(`/backend/articles/${articleId}`)
		.then((res) => {
			return res.data;
		});
};

export default deleteArticle;
