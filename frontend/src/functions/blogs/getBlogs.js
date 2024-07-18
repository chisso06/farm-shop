import axios from 'axios';

const getBlogs = async () => {
	return await axios.get('/backend/blogs')
		.then((res) => {
			return (res.data);
		});
};

export default getBlogs;
