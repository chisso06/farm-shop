import axios from "axios";

const getOrderedProducts = async (orderId) => {
	return await axios.get(`/backend/ordered_products?order_id=${orderId}`)
		.then((res) => res.data);
};

export default getOrderedProducts;