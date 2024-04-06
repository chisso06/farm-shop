import axios from 'axios';
import { React, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const OrderProcessing = () => {
	const search = useLocation().search;
	const query = new URLSearchParams(search);
	const checkout_session_id = query.get('checkout_session_id');
	const navigate = useNavigate();

	useEffect(() => {
		const process = async () => {
			console.log("OrderProcessingPage");
			console.log("checkout_session_id: " + checkout_session_id);
			await axios.post('/order-process', {checkout_session_id: checkout_session_id})
			.then((res) => res.data)
			.then((data) => {
				navigate(`/order-completed?order_id=${data.order_id}`);
			}).catch((err) => {
				console.log(err);
				navigate('/cart');
			})
		}
		process();
	}, [navigate, checkout_session_id]);

	return (
		<div>
			<p>処理中</p>
		</div>
	);
};

export default OrderProcessing;
