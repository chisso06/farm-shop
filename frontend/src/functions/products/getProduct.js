import axios from 'axios';

const getProduct = async (productId, public_status) => {
	return await axios.get(`/backend/products/${productId}?public_status=${public_status ? 1 : 0}`)
		.then((res) => {
			return res.data;
		});
}
export default getProduct;
