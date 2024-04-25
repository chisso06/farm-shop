import axios from "axios";

const getBase64Image = async (image_id) => {
	return await axios.get(`/backend/images/${image_id}`)
	.then((res) => {
		if (!res.data)
			return '';
		const base64Image = 'data:image/jpeg;base64,' + res.data;
		return (base64Image);
	});
}

export default getBase64Image;