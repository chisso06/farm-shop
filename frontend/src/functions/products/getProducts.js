import axios from 'axios';

const getProducts = async (popular_status) => {
	return await axios.get(
		`/backend/products?popular_status=${popular_status ? 1 : 0}`)
		.then((res) => {
			return (res.data);
		});
}

export default getProducts;
