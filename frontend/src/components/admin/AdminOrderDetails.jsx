import axios from 'axios';
import { React, useEffect, useState } from 'react';

const AdminOrderDetails = ({orderId, setOrderId, orderStatusList}) => {
	const [order, setOrder] = useState({});
	const [orderedProducts, setOrderedProducts] = useState([]);

	const handleClick = (orderStatus) => {
		setOrderId(orderStatus);
	}

	const handleExportClick = (postType) => {
		const filename = `address_${postType}.csv`;
		const productContent = orderedProducts[0].name.substr(0, 18) + (orderedProducts.length > 1 ? '、他' : '');
		var data = '';

		if (postType === 'yu-pack')
			data = `1,,,,,,,${order.customer.name},,,${order.customer.zipCode},,${order.customer.address},,,${order.customer.phone},,,${order.customer.email},,,,鈴木美優,,,6310003,,奈良市中登美ヶ丘4-1-2-103,,,09032824468,ひだまり農園,,farm-shop@example.com,${productContent},,,,,,,,,,,,,,,,,,00,,,,,,,,,,,,0,,,1,1,1,1,1`;
		else if (postType === 'click-post')
			data = `
			お届け先郵便番号,お届け先氏名,お届け先敬称,お届け先住所1行目,お届け先住所2行目,お届け先住所3行目,お届け先住所4行目,内容品
			${order.customer.zipCode},${order.customer.name},様,${order.customer.address},,,,${productContent}`;
		const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
		const blob = new Blob([bom, data], { type: "text/csv" });
		const link = document.createElement('a');
		link.download = filename;
		link.href = URL.createObjectURL(blob);
		link.click();
		URL.revokeObjectURL(link.href);
	};

	const updateStatus = async (orderStatus) => {
		await axios.post(`/backend/orders/${orderId}`, {
			status: orderStatus
		}).then((res) => {
			// console.log(res.data);
			setOrder({...order, status: orderStatus});
		});
	};

	const Modal = () => {
		return (
			<dialog id="modal" className="p-4 modal modal-bottom sm:modal-middle rounded-md">
				<div className="modal-box">
					<form method="dialog">
						<button className="w-6 h-6 btn btn-sm btn-ghost absolute right-4 top-4">✕</button>
					</form>
					<p className='my-8'>出力するフォーマットを選択してください</p>
					<button
						onClick={() => handleExportClick('yu-pack')}
						className='w-full p-2 mb-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						ゆうパック
					</button>
					<button
						onClick={() => handleExportClick('click-post')}
						className='w-full p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						クリックポスト
					</button>
				</div>
			</dialog>
		)
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
			<Modal />
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
					<div className='pb-2 flex font-mono'>
						<p className='font-bold'>購入者情報</p>
						<button onClick={() => document.getElementById('modal').showModal()} className='ml-8 text-sm underline text-stone-600 hover:text-amber-600'>
							csvファイルに出力
						</button>
					</div>
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