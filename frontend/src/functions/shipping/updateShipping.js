import axios from "axios";

const updateShipping = async ({method, fees}) => {
	return await axios.post(`/backend/shipping/${method.id}`, {method, fees})
		.then((res) => {
			return (res.data);
		});
}

export default updateShipping;