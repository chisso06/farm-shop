import axios from "axios";

const getOrder = async (orderId) => {
	return await axios.get(`/backend/orders/${orderId}`)
		.then((res) => res.data);
};

export default getOrder;
