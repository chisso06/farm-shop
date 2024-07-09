import axios from "axios";

const createNews = async (newsObj) => {
	return await axios.post('/backend/news', newsObj)
		.then((res) => {
			// console.log(res.data);
			return res.data;
		});
};

export default createNews;