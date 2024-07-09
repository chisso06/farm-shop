import axios from "axios";

const getNews = async () => {
	return await axios.get('/backend/news')
		.then((res) => {
			// console.log(res.data);
			return res.data;
		});
};

export default getNews;
