import axios from "axios";
import uploadImages from "../images/uploadImages";

const updateProduct = async ({product, images, imageFiles}) => {
	return await axios.post(`/backend/products/${product.id}`, {product, images})
		.then((res) => {
			// console.log(res.data);
			uploadImages({images: res.data.images, imageFiles});
			return res.data;
		});
}

export default updateProduct;