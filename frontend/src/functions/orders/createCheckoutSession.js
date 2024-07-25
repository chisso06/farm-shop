import axios from "axios";

const createCheckoutSession = async ({cart, customer}) => {
	await axios.post('/backend/create-checkout-session', {cart, customer})
		.then((res) => {
			localStorage.setItem('cart', JSON.stringify([]));
			window.location.replace(res.data.session_url);
		});
};

export default createCheckoutSession;