import axios from "axios";

const updateOrder = async (order) => {
	await axios.post(`/backend/orders/${order.id}`, order)
};

export default updateOrder;