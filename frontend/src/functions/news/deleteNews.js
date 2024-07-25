import axios from "axios";

const deleteNews = async (newsId) => {
	return await axios.delete(`/backend/news/${newsId}`)
		.then((res) => {
			return (res.data);
		});
};

export default deleteNews;