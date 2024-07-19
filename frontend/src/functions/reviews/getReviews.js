import axios from 'axios';

const getReviews = async (productId, public_status) => {
	return await axios.get(
		`/backend/reviews?product_id=${productId ? productId : 0}&public_status=${public_status ? 1 : 0}`)
		.then((res) => {
			return (res.data);
		});
};

export default getReviews;
