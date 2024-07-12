import axios from 'axios';
import uploadImages from '../images/uploadImages';

const createProduct = async ({product, images, imageFiles}) => {
	return await axios.post(`/backend/products`, {product, images})
		.then(async (res) => {
			// console.log(res.data);
			await uploadImages({images: res.data.images, imageFiles});
			return res.data;
		});
}

export default createProduct;