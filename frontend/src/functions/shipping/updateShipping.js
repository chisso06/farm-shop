import axios from "axios";

const updateShipping = async ({method, fees}) => {
	return await axios.post(`/backend/shipping/${method.id}`, {method, fees})
		.then((res) => {
			// console.log(res.data);
			return (res.data);
		});
}

export default updateShipping;