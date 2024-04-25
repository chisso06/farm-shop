import axios from 'axios';
import { React, useEffect, useState } from 'react';

const AdminOrders = () => {
	const [orderId, setOrderId] = useState('');
	const [orders, setOrders] = useState([]);
	const [order, setOrder] = useState({});
	const [orderedProducts, setOrderedProducts] = useState([]);
	const [message, setMessage] = useState('');
	const [isVisible, setIsVisible] = useState(false);

	const handleClick = (orderStatus) => {
		setOrderId(orderStatus);
	}

	const updateStatus = async (orderStatus) => {
		await axios.post(`/backend/orders/${orderId}`, {
			status: orderStatus
		}).then((res) => {
			// console.log(res.data);
			setOrder({...order, status: orderStatus});
			setMessage(res.data.message);
			setIsVisible(true);
		});
	};

	useEffect(() => {
		const orderStatusList = [
			{
				name: 'pending-payment',
				title: '支払待ち'
			},
			{
				name: 'pending-shipping',
				title: '発送待ち'
			},
			{
				name: 'shipping',
				title: '発送済み'
			},
			{
				name: 'completed',
				title: '完了'
			},
			{
				name: 'pending',
				title: '保留'
			},
		];
		const getOrder = async () => {
			await axios.get(`/backend/orders/${orderId}`)
			.then((res) => {
				// console.log(res.data);
				const orderStatus = orderStatusList.find((orderStatus) =>
					orderStatus.name === res.data.status)
				res.data.statusTitle = orderStatus.title;
				// console.log(res.data);
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
		const getOrders = async () => {
			await axios.get(`/backend/orders`)
			.then((res) => {
				// console.log(res.data);
				res.data.map((o) => {
					const orderStatus = orderStatusList.find((orderStatus) =>
						orderStatus.name === o.status)
					return o.statusTitle = orderStatus.title;
				})
				setOrders(res.data);
			});
		};
		if (orderId) {
			getOrder();
			getOrderedProducts();
		} else {
			getOrders();
		}
	}, [orderId]);

	return (
		(orderId && order && order.id && orderedProducts.length) ? 
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
		:
			<div>
				<table className='w-full'>
					<thead>
						<tr className='border-b font-mono'>
							<th className='pl-4 py-2 text-left'>注文ID</th>
							<th className='py-2 text-left'>注文日時</th>
							<th className='py-2 text-left'>顧客情報</th>
							<th className='py-2 text-left'>合計</th>
							<th className='py-2 text-left'>ステータス</th>
						</tr>
					</thead>
					<tbody>
						{orders.length ? orders.map((o, i) => {
							return(
								<tr onClick={() => handleClick(o.id)} key={i} className='border-b  hover:cursor-pointer hover:bg-amber-100'>
									<td className='pl-4 font-mono'>{o.id}</td>
									<td className='py-2'>{o.ordered_at}</td>
									<td className='py-2'>
										<p>{o.customer.name}</p>
										<p>{o.customer.email}</p>
									</td>
									<td className='py-2'>¥{o.total_amount}</td>
									<td className='py-2'>{o.statusTitle}</td>
								</tr>
							)
						}):''}
					</tbody>
				</table>
			</div>
	);
};

export default AdminOrders;
