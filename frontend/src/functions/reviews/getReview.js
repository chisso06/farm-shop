import axios from 'axios';

const getReview = async (reviewId) => {
	return await axios.get(`/backend/reviews/${reviewId}`)
		.then((res) => {
			return res.data;
		});
}
export default getReview;
