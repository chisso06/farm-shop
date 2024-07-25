import axios from "axios";
import uploadImages from "../images/uploadImages";

const updateProduct = async ({product, images, imageFiles}) => {
	return await axios.post(`/backend/products/${product.id}`, {product, images})
		.then(async (res) => {
			await uploadImages({ table: 'products', images: res.data.images, imageFiles });
			return res.data;
		});
}

export default updateProduct;