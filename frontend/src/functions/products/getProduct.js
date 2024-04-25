import axios from 'axios';

const getProduct = async (productId) => {
	return await axios.get(`/backend/products/${productId}`)
	.then((res) => {
		// console.log('product:', res.data);
		return res.data;
	});
}
export default getProduct;
