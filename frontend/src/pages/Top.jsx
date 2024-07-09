import { React, useEffect, useState } from 'react';
import { useErrorBoundary } from 'react-error-boundary';
import { PopularItems } from '../components';
import { getNews } from '../functions';

const News = () => {
	const [news, setNews] = useState([]);
	const { showBoundary } = useErrorBoundary();

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
		<div className='my-20 w-3/4 mx-auto'>
			<p className='mb-20 text-center text-4xl text-black'>お知らせ</p>
			<ul>{
				news.length ? news.map((n, i) => {
					return (<li key={i} className='py-5 border-b' >{n.date} {n.content}</li>);
				}):''
			}</ul>
		</div>
	);
};

const Top = () => {
	return (
		<div>
			<img src='images/top.png' alt='top' className='w-full' ></img>
			<News />
			<PopularItems />
		</div>
	);
};

export default Top;
