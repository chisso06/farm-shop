import axios from 'axios';

const deleteProduct = async (productId) => {
	return await axios.delete(`/backend/products/${productId}`)
	.then((res) => {
		console.log('product:', res.data);
		return res.data;
	});
}
export default deleteProduct;
