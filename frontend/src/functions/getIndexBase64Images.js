import getBase64Image from "./getBase64Image";

const getIndexBase64Images = async (products) => {
	return await Promise.all(products.map(async (product, i) => {
		product.base64Images_idx = i;
		if (!product.image_id)
			return '';
		else
			return await getBase64Image(product.image_id);
	}))
}

export default getIndexBase64Images;