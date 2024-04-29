import axios from 'axios';

const deleteShippingMethod = async (shippingId) => {
	return await axios.delete(`/backend/shipping/${shippingId}`)
	.then((res) => {
		// console.log('shipping:', res.data);
		return res.data;
	});
}

export default deleteShippingMethod;
