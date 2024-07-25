import axios from "axios";
import uploadImage from "../images/uploadImage";

const updateArticle = async ({ article, imageFile }) => {
	return await axios.post(`/backend/articles/${article.id}`, article)
		.then(async (res) => {
			await uploadImage({ table: 'articles', imageFile, image_id: article.id });
			return res.data;
		});
};

export default updateArticle;