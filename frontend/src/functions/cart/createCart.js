import getProduct from "../products/getProduct";

const createCart = async (setCart) => {
	const cartStorage = JSON.parse(localStorage.getItem('cart')).filter((c) => c.number > 0);
	if (cartStorage) {
		const cartList = await Promise.all(cartStorage.map(async (c, i) => {
			const res = await getProduct(c.product_id, false);
			if (!res || !res.public_status) {
				c.number = 0;
				return {};
			}
			c.subscription = res.subscription;
			const item = {
				product_id: c.product_id,
				number: c.number,
				name: res.name,
				price: res.price,
				shipping_method: res.shipping_method,
				stock: res.stock,
				subscription: res.subscription,
				image_id: res.image_id,
				public_status: res.public_status,
			};
			return item;
		}));
		const publicCartStorage = cartStorage.filter((c) => c.number > 0);
		const publicCartList = cartList.filter((c) => c);
		localStorage.setItem('cart', JSON.stringify(publicCartStorage));
		setCart(publicCartList);
		return (publicCartList);
	}
	localStorage.setItem('cart', JSON.stringify([]));
};

export default createCart;
