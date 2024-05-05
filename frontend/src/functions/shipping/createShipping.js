import axios from "axios";

const createShipping = async ({method, fees}) => {
	return await axios.post('/backend/shipping', {method, fees})
		.then((res) => {
			return res.data;
		});
}

export default createShipping;