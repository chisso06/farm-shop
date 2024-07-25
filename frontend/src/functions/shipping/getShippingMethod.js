import axios from 'axios';

const getShippingMethod = async (shippingId) => {
	return await axios.get(`/backend/shipping/${shippingId}`)
		.then((res) => {
			return res.data;
		});
}
export default getShippingMethod;
