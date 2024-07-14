import axios from 'axios';

const deleteShippingMethod = async (shippingId) => {
	return await axios.delete(`/backend/shipping/${shippingId}`)
		.then((res) => {
			return res.data;
		});
}

export default deleteShippingMethod;
