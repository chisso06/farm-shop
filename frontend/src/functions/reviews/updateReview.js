import axios from "axios";

const updateReview = async (reviewObj) => {
	await axios.post(`/backend/reviews/${reviewObj.id}`, reviewObj);
};

export default updateReview;