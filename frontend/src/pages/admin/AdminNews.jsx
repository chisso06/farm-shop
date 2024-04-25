import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { React, useEffect, useState } from "react";
import { createNews, deleteNews, getNews } from '../../functions';

const AdminNews = () => {
	const [news, setNews] = useState([]);

	const handleSubmit = async (e) => {
		e.preventDefault();

		const newsObj = Object.fromEntries(new FormData(e.target).entries());
		await createNews(newsObj);
		const newsData = await getNews();
		setNews(newsData);
};

	const handleTrash = async (newsId) => {
		await deleteNews(newsId);
		setNews(news.filter((n) => n.id !== newsId));
	};

	useEffect(() => {
		const getData = async () => {
			const newsData = await getNews();
			setNews(newsData);
		}
		getData();
	}, []);

	return (
		<div className='my-20 w-4/5 mx-auto'>
			<form onSubmit={handleSubmit} className="w-full mb-4 flex gap-2">
				<input name='date' type="date" className="h-10 w-1/5 px-2 justify-center border rounded" required />
				<input name='content' type="text" className="h-10 w-2/3 px-2 border rounded" required />
				<button
					type="submit"
					className="h-10 w-10 rounded-full font-bold text-stone-400 bg-stone-200 hover:bg-stone-300">
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
	);
};

export default AdminNews;