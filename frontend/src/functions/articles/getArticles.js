import axios from 'axios';

const getArticles = async () => {
	return await axios.get('/backend/articles')
		.then((res) => {
			return (res.data);
		});
};

export default getArticles;
