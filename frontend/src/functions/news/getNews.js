import axios from "axios";

const getNews = async () => {
	return await axios.get('/backend/news')
		.then((res) => {
			return res.data;
		});
};

export default getNews;
