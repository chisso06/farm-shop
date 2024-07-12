import { React, useContext, useEffect, useState } from "react";
import { useErrorBoundary } from 'react-error-boundary';
import { Icon } from '../../components';
import { createNews, deleteNews, getNews } from '../../functions';
import { LoadingContext } from "../../functions/context/LoadingFunc";

const AdminNews = () => {
	const [news, setNews] = useState([]);
	const { showBoundary } = useErrorBoundary();
	const context = useContext(LoadingContext);

	const handleSubmit = async (e) => {
		e.preventDefault();
		context.setLoading(true);

		const newsObj = Object.fromEntries(new FormData(e.target).entries());
		try {
			await createNews(newsObj);
		} catch (err) {
			showBoundary(err);
		}
		var newsData;
		try {
			newsData = await getNews();
		} catch (err) {
			showBoundary(err);
		}
		setNews(newsData);
		window.alert('新しいお知らせを追加しました');

		context.setLoading(false);
};

	const handleTrash = async (e, newsId) => {
		e.preventDefault();
		context.setLoading(true);

		try {
			await deleteNews(newsId);
		} catch (err) {
			showBoundary(err);
		}
		setNews(news.filter((n) => n.id !== newsId));
		window.alert('お知らせを削除しました');

		context.setLoading(false);
	};

	useEffect(() => {
		console.log("[test]AdminNews");
		const getData = async () => {
			// context.setLoading(true);
			var newsData;
			try {
				newsData = await getNews();
			} catch (err) {
				showBoundary(err);
			}
			setNews(newsData);
			// context.setLoading(false);
		}
		getData();
	}, []);

	return (
		<div>
			<p className='w-1/2 px-4 pb-4 font-mono text-2xl font-bold'>お知らせ管理</p>
			<div className='px-6 mx-auto'>
				<form onSubmit={handleSubmit} className="w-full mb-4 flex gap-2 justify-center">
					<input name='date' type="date" className="h-10 w-44 px-2 justify-center border rounded" required />
					<input name='content' type="text" className="h-10 w-full px-2 border rounded" required />
					<button
						type="submit"
						className="w-12">
						<Icon icon="circle-plus" className="w-9 opacity-30 hover:opacity-50" />
					</button>
				</form>
				<ul>
					{news.length ? news.map((n, i) => {return (
						<li key={i} className='pr-4 py-5 flex items-center border-b'>
							<p className='w-full'>{n.date} {n.content}</p>
							<Icon
								onClick={(e) => handleTrash(e, n.id)}
							 	icon="trash"
							 	className='text-stone-300 hover:text-stone-400 cursor-pointer' />
						</li>);
					}):''}
				</ul>
			</div>
		</div>
	);
};

export default AdminNews;