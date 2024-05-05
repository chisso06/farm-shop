import axios from 'axios';
import uploadImages from './uploadImages';

const createProduct = async ({product, images, imageFiles}) => {
	return await axios.post(`/backend/products`, {product, images})
	.then((res) => {
		// console.log(res.data);
		uploadImages({images: res.data.images, imageFiles});
		return res.data;
	})
}

export default createProduct;