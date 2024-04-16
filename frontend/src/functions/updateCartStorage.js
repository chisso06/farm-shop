const updateCartStorage = (cart) => {
	localStorage.removeItem('order_id');
	localStorage.setItem('cart', JSON.stringify(cart));
}

export default updateCartStorage;
