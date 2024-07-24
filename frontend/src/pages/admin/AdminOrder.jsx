import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { Icon } from '../../components';
import { orderStatusList, shopinfo, shopname } from '../../data';
import { getOrder, getOrderedProducts, updateOrder } from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminOrder = () => {
	const params = useParams();
	const orderId = params.order_id;
	const [order, setOrder] = useState({});
	const [orderedProducts, setOrderedProducts] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleOpenExportModal = (e) => {
		e.preventDefault();
		document.getElementById('export-modal').showModal();
	}

	const handleExportClick = (e, postType) => {
		e.preventDefault();

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

	const ExportModal = () => {
		return (
			<dialog id="export-modal" className="p-4 modal modal-bottom sm:modal-middle rounded-md">
				<div className="modal-box">
					<form method="dialog">
						<button className="w-6 h-6 btn btn-sm btn-ghost absolute right-4 top-4">✕</button>
					</form>
					<p className='my-8'>出力するフォーマットを選択してください</p>
					<button
						onClick={(e) => handleExportClick(e, 'yu-pack')}
						className='w-full p-2 mb-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						ゆうパック
					</button>
					<button
						onClick={(e) => handleExportClick(e, 'click-post')}
						className='w-full p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
						クリックポスト
					</button>
				</div>
			</dialog>
		)
	};

	const handleOpenMailModal = (e) => {
		e.preventDefault();
		document.getElementById('mail-modal').showModal();
	};

	const OrderNotificationMail = () => {
		return (
			<div className='p-2 bg-stone-100'>
				<p className='my-4'>件名：[{shopname}]【注文ID:{order.id}】ご購入ありがとうございます</p>
				<p className='mb-4 whitespace-pre-line'>{`\
					${order.customer.name} 様

					この度は、${shopname} オンラインショップでお買い上げいただき、ありがとうございました。
					商品がお手元に届くまで、こちらのメールは大切に保管してください。

					【ご注文内容】
					注文ID: ${order.id}
					${orderedProducts.length ? orderedProducts.map((p) =>`\
						・${p.name}:
						　　¥${p.price} × ${p.number} 個\
					`).join(''):''}
	
					注文や商品についてご不明な点がございましたら、お気軽にお問い合わせください。
	
					${shopinfo}
				`}</p>
			</div>
		);
	};

	const ShippingNotificationMail = () => {
		return (
			<div className='p-2 bg-stone-100'>
				<p className='my-4'>件名：[{shopname}]【注文ID:{order.id}】商品を発送しました</p>
				<p className='mb-4 whitespace-pre-line'>{`\
					${order.customer.name} 様

					この度は、ご購入いただきありがとうございます。
					ご注文いただいた商品を発送しました。
					商品のお届けまでもう少々お待ちください。

					【配送情報】
					配送業者: ○○○○
					伝票番号: ○○○○

					【ご注文内容】
					注文ID: ${order.id}
					${orderedProducts.length ? orderedProducts.map((p) =>`\
						・${p.name}:
						　　¥${p.price} × ${p.number} 個\
					`).join(''):''}

					【お届け先】
					〒${order.customer.zipCode}
					${order.customer.preference} ${order.customer.address}
					${order.customer.phone}
					${order.customer.name} 様

					注文や商品についてご不明な点がございましたら、お気軽にお問い合わせください。

					${shopinfo}
				`}</p>
			</div>
		);
	};

	// const ReceivingReminderMail = () => {
	// 	return (
	// 		<div className='p-2 bg-stone-100'>
	// 			<p className='my-4'>件名：[{shopname}]【注文ID:{order.id}】商品をお受け取りください</p>
	// 			<p className='mb-4 whitespace-pre-line'>{`\
	// 				${order.customer.name} 様

	// 				この度は、ご購入いただきありがとうございます。


	// 				注文や商品についてご不明な点がございましたら、お気軽にお問い合わせください。

	// 				${shopinfo}
	// 			`}</p>
	// 		</div>
	// 	);
	// };

	const ReviewingReminderMail = () => {
		var url = new URL(window.location.href);

		return (
			<div className='p-2 bg-stone-100'>
				<p className='my-4'>件名：[{shopname}]【注文ID:{order.id}】商品のレビューのお願い</p>
				<p className='mb-4 whitespace-pre-line'>{`\
					${order.customer.name} 様

					この度は、${shopname} オンラインショップでお買い上げいただき、ありがとうございました。
					お客様のご購入された商品のご感想を頂きたく、今回、メールをお送りさせていただきました。
					ぜひ、こちらの商品のご感想をお聞かせください。

					${orderedProducts.length ? orderedProducts.map((p) =>`\
						・${p.name}
						　　${url.origin}/${p.id}
					`).join(''):''}

					ご満足いただけた方はもちろん、ご満足いただけなかったお客様の声も、とても貴重なご意見ですので、どうかご遠慮なくお申し付けくださいませ。

					注文や商品についてご不明な点がございましたら、お気軽にお問い合わせください。

					${shopinfo}
				`}</p>
			</div>
		);
	};

	const MailModal = () => {
		return (
			<dialog id="mail-modal" className="p-4 w-1/2 h-screen modal modal-bottom sm:modal-middle rounded-md">
				<div className="modal-box">
					<form method="dialog">
						<button className="w-6 h-6 btn btn-sm btn-ghost absolute right-4 top-4">✕</button>
					</form>
					<div>
						<p className='mb-8 text-center'>メール定型文（ステータス：{order.statusTitle}）</p>
						{ order.status === 'pending-shipping' ? 
							<div>
								<details>
									<summary className='my-4'>注文完了メール</summary>
									<OrderNotificationMail />
								</details>
							</div>
							: order.status === 'shipping' ? 
							<div>
								<details>
									<summary className='my-4'>発送通知メール</summary>
									<ShippingNotificationMail />
								</details>
								{/* <details>
									<summary className='my-4'>受け取り催促メール</summary>
									<ReceivingReminderMail />
								</details> */}
							</div>
							: order.status === 'completed' ?
							<div>
								<details>
									<summary className='my-4'>レビュー催促メール</summary>
									<ReviewingReminderMail />
								</details>
							</div>
							:''
						}
					</div>
				</div>
			</dialog>
		);
	};

	const updateStatus = async (e, orderStatus) => {
		e.preventDefault();
		context.setLoading(true);

		if (orderStatus !== 'canceled'
			|| window.confirm('この注文をキャンセルしますか？\n注文をキャンセルしても在庫は戻りません\n返金処理が必要な場合は、Stripeの管理画面より行なってください\nこの操作は取り消せません')) {
			const newOrder = {...order, status: orderStatus};
			try {
				await updateOrder(newOrder);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setOrder(newOrder);
	
			window.alert('ステータスを変更しました');
			window.location.reload();
		}

		context.setLoading(false);
	};

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);
			var orderData;
			try {
				orderData = await getOrder(orderId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!orderData) {
				context.setLoading(false);
				window.location.href = '/admin/orders';
				return ;
			}
			const orderStatus = orderStatusList.find(
				(status) => status.name === orderData.status);
			const nextOrderStatus = orderStatusList.find(
				(status) => status.name === orderStatus.nextStatus);
			orderData.statusTitle = orderStatus.title;
			if (nextOrderStatus) {
				orderData.nextStatus = nextOrderStatus.name;
				orderData.nextStatusTitle = nextOrderStatus.title;
			}
			setOrder(orderData);

			var orderedProductsData;
			try {
				orderedProductsData = await getOrderedProducts(orderId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setOrderedProducts(orderedProductsData);
			context.setLoading(false);
		};
		getData();
	}, []);

	return (
		(order.id) ? 
		<div className='px-4'>
			<ExportModal />
			<MailModal />
			<a href='/admin/orders'>
				&lt; <span className='text-sm hover:underline'>注文一覧に戻る</span>
			</a>
			<p className='my-6 font-mono text-xl font-bold'>注文詳細</p>
			<ul>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>注文ID</p>
					<p className='font-mono'>{order.id}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>ステータス</p>
						<div className='flex items-center'>
							<p>{order.statusTitle}</p>
							{ (order.status === 'shipping'
								|| order.status === 'completed'
								|| order.status === 'pending-shipping') ? 
								<button
									onClick={handleOpenMailModal}
									className='ml-1 w-4 h-4'>
									<Icon
										icon='envelope'
										className='fill-stone-600  hover:fill-amber-600' />
								</button>
								:''}
							{ order.nextStatus ? 
								<button
									onClick={(e) => updateStatus(e, order.nextStatus)}
									className='ml-4 text-sm underline text-stone-600 hover:text-amber-600'>
									{order.nextStatusTitle}にする
								</button>
							: ''}
							{ order.status !== 'canceled' ? 
								<button
									onClick={(e) => updateStatus(e, 'canceled')}
									className='ml-4 text-sm underline text-stone-600 hover:text-amber-600'>
									キャンセル
								</button>
							: ''}
						</div>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>注文日時</p>
					<p>{order.ordered_at}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>合計金額</p>
					<p>
						¥{order.total_amount}
						<span className='text-sm'>（+送料¥{order.shipping_fee}）</span>
					</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>支払ID</p>
					<p className='font-mono text-sm'>{order.checkout_session_id}</p>
				</li>
				<li className='py-2 border-b'>
					<div className='pb-2 flex font-mono'>
						<p className='font-bold'>購入者情報</p>
						<button
							onClick={handleOpenExportModal}
							className='ml-8 text-sm underline text-stone-600 hover:text-amber-600'>
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

export default AdminOrder;