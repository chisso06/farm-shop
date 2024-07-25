import getBase64Image from "./getBase64Image";

const getIndexBase64Images = async ({ table, objects }) => {
	return await Promise.all(objects.map(async (o, i) => {
		o.base64Images_idx = i;
		if (!o.image_id)
			return '';
		else
			return await getBase64Image({ table, image_id: o.image_id });
	}))
}

export default getIndexBase64Images;