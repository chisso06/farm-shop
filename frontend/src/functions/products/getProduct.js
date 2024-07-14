import axios from 'axios';

const getProduct = async (productId) => {
	return await axios.get(`/backend/products/${productId}`)
		.then((res) => {
			return res.data;
		});
}
export default getProduct;
