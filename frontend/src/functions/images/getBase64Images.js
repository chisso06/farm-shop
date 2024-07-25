import getBase64Image from "./getBase64Image";

const getBase64Images = async ({ table, images }) => {
	return Promise.all(images.map(async (image, i) => {
		image.base64Images_idx = i;
		return await getBase64Image({ table, image_id: image.id });
	}));
};

export default getBase64Images;
