import axios from 'axios';

const getShippingMethods = async () => {
	return await axios.get('/backend/shipping')
	.then((res) => {
		// console.log(res.data);
		return (res.data)
	});
};

export default getShippingMethods;
