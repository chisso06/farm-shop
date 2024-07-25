const imageSrc = (base64Image) => {
	return base64Image ? base64Image : '/images/no_image.jpg';
}

export default imageSrc;