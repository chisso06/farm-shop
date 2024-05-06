import axios from "axios";

const getOrders = async () => {
	return await axios.get('/backend/orders')
	.then((res) => res.data);
}

export default getOrders;