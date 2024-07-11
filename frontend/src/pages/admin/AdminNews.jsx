import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { React, useEffect, useState } from "react";
import { useErrorBoundary } from 'react-error-boundary';
import { createNews, deleteNews, getNews } from '../../functions';

const AdminNews = () => {
	const [news, setNews] = useState([]);
	const { showBoundary } = useErrorBoundary();

	const handleSubmit = async (e) => {
		e.preventDefault();

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
};

	const handleTrash = async (newsId) => {
		try {
			await deleteNews(newsId);
		} catch (err) {
			showBoundary(err);
		}
		window.alert('お知らせを削除しました');
		setNews(news.filter((n) => n.id !== newsId));
	};

	useEffect(() => {
		const getData = async () => {
			var newsData;
			try {
				newsData = await getNews();
			} catch (err) {
				showBoundary(err);
			}
			setNews(newsData);
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
						className="h-10 w-12 rounded-full font-bold text-stone-400 bg-stone-200 hover:bg-stone-300">
						<FontAwesomeIcon icon={faPlus} />
					</button>
				</form>
				<ul>
					{news.length ? news.map((n, i) => {return (
						<li key={i} className='pr-4 py-5 flex items-center border-b'>
							<p className='w-full'>{n.date} {n.content}</p>
							<FontAwesomeIcon
								onClick={() => {handleTrash(n.id)}}
								icon={faTrash}
								className='text-stone-300 hover:text-stone-400 cursor-pointer' />
						</li>);
					}):''}
				</ul>
			</div>
		</div>
	);
};

export default AdminNews;