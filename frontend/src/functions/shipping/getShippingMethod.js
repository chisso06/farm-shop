import axios from 'axios';

const getShippingMethod = async (shippingId) => {
	return await axios.get(`/backend/shipping/${shippingId}`)
	.then((res) => {
		// console.log('product:', res.data);
		return res.data;
	});
}
export default getShippingMethod;
