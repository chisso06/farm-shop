import axios from 'axios';

const getShippingMethods = async () => {
	return await axios.get('/backend/shipping')
		.then((res) => {
			return (res.data)
		});
};

export default getShippingMethods;
