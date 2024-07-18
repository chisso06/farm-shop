import axios from 'axios';

const deleteBlog = async (blogId) => {
	return await axios.delete(`/backend/blogs/${blogId}`)
		.then((res) => {
			return res.data;
		});
}
export default deleteBlog;
