import axios from "axios";

const getOrderedProducts = async (orderId) => {
	return await axios.get(`/backend/ordered_products/${orderId}`)
		.then((res) => res.data);
};

export default getOrderedProducts;