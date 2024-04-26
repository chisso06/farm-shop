import axios from 'axios';
import { React, useEffect, useState } from 'react';

const AdminOrderDetails = ({orderId, setOrderId, orderStatusList}) => {
	const [order, setOrder] = useState({});
	const [orderedProducts, setOrderedProducts] = useState([]);

	const handleClick = (orderStatus) => {
		setOrderId(orderStatus);
	}

	const updateStatus = async (orderStatus) => {
		await axios.post(`/backend/orders/${orderId}`, {
			status: orderStatus
		}).then((res) => {
			// console.log(res.data);
			setOrder({...order, status: orderStatus});
		});
	};

	useEffect(() => {
		const getOrder = async () => {
			await axios.get(`/backend/orders/${orderId}`)
			.then((res) => {
				console.log(res.data);
				const orderStatus = orderStatusList.find((orderStatus) =>
					orderStatus.name === res.data.status)
				res.data.statusTitle = orderStatus.title;
				setOrder(res.data);
			});
		};
		const getOrderedProducts = async () => {
			await axios.get(`/backend/ordered_products/${orderId}`)
			.then((res) => {
				// console.log(res.data);
				setOrderedProducts(res.data);
			});
		};
		getOrder();
		getOrderedProducts();
	}, [orderId, orderStatusList]);

	return (
		(order.id) ? 
		<div className='p-4'>
		<button onClick={() => handleClick('')}>
			&lt; <span className='text-sm hover:underline'>注文一覧に戻る</span>
		</button>
		<p className='my-6 font-mono text-xl font-bold'>注文詳細</p>
		<ul>
			<li className='py-2 flex border-b'>
				<p className='w-36 font-mono font-bold'>注文ID</p>
				<p className='font-mono'>{order.id}</p>
			</li>
			<li className='py-2 flex border-b'>
				<p className='w-36 font-mono font-bold'>ステータス</p>
				{order.status === 'pending-shipping' ?
						<div className='flex'>
							<p>発送待ち</p>
							<button
								onClick={() => updateStatus('shipping')}
								className='ml-4 text-sm underline text-stone-600 hover:text-amber-600'>
								発送済みにする
							</button>
						</div>
					: order.status === 'shipping' ?
						<div className='flex'>
							<p>発送済み</p>
							<button
								onClick={() => updateStatus('completed')}
								className='ml-4 text-sm underline text-stone-600 hover:text-amber-600'>
								完了にする
							</button>
						</div>
					: order.status === 'completed' ?
						<p>完了</p>
					: <p>{order.statusTitle}</p>
				}
			</li>
			<li className='py-2 flex border-b'>
				<p className='w-36 font-mono font-bold'>注文日時</p>
				<p>{order.ordered_at}</p>
			</li>
			<li className='py-2 flex border-b'>
				<p className='w-36 font-mono font-bold'>合計金額</p>
				<p>
					¥{order.total_amount}
					<span className='text-sm'>（送料¥{order.shipping_fee}を含む）</span>
				</p>
			</li>
			<li className='py-2 flex border-b'>
				<p className='w-36 font-mono font-bold'>支払ID</p>
				<p className='font-mono'>{order.checkout_session_id}</p>
			</li>
			<li className='py-2 border-b'>
				<p className='pb-2 font-mono font-bold'>購入者情報</p>
				<ul className='p-2 bg-stone-100'>
					<li className='pb-1'>
						<p className='font-mono text-sm'>氏名：{order.customer.name}</p>
					</li>
					<li className='pb-1'>
						<p className='font-mono text-sm'>住所：〒{order.customer.zipCode}</p>
						<p className='font-mono text-sm'>
							　　　{order.customer.preference} {order.customer.address}
						</p>
					</li>
					<li className='pb-1'>
						<p className='font-mono text-sm'>電話番号：{order.customer.phone}</p>
					</li>
					<li className='pb-1'>
						<p className='font-mono text-sm'>メールアドレス：{order.customer.email}</p>
					</li>
					<li>
						<p className='font-mono text-sm'>備考：{order.customer.memo}</p>
					</li>
				</ul>
			</li>
			<li className='py-2'>
				<p className='pb-2 font-mono font-bold'>購入された商品</p>
				<ul className='p-2 bg-stone-100'>
					{orderedProducts.length ? orderedProducts.map((p, i) => {
						return (
							<li key={i} className='py-1 flex font-mono'>
								<p className='w-1/2'>{p.name}</p>
								<p className='w-20'>¥{p.price}</p>
								<p className='w-20'>× {p.number} 個</p>
							</li>
						)
					}):''}
				</ul>
			</li>
		</ul>
	</div>
	:'');
};

export default AdminOrderDetails;