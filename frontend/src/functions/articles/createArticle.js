import axios from 'axios';
import uploadImage from '../images/uploadImage';

const createArticle = async ({ article, imageFile }) => {
	return await axios.post(`/backend/articles`, article)
		.then(async (res) => {
			await uploadImage({ table: 'articles', imageFile, image_id: res.data.article.id });
			return res.data;
		});
};

export default createArticle;