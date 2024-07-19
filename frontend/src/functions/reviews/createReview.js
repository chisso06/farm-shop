import axios from "axios";

const createReview = async (reviewObj) => {
	return await axios.post('/backend/reviews', reviewObj)
		.then((res) => {
			return res.data;
		});
};

export default createReview;