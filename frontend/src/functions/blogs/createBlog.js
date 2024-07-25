import axios from 'axios';
import uploadImage from '../images/uploadImage';

const createBlog = async ({ blog, imageFile }) => {
	return await axios.post(`/backend/blogs`, blog)
		.then(async (res) => {
			await uploadImage({ table: 'blogs', imageFile, image_id: res.data.blog.id });
			return res.data;
		});
};

export default createBlog;