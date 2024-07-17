import { React, useContext, useEffect } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import { PopularItems } from '../components';
import { getOrder } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const OrderCompleted = () => {
	const search = useLocation().search;
	const query = new URLSearchParams(search);
	const orderId = query.get('order_id');
	const navigate = useNavigate();
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	useEffect(() => {
		const orderCheck = async () => {
			context.setLoading(true);
			var res;
			try {
				res = await getOrder(orderId);
			} catch (err) {
				showBoundary(err);
			}
			if (res.status === 'pending-payment')
				navigate('/');
			context.setLoading(false);
		}
		orderCheck();
	}, []);

	return (
		<div className='my-16'>
			<p className='py-20 sm:py-40 text-center text-2xl sm:text-4xl bg-cyan-800 text-white'>
				注文完了
			</p>
			<div className='w-3/4 mx-auto mb-40'>
				<p className='my-20 text-center text-xl'>
					ご注文番号：{orderId}
				</p>
				<p className='mb-2 text-center'>ご注文ありがとうございました。</p>
				<p className='mb-2 text-center'>注文番号は大切に保管してください。</p>
				<p className='mb-16 text-center'>メールに領収書が届いていることをご確認ください。</p>
				<p className='text-center'>
					<a href='/' className='underline hover:text-amber-600'>トップページへ戻る</a>
				</p>
			</div>
			<PopularItems />
		</div>
	);
};

export default OrderCompleted;
