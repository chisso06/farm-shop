import axios from "axios";

const uploadImage = async ({ table, imageFile, image_id }) => {
	if (!imageFile)
		return ;
	const formData = new FormData();
	const blob = imageFile.slice(0, imageFile.size, imageFile.type);
	const renamedFile = new File([blob], image_id +'.jpg', {type: imageFile.type});
	formData.append('files[]', renamedFile);
	return await axios.post(
		`/backend/upload/${table}`,
		formData,
		{headers: {'content-type': 'multipart/form-data'}})
		.catch((err) => {
			window.alert('画像を保存することができませんでした');
		});
};

export default uploadImage;