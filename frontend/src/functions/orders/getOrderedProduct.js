import axios from "axios";

const getOrderedProduct = async (orderedProductId) => {
	return await axios.get(`/backend/ordered_products/${orderedProductId}`)
		.then((res) => res.data);
};

export default getOrderedProduct;