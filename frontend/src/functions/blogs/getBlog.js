import axios from 'axios';

const getBlog = async (blogId) => {
	return await axios.get(`/backend/blogs/${blogId}`)
		.then((res) => {
			return res.data;
		});
};

export default getBlog;
