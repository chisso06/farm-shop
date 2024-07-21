const validateProduct = (product) => {
	var message = '';

	if ((typeof product.name) !== 'string' || !product.name || product.name.length > 100)
		message = '商品名を100字以内で入力してください';
	else if ((typeof product.description) !== 'string' || !product.description || product.description.length > 2000)
		message = '商品説明を2000字以内で入力してください';
	else if (isNaN(Number(product.price)) || !product.price)
		message = '価格を半角数字で入力してください';
	else if (isNaN(Number(product.stock)))
		message = '在庫を半角数字で入力してください';
	else if (isNaN(Number(product.shipping_method)))
		message = '配送方法を選択してください';
	else if (product.public_status && isNaN(Number(product.public_status)))
		message = '公開の優先度は半角数字で入力してください';

	return message;
};

export default validateProduct;