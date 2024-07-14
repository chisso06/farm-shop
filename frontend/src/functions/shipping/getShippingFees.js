import axios from 'axios';

const getShippingFees = async (shippingId) => {
	return await axios.get(`/backend/shipping/${shippingId}/fee`)
		.then((res) => {
			return res.data;
		});
}
export default getShippingFees;
