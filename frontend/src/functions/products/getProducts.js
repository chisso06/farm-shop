import axios from 'axios';

const getProducts = async (popular_status, public_status) => {
	return await axios.get(
		`/backend/products?popular_status=${popular_status ? 1 : 0}&public_status=${public_status ? 1 : 0}`)
		.then((res) => {
			return (res.data);
		});
}

export default getProducts;
