import axios from 'axios';

const getProductImages = async (productId) => {
	return await axios.get(`/backend/products/${productId}/images`)
		.then(async (res) => {
			return (res.data);
		});
}

export default getProductImages;