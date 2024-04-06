import { React } from 'react';
import { useLocation } from 'react-router-dom';

const OrderCompleted = () => {
	const search = useLocation().search;
	const query = new URLSearchParams(search);
	const order_id = query.get('order_id');

	return (
		<div className='my-16'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-cyan-800 text-white'>
				注文完了
			</p>
			<div className='h-screen'>
				<p>注文番号：{order_id}</p>
				<p>ご購入ありがとうございました。発送まで今しばらくお待ちください。メール確認してね。注文番号は大切に保管してね。</p>
			</div>
		</div>
	);
};

export default OrderCompleted;
