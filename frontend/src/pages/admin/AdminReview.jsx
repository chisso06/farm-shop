import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useParams } from 'react-router-dom';
import { getProduct, getReview, updateReview, validateReview } from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminReview = () => {
	const params = useParams();
	const reviewId = params.review_id;
	const [review, setReview] = useState({});
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const updateStatus = async (e, public_status) => {
		e.preventDefault();
		context.setLoading(true);

		if (window.confirm(`このレビューを${public_status ? '公開' : '非公開'}にしますか？`)) {
			const newReview = {...review, public_status};

			const validation_message = validateReview(newReview);
			if (validation_message) {
				window.alert(validation_message);
				context.setLoading(false);
				return ;
			}

			try {
				await updateReview(newReview);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setReview(newReview);

			window.alert('ステータスを変更しました');
			window.location.reload();
		}

		context.setLoading(false);
	};

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);

			var reviewData;
			try {
				reviewData = await getReview(reviewId);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (!reviewData) {
				context.setLoading(false);
				window.location.href = '/admin/reviews';
				return ;
			}

			var productData;
			try {
				productData = await getProduct(reviewData.product_id);
			} catch (err) {
				showBoundary(err);
				return ;
			}
			if (productData) {
				reviewData.product_name = productData.name;
			}

			setReview(reviewData);

			context.setLoading(false);
		};
		getData();
	}, []);

	return (
		(review.id) ? 
		<div className='px-4'>
			<a href='/admin/reviews'>
				&lt; <span className='text-sm hover:underline'>レビュー一覧に戻る</span>
			</a>
			<p className='my-6 font-mono text-xl font-bold'>レビュー詳細</p>
			<ul>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>商品</p>
					<p>
						{ review.product_name ? 
							<a
								href={`/products/${review.product_id}`}
								target="_blank"
								rel="noopener noreferrer"			
								className='underline hover:text-amber-600'>
								{review.product_name}
							</a>
							:
							'該当する商品が見つかりません'
						}
					</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>注文ID</p>
					<p className='font-mono'>{review.order_id}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>投稿日</p>
					<p>{review.created_at}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>タイトル</p>
					<p>{review.title}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>評価</p>
					<p>{review.score}</p>
				</li>
				<li className='py-2 flex border-b'>
					<div className='w-36'>
						<p className='w-36 font-mono font-bold'>本文</p>
					</div>
					<p>{review.content}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>ニックネーム</p>
					<p>{review.nickname}</p>
				</li>
				<li className='py-2 flex border-b'>
					<p className='w-36 font-mono font-bold'>公開状態</p>
						<div className='flex'>
							<p>{review.public_status ? '公開' : '非公開'}</p>
							<button
								onClick={(e) => updateStatus(e, Number(!review.public_status))}
								className='ml-4 text-sm underline text-stone-600 hover:text-amber-600'>
								{review.public_status ? '非公開' : '公開'}にする
							</button>
						</div>
				</li>
			</ul>
		</div>
	:'');
};

export default AdminReview;