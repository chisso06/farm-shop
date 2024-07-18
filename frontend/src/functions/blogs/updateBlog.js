import axios from "axios";
import uploadImage from "../images/uploadImage";

const updateBlog = async ({ blog, imageFile }) => {
	return await axios.post(`/backend/blogs/${blog.id}`, blog)
		.then(async (res) => {
			await uploadImage({ table: 'blogs', imageFile, image_id: blog.id });
			return res.data;
		});
}

export default updateBlog;