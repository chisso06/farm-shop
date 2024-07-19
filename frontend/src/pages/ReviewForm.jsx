import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { createReview, getOrder, getOrderedProduct, getReview } from '../functions';
import { LoadingContext } from '../functions/context/LoadingFunc';

const ReviewForm = () => {
	const params = useParams();
	const orderedProductId = Number(params.ordered_product_id);
	const [orderedProduct, setOrderedProduct] = useState({});
	const [review, setReview] = useState({
		id: orderedProductId,
		product_id: 0,
		order_id: '',
		score: 0,
		title: '',
		nickname: '',
		content: '',
	});
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleInputChange = (e) => {
		const name =  e.target.name;
		var value = e.target.value;

		const reviewObj = {
			...review,
			[name]: value
		};
		setReview(reviewObj);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		context.setLoading(true);
		try {
			await createReview(review);
		} catch (err) {
			window.alert('レビューを送信できませんでした');
			context.setLoading(false);
			return ;
		}
		window.alert('レビューを送信しました\nご協力ありがとうございました\n');
		context.setLoading(false);
		window.location.href = '/';
		return ;
	};

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var orderedProductData;
			try {
				orderedProductData = await getOrderedProduct(orderedProductId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!orderedProductData) {
				window.alert('エラーが発生しました');
				context.setLoading(false);
				window.location.href = '/';
				return ;
			}

			var orderData;
			try {
				orderData = await getOrder(orderedProductData.order_id);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!orderData || orderData.status !== 'completed') {
				window.alert('エラーが発生しました');
				context.setLoading(false);
				window.location.href = '/';
				return ;
			}

			var reviewData;
			try {
				reviewData = await getReview(orderedProductId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (reviewData) {
				window.alert('この商品はすでにレビュー済みです');
				context.setLoading(false);
				window.location.href = '/';
				return ;
			}

			setOrderedProduct(orderedProductData);
			setReview({
				...review,
				product_id: orderedProductData.product_id,
				order_id: orderedProductData.order_id,
			});

			context.setLoading(false);
		};
		getData();
	}, []);

	return (
		<form onSubmit={handleSubmit} className='w-1/2 mt-32 mb-10 mx-auto'>
			<p className='my-6 font-mono text-xl font-bold text-center'>商品レビューを書く</p>
			<p className='text-center'>
				<a
					href={`/products/${orderedProduct.product_id}`}
					target="_blank"
					rel="noopener noreferrer"
					className='underline hover:text-amber-600'>
					{orderedProduct.name}
				</a>
			</p>
			{/* 満足度 */}
			<div className='mt-12 flex items-center'>
				<label className='mr-2 w-1/2'>満足度（5段階評価）<span className='text-amber-600'>*</span></label>
				<input
					onChange={handleInputChange}
					name='score'
					type='number'
					min={1}
					max={5}
					className='p-2 w-1/2 border rounded invalid:border-amber-600'
					value={review.score}
					required />
			</div>
			{/* タイトル */}
			<div className='mt-4'>
				<label>
					タイトル
					<span className='text-amber-600'>*</span>
					<span className='text-xs text-stone-400'>（最大20文字）</span>
				</label>
				<input
					onChange={handleInputChange}
					name='title'
					type='text'
					maxLength={20}
					className='w-full p-2 border rounded invalid:border-amber-600'
					value={review.title}
					required />
			</div>
			{/* 本文 */}
			<div className='mt-4'>
				<label>
					本文
					<span className='text-amber-600'>*</span>
					<span className='text-xs text-stone-400'>（最大1000文字）</span>
				</label>
				<textarea
					onChange={handleInputChange}
					name='content'
					maxLength={1000}
					className='w-full h-96 p-2 border rounded invalid:border-amber-600'
					value={review.content}
					required />
			</div>
			{/* ニックネーム */}
			<div className='mt-4'>
				<label>
					ニックネーム
					<span className='text-amber-600'>*</span>
					<span className='text-xs text-stone-400'>（最大20文字）</span>
				</label>
				<input
					onChange={handleInputChange}
					name='nickname'
					type='text'
					maxLength={20}
					className='w-full p-2 border rounded invalid:border-amber-600'
					value={review.nickname}
					required />
			</div>
			{/* Button */}
			<div className='my-8 justify-center'>
				<button
					type='submit'
					className='w-full mb-6 p-2 text-center text-white bg-amber-600 hover:bg-amber-500 rounded'>
					送信
				</button>
			</div>
		</form>
	);
};

export default ReviewForm;
