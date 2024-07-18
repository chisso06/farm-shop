import axios from "axios";

const uploadImages = async ({ table, images, imageFiles }) => {
	if (images.length) {
		const formData = new FormData();
		images.map((image, i) => {
			const file = imageFiles[image.imageFiles_idx];
			if (!file)
				return ;
			const blob = file.slice(0, file.size, file.type);
			const renamedFile = new File([blob], image.id +'.jpg', {type: file.type});
			formData.append('files[]', renamedFile);
		});
		return await axios.post(
			`/backend/upload/${table}`,
			formData,
			{headers: {'content-type': 'multipart/form-data'}})
			.catch((err) => {
				window.alert('画像を保存することができませんでした');
			});
	}
};

export default uploadImages;