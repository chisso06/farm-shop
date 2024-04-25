import axios from 'axios';

const getImages = async (productId) => {
	return await axios.get(`/backend/products/${productId}/images`)
	.then(async (res) => {
		// console.log(res.data);
		return (res.data);
	});
}

export default getImages;