import axios from "axios";

const uploadImages = async ({ table, images, imageFiles }) => {
	if (imageFiles.length) {
		const formData = new FormData();
		imageFiles.map((file, i) => {
			const image = images.find((data) => data.imageFiles_idx === i);
			if (!image)
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