import axios from "axios";

const CreateCart = async (setCart) => {
	const cartStorage = JSON.parse(localStorage.getItem('cart'));
	if (cartStorage) {
		const cartList = await Promise.all(cartStorage.map(async (c) => {
			const res = await axios.get(`/backend/products/${c.product_id}`)
				.catch((err) => console.log(err));
			const item = {
				product_id: c.product_id,
				number: c.number,
				name: res.data.name,
				price: res.data.price,
				shipping_method: res.data.shipping_method,
				image_id: 1
			};
			return item;
		}));
		setCart(cartList);
	}
}

export default CreateCart;