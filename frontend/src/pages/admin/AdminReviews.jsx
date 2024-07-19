import { React, useContext, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { useNavigate } from 'react-router-dom';
import { getReviews } from '../../functions';
import { LoadingContext } from '../../functions/context/LoadingFunc';

const AdminReviews = () => {
	const [reviews, setReviews] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);
	const navigate = useNavigate();

	const handleClick = (e, reviewId) => {
		e.preventDefault();
		navigate(`/admin/admin-reviews/${reviewId}`);
	}

	useEffect(() => {
		const getData = async () => {
			context.setLoading(true);
			var reviewsData;
			try {
				reviewsData = await getReviews();
			} catch (err) {
				showBoundary(err);
				return ;
			}
			setReviews(reviewsData);
			context.setLoading(false);
		};
		getData();
	}, []);

	return (
		<div>
			<p className='ml-4 pb-4 font-mono text-2xl font-bold'>レビュー管理</p>
			{ reviews.length ? 
				<table className='w-full'>
					<thead>
						<tr className='border-b font-mono'>
							<th className='pl-4 py-2 text-left'>投稿日</th>
							<th className='py-2 text-left'>タイトル</th>
							<th className='py-2'>評価</th>
							<th className='py-2'>投稿者</th>
							<th className='py-2'>公開状態</th>
						</tr>
					</thead>
					<tbody>
						{ reviews.map((r, i) => {
							return(
								<tr
									onClick={(e) => handleClick(e, r.id)}
									key={i}
									className='border-b  hover:cursor-pointer hover:bg-amber-100'>
									<td className='pl-4 py-2'>{r.created_at}</td>
									<td className='py-2'>
										{r.title && r.title.length <= 20 ? r.title : r.title.substring(0, 19) + '…'}
									</td>
									<td className='py-2 text-center'>{r.score}</td>
									<td className='py-2 text-center'>
										{r.nickname && r.nickname.length <= 8 ? r.nickname : r.nickname.substring(0, 7) + '…'}
									</td>
									<td className='py-2 text-center'>{r.public_status ? '公開' : '非公開'}</td>

								</tr>
							)
						})}
					</tbody>
				</table>
			: ''}
		</div>
	);
};

export default AdminReviews;