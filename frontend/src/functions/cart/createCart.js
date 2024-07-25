import getProduct from "../products/getProduct";

const createCart = async (setCart) => {
	const cartStorage = JSON.parse(localStorage.getItem('cart')).filter((c) => c.number > 0);
	if (cartStorage) {
		const cartList = await Promise.all(cartStorage.map(async (c) => {
			const res = await getProduct(c.product_id, false);
			c.subscription = res.subscription;
			const item = {
				product_id: c.product_id,
				number: c.number,
				name: res.name,
				price: res.price,
				shipping_method: res.shipping_method,
				stock: res.stock,
				subscription: res.subscription,
				image_id: res.image_id
			};
			return item;
		}));
		setCart(cartList);
		localStorage.setItem('cart', JSON.stringify(cartStorage));
		return (cartList);
	}
	localStorage.setItem('cart', JSON.stringify(cartStorage));
};

export default createCart;
