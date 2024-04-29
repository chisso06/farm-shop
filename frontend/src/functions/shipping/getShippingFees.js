import axios from 'axios';

const getShippingFees = async (shippingId) => {
	return await axios.get(`/backend/shipping/${shippingId}/fee`)
	.then((res) => {
		// console.log('product:', res.data);
		return res.data;
	});
}
export default getShippingFees;
