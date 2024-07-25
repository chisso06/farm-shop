import axios from 'axios';

const deleteProduct = async (productId) => {
	return await axios.delete(`/backend/products/${productId}`)
		.then((res) => {
			return res.data;
		});
}
export default deleteProduct;
